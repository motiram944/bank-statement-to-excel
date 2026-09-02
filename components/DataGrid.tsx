'use client';

import React, { useState, useEffect } from 'react';
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
  Tag,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Scissors
} from 'lucide-react';
import { Transaction } from '@/lib/types';
import { STANDARD_CATEGORIES } from '@/lib/categorizer';
import { SUPPORTED_CURRENCIES, convertCurrency, formatCurrency } from '@/lib/currency';
import { SupportedLanguage, translate } from '@/lib/i18n';
import {
  generateExcelExport,
  generateQBOExport,
  generateXeroExport,
  saveFile,
  copyToClipboardTSV,
  GeneratedExportFile
} from '@/lib/export-excel';
import { DownloadModal } from '@/components/DownloadModal';
import { trackEvent } from '@/lib/firebase';

interface DataGridProps {
  transactions: Transaction[];
  onUpdateTransactions: (updated: Transaction[]) => void;
  onOpenPricing?: () => void;
  isPartialPreview?: boolean;
  totalPages?: number;
  processedPages?: number;
  isPro?: boolean;
  currentLanguage?: SupportedLanguage;
  sourceCurrency?: string;
}

type SortField = 'date' | 'description' | 'category' | 'debit' | 'credit' | 'balance' | 'amount';
type SortOrder = 'asc' | 'desc';

export const DataGrid: React.FC<DataGridProps> = ({
  transactions,
  onUpdateTransactions,
  currentLanguage = 'en',
  sourceCurrency = 'USD',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'review'>('all');
  const [targetCurrency, setTargetCurrency] = useState<string>(sourceCurrency || 'USD');
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof Transaction } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Date Range Splitter & Filter states
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Column Sorting states
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(15);

  // Download Modal state
  const [activeDownloadModal, setActiveDownloadModal] = useState<{
    isOpen: boolean;
    title: string;
    file: GeneratedExportFile;
  } | null>(null);

  const lang = currentLanguage;
  const reviewNeededCount = transactions.filter((tx) => tx.needsReview || tx.isFlagged).length;

  // Helper to parse dates into timestamp for filtering & sorting
  const parseDateToMs = (dateStr: string): number => {
    if (!dateStr) return 0;
    const parts = dateStr.split(/[\/\.-]/);
    if (parts.length === 3) {
      // Check if MM/DD/YYYY or YYYY-MM-DD
      if (parts[0].length === 4) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
      } else {
        return new Date(Number(parts[2]), Number(parts[0]) - 1, Number(parts[1])).getTime();
      }
    }
    const parsed = Date.parse(dateStr);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Filter transactions by Search, Tab, and Date Range Splitter
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.category && tx.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTab = activeTab === 'review' ? (tx.needsReview || tx.isFlagged) : true;

    // Date Range Filter
    let matchesDate = true;
    if (startDate || endDate) {
      const txMs = parseDateToMs(tx.date);
      if (startDate) {
        const startMs = new Date(startDate).getTime();
        if (txMs < startMs) matchesDate = false;
      }
      if (endDate) {
        const endMs = new Date(endDate).getTime() + 86400000; // inclusive end of day
        if (txMs > endMs) matchesDate = false;
      }
    }

    return matchesSearch && matchesTab && matchesDate;
  });

  // Sort Filtered Transactions by Column Header
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (!sortField) return 0;

    let valA: any = a[sortField];
    let valB: any = b[sortField];

    if (sortField === 'date') {
      valA = parseDateToMs(a.date);
      valB = parseDateToMs(b.date);
    } else if (sortField === 'debit' || sortField === 'credit' || sortField === 'balance' || sortField === 'amount') {
      valA = valA !== null && valA !== undefined ? valA : -Infinity;
      valB = valB !== null && valB !== undefined ? valB : -Infinity;
    } else if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = (valB || '').toLowerCase();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab, startDate, endDate, rowsPerPage, sortField, sortOrder]);

  const totalFilteredCount = sortedTransactions.length;
  const totalGridPages = Math.max(1, Math.ceil(totalFilteredCount / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalFilteredCount);

  const getConvertedTx = (tx: Transaction): Transaction => {
    if (targetCurrency === sourceCurrency) return tx;

    const convDebit = convertCurrency(tx.debit, sourceCurrency, targetCurrency);
    const convCredit = convertCurrency(tx.credit, sourceCurrency, targetCurrency);
    const convAmount = convertCurrency(tx.amount, sourceCurrency, targetCurrency) || 0;
    const convBalance = convertCurrency(tx.balance, sourceCurrency, targetCurrency);

    return {
      ...tx,
      debit: convDebit,
      credit: convCredit,
      amount: convAmount,
      balance: convBalance,
    };
  };

  const displayTransactions = sortedTransactions.map(getConvertedTx);
  const paginatedTransactions = displayTransactions.slice(startIndex, endIndex);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortField(null);
        setSortOrder('asc');
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const setQuarterPreset = (quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'all') => {
    if (quarter === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (quarter === 'Q1') {
      setStartDate('2026-01-01');
      setEndDate('2026-03-31');
    } else if (quarter === 'Q2') {
      setStartDate('2026-04-01');
      setEndDate('2026-06-30');
    } else if (quarter === 'Q3') {
      setStartDate('2026-07-01');
      setEndDate('2026-09-30');
    } else if (quarter === 'Q4') {
      setStartDate('2026-10-01');
      setEndDate('2026-12-31');
    }
  };

  const handleCurrencyChange = (newCurrency: string) => {
    const prev = targetCurrency;
    setTargetCurrency(newCurrency);
    trackEvent('currency_changed', { from_currency: prev, to_currency: newCurrency });
  };

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
    trackEvent('category_changed', { new_category: newCategory });
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
    trackEvent('approve_all_clicked', { count: reviewNeededCount });
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
    trackEvent('transaction_row_added');
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
    trackEvent('transaction_row_deleted');
    onUpdateTransactions(transactions.filter((tx) => tx.id !== id));
  };

  // Export respects active date range & column sorting
  const exportTxs = sortedTransactions.map(getConvertedTx);

  const handleCopyClipboard = async () => {
    trackEvent('copy_clipboard_tsv', { target_currency: targetCurrency, tx_count: exportTxs.length });
    const success = await copyToClipboardTSV(exportTxs, lang);
    if (success) {
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    }
  };

  const handleExcelClick = async () => {
    trackEvent('export_excel', { target_currency: targetCurrency, tx_count: exportTxs.length });
    const file = await generateExcelExport(exportTxs, 'bank_statement_converted.xlsx', lang);
    saveFile(file.dataUrl, file.filename);
    setActiveDownloadModal({
      isOpen: true,
      title: `${translate('downloadExcel', lang)} (${targetCurrency})`,
      file,
    });
  };

  const handleQBOClick = () => {
    trackEvent('export_quickbooks', { target_currency: targetCurrency, tx_count: exportTxs.length });
    const file = generateQBOExport(exportTxs);
    saveFile(file.dataUrl, file.filename);
    setActiveDownloadModal({
      isOpen: true,
      title: `${translate('quickbooksCSV', lang)} (${targetCurrency})`,
      file,
    });
  };

  const handleXeroClick = () => {
    trackEvent('export_xero', { target_currency: targetCurrency, tx_count: exportTxs.length });
    const file = generateXeroExport(exportTxs);
    saveFile(file.dataUrl, file.filename);
    setActiveDownloadModal({
      isOpen: true,
      title: `${translate('xeroCSV', lang)} (${targetCurrency})`,
      file,
    });
  };

  const renderSortHeader = (field: SortField, label: string, className: string = '') => {
    const isSorted = sortField === field;
    return (
      <th
        onClick={() => handleSort(field)}
        className={`py-3 px-4 cursor-pointer hover:bg-slate-200/80 transition-colors select-none group ${className}`}
      >
        <div className="flex items-center gap-1.5 justify-inherit">
          <span>{label}</span>
          <span className="text-slate-400 group-hover:text-slate-800">
            {isSorted ? (
              sortOrder === 'asc' ? (
                <ArrowUp className="h-3.5 w-3.5 text-emerald-600 font-bold" />
              ) : (
                <ArrowDown className="h-3.5 w-3.5 text-emerald-600 font-bold" />
              )
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-40 group-hover:opacity-100" />
            )}
          </span>
        </div>
      </th>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
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
                100% Free & Private
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
              {translate('allTransactions', lang)} ({transactions.length})
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
              <span>{translate('reviewNeeded', lang)}</span>
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
              <span>{translate('approveAll', lang)} ({reviewNeededCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Date Range Splitter & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-100/90 p-3 shadow-xs text-xs text-slate-700">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Scissors className="h-4 w-4 text-emerald-600" />
            <span>Date Range Splitter:</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded border border-slate-300 bg-white px-2 py-1 font-sans text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded border border-slate-300 bg-white px-2 py-1 font-sans text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {(startDate || endDate) && (
            <button
              onClick={() => setQuarterPreset('all')}
              className="text-xs font-bold text-rose-600 hover:underline px-1"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Quick Quarter Splitter Presets */}
        <div className="flex items-center gap-1">
          <span className="text-slate-500 font-medium hidden sm:inline">Quarter Presets:</span>
          <button
            onClick={() => setQuarterPreset('all')}
            className={`rounded px-2.5 py-1 text-xs font-bold transition-colors ${
              !startDate && !endDate ? 'bg-slate-800 text-white' : 'bg-white border border-slate-300 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setQuarterPreset('Q1')}
            className={`rounded px-2.5 py-1 text-xs font-bold transition-colors ${
              startDate === '2026-01-01' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 hover:bg-slate-200'
            }`}
          >
            Q1
          </button>
          <button
            onClick={() => setQuarterPreset('Q2')}
            className={`rounded px-2.5 py-1 text-xs font-bold transition-colors ${
              startDate === '2026-04-01' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 hover:bg-slate-200'
            }`}
          >
            Q2
          </button>
          <button
            onClick={() => setQuarterPreset('Q3')}
            className={`rounded px-2.5 py-1 text-xs font-bold transition-colors ${
              startDate === '2026-07-01' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 hover:bg-slate-200'
            }`}
          >
            Q3
          </button>
          <button
            onClick={() => setQuarterPreset('Q4')}
            className={`rounded px-2.5 py-1 text-xs font-bold transition-colors ${
              startDate === '2026-10-01' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 hover:bg-slate-200'
            }`}
          >
            Q4
          </button>
        </div>
      </div>

      {/* Control Bar: Multi-Currency Dropdown, Search & Export buttons */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        
        {/* Search, Add Row & Target Currency Selector */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Target Currency Selector */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-800">
            <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-slate-500 hidden sm:inline">{translate('displayCurrency', lang)}:</span>
            <select
              value={targetCurrency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="bg-transparent font-bold focus:outline-none cursor-pointer text-slate-900"
            >
              {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={translate('searchPlaceholder', lang)}
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
            <span>{translate('addRow', lang)}</span>
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
                <span>{translate('copiedClipboard', lang)}</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-600" />
                <span>{translate('copyClipboard', lang)}</span>
              </>
            )}
          </button>

          {/* Download Excel (.xlsx) */}
          <button
            onClick={handleExcelClick}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-all active:scale-95"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>{translate('downloadExcel', lang)}</span>
          </button>

          {/* Download QuickBooks CSV */}
          <button
            onClick={handleQBOClick}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors active:scale-95"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" />
            <span>{translate('quickbooksCSV', lang)}</span>
          </button>

          {/* Download Xero CSV */}
          <button
            onClick={handleXeroClick}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors active:scale-95"
          >
            <FileCode2 className="h-3.5 w-3.5 text-slate-600" />
            <span>{translate('xeroCSV', lang)}</span>
          </button>

        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100/80 text-slate-800 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-3 w-10 text-center">#</th>
              {renderSortHeader('date', translate('colDate', lang), 'w-28')}
              {renderSortHeader('description', translate('colDescription', lang), 'min-w-[220px]')}
              {renderSortHeader('category', translate('colCategory', lang), 'w-44')}
              {renderSortHeader('debit', translate('colWithdrawal', lang), 'w-28 text-right')}
              {renderSortHeader('credit', translate('colDeposit', lang), 'w-28 text-right')}
              {renderSortHeader('balance', translate('colBalance', lang), 'w-28 text-right')}
              <th className="py-3 px-4 w-28 text-center">{translate('colStatus', lang)}</th>
              <th className="py-3 px-3 w-12 text-center">{translate('colAction', lang)}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono">
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 font-sans">
                  No transactions found matching search or date range filter.
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((tx, pIdx) => {
                const globalIndex = startIndex + pIdx;
                const origTx = sortedTransactions[globalIndex];
                const isReviewNeeded = origTx?.needsReview || origTx?.isFlagged;
                return (
                  <tr
                    key={tx.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isReviewNeeded ? 'bg-amber-50/60 border-l-4 border-l-amber-500' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center text-slate-400 font-sans">{globalIndex + 1}</td>

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

                    {/* Category Cell */}
                    <td className="py-2.5 px-4 font-sans">
                      <select
                        value={tx.category || 'Uncategorized / Review'}
                        onChange={(e) => handleCategoryChange(tx.id, e.target.value)}
                        className={`w-full rounded border px-2 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                          tx.category === 'Uncategorized / Review' || origTx?.needsReview
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
                      onClick={() => startEditing(tx.id, 'debit', origTx?.debit)}
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
                        formatCurrency(tx.debit, targetCurrency)
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* Deposit Cell */}
                    <td
                      onClick={() => startEditing(tx.id, 'credit', origTx?.credit)}
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
                        formatCurrency(tx.credit, targetCurrency)
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* Balance Cell */}
                    <td
                      onClick={() => startEditing(tx.id, 'balance', origTx?.balance)}
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
                        formatCurrency(tx.balance, targetCurrency)
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* Status / Review Tag */}
                    <td className="py-2.5 px-4 text-center font-sans">
                      {isReviewNeeded ? (
                        <span
                          className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 cursor-pointer"
                          title={origTx?.reviewReason || origTx?.flagReason || 'Uncategorized merchant review'}
                        >
                          <AlertCircle className="h-3 w-3 text-amber-600" />
                          {translate('reviewNeededBadge', lang)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          <Check className="h-3 w-3 text-emerald-600" />
                          {translate('verifiedBadge', lang)}
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

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-slate-900">{totalFilteredCount > 0 ? startIndex + 1 : 0}</strong> to{' '}
              <strong className="text-slate-900">{endIndex}</strong> of <strong className="text-slate-900">{totalFilteredCount}</strong> transactions
            </span>
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium hidden sm:inline">Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded px-2 py-1 font-bold text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={1000}>All (1000+)</option>
              </select>
            </div>
          </div>

          {/* Page Jump & Navigation Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="First Page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="px-3 font-semibold text-slate-800">
              Page {currentPage} of {totalGridPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalGridPages, p + 1))}
              disabled={currentPage === totalGridPages}
              className="p-1.5 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalGridPages)}
              disabled={currentPage === totalGridPages}
              className="p-1.5 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Last Page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 text-right font-sans">
        💡 Date Splitter & Column Sort Active: Click column headers to sort. Exports preserve active date range & column sort order.
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
