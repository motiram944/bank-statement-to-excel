import { StatementMetadata, ProcessingProgress } from './types';

// Interface for extracted text chunks with 2D positions
export interface PdfTextChunk {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
}

export interface ExtractedPageData {
  pageNumber: number;
  chunks: PdfTextChunk[];
  rawTextLines: string[];
  isScanned: boolean;
}

export async function parsePdfFile(
  file: File,
  maxPagesAllowed: number = 2,
  onProgress?: (progress: ProcessingProgress) => void,
  password?: string
): Promise<{ pages: ExtractedPageData[]; metadata: StatementMetadata }> {
  onProgress?.({
    stage: 'loading_pdf',
    percent: 10,
    message: 'Loading PDF engine in browser...',
  });

  // Dynamic import of pdfjs-dist for ultra lightweight initial page load
  const pdfjsLib = await import('pdfjs-dist');
  
  // Set worker source
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }

  const arrayBuffer = await file.arrayBuffer();
  let pdfDoc: any;

  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer, password });
    pdfDoc = await loadingTask.promise;
  } catch (err: any) {
    if (err?.name === 'PasswordException' || err?.code === 1 || /password/i.test(err?.message || '')) {
      throw new Error('PASSWORD_REQUIRED');
    }
    throw err;
  }

  const totalPages = pdfDoc.numPages;
  const pagesToProcess = Math.min(totalPages, maxPagesAllowed);

  const pagesData: ExtractedPageData[] = [];
  let isScannedDocument = false;

  for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
    onProgress?.({
      stage: 'extracting_text',
      percent: Math.round(10 + (pageNum / pagesToProcess) * 60),
      message: `Analyzing page ${pageNum} of ${pagesToProcess}...`,
      currentPage: pageNum,
      totalPages: pagesToProcess,
    });

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    const pageHeight = viewport.height;

    const textContent = await page.getTextContent();
    const chunks: PdfTextChunk[] = [];

    for (const item of textContent.items) {
      if ('str' in item && item.str.trim().length > 0) {
        // transform matrix: [scaleX, skewY, skewX, scaleY, translateX, translateY]
        const tx = item.transform;
        const x = tx[4];
        // PDF Y-axis goes upwards, so normalize to top-down coordinates
        const y = pageHeight - tx[5];
        
        chunks.push({
          text: item.str,
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(item.width),
          height: Math.round(item.height),
          pageNumber: pageNum,
        });
      }
    }

    // Check if this page has negligible vector text items -> likely a scanned PDF
    if (chunks.length < 5) {
      isScannedDocument = true;
      onProgress?.({
        stage: 'ocr_processing',
        percent: Math.round(10 + (pageNum / pagesToProcess) * 60),
        message: `Scanned image detected on page ${pageNum}. Running local Tesseract OCR worker...`,
        currentPage: pageNum,
        totalPages: pagesToProcess,
      });

      // Render page canvas for local Tesseract OCR
      const ocrChunks = await processScannedPageWithOCR(page, viewport, pageNum);
      pagesData.push({
        pageNumber: pageNum,
        chunks: ocrChunks,
        rawTextLines: buildLinesFromChunks(ocrChunks),
        isScanned: true,
      });
    } else {
      pagesData.push({
        pageNumber: pageNum,
        chunks: chunks,
        rawTextLines: buildLinesFromChunks(chunks),
        isScanned: false,
      });
    }
  }

  const metadata: StatementMetadata = {
    filename: file.name,
    fileSize: file.size,
    totalPages: totalPages,
    processedPages: pagesToProcess,
    currencySymbol: '$',
    openingBalance: null,
    closingBalance: null,
    detectedTotalCredits: null,
    detectedTotalDebits: null,
    isScannedPdf: isScannedDocument,
  };

  return { pages: pagesData, metadata };
}

// Fallback helper for scanned PDF pages using Tesseract.js in WebWorker
async function processScannedPageWithOCR(
  pdfPage: any,
  viewport: any,
  pageNumber: number
): Promise<PdfTextChunk[]> {
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (!context) return [];

    await pdfPage.render({ canvasContext: context, viewport }).promise;
    const imageDataUrl = canvas.toDataURL('image/png');

    // Dynamic import Tesseract.js
    const Tesseract = await import('tesseract.js');
    const worker = await Tesseract.createWorker('eng');

    const ret = await worker.recognize(imageDataUrl);
    await worker.terminate();

    const chunks: PdfTextChunk[] = [];
    if (ret.data && ret.data.lines) {
      for (const line of ret.data.lines) {
        for (const word of line.words) {
          if (word.text.trim()) {
            chunks.push({
              text: word.text,
              x: word.bbox.x0,
              y: word.bbox.y0,
              width: word.bbox.x1 - word.bbox.x0,
              height: word.bbox.y1 - word.bbox.y0,
              pageNumber,
            });
          }
        }
      }
    }
    return chunks;
  } catch (err) {
    console.warn('OCR processing fallback notice:', err);
    return [];
  }
}

// Group chunks into text line strings
function buildLinesFromChunks(chunks: PdfTextChunk[]): string[] {
  // Sort chunks by Y coordinate, then X coordinate
  const Y_TOLERANCE = 4; // 4px Y alignment buffer
  const linesMap: { y: number; chunks: PdfTextChunk[] }[] = [];

  for (const chunk of chunks) {
    const existingLine = linesMap.find(l => Math.abs(l.y - chunk.y) <= Y_TOLERANCE);
    if (existingLine) {
      existingLine.chunks.push(chunk);
    } else {
      linesMap.push({ y: chunk.y, chunks: [chunk] });
    }
  }

  linesMap.sort((a, b) => a.y - b.y);

  return linesMap.map(line => {
    line.chunks.sort((a, b) => a.x - b.x);
    return line.chunks.map(c => c.text).join(' ');
  });
}
