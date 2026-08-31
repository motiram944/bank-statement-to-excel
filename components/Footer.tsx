import React from 'react';
import Link from 'next/link';
import { FileSpreadsheet, Lock, ShieldCheck } from 'lucide-react';
import { BANK_CONFIGS } from '@/lib/banks-config';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-900 text-slate-300 py-12 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-bold">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">LedgerClean</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              100% In-Browser Bank Statement to Excel & QuickBooks Converter. Built specifically for freelance bookkeepers, CPAs, solo tax preparers, and small business owners.
            </p>

            <div className="flex items-center gap-3 text-xs text-emerald-400 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> 100% Private Local WebAssembly
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <Lock className="h-4 w-4" /> GLBA & GDPR Compliant
              </span>
            </div>
          </div>

          {/* Programmatic Bank Converters */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Bank Converters
            </h4>
            <nav aria-label="Supported Bank Converters">
              <ul className="space-y-2 text-xs">
                {Object.values(BANK_CONFIGS).map((bank) => (
                  <li key={bank.slug}>
                    <Link
                      href={`/convert/${bank.slug}`}
                      className="text-slate-400 hover:text-emerald-400 transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-400 rounded"
                    >
                      {bank.shortName} Statement to Excel
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Supported Features & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Features & Export
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Microsoft Excel (.xlsx) Export</li>
              <li>QuickBooks Online CSV Format</li>
              <li>Xero Ready CSV Generator</li>
              <li>Mathematical Reconciliation Engine</li>
              <li>Tesseract.js OCR Worker</li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal Disclaimer */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>&copy; {new Date().getFullYear()} LedgerClean. All rights reserved. Zero server uploads architecture.</p>
          <div className="flex gap-4">
            <a href="#privacy" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-300">Terms of Service</a>
            <a href="#security" className="hover:text-slate-300">Security Architecture</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
