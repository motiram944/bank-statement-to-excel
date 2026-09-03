import { DateFormat, Transaction } from './types';

/**
 * Parses any date string (e.g. 01/25/2026, 25/01/2026, 2026-01-25, Jan 25 2026)
 * into a normalized { year, month, day } component structure.
 */
export function parseDateComponents(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr || typeof dateStr !== 'string') return null;

  const trimmed = dateStr.trim();
  
  // ISO format YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = trimmed.match(/^(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { year, month, day };
    }
  }

  // Standard 3-part split MM/DD/YYYY or DD/MM/YYYY
  const parts = trimmed.split(/[\/\.-]/);
  if (parts.length === 3) {
    let p1 = parseInt(parts[0], 10);
    let p2 = parseInt(parts[1], 10);
    let p3 = parseInt(parts[2], 10);

    if (isNaN(p1) || isNaN(p2) || isNaN(p3)) {
      return null;
    }

    // Expand 2-digit years (e.g., 26 -> 2026)
    if (p3 < 100) {
      p3 = 2000 + p3;
    }

    // If p1 > 12, it must be DD/MM/YYYY format (e.g. 25/01/2026)
    if (p1 > 12 && p2 <= 12) {
      return { year: p3, month: p2, day: p1 };
    }

    // Default to MM/DD/YYYY (US format)
    if (p1 >= 1 && p1 <= 12 && p2 >= 1 && p2 <= 31) {
      return { year: p3, month: p1, day: p2 };
    }
  }

  // Native JS Date fallback
  const parsedTimestamp = Date.parse(trimmed);
  if (!isNaN(parsedTimestamp)) {
    const d = new Date(parsedTimestamp);
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }

  return null;
}

/**
 * Converts a date string into the specified target DateFormat.
 */
export function formatDateString(dateStr: string, targetFormat: DateFormat = 'MM/DD/YYYY'): string {
  const comp = parseDateComponents(dateStr);
  if (!comp) return dateStr;

  const mm = comp.month.toString().padStart(2, '0');
  const dd = comp.day.toString().padStart(2, '0');
  const yyyy = comp.year.toString();

  switch (targetFormat) {
    case 'DD/MM/YYYY':
      return `${dd}/${mm}/${yyyy}`;
    case 'YYYY-MM-DD':
      return `${yyyy}-${mm}-${dd}`;
    case 'MM/DD/YYYY':
    default:
      return `${mm}/${dd}/${yyyy}`;
  }
}

/**
 * Returns a list of transactions with all date fields converted to the target format.
 */
export function convertTransactionDates(transactions: Transaction[], targetFormat: DateFormat): Transaction[] {
  return transactions.map((tx) => ({
    ...tx,
    date: formatDateString(tx.date, targetFormat),
  }));
}
