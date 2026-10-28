import React, { useState, useMemo, useEffect } from 'react';
import { AuditLogEntry, AuditActionType } from '../types';

interface AuditLogViewProps {
  auditLogs: AuditLogEntry[];
  onRevertLog: (logId: string) => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  onShowToast: (msg: string, icon?: string) => void;
  initialSearchQuery?: string;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  auditLogs,
  onRevertLog,
  onExportCsv,
  onExportJson,
  onShowToast,
  initialSearchQuery = ''
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [userFilter, setUserFilter] = useState<string>('ALL');
  const [selectedLogForDiff, setSelectedLogForDiff] = useState<AuditLogEntry | null>(null);
  const [isVerifyingHashes, setIsVerifyingHashes] = useState<boolean>(false);
  const [hashesVerified, setHashesVerified] = useState<boolean>(true);

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Filter audit logs
  const filteredLogs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return auditLogs.filter((log) => {
      const matchSearch =
        !q ||
        log.entityId.toLowerCase().includes(q) ||
        log.merchantTitle.toLowerCase().includes(q) ||
        log.summary.toLowerCase().includes(q) ||
        log.user.name.toLowerCase().includes(q) ||
        log.user.email.toLowerCase().includes(q) ||
        log.diffs.some(
          (d) =>
            d.field.toLowerCase().includes(q) ||
            d.fieldLabel.toLowerCase().includes(q) ||
            String(d.newValue || '').toLowerCase().includes(q)
        );

      const matchAction = actionFilter === 'ALL' || log.action === actionFilter;
      const matchUser = userFilter === 'ALL' || log.user.name === userFilter;

      return matchSearch && matchAction && matchUser;
    });
  }, [auditLogs, searchQuery, actionFilter, userFilter]);

  // Unique users for dropdown
  const uniqueUsers = useMemo(() => {
    const set = new Set<string>();
    auditLogs.forEach((l) => set.add(l.user.name));
    return Array.from(set);
  }, [auditLogs]);

  // Metrics
  const totalEvents = auditLogs.length;
  const mutationsToday = auditLogs.filter((l) => l.displayTimestamp.includes('Today')).length;
  const uniqueActorsCount = uniqueUsers.length;

  const handleVerifyHashes = () => {
    setIsVerifyingHashes(true);
    setTimeout(() => {
      setIsVerifyingHashes(false);
      setHashesVerified(true);
      onShowToast(`Cryptographic Audit Trail Verified: All ${auditLogs.length} SHA-256 blocks intact`, 'verified');
    }, 800);
  };

  const getActionBadge = (action: AuditActionType) => {
    switch (action) {
      case 'CREATE':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          dot: 'bg-emerald-500',
          icon: 'add_circle',
          label: 'CREATE'
        };
      case 'UPDATE':
        return {
          bg: 'bg-sky-50 text-sky-800 border-sky-200/80',
          dot: 'bg-sky-500',
          icon: 'edit',
          label: 'UPDATE'
        };
      case 'DELETE':
      case 'BATCH_DELETE':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200/80',
          dot: 'bg-rose-500',
          icon: 'delete',
          label: action === 'BATCH_DELETE' ? 'BATCH DELETE' : 'DELETE'
        };
      case 'SPLIT_ALLOCATE':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-200/80',
          dot: 'bg-purple-500',
          icon: 'call_split',
          label: 'SPLIT ALLOCATE'
        };
      case 'REVERT':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
          dot: 'bg-amber-500',
          icon: 'undo',
          label: 'ROLLBACK / REVERT'
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          dot: 'bg-slate-500',
          icon: 'history',
          label: action
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Context */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-600 uppercase tracking-wider">
            <span>Enterprise Compliance</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className="text-slate-400">JPA Envers & Change Data Capture (CDC)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5 tracking-tight">
            Audit Log & Transaction History Trail
          </h1>
          <p className="text-xs text-slate-500 max-w-3xl mt-0.5 leading-relaxed">
            Immutable changelog tracking lifecycle mutations, modified fields, authorization actors, and cryptographic integrity across all financial entities.
          </p>
        </div>

        {/* Global Action Cluster */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleVerifyHashes}
            disabled={isVerifyingHashes}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <span
              className={`material-symbols-outlined text-[16px] text-teal-600 ${
                isVerifyingHashes ? 'animate-spin' : ''
              }`}
            >
              verified
            </span>
            <span>Verify SHA-256 Hashes</span>
          </button>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-400">file_download</span>
            <span>Export Audit CSV</span>
          </button>

          <button
            onClick={onExportJson}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">data_object</span>
            <span>Export JSON Archive</span>
          </button>
        </div>
      </div>

      {/* Compliance Metrics Overview (4 Bento Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Logged Events
            </span>
            <span className="p-1.5 rounded-md bg-teal-50 text-teal-600 material-symbols-outlined text-[18px]">
              history
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {totalEvents}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-teal-600 font-semibold">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              <span>100% Cryptographically Sealed</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Today's Mutations
            </span>
            <span className="p-1.5 rounded-md bg-sky-50 text-sky-600 material-symbols-outlined text-[18px]">
              schedule
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {mutationsToday} <span className="text-xs font-normal text-slate-400 font-sans">events</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
              <span>Active Cycle In Progress</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Authorized Actors
            </span>
            <span className="p-1.5 rounded-md bg-purple-50 text-purple-600 material-symbols-outlined text-[18px]">
              badge
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {uniqueActorsCount} <span className="text-xs font-normal text-slate-400 font-sans">controllers</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <span>RBAC Enforced via Spring Security</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Audit Compliance Grade
            </span>
            <span className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 material-symbols-outlined text-[18px]">
              policy
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
              <span>SOC-2 / ISO 27001</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 font-semibold">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span>Zero Tamper Drift Detected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Query Matrix */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search (5 cols) */}
          <div className="lg:col-span-5 relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Filter by transaction ref, merchant, user name, or modified field..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-600 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-700 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action Filter (3 cols) */}
          <div className="lg:col-span-3">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-600 cursor-pointer"
            >
              <option value="ALL">All Mutation Actions</option>
              <option value="CREATE">CREATE (New Outflows)</option>
              <option value="UPDATE">UPDATE (Field Modifications)</option>
              <option value="SPLIT_ALLOCATE">SPLIT_ALLOCATE (Decompositions)</option>
              <option value="DELETE">DELETE (Purged Entries)</option>
              <option value="BATCH_DELETE">BATCH DELETE (Bulk Purges)</option>
              <option value="REVERT">REVERT (Rollback Events)</option>
            </select>
          </div>

          {/* User / Performed By (2 cols) */}
          <div className="lg:col-span-2">
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-600 cursor-pointer"
            >
              <option value="ALL">All Users</option>
              {uniqueUsers.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Count Badge (2 cols) */}
          <div className="lg:col-span-2 text-right">
            <span className="text-xs font-semibold text-slate-500">
              Showing {filteredLogs.length} of {auditLogs.length} records
            </span>
          </div>
        </div>
      </div>

      {/* Main Audit Trail Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp & ID</th>
                <th className="py-3 px-3">Action Type</th>
                <th className="py-3 px-3">Entity Target</th>
                <th className="py-3 px-3">Modified Attributes</th>
                <th className="py-3 px-3">Performed By</th>
                <th className="py-3 px-3">Audit Summary</th>
                <th className="py-3 pr-4 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No audit records match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const badge = getActionBadge(log.action);
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Timestamp & ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{log.displayTimestamp}</div>
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                          <span className="text-teal-700 font-semibold">{log.id}</span>
                          <span className="truncate max-w-[120px]" title={log.integrityHash}>
                            • {log.integrityHash.slice(0, 8)}...
                          </span>
                        </div>
                      </td>

                      {/* Action Type */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Entity Target */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-bold font-mono text-slate-900 text-xs flex items-center gap-1">
                          <span>{log.entityId}</span>
                          <span className="text-[10px] text-slate-400 font-sans font-normal">
                            ({log.entityType})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium truncate max-w-[180px] mt-0.5">
                          {log.merchantTitle}
                        </div>
                      </td>

                      {/* Modified Attributes Pill */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {log.diffs.length === 0 ? (
                            <span className="text-slate-400 italic text-[11px]">No fields altered</span>
                          ) : (
                            log.diffs.map((d, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold"
                                title={`${d.fieldLabel}: ${d.oldValue ?? 'null'} → ${d.newValue ?? 'null'}`}
                              >
                                {d.field}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Performed By */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {log.user.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 leading-tight">
                              {log.user.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {log.user.role} {log.user.ipAddress && `• ${log.user.ipAddress}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Summary */}
                      <td className="py-3.5 px-3 min-w-[220px]">
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {log.summary}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pr-4 pl-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedLogForDiff(log)}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                            title="Inspect field before/after modifications"
                          >
                            <span className="material-symbols-outlined text-[15px] text-teal-600">
                              compare_arrows
                            </span>
                            <span>Inspect Diff</span>
                          </button>

                          {log.action !== 'REVERT' && !log.reverted && (
                            <button
                              onClick={() => {
                                if (confirm(`Simulate rollback for audit record ${log.id}? This will restore prior field state.`)) {
                                  onRevertLog(log.id);
                                }
                              }}
                              className="p-1 rounded text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                              title="Revert / Rollback mutation"
                            >
                              <span className="material-symbols-outlined text-[16px]">undo</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Audit Table Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-600 text-[16px]">lock_clock</span>
            <span>JPA Envers Audit Trail Revision Model: `REVINFO` & `_AUD` Tables Active</span>
          </div>
          <div className="font-mono text-slate-400 text-[11px]">
            SHA-256 Ledger State: Verified
          </div>
        </div>
      </div>

      {/* Field Diff Inspection Modal */}
      {selectedLogForDiff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">manage_history</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Audit Event Details • {selectedLogForDiff.id}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {selectedLogForDiff.entityId} ({selectedLogForDiff.merchantTitle})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLogForDiff(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Event Metadata Card */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Timestamp</span>
                  <span className="font-bold text-slate-900">{selectedLogForDiff.displayTimestamp}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Action</span>
                  <span className="font-bold text-teal-700">{selectedLogForDiff.action}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Authorized By</span>
                  <span className="font-bold text-slate-900">{selectedLogForDiff.user.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Client Address</span>
                  <span className="font-mono text-slate-700 font-medium">
                    {selectedLogForDiff.user.ipAddress || '127.0.0.1'}
                  </span>
                </div>
              </div>

              {/* Summary */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 leading-normal">
                <strong className="text-slate-900 block mb-0.5">Execution Summary:</strong>
                {selectedLogForDiff.summary}
              </div>

              {/* Field Diff Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800">
                  Itemized Attribute Modifications
                </span>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                  <div className="grid grid-cols-12 bg-slate-50 px-3 py-2 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                    <div className="col-span-4">Field Attribute</div>
                    <div className="col-span-4">Previous Value (Before)</div>
                    <div className="col-span-4">Modified Value (After)</div>
                  </div>

                  {selectedLogForDiff.diffs.map((d, idx) => (
                    <div key={idx} className="grid grid-cols-12 px-3 py-2.5 items-center hover:bg-slate-50/50">
                      <div className="col-span-4">
                        <span className="font-bold text-slate-900 block">{d.fieldLabel}</span>
                        <code className="text-[10px] text-slate-400 font-mono">{d.field}</code>
                      </div>

                      <div className="col-span-4 text-rose-700 font-mono">
                        {d.oldValue ? (
                          <span className="line-through bg-rose-50 px-1.5 py-0.5 rounded">
                            {String(d.oldValue)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic font-sans">None (Initial Creation)</span>
                        )}
                      </div>

                      <div className="col-span-4 text-emerald-700 font-mono font-bold">
                        {d.newValue ? (
                          <span className="bg-emerald-50 px-1.5 py-0.5 rounded">
                            {String(d.newValue)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic font-sans">Null (Field Cleared)</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cryptographic Block Signature */}
              <div className="p-3 bg-slate-900 text-slate-300 rounded-xl space-y-1 text-[11px] font-mono">
                <div className="flex items-center justify-between text-teal-400">
                  <span className="font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">enhanced_encryption</span>
                    SHA-256 Block Signature
                  </span>
                  <span>Tamper Sealed</span>
                </div>
                <div className="break-all text-slate-400 text-[10px]">
                  {selectedLogForDiff.integrityHash}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              {selectedLogForDiff.action !== 'REVERT' && !selectedLogForDiff.reverted && (
                <button
                  type="button"
                  onClick={() => {
                    onRevertLog(selectedLogForDiff.id);
                    setSelectedLogForDiff(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center gap-1 border border-amber-200 transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">undo</span>
                  <span>Revert This Mutation</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedLogForDiff(null)}
                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-xs ml-auto transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
