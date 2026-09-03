import React from 'react';
import Link from 'next/link';
import { FileSpreadsheet, Lock, ShieldCheck } from 'lucide-react';
import { BANK_CONFIGS } from '@/lib/banks-config';
import { SupportedLanguage, translate } from '@/lib/i18n';

interface FooterProps {
  currentLanguage?: SupportedLanguage;
}

export const Footer: React.FC<FooterProps> = ({ currentLanguage = 'en' }) => {
  const lang = currentLanguage;

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
              {translate('footerText', lang)}
            </p>

            <div className="flex items-center gap-3 text-xs text-emerald-400 font-medium flex-wrap">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> {translate('privateLocalWasm', lang)}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <Lock className="h-4 w-4" /> {translate('glbaGdprCompliant', lang)}
              </span>
            </div>
          </div>

          {/* Programmatic Bank Converters */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {translate('supportedBanks', lang)}
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

          {/* Supported Features & Export */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {translate('featuresAndExport', lang)}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>{translate('excelExportItem', lang)}</li>
              <li>{translate('qboExportItem', lang)}</li>
              <li>{translate('xeroExportItem', lang)}</li>
              <li>{translate('mathEngineItem', lang)}</li>
              <li>{translate('tesseractOcrItem', lang)}</li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal Disclaimer */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>&copy; {new Date().getFullYear()} LedgerClean. {translate('copyrightText', lang)}</p>
          <div className="flex gap-4">
            <a href="#privacy" className="hover:text-slate-300">{translate('privacyPolicyLink', lang)}</a>
            <a href="#terms" className="hover:text-slate-300">{translate('termsServiceLink', lang)}</a>
            <a href="#security" className="hover:text-slate-300">{translate('securityArchLink', lang)}</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
