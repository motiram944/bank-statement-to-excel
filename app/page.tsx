'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { TrustBadges } from '@/components/TrustBadges';
import { Dropzone } from '@/components/Dropzone';
import { ReconciliationBanner } from '@/components/ReconciliationBanner';
import { DataGrid } from '@/components/DataGrid';
import { SupportedBanksSection } from '@/components/SupportedBanksSection';
import { Footer } from '@/components/Footer';
import { parsePdfFile } from '@/lib/pdf-parser';
import { reconstructTableData } from '@/lib/table-reconstruction';
import { reconcileTransactions } from '@/lib/reconciliation';
import { getDemoStatementData } from '@/lib/demo-data';
import { trackEvent } from '@/lib/firebase';
import {
  Transaction,
  StatementMetadata,
  ReconciliationResult,
  ProcessingProgress
} from '@/lib/types';
import {
  ShieldCheck,
  Zap,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  ChevronDown,
  Sparkles
} from 'lucide-react';

import { SupportedLanguage, getStoredLanguage, translate } from '@/lib/i18n';

export default function HomePage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [progress, setProgress] = useState<ProcessingProgress>({
    stage: 'idle',
    percent: 0,
    message: '',
  });

  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [metadata, setMetadata] = useState<StatementMetadata | null>(null);
  const [reconciliation, setReconciliation] = useState<ReconciliationResult | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    setCurrentLanguage(getStoredLanguage());
    import('@/lib/firebase').then(({ initFirebaseMonitoring }) => {
      initFirebaseMonitoring();
    });
  }, []);

  const handleFileSelect = async (file: File, password?: string) => {
    setIsProcessing(true);
    setFileError(null);
    setTransactions(null);

    // Unlimited free page processing
    const maxPages = 999;

    try {
      const { pages, metadata: pdfMeta } = await parsePdfFile(file, maxPages, (prog) => {
        setProgress(prog);
      }, password);

      setProgress({
        stage: 'parsing_tables',
        percent: 85,
        message: 'Reconstructing table rows & classifying columns...',
      });

      const { transactions: rawTxs, metadata: tableMeta } = reconstructTableData(pages);

      const mergedMeta: StatementMetadata = {
        ...pdfMeta,
        openingBalance: tableMeta.openingBalance ?? null,
        closingBalance: tableMeta.closingBalance ?? null,
        bankName: tableMeta.bankName || 'Detected Bank',
      };

      setProgress({
        stage: 'reconciling',
        percent: 95,
        message: 'Verifying mathematical reconciliation balance...',
      });

      const { reconciliation: reconRes, reconciledTransactions } = reconcileTransactions(rawTxs, mergedMeta);

      setMetadata(mergedMeta);
      setTransactions(reconciledTransactions);
      setReconciliation(reconRes);

      trackEvent('pdf_conversion_success', {
        page_count: pdfMeta.totalPages,
        transaction_count: reconciledTransactions.length,
        bank_name: mergedMeta.bankName,
      });

      setProgress({
        stage: 'complete',
        percent: 100,
        message: 'Conversion completed successfully!',
      });
    } catch (err: any) {
      console.error('PDF Conversion error:', err);
      if (err?.message === 'PASSWORD_REQUIRED') {
        const enteredPass = window.prompt('🔐 This bank statement PDF is password-protected. Please enter your PDF password:');
        if (enteredPass) {
          return handleFileSelect(file, enteredPass);
        } else {
          setFileError('Password required to open encrypted PDF bank statement.');
        }
      } else {
        setFileError('Failed to process PDF file. Please ensure it is a valid bank statement.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadDemo = () => {
    const demo = getDemoStatementData();
    setMetadata(demo.metadata);
    setTransactions(demo.transactions);
    setReconciliation(demo.reconciliation);
  };

  const handleUpdateTransactions = (updated: Transaction[]) => {
    setTransactions(updated);
    if (metadata) {
      const { reconciliation: reconRes } = reconcileTransactions(updated, metadata);
      setReconciliation(reconRes);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        currentLanguage={currentLanguage}
        onLanguageChange={(newLang) => setCurrentLanguage(newLang)}
      />

      <main className="flex-1 space-y-12 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-800 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>100% Free & Private WebAssembly Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {translate('heroTitle', currentLanguage)}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {translate('heroSubtitle', currentLanguage)}
          </p>
        </section>

        {/* Trust Badges */}
        <TrustBadges currentLanguage={currentLanguage} />

        {/* Dropzone Converter Engine */}
        <Dropzone
          onFileSelect={handleFileSelect}
          onLoadSample={handleLoadDemo}
          progress={progress}
          isProcessing={isProcessing}
          fileError={fileError}
          currentLanguage={currentLanguage}
        />

        {/* Conversion Results Area */}
        {transactions && reconciliation && metadata && (
          <section className="space-y-6 pt-6 animate-fadeIn">
            <ReconciliationBanner reconciliation={reconciliation} currentLanguage={currentLanguage} />
            <DataGrid
              transactions={transactions}
              onUpdateTransactions={handleUpdateTransactions}
              isPartialPreview={false}
              totalPages={metadata.totalPages}
              processedPages={metadata.processedPages}
              isPro={true}
              currentLanguage={currentLanguage}
              sourceCurrency={metadata.currencySymbol === '£' ? 'GBP' : metadata.currencySymbol === '€' ? 'EUR' : 'USD'}
            />
          </section>
        )}

        {/* How It Works Section */}
        <section id="how-it-works" className="pt-16 border-t border-slate-200 space-y-8 scroll-mt-20">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900">{translate('howItWorks', currentLanguage)}</h2>
            <p className="text-xs text-slate-500">
              Three simple steps to clean, reconciled spreadsheets with zero cloud upload security risks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">{translate('step1Title', currentLanguage)}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {translate('step1Desc', currentLanguage)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">{translate('step2Title', currentLanguage)}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {translate('step2Desc', currentLanguage)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">{translate('step3Title', currentLanguage)}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {translate('step3Desc', currentLanguage)}
              </p>
            </div>
          </div>
        </section>

        {/* Supported Banks Grid Section */}
        <SupportedBanksSection />

        {/* Feature Highlights Grid */}
        <section className="pt-8 space-y-8">
          <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl space-y-8">
            <div className="max-w-2xl space-y-3">
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                PRIVACY BY DESIGN
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                Why Bookkeepers & CPAs Trust LedgerClean
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Traditional PDF converter tools send client bank statements to third-party web servers, exposing sensitive account numbers and personal financial records. LedgerClean eliminates that risk completely.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-4">
              <div className="space-y-2 border-l-2 border-emerald-500 pl-4">
                <h4 className="text-sm font-bold text-white">0% Server Uploads</h4>
                <p className="text-xs text-slate-400">100% WebAssembly browser runtime.</p>
              </div>

              <div className="space-y-2 border-l-2 border-emerald-500 pl-4">
                <h4 className="text-sm font-bold text-white">GLBA & GDPR Compliant</h4>
                <p className="text-xs text-slate-400">Strict regulatory compliance for client data.</p>
              </div>

              <div className="space-y-2 border-l-2 border-emerald-500 pl-4">
                <h4 className="text-sm font-bold text-white">Tesseract.js OCR Worker</h4>
                <p className="text-xs text-slate-400">Processes scanned image PDFs without lag.</p>
              </div>

              <div className="space-y-2 border-l-2 border-emerald-500 pl-4">
                <h4 className="text-sm font-bold text-white">QuickBooks Ready</h4>
                <p className="text-xs text-slate-400">Pre-formatted 3-column CSV generator.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="pt-12 max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500">
              Everything you need to know about LedgerClean and in-browser security.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'How does LedgerClean process PDF files without uploading them to a server?',
                a: 'LedgerClean executes all parsing code directly inside your browser tab using PDF.js and WebAssembly. Your PDF file is read as an ArrayBuffer in local RAM and never transmitted across the internet.'
              },
              {
                q: 'What happens if I convert a scanned paper bank statement?',
                a: 'LedgerClean automatically detects scanned images and initializes an in-browser Tesseract.js Web Worker to perform local Optical Character Recognition (OCR).'
              },
              {
                q: 'How does the Mathematical Reconciliation Engine work?',
                a: 'The engine sums total credit deposits and debit withdrawals against the document opening balance and compares it to the detected closing balance. If there is a discrepancy, unverified rows are highlighted in yellow.'
              },
              {
                q: 'Is LedgerClean really 100% free to use?',
                a: 'Yes! LedgerClean is 100% free for all users with unlimited page conversions and full Excel, QuickBooks, and Xero export capabilities.'
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs sm:text-sm text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      openFaq === idx ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer currentLanguage={currentLanguage} />
    </div>
  );
}
