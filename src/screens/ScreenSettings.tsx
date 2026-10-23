/**
 * CareTrack — Screen 10: Clinical Protocols & Facility Configuration
 * Implements Rule 6 (configurable threshold with disclaimer) and simulation tools.
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sliders,
  AlertTriangle,
  RotateCcw,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { MAX_FACILITY_CAPACITY, offsetDate } from '../utils/businessLogic';

interface ScreenSettingsProps {
  onOpenGuide: () => void;
}

export const ScreenSettings: React.FC<ScreenSettingsProps> = ({ onOpenGuide }) => {
  const {
    settings,
    updateFeverThreshold,
    setSimulatedDate,
    advanceSimulatedDate,
    resetToSeedData,
  } = useApp();

  const [thresholdInput, setThresholdInput] = useState(settings.feverThreshold.toString());
  const [dateInput, setDateInput] = useState(settings.currentSimulatedDate);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleUpdateThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(thresholdInput);
    if (!isNaN(val) && val >= 36.0 && val <= 41.0) {
      updateFeverThreshold(Math.round(val * 10) / 10);
    }
  };

  const handleUpdateDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (dateInput) {
      setSimulatedDate(dateInput);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
              Clinical Protocols & System Parameters
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Admin & Governance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure acute fever criteria, facility date timeline, and demo environment state
          </p>
        </div>

        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Assessor Scenarios</span>
        </button>
      </div>

      {/* Provisional Setting Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-3 shadow-2xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-bold text-amber-900 text-sm">
            Provisional Demonstration Setting Notice
          </p>
          <p className="text-amber-800 mt-1 leading-relaxed">
            The fever threshold is initially set to <strong>37.5°C</strong> for assessment prototype purposes only. In a production healthcare deployment, this parameter must be clinically validated and approved by the facility medical director based on epidemiological pathogen profiles and measurement method (oral, axillary, or tympanic).
          </p>
        </div>
      </div>

      {/* Configuration Cards */}
      <div className="space-y-4">
        {/* Card 1: Configurable Fever Threshold */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-600" />
                Acute Fever Cutoff Threshold (°C)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Temperatures at or above this threshold trigger fever alerts and reset discharge streaks.
              </p>
            </div>
            <span className="text-lg font-mono font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-lg">
              {settings.feverThreshold.toFixed(1)}°C
            </span>
          </div>

          <form onSubmit={handleUpdateThreshold} className="flex items-center gap-3">
            <div className="relative w-40">
              <input
                type="number"
                step="0.1"
                min="36.0"
                max="41.0"
                value={thresholdInput}
                onChange={(e) => setThresholdInput(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-400">
                °C
              </span>
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
            >
              Update Threshold
            </button>
            <span className="text-[11px] text-slate-400">Allowed range: 36.0°C – 41.0°C</span>
          </form>
        </div>

        {/* Card 2: Date Simulator (Crucial for Testing Multi-Day Rules!) */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                Facility Operational Date Simulator
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Step the operational calendar forward to simulate consecutive days for temperature logging and discharge eligibility.
              </p>
            </div>
            <span className="font-mono font-bold text-xs bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              {settings.currentSimulatedDate}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => advanceSimulatedDate(-1)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              &larr; Step Back 1 Day
            </button>
            <button
              onClick={() => advanceSimulatedDate(1)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors"
            >
              Advance +1 Day (Next Shift) &rarr;
            </button>
            <form onSubmit={handleUpdateDate} className="flex items-center gap-2 ml-auto">
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs"
              >
                Set Date
              </button>
            </form>
          </div>
        </div>

        {/* Card 3: Capacity & Architecture Constraints */}
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            Hard Facility Constraints
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Maximum Capacity</span>
              <p className="font-bold text-base text-slate-900 mt-0.5">{MAX_FACILITY_CAPACITY} Beds</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Rooms numbered 1 to 74</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Daily Frequency</span>
              <p className="font-bold text-base text-slate-900 mt-0.5">1 Reading / Day</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Duplicate prevention locked</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Discharge Criterion</span>
              <p className="font-bold text-base text-teal-700 mt-0.5">3 Full Days</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Unbroken afebrile logs</p>
            </div>
          </div>
        </div>

        {/* Card 4: Reset Demo Data */}
        <div className="p-6 rounded-xl bg-white border border-rose-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-rose-950 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              Reset Demonstration Dataset
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Restores the original 22+ active patients, pre-calculated historical readings, and initial logs.
            </p>
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
          >
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Reset All Data?</h3>
                <p className="text-xs text-slate-500">
                  This restores the initial demo database and re-initializes all scenarios.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetToSeedData();
                  setShowResetConfirm(false);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
