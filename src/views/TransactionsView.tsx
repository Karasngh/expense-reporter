import React, { useState, useMemo } from 'react';
import { Transaction, SplitAllocation } from '../types';

interface TransactionsViewProps {
  transactions: Transaction[];
  onOpenExpenseModal: (tx?: Transaction) => void;
  onOpenSplitModal: (txId?: string) => void;
  onOpenSplitBreakdown: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onBatchDelete: (ids: string[]) => void;
  onExportCsv: () => void;
  onSeedDemo: () => void;
  onViewAudit?: (txId?: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onOpenExpenseModal,
  onOpenSplitModal,
  onOpenSplitBreakdown,
  onDeleteTransaction,
  onBatchDelete,
  onExportCsv,
  onSeedDemo,
  onViewAudit
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<string>('DATE_DESC');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [forceEmptyState, setForceEmptyState] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Filter & sort logic
  const filteredTransactions = useMemo(() => {
    if (forceEmptyState) return [];

    const query = searchQuery.toLowerCase().trim();

    const filtered = transactions.filter((tx) => {
      const matchSearch =
        !query ||
        tx.merchant.toLowerCase().includes(query) ||
        tx.description.toLowerCase().includes(query) ||
        tx.id.toLowerCase().includes(query);

      const matchCat =
        categoryFilter === 'ALL'
          ? true
          : categoryFilter === 'Split'
          ? tx.isSplit
          : tx.category.toLowerCase().includes(categoryFilter.toLowerCase());

      const matchPayment =
        paymentFilter === 'ALL' ? true : tx.paymentMethod === paymentFilter;

      return matchSearch && matchCat && matchPayment;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (sortOption === 'DATE_DESC') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortOption === 'DATE_ASC') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortOption === 'AMOUNT_DESC') return b.amount - a.amount;
      if (sortOption === 'AMOUNT_ASC') return a.amount - b.amount;
      return 0;
    });

    return filtered;
  }, [transactions, searchQuery, categoryFilter, paymentFilter, sortOption, forceEmptyState]);

  // Pagination slice
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  // Overall counters
  const totalRecordedOutflow = useMemo(() => {
    return transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const splitTransactions = useMemo(() => {
    return transactions.filter((t) => t.isSplit);
  }, [transactions]);

  const totalSplitAmount = useMemo(() => {
    return splitTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [splitTransactions]);

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = new Set(paginatedTransactions.map((t) => t.id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBatchDeleteClick = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Permanently remove ${selectedIds.size} transactions from database ledger?`)) {
      onBatchDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const resetFilters = () => {
    setForceEmptyState(false);
    setSearchQuery('');
    setCategoryFilter('ALL');
    setPaymentFilter('ALL');
    setDateFilter('ALL');
    setSortOption('DATE_DESC');
  };

  const getCategoryBadgeClass = (category: string) => {
    if (category.includes('Split')) {
      return 'bg-purple-100 text-purple-800';
    }
    if (category.includes('Food')) {
      return 'bg-teal-100 text-teal-800';
    }
    if (category.includes('Tech') || category.includes('Shopping')) {
      return 'bg-slate-100 text-slate-800';
    }
    if (category.includes('Travel')) {
      return 'bg-sky-100 text-sky-800';
    }
    if (category.includes('Grocery')) {
      return 'bg-emerald-100 text-emerald-800';
    }
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Scrim & Summary Counters */}
      <div className="relative w-full bg-slate-900 text-white rounded-2xl p-6 sm:p-8 overflow-hidden shadow-sm">
        {/* Decorative blur glows */}
        <div className="absolute -right-16 -top-20 w-80 h-80 rounded-full bg-teal-500/15 blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 -bottom-20 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs uppercase font-bold tracking-wider">
                <span className="material-symbols-outlined text-[14px]">account_tree</span>
                Multi-Allocation Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Spring JPA Ledger Sync #TX-9494
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Transactions & Split Allocation
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Audit composite corporate outflows, subdivide cross-departmental expenses, and enforce zero-variance relational integrity with automated sub-ledger mappings.
            </p>
          </div>

          {/* Quick Metrics Counter Cards */}
          <div className="flex items-stretch gap-3 flex-wrap sm:flex-nowrap">
            {/* Card 1 */}
            <div className="bg-slate-800/90 border border-slate-700/60 p-4 rounded-xl flex-1 min-w-[140px] flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Active Entries
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-white">
                  {transactions.length}
                </span>
                <span className="text-xs text-teal-400 font-semibold">records</span>
              </div>
              <span className="text-[11px] text-teal-400/90 flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[13px]">check_circle</span>
                100% Reconciled
              </span>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-800/90 border border-slate-700/60 p-4 rounded-xl flex-1 min-w-[170px] flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Recorded Outflow
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-sm font-bold text-teal-400">₹</span>
                <span className="text-2xl font-bold font-mono text-white">
                  {totalRecordedOutflow.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1">
                INR Net General Ledger
              </span>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-800/90 border border-slate-700/60 p-4 rounded-xl flex-1 min-w-[160px] flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Splits Allocated
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-teal-300">
                  {splitTransactions.length}
                </span>
                <span className="text-xs text-slate-300 font-medium">composite</span>
              </div>
              <span className="text-[11px] text-slate-300 mt-1 font-mono">
                ₹{totalSplitAmount.toLocaleString('en-IN')} categorized
              </span>
            </div>
          </div>
        </div>

        {/* Action Deck Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onOpenSplitModal()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">call_split</span>
              <span>Launch Split Allocation Builder</span>
            </button>

            <button
              onClick={() => setForceEmptyState(!forceEmptyState)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>{forceEmptyState ? 'Restore Ledger View' : 'Preview Empty / Zero State'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onViewAudit && (
              <button
                onClick={() => onViewAudit()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold shadow-xs transition-colors border border-slate-700"
                title="View full audit trail"
              >
                <span className="material-symbols-outlined text-[16px] text-teal-400">manage_history</span>
                <span>Audit Log</span>
              </button>
            )}

            <button
              onClick={onExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-xs transition-colors border border-slate-700"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-400">file_download</span>
              <span>Export Ledger</span>
            </button>

            <button
              onClick={() => onOpenExpenseModal()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>+ Add New Transaction</span>
            </button>
          </div>
        </div>
      </div>

      {/* Operational Filter Matrix */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input (4 Cols) */}
          <div className="lg:col-span-4 relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by merchant, note, or ID (e.g. TX-1001)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-600 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-700 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter (2 Cols) */}
          <div className="lg:col-span-2 relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-600 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Split">Split Allocated Only</option>
              <option value="Food & Dining">Food & Dining</option>
              <option value="Grocery">Grocery</option>
              <option value="Bills & Utilities">Bills & Utilities</option>
              <option value="Travel">Corporate Travel</option>
              <option value="Shopping">Shopping & Tech</option>
              <option value="Healthcare">Healthcare</option>
            </select>
          </div>

          {/* Payment Rail Filter (2 Cols) */}
          <div className="lg:col-span-2 relative">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-600 cursor-pointer"
            >
              <option value="ALL">All Payment Modes</option>
              <option value="Corporate Card">Corporate Card</option>
              <option value="UPI">UPI (Unified Payments)</option>
              <option value="NetBanking">NetBanking</option>
              <option value="Cash">Petty Cash</option>
            </select>
          </div>

          {/* Date Range (2 Cols) */}
          <div className="lg:col-span-2 relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-600 cursor-pointer"
            >
              <option value="ALL">Current Fiscal Period</option>
              <option value="THIS_MONTH">This Month (Mar 2025)</option>
              <option value="LAST_MONTH">Feb 2025</option>
              <option value="Q1">Q1 2025</option>
            </select>
          </div>

          {/* Sort Filter (2 Cols) */}
          <div className="lg:col-span-2 relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-600 cursor-pointer"
            >
              <option value="DATE_DESC">Date: Newest First</option>
              <option value="DATE_ASC">Date: Oldest First</option>
              <option value="AMOUNT_DESC">Amount: High to Low</option>
              <option value="AMOUNT_ASC">Amount: Low to High</option>
            </select>
          </div>
        </div>

        {/* Batch Selection Action Ribbon */}
        {selectedIds.size > 0 && (
          <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2 font-semibold text-teal-900">
              <span className="material-symbols-outlined text-[18px] text-teal-600">checklist</span>
              <span>{selectedIds.size} transactions selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onExportCsv}
                className="px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-xs flex items-center gap-1 border border-slate-200"
              >
                <span className="material-symbols-outlined text-[14px]">file_download</span>
                <span>Export Selected</span>
              </button>
              <button
                onClick={handleBatchDeleteClick}
                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">delete</span>
                <span>Delete Selected</span>
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-slate-500 hover:underline px-2"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Relational Integrity Mode Banner */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
        <span className="material-symbols-outlined text-teal-600 text-[20px] shrink-0 mt-0.5">
          verified_user
        </span>
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-800">Strict Relational Integrity Mode:</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-200 font-mono text-[10px] text-slate-700 font-semibold">
              CASCADE.ALL
            </span>
            <span className="px-1.5 py-0.2 rounded bg-slate-200 font-mono text-[10px] text-slate-700 font-semibold">
              FetchType.LAZY
            </span>
          </div>
          <p className="text-slate-500 leading-normal">
            Splits are saved with child allocation records mapped to Parent Transaction ID via Spring Data JPA <code className="text-teal-700 font-mono font-bold bg-teal-50 px-1 py-0.5 rounded">@OneToMany</code>, ensuring no double-counting in dashboard totals while permitting granular departmental auditing.
          </p>
        </div>
      </div>

      {/* Ledger Table Container */}
      {filteredTransactions.length === 0 ? (
        /* Empty State */
        <div className="w-full py-16 px-4 bg-white rounded-xl border border-slate-200 shadow-xs text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <span className="material-symbols-outlined text-[32px]">receipt_long</span>
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">No Transactions Located</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
            We could not find matching records in the current MySQL persistence ledger. You can import corporate bank feeds or manually add your first expense record.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onSeedDemo}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add Sample Expense</span>
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
            >
              Reset Filter Criteria
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 pl-4 pr-2 w-8">
                    <input
                      type="checkbox"
                      checked={
                        paginatedTransactions.length > 0 &&
                        paginatedTransactions.every((t) => selectedIds.has(t.id))
                      }
                      onChange={handleSelectAll}
                      className="rounded accent-teal-600 cursor-pointer w-4 h-4"
                    />
                  </th>
                  <th className="py-3 px-3">Date & Ref</th>
                  <th className="py-3 px-3">Merchant / Description</th>
                  <th className="py-3 px-3">Category Breakdown</th>
                  <th className="py-3 px-3">Payment Rail</th>
                  <th className="py-3 px-3 text-right">Amount (INR)</th>
                  <th className="py-3 px-3 text-center">Split Status</th>
                  <th className="py-3 pr-4 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTransactions.map((tx) => {
                  const isChecked = selectedIds.has(tx.id);
                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isChecked ? 'bg-teal-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectRow(tx.id)}
                          className="rounded accent-teal-600 cursor-pointer w-4 h-4"
                        />
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{tx.displayDate || tx.date}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">{tx.id}</div>
                      </td>

                      <td className="py-3.5 px-3 min-w-[200px]">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{tx.merchant}</span>
                          {tx.isSplit && (
                            <span
                              className="material-symbols-outlined text-teal-600 text-[14px]"
                              title="Contains child split allocations"
                            >
                              account_tree
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                          {tx.description}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold ${getCategoryBadgeClass(
                            tx.category
                          )}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          <span>{tx.category}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <span className="material-symbols-outlined text-[15px] text-slate-400">
                            {tx.paymentMethod === 'Corporate Card'
                              ? 'credit_card'
                              : tx.paymentMethod === 'UPI'
                              ? 'qr_code_2'
                              : 'account_balance'}
                          </span>
                          <span>{tx.paymentMethod}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap text-sm">
                        ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {tx.isSplit ? (
                          <button
                            onClick={() => onOpenSplitBreakdown(tx)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 text-[11px] font-bold hover:bg-teal-100 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[13px]">call_split</span>
                            <span>Split: {tx.splits ? tx.splits.length : 2} Categories</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">
                            Single Item
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 pr-4 pl-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {tx.isSplit ? (
                            <button
                              onClick={() => onOpenSplitBreakdown(tx)}
                              className="p-1 rounded text-teal-600 hover:bg-teal-50 transition-colors"
                              title="View Split Breakdown"
                            >
                              <span className="material-symbols-outlined text-[18px]">schema</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onOpenSplitModal(tx.id)}
                              className="p-1 rounded text-slate-400 hover:text-teal-600 hover:bg-slate-100 transition-colors"
                              title="Split this expense"
                            >
                              <span className="material-symbols-outlined text-[18px]">call_split</span>
                            </button>
                          )}
                          {onViewAudit && (
                            <button
                              onClick={() => onViewAudit(tx.id)}
                              className="p-1 rounded text-slate-400 hover:text-teal-600 hover:bg-slate-100 transition-colors"
                              title={`View Audit Trail for ${tx.id}`}
                            >
                              <span className="material-symbols-outlined text-[18px]">manage_history</span>
                            </button>
                          )}
                          <button
                            onClick={() => onOpenExpenseModal(tx)}
                            className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">
              Showing <strong className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</strong> of <strong className="text-slate-800">{filteredTransactions.length}</strong> transactions
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-md font-bold transition-all ${
                        isActive
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
