/**
 * CareTrack — Screen 2: Overview Dashboard
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Bed,
  CheckCircle2,
  Clock,
  Stethoscope,
  LogOut,
  AlertTriangle,
  ArrowRight,
  Thermometer,
  ShieldAlert,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { calculateDischargeEligibility, hasRecordedTemperatureToday, hasCompletedDoctorVisitToday } from '../utils/businessLogic';

interface ScreenOverviewProps {
  onNavigate: (screenId: string, patientId?: string) => void;
  onOpenGuide: () => void;
}

export const ScreenOverview: React.FC<ScreenOverviewProps> = ({ onNavigate, onOpenGuide }) => {
  const {
    metrics,
    patients,
    temperatureReadings,
    doctorVisits,
    settings,
    currentRole,
    currentUser,
  } = useApp();

  const activePatients = patients.filter((p) => p.status === 'active');

  // Find patients with fever today
  const feverPatientsToday = activePatients.filter((p) => {
    const reading = temperatureReadings.find(
      (r) => r.patientId === p.id && r.date === settings.currentSimulatedDate
    );
    return reading && reading.temperature >= settings.feverThreshold;
  });

  // Find patients with pending temperatures today
  const pendingTempPatients = activePatients.filter(
    (p) => !hasRecordedTemperatureToday(p.id, settings.currentSimulatedDate, temperatureReadings)
  );

  // Find patients with pending doctor visits today
  const pendingDoctorVisitPatients = activePatients.filter(
    (p) => !hasCompletedDoctorVisitToday(p.id, settings.currentSimulatedDate, doctorVisits)
  );

  // Find patients eligible for discharge
  const eligiblePatients = activePatients.filter((p) => {
    const elig = calculateDischargeEligibility(
      p,
      temperatureReadings,
      settings.currentSimulatedDate,
      settings.feverThreshold
    );
    return elig.isEligible;
  });

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
              Quarantine Operations Center
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
              Ward Alpha
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <span className="font-semibold text-slate-800">{currentUser.name}</span> ({currentUser.title}) · Operational Date: {settings.currentSimulatedDate}
          </p>
        </div>

        {/* Quick Role CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Assessor Walkthrough</span>
          </button>
          {currentRole === 'nurse' && (
            <button
              onClick={() => onNavigate('temperatures')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-xs transition-colors"
            >
              <Thermometer className="w-3.5 h-3.5" />
              <span>Record Temperatures</span>
            </button>
          )}
          {currentRole === 'doctor' && (
            <button
              onClick={() => onNavigate('doctor_rounds')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Daily Doctor Rounds</span>
            </button>
          )}
          {currentRole === 'admin' && (
            <button
              onClick={() => onNavigate('discharge')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Review Discharges</span>
            </button>
          )}
          {currentRole === 'manager' && (
            <button
              onClick={() => onNavigate('performance')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-xs transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Outcome Metrics</span>
            </button>
          )}
        </div>
      </div>

      {/* Priority Alerts Strip */}
      {(metrics.isMortalityExceeded || feverPatientsToday.length > 0 || pendingTempPatients.length > 0) && (
        <div className="space-y-2">
          {metrics.isMortalityExceeded && (
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-950 flex items-start gap-3 shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-rose-900 text-sm">
                    Clinical Mortality Warning: {metrics.mortalityRate.toFixed(1)}% exceeds 15% benchmark
                  </span>
                  <span className="text-[10px] font-mono bg-rose-200/80 text-rose-900 px-1.5 py-0.5 rounded font-bold">
                    Target: &le;15.0%
                  </span>
                </div>
                <p className="mt-0.5 text-rose-800">
                  {metrics.totalDeaths} fatalities out of {metrics.resolvedOutcomes} resolved outcomes ({metrics.totalDischarges} discharges + {metrics.totalDeaths} deaths). Active quarantine patients ({metrics.activePatients}) are excluded from resolved outcome calculations per epidemiological protocol.
                </p>
              </div>
              <button
                onClick={() => onNavigate('performance')}
                className="px-2.5 py-1 text-xs font-semibold text-rose-800 hover:bg-rose-100 rounded-lg transition-colors shrink-0"
              >
                Inspect Metrics &rarr;
              </button>
            </div>
          )}

          {feverPatientsToday.length > 0 && (
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-950 flex items-start gap-3 shadow-2xs">
              <Thermometer className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <span className="font-bold text-amber-900 text-sm">
                  Active Fever Alert: {feverPatientsToday.length} patient(s) &ge; {settings.feverThreshold}°C today
                </span>
                <p className="mt-0.5 text-amber-800">
                  Fever detected today: {feverPatientsToday.map((p) => `${p.name} (Room ${p.roomNumber})`).join(', ')}. Consecutive fever-free streak reset to 0. Doctor evaluation required.
                </p>
              </div>
              <button
                onClick={() => onNavigate('patients')}
                className="px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100 rounded-lg transition-colors shrink-0"
              >
                View Patients &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* Primary KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Card 1: Active Patients */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Active Patients</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{metrics.activePatients}</span>
            <span className="text-xs text-slate-400 font-mono">/ 74 max capacity</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{metrics.availableRooms} rooms vacant</span>
            <span className="font-semibold text-teal-700">{metrics.occupancyRate}% full</span>
          </div>
        </div>

        {/* Card 2: Today's Temperatures */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Daily Temperatures</span>
            <Thermometer className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {metrics.todayTempsCompleted}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              of {metrics.activePatients} checked
            </span>
          </div>
          <div className="mt-2 text-[11px] flex items-center justify-between">
            <span className={metrics.todayTempsPending > 0 ? 'text-amber-700 font-semibold' : 'text-emerald-700 font-semibold'}>
              {metrics.todayTempsPending > 0 ? `${metrics.todayTempsPending} pending` : 'All checked today'}
            </span>
            <button
              onClick={() => onNavigate('temperatures')}
              className="text-teal-700 hover:underline font-medium text-[11px]"
            >
              Log vitals
            </button>
          </div>
        </div>

        {/* Card 3: Doctor Rounds */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Doctor Rounds</span>
            <Stethoscope className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {metrics.todayDoctorVisitsCompleted}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              of {metrics.activePatients} seen
            </span>
          </div>
          <div className="mt-2 text-[11px] flex items-center justify-between">
            <span className={metrics.todayDoctorVisitsPending > 0 ? 'text-blue-700 font-semibold' : 'text-emerald-700 font-semibold'}>
              {metrics.todayDoctorVisitsPending > 0 ? `${metrics.todayDoctorVisitsPending} pending rounds` : 'Rounds complete'}
            </span>
            <button
              onClick={() => onNavigate('doctor_rounds')}
              className="text-blue-700 hover:underline font-medium text-[11px]"
            >
              Start rounds
            </button>
          </div>
        </div>

        {/* Card 4: Discharge Eligible */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Eligible for Discharge</span>
            <LogOut className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-teal-700">
              {metrics.dischargeEligibleCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">patients qualified</span>
          </div>
          <div className="mt-2 text-[11px] flex items-center justify-between">
            <span className="text-slate-500">3 fever-free days verified</span>
            <button
              onClick={() => onNavigate('discharge')}
              className="text-teal-700 hover:underline font-medium text-[11px]"
            >
              Review list
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Metric Strip: Mortality Benchmark & Room Capacities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Mortality vs Benchmark */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Mortality Benchmark</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className={`text-xl font-bold ${metrics.isMortalityExceeded ? 'text-rose-600' : 'text-emerald-600'}`}>
                {metrics.mortalityRate.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / 15.0% expected benchmark
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Cohort: {metrics.totalDeaths} deaths / {metrics.resolvedOutcomes} resolved outcomes
            </p>
          </div>
          <button
            onClick={() => onNavigate('performance')}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Success Rate vs 85% Benchmark */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Treatment Success Rate</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-teal-700">
                {metrics.successRate.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / 85.0% target benchmark
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Cohort: {metrics.totalDischarges} recovered & discharged
            </p>
          </div>
          <button
            onClick={() => onNavigate('performance')}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Room Capacity Status */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Ward Capacity (Rooms 1–74)</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-bold text-slate-900">{metrics.occupiedRooms} Occupied</span>
              <span className="text-xs text-slate-400 font-mono">· {metrics.availableRooms} Available</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Cap: 74 strict isolation rooms
            </p>
          </div>
          <button
            onClick={() => onNavigate('patients')}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Patient Workflow Summary */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900 mb-1">Standard Patient Quarantine Lifecycle</h2>
        <p className="text-xs text-slate-500 mb-4">
          Strict operational workflow ensuring no early discharges, consistent daily vitals, and physician coordination.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-teal-700 mb-1">Step 1 · Intake</div>
            <p className="text-xs font-bold text-slate-900">Room Assignment</p>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Admin registers patient and assigns unique room (1–74) within facility capacity.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-teal-700 mb-1">Step 2 · Daily Check</div>
            <p className="text-xs font-bold text-slate-900">Temperature Logging</p>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Nurse records 1 official temperature per day in Celsius. Duplicate entries blocked.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-1">Step 3 · Clinical</div>
            <p className="text-xs font-bold text-slate-900">Doctor Rounds</p>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Routine visits require today&apos;s temp. Urgent cases use documented emergency override.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 mb-1">Step 4 · Protocol</div>
            <p className="text-xs font-bold text-slate-900">3-Day Fever-Free</p>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              System requires 3 unbroken consecutive documented afebrile days. Missing days break streak.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">Step 5 · Release</div>
            <p className="text-xs font-bold text-slate-900">Admin Discharge</p>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Authorized admin confirms discharge, releases room immediately, and logs audit record.
            </p>
          </div>
        </div>
      </div>

      {/* Action Queues / Requiring Attention Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Temperatures Queue */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Pending Temperature Checks Today ({pendingTempPatients.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigate('temperatures')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900"
              >
                Log All &rarr;
              </button>
            </div>

            {pendingTempPatients.length === 0 ? (
              <div className="py-8 text-center text-xs text-emerald-700 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-600" />
                All active patients have completed temperature checks today!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {pendingTempPatients.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50/80 px-2 rounded-lg transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{p.name}</span>
                        <span className="font-mono text-[10px] text-slate-500">{p.id}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Room <span className="font-bold text-slate-800">{p.roomNumber}</span> · Admitted {p.admissionDate}
                      </p>
                    </div>
                    <button
                      onClick={() => onNavigate('temperatures', p.id)}
                      className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md border border-teal-200 transition-colors"
                    >
                      Record &rarr;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Doctor Visits Queue */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Pending Doctor Rounds Today ({pendingDoctorVisitPatients.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigate('doctor_rounds')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900"
              >
                Start Rounds &rarr;
              </button>
            </div>

            {pendingDoctorVisitPatients.length === 0 ? (
              <div className="py-8 text-center text-xs text-emerald-700 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-600" />
                All active patients have been evaluated on rounds today!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {pendingDoctorVisitPatients.slice(0, 5).map((p) => {
                  const hasTemp = hasRecordedTemperatureToday(
                    p.id,
                    settings.currentSimulatedDate,
                    temperatureReadings
                  );
                  return (
                    <div
                      key={p.id}
                      className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50/80 px-2 rounded-lg transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{p.name}</span>
                          <span className="font-mono text-[10px] text-slate-500">{p.id}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Room <span className="font-bold text-slate-800">{p.roomNumber}</span> · Temp Today:{' '}
                          <span className={hasTemp ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                            {hasTemp ? 'Logged' : 'Missing'}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => onNavigate('doctor_rounds', p.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors"
                      >
                        Visit &rarr;
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
