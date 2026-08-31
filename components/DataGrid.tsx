'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Plus,
  Trash2,
  Search,
  AlertCircle,
  Check,
  FileCode2,
  Sparkles,
  Copy,
  ClipboardCheck,
  CheckCircle2,
  Filter,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { Transaction } from '@/lib/types';
import { STANDARD_CATEGORIES, TransactionCategory } from '@/lib/categorizer';
import {
  generateExcelExport,
  generateQBOExport,
  generateXeroExport,
  saveFile,
  copyToClipboardTSV,
  GeneratedExportFile
} from '@/lib/export-excel';
import { AdBanner } from '@/components/AdBanner';
import { DownloadModal } from '@/components/DownloadModal';

interface DataGridProps {
  transactions: Transaction[];
  onUpdateTransactions: (updated: Transaction[]) => void;
  onOpenPricing: () => void;
  isPartialPreview?: boolean;
  totalPages?: number;
  processedPages?: number;
  isPro?: boolean;
}

export const DataGrid: React.FC<DataGridProps> = ({
  transactions,
  onUpdateTransactions,
  onOpenPricing,
  isPartialPreview,
  totalPages = 2,
  processedPages = 2,
  isPro = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'review'>('all');
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof Transaction } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Download Modal state
  const [activeDownloadModal, setActiveDownloadModal] = useState<{
    isOpen: boolean;
    title: string;
    file: GeneratedExportFile;
  } | null>(null);

  const reviewNeededCount = transactions.filter((tx) => tx.needsReview || tx.isFlagged).length;

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.category && tx.category.toLowerCase().includes(searchTerm.toLowerCase()));

    if (activeTab === 'review') {
      return matchesSearch && (tx.needsReview || tx.isFlagged);
    }
    return matchesSearch;
  });

  const startEditing = (id: string, field: keyof Transaction, currentValue: any) => {
    setEditingCell({ id, field });
    setEditValue(currentValue !== null && currentValue !== undefined ? String(currentValue) : '');
  };

  const saveEdit = () => {
    if (!editingCell) return;

    const updated = transactions.map((tx) => {
      if (tx.id !== editingCell.id) return tx;

      const newTx = { ...tx, isEdited: true };
      const val = editValue.trim();

      if (editingCell.field === 'date') {
        newTx.date = val;
      } else if (editingCell.field === 'description') {
        newTx.description = val;
      } else if (editingCell.field === 'debit') {
        const num = parseFloat(val);
        newTx.debit = !isNaN(num) && num > 0 ? num : null;
        if (newTx.debit !== null) {
          newTx.credit = null;
          newTx.amount = -newTx.debit;
        }
      } else if (editingCell.field === 'credit') {
        const num = parseFloat(val);
        newTx.credit = !isNaN(num) && num > 0 ? num : null;
        if (newTx.credit !== null) {
          newTx.debit = null;
          newTx.amount = newTx.credit;
        }
      } else if (editingCell.field === 'balance') {
        const num = parseFloat(val);
        newTx.balance = !isNaN(num) ? num : null;
      }

      return newTx;
    });

    onUpdateTransactions(updated);
    setEditingCell(null);
  };

  const handleCategoryChange = (id: string, newCategory: string) => {
    const updated = transactions.map((tx) => {
      if (tx.id !== id) return tx;
      return {
        ...tx,
        category: newCategory,
        categoryConfidence: 1.0,
        needsReview: false,
        isEdited: true,
      };
    });
    onUpdateTransactions(updated);
  };

  const approveAllLowConfidenceRows = () => {
    const updated = transactions.map((tx) => ({
      ...tx,
      needsReview: false,
      isFlagged: false,
      categoryConfidence: 1.0,
    }));
    onUpdateTransactions(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const addRow = () => {
    const newTx: Transaction = {
      id: `tx-custom-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US'),
      description: 'Manual Transaction Entry',
      debit: null,
      credit: 100.0,
      amount: 100.0,
      balance: null,
      category: 'Software & SaaS',
      categoryConfidence: 1.0,
      needsReview: false,
      isEdited: true,
    };
    onUpdateTransactions([newTx, ...transactions]);
  };

  const deleteRow = (id: string) => {
    onUpdateTransactions(transactions.filter((tx) => tx.id !== id));
  };

  const handleCopyClipboard = async () => {
    const success = await copyToClipboardTSV(transactions);
    if (success) {
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    }
  };

  const handleExcelClick = async () => {
    const file = await generateExcelExport(transactions);
    saveFile(file.dataUrl, file.filename);
    setActiveDownloadModal({
      isOpen: true,
      title: 'Export to Microsoft Excel (.xlsx)',
      file,
    });
  };

  const handleQBOClick = () => {
    const file = generateQBOExport(transactions);
    saveFile(file.dataUrl, file.filename);
    setActiveDownloadModal({
      isOpen: true,
      title: 'Export to QuickBooks Online (CSV)',
      file,
    });
  };

  const handleXeroClick = () => {
    const file = generateXeroExport(transactions);
    saveFile(file.dataUrl, file.filename);
    setActiveDownloadModal({
      isOpen: true,
      title: 'Export to Xero Accounting (CSV)',
      file,
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
      {/* Partial Paywall Preview Banner */}
      {isPartialPreview && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-500/10 p-4 text-amber-950">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                Live 2-Page Free Preview (Showing {processedPages} of {totalPages} pages)
              </p>
              <p className="text-xs text-amber-800">
                Unlock remaining {totalPages - processedPages} pages with a 24-Hour Pass or Pro Plan.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenPricing}
            className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition-colors"
          >
            Unlock All {totalPages} Pages for $9.99
          </button>
        </div>
      )}

      {/* Categorization & Pre-Export Review Filter Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-900 p-4 text-white shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-bold">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight">Auto-Categorization & Pre-Export Review</h3>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                100% Client-Side
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Review flagged row categories before exporting to QuickBooks or Excel.
            </p>
          </div>
        </div>

        {/* Filter Tabs & Approve All Action */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center rounded-lg border border-slate-700 bg-slate-800 p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`rounded px-3 py-1 text-xs font-bold transition-colors ${
                activeTab === 'all' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-bold transition-colors ${
                activeTab === 'review'
                  ? 'bg-amber-500 text-slate-950'
                  : reviewNeededCount > 0
                  ? 'text-amber-400 hover:text-amber-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Review Needed</span>
              {reviewNeededCount > 0 && (
                <span className="rounded-full bg-amber-400/20 px-1.5 py-0.2 text-[10px] text-amber-300 font-extrabold">
                  {reviewNeededCount}
                </span>
              )}
            </button>
          </div>

          {reviewNeededCount > 0 && (
            <button
              onClick={approveAllLowConfidenceRows}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-600/30 transition-colors"
              title="Confirm category and math accuracy for all rows"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Approve All ({reviewNeededCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Bar: Search & Export buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        
        {/* Search & Add Row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search description, category, date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            onClick={addRow}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Row</span>
          </button>
        </div>

        {/* Export & Copy Actions */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Copy to Clipboard */}
          <button
            onClick={handleCopyClipboard}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
              copiedToClipboard
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                : 'border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100'
            }`}
            title="Copy TSV format to paste directly into Excel or Google Sheets"
          >
            {copiedToClipboard ? (
              <>
                <ClipboardCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-600" />
                <span>Copy for Excel / Sheets</span>
              </>
            )}
          </button>

          {/* Download Excel (.xlsx) */}
          <button
            onClick={handleExcelClick}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-all active:scale-95"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Download Excel (.xlsx)</span>
          </button>

          {/* Download QuickBooks CSV */}
          <button
            onClick={handleQBOClick}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors active:scale-95"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" />
            <span>QuickBooks CSV</span>
          </button>

          {/* Download Xero CSV */}
          <button
            onClick={handleXeroClick}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors active:scale-95"
          >
            <FileCode2 className="h-3.5 w-3.5 text-slate-600" />
            <span>Xero CSV</span>
          </button>

        </div>
      </div>

      {/* Optional Ad Banner for Free Tier Users */}
      <AdBanner isPro={isPro} onOpenPricing={onOpenPricing} />

      {/* Spreadsheet Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100/80 text-slate-800 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-3 w-10 text-center">#</th>
              <th className="py-3 px-4 w-28">Date</th>
              <th className="py-3 px-4 min-w-[220px]">Description</th>
              <th className="py-3 px-4 w-44">Category</th>
              <th className="py-3 px-4 w-28 text-right">Withdrawal</th>
              <th className="py-3 px-4 w-28 text-right">Deposit</th>
              <th className="py-3 px-4 w-28 text-right">Balance</th>
              <th className="py-3 px-4 w-28 text-center">Status</th>
              <th className="py-3 px-3 w-12 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 font-sans">
                  No transactions found matching search filter.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx, idx) => {
                const isReviewNeeded = tx.needsReview || tx.isFlagged;
                return (
                  <tr
                    key={tx.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isReviewNeeded ? 'bg-amber-50/60 border-l-4 border-l-amber-500' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center text-slate-400 font-sans">{idx + 1}</td>

                    {/* Date Cell */}
                    <td
                      onClick={() => startEditing(tx.id, 'date', tx.date)}
                      className="py-2.5 px-4 cursor-pointer hover:bg-slate-100 font-medium text-slate-900"
                    >
                      {editingCell?.id === tx.id && editingCell?.field === 'date' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className="w-full rounded border border-emerald-500 px-1 py-0.5 font-mono text-xs focus:outline-none"
                        />
                      ) : (
                        <span>{tx.date}</span>
                      )}
                    </td>

                    {/* Description Cell */}
                    <td
                      onClick={() => startEditing(tx.id, 'description', tx.description)}
                      className="py-2.5 px-4 cursor-pointer hover:bg-slate-100 font-sans text-slate-800"
                    >
                      {editingCell?.id === tx.id && editingCell?.field === 'description' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className="w-full rounded border border-emerald-500 px-1 py-0.5 font-sans text-xs focus:outline-none"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span>{tx.description}</span>
                          {tx.isEdited && (
                            <span className="text-[10px] text-amber-600 font-semibold">(edited)</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Category Cell with Interactive Dropdown Selector */}
                    <td className="py-2.5 px-4 font-sans">
                      <select
                        value={tx.category || 'Uncategorized / Review'}
                        onChange={(e) => handleCategoryChange(tx.id, e.target.value)}
                        className={`w-full rounded border px-2 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                          tx.category === 'Uncategorized / Review' || tx.needsReview
                            ? 'border-amber-400 bg-amber-100/60 text-amber-900'
                            : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-emerald-500'
                        }`}
                      >
                        {STANDARD_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Withdrawal Cell */}
                    <td
                      onClick={() => startEditing(tx.id, 'debit', tx.debit)}
                      className="py-2.5 px-4 text-right cursor-pointer hover:bg-slate-100 text-rose-600 font-semibold"
                    >
                      {editingCell?.id === tx.id && editingCell?.field === 'debit' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className="w-full rounded border border-emerald-500 px-1 py-0.5 text-right font-mono text-xs focus:outline-none"
                        />
                      ) : tx.debit !== null ? (
                        `$${tx.debit.toFixed(2)}`
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* Deposit Cell */}
                    <td
                      onClick={() => startEditing(tx.id, 'credit', tx.credit)}
                      className="py-2.5 px-4 text-right cursor-pointer hover:bg-slate-100 text-emerald-600 font-semibold"
                    >
                      {editingCell?.id === tx.id && editingCell?.field === 'credit' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className="w-full rounded border border-emerald-500 px-1 py-0.5 text-right font-mono text-xs focus:outline-none"
                        />
                      ) : tx.credit !== null ? (
                        `$${tx.credit.toFixed(2)}`
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* Balance Cell */}
                    <td
                      onClick={() => startEditing(tx.id, 'balance', tx.balance)}
                      className="py-2.5 px-4 text-right cursor-pointer hover:bg-slate-100 text-slate-900 font-bold"
                    >
                      {editingCell?.id === tx.id && editingCell?.field === 'balance' ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className="w-full rounded border border-emerald-500 px-1 py-0.5 text-right font-mono text-xs focus:outline-none"
                        />
                      ) : tx.balance !== null ? (
                        `$${tx.balance.toFixed(2)}`
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* Status / Review Tag */}
                    <td className="py-2.5 px-4 text-center font-sans">
                      {isReviewNeeded ? (
                        <span
                          className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 cursor-pointer"
                          title={tx.reviewReason || tx.flagReason || 'Uncategorized merchant review'}
                        >
                          <AlertCircle className="h-3 w-3 text-amber-600" />
                          Review Needed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          <Check className="h-3 w-3 text-emerald-600" />
                          Verified
                        </span>
                      )}
                    </td>

                    {/* Delete Action */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => deleteRow(tx.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete row"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-slate-400 text-right font-sans">
        💡 Use the Category dropdown to reassign transaction accounts. Click &quot;Approve All&quot; to confirm low-confidence rows before export.
      </p>

      {/* Download Modal Triggered On Export Click */}
      {activeDownloadModal && (
        <DownloadModal
          isOpen={activeDownloadModal.isOpen}
          onClose={() => setActiveDownloadModal(null)}
          title={activeDownloadModal.title}
          filename={activeDownloadModal.file.filename}
          blob={activeDownloadModal.file.blob}
          downloadUrl={activeDownloadModal.file.dataUrl}
          textContent={activeDownloadModal.file.textContent}
        />
      )}
    </div>
  );
};
