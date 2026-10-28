import React from 'react';
import { Transaction } from '../../types';

interface SplitBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onEditSplit?: (txId: string) => void;
}

export const SplitBreakdownModal: React.FC<SplitBreakdownModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onEditSplit
}) => {
  if (!isOpen || !transaction) return null;

  const splits = transaction.splits || [];
  const totalAmount = transaction.amount;

  const colors = ['#0d9488', '#565e74', '#14b8a6', '#f43f5e', '#38bdf8', '#8b5cf6'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">donut_large</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Split Breakdown</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {transaction.id} • {transaction.merchant}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Circular Visual Preview */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Parent Outflow</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs font-semibold text-teal-600 mt-1">
                {splits.length} Sub-Ledger Allocations
              </span>
            </div>

            {/* SVG Ring Visualization */}
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" fill="none" r="15.915" stroke="#e2e8f0" strokeWidth="4"></circle>
                {/* SVG Segments */}
                {splits.map((s, i) => {
                  const pct = totalAmount > 0 ? (s.amount / totalAmount) * 100 : 0;
                  const prevPctSum = splits
                    .slice(0, i)
                    .reduce((sum, item) => sum + (item.amount / totalAmount) * 100, 0);
                  const color = colors[i % colors.length];

                  return (
                    <circle
                      key={i}
                      cx="18"
                      cy="18"
                      fill="none"
                      r="15.915"
                      stroke={color}
                      strokeDasharray={`${pct}, 100`}
                      strokeDashoffset={-prevPctSum}
                      strokeWidth="4"
                    ></circle>
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs text-slate-800">
                100%
              </div>
            </div>
          </div>

          {/* Itemized Rows */}
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
            {splits.map((sp, idx) => {
              const pct = totalAmount > 0 ? ((sp.amount / totalAmount) * 100).toFixed(1) : '0';
              const color = colors[idx % colors.length];

              return (
                <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                      style={{ backgroundColor: color }}
                    ></span>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{sp.category}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {sp.note || 'No auxiliary notes attached'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-xs text-slate-900">
                      ₹{Number(sp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-[10px] font-semibold text-teal-600">
                      {pct}% of parent
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Relational Entity Association Pill */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Relational Association</span>
            <span className="font-mono text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded">
              @OneToMany: Parent_ID = {transaction.id}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {onEditSplit ? (
            <button
              onClick={() => {
                onClose();
                onEditSplit(transaction.id);
              }}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Modify Allocations</span>
            </button>
          ) : (
            <div></div>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-xs transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
