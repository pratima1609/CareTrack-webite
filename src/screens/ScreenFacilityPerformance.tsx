/**
 * CareTrack — Screen 8: Facility Performance & Epidemiological Mortality Monitoring
 * Implements Rule 16 (mortality calculation on resolved outcomes only),
 * 15% benchmark warning, 85% success benchmark, and Scenario D.
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  Users,
  Bed,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

interface ScreenFacilityPerformanceProps {
  onNavigate: (screenId: string) => void;
  onOpenGuide: () => void;
}

export const ScreenFacilityPerformance: React.FC<ScreenFacilityPerformanceProps> = ({
  onNavigate,
  onOpenGuide,
}) => {
  const { metrics, patients, settings, recordPatientOutcomeDeath, dischargePatient } = useApp();

  const [activeTab, setActiveTab] = useState<'metrics' | 'simulator'>('metrics');

  const resolvedCohortPatients = patients.filter(
    (p) => p.status === 'discharged' || p.status === 'deceased'
  );

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
              Facility Performance & Epidemiological Surveillance
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              Executive Review
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Evaluating clinical outcomes against the 15% mortality ceiling and 85% recovery benchmark
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Scenario D Guide</span>
          </button>
        </div>
      </div>

      {/* High-Priority Mortality Warning Banner (Triggers if mortality > 15%) */}
      {metrics.isMortalityExceeded ? (
        <div className="p-5 rounded-xl border-2 border-rose-300 bg-rose-50 text-rose-950 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-rose-900">
                  Critical Alert: Mortality Rate ({metrics.mortalityRate.toFixed(1)}%) Exceeds 15.0% Benchmark
                </h3>
                <span className="text-xs font-mono font-bold uppercase bg-rose-200/90 text-rose-900 px-2 py-0.5 rounded border border-rose-300">
                  Protocol Threshold Breached
                </span>
              </div>
              <p className="text-xs text-rose-900 mt-1.5 leading-relaxed">
                The facility mortality rate is currently{' '}
                <strong className="font-bold underline">{metrics.mortalityRate.toFixed(1)}%</strong>, which exceeds the clinical threshold of 15.0%.
                This calculation is based on {metrics.totalDeaths} fatalities out of {metrics.resolvedOutcomes} total resolved patient outcomes ({metrics.totalDischarges} discharges + {metrics.totalDeaths} deaths).
              </p>
              <div className="mt-3 p-3 bg-white/80 rounded-lg border border-rose-200 text-xs text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>
                  <strong>Epidemiological Safety Rule:</strong> Active quarantine patients ({metrics.activePatients}) are strictly excluded from resolved outcome calculations to avoid falsely inflating success rates.
                </span>
                <span className="font-mono font-bold text-rose-800 shrink-0">
                  Delta: +{(metrics.mortalityRate - metrics.mortalityBenchmark).toFixed(1)}% over threshold
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-950 flex items-start gap-3 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs flex-1">
            <span className="font-bold text-emerald-900 text-sm">
              Mortality within Protocol Limits: {metrics.mortalityRate.toFixed(1)}% &le; 15.0% Benchmark
            </span>
            <p className="mt-0.5 text-emerald-800">
              Facility mortality satisfies epidemiological guidelines. Total resolved outcomes: {metrics.resolvedOutcomes} ({metrics.totalDischarges} recovered discharges, {metrics.totalDeaths} fatalities).
            </p>
          </div>
        </div>
      )}

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mortality Card */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Observed Mortality Rate</span>
            <TrendingDown className={`w-4 h-4 ${metrics.isMortalityExceeded ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl font-bold font-mono ${
                  metrics.isMortalityExceeded ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {metrics.mortalityRate.toFixed(1)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Expected Benchmark:{' '}
              <span className="font-bold text-slate-700">&le; {metrics.mortalityBenchmark}%</span>
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex justify-between font-mono">
            <span>Fatalities: {metrics.totalDeaths}</span>
            <span>Resolved: {metrics.resolvedOutcomes}</span>
          </div>
        </div>

        {/* Treatment Success Rate */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Treatment Success Rate</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-teal-700">
                {metrics.successRate.toFixed(1)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Expected Benchmark:{' '}
              <span className="font-bold text-slate-700">&ge; {metrics.successBenchmark}%</span>
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex justify-between font-mono">
            <span>Discharges: {metrics.totalDischarges}</span>
            <span>Resolved: {metrics.resolvedOutcomes}</span>
          </div>
        </div>

        {/* Occupancy Level */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Current Facility Occupancy</span>
            <Bed className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-900">
                {metrics.occupancyRate.toFixed(1)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {metrics.occupiedRooms} of 74 strict isolation rooms occupied
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex justify-between font-mono">
            <span>Available: {metrics.availableRooms}</span>
            <span>Max Cap: 74</span>
          </div>
        </div>

        {/* Total Patient Admissions */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Total Lifetime Admissions</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-900">
                {metrics.totalAdmissions}
              </span>
              <span className="text-xs text-slate-500">patients</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {metrics.activePatients} currently in active quarantine
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex justify-between font-mono">
            <span>Active: {metrics.activePatients}</span>
            <span>Resolved: {metrics.resolvedOutcomes}</span>
          </div>
        </div>
      </div>

      {/* Cohort Breakdown & Methodology */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Resolved Outcome Cohort Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Resolved Outcomes Cohort ({metrics.resolvedOutcomes} Cases)
              </h3>
              <p className="text-[11px] text-slate-500">
                Includes all finalized patient dispositions used in benchmark calculations
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
              Deaths: {metrics.totalDeaths} · Discharges: {metrics.totalDischarges}
            </span>
          </div>

          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-4">Patient ID</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Outcome</th>
                  <th className="py-2.5 px-3">Admission</th>
                  <th className="py-2.5 px-3">Resolution Date</th>
                  <th className="py-2.5 px-4">Attending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resolvedCohortPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-700">{p.id}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{p.name}</td>
                    <td className="py-2.5 px-3">
                      {p.status === 'discharged' ? (
                        <span className="inline-flex items-center gap-1 text-teal-800 font-bold bg-teal-50 border border-teal-200 px-2 py-0.5 rounded text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> Recovered & Discharged
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-800 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[10px]">
                          <AlertTriangle className="w-3 h-3" /> Fatality
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{p.admissionDate}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {p.dischargeDate || p.deathDate || '—'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{p.assignedDoctor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Mathematical Formula & Clinical Notes */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs space-y-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-600" />
              Calculation Methodology
            </h3>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] space-y-2">
              <div>
                <p className="text-slate-500 font-sans text-[10px] uppercase font-bold">Mortality Formula</p>
                <p className="font-bold text-slate-800">
                  (Deaths / Resolved Outcomes) &times; 100
                </p>
                <p className="text-slate-600 mt-0.5">
                  = ({metrics.totalDeaths} / {metrics.resolvedOutcomes}) &times; 100 ={' '}
                  <span className="font-bold text-rose-700">{metrics.mortalityRate.toFixed(1)}%</span>
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <p className="text-slate-500 font-sans text-[10px] uppercase font-bold">Success Formula</p>
                <p className="font-bold text-slate-800">
                  (Discharges / Resolved Outcomes) &times; 100
                </p>
                <p className="text-slate-600 mt-0.5">
                  = ({metrics.totalDischarges} / {metrics.resolvedOutcomes}) &times; 100 ={' '}
                  <span className="font-bold text-teal-700">{metrics.successRate.toFixed(1)}%</span>
                </p>
              </div>
            </div>

            <p className="text-slate-600 text-[11px] leading-relaxed">
              <strong>Quality Standard:</strong> Active quarantine patients are strictly excluded from the denominator. Counting active patients as successful outcomes would dangerously underestimate mortality during acute epidemiological surges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
