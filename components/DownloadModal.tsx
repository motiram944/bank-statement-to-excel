'use client';

import React, { useState } from 'react';
import { X, Download, Copy, Check } from 'lucide-react';
import { saveFile } from '@/lib/export-excel';
import { SupportedLanguage, translate } from '@/lib/i18n';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  filename: string;
  blob?: Blob;
  downloadUrl: string;
  textContent: string;
  currentLanguage?: SupportedLanguage;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  title,
  filename,
  blob,
  downloadUrl,
  textContent,
  currentLanguage = 'en',
}) => {
  const [copied, setCopied] = useState(false);
  const lang = currentLanguage;

  if (!isOpen) return null;

  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    await saveFile(downloadUrl, filename);
  };

  const handleCopyText = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textContent);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textContent;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            <span>{translate('fileReadyExport', lang)}</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 font-mono">{filename}</p>
        </div>

        {/* Primary Direct User-Click Download Button */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleDownloadClick}
            className="flex items-center justify-center gap-2.5 w-full rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-98 transition-all text-center cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>{translate('clickToSave', lang)} &quot;{filename}&quot;</span>
          </button>

          <p className="text-[11px] text-slate-400 text-center">
            {translate('fileSaverNote', lang)}
          </p>
        </div>

        {/* Alternative Copy to Clipboard Fallback */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">{translate('dataClipboardFallback', lang)}</span>
            <button
              onClick={handleCopyText}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                copied
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{translate('copiedClipboard', lang)}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>{translate('copyTextClipboard', lang)}</span>
                </>
              )}
            </button>
          </div>

          {/* Raw Text Preview Box */}
          <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] text-slate-700 leading-relaxed select-all">
            {textContent.slice(0, 1000)}
            {textContent.length > 1000 ? '\n... (truncated preview)' : ''}
          </div>
        </div>

      </div>
    </div>
  );
};
