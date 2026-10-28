import React, { useState } from 'react';
import { OCR_RECEIPT_IMAGE } from '../../data/mockData';
import { Transaction } from '../../types';

interface OcrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordOcrExpense: (expense: Partial<Transaction>) => void;
}

export const OcrScannerModal: React.FC<OcrScannerModalProps> = ({
  isOpen,
  onClose,
  onRecordOcrExpense
}) => {
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanned, setScanned] = useState<boolean>(true);
  const [merchant, setMerchant] = useState<string>('Reliance Smart Bazaar');
  const [amount, setAmount] = useState<string>('3480.00');
  const [category, setCategory] = useState<string>('Grocery');
  const [gstin, setGstin] = useState<string>('29AABCR8492K1Z9');
  const [receiptImage, setReceiptImage] = useState<string>(OCR_RECEIPT_IMAGE);

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    setScanning(true);
    setScanned(false);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
      setMerchant('Fresh Supermarket & Gourmet');
      setAmount('2150.00');
      setCategory('Grocery');
      setGstin('29AABCU4912L1Z4');
    }, 1200);
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setReceiptImage(event.target.result as string);
          handleSimulateScan();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRecord = () => {
    onRecordOcrExpense({
      merchant,
      amount: parseFloat(amount) || 3480,
      category,
      paymentMethod: 'Corporate Card',
      date: new Date().toISOString().split('T')[0],
      displayDate: 'Today, OCR Verified',
      description: `OCR Scanned GST invoice (${gstin})`,
      status: 'Settled',
      isSplit: false
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[20px]">document_scanner</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                Smart OCR Bill Scanner
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                High-precision GST & UPI receipt parser
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
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            {/* Left: Image / Scan preview */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-3/4 flex flex-col justify-end">
              <img
                src={receiptImage}
                alt="Receipt Scan"
                className="absolute inset-0 w-full h-full object-cover opacity-85"
              />

              {/* Laser Scanning Animation */}
              {scanning && (
                <div className="absolute inset-x-0 h-1 bg-teal-400 shadow-[0_0_15px_#2dd4bf] animate-bounce"></div>
              )}

              {/* Overlay controls */}
              <div className="relative z-10 p-3 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent flex items-center justify-between">
                <span className="text-xs text-white font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                  {scanning ? 'Analyzing Text Tokens...' : 'Scan Complete'}
                </span>

                <label className="text-[11px] font-semibold text-teal-300 bg-teal-950/80 hover:bg-teal-900 px-2.5 py-1 rounded cursor-pointer border border-teal-500/40 transition-colors">
                  Upload Bill
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Right: Extracted Data */}
            <div className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">
                    Extracted Entity
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-semibold">
                    Confidence: 98.6%
                  </span>
                </div>

                {/* Merchant Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Merchant Name
                  </label>
                  <input
                    type="text"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-teal-600"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Invoice Amount (₹ INR)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-teal-600">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                {/* Category & GSTIN */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-teal-600"
                    >
                      <option value="Grocery">Grocery</option>
                      <option value="Food & Dining">Food & Dining</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Bills & Utilities">Bills & Utilities</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      GSTIN / Tax ID
                    </label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                {/* Parsed Line items preview */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-[11px] font-mono text-slate-600">
                  <div className="flex justify-between">
                    <span>• Fresh Produce & Pantry</span>
                    <span>₹2,250.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Cleaning & Household Essentials</span>
                    <span>₹1,000.00</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>• CGST + SGST (9% each)</span>
                    <span>₹230.00</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSimulateScan}
                  className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">sync</span>
                  <span>Re-scan</span>
                </button>
                <button
                  type="button"
                  onClick={handleRecord}
                  className="flex-1 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>Commit to Ledger</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
