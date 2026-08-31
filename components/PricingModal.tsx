'use client';

import React, { useState } from 'react';
import { X, Check, Sparkles, Key, Zap, Shield, CreditCard, Lock } from 'lucide-react';
import { openLemonSqueezyCheckout, activateLicenseKey } from '@/lib/licensing';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLicenseActivated?: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onLicenseActivated }) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'key'>('plans');
  const [inputKey, setInputKey] = useState('');
  const [keyMessage, setKeyMessage] = useState<{ success: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  const handleActivateKey = (e: React.FormEvent) => {
    e.preventDefault();
    const res = activateLicenseKey(inputKey);
    setKeyMessage({ success: res.success, text: res.message });
    if (res.success) {
      setTimeout(() => {
        onLicenseActivated?.();
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl transition-all">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Zero Server Uploads Guarantee</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Unlock Unlimited PDF Conversions
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Convert long PDF bank statements with zero page limits, full math reconciliation, and instant XLSX & QBO export.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('plans')}
            className={`flex-1 pb-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'plans'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Pricing Plans
          </button>
          <button
            onClick={() => setActiveTab('key')}
            className={`flex-1 pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'key'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="h-4 w-4" />
            <span>Enter License Key</span>
          </button>
        </div>

        {/* Tab 1: Pricing Plans */}
        {activeTab === 'plans' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 24-Hour Pass */}
            <div className="relative rounded-xl border border-slate-200 bg-slate-50/60 p-5 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">24-Hour Pass</h3>
                    <p className="text-xs text-slate-500">Perfect for single project catch-up</p>
                  </div>
                  <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                    ONE-TIME
                  </span>
                </div>

                <div className="mt-3 flex items-baseline">
                  <span className="text-3xl font-extrabold text-slate-900">$9.99</span>
                  <span className="ml-1 text-xs text-slate-500">/ 24 hours</span>
                </div>

                <ul className="mt-4 space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Unlimited PDF Pages for 24 Hours</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Mathematical Reconciliation Engine</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Excel (.xlsx) & QBO / Xero CSV</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => openLemonSqueezyCheckout('24hr')}
                className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-slate-800 transition-colors"
              >
                Buy 24-Hour Pass ($9.99)
              </button>
            </div>

            {/* Pro Subscription */}
            <div className="relative rounded-xl border-2 border-emerald-500 bg-emerald-50/30 p-5 space-y-4 shadow-md flex flex-col justify-between">
              <div className="absolute -top-3 right-4 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm">
                Most Popular
              </div>

              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Pro Unlimited</h3>
                    <p className="text-xs text-slate-500">For CPAs & Bookkeepers</p>
                  </div>
                </div>

                <div className="mt-3 flex items-baseline">
                  <span className="text-3xl font-extrabold text-slate-900">$24</span>
                  <span className="ml-1 text-xs text-slate-500">/ month</span>
                </div>

                <ul className="mt-4 space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Unlimited Pages & Files Forever</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Batch Multi-PDF Processing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Priority Tesseract OCR Worker</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Cancel anytime in 1 click</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => openLemonSqueezyCheckout('pro')}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition-colors"
              >
                Start Pro Plan ($24/mo)
              </button>
            </div>

          </div>
        ) : (
          /* Tab 2: Enter License Key */
          <form onSubmit={handleActivateKey} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Lemon Squeezy License Key</label>
              <input
                type="text"
                placeholder="e.g. PASS-2026 or PRO-XXXXXXXX-XXXX"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 font-mono text-sm uppercase focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Check your Lemon Squeezy receipt email for your order license code.
              </p>
            </div>

            {keyMessage && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold ${
                  keyMessage.success ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                }`}
              >
                {keyMessage.text}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-emerald-700 transition-colors"
            >
              Verify & Activate License
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-slate-400 border-t border-slate-100 pt-4">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3" /> Secure 256-bit Lemon Squeezy SSL
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1">
            <CreditCard className="h-3 w-3" /> Cards, Apple Pay, Google Pay
          </span>
        </div>
      </div>
    </div>
  );
};
