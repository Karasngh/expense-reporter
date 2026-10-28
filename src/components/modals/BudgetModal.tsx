import React, { useState, useEffect } from 'react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCap: number;
  totalSpent: number;
  onSaveCap: (newCap: number) => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  currentCap,
  totalSpent,
  onSaveCap
}) => {
  const [capValue, setCapValue] = useState<string>(currentCap.toString());

  useEffect(() => {
    setCapValue(currentCap.toString());
  }, [currentCap, isOpen]);

  if (!isOpen) return null;

  const parsedCap = parseFloat(capValue) || currentCap;
  const simulatedRemaining = parsedCap - totalSpent;
  const simulatedUtilization = parsedCap > 0 ? ((totalSpent / parsedCap) * 100).toFixed(1) : '0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedCap > 0) {
      onSaveCap(parsedCap);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[18px]">tune</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Adjust March 2025 Target</h3>
              <p className="text-[11px] text-slate-400 font-mono">Target Recalculation Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700" htmlFor="targetCapInput">
              Monthly Target Cap (INR ₹)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-teal-600 font-bold text-base select-none">₹</span>
              <input
                id="targetCapInput"
                type="number"
                step="500"
                min="1000"
                required
                value={capValue}
                onChange={(e) => setCapValue(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-slate-200 text-base font-mono font-bold focus:outline-none focus:border-teal-600 bg-slate-50 focus:bg-white"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Adjusting this dynamically updates runway velocity, runway indicators, and warning thresholds.
            </p>
          </div>

          {/* Real-time Simulation Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Projected Recalibration
            </span>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Current Spend:</span>
              <span className="font-mono font-bold text-slate-900">
                ₹{totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Simulated Remaining:</span>
              <span
                className={`font-mono font-bold ${
                  simulatedRemaining >= 0 ? 'text-teal-600' : 'text-rose-600'
                }`}
              >
                ₹{simulatedRemaining.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Simulated Utilization:</span>
              <span className="font-mono font-bold text-slate-900">{simulatedUtilization}%</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>Apply & Sync DB</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
