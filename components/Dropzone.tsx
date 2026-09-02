'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { ProcessingProgress } from '@/lib/types';
import { SupportedLanguage, translate } from '@/lib/i18n';
import { trackEvent } from '@/lib/firebase';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  onLoadSample: () => void;
  progress: ProcessingProgress;
  isProcessing: boolean;
  fileError?: string | null;
  currentLanguage?: SupportedLanguage;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFileSelect,
  onLoadSample,
  progress,
  isProcessing,
  fileError,
  currentLanguage = 'en',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lang = currentLanguage;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcess(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndProcess(file);
    }
  };

  const validateAndProcess = (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a valid PDF bank statement file.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100 MB limit
      alert('File size exceeds maximum limit of 100 MB.');
      return;
    }

    trackEvent('pdf_upload_started', {
      file_name: file.name,
      file_size_kb: Math.round(file.size / 1024),
    });

    onFileSelect(file);
  };

  const handleDemoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackEvent('demo_statement_loaded');
    onLoadSample();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload Bank Statement PDF"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (!isProcessing && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
            : isProcessing
            ? 'border-slate-300 bg-slate-50 cursor-not-allowed opacity-90'
            : 'border-slate-300 bg-white hover:border-emerald-500 hover:bg-slate-50/80 shadow-md hover:shadow-lg'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          disabled={isProcessing}
          className="hidden"
        />

        {isProcessing ? (
          <div className="space-y-6 py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-spin">
              <RefreshCw className="h-8 w-8" />
            </div>
            
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-slate-900">{progress.message}</h3>
              
              {/* Progress Bar */}
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-500 font-mono pt-1">
                <span>{progress.stage}</span>
                <span>{progress.percent}%</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-sm">
              <UploadCloud className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">
                {translate('dragDropPrompt', lang)}
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                {translate('orClickToBrowse', lang)}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
              >
                Browse File
              </button>

              <button
                type="button"
                onClick={handleDemoClick}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>{translate('tryDemoBtn', lang)}</span>
              </button>
            </div>

            {fileError && (
              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-red-600 bg-red-50 p-2 rounded-md max-w-md mx-auto">
                <AlertCircle className="h-4 w-4" />
                <span>{fileError}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
