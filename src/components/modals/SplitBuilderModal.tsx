import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, SplitAllocation } from '../../types';

interface SplitBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  activeTxId?: string | null;
  onSaveSplit: (parentId: string, splits: SplitAllocation[]) => void;
}

export const SplitBuilderModal: React.FC<SplitBuilderModalProps> = ({
  isOpen,
  onClose,
  transactions,
  activeTxId,
  onSaveSplit
}) => {
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [splitRows, setSplitRows] = useState<SplitAllocation[]>([]);

  // Find currently selected parent
  const parentTx = useMemo(() => {
    return transactions.find((t) => t.id === selectedParentId) || transactions[0];
  }, [transactions, selectedParentId]);

  useEffect(() => {
    if (activeTxId) {
      setSelectedParentId(activeTxId);
    } else if (transactions.length > 0 && !selectedParentId) {
      setSelectedParentId(transactions[0].id);
    }
  }, [activeTxId, transactions, selectedParentId]);

  // When parent transaction changes, populate initial split lines
  useEffect(() => {
    if (parentTx) {
      if (parentTx.splits && parentTx.splits.length > 0) {
        setSplitRows(JSON.parse(JSON.stringify(parentTx.splits)));
      } else {
        const targetAmount = parentTx.amount;
        const part1 = parseFloat((targetAmount * 0.6).toFixed(2));
        const part2 = parseFloat((targetAmount * 0.2).toFixed(2));
        const part3 = parseFloat((targetAmount - part1 - part2).toFixed(2));

        setSplitRows([
          { category: 'Food & Dining', amount: part1, note: 'Primary team allocation' },
          { category: 'Shopping', amount: part2, note: 'Office hardware & attire' },
          { category: 'Grocery', amount: part3, note: 'Pantry supplies & essentials' }
        ]);
      }
    }
  }, [parentTx]);

  if (!isOpen || !parentTx) return null;

  const targetAmount = parentTx.amount;
  const currentSum = splitRows.reduce((acc, row) => acc + (Number(row.amount) || 0), 0);
  const diff = parseFloat((targetAmount - currentSum).toFixed(2));
  const isStrictMatch = Math.abs(diff) < 0.01;
  const percentAllocated = targetAmount > 0 ? Math.min(100, Math.max(0, (currentSum / targetAmount) * 100)) : 0;

  const handleCategoryChange = (index: number, newCategory: string) => {
    const updated = [...splitRows];
    updated[index].category = newCategory;
    setSplitRows(updated);
  };

  const handleNoteChange = (index: number, newNote: string) => {
    const updated = [...splitRows];
    updated[index].note = newNote;
    setSplitRows(updated);
  };

  const handleAmountChange = (index: number, newAmountStr: string) => {
    const updated = [...splitRows];
    updated[index].amount = parseFloat(newAmountStr) || 0;
    setSplitRows(updated);
  };

  const handleAddRow = () => {
    setSplitRows([...splitRows, { category: 'Shopping', amount: 0, note: '' }]);
  };

  const handleRemoveRow = (index: number) => {
    if (splitRows.length <= 2) {
      return;
    }
    const updated = splitRows.filter((_, i) => i !== index);
    setSplitRows(updated);
  };

  const handleResetDefaults = () => {
    const part1 = parseFloat((targetAmount * 0.6).toFixed(2));
    const part2 = parseFloat((targetAmount * 0.2).toFixed(2));
    const part3 = parseFloat((targetAmount - part1 - part2).toFixed(2));

    setSplitRows([
      { category: 'Food & Dining', amount: part1, note: 'Primary team allocation' },
      { category: 'Shopping', amount: part2, note: 'Office hardware & attire' },
      { category: 'Grocery', amount: part3, note: 'Pantry supplies & essentials' }
    ]);
  };

  const handleSave = () => {
    if (!isStrictMatch) return;
    onSaveSplit(parentTx.id, splitRows);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">call_split</span>
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base leading-tight">
                Split Allocation Builder (Requirement 4D)
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Atomic Child Item Generation • Zero Balance Enforcement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Parent Transaction Selector */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Select Parent Transaction</span>
              <span className="text-slate-400 font-normal">Active ledger records</span>
            </label>
            <select
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-600 cursor-pointer"
            >
              {transactions.map((tx) => (
                <option key={tx.id} value={tx.id}>
                  {tx.id} • {tx.merchant} — ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({tx.date})
                </option>
              ))}
            </select>
          </div>

          {/* Target Amount Badge */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-teal-600 text-[26px]">receipt</span>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Target Reconciliation Amount:
                </span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {parentTx.merchant} <span className="font-normal text-slate-500">({parentTx.date})</span>
                </div>
              </div>
            </div>
            <div className="flex items-baseline gap-1 bg-white border border-slate-200 px-3.5 py-1.5 rounded-lg shadow-xs">
              <span className="text-sm font-bold text-teal-600">₹</span>
              <span className="text-xl font-bold font-mono text-slate-900">
                {targetAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Dynamic Split Allocation Rows */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">Sub-Ledger Child Allocations</span>
                <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-semibold text-[11px]">
                  {splitRows.length} Rows
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddRow}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                <span>Add Allocation Row</span>
              </button>
            </div>

            {/* Split Rows List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {splitRows.map((row, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg transition-all"
                >
                  <span className="w-5 text-center font-mono text-xs text-slate-400 font-semibold">
                    #{idx + 1}
                  </span>

                  {/* Category Selector */}
                  <div className="w-36 sm:w-44 shrink-0">
                    <select
                      value={row.category}
                      onChange={(e) => handleCategoryChange(idx, e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-md font-medium text-slate-800 focus:outline-none focus:border-teal-600 cursor-pointer"
                    >
                      <option value="Food & Dining">Food & Dining</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Grocery">Grocery</option>
                      <option value="Bills & Utilities">Bills & Utilities</option>
                      <option value="Travel">Travel</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                    </select>
                  </div>

                  {/* Allocation Note */}
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      placeholder="Allocation memo / purpose..."
                      value={row.note || ''}
                      onChange={(e) => handleNoteChange(idx, e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-600"
                    />
                  </div>

                  {/* Amount */}
                  <div className="relative w-28 shrink-0">
                    <span className="absolute left-2.5 top-1.5 text-xs font-bold text-teal-600">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={row.amount}
                      onChange={(e) => handleAmountChange(idx, e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded-md text-right focus:outline-none focus:border-teal-600"
                    />
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    disabled={splitRows.length <= 2}
                    onClick={() => handleRemoveRow(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title={splitRows.length <= 2 ? "A split requires at least 2 rows" : "Delete allocation line"}
                  >
                    <span className="material-symbols-outlined text-[18px]">remove_circle_outline</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Real-Time Balance & Zero Variance Card */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              isStrictMatch
                ? 'bg-teal-50 border-teal-200 text-teal-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isStrictMatch ? 'text-teal-600' : 'text-rose-600'
                  }`}
                >
                  {isStrictMatch ? 'check_circle' : 'warning'}
                </span>
                <span className="text-xs font-bold">
                  {isStrictMatch
                    ? 'Constraint Satisfied — Zero Variance Reached'
                    : diff < 0
                    ? 'Allocation Exceeds Parent Principal'
                    : 'Under-Allocated Balance'}
                </span>
              </div>
              <div className="text-xs font-mono">
                <span className="text-slate-500">Allocated: </span>
                <span className="font-bold">₹{currentSum.toFixed(2)}</span>
                <span className="text-slate-400"> / ₹{targetAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2.5">
              <div
                className={`h-full transition-all duration-300 ${
                  isStrictMatch ? 'bg-teal-600' : 'bg-rose-600'
                }`}
                style={{ width: `${percentAllocated}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between mt-2 text-[11px]">
              <span className="font-medium">
                {isStrictMatch ? (
                  <span className="text-teal-700 font-semibold">
                    Difference: ₹0.00 — Ready to Commit to Database
                  </span>
                ) : (
                  <span className="text-rose-700 font-semibold">
                    Difference: {diff > 0 ? `+₹${diff.toFixed(2)} remaining` : `-₹${Math.abs(diff).toFixed(2)} excess`}
                  </span>
                )}
              </span>
              <span className="text-slate-500 font-mono">
                Target match: {((currentSum / (targetAmount || 1)) * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Architectural Guarantee Notice */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
            <span className="material-symbols-outlined text-teal-600 text-[18px] shrink-0 mt-0.5">
              verified_user
            </span>
            <div>
              <strong>Architectural Guarantee:</strong> Enforces that allocation sum strictly equals the original amount before saving. Child items receive foreign keys to <code className="font-mono text-teal-700 bg-teal-50 px-1 py-0.5 rounded">parent_transaction_id</code> with cascade update semantics.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-xs transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold transition-colors"
            >
              Reset Defaults
            </button>
            <button
              type="button"
              disabled={!isStrictMatch}
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Save Split Allocation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
