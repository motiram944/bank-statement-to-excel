'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Sparkles, Key, FileSpreadsheet } from 'lucide-react';
import { getLicenseState } from '@/lib/licensing';
import { LicenseState } from '@/lib/types';

interface NavbarProps {
  onOpenPricing: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenPricing }) => {
  const [license, setLicense] = useState<LicenseState>({ isPro: false, passActive: false, licenseKey: null, passExpiresAt: null });

  useEffect(() => {
    setLicense(getLicenseState());
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm shadow-emerald-200">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-slate-900">LedgerClean</span>
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                100% Local
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 hidden sm:block">Bank Statement to Excel Engine</p>
          </div>
        </Link>

        {/* Security Highlight Badge */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-medium text-slate-700">
          <Lock className="h-3.5 w-3.5 text-emerald-600" />
          <span>Zero Server Uploads &bull; GLBA / GDPR Compliant</span>
        </div>

        {/* Nav Actions */}
        <nav aria-label="Main Navigation" className="flex items-center gap-3">
          <Link
            href="/#how-it-works"
            className="hidden md:inline-flex text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1"
          >
            How it Works
          </Link>
          <Link
            href="/#supported-banks"
            className="hidden md:inline-flex text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-1"
          >
            Supported Banks
          </Link>

          {license.passActive || license.isPro ? (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>{license.isPro ? 'Pro Active' : '24-Hour Pass Active'}</span>
            </div>
          ) : (
            <button
              onClick={onOpenPricing}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Upgrade / License</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
