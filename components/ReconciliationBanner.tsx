'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, Calculator, ArrowUpRight, ArrowDownRight, Scale, ShieldCheck } from 'lucide-react';
import { ReconciliationResult } from '@/lib/types';
import { SupportedLanguage, translate } from '@/lib/i18n';

interface ReconciliationBannerProps {
  reconciliation: ReconciliationResult;
  currentLanguage?: SupportedLanguage;
}

export const ReconciliationBanner: React.FC<ReconciliationBannerProps> = ({
  reconciliation,
  currentLanguage = 'en',
}) => {
  const lang = currentLanguage;
  const {
    isBalanced,
    calculatedEndingBalance,
    expectedEndingBalance,
    difference,
    sumCredits,
    sumDebits,
    openingBalance,
    unverifiedCount,
    accuracyScore = 100.0,
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
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-bold text-emerald-900">
                  ✓ {translate('reconVerified', lang)}
                </h4>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-600/20 px-2 py-0.5 text-xs font-extrabold text-emerald-800 border border-emerald-500/30">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  {accuracyScore.toFixed(1)}% Measured Math Accuracy
                </span>
              </div>
              <p className="text-xs text-emerald-700 font-medium font-mono mt-0.5">
                Formula: Opening (${openingBalance.toFixed(2)}) + Credits (${sumCredits.toFixed(2)}) - Debits (${sumDebits.toFixed(2)}) = ${calculatedEndingBalance?.toFixed(2)}
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
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-bold text-amber-900">
                  ⚠️ {translate('reconWarning', lang)} (${difference.toFixed(2)})
                </h4>
                <span className="inline-flex items-center gap-1 rounded bg-amber-600/20 px-2 py-0.5 text-xs font-extrabold text-amber-900 border border-amber-500/30">
                  {accuracyScore.toFixed(1)}% Math Reconciled
                </span>
              </div>
              <p className="text-xs text-amber-800 font-medium font-mono mt-0.5">
                Ending (${calculatedEndingBalance?.toFixed(2)}) vs Statement (${expectedEndingBalance?.toFixed(2)}). {unverifiedCount} row(s) flagged for review.
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
            <span>{translate('openingBalance', lang)}</span>
            <Scale className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-1 text-lg font-bold text-slate-900 font-mono">
            ${openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{translate('totalDeposits', lang)}</span>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-1 text-lg font-bold text-emerald-600 font-mono">
            +${sumCredits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{translate('totalWithdrawals', lang)}</span>
            <ArrowDownRight className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-1 text-lg font-bold text-rose-600 font-mono">
            -${sumDebits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{translate('calculatedEnding', lang)}</span>
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
