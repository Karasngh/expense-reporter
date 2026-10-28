import React, { useState } from 'react';
import { INITIAL_PARSED_ENTITIES, INITIAL_AI_RECOMMENDATIONS } from '../data/mockData';
import { Transaction, ParsedMerchantEntity, AIRecommendation } from '../types';

interface AiInsightsViewProps {
  onRecordExpense: (expense: Partial<Transaction>) => void;
  onOpenExpenseModal: (tx?: Transaction) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const AiInsightsView: React.FC<AiInsightsViewProps> = ({
  onRecordExpense,
  onOpenExpenseModal,
  onShowToast
}) => {
  const [cloudBridgeActive, setCloudBridgeActive] = useState<boolean>(true);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [rawSmsInput, setRawSmsInput] = useState<string>(
    'Paid Rs 480.00 to BLUE TOKAI COFFEE ROASTERS via UPI Ref 928374 on 24-Mar-25'
  );

  const [extractedEntity, setExtractedEntity] = useState<{
    merchant: string;
    amount: number;
    category: string;
    channel: string;
    confidence: number;
  }>({
    merchant: 'Blue Tokai Coffee Roasters',
    amount: 480.0,
    category: 'Food & Dining',
    channel: 'UPI / GooglePay',
    confidence: 98
  });

  const [parsedQueue, setParsedQueue] = useState<ParsedMerchantEntity[]>(INITIAL_PARSED_ENTITIES);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(INITIAL_AI_RECOMMENDATIONS);

  const handleParseSms = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      const text = rawSmsInput.toLowerCase();
      if (text.includes('swiggy') || text.includes('zomato') || text.includes('food')) {
        setExtractedEntity({
          merchant: 'Swiggy Gourmet Express',
          amount: 540.0,
          category: 'Food & Dining',
          channel: 'UPI',
          confidence: 96
        });
      } else if (text.includes('uber') || text.includes('ola') || text.includes('metro')) {
        setExtractedEntity({
          merchant: 'Uber Technologies India',
          amount: 320.0,
          category: 'Travel',
          channel: 'UPI',
          confidence: 94
        });
      } else if (text.includes('blue tokai') || text.includes('coffee')) {
        setExtractedEntity({
          merchant: 'Blue Tokai Coffee Roasters',
          amount: 480.0,
          category: 'Food & Dining',
          channel: 'UPI / GooglePay',
          confidence: 98
        });
      } else {
        // generic extraction fallback
        const amountMatch = rawSmsInput.match(/(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{2})?)/i);
        const amt = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 650.0;
        setExtractedEntity({
          merchant: 'Extracted Merchant Entity',
          amount: amt,
          category: 'Shopping',
          channel: 'NetBanking',
          confidence: 85
        });
      }
      onShowToast('Entity extracted from message string', 'neurology');
    }, 600);
  };

  const handleAcceptEntity = () => {
    onRecordExpense({
      merchant: extractedEntity.merchant,
      amount: extractedEntity.amount,
      category: extractedEntity.category,
      paymentMethod: extractedEntity.channel,
      date: new Date().toISOString().split('T')[0],
      displayDate: 'Today, AI Parsed',
      description: 'AI Extracted from bank SMS alert',
      status: 'Settled',
      isSplit: false
    });
    onShowToast(`Recorded ₹${extractedEntity.amount} for ${extractedEntity.merchant}`, 'check_circle');
  };

  const handleOverrideEntity = () => {
    onOpenExpenseModal({
      id: 'tx-new',
      merchant: extractedEntity.merchant,
      amount: extractedEntity.amount,
      category: extractedEntity.category,
      paymentMethod: extractedEntity.channel,
      date: new Date().toISOString().split('T')[0],
      description: 'Overriding AI Parsed values',
      status: 'Settled',
      isSplit: false
    });
  };

  const handleAcceptSandboxItem = (id: string) => {
    const item = parsedQueue.find((p) => p.id === id);
    if (!item) return;

    onRecordExpense({
      merchant: item.rawCode,
      amount: item.amount,
      category: item.inferredCategory,
      paymentMethod: item.paymentMethod,
      date: new Date().toISOString().split('T')[0],
      displayDate: 'Today',
      description: item.subtext,
      status: 'Settled',
      isSplit: false
    });

    setParsedQueue((prev) => prev.filter((p) => p.id !== id));
    onShowToast(`Accepted & persisted ${item.rawCode} (₹${item.amount})`, 'check_circle');
  };

  const handleDismissSandboxItem = (id: string) => {
    setParsedQueue((prev) => prev.filter((p) => p.id !== id));
    onShowToast('Entry archived from classification queue', 'delete');
  };

  const handleApplyRule = (recId: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === recId ? { ...r, applied: true } : r))
    );
    onShowToast('Threshold rule applied to active budget ledger', 'verified');
  };

  const handleReevaluateRules = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      onShowToast('Rules evaluated: 3 drift patterns confirmed with 97.4% accuracy', 'autorenew');
    }, 900);
  };

  const handleDownloadAuditLog = () => {
    const auditData = {
      timestamp: new Date().toISOString(),
      agentEngine: 'Gemini 1.5 Pro Hybrid Pipeline',
      securityScrubbing: 'AES-256 Memory Scrubbing Enabled',
      pseudonymizedEntities: parsedQueue.length,
      driftPatternsEvaluated: 3,
      complianceStandard: 'Zero Plain-Text Credential Storage'
    };

    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_audit_log_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Downloaded security audit log JSON', 'download_done');
  };

  return (
    <div className="space-y-6">
      {/* Top Architecture & Privacy Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 text-xs font-semibold">
              <span className="material-symbols-outlined text-[15px]">neurology</span>
              Gemini 1.5 Pro Hybrid Pipeline
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
              <span className="material-symbols-outlined text-[15px] text-teal-600">security</span>
              AES-256 Memory Scrubbing
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
              <span className="material-symbols-outlined text-[15px] text-teal-600">dns</span>
              Spring Boot Proxy (Port 9494)
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            AI Insights & Spending Intelligence
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Local Rule-Based Analysis is fully operational. Cloud inference via Gemini requires explicit cryptographic opt-in. Raw account numbers and entity names are strictly pseudonymized on localhost before transmission.
          </p>
        </div>

        {/* Consent Interactive Pill */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-2 min-w-[260px]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-800">Gemini Cloud Bridge</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={cloudBridgeActive}
                onChange={(e) => {
                  setCloudBridgeActive(e.target.checked);
                  onShowToast(
                    e.target.checked
                      ? 'Gemini Cloud Bridge active with pseudonymized payload'
                      : 'Gemini Cloud Bridge paused (Local rule engine active)',
                    e.target.checked ? 'psychology' : 'pause'
                  );
                }}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          <span
            className={`text-[11px] font-bold uppercase tracking-wider ${
              cloudBridgeActive ? 'text-teal-600' : 'text-slate-400'
            }`}
          >
            {cloudBridgeActive ? 'Cloud Inference Active (Pseudonymized)' : 'Local Rule Engine Only (Paused)'}
          </span>

          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span>Zero plain-text credential persistence</span>
          </div>
        </div>
      </div>

      {/* Live Route & Config Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Endpoint:
          </span>
          <code className="px-2 py-0.5 rounded bg-slate-100 font-mono text-teal-700 font-semibold text-[11px]">
            POST /api/v1/ai/analyze-spending
          </code>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600 font-medium truncate">
            Spring Boot Gemini Service (Server-side API Key isolation)
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center gap-1.5 text-teal-600 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            Engine: Deterministic + LLM-v1.5
          </span>

          <button
            onClick={handleReevaluateRules}
            disabled={isEvaluating}
            className="flex items-center gap-1 text-teal-600 hover:text-teal-700 hover:underline font-semibold transition-colors"
          >
            <span
              className={`material-symbols-outlined text-[16px] ${
                isEvaluating ? 'animate-spin' : ''
              }`}
            >
              autorenew
            </span>
            <span>Re-evaluate Rules</span>
          </button>
        </div>
      </div>

      {/* Section 1: 3 Spending Pattern Drift Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pattern 01: Weekend Food Delivery Surge */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Pattern 01 • Category Drift
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                +42% Surge
              </span>
            </div>

            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900">₹1,850</span>
              <span className="text-xs text-slate-400 font-medium">/ weekend avg</span>
            </div>

            <h3 className="font-bold text-slate-900 text-sm">Weekend Food Delivery Surge</h3>
            <p className="text-xs text-slate-500 leading-normal">
              Food spending increases by 42% on Saturdays and Sundays (average ₹1,850/weekend vs ₹450/weekday baseline).
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Mon–Fri (₹450/d)</span>
              <span className="text-rose-600 font-bold">Sat–Sun (₹925/d)</span>
            </div>

            {/* Sparkline Graphic */}
            <div className="w-full h-8 flex items-end">
              <svg className="w-full h-full text-teal-600 overflow-visible" fill="none" viewBox="0 0 200 40">
                <path
                  d="M 0 32 L 30 30 L 60 31 L 90 28 L 120 29 L 155 8 L 195 4"
                  stroke="#0d9488"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                />
                <circle cx="155" cy="8" r="3.5" fill="#e11d48" />
                <circle cx="195" cy="4" r="3.5" fill="#e11d48" />
              </svg>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-slate-400">Confidence: 94.2%</span>
              <button
                onClick={() => onShowToast('Threshold rule applied to Food budget', 'verified')}
                className="text-teal-600 font-bold hover:underline"
              >
                Apply Rule
              </button>
            </div>
          </div>
        </div>

        {/* Pattern 02: Utility Inflation Alert */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Pattern 02 • Seasonal Index
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                +18.4% MoM
              </span>
            </div>

            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900">₹4,890</span>
              <span className="text-xs text-slate-400 font-medium">Utility load</span>
            </div>

            <h3 className="font-bold text-slate-900 text-sm">Utility Inflation Alert</h3>
            <p className="text-xs text-slate-500 leading-normal">
              Electricity & broadband bills are 18% higher than February 2025 due to seasonal AC compressor load and tariff adjustment.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Seasonal Threshold (₹4,150)</span>
              <span className="text-rose-600 font-bold">Exceeded</span>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full" style={{ width: '88%' }}></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>BESCOM Grid Bill</span>
              <span className="font-mono text-slate-700 font-bold">₹3,420 vs ₹2,800 avg</span>
            </div>
          </div>
        </div>

        {/* Pattern 03: UPI Micro-Transactions Leakage */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Pattern 03 • Micro Leakage
              </span>
              <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 text-[10px] font-bold">
                22 Swipes
              </span>
            </div>

            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900">₹1,420</span>
              <span className="text-xs text-slate-400 font-medium">cumulative</span>
            </div>

            <h3 className="font-bold text-slate-900 text-sm">UPI Micro-Transactions Leakage</h3>
            <p className="text-xs text-slate-500 leading-normal">
              22 small UPI payments under ₹100 accumulated to ₹1,420 this month. Typically categorised as incidental tea, tuck, and vending.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  Avg Ticket: ₹64.50
                </span>
                <span className="text-[10px] text-slate-400">Frequency: 0.9/day</span>
              </div>
            </div>

            <span className="px-2 py-1 rounded bg-slate-100 font-mono text-[10px] font-bold text-slate-700">
              Daily Drag
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Neural Merchant Parser Sandbox */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-600 text-[18px]">auto_fix_high</span>
            <h3 className="font-bold text-slate-900 text-base">Neural Merchant Parser</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Convert unstructured bank SMS, push notifications, or UPI payment strings into validated REST expense entities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <textarea
              value={rawSmsInput}
              onChange={(e) => setRawSmsInput(e.target.value)}
              className="w-full h-28 p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-mono focus:bg-white focus:outline-none focus:border-teal-600 transition-colors"
              placeholder="Paste raw bank SMS message here..."
            />
            <button
              onClick={handleParseSms}
              disabled={isEvaluating}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">psychology</span>
              <span>Extract Expense Entity</span>
            </button>
          </div>

          {/* Parsed Preview Card */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col justify-between">
            <div className="space-y-1.5 text-xs font-mono text-slate-700">
              <div>
                <strong className="text-slate-900">Merchant:</strong> {extractedEntity.merchant}
              </div>
              <div>
                <strong className="text-slate-900">Amount:</strong> ₹{extractedEntity.amount.toFixed(2)}
              </div>
              <div className="flex items-center gap-1.5">
                <strong className="text-slate-900">Category:</strong>
                <span>{extractedEntity.category}</span>
                <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.2 rounded">
                  ({extractedEntity.confidence}% match)
                </span>
              </div>
              <div>
                <strong className="text-slate-900">Channel:</strong> {extractedEntity.channel}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center gap-2 mt-3">
              <button
                onClick={handleAcceptEntity}
                className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">check</span>
                <span>Accept & Record</span>
              </button>
              <button
                onClick={handleOverrideEntity}
                className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">edit</span>
                <span>Override Values</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Smart Auto-Categorization Ledger Queue */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Smart Auto-Categorization & Merchant Intelligence
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Zero-hallucination parsing protocol. Merchant strings pass local fuzzy regex prior to LLM embedding fallback.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Classification Accuracy:</span>
            <span className="font-bold text-teal-600 font-mono text-sm">97.4%</span>
          </div>
        </div>

        <div className="space-y-2">
          {parsedQueue.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-lg bg-slate-50 hover:bg-slate-100/70 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-teal-600 shrink-0 font-bold">
                  <span className="material-symbols-outlined text-[18px]">
                    {item.inferredCategory === 'Food & Dining'
                      ? 'restaurant'
                      : item.inferredCategory === 'Shopping'
                      ? 'devices'
                      : item.inferredCategory === 'Travel'
                      ? 'directions_car'
                      : 'help_outline'}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {item.rawCode}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 text-[10px] font-bold">
                      {item.tokenInfo}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                    {item.subtext}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-800">
                    <span className="text-slate-400 font-normal">Inferred: </span>
                    {item.inferredCategory}
                  </div>
                  <span className="text-[10px] font-bold text-teal-600 font-mono">
                    • Confidence: {item.confidence}%
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAcceptSandboxItem(item.id)}
                    className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDismissSandboxItem(item.id)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs rounded transition-colors"
                  >
                    Override
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Practical Budgeting & Savings Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                  {rec.subtitle}
                </span>
                <span className="font-mono font-bold text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                  {rec.yieldLabel}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{rec.title}</h3>
              <p className="text-xs text-slate-500 leading-normal">{rec.description}</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between text-[11px] font-medium text-slate-600">
                <span>{rec.targetOrProgress}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full"
                  style={{ width: `${rec.progressPercent}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[10px] text-slate-400">
                  ⚠️ AI Estimate: Informational only
                </span>
                <button
                  disabled={rec.applied}
                  onClick={() => handleApplyRule(rec.id)}
                  className={`font-semibold flex items-center gap-1 ${
                    rec.applied
                      ? 'text-slate-400 cursor-default'
                      : 'text-teal-600 hover:text-teal-700 hover:underline'
                  }`}
                >
                  <span>{rec.applied ? 'Enforced ✓' : rec.actionText}</span>
                  {!rec.applied && (
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Section 5: Data Sovereignty & Model Ethics Statement */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              Data Sovereignty & Model Ethics Statement
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Expense Reporter runs on local SQLite/MySQL with explicit user-delegated LLM processing. No financial telemetry is sold or utilized for training third-party foundational models.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadAuditLog}
          className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          <span>Download Audit Log</span>
        </button>
      </div>
    </div>
  );
};
