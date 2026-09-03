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
    });

    if (!passesMath) {
      allPass = false;
    }
  }

  return { pass: allPass, results };
}
