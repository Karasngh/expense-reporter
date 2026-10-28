import React from 'react';

interface HeaderProps {
  onToggleMobileNav: () => void;
  onOpenAddExpense: () => void;
  onPingBackend: () => void;
  isLiveMode: boolean;
  onToggleLiveMode: () => void;
  isBackendOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileNav,
  onOpenAddExpense,
  onPingBackend,
  isLiveMode,
  onToggleLiveMode,
  isBackendOnline
}) => {
  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left items: Mobile toggle + backend pill + mode switcher */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onToggleMobileNav}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {/* Spring Boot status pill */}
        <div
          onClick={onPingBackend}
          className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer hover:bg-slate-100 transition-colors select-none"
          title="Click to test handshake ping with Spring Boot server"
        >
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isBackendOnline ? 'bg-teal-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isBackendOnline ? 'bg-teal-500' : 'bg-amber-500'}`}></span>
          </span>
          <span className="text-slate-700">Live Spring Boot:</span>
          <span className="font-mono text-teal-600 font-semibold">http://localhost:9494</span>
        </div>

        {/* Demo Mode / Live Sync Toggle */}
        <button
          onClick={onToggleLiveMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            isLiveMode
              ? 'bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200/60'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
          <span>{isLiveMode ? 'Live Sync Mode' : 'Demo Data Mode'}</span>
        </button>
      </div>

      {/* Right items: Currency + Add Expense + Notifications + Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Currency Indicator */}
        <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800">
          <span className="text-teal-600 font-bold">₹</span>
          <span className="font-mono">INR</span>
        </div>

        {/* Add Expense Trigger */}
        <button
          onClick={onOpenAddExpense}
          className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span className="hidden sm:inline">Add Expense</span>
          <span className="sm:hidden">Add</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={onPingBackend}
          className="relative p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="System notifications"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            AD
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 leading-none">Admin User</span>
            <span className="text-[10px] text-slate-400 mt-0.5">admin@expensereporter.internal</span>
          </div>
        </div>
      </div>
    </header>
  );
};
