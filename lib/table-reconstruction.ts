import { Transaction, StatementMetadata } from './types';
import { ExtractedPageData, PdfTextChunk } from './pdf-parser';
import { categorizeTransaction } from './categorizer';

// Regex patterns for Date detection
const DATE_REGEXES = [
  /^\b\d{4}[\/\.-](0?[1-9]|1[0-2])[\/\.-](0?[1-9]|[12]\d|3[01])\b/, // YYYY-MM-DD (ISO)
  /^\b(0?[1-9]|1[0-2])[\/\.-](0?[1-9]|[12]\d|3[01])[\/\.-](\d{4}|\d{2})\b/, // MM/DD/YYYY or MM/DD/YY
  /^\b(0?[1-9]|[12]\d|3[01])[\/\.-](0?[1-9]|1[0-2])[\/\.-](\d{4}|\d{2})\b/, // DD/MM/YYYY
  /^\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(0?[1-9]|[12]\d|3[01])(,\s*\d{4})?\b/i, // Jan 12, 2026
  /^\b(0?[1-9]|[12]\d|3[01])\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(\s+\d{4})?\b/i, // 12 Jan 2026
  /^\b(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])\b/, // MM/DD
];

// Enhanced Regex for Amount detection (handles $, £, €, ₹, C$, A$, minus prefixes/suffixes, parentheses)
const AMOUNT_REGEX = /(?:[\$\£\€\₹]|C\$|A\$)?\s*(?:\(?\s*[\-\+]?\s*\d{1,3}(?:[,\.]\d{3})*(?:[\.,]\d{2})\s*\)?[\-\+]?|[\-\+]?\s*\d{1,3}(?:[,\.]\d{3})*(?:[\.,]\d{2})\s*[\-\+]?)/g;

export function reconstructTableData(pages: ExtractedPageData[]): {
  transactions: Transaction[];
  metadata: Partial<StatementMetadata>;
} {
  const transactions: Transaction[] = [];
  let openingBalance: number | null = null;
  let closingBalance: number | null = null;
  let bankName: string | undefined = undefined;

  let currentTx: Partial<Transaction> | null = null;
  let idCounter = 1;

  for (const page of pages) {
    // Process page chunks into spatial lines
    const lineRows = groupChunksIntoLines(page.chunks);

    for (const row of lineRows) {
      const lineText = row.text.trim();

      // Check header / summary lines for opening & ending balance
      if (openingBalance === null) {
        const openMatch = lineText.match(/(?:Beginning|Opening|Previous|Start|Balance\s+Forward)\s+Balance[:\s]*([\$\£\€]?\s*\(?[\-\+]?\s*\d{1,3}(?:[,\.]\d{3})*[\.,]\d{2}\)?[\-\+]?)/i);
        if (openMatch) {
          openingBalance = parseAmount(openMatch[1]);
        }
      }

      if (closingBalance === null) {
        const closeMatch = lineText.match(/(?:Ending|Closing|New|Final)\s+Balance[:\s]*([\$\£\€]?\s*\(?[\-\+]?\s*\d{1,3}(?:[,\.]\d{3})*[\.,]\d{2}\)?[\-\+]?)/i);
        if (closeMatch) {
          closingBalance = parseAmount(closeMatch[1]);
        }
      }

      // Check bank name keywords
      if (!bankName) {
        if (/Chase/i.test(lineText)) bankName = 'JPMorgan Chase';
        else if (/Bank of America/i.test(lineText)) bankName = 'Bank of America';
        else if (/Wells Fargo/i.test(lineText)) bankName = 'Wells Fargo';
        else if (/Citi|Citibank/i.test(lineText)) bankName = 'Citibank (Citi)';
        else if (/Capital One/i.test(lineText)) bankName = 'Capital One Bank';
        else if (/TD Bank|TD Canada/i.test(lineText)) bankName = 'TD Bank';
        else if (/PNC/i.test(lineText)) bankName = 'PNC Bank';
        else if (/Barclays/i.test(lineText)) bankName = 'Barclays Bank';
        else if (/HSBC/i.test(lineText)) bankName = 'HSBC Bank';
        else if (/Lloyds/i.test(lineText)) bankName = 'Lloyds Bank';
        else if (/Royal Bank|RBC/i.test(lineText)) bankName = 'RBC Royal Bank';
        else if (/Scotiabank|Bank of Nova Scotia/i.test(lineText)) bankName = 'Scotiabank';
        else if (/Commonwealth|CBA/i.test(lineText)) bankName = 'Commonwealth Bank Australia';
        else if (/Wise|TransferWise|Revolut/i.test(lineText)) bankName = 'Wise / Revolut';
      }

      // Detect if row starts with a Date
      const dateMatch = matchDatePrefix(lineText);

      if (dateMatch) {
        // Finalize previous transaction if pending
        if (currentTx && currentTx.date && currentTx.description) {
          transactions.push(finalizeTransaction(currentTx, idCounter++));
          currentTx = null;
        }

        const dateStr = dateMatch.date;
        const remainderText = lineText.substring(dateMatch.length).trim();

        // Find all amount strings in the remainder
        const amounts = extractAmounts(remainderText);

        // Separate description text by stripping amounts
        let description = remainderText;
        for (const amt of amounts) {
          description = description.replace(amt.raw, '').trim();
        }
        description = description.replace(/\s+/g, ' ');

        let debit: number | null = null;
        let credit: number | null = null;
        let balance: number | null = null;

        if (amounts.length === 1) {
          const val = amounts[0].value;
          if (val < 0 || isDebitKeyword(description)) {
            debit = Math.abs(val);
          } else {
            credit = Math.abs(val);
          }
        } else if (amounts.length === 2) {
          const val1 = amounts[0].value;
          const val2 = amounts[1].value;

          if (isDebitKeyword(description) || val1 < 0) {
            debit = Math.abs(val1);
          } else {
            credit = Math.abs(val1);
          }
          balance = val2;
        } else if (amounts.length >= 3) {
          debit = amounts[0].value !== 0 ? Math.abs(amounts[0].value) : null;
          credit = amounts[1].value !== 0 ? Math.abs(amounts[1].value) : null;
          balance = amounts[2].value;
        }

        const amountVal = credit !== null ? credit : debit !== null ? -debit : 0;

        currentTx = {
          id: `tx-${idCounter}`,
          date: dateStr,
          description: description || 'Transaction',
          debit,
          credit,
          amount: amountVal,
          balance,
          pageNumber: page.pageNumber,
        };
      } else if (currentTx) {
        // Multi-line description continuation line
        const amounts = extractAmounts(lineText);
        let extraDesc = lineText;
        for (const amt of amounts) {
          extraDesc = extraDesc.replace(amt.raw, '').trim();
        }
        if (extraDesc && !isHeaderFooterNoise(extraDesc)) {
          currentTx.description = (currentTx.description + ' ' + extraDesc).trim();
        }
        if (amounts.length > 0 && currentTx.balance === null) {
          currentTx.balance = amounts[amounts.length - 1].value;
        }
      }
    }

    if (currentTx && currentTx.date && currentTx.description) {
      transactions.push(finalizeTransaction(currentTx, idCounter++));
      currentTx = null;
    }
  }

  // Self-Healing Running Balance Resolver (100% Mathematical Solver)
  let runningBalCents: number | null = openingBalance !== null ? Math.round(openingBalance * 100) : null;

  for (let idx = 0; idx < transactions.length; idx++) {
    const tx = transactions[idx];

    if (runningBalCents !== null && tx.balance !== null) {
      const actualRowBalCents = Math.round(tx.balance * 100);

      // Check if debit vs credit placement needs self-healing adjustment
      if (tx.debit !== null && tx.credit === null) {
        const testDebitCents = Math.round(tx.debit * 100);
        const calcAsDebit = runningBalCents - testDebitCents;
        const calcAsCredit = runningBalCents + testDebitCents;

        if (Math.abs(calcAsCredit - actualRowBalCents) <= 2 && Math.abs(calcAsDebit - actualRowBalCents) > 2) {
          // Self-heal: This was actually a deposit/credit!
          tx.credit = tx.debit;
          tx.debit = null;
          tx.amount = tx.credit;
        }
      } else if (tx.credit !== null && tx.debit === null) {
        const testCreditCents = Math.round(tx.credit * 100);
        const calcAsCredit = runningBalCents + testCreditCents;
        const calcAsDebit = runningBalCents - testCreditCents;

        if (Math.abs(calcAsDebit - actualRowBalCents) <= 2 && Math.abs(calcAsCredit - actualRowBalCents) > 2) {
          // Self-heal: This was actually a debit/withdrawal!
          tx.debit = tx.credit;
          tx.credit = null;
          tx.amount = -tx.debit;
        }
      }
      runningBalCents = actualRowBalCents;
    } else if (tx.balance !== null) {
      runningBalCents = Math.round(tx.balance * 100);
    }
  }

  // Infer Opening Balance if missing
  if (openingBalance === null && transactions.length > 0) {
    const firstTx = transactions[0];
    if (firstTx.balance !== null) {
      openingBalance = firstTx.balance - firstTx.amount;
    }
  }

  // Infer Closing Balance if missing
  if (closingBalance === null && transactions.length > 0) {
    const lastTx = transactions[transactions.length - 1];
    if (lastTx.balance !== null) {
      closingBalance = lastTx.balance;
    }
  }

  return {
    transactions,
    metadata: {
      openingBalance,
      closingBalance,
      bankName,
    },
  };
}

interface SpatialRow {
  y: number;
  text: string;
  chunks: PdfTextChunk[];
}

function groupChunksIntoLines(chunks: PdfTextChunk[]): SpatialRow[] {
  const Y_TOLERANCE = 5;
  const rows: SpatialRow[] = [];

  for (const chunk of chunks) {
    const existing = rows.find(r => Math.abs(r.y - chunk.y) <= Y_TOLERANCE);
    if (existing) {
      existing.chunks.push(chunk);
    } else {
      rows.push({ y: chunk.y, text: '', chunks: [chunk] });
    }
  }

  rows.sort((a, b) => a.y - b.y);

  for (const r of rows) {
    r.chunks.sort((a, b) => a.x - b.x);
    r.text = r.chunks.map(c => c.text).join(' ');
  }

  return rows;
}

function matchDatePrefix(text: string): { date: string; length: number } | null {
  for (const regex of DATE_REGEXES) {
    const match = text.match(regex);
    if (match) {
      return { date: match[0], length: match[0].length };
    }
  }
  return null;
}

function extractAmounts(text: string): { raw: string; value: number }[] {
  const results: { raw: string; value: number }[] = [];
  let match: RegExpExecArray | null;

  AMOUNT_REGEX.lastIndex = 0;
  while ((match = AMOUNT_REGEX.exec(text)) !== null) {
    const rawStr = match[0];
    const val = parseAmount(rawStr);
    if (!isNaN(val)) {
      results.push({ raw: rawStr, value: val });
    }
  }
  return results;
}

function parseAmount(str: string): number {
  if (!str) return 0;
  let clean = str.trim();
  let isNegative = false;

  if (/\bDR\b/i.test(clean) || clean.endsWith('-') || clean.startsWith('-')) {
    isNegative = true;
  }

  clean = clean.replace(/[\$\£\€\₹\s]|CR|DR|C\$|A\$/gi, '');

  if (clean.startsWith('(') && clean.endsWith(')')) {
    isNegative = true;
    clean = clean.slice(1, -1);
  }

  clean = clean.replace(/[\-\+]/g, '');

  // Handle European comma decimal (1.234,56 -> 1234.56)
  if (/\d+\.\d{3},\d{2}/.test(clean)) {
    clean = clean.replace(/\./g, '').replace(',', '.');
  } else {
    clean = clean.replace(/,/g, '');
  }

  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  const rounded = Math.round(num * 100) / 100;
  return isNegative ? -rounded : rounded;
}

function isDebitKeyword(text: string): boolean {
  return /withdrawal|debit|payment|fee|purchase|check|atm|card|transfer to|bill pay|pos|svc chg/i.test(text);
}

function isHeaderFooterNoise(text: string): boolean {
  return /page \d+ of \d+|statement period|account number|continued on next page|balance forward/i.test(text);
}

function finalizeTransaction(txPartial: Partial<Transaction>, index: number): Transaction {
  const debit = txPartial.debit !== undefined ? txPartial.debit : null;
  const credit = txPartial.credit !== undefined ? txPartial.credit : null;
  const amount = credit !== null ? credit : debit !== null ? -debit : 0;
  const description = txPartial.description || 'Transaction';

  const catResult = categorizeTransaction(description, amount);

  return {
    id: txPartial.id || `tx-${index}`,
    date: txPartial.date || '01/01/2026',
    description: description,
    debit: debit,
    credit: credit,
    amount: amount,
    balance: txPartial.balance !== undefined ? txPartial.balance : null,
    category: catResult.category,
    categoryConfidence: catResult.confidence,
    needsReview: catResult.needsReview,
    reviewReason: catResult.reviewReason,
    isFlagged: false,
    isEdited: false,
    pageNumber: txPartial.pageNumber || 1,
  };
}
