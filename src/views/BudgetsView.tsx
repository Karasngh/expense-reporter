import React, { useState, useMemo } from 'react';
import { Transaction, CategoryBudget } from '../types';
import { CATEGORY_CONFIG } from '../data/mockData';

interface BudgetsViewProps {
  transactions: Transaction[];
  monthlyCap: number;
  onOpenBudgetModal: () => void;
  onExportCsv: () => void;
  onPrintPdf: () => void;
  onDownloadJsonBackup: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  transactions,
  monthlyCap,
  onOpenBudgetModal,
  onExportCsv,
  onPrintPdf,
  onDownloadJsonBackup,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'category' | 'payment' | 'tax'>('summary');
  const [isRealDbMode, setIsRealDbMode] = useState<boolean>(true);
  const [currentMonthName, setCurrentMonthName] = useState<string>('March 2025');

  // Aggregated spending
  const totalSpent = useMemo(() => {
    return transactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const remainingRunway = Math.max(0, monthlyCap - totalSpent);
  const spentPercent = monthlyCap > 0 ? Math.min(100, (totalSpent / monthlyCap) * 100) : 0;

  // Category spending aggregation
  const categorySpends = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach((t) => {
      if (t.isSplit && t.splits && t.splits.length > 0) {
        t.splits.forEach((s) => {
          map[s.category] = (map[s.category] || 0) + (Number(s.amount) || 0);
        });
      } else {
        const cat = t.category || 'Other';
        map[cat] = (map[cat] || 0) + (Number(t.amount) || 0);
      }
    });
    return map;
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Active Session Mode Banner */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            Active Session:
          </span>
          <span
            className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
              isRealDbMode
                ? 'bg-teal-100 text-teal-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isRealDbMode ? '[MODE: REAL DATABASE RECORDS]' : '[MODE: DEMO MOCK DATA]'}
          </span>
          <span className="text-slate-500 font-medium hidden md:inline">
            Connected to Hibernate ORM Engine (Port 9494, schema: expense_master_prod)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Data Engine:</span>
          <button
            onClick={() => {
              setIsRealDbMode(!isRealDbMode);
              onShowToast(
                isRealDbMode ? 'Switched to Demo Mock Sandbox' : 'Switched to Live Production DB',
                'sync'
              );
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded font-semibold text-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[15px] text-teal-600">sync_alt</span>
            <span>{isRealDbMode ? 'Switch to Demo Mock Data' : 'Restore Real DB Mode'}</span>
          </button>
        </div>
      </div>

      {/* Header and Month Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-600 uppercase tracking-wider">
            <span>Fiscal Tracking</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className="text-slate-400">Q1 2025 Ledger</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">
            Budgets & Financial Statements
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time category caps, burn rates, and export-grade audit reports.
          </p>
        </div>

        {/* Month Selector & Edit Cap Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
            <button
              onClick={() => {
                setCurrentMonthName('February 2025');
                onShowToast('Viewing archived February 2025 audit ledger', 'calendar_today');
              }}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors"
              title="Previous Month"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1 font-bold text-xs text-slate-800">
              <span className="material-symbols-outlined text-teal-600 text-[18px]">calendar_today</span>
              <span>{currentMonthName}</span>
            </div>
            <button
              onClick={() => {
                setCurrentMonthName('March 2025');
                onShowToast('Viewing live March 2025 ledger', 'calendar_today');
              }}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors"
              title="Next Month"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          <button
            onClick={onOpenBudgetModal}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Edit Monthly Budget</span>
          </button>
        </div>
      </div>

      {/* Overall Budget Health Bento Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Metric Panel (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between gap-5 relative overflow-hidden">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Executive Overview
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[10px]">
                  18 of 31 Days (58.1% Elapsed)
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-teal-600">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span>Projected Burn: Safe (+₹3,200 Surplus Buffer)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <span className="text-xs text-slate-400 font-medium">Total Budget Cap</span>
                <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
                  ₹{monthlyCap.toLocaleString('en-IN')}
                </div>
                <span className="text-[11px] text-slate-400">Approved baseline</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium">Total Spent to Date</span>
                <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5 flex items-baseline gap-1.5">
                  <span>₹{totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  <span className="text-xs font-bold text-rose-600">
                    {spentPercent.toFixed(1)}%
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Across {transactions.length} transactions
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium">Available Runway</span>
                <div className="text-2xl font-bold font-mono text-teal-600 mt-0.5 flex items-baseline gap-1.5">
                  <span>₹{remainingRunway.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  <span className="text-xs text-slate-400 font-normal">13 Days Left</span>
                </div>
                <span className="text-[11px] text-teal-700 font-medium">
                  ~₹{Math.round(remainingRunway / 13).toLocaleString('en-IN')} daily target
                </span>
              </div>
            </div>
          </div>

          {/* Master Health Progress Bar */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-slate-800">
                <span className="material-symbols-outlined text-[16px] text-teal-600">speed</span>
                Monthly Budget Consumption
              </span>
              <span className="font-bold font-mono text-slate-800">{spentPercent.toFixed(1)}% Spent</span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  spentPercent > 85 ? 'bg-rose-600' : 'bg-teal-600'
                }`}
                style={{ width: `${spentPercent}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-0.5">
              <span>₹0 (Day 1)</span>
              <span className="flex items-center gap-1 text-slate-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                Day 18 Marker (Optimal limit: ₹34,840)
              </span>
              <span>₹{monthlyCap.toLocaleString('en-IN')} (Target Cap)</span>
            </div>
          </div>
        </div>

        {/* Pacing Velocity Alert Card (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4 shadow-xs">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-rose-600">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                Audit Risk Flag
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold uppercase">
                Attention
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Pacing Velocity Alert</h3>
            <p className="text-xs text-slate-600 leading-normal">
              Spend rate in <strong className="text-slate-900">Bills & Utilities</strong> (93.8%) and <strong className="text-slate-900">Food & Dining</strong> (85.5%) exceeds the 18-day calendar benchmark (58.1%). Shopping is pacing comfortably low.
            </p>
          </div>

          {/* Sparkline Visual */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                18-Day Inflow / Outflow
              </span>
              <span className="text-sm font-bold font-mono text-slate-900">
                ₹2,380 / day avg
              </span>
            </div>
            <svg className="w-20 h-7 text-teal-600 overflow-visible" fill="none" viewBox="0 0 100 36">
              <path
                d="M0 28 L14 24 L28 30 L42 16 L56 22 L70 12 L84 18 L100 6"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
              />
              <circle cx="100" cy="6" r="3.5" fill="#0d9488" />
            </svg>
          </div>

          <button
            onClick={() => onShowToast('Automated recalibration: Shifted ₹1,200 reserve to Bills', 'auto_fix_high')}
            className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-teal-600">analytics</span>
            <span>View Automated Recalibration</span>
          </button>
        </div>
      </div>

      {/* Category Department Limits */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Category Department Limits</h2>
            <p className="text-xs text-slate-400">
              7 active departmental categories configured for March 2025.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span> &lt;80% Healthy
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> 80-90% Warning
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span> &gt;90% Critical
            </span>
          </div>
        </div>

        {/* Grid of Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORY_CONFIG.map((catConfig) => {
            const spent = categorySpends[catConfig.category] || 0;
            const cap = catConfig.cap;
            const pct = Math.min(100, (spent / cap) * 100);
            const remaining = cap - spent;
            const isCritical = pct > 90;
            const isWarning = pct > 80 && pct <= 90;

            return (
              <div
                key={catConfig.category}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between gap-3 hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">
                        {catConfig.icon}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-teal-50 text-teal-800'
                      }`}
                    >
                      {pct.toFixed(1)}% {isCritical ? 'Critical' : isWarning ? 'Warning' : 'Healthy'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{catConfig.category}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{catConfig.description}</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between text-xs font-mono">
                    <span className="font-bold text-slate-900">
                      ₹{spent.toLocaleString('en-IN')}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      of ₹{cap.toLocaleString('en-IN')} cap
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isCritical
                          ? 'bg-rose-600'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-teal-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span className={`font-semibold ${remaining < 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                      ₹{remaining.toLocaleString('en-IN')} left
                    </span>
                    <span>13 days remain</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Reserve / Contingency Summary Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">savings</span>
                </div>
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">
                  POOL-ID: #001
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Total Unallocated Reserve</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Uncommitted surplus capital</p>
            </div>

            <div className="space-y-2">
              <div className="text-lg font-bold font-mono text-slate-900">₹17,150.00</div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Re-weighting available. Can transfer up to ₹3,000 to Bills & Utilities.
              </p>
              <button
                onClick={() => onShowToast('Reserve pool balanced across active department vectors', 'check_circle')}
                className="w-full py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 transition-colors"
              >
                Rebalance Categories
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Reports & Statement Engine Section */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Audit & Intelligence Module
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Financial Reports & Statement Engine
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cross-tabulate transactions against fiscal categories, payment rails, and deductible allowances.
            </p>
          </div>

          {/* Export Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-teal-600">table_view</span>
              <span>Export as CSV</span>
            </button>
            <button
              onClick={onDownloadJsonBackup}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-teal-600">data_object</span>
              <span>JSON Backup (Spring Boot)</span>
            </button>
            <button
              onClick={onPrintPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              <span>Print PDF Statement</span>
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md transition-all ${
              activeTab === 'summary'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">calendar_view_month</span>
            <span>Monthly Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('category')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md transition-all ${
              activeTab === 'category'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">donut_small</span>
            <span>Category Breakdown</span>
          </button>

          <button
            onClick={() => setActiveTab('payment')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md transition-all ${
              activeTab === 'payment'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">account_balance_wallet</span>
            <span>Payment Mode Analysis</span>
          </button>

          <button
            onClick={() => setActiveTab('tax')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md transition-all ${
              activeTab === 'tax'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">receipt</span>
            <span>Tax-Deductible Ledger</span>
          </button>
        </div>

        {/* TAB 1: Monthly Summary */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-medium">Avg Daily Spend (MTD)</span>
                <span className="text-lg font-bold font-mono text-slate-900 mt-1">₹2,380.55</span>
                <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-0.5 mt-1">
                  <span className="material-symbols-outlined text-[14px]">north_east</span>
                  +8.4% vs February
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-medium">Median Ticket Size</span>
                <span className="text-lg font-bold font-mono text-slate-900 mt-1">₹680.00</span>
                <span className="text-[11px] text-teal-600 font-semibold flex items-center gap-0.5 mt-1">
                  <span className="material-symbols-outlined text-[14px]">south_east</span>
                  -3.1% vs Q4 baseline
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-medium">Single Highest Spike</span>
                <span className="text-lg font-bold font-mono text-slate-900 mt-1">₹4,200.00</span>
                <span className="text-[11px] text-slate-500 mt-1">AWS Cloud Hosting (Mar 04)</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-medium">Recurring Subscriptions</span>
                <span className="text-lg font-bold font-mono text-slate-900 mt-1">₹6,840.00</span>
                <span className="text-[11px] text-slate-500 mt-1">7 auto-debited lines</span>
              </div>
            </div>

            {/* Historical Month-on-Month Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Fiscal Month</th>
                    <th className="py-2.5 px-3">Total Outlay</th>
                    <th className="py-2.5 px-3">Budget Cap</th>
                    <th className="py-2.5 px-3">MoM Variance</th>
                    <th className="py-2.5 px-3">Tx Count</th>
                    <th className="py-2.5 px-3">Highest Outlay Category</th>
                    <th className="py-2.5 px-3 text-right">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-teal-50/20 font-semibold">
                    <td className="py-2.5 px-3 flex items-center gap-2 text-slate-900">
                      <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                      March 2025 (MTD)
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">₹{monthlyCap.toLocaleString('en-IN')}.00</td>
                    <td className="py-2.5 px-3 text-rose-600">+6.8%</td>
                    <td className="py-2.5 px-3 font-mono">{transactions.length}</td>
                    <td className="py-2.5 px-3">Food & Dining</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-[10px] font-bold">
                        In Progress
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-slate-700">February 2025</td>
                    <td className="py-2.5 px-3 font-mono">₹54,320.00</td>
                    <td className="py-2.5 px-3 text-slate-500">₹58,000.00</td>
                    <td className="py-2.5 px-3 text-teal-600 font-medium">-4.2%</td>
                    <td className="py-2.5 px-3 font-mono">58</td>
                    <td className="py-2.5 px-3">Travel & Transit (₹14,900)</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                        Reconciled
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-slate-700">January 2025</td>
                    <td className="py-2.5 px-3 font-mono">₹56,700.00</td>
                    <td className="py-2.5 px-3 text-slate-500">₹58,000.00</td>
                    <td className="py-2.5 px-3 text-rose-600 font-medium">+11.5%</td>
                    <td className="py-2.5 px-3 font-mono">63</td>
                    <td className="py-2.5 px-3">Equipment & Hardware (₹18,200)</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                        Reconciled
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-slate-700">December 2024</td>
                    <td className="py-2.5 px-3 font-mono">₹50,850.00</td>
                    <td className="py-2.5 px-3 text-slate-500">₹55,000.00</td>
                    <td className="py-2.5 px-3 text-teal-600 font-medium">-2.8%</td>
                    <td className="py-2.5 px-3 font-mono">51</td>
                    <td className="py-2.5 px-3">Food & Celebrations (₹16,300)</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                        Closed Book
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Category Breakdown */}
        {activeTab === 'category' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Share of March 2025 Spend
              </span>
              <div className="w-full h-8 rounded-lg overflow-hidden flex bg-slate-100 shadow-inner">
                <div style={{ width: '35.9%' }} className="bg-amber-500 hover:opacity-90" title="Food & Dining (35.9%)"></div>
                <div style={{ width: '19.1%' }} className="bg-teal-600 hover:opacity-90" title="Groceries (19.1%)"></div>
                <div style={{ width: '17.5%' }} className="bg-slate-600 hover:opacity-90" title="Bills & Utilities (17.5%)"></div>
                <div style={{ width: '13.1%' }} className="bg-sky-500 hover:opacity-90" title="Travel (13.1%)"></div>
                <div style={{ width: '9.7%' }} className="bg-rose-500 hover:opacity-90" title="Shopping (9.7%)"></div>
                <div style={{ width: '4.7%' }} className="bg-teal-800 hover:opacity-90" title="Healthcare (4.7%)"></div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-amber-500 shrink-0"></span>
                  <span className="truncate">Food & Dining (₹15,400 • 35.9%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-teal-600 shrink-0"></span>
                  <span className="truncate">Groceries (₹8,200 • 19.1%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-slate-600 shrink-0"></span>
                  <span className="truncate">Bills & Utilities (₹7,500 • 17.5%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-sky-500 shrink-0"></span>
                  <span className="truncate">Travel & Transit (₹5,600 • 13.1%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-rose-500 shrink-0"></span>
                  <span className="truncate">Shopping (₹4,150 • 9.7%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-teal-800 shrink-0"></span>
                  <span className="truncate">Healthcare (₹2,000 • 4.7%)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Category Entropy Index</h4>
                <p className="text-xs text-slate-600 mt-1 leading-normal">
                  Your spending shows 72.5% concentration in essential operational categories (Dining, Groceries, Utilities). Non-essential discretionary spending is contained under 15% this quarter.
                </p>
              </div>
              <div className="pt-4 flex items-center justify-between text-xs border-t border-slate-200">
                <span className="text-slate-500 font-mono">Entropy Score: 0.81 (Diversified)</span>
                <span className="text-teal-600 font-bold">Balanced Allocation</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Payment Rail Analysis */}
        {activeTab === 'payment' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* UPI Rail */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                      UPI
                    </div>
                    <span className="font-bold text-slate-900 text-sm">Unified Payments (UPI)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-[10px] font-bold">
                    58.4% Vol
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Settled Volume</span>
                  <div className="text-xl font-bold font-mono text-slate-900">₹25,040.00</div>
                </div>
              </div>
              <div className="space-y-1 text-xs text-slate-600 border-t border-slate-200 pt-2">
                <div className="flex justify-between">
                  <span>Transactions</span>
                  <span className="font-bold text-slate-900">29 orders</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Ticket</span>
                  <span className="font-bold text-slate-900 font-mono">₹863.44</span>
                </div>
                <div className="flex justify-between">
                  <span>Primary Outlets</span>
                  <span className="font-bold text-slate-900">Swiggy, Zepto, Metro</span>
                </div>
              </div>
            </div>

            {/* Credit Card Rail */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px]">credit_card</span>
                    </div>
                    <span className="font-bold text-slate-900 text-sm">Corporate Credit Card</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-bold">
                    37.8% Vol
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Settled Volume</span>
                  <div className="text-xl font-bold font-mono text-slate-900">₹16,210.00</div>
                </div>
              </div>
              <div className="space-y-1 text-xs text-slate-600 border-t border-slate-200 pt-2">
                <div className="flex justify-between">
                  <span>Transactions</span>
                  <span className="font-bold text-slate-900">9 orders</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Ticket</span>
                  <span className="font-bold text-slate-900 font-mono">₹1,801.11</span>
                </div>
                <div className="flex justify-between">
                  <span>Primary Vendors</span>
                  <span className="font-bold text-slate-900">AWS, Croma, Airlines</span>
                </div>
              </div>
            </div>

            {/* Petty Cash Rail */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px]">payments</span>
                    </div>
                    <span className="font-bold text-slate-900 text-sm">Petty Cash Ledger</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-bold">
                    3.8% Vol
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Settled Volume</span>
                  <div className="text-xl font-bold font-mono text-slate-900">₹1,600.00</div>
                </div>
              </div>
              <div className="space-y-1 text-xs text-slate-600 border-t border-slate-200 pt-2">
                <div className="flex justify-between">
                  <span>Transactions</span>
                  <span className="font-bold text-slate-900">4 vouchers</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Ticket</span>
                  <span className="font-bold text-slate-900 font-mono">₹400.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Reimbursement Flag</span>
                  <span className="font-bold text-teal-600">All Verified</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Tax-Deductible Ledger */}
        {activeTab === 'tax' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                  Indian Income Tax Section 80C & Business Write-Offs
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  ₹14,850 Estimated Eligible Incurred Spend
                </h3>
                <p className="text-xs text-slate-500">
                  Verified against GSTIN invoices uploaded to Spring Boot storage.
                </p>
              </div>
              <button
                onClick={() => onShowToast('Form 16 Annexure generated for download', 'check_circle')}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Generate Form 16 Annexure
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Vendor</th>
                    <th className="py-2.5 px-3">GSTIN / Tax ID</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Tax Bracket</th>
                    <th className="py-2.5 px-3 text-right">Deductible Claim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="py-2.5 px-3 text-slate-700">04 Mar 2025</td>
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900">
                      Amazon Web Services India
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">29AABCU9603R1ZM</td>
                    <td className="py-2.5 px-3 font-sans">Bills & Utilities</td>
                    <td className="py-2.5 px-3 font-sans">18% GST Input Credit</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹4,200.00</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-slate-700">09 Mar 2025</td>
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900">
                      O'Reilly Learning Media
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">9917USA29013110</td>
                    <td className="py-2.5 px-3 font-sans">Education & Books</td>
                    <td className="py-2.5 px-3 font-sans">100% Professional Dev</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹1,200.00</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-slate-700">15 Mar 2025</td>
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900">
                      Apollo Medical Clinic
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">36AAACA1258G1ZX</td>
                    <td className="py-2.5 px-3 font-sans">Healthcare</td>
                    <td className="py-2.5 px-3 font-sans">Sec 80D Health Benefit</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹2,000.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
