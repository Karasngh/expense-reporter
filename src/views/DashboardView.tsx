import React, { useState, useMemo } from 'react';
import { Transaction, ViewType } from '../types';
import { OCR_RECEIPT_IMAGE } from '../data/mockData';

interface DashboardViewProps {
  transactions: Transaction[];
  monthlyCap: number;
  onOpenExpenseModal: (tx?: Transaction) => void;
  onOpenSplitModal: (txId?: string) => void;
  onOpenSplitBreakdown: (tx: Transaction) => void;
  onOpenOcrScanner: () => void;
  onDeleteTransaction: (id: string) => void;
  onNavigate: (view: ViewType) => void;
  onExportCsv: () => void;
  onPingBackend: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  monthlyCap,
  onOpenExpenseModal,
  onOpenSplitModal,
  onOpenSplitBreakdown,
  onOpenOcrScanner,
  onDeleteTransaction,
  onNavigate,
  onExportCsv,
  onPingBackend
}) => {
  const [period, setPeriod] = useState<string>('month');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Metrics calculation
  const totalExpenses = useMemo(() => {
    return transactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const remainingBudget = Math.max(0, monthlyCap - totalExpenses);
  const spentPercent = monthlyCap > 0 ? Math.min(100, (totalExpenses / monthlyCap) * 100) : 0;
  const isBudgetCritical = spentPercent > 85;

  const dayOfMonth = new Date().getDate() || 24;
  const avgDailyBurn = totalExpenses > 0 ? Math.round(totalExpenses / dayOfMonth) : 0;

  // Category vector allocations
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    transactions.forEach((t) => {
      if (t.isSplit && t.splits && t.splits.length > 0) {
        t.splits.forEach((s) => {
          totals[s.category] = (totals[s.category] || 0) + (Number(s.amount) || 0);
        });
      } else {
        const cat = t.category || 'Other';
        totals[cat] = (totals[cat] || 0) + (Number(t.amount) || 0);
      }
    });
    return totals;
  }, [transactions]);

  const sortedCategories = useMemo(() => {
    return Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  }, [categoryTotals]);

  const topCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : 'Food & Dining';
  const topCategoryAmount = sortedCategories.length > 0 ? sortedCategories[0][1] : 0;
  const topCategoryPercent = totalExpenses > 0 ? ((topCategoryAmount / totalExpenses) * 100).toFixed(1) : '0';

  const categoryColors: Record<string, string> = {
    'Food & Dining': '#0d9488',
    'Grocery': '#14b8a6',
    'Bills & Utilities': '#64748b',
    'Travel': '#38bdf8',
    'Shopping': '#f43f5e',
    'Healthcare': '#e11d48',
    'Education': '#8b5cf6',
    'Other': '#94a3b8'
  };

  // Filtered transactions for recent table
  const recentTransactions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return transactions
      .filter((t) => {
        const matchSearch =
          !query ||
          t.merchant.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.id.toLowerCase().includes(query);
        const matchCat = categoryFilter === 'ALL' || t.category === categoryFilter;
        return matchSearch && matchCat;
      })
      .slice(0, 5);
  }, [transactions, searchQuery, categoryFilter]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Food & Dining':
        return 'restaurant';
      case 'Grocery':
        return 'shopping_cart';
      case 'Bills & Utilities':
        return 'bolt';
      case 'Travel':
        return 'directions_car';
      case 'Shopping':
        return 'devices';
      case 'Healthcare':
        return 'local_hospital';
      case 'Education':
        return 'menu_book';
      default:
        return 'receipt';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-600 uppercase tracking-wider">
            <span>Ledger Overview</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className="text-slate-400">Fiscal Cycle 2024-25</span>
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Financial Health & Expenses
            </h1>
            <span className="text-xs text-slate-400 font-medium hidden md:inline">
              Active Region: India (INR)
            </span>
          </div>
        </div>

        {/* Action Controls cluster */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-white border border-slate-200 text-xs font-semibold px-3 py-2 rounded-lg text-slate-700 shadow-xs focus:outline-none cursor-pointer"
          >
            <option value="month">This Month (Mar 2025)</option>
            <option value="last30">Last 30 Days</option>
            <option value="q1">Q1 Fiscal 2025</option>
            <option value="all">All Available Records</option>
          </select>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-400">file_download</span>
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => onOpenSplitModal()}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-teal-600">call_split</span>
            <span>Split Bill</span>
          </button>

          <button
            onClick={() => onOpenExpenseModal()}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>New Expense</span>
          </button>
        </div>
      </div>

      {/* Spring Boot Micro-Sync Status Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold shrink-0">
            <span className="material-symbols-outlined text-[22px]">dns</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-800 text-sm">
                Spring Boot 3.x REST Engine
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-100 text-teal-800">
                Connected (Port 9494)
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              GET /expenses • POST /expenses • DELETE /expenses/{'{'}id{'}'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onPingBackend}
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-teal-600">sensors</span>
            <span>Ping Handshake</span>
          </button>
        </div>
      </div>

      {/* 4 Executive Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Expenses */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Expenses (Month)
            </span>
            <span className="p-1.5 rounded-md bg-teal-50 text-teal-600 material-symbols-outlined text-[18px]">
              payments
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 flex items-baseline gap-1">
              <span className="text-teal-600 font-bold">₹</span>
              <span>{totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="text-rose-600 font-semibold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                +8.4% MoM
              </span>
              <span className="text-slate-400">{transactions.length} entries</span>
            </div>
          </div>
        </div>

        {/* Card 2: Budget Remaining */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Budget Remaining
            </span>
            <span className="p-1.5 rounded-md bg-slate-50 text-slate-600 material-symbols-outlined text-[18px]">
              account_balance_wallet
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 flex items-baseline gap-1">
              <span className="text-slate-400">₹</span>
              <span>{remainingBudget.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              <span className="text-xs text-slate-400 font-normal ml-1">
                / ₹{monthlyCap.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                <span>{spentPercent.toFixed(1)}% Spent</span>
                <span className="text-teal-600 font-bold">
                  ₹{remainingBudget.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Free
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isBudgetCritical ? 'bg-rose-600' : 'bg-teal-600'
                  }`}
                  style={{ width: `${spentPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Avg Daily Burn */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Avg Daily Burn Rate
            </span>
            <span className="p-1.5 rounded-md bg-amber-50 text-amber-600 material-symbols-outlined text-[18px]">
              local_fire_department
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 flex items-baseline gap-1">
              <span className="text-slate-400">₹</span>
              <span>{avgDailyBurn.toLocaleString('en-IN')}</span>
              <span className="text-xs text-slate-400 font-normal ml-1">/ day</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 font-semibold text-[10px] flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                Optimal Pace
              </span>
              <span>Target ₹2,000/day</span>
            </div>
          </div>
        </div>

        {/* Card 4: Top Spend Vector */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Top Spend Vector
            </span>
            <span className="p-1.5 rounded-md bg-teal-50 text-teal-600 material-symbols-outlined text-[18px]">
              {getCategoryIcon(topCategory)}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900 truncate">
              {topCategory}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="font-bold text-teal-600 font-mono">
                ₹{topCategoryAmount.toLocaleString('en-IN')}
              </span>
              <span className="text-slate-400 font-medium">
                {topCategoryPercent}% of total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Charts & Breakdown (Trajectory vs Budget + Category Allocation) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trajectory Trend Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-teal-600 text-[18px]">show_chart</span>
                <h3 className="font-bold text-slate-900 text-sm">
                  Spending Trajectory vs Budget Cap
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Rolling six-month performance (Oct 2024 - Mar 2025)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span> Spend
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Cap ₹60k
              </span>
            </div>
          </div>

          {/* SVG Visual Chart */}
          <div className="w-full h-48 flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 540 180" preserveAspectRatio="none">
              {/* Cap Guideline (₹60,000) */}
              <line x1="0" y1="35" x2="540" y2="35" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="535" y="30" fill="#94a3b8" fontSize="10" fontWeight="600" textAnchor="end">
                CAP ₹60,000
              </text>

              {/* Baseline 30k */}
              <line x1="0" y1="105" x2="540" y2="105" stroke="#f1f5f9" strokeWidth="1" />
              <text x="535" y="100" fill="#94a3b8" fontSize="9" textAnchor="end">
                ₹30,000
              </text>

              {/* Month Bars */}
              {/* Oct */}
              <rect x="30" y="75" width="45" height="85" rx="4" fill="#0d9488" fillOpacity="0.8" />
              <text x="52.5" y="174" fill="#64748b" fontSize="11" textAnchor="middle">Oct</text>

              {/* Nov */}
              <rect x="120" y="60" width="45" height="100" rx="4" fill="#0d9488" fillOpacity="0.8" />
              <text x="142.5" y="174" fill="#64748b" fontSize="11" textAnchor="middle">Nov</text>

              {/* Dec: Festive peak */}
              <rect x="210" y="42" width="45" height="118" rx="4" fill="#e11d48" fillOpacity="0.85" />
              <text x="232.5" y="174" fill="#64748b" fontSize="11" textAnchor="middle">Dec</text>

              {/* Jan */}
              <rect x="300" y="80" width="45" height="80" rx="4" fill="#0d9488" fillOpacity="0.75" />
              <text x="322.5" y="174" fill="#64748b" fontSize="11" textAnchor="middle">Jan</text>

              {/* Feb */}
              <rect x="390" y="70" width="45" height="90" rx="4" fill="#0d9488" fillOpacity="0.8" />
              <text x="412.5" y="174" fill="#64748b" fontSize="11" textAnchor="middle">Feb</text>

              {/* Mar: Live Dynamic Bar */}
              <g className="cursor-pointer group" onClick={() => onNavigate('transactions')}>
                <rect
                  x="480"
                  y={Math.max(20, 160 - Math.min(135, (totalExpenses / monthlyCap) * 125))}
                  width="45"
                  height={Math.min(135, Math.max(20, (totalExpenses / monthlyCap) * 125))}
                  rx="4"
                  fill="#0f766e"
                />
                <text
                  x="502.5"
                  y={Math.max(20, 150 - Math.min(135, (totalExpenses / monthlyCap) * 125))}
                  fill="#0f766e"
                  fontSize="11"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  ₹{(totalExpenses / 1000).toFixed(1)}k
                </text>
                <text x="502.5" y="174" fill="#0f172a" fontSize="11" fontWeight="700" textAnchor="middle">
                  Mar *
                </text>
              </g>
            </svg>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-teal-600 text-[16px]">insights</span>
              Run-rate is 4.2% below monthly threshold alert
            </span>
            <span className="font-mono text-slate-400">Updated now</span>
          </div>
        </div>

        {/* Category Proportional Allocation (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-teal-600 text-[18px]">pie_chart</span>
                <h3 className="font-bold text-slate-900 text-sm">Category Allocation</h3>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-semibold">
                {sortedCategories.length} vectors
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Proportional breakdown of ₹{totalExpenses.toLocaleString('en-IN')}
            </p>

            {/* Stacked Progress Bar */}
            <div className="w-full flex h-3.5 rounded-full overflow-hidden bg-slate-100 gap-0.5 mb-4">
              {sortedCategories.map(([cat, val]) => {
                const pct = totalExpenses > 0 ? (val / totalExpenses) * 100 : 0;
                const col = categoryColors[cat] || '#94a3b8';
                return (
                  <div
                    key={cat}
                    style={{ width: `${pct}%`, backgroundColor: col }}
                    className="h-full transition-all hover:opacity-85 cursor-pointer"
                    title={`${cat}: ₹${val.toLocaleString('en-IN')} (${pct.toFixed(1)}%)`}
                  />
                );
              })}
            </div>

            {/* Category List Rows */}
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {sortedCategories.map(([cat, val]) => {
                const pct = totalExpenses > 0 ? ((val / totalExpenses) * 100).toFixed(1) : '0';
                const col = categoryColors[cat] || '#94a3b8';

                return (
                  <div
                    key={cat}
                    className="flex items-center justify-between text-xs py-1.5 hover:bg-slate-50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: col }}
                      ></span>
                      <span className="font-medium text-slate-800 truncate">{cat}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono font-semibold text-slate-800">
                        ₹{val.toLocaleString('en-IN')}
                      </span>
                      <span className="text-slate-400 w-10 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: 3 Highlight Cards (AI Anomaly Trigger, OCR Scanner, Settlement Bank) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: AI Anomaly Trigger */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">smart_toy</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
              AI Anomaly Trigger
            </span>
            <h4 className="font-bold text-slate-900 text-sm mt-0.5 truncate">
              Recurring Subscriptions Alert
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-normal line-clamp-2">
              ₹1,249 Netflix auto-renewal scheduled in 3 days. BESCOM power charges were 14% higher than usual.
            </p>
          </div>
        </div>

        {/* Card 2: Quick Receipt Scanner Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={OCR_RECEIPT_IMAGE}
              alt="Scan receipt"
              className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-900 text-sm truncate">
                OCR Bill Scanner
              </span>
              <span className="text-xs text-slate-400 truncate">
                Drop UPI QR or paper invoices
              </span>
            </div>
          </div>
          <button
            onClick={onOpenOcrScanner}
            className="p-2.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors shrink-0"
            title="Open Camera Scanner"
          >
            <span className="material-symbols-outlined text-[20px]">document_scanner</span>
          </button>
        </div>

        {/* Card 3: Quick Account Balance Sync */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">account_balance</span>
          </div>
          <div className="flex flex-col w-full min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Primary Settlement Bank
              </span>
              <span className="text-xs font-bold text-teal-600">HDFC Bank</span>
            </div>
            <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
              ₹1,84,320.50
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-0.5">
              A/C: •••• 9012 (Synced 2h ago)
            </span>
          </div>
        </div>
      </div>

      {/* Section 4: Recent Ledger Entries Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600 text-[18px]">receipt_long</span>
              <h3 className="font-bold text-slate-900 text-base">Recent Ledger Entries</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time synchronized records with itemized multi-category splitting
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-slate-400">
                search
              </span>
              <input
                type="text"
                placeholder="Search merchant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-teal-600 w-40 sm:w-48"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Food & Dining">Food & Dining</option>
              <option value="Grocery">Grocery</option>
              <option value="Bills & Utilities">Bills & Utilities</option>
              <option value="Travel">Travel</option>
              <option value="Shopping">Shopping</option>
              <option value="Healthcare">Healthcare</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Merchant / Details</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Amount (INR)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[16px]">
                            {getCategoryIcon(tx.category)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="truncate">{tx.merchant}</span>
                            {tx.isSplit && (
                              <button
                                onClick={() => onOpenSplitBreakdown(tx)}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-teal-100 text-teal-800 font-bold hover:bg-teal-200 transition-colors shrink-0"
                              >
                                Split ({tx.splits ? tx.splits.length : 2})
                              </button>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {tx.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {tx.category}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                      {tx.paymentMethod}
                    </td>

                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {tx.displayDate || tx.date}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.status === 'Reconciled'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-teal-50 text-teal-700'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onOpenSplitModal(tx.id)}
                          className="p-1 text-slate-400 hover:text-teal-600 rounded transition-colors"
                          title="Split Transaction"
                        >
                          <span className="material-symbols-outlined text-[17px]">call_split</span>
                        </button>
                        <button
                          onClick={() => onNavigate('audit')}
                          className="p-1 text-slate-400 hover:text-teal-600 rounded transition-colors"
                          title="Audit Trail"
                        >
                          <span className="material-symbols-outlined text-[17px]">manage_history</span>
                        </button>
                        <button
                          onClick={() => onOpenExpenseModal(tx)}
                          className="p-1 text-slate-400 hover:text-teal-600 rounded transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[17px]">edit</span>
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[17px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 bg-slate-50 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
          <span>Displaying 5 most recent records</span>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-teal-600 hover:text-teal-700 hover:underline font-semibold flex items-center gap-1"
          >
            <span>View All in Transactions & Split</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
