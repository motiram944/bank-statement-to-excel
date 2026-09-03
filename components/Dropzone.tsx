'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, Sparkles, RefreshCw, Files } from 'lucide-react';
import { ProcessingProgress } from '@/lib/types';
import { SupportedLanguage, translate } from '@/lib/i18n';
import { trackEvent } from '@/lib/firebase';

interface DropzoneProps {
  onFileSelect: (files: File[]) => void;
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
      const filesArray = Array.from(e.dataTransfer.files);
      trackEvent('document_drag_dropped', { file_count: filesArray.length });
      validateAndProcess(filesArray, 'drag_and_drop');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      validateAndProcess(filesArray, 'file_picker');
    }
  };

  const validateAndProcess = (files: File[], source: 'drag_and_drop' | 'file_picker') => {
    const validPdfFiles = files.filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (validPdfFiles.length === 0) {
      alert('Please upload valid PDF bank statement files.');
      return;
    }

    trackEvent('document_file_selected', {
      upload_source: source,
      file_count: validPdfFiles.length,
      first_file_name: validPdfFiles[0].name,
      total_size_kb: Math.round(validPdfFiles.reduce((acc, f) => acc + f.size, 0) / 1024),
    });

    trackEvent('pdf_upload_started', {
      file_count: validPdfFiles.length,
      file_name: validPdfFiles[0].name,
      total_size_kb: Math.round(validPdfFiles.reduce((acc, f) => acc + f.size, 0) / 1024),
    });

    onFileSelect(validPdfFiles);
  };

  const handleContainerClick = () => {
    if (!isProcessing) {
      trackEvent('browse_files_clicked');
      fileInputRef.current?.click();
    }
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
        onClick={handleContainerClick}
        onKeyDown={(e) => {
          if (!isProcessing && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleContainerClick();
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
          multiple
          onChange={handleFileChange}
          disabled={isProcessing}
          className="hidden"
        />

        {isProcessing ? (
          <div className="space-y-6 py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-spin">
              <RefreshCw className="h-8 w-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                {progress.message || translate('processingTitle', lang)}
              </h3>
              <p className="text-xs text-slate-500">
                {translate('processingSub', lang)}
              </p>
            </div>

            {/* Live Progress Bar */}
            <div className="mx-auto max-w-xs space-y-1.5">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                  style={{ width: `${Math.max(5, progress.percent)}%` }}
                />
              </div>
              <p className="text-right text-xs font-semibold text-emerald-600">
                {progress.percent}%
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-inner">
              <UploadCloud className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {translate('dropzoneHeading', lang)}
              </h3>
              <p className="text-sm text-slate-600 max-w-lg mx-auto">
                {translate('dropzoneSubheading', lang)}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-all active:scale-95"
              >
                <FileText className="h-4 w-4 text-emerald-400" />
                <span>{translate('browseFiles', lang)}</span>
              </button>

              <button
                type="button"
                onClick={handleDemoClick}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-900 hover:bg-emerald-100 transition-all active:scale-95"
              >
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>{translate('trySample', lang)}</span>
              </button>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
              <Files className="h-3.5 w-3.5 text-emerald-600" />
              <span>{translate('batchUploadHint', lang)}</span>
            </div>
          </div>
        )}
      </div>

      {fileError && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 shadow-sm animate-fade-in">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <p className="font-medium">{fileError}</p>
        </div>
      )}
    </div>
  );
};
