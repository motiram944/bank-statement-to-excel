'use client';

import React, { useState, useEffect } from 'react';
import { BankConfig, Transaction, StatementMetadata, ReconciliationResult, ProcessingProgress, LicenseState } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { TrustBadges } from '@/components/TrustBadges';
import { Dropzone } from '@/components/Dropzone';
import { ReconciliationBanner } from '@/components/ReconciliationBanner';
import { DataGrid } from '@/components/DataGrid';
import { SupportedBanksSection } from '@/components/SupportedBanksSection';
import { PricingModal } from '@/components/PricingModal';
import { Footer } from '@/components/Footer';
import { parsePdfFile } from '@/lib/pdf-parser';
import { reconstructTableData } from '@/lib/table-reconstruction';
import { reconcileTransactions } from '@/lib/reconciliation';
import { getLicenseState } from '@/lib/licensing';
import { getDemoStatementData } from '@/lib/demo-data';
import { Sparkles, Star, ShieldCheck, CheckCircle2, ChevronDown } from 'lucide-react';

interface BankConverterClientProps {
  bankConfig: BankConfig;
}

export const BankConverterClient: React.FC<BankConverterClientProps> = ({ bankConfig }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress>({
    stage: 'idle',
    percent: 0,
    message: '',
  });

  const [transactions, setTransactions] = useState<Transaction[] | null>(null);
  const [metadata, setMetadata] = useState<StatementMetadata | null>(null);
  const [reconciliation, setReconciliation] = useState<ReconciliationResult | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [license, setLicense] = useState<LicenseState>({ isPro: false, passActive: false, licenseKey: null, passExpiresAt: null });
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    setLicense(getLicenseState());
  }, []);

  const handleFileSelect = async (file: File, password?: string) => {
    setIsProcessing(true);
    setFileError(null);
    setTransactions(null);

    const maxPages = license.passActive || license.isPro ? 999 : 2;

    try {
      const { pages, metadata: pdfMeta } = await parsePdfFile(file, maxPages, (prog) => {
        setProgress(prog);
      }, password);

      setProgress({
        stage: 'parsing_tables',
        percent: 85,
        message: `Parsing ${bankConfig.shortName} table layout & columns...`,
      });

      const { transactions: rawTxs, metadata: tableMeta } = reconstructTableData(pages);

      const mergedMeta: StatementMetadata = {
        ...pdfMeta,
        openingBalance: tableMeta.openingBalance ?? null,
        closingBalance: tableMeta.closingBalance ?? null,
        bankName: bankConfig.name,
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

      setProgress({
        stage: 'complete',
        percent: 100,
        message: 'Conversion completed successfully!',
      });
    } catch (err: any) {
      console.error('PDF Conversion error:', err);
      if (err?.message === 'PASSWORD_REQUIRED') {
        const enteredPass = window.prompt(`🔐 This ${bankConfig.shortName} PDF statement is password-protected. Please enter password:`);
        if (enteredPass) {
          return handleFileSelect(file, enteredPass);
        } else {
          setFileError('Password required to open encrypted PDF bank statement.');
        }
      } else {
        setFileError(`Failed to process ${bankConfig.shortName} statement.`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadDemo = () => {
    const demo = getDemoStatementData();
    demo.metadata.bankName = bankConfig.name;
    setMetadata(demo.metadata);
    setTransactions(demo.transactions);
    setReconciliation(demo.reconciliation);
  };

  const handleUpdateTransactions = (updated: Transaction[]) => {
    setTransactions(updated);
    if (metadata) {
      const { reconciliation: reconRes, reconciledTransactions } = reconcileTransactions(updated, metadata);
      setReconciliation(reconRes);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onOpenPricing={() => setIsPricingOpen(true)} />

      <main className="flex-1 space-y-12 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Bank-Specific Hero Header */}
        <section className="text-center space-y-4 max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-800 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Pre-Calibrated for {bankConfig.name} ({bankConfig.currency})</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {bankConfig.h1Title}
          </h1>

          <p className="text-base text-slate-600 leading-relaxed">
            Extract checking, savings, and credit card transactions from {bankConfig.shortName} PDF statements directly in your browser tab with 0% server upload privacy guarantee.
          </p>
        </section>

        {/* Trust Badges */}
        <TrustBadges />

        {/* Dropzone Converter Engine */}
        <Dropzone
          onFileSelect={handleFileSelect}
          onLoadSample={handleLoadDemo}
          progress={progress}
          isProcessing={isProcessing}
          fileError={fileError}
        />

        {/* Conversion Results Area */}
        {transactions && reconciliation && metadata && (
          <section className="space-y-6 pt-6 animate-fadeIn">
            <ReconciliationBanner reconciliation={reconciliation} />
            <DataGrid
              transactions={transactions}
              onUpdateTransactions={handleUpdateTransactions}
              onOpenPricing={() => setIsPricingOpen(true)}
              isPartialPreview={metadata.totalPages > metadata.processedPages && !license.passActive && !license.isPro}
              totalPages={metadata.totalPages}
              processedPages={metadata.processedPages}
              isPro={license.isPro || license.passActive}
            />
          </section>
        )}

        {/* How It Works Section (id="how-it-works") */}
        <section id="how-it-works" className="pt-16 border-t border-slate-200 space-y-8 scroll-mt-20">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900">How {bankConfig.shortName} Statement Conversion Works</h2>
            <p className="text-xs text-slate-500">
              Three simple steps to clean, reconciled spreadsheets with zero cloud upload security risks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Local PDF Extraction</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your browser parses {bankConfig.shortName} PDF vectors directly via PDF.js or runs Tesseract.js OCR in a local Web Worker for scanned paper statements.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Math Reconciliation Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calculates <span className="font-mono text-slate-800">Opening + Credits - Debits = Ending</span>. Automatically flags any row discrepancies in yellow.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Export Excel & QBO CSV</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Double-click to edit any cell in the live grid, then export formatted Excel (.xlsx), QuickBooks Online CSV, or Xero CSV files.
              </p>
            </div>
          </div>
        </section>

        {/* Bank Sample Table Preview */}
        <section className="pt-8 space-y-4">
          <div className="text-center space-y-1 max-w-lg mx-auto">
            <h3 className="text-lg font-bold text-slate-900">
              Sample {bankConfig.shortName} Format Extracted
            </h3>
            <p className="text-xs text-slate-500">
              Pre-tested layout reconstruction for {bankConfig.name} statements.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm max-w-4xl mx-auto">
            <table className="w-full text-left text-xs font-mono text-slate-700">
              <thead className="bg-slate-100 uppercase font-semibold text-slate-800">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Description</th>
                  <th className="p-2.5 text-right">Debit</th>
                  <th className="p-2.5 text-right">Credit</th>
                  <th className="p-2.5 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bankConfig.sampleFormat.map((row, i) => (
                  <tr key={i}>
                    <td className="p-2.5 font-bold text-slate-900">{row.date}</td>
                    <td className="p-2.5 font-sans">{row.description}</td>
                    <td className="p-2.5 text-right text-rose-600 font-semibold">{row.debit || '-'}</td>
                    <td className="p-2.5 text-right text-emerald-600 font-semibold">{row.credit || '-'}</td>
                    <td className="p-2.5 text-right font-bold">{row.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Other Supported Banks Section (id="supported-banks") */}
        <SupportedBanksSection />

        {/* Customer Reviews Section */}
        {bankConfig.reviews && bankConfig.reviews.length > 0 && (
          <section className="pt-8 space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-slate-900">Verified Bookkeeper & CPA Reviews</h3>
              <p className="text-xs text-slate-500">See how professionals convert {bankConfig.shortName} statements with zero privacy risk.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {bankConfig.reviews.map((rev, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic">"{rev.text}"</p>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{rev.name}</h4>
                    <p className="text-[11px] text-slate-500">{rev.role} &bull; {rev.company}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bank FAQ Accordion */}
        <section className="pt-8 max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-slate-900">{bankConfig.shortName} Statement FAQs</h3>
          </div>

          <div className="space-y-3">
            {bankConfig.faqs.map((faq, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs sm:text-sm text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      openFaq === idx ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onLicenseActivated={() => setLicense(getLicenseState())}
      />
    </div>
  );
};
