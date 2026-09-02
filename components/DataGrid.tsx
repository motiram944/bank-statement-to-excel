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
  Scissors,
  CopyCheck,
  Settings,
  X,
  Sliders
} from 'lucide-react';
import { Transaction } from '@/lib/types';
import {
  STANDARD_CATEGORIES,
  TransactionCategory,
  CustomVendorRule,
  getCustomVendorRules,
  addCustomVendorRule,
  deleteCustomVendorRule,
  categorizeTransaction
} from '@/lib/categorizer';
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

  // Custom Vendor Rules Modal state
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [customRules, setCustomRules] = useState<CustomVendorRule[]>([]);
  const [newRuleKeyword, setNewRuleKeyword] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState<TransactionCategory>('Software & SaaS');

  // Download Modal state
  const [activeDownloadModal, setActiveDownloadModal] = useState<{
    isOpen: boolean;
    title: string;
    file: GeneratedExportFile;
  } | null>(null);

  const lang = currentLanguage;

  useEffect(() => {
    setCustomRules(getCustomVendorRules());
  }, []);

  // Detect Duplicate Transactions (Matching Date + Description + Amount)
  const duplicateIds = new Set<string>();
  const txSeenMap = new Map<string, string>();

  transactions.forEach((tx) => {
    const key = `${tx.date.trim()}||${tx.description.toLowerCase().trim()}||${tx.amount.toFixed(2)}`;
    if (txSeenMap.has(key)) {
      duplicateIds.add(tx.id);
      duplicateIds.add(txSeenMap.get(key)!);
    } else {
      txSeenMap.set(key, tx.id);
    }
  });

  const duplicateCount = duplicateIds.size;
  const reviewNeededCount = transactions.filter((tx) => tx.needsReview || tx.isFlagged).length;

  const removeAllDuplicates = () => {
    trackEvent('remove_duplicates_clicked', { count: duplicateCount });
    const cleaned = transactions.filter((tx) => !duplicateIds.has(tx.id));
    onUpdateTransactions(cleaned);
  };

  const handleSaveCustomRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleKeyword.trim()) return;

    const updatedRules = addCustomVendorRule(newRuleKeyword, newRuleCategory);
    setCustomRules(updatedRules);
    setNewRuleKeyword('');

    // Re-apply rules to current transactions
    const reCategorized = transactions.map((tx) => {
      const result = categorizeTransaction(tx.description, tx.amount);
      if (result.isCustomRule || tx.category === 'Uncategorized / Review') {
        return {
          ...tx,
          category: result.category,
          categoryConfidence: result.confidence,
          needsReview: result.needsReview,
        };
      }
      return tx;
    });

    onUpdateTransactions(reCategorized);
  };

  const handleDeleteCustomRule = (id: string) => {
    const updated = deleteCustomVendorRule(id);
    setCustomRules(updated);
  };

  // Helper to parse dates into timestamp for filtering & sorting
  const parseDateToMs = (dateStr: string): number => {
    if (!dateStr) return 0;
    const parts = dateStr.split(/[\/\.-]/);
    if (parts.length === 3) {
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
        const endMs = new Date(endDate).getTime() + 86400000;
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
      {/* Categorization, Duplicate Detection & Custom Rules Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-900 p-4 text-white shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-bold">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold tracking-tight">Auto-Categorization & Duplicate Detection Engine</h3>
              {duplicateCount > 0 && (
                <span className="text-[10px] font-extrabold bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded border border-purple-400/40 flex items-center gap-1">
                  <CopyCheck className="h-3 w-3" />
                  {duplicateCount} Duplicates Detected
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300">
              Review flagged categories or configure custom vendor auto-tagging rules.
            </p>
          </div>
        </div>

        {/* Action Buttons: Remove Duplicates, Custom Vendor Rules & Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
          {duplicateCount > 0 && (
            <button
              onClick={removeAllDuplicates}
              className="flex items-center gap-1.5 rounded-lg border border-purple-400/40 bg-purple-600/30 px-3 py-1.5 text-xs font-bold text-purple-200 hover:bg-purple-600/50 transition-colors"
              title="Remove duplicate transactions matching date, description and amount"
            >
              <Trash2 className="h-3.5 w-3.5 text-purple-300" />
              <span>Clean Duplicates ({duplicateCount})</span>
            </button>
          )}

          <button
            onClick={() => setIsRuleModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <Sliders className="h-3.5 w-3.5 text-emerald-400" />
            <span>Manage Vendor Rules ({customRules.length})</span>
          </button>

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
                const isDuplicate = duplicateIds.has(tx.id);

                return (
                  <tr
                    key={tx.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isDuplicate
                        ? 'bg-purple-50/70 border-l-4 border-l-purple-500'
                        : isReviewNeeded
                        ? 'bg-amber-50/60 border-l-4 border-l-amber-500'
                        : ''
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
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{tx.description}</span>
                          {isDuplicate && (
                            <span className="text-[9px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.2 rounded border border-purple-300">
                              Duplicate
                            </span>
                          )}
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
                      {isDuplicate ? (
                        <span className="inline-flex items-center gap-1 rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                          <CopyCheck className="h-3 w-3 text-purple-600" />
                          Duplicate
                        </span>
                      ) : isReviewNeeded ? (
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
        💡 Advanced Features Active: Duplicate Detector, Custom Vendor Rules, Date Range Splitter, and Column Sorting.
      </p>

      {/* Custom Vendor Auto-Tagging Rules Drawer Modal */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Custom Vendor Auto-Tagging Rules</h3>
              </div>
              <button
                onClick={() => setIsRuleModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Add New Rule Form */}
            <form onSubmit={handleSaveCustomRule} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Add New Keyword Rule</h4>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  placeholder="Merchant keyword (e.g. UBER)"
                  value={newRuleKeyword}
                  onChange={(e) => setNewRuleKeyword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-sans focus:border-emerald-500 focus:outline-none"
                  required
                />
                <select
                  value={newRuleCategory}
                  onChange={(e) => setNewRuleCategory(e.target.value as TransactionCategory)}
                  className="w-full sm:w-48 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                >
                  {STANDARD_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="w-full sm:w-auto shrink-0 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
                >
                  Add Rule
                </button>
              </div>
            </form>

            {/* Saved Custom Rules List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Saved User Rules ({customRules.length})
              </h4>
              {customRules.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  No custom rules saved yet. Add rules above to automatically categorize specific merchant names!
                </p>
              ) : (
                <div className="divide-y divide-slate-100 border rounded-xl border-slate-200 bg-white">
                  {customRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {rule.keyword}
                        </span>
                        <span className="text-slate-400">➔</span>
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {rule.category}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteCustomRule(rule.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete rule"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setIsRuleModalOpen(false)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

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
