import { Transaction, StatementMetadata, ReconciliationResult } from './types';
import { categorizeTransaction } from './categorizer';

export function getDemoStatementData(): {
  transactions: Transaction[];
  metadata: StatementMetadata;
  reconciliation: ReconciliationResult;
} {
  const openingBalance = 12450.00;

  const sampleVendors = [
    { name: 'AMAZON.COM SEATTLE WA - OFFICE SUPPLIES', debit: 84.50, cat: 'Office Supplies' },
    { name: 'AWS EMPOWER CLOUD SERVICES MONTHLY', debit: 240.00, cat: 'Software & SaaS' },
    { name: 'CHASE AUTOMATIC PAYROLL DIRECT DEPOSIT ACME CORP', credit: 4500.00, cat: 'Income / Sales' },
    { name: 'WEWORK COWORKING MONTHLY SUBSCRIPTION', debit: 450.00, cat: 'Rent & Facilities' },
    { name: 'STRIPE TRANSFER CLIENT INVOICE #1042', credit: 2850.00, cat: 'Income / Sales' },
    { name: 'COMCAST BUSINESS INTERNET & PHONE UTILITY', debit: 129.99, cat: 'Utilities' },
    { name: 'UBER TRIP SAN FRANCISCO CA - TAXI TRAVEL', debit: 38.20, cat: 'Travel & Lodging' },
    { name: 'STARBUCKS COFFEE STORE #8941 MEALS', debit: 14.75, cat: 'Meals & Entertainment' },
    { name: 'GUSTO PAYROLL TAX WITHHOLDING PMT', debit: 820.00, cat: 'Payroll & Wages' },
    { name: 'GOOGLE WORKSPACE CLOUD MAIL SUBSCRIPTION', debit: 48.00, cat: 'Software & SaaS' },
    { name: 'SQUARE INC PAYMENT RECEIVED CLIENT #304', credit: 1420.00, cat: 'Income / Sales' },
    { name: 'FEDEX SHIPPING OFFICE PRIORITY COURIER', debit: 52.40, cat: 'Office Supplies' },
    { name: 'SHELL OIL FUEL STATION AUTOMOTIVE GAS', debit: 62.10, cat: 'Travel & Lodging' },
    { name: 'SLACK TECHNOLOGIES ANNUAL TEAM PLAN', debit: 192.00, cat: 'Software & SaaS' },
    { name: 'CHECK #1402 APEX CLEANING SERVICES LLC', debit: 350.00, cat: 'Professional Services' },
  ];

  const rawTransactions: any[] = [];
  let currentBalance = openingBalance;
  let sumCredits = 0;
  let sumDebits = 0;

  // Generate 65 multi-page realistic transactions
  for (let i = 1; i <= 65; i++) {
    const template = sampleVendors[(i - 1) % sampleVendors.length];
    const pageNum = Math.ceil(i / 13); // 13 rows per page across 5 pages
    const day = String((i % 28) + 1).padStart(2, '0');
    const month = String(Math.ceil(i / 22)).padStart(2, '0');
    const dateStr = `${month}/${day}/2026`;

    let debit: number | null = null;
    let credit: number | null = null;
    let amount = 0;

    if (template.credit) {
      credit = Number((template.credit + (i * 15)).toFixed(2));
      amount = credit;
      sumCredits += credit;
      currentBalance += credit;
    } else {
      debit = Number((template.debit! + (i * 2.5)).toFixed(2));
      amount = -debit;
      sumDebits += debit;
      currentBalance -= debit;
    }

    currentBalance = Number(currentBalance.toFixed(2));

    rawTransactions.push({
      id: `tx-demo-${i}`,
      date: dateStr,
      description: `${template.name} (REF #${1000 + i})`,
      debit: debit,
      credit: credit,
      amount: amount,
      balance: currentBalance,
      isFlagged: i % 17 === 0,
      pageNumber: pageNum,
    });
  }

  const transactions: Transaction[] = rawTransactions.map((tx) => {
    const catResult = categorizeTransaction(tx.description, tx.amount);
    return {
      ...tx,
      category: catResult.category,
      categoryConfidence: catResult.confidence,
      needsReview: catResult.needsReview || tx.isFlagged,
      reviewReason: catResult.reviewReason,
    };
  });

  const calculatedEnding = Number(currentBalance.toFixed(2));

  const metadata: StatementMetadata = {
    filename: 'Chase_Business_5_Page_MultiPage_Sample.pdf',
    fileSize: 1250000,
    totalPages: 5,
    processedPages: 5,
    bankName: 'JPMorgan Chase Bank',
    accountNumber: '...8942',
    statementPeriod: 'Jan 01, 2026 - Mar 31, 2026',
    openingBalance: openingBalance,
    closingBalance: calculatedEnding,
    detectedTotalCredits: Number(sumCredits.toFixed(2)),
    detectedTotalDebits: Number(sumDebits.toFixed(2)),
    currencySymbol: '$',
    isScannedPdf: false,
  };

  const reconciliation: ReconciliationResult = {
    isBalanced: true,
    calculatedEndingBalance: calculatedEnding,
    expectedEndingBalance: calculatedEnding,
    difference: 0,
    sumCredits: Number(sumCredits.toFixed(2)),
    sumDebits: Number(sumDebits.toFixed(2)),
    openingBalance: openingBalance,
    unverifiedCount: transactions.filter(t => t.needsReview || t.isFlagged).length,
    accuracyScore: 100.0,
  };

  return { transactions, metadata, reconciliation };
}
