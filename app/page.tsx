'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { TrustBadges } from '@/components/TrustBadges';
import { Dropzone } from '@/components/Dropzone';
import { ReconciliationBanner } from '@/components/ReconciliationBanner';
import { DataGrid } from '@/components/DataGrid';
import { SupportedBanksSection } from '@/components/SupportedBanksSection';
import { Footer } from '@/components/Footer';
import { PasswordModal } from '@/components/PasswordModal';
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
    const timer = setTimeout(() => {
      import('@/lib/firebase').then(({ initFirebaseMonitoring }) => {
        initFirebaseMonitoring();
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pendingFileInput, setPendingFileInput] = useState<File | File[] | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleFileSelect = async (fileInput: File | File[], password?: string) => {
    setIsProcessing(true);
    setFileError(null);
    setPasswordError(null);
    setTransactions(null);

    const filesArray = Array.isArray(fileInput) ? fileInput : [fileInput];
    const maxPages = 999;

    try {
      let combinedRawTxs: Transaction[] = [];
      let totalPagesAll = 0;
      let primaryMeta: StatementMetadata | null = null;

      for (let idx = 0; idx < filesArray.length; idx++) {
        const file = filesArray[idx];
        const { pages, metadata: pdfMeta } = await parsePdfFile(
          file,
          maxPages,
          (prog) => {
            const overallPercent = Math.round(((idx + prog.percent / 100) / filesArray.length) * 100);
            setProgress({
              stage: prog.stage,
              percent: overallPercent,
              message: `Processing File ${idx + 1} of ${filesArray.length}: ${file.name}`,
            });
          },
          password
        );

        totalPagesAll += pdfMeta.totalPages;
        const { transactions: rawTxs, metadata: tableMeta } = reconstructTableData(pages);

        combinedRawTxs = [...combinedRawTxs, ...rawTxs];

        if (!primaryMeta) {
          primaryMeta = {
            ...pdfMeta,
            openingBalance: tableMeta.openingBalance ?? null,
            closingBalance: tableMeta.closingBalance ?? null,
            bankName: tableMeta.bankName || 'Detected Bank',
          };
        }
      }

      if (!primaryMeta) return;

      const mergedMeta: StatementMetadata = {
        ...primaryMeta,
        filename: filesArray.length === 1 ? filesArray[0].name : `Batch_${filesArray.length}_PDFs_Merged.pdf`,
        totalPages: totalPagesAll,
        processedPages: totalPagesAll,
      };

      setProgress({
        stage: 'reconciling',
        percent: 95,
        message: 'Verifying mathematical reconciliation balance & sorting merged transactions...',
      });

      const { reconciliation: reconRes, reconciledTransactions } = reconcileTransactions(combinedRawTxs, mergedMeta);

      setMetadata(mergedMeta);
      setTransactions(reconciledTransactions);
      setReconciliation(reconRes);
      setIsPasswordModalOpen(false);

      trackEvent('pdf_conversion_success', {
        file_count: filesArray.length,
        page_count: totalPagesAll,
        transaction_count: reconciledTransactions.length,
        bank_name: mergedMeta.bankName,
      });

      setProgress({
        stage: 'complete',
        percent: 100,
        message: `Successfully processed & merged ${filesArray.length} PDF statement(s)!`,
      });
    } catch (err: any) {
      console.error('PDF Conversion error:', err);
      trackEvent('pdf_conversion_failed', {
        error_message: err?.message || 'Unknown parsing error',
        file_name: filesArray[0]?.name || 'unknown.pdf',
        file_size_kb: Math.round((filesArray[0]?.size || 0) / 1024),
      });

      if (err?.message === 'PASSWORD_REQUIRED') {
        setPendingFileInput(fileInput);
        if (password) {
          setPasswordError(translate('incorrectPassword', currentLanguage));
        } else {
          setPasswordError(null);
        }
        setIsPasswordModalOpen(true);
      } else {
        setFileError(translate('failedProcessPdf', currentLanguage));
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

  const faqs = [
    { q: translate('faq1Q', currentLanguage), a: translate('faq1A', currentLanguage) },
    { q: translate('faq2Q', currentLanguage), a: translate('faq2A', currentLanguage) },
    { q: translate('faq3Q', currentLanguage), a: translate('faq3A', currentLanguage) },
    { q: translate('faq4Q', currentLanguage), a: translate('faq4A', currentLanguage) },
  ];

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
            <span>{translate('freeWasmEngine', currentLanguage)}</span>
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

        {/* How It Works & Comprehensive Feature Guide Section */}
        <section id="how-it-works" className="pt-16 border-t border-slate-200 space-y-10 scroll-mt-20">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{translate('howItWorks', currentLanguage)}</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {translate('stepGuideSubtitle', currentLanguage)}
            </p>
          </div>

          {/* 3 Simple Core Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">{translate('step1Title', currentLanguage)}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {translate('step1Desc', currentLanguage)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">{translate('step2Title', currentLanguage)}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {translate('step2Desc', currentLanguage)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">{translate('step3Title', currentLanguage)}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {translate('step3Desc', currentLanguage)}
              </p>
            </div>
          </div>

          {/* Advanced Feature User Manual Grid */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-md space-y-6">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              <span>{translate('advancedFeaturesTitle', currentLanguage)}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-slate-700">
              <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  {translate('batchUploadTitle', currentLanguage)}
                </div>
                <p className="text-slate-600">
                  {translate('batchUploadDesc', currentLanguage)}
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                  {translate('duplicateCleanerTitle', currentLanguage)}
                </div>
                <p className="text-slate-600">
                  {translate('duplicateCleanerDesc', currentLanguage)}
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  {translate('vendorRulesTitle', currentLanguage)}
                </div>
                <p className="text-slate-600">
                  {translate('vendorRulesDesc', currentLanguage)}
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  {translate('dateSplitterTitle', currentLanguage)}
                </div>
                <p className="text-slate-600">
                  {translate('dateSplitterDesc', currentLanguage)}
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  {translate('headerSortingTitle', currentLanguage)}
                </div>
                <p className="text-slate-600">
                  {translate('headerSortingDesc', currentLanguage)}
                </p>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  {translate('rowsPaginationTitle', currentLanguage)}
                </div>
                <p className="text-slate-600">
                  {translate('rowsPaginationDesc', currentLanguage)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Supported Banks Grid Section */}
        <SupportedBanksSection currentLanguage={currentLanguage} />

        {/* Feature Highlights Grid */}
        <section className="pt-8 space-y-8">
          <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl space-y-8">
            <div className="max-w-2xl space-y-3">
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                {translate('privacyDesignTag', currentLanguage)}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                {translate('whyTrustTitle', currentLanguage)}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                {translate('whyTrustDesc', currentLanguage)}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-4">
              <div className="space-y-2 border-l-2 border-emerald-500 pl-4">
                <h4 className="text-sm font-bold text-white">{translate('zeroServerUploads', currentLanguage)}</h4>
                <p className="text-xs text-slate-400">{translate('zeroServerUploadsSub', currentLanguage)}</p>
              </div>

              <div className="space-y-2 border-l-2 border-emerald-500 pl-4">
                <h4 className="text-sm font-bold text-white">{translate('glbaCompliance', currentLanguage)}</h4>
                <p className="text-xs text-slate-400">{translate('glbaComplianceSub', currentLanguage)}</p>
              </div>

              <div className="space-y-2 border-l-2 border-emerald-500 pl-4">
                <h4 className="text-sm font-bold text-white">{translate('batchSupport', currentLanguage)}</h4>
                <p className="text-xs text-slate-400">{translate('batchSupportSub', currentLanguage)}</p>
              </div>

              <div className="space-y-2 border-l-2 border-emerald-500 pl-4">
                <h4 className="text-sm font-bold text-white">{translate('mathBalanced', currentLanguage)}</h4>
                <p className="text-xs text-slate-400">{translate('mathBalancedSub', currentLanguage)}</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="pt-12 max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">{translate('faqTitle', currentLanguage)}</h2>
            <p className="text-xs text-slate-500">
              {translate('faqSubtitle', currentLanguage)}
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
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

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onUnlock={(pass) => {
          if (pendingFileInput) {
            handleFileSelect(pendingFileInput, pass);
          }
        }}
        onCancel={() => {
          setIsPasswordModalOpen(false);
          setPendingFileInput(null);
          setPasswordError(null);
        }}
        filename={Array.isArray(pendingFileInput) ? pendingFileInput[0]?.name : pendingFileInput?.name}
        errorMessage={passwordError}
        currentLanguage={currentLanguage}
      />

      <Footer currentLanguage={currentLanguage} />
    </div>
  );
}
