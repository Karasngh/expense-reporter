import React, { useState, useEffect } from 'react';
import { Transaction } from '../../types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: Partial<Transaction>) => void;
  initialData?: Transaction | null;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [amount, setAmount] = useState<string>('');
  const [merchant, setMerchant] = useState<string>('');
  const [category, setCategory] = useState<string>('Food & Dining');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setMerchant(initialData.merchant);
      setCategory(initialData.category === 'Split' ? 'Food & Dining' : initialData.category);
      setPaymentMethod(initialData.paymentMethod);
      setDate(initialData.date);
      setNotes(initialData.description || '');
    } else {
      setAmount('');
      setMerchant('');
      setCategory('Food & Dining');
      setPaymentMethod('UPI');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0 || !merchant.trim()) {
      return;
    }

    onSave({
      id: initialData?.id,
      amount: parsedAmount,
      merchant: merchant.trim(),
      category,
      paymentMethod,
      date,
      displayDate: date === new Date().toISOString().split('T')[0] ? 'Today' : date,
      description: notes.trim() || 'Direct ledger entry',
      status: initialData?.status || 'Settled'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[18px]">
                {initialData ? 'edit_note' : 'post_add'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {initialData ? 'Edit Expense Entry' : 'Record New Expense'}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Post payload to Spring Boot REST endpoint
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="amountInput">
              Amount (₹ INR) *
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-teal-600 font-bold text-base select-none">₹</span>
              <input
                id="amountInput"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-sm font-mono font-semibold focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all bg-slate-50/50 focus:bg-white"
              />
            </div>
          </div>

          {/* Merchant */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="merchantInput">
              Merchant / Description *
            </label>
            <input
              id="merchantInput"
              type="text"
              required
              placeholder="e.g. Swiggy Express or AWS Cloud"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all bg-slate-50/50 focus:bg-white"
            />
          </div>

          {/* Category & Payment Method Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="categorySelect">
                Category *
              </label>
              <select
                id="categorySelect"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
              >
                <option value="Food & Dining">Food & Dining</option>
                <option value="Grocery">Grocery</option>
                <option value="Bills & Utilities">Bills & Utilities</option>
                <option value="Travel">Travel</option>
                <option value="Shopping">Shopping</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Other">Other Expenses</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="paymentSelect">
                Payment Channel *
              </label>
              <select
                id="paymentSelect"
                required
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-teal-600 cursor-pointer"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Corporate Card">Corporate Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="NetBanking">NetBanking</option>
                <option value="Cash">Cash in Hand</option>
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="dateInput">
              Transaction Date *
            </label>
            <input
              id="dateInput"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-teal-600 bg-white"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="notesInput">
              Notes / Tags (Optional)
            </label>
            <input
              id="notesInput"
              type="text"
              placeholder="e.g. Team cafeteria lunch & beverages"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-teal-600 bg-slate-50/50 focus:bg-white"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
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
              <span>{initialData ? 'Update Record' : 'Record to DB'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
