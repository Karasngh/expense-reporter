import React from 'react';
import { ViewType } from '../types';
import { LOGO_IMAGE } from '../data/mockData';

interface SidebarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  onResetData: () => void;
  isBackendOnline: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onResetData,
  isBackendOnline
}) => {
  const navItems: { id: ViewType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'transactions', label: 'Transactions & Split', icon: 'receipt_long' },
    { id: 'budgets', label: 'Budgets & Reports', icon: 'pie_chart' },
    { id: 'ai', label: 'AI Insights', icon: 'neurology' },
    { id: 'audit', label: 'Audit Log & History', icon: 'manage_history' },
    { id: 'backend', label: 'Backend & API Docs', icon: 'integration_instructions' }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between fixed top-0 bottom-0 left-0 z-40">
      <div>
        {/* Brand / Logo Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100 bg-white">
          <img
            src={LOGO_IMAGE}
            alt="Expense Reporter Logo"
            className="h-8 w-auto object-contain"
            onError={(e) => {
              // fallback if network image fails
              const target = e.currentTarget;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold shadow-sm';
                fallback.innerHTML = '<span class="material-symbols-outlined text-[20px]">account_balance_wallet</span>';
                parent.insertBefore(fallback, parent.firstChild);
              }
            }}
          />
          <div className="flex flex-col">
            <h1 className="font-bold text-slate-900 text-sm leading-tight tracking-tight">
              Expense Reporter
            </h1>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              Enterprise Ledger
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <div className="p-4 space-y-1">
          <p className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Core Navigation
          </p>
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* System Status Card */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500">System State</span>
            <span className="flex items-center gap-1.5 text-teal-600 font-medium">
              <span className={`w-2 h-2 rounded-full ${isBackendOnline ? 'bg-teal-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span>{isBackendOnline ? 'Online' : 'Mock Mode'}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
            <span className="material-symbols-outlined text-[14px]">cloud_done</span>
            <span>Spring Boot (Port 9494)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
            <span className="material-symbols-outlined text-[14px]">storage</span>
            <span>MySQL Engine Connected</span>
          </div>
        </div>

        <div className="mt-2.5 flex justify-between items-center text-[11px] text-slate-400 px-1">
          <span className="font-mono">v3.4.1-ENTERPRISE</span>
          <button
            onClick={onResetData}
            className="text-teal-600 hover:text-teal-700 hover:underline font-semibold transition-colors"
          >
            Reset Data
          </button>
        </div>
      </div>
    </aside>
  );
};
