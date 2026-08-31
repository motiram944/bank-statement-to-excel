'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, Calculator, ArrowUpRight, ArrowDownRight, Scale } from 'lucide-react';
import { ReconciliationResult } from '@/lib/types';

interface ReconciliationBannerProps {
  reconciliation: ReconciliationResult;
}

export const ReconciliationBanner: React.FC<ReconciliationBannerProps> = ({ reconciliation }) => {
  const {
    isBalanced,
    calculatedEndingBalance,
    expectedEndingBalance,
    difference,
    sumCredits,
    sumDebits,
    openingBalance,
    unverifiedCount,
  } = reconciliation;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-3">
      {/* Primary Verification Status Alert */}
      {isBalanced ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-emerald-300 bg-emerald-500/10 p-4 text-emerald-950 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-emerald-900">
                ✓ Reconciliation Verified: Total Debits and Credits Match Statement Closing Balance
              </h4>
              <p className="text-xs text-emerald-700 font-medium">
                Mathematical formula checked: Opening (${openingBalance.toFixed(2)}) + Credits (${sumCredits.toFixed(2)}) - Debits (${sumDebits.toFixed(2)}) = ${calculatedEndingBalance?.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="shrink-0 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm">
            100% Balanced
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-amber-300 bg-amber-500/10 p-4 text-amber-950 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white shadow-sm">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-amber-900">
                ⚠️ Reconciliation Warning: ${difference.toFixed(2)} Discrepancy Flagged
              </h4>
              <p className="text-xs text-amber-800 font-medium">
                Calculated Ending (${calculatedEndingBalance?.toFixed(2)}) does not match Statement Closing Balance (${expectedEndingBalance?.toFixed(2)}). {unverifiedCount} row(s) highlighted in warning tag for review.
              </p>
            </div>
          </div>

          <div className="shrink-0 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm">
            Review Needed
          </div>
        </div>
      )}

      {/* Breakdown Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Opening Balance</span>
            <Scale className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-1 text-lg font-bold text-slate-900 font-mono">
            ${openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Deposits (Credits)</span>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-1 text-lg font-bold text-emerald-600 font-mono">
            +${sumCredits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Withdrawals (Debits)</span>
            <ArrowDownRight className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-1 text-lg font-bold text-rose-600 font-mono">
            -${sumDebits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Calculated Ending</span>
            <Calculator className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-1 text-lg font-bold text-indigo-900 font-mono">
            ${calculatedEndingBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
};
