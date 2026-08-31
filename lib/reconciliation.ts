import { Transaction, ReconciliationResult, StatementMetadata } from './types';

/**
 * Mathematical Reconciliation Engine
 * Uses exact integer cents math to eliminate JavaScript floating point rounding errors.
 * Formula: Calculated Ending Balance = Opening Balance + Sum(Credits) - Sum(Debits)
 */
export function reconcileTransactions(
  transactions: Transaction[],
  metadata: Partial<StatementMetadata>
): {
  reconciliation: ReconciliationResult;
  reconciledTransactions: Transaction[];
} {
  let sumDebitsCents = 0;
  let sumCreditsCents = 0;

  for (const tx of transactions) {
    if (tx.debit !== null && tx.debit > 0) {
      sumDebitsCents += Math.round(tx.debit * 100);
    }
    if (tx.credit !== null && tx.credit > 0) {
      sumCreditsCents += Math.round(tx.credit * 100);
    }
  }

  const sumDebits = sumDebitsCents / 100;
  const sumCredits = sumCreditsCents / 100;

  const openingBal = metadata.openingBalance ?? 0;
  const openingCents = Math.round(openingBal * 100);

  const calculatedEndingCents = openingCents + sumCreditsCents - sumDebitsCents;
  const calculatedEnding = calculatedEndingCents / 100;

  const expectedEnding = (metadata.closingBalance !== null && metadata.closingBalance !== undefined)
    ? metadata.closingBalance
    : calculatedEnding;

  const expectedEndingCents = Math.round(expectedEnding * 100);
  const differenceCents = Math.abs(calculatedEndingCents - expectedEndingCents);
  const difference = differenceCents / 100;

  let unverifiedCount = 0;
  let runningCents = openingCents;

  const reconciledTransactions = transactions.map((tx) => {
    let isFlagged = false;
    let flagReason: string | undefined = undefined;

    const creditCents = tx.credit !== null ? Math.round(tx.credit * 100) : 0;
    const debitCents = tx.debit !== null ? Math.round(tx.debit * 100) : 0;
    const txAmountCents = creditCents > 0 ? creditCents : -debitCents;

    const expectedRowBalCents = runningCents + txAmountCents;
    const expectedRowBal = expectedRowBalCents / 100;

    if (tx.balance !== null) {
      const actualRowBalCents = Math.round(tx.balance * 100);
      const rowDiffCents = Math.abs(actualRowBalCents - expectedRowBalCents);

      if (rowDiffCents > 2) { // Discrepancy > $0.02
        isFlagged = true;
        flagReason = `Row balance mismatch (Expected $${expectedRowBal.toFixed(2)}, found $${tx.balance.toFixed(2)})`;
        unverifiedCount++;
      }
      runningCents = actualRowBalCents;
    } else {
      runningCents = expectedRowBalCents;
    }

    return {
      ...tx,
      debit: tx.debit !== null ? Math.round(tx.debit * 100) / 100 : null,
      credit: tx.credit !== null ? Math.round(tx.credit * 100) / 100 : null,
      amount: Math.round(tx.amount * 100) / 100,
      balance: tx.balance !== null ? Math.round(tx.balance * 100) / 100 : null,
      isFlagged: tx.isFlagged || isFlagged,
      flagReason: tx.flagReason || flagReason,
    };
  });

  const isBalanced = differenceCents <= 2 && unverifiedCount === 0;

  const reconciliation: ReconciliationResult = {
    isBalanced,
    calculatedEndingBalance: calculatedEnding,
    expectedEndingBalance: expectedEnding,
    difference,
    sumDebits,
    sumCredits,
    openingBalance: openingBal,
    unverifiedCount,
  };

  return { reconciliation, reconciledTransactions };
}
