import React from 'react';
import { ShieldCheck, Cpu, EyeOff, CheckCircle2 } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Primary Security Alert Badge */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 sm:px-5 text-emerald-900 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-950">
              🛡️ 100% Private Client-Side Processing. Files never touch our servers.
            </p>
            <p className="text-xs text-emerald-700">
              All PDF extraction & Tesseract OCR run locally in your browser via WebAssembly. Fully GLBA & GDPR compliant.
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-md bg-white border border-emerald-300 px-2.5 py-1 text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
          Zero Backend Costs
        </span>
      </div>

      {/* Supported Bank Logos Badges */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Pre-calibrated for major US, UK & Canadian banks
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-blue-900">
            <span className="h-2 w-2 rounded-full bg-blue-600"></span>
            Chase Bank
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-red-700">
            <span className="h-2 w-2 rounded-full bg-red-600"></span>
            Bank of America
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-amber-800">
            <span className="h-2 w-2 rounded-full bg-amber-600"></span>
            Wells Fargo
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-cyan-800">
            <span className="h-2 w-2 rounded-full bg-cyan-600"></span>
            Barclays UK
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-indigo-900">
            <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
            RBC Royal Bank
          </div>
        </div>
      </div>
    </div>
  );
};
