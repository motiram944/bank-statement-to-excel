export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  debit: number | null;
  credit: number | null;
  amount: number; // positive for credit/deposit, negative for debit/withdrawal
  balance: number | null;
  category?: string;
  categoryConfidence?: number;
  needsReview?: boolean;
  reviewReason?: string;
  isFlagged?: boolean;
  flagReason?: string;
  isEdited?: boolean;
  pageNumber?: number;
  confidence?: number;
}

export interface StatementMetadata {
  filename: string;
  fileSize: number;
  totalPages: number;
  processedPages: number;
  bankName?: string;
  accountNumber?: string;
  statementPeriod?: string;
  openingBalance: number | null;
  closingBalance: number | null;
  detectedTotalDebits: number | null;
  detectedTotalCredits: number | null;
  currencySymbol: string;
  isScannedPdf?: boolean;
}

export interface ReconciliationResult {
  isBalanced: boolean;
  calculatedEndingBalance: number | null;
  expectedEndingBalance: number | null;
  difference: number;
  sumDebits: number;
  sumCredits: number;
  openingBalance: number;
  unverifiedCount: number;
  accuracyScore: number; // 0.0 to 100.0%
}

export interface BankConfig {
  slug: string;
  name: string;
  shortName: string;
  country: string;
  currency: string;
  logo: string; // SVG icon identifier or path
  h1Title: string;
  metaTitle: string;
  metaDescription: string;
  primaryColor: string;
  sampleFormat: {
    date: string;
    description: string;
    debit: string;
    credit: string;
    balance: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  reviews: {
    name: string;
    role: string;
    company: string;
    rating: number;
    text: string;
  }[];
}

export interface LicenseState {
  isPro: boolean;
  passActive: boolean;
  licenseKey: string | null;
  passExpiresAt: number | null; // timestamp
}

export interface ProcessingProgress {
  stage: 'idle' | 'loading_pdf' | 'extracting_text' | 'ocr_processing' | 'parsing_tables' | 'reconciling' | 'complete' | 'error';
  percent: number;
  message: string;
  currentPage?: number;
  totalPages?: number;
}
