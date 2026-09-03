import { Transaction, StatementMetadata } from './types';
import { reconcileTransactions } from './reconciliation';

export interface RegressionTestCase {
  id: string;
  name: string;
  bankName: string;
  rawTransactions: Transaction[];
  metadata: Partial<StatementMetadata>;
  expectedMathAccuracy: number; // e.g. 100.0
}

export const SYNTHETIC_REGRESSION_SUITE: RegressionTestCase[] = [
  {
    id: 'chase-us-standard',
    name: 'Chase Bank Standard Checking (US)',
    bankName: 'JPMorgan Chase',
    metadata: {
      filename: 'Chase_Checking_2026.pdf',
      totalPages: 2,
      processedPages: 2,
      openingBalance: 5000.0,
      closingBalance: 6450.0,
      bankName: 'JPMorgan Chase',
      accountNumber: '••••4829',
      statementPeriod: 'Jan 01, 2026 - Jan 31, 2026',
      currencySymbol: '$',
    },
    rawTransactions: [
      { id: 't1', date: '01/05/2026', description: 'AMAZON WEB SERVICES AWS.AMAZON.COM', debit: 150.0, credit: null, amount: -150.0, balance: 4850.0 },
      { id: 't2', date: '01/12/2026', description: 'STRIPE PAYOUT MERCH-8921', debit: null, credit: 2000.0, amount: 2000.0, balance: 6850.0 },
      { id: 't3', date: '01/20/2026', description: 'UBER TRIP SAN FRANCISCO CA', debit: 40.0, credit: null, amount: -40.0, balance: 6810.0 },
      { id: 't4', date: '01/28/2026', description: 'STARBUCKS COFFEE SEATTLE WA', debit: 10.0, credit: null, amount: -10.0, balance: 6800.0 },
      { id: 't5', date: '01/30/2026', description: 'CHASE MONTHLY SERVICE FEE', debit: 350.0, credit: null, amount: -350.0, balance: 6450.0 },
    ],
    expectedMathAccuracy: 100.0,
  },
  {
    id: 'barclays-uk-gbp',
    name: 'Barclays Bank Statement (UK GBP)',
    bankName: 'Barclays Bank',
    metadata: {
      filename: 'Barclays_UK_2026.pdf',
      totalPages: 1,
      processedPages: 1,
      openingBalance: 1200.0,
      closingBalance: 1650.0,
      bankName: 'Barclays Bank',
      accountNumber: '••••9120',
      statementPeriod: '01/02/2026 - 28/02/2026',
      currencySymbol: '£',
    },
    rawTransactions: [
      { id: 'tb1', date: '05/02/2026', description: 'BRITISH GAS UTILITIES DIRECT DEBIT', debit: 120.0, credit: null, amount: -120.0, balance: 1080.0 },
      { id: 'tb2', date: '15/02/2026', description: 'CLIENT PAYMENT SALARY CREDIT', debit: null, credit: 800.0, amount: 800.0, balance: 1880.0 },
      { id: 'tb3', date: '22/02/2026', description: 'TESCO SUPERMARKET LONDON', debit: 230.0, credit: null, amount: -230.0, balance: 1650.0 },
    ],
    expectedMathAccuracy: 100.0,
  },
  {
    id: 'bofa-overdraft-negative',
    name: 'Bank of America Negative Overdraft Balance',
    bankName: 'Bank of America',
    metadata: {
      filename: 'BofA_Overdraft.pdf',
      totalPages: 1,
      processedPages: 1,
      openingBalance: 100.0,
      closingBalance: -50.0,
      bankName: 'Bank of America',
      currencySymbol: '$',
    },
    rawTransactions: [
      { id: 'to1', date: '02/10/2026', description: 'EQUIPMENT LEASE PURCHASE', debit: 120.0, credit: null, amount: -120.0, balance: -20.0 },
      { id: 'to2', date: '02/12/2026', description: 'BANK OVERDRAFT SERVICE CHARGE', debit: 30.0, credit: null, amount: -30.0, balance: -50.0 },
    ],
    expectedMathAccuracy: 100.0,
  },
  {
    id: 'rbc-canada-cad',
    name: 'Royal Bank of Canada (RBC CAD)',
    bankName: 'RBC Royal Bank',
    metadata: {
      filename: 'RBC_Canada_2026.pdf',
      totalPages: 2,
      processedPages: 2,
      openingBalance: 3400.0,
      closingBalance: 4150.0,
      bankName: 'RBC Royal Bank',
      currencySymbol: '$',
    },
    rawTransactions: [
      { id: 'tr1', date: '03/01/2026', description: 'TIM HORTONS TORONTO ON', debit: 15.0, credit: null, amount: -15.0, balance: 3385.0 },
      { id: 'tr2', date: '03/10/2026', description: 'GOVERNMENT PAYROLL DIRECT DEP', debit: null, credit: 1000.0, amount: 1000.0, balance: 4385.0 },
      { id: 'tr3', date: '03/15/2026', description: 'ROGERS TELECOM INTERNET', debit: 235.0, credit: null, amount: -235.0, balance: 4150.0 },
    ],
    expectedMathAccuracy: 100.0,
  },
  {
    id: 'year-end-boundary',
    name: 'Fiscal Year-End Boundary (Dec 31 to Jan 1)',
    bankName: 'Wells Fargo',
    metadata: {
      filename: 'Year_End_Boundary.pdf',
      totalPages: 1,
      processedPages: 1,
      openingBalance: 10000.0,
      closingBalance: 10500.0,
      bankName: 'Wells Fargo',
      currencySymbol: '$',
    },
    rawTransactions: [
      { id: 'ty1', date: '12/31/2025', description: 'YEAR END SUPPLIES PURCHASE', debit: 500.0, credit: null, amount: -500.0, balance: 9500.0 },
      { id: 'ty2', date: '01/01/2026', description: 'NEW YEAR CLIENT DEPOSIT', debit: null, credit: 1000.0, amount: 1000.0, balance: 10500.0 },
    ],
    expectedMathAccuracy: 100.0,
  },
  {
    id: 'special-chars-desc',
    name: 'Description Special Characters (Quotes, Commas, Newlines)',
    bankName: 'Citibank',
    metadata: {
      filename: 'Special_Chars_Statement.pdf',
      totalPages: 1,
      processedPages: 1,
      openingBalance: 2000.0,
      closingBalance: 1850.0,
      bankName: 'Citibank',
      currencySymbol: '$',
    },
    rawTransactions: [
      { id: 'tsc1', date: '04/05/2026', description: 'JOHN "THE TAILOR" & SONS, LLC - NYC', debit: 150.0, credit: null, amount: -150.0, balance: 1850.0 },
    ],
    expectedMathAccuracy: 100.0,
  },
  {
    id: 'zero-tx-fee-only',
    name: 'Fee-Only Single Line Statement',
    bankName: 'TD Bank',
    metadata: {
      filename: 'Fee_Only.pdf',
      totalPages: 1,
      processedPages: 1,
      openingBalance: 500.0,
      closingBalance: 485.0,
      bankName: 'TD Bank',
      currencySymbol: '$',
    },
    rawTransactions: [
      { id: 'tz1', date: '05/01/2026', description: 'MONTHLY ACCOUNT MAINTENANCE FEE', debit: 15.0, credit: null, amount: -15.0, balance: 485.0 },
    ],
    expectedMathAccuracy: 100.0,
  },
];

/**
 * Execute regression test suite locally in browser memory
 */
export function runLocalRegressionSuite(): { pass: boolean; results: any[] } {
  const results = [];
  let allPass = true;

  for (const testCase of SYNTHETIC_REGRESSION_SUITE) {
    const { reconciliation } = reconcileTransactions(testCase.rawTransactions, testCase.metadata);
    const passesMath = reconciliation.isBalanced && reconciliation.difference === 0;

    results.push({
      id: testCase.id,
      name: testCase.name,
      passesMath,
      calculatedBalance: reconciliation.calculatedEndingBalance,
      targetBalance: testCase.metadata.closingBalance,
      accuracyScore: reconciliation.accuracyScore,
    });

    if (!passesMath) {
      allPass = false;
    }
  }

  return { pass: allPass, results };
}
