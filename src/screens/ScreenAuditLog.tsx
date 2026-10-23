/**
 * CareTrack — Screen 9: System Audit Trail & Compliance Log
 * Implements Rule 15 (audit trail preserved) and provides full traceability.
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  ShieldCheck,
  AlertTriangle,
  Clock,
  User,
  X,
} from 'lucide-react';
import { AuditCategory, AuditLogEntry } from '../types';

export const ScreenAuditLog: React.FC = () => {
  const { auditLogs } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.patientId && log.patientId.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedCategory !== 'all' && log.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [auditLogs, searchQuery, selectedCategory]);

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `caretrack_audit_log_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const categoryStyles: Record<AuditCategory, string> = {
    registration: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    temperature: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    doctor_visit: 'bg-blue-50 text-blue-700 border-blue-200',
    clinical_override: 'bg-rose-50 text-rose-700 border-rose-200',
    discharge: 'bg-teal-50 text-teal-700 border-teal-200',
    settings: 'bg-amber-50 text-amber-700 border-amber-200',
    system: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
              Clinical & Administrative Audit Log
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Immutable Traceability
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking every vital entry, duplicate block, physician round, emergency override, and discharge
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Audit Log (JSON)</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'temperature', label: 'Temperatures' },
            { id: 'doctor_visit', label: 'Doctor Rounds' },
            { id: 'clinical_override', label: 'Overrides' },
            { id: 'discharge', label: 'Discharges' },
            { id: 'registration', label: 'Registrations' },
            { id: 'settings', label: 'Protocols' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-teal-600 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Actor & Role</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Patient ID</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {log.timestamp.replace('T', ' ').substring(0, 19)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{log.actor}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">
                        {log.role}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                          categoryStyles[log.category] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {log.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{log.action}</td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-700">
                      {log.patientId || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-md truncate">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  Event ID: {selectedLog.id}
                </span>
                <h3 className="text-base font-bold text-slate-900">{selectedLog.action}</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Actor</span>
                  <p className="font-bold text-slate-900">{selectedLog.actor}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Role</span>
                  <p className="font-bold text-slate-900 uppercase font-mono">{selectedLog.role}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Timestamp</span>
                  <p className="font-mono text-slate-700">{selectedLog.timestamp}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Patient Reference</span>
                  <p className="font-mono font-bold text-slate-900">{selectedLog.patientId || 'System Level'}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Full Audit Description
                </span>
                <p className="text-slate-800 leading-relaxed text-xs">{selectedLog.details}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
