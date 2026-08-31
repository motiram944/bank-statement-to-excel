import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Building2, Globe2 } from 'lucide-react';
import { BANK_CONFIGS } from '@/lib/banks-config';

export const SupportedBanksSection: React.FC = () => {
  return (
    <section id="supported-banks" className="pt-16 border-t border-slate-200 space-y-8 scroll-mt-20">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-800">
          <Globe2 className="h-3.5 w-3.5 text-blue-600" />
          <span>Pre-Calibrated Bank Templates</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Supported US, UK & International Banks
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          LedgerClean algorithms are pre-calibrated for single-column and multi-column statement layouts across major institutions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
        {Object.values(BANK_CONFIGS).map((bank) => (
          <Link
            key={bank.slug}
            href={`/convert/${bank.slug}`}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-bold">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {bank.shortName}
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {bank.country} &bull; {bank.currency}
                    </span>
                  </div>
                </div>

                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                  Pre-tested
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {bank.metaDescription}
              </p>

              <div className="space-y-1 pt-1 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Checking, Savings & Credit Card</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>QuickBooks Online & Xero CSV format</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-emerald-700">
              <span>Convert {bank.shortName} PDF</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
