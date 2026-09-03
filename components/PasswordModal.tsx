'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, X, KeyRound, AlertCircle } from 'lucide-react';
import { SupportedLanguage, translate } from '@/lib/i18n';

interface PasswordModalProps {
  isOpen: boolean;
  onUnlock: (password: string) => void;
  onCancel: () => void;
  filename?: string;
  errorMessage?: string | null;
  currentLanguage?: SupportedLanguage;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onUnlock,
  onCancel,
  filename,
  errorMessage,
  currentLanguage = 'en',
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const lang = currentLanguage;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onUnlock(password.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5 border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-bold">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{translate('passwordModalTitle', lang)}</h3>
              <p className="text-[11px] text-slate-500 line-clamp-1">{filename || translate('encryptedPdfDefault', lang)}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 100% In-Browser Local Decryption Trust Badge */}
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 border border-emerald-200/80 text-xs text-emerald-900">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
          <span className="font-semibold">
            {translate('passwordTrustBadge', lang)}
          </span>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-slate-500" />
              <span>{translate('enterPdfPassword', lang)}</span>
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={translate('passwordPlaceholder', lang)}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-xs font-mono text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {translate('cancelBtn', lang)}
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm active:scale-95"
            >
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>{translate('unlockAndConvert', lang)}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
