import { Transaction, StatementMetadata, ReconciliationResult } from './types';
import { categorizeTransaction } from './categorizer';

export function getDemoStatementData(): {
  transactions: Transaction[];
  metadata: StatementMetadata;
  reconciliation: ReconciliationResult;
} {
  const openingBalance = 4520.50;
  
  const rawTransactions = [
    {
      id: 'tx-demo-1',
      date: '01/05/2026',
      description: 'CHASE AUTOMATIC PAYROLL DIRECT DEPOSIT ACME CORP',
      debit: null,
      credit: 3250.00,
      amount: 3250.00,
      balance: 7770.50,
      isFlagged: false,
      pageNumber: 1,
    },
    {
      id: 'tx-demo-2',
      date: '01/08/2026',
      description: 'AMAZON.COM MKTPLACE SEATTLE WA - OFFICE SUPPLIES',
      debit: 142.80,
      credit: null,
      amount: -142.80,
      balance: 7627.70,
      isFlagged: false,
      pageNumber: 1,
    },
    {
      id: 'tx-demo-3',
      date: '01/12/2026',
      description: 'WEWORK COWORKING MONTHLY SUBSCRIPTION PMT',
      debit: 450.00,
      credit: null,
      amount: -450.00,
      balance: 7177.70,
      isFlagged: false,
      pageNumber: 1,
    },
    {
      id: 'tx-demo-4',
      date: '01/15/2026',
      description: 'STRIPE TRANSFER INBOUND INVOICE #1042 CLIENT PAYMENT',
      debit: null,
      credit: 1800.00,
      amount: 1800.00,
      balance: 8977.70,
      isFlagged: false,
      pageNumber: 1,
    },
    {
      id: 'tx-demo-5',
      date: '01/19/2026',
      description: 'COMCAST BUSINESS INTERNET & PHONE UTILITY',
      debit: 129.99,
      credit: null,
      amount: -129.99,
      balance: 8847.71,
      isFlagged: false,
      pageNumber: 2,
    },
    {
      id: 'tx-demo-6',
      date: '01/24/2026',
      description: 'CHECK #1402 PAYEE APEX CLEANING SERVICES',
      debit: 350.00,
      credit: null,
      amount: -350.00,
      balance: 8497.71,
      isFlagged: false,
      pageNumber: 2,
    },
    {
      id: 'tx-demo-7',
      date: '01/28/2026',
      description: 'GUSTO PAYROLL TAX WITHHOLDING PMT',
      debit: 620.00,
      credit: null,
      amount: -620.00,
      balance: 7877.71,
      isFlagged: false,
      pageNumber: 2,
    },
  ];

  const transactions: Transaction[] = rawTransactions.map((tx) => {
    const catResult = categorizeTransaction(tx.description, tx.amount);
    return {
      ...tx,
      category: catResult.category,
      categoryConfidence: catResult.confidence,
      needsReview: catResult.needsReview,
      reviewReason: catResult.reviewReason,
    };
  });

  const sumCredits = 3250.00 + 1800.00; // 5050.00
  const sumDebits = 142.80 + 450.00 + 129.99 + 350.00 + 620.00; // 1692.79
  const calculatedEnding = openingBalance + sumCredits - sumDebits; // 7877.71

  const metadata: StatementMetadata = {
    filename: 'Chase_Business_Checking_Sample.pdf',
    fileSize: 428000,
    totalPages: 2,
    processedPages: 2,
    bankName: 'JPMorgan Chase Bank',
    accountNumber: '...8942',
    statementPeriod: 'Jan 01, 2026 - Jan 31, 2026',
    openingBalance: openingBalance,
    closingBalance: calculatedEnding,
    detectedTotalCredits: sumCredits,
    detectedTotalDebits: sumDebits,
    currencySymbol: '$',
    isScannedPdf: false,
  };

  const reconciliation: ReconciliationResult = {
    isBalanced: true,
    calculatedEndingBalance: calculatedEnding,
    expectedEndingBalance: calculatedEnding,
    difference: 0,
    sumCredits: sumCredits,
    sumDebits: sumDebits,
    openingBalance: openingBalance,
    unverifiedCount: transactions.filter(t => t.needsReview || t.isFlagged).length,
  };

  return { transactions, metadata, reconciliation };
}
