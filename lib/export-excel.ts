import { Transaction } from './types';

export interface GeneratedExportFile {
  filename: string;
  dataUrl: string;
  blob: Blob;
  textContent: string;
}

/**
 * Native Browser File Saver Engine
 * Pure client-side implementation with zero Webpack chunk resolution errors.
 */
export function saveFile(dataUrl: string | Blob, filename: string): void {
  if (typeof window === 'undefined') return;

  // Legacy MS Blob Saver
  if (dataUrl instanceof Blob && (window.navigator as any).msSaveOrOpenBlob) {
    (window.navigator as any).msSaveOrOpenBlob(dataUrl, filename);
    return;
  }

  let href = '';
  let needsRevoke = false;

  if (typeof dataUrl === 'string') {
    href = dataUrl;
  } else {
    href = URL.createObjectURL(dataUrl);
    needsRevoke = true;
  }

  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename;
  anchor.setAttribute('download', filename);
  anchor.style.display = 'none';

  document.body.appendChild(anchor);

  if (typeof anchor.click === 'function') {
    anchor.click();
  } else {
    const mouseEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    anchor.dispatchEvent(mouseEvent);
  }

  setTimeout(() => {
    if (document.body.contains(anchor)) {
      document.body.removeChild(anchor);
    }
    if (needsRevoke) {
      URL.revokeObjectURL(href);
    }
  }, 1500);
}

/**
 * Helper to convert DataURIs to Blob objects
 */
export function dataURItoBlob(dataURI: string): Blob {
  try {
    const parts = dataURI.split(',');
    const header = parts[0];
    const isBase64 = header.includes('base64');
    const mimeString = header.split(':')[1].split(';')[0];

    if (isBase64) {
      const byteString = atob(parts[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
    } else {
      const decodedData = decodeURIComponent(parts[1]);
      return new Blob([decodedData], { type: mimeString });
    }
  } catch (e) {
    console.error('Error converting DataURI to Blob:', e);
    return new Blob([], { type: 'application/octet-stream' });
  }
}

/**
 * Generates Excel (.xlsx) file, Blob, and TSV text dynamically client-side
 */
export async function generateExcelExport(
  transactions: Transaction[],
  filename: string = 'bank_statement_converted.xlsx'
): Promise<GeneratedExportFile> {
  const XLSXModule = await import('xlsx');
  const XLSX = XLSXModule.default || XLSXModule;

  const data = transactions.map((tx) => ({
    Date: tx.date,
    Description: tx.description,
    Category: tx.category || 'Uncategorized / Review',
    'Withdrawal (Debit)': tx.debit !== null ? Number(tx.debit.toFixed(2)) : '',
    'Deposit (Credit)': tx.credit !== null ? Number(tx.credit.toFixed(2)) : '',
    'Net Amount': Number(tx.amount.toFixed(2)),
    'Running Balance': tx.balance !== null ? Number(tx.balance.toFixed(2)) : '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet['!cols'] = [
    { wch: 14 }, // Date
    { wch: 45 }, // Description
    { wch: 25 }, // Category
    { wch: 18 }, // Debit
    { wch: 18 }, // Credit
    { wch: 15 }, // Net Amount
    { wch: 18 }, // Running Balance
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bank Statement');

  const finalFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;

  // Binary XLSX ArrayBuffer -> Blob
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  // Base64 Data URI
  const base64Str = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
  const dataUrl = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Str}`;

  // Plain TSV representation for text copy preview
  const tsvHeaders = ['Date', 'Description', 'Category', 'Withdrawal (Debit)', 'Deposit (Credit)', 'Net Amount', 'Running Balance'];
  const tsvRows = transactions.map((tx) => [
    tx.date,
    tx.description,
    tx.category || 'Uncategorized / Review',
    tx.debit !== null ? tx.debit.toFixed(2) : '',
    tx.credit !== null ? tx.credit.toFixed(2) : '',
    tx.amount.toFixed(2),
    tx.balance !== null ? tx.balance.toFixed(2) : '',
  ].join('\t'));

  const textContent = [tsvHeaders.join('\t'), ...tsvRows].join('\n');

  return { filename: finalFilename, dataUrl, blob, textContent };
}

/**
 * Generates QuickBooks Online 3-Column CSV file, Blob & text
 */
export function generateQBOExport(
  transactions: Transaction[],
  filename: string = 'quickbooks_ready.csv'
): GeneratedExportFile {
  const headers = ['Date', 'Description', 'Amount'];
  const rows = transactions.map((tx) => {
    const catSuffix = tx.category ? ` [${tx.category}]` : '';
    const formattedDesc = `"${(tx.description + catSuffix).replace(/"/g, '""')}"`;
    return `${tx.date},${formattedDesc},${tx.amount.toFixed(2)}`;
  });

  const textContent = [headers.join(','), ...rows].join('\n');
  const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;

  const blob = new Blob(['\uFEFF' + textContent], { type: 'text/csv;charset=utf-8;' });
  const dataUrl = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(textContent);

  return { filename: finalFilename, dataUrl, blob, textContent };
}

/**
 * Generates Xero 5-Column CSV file, Blob & text
 */
export function generateXeroExport(
  transactions: Transaction[],
  filename: string = 'xero_ready.csv'
): GeneratedExportFile {
  const headers = ['*Date', '*Amount', 'Payee', 'Description', 'Reference'];
  const rows = transactions.map((tx) => {
    const formattedDesc = `"${tx.description.replace(/"/g, '""')}"`;
    const formattedCategory = `"${(tx.category || 'Uncategorized').replace(/"/g, '""')}"`;
    return `${tx.date},${tx.amount.toFixed(2)},${formattedDesc},${formattedDesc},${formattedCategory}`;
  });

  const textContent = [headers.join(','), ...rows].join('\n');
  const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;

  const blob = new Blob(['\uFEFF' + textContent], { type: 'text/csv;charset=utf-8;' });
  const dataUrl = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(textContent);

  return { filename: finalFilename, dataUrl, blob, textContent };
}

/**
 * Main export functions calling saveFile
 */
export async function exportToExcel(
  transactions: Transaction[],
  filename: string = 'bank_statement_converted.xlsx'
): Promise<void> {
  const file = await generateExcelExport(transactions, filename);
  saveFile(file.dataUrl, file.filename);
}

export function exportToQuickBooksCSV(
  transactions: Transaction[],
  filename: string = 'quickbooks_ready.csv'
): void {
  const file = generateQBOExport(transactions, filename);
  saveFile(file.dataUrl, file.filename);
}

export function exportToXeroCSV(
  transactions: Transaction[],
  filename: string = 'xero_ready.csv'
): void {
  const file = generateXeroExport(transactions, filename);
  saveFile(file.dataUrl, file.filename);
}

/**
 * TSV Copy to Clipboard
 */
export async function copyToClipboardTSV(transactions: Transaction[]): Promise<boolean> {
  const file = await generateExcelExport(transactions);
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(file.textContent);
      return true;
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = file.textContent;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  } catch (err) {
    console.error(err);
    return false;
  }
}
