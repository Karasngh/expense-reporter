import React from 'react';
import { ViewType } from '../types';

interface MobileNavProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onSelectView,
  isOpen,
  onClose
}) => {
  const bottomTabs: { id: ViewType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'transactions', label: 'Transactions', icon: 'receipt_long' },
    { id: 'budgets', label: 'Budgets', icon: 'account_balance_wallet' },
    { id: 'ai', label: 'AI Insights', icon: 'auto_awesome' },
    { id: 'audit', label: 'Audit Log', icon: 'manage_history' }
  ];

  const allViews: { id: ViewType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'transactions', label: 'Transactions & Split', icon: 'receipt_long' },
    { id: 'budgets', label: 'Budgets & Reports', icon: 'pie_chart' },
    { id: 'ai', label: 'AI Insights', icon: 'psychology' },
    { id: 'audit', label: 'Audit Log & History', icon: 'manage_history' },
    { id: 'backend', label: 'Backend & API Docs', icon: 'integration_instructions' }
  ];

  return (
    <>
      {/* Mobile Top Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150 sticky top-16 z-30">
          <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Navigation
          </p>
          {allViews.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectView(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-lg px-2 pb-safe">
        <div className="flex justify-around items-center h-16">
          {bottomTabs.map((tab) => {
            const isActive = currentView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectView(tab.id)}
                className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] transition-colors ${
                  isActive ? 'text-teal-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">{tab.icon}</span>
                <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
