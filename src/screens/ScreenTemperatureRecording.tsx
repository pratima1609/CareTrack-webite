/**
 * CareTrack — Screen 4: Temperature Recording (Celsius)
 * Implements Rule 4 (active only), Rule 5 (1 record/day duplicate lock),
 * Rule 6 (configurable threshold), Rule 7 (missing != normal), and Scenario A.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Bed,
  Calendar,
  AlertCircle,
  FileText,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  hasRecordedTemperatureToday,
  validateTemperatureInput,
  getPatientDailyTemperature,
} from '../utils/businessLogic';

interface ScreenTemperatureRecordingProps {
  preselectedPatientId?: string;
  onNavigate: (screenId: string, patientId?: string) => void;
}

export const ScreenTemperatureRecording: React.FC<ScreenTemperatureRecordingProps> = ({
  preselectedPatientId,
  onNavigate,
}) => {
  const {
    patients,
    temperatureReadings,
    settings,
    currentUser,
    currentRole,
    recordTemperature,
    metrics,
  } = useApp();

  const activePatients = useMemo(
    () => patients.filter((p) => p.status === 'active'),
    [patients]
  );

  // Selected patient state
  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => {
    if (preselectedPatientId && activePatients.some((p) => p.id === preselectedPatientId)) {
      return preselectedPatientId;
    }
    // Default to first patient with pending temperature today
    const pendingOne = activePatients.find(
      (p) => !hasRecordedTemperatureToday(p.id, settings.currentSimulatedDate, temperatureReadings)
    );
    return pendingOne ? pendingOne.id : activePatients[0]?.id || '';
  });

  useEffect(() => {
    if (preselectedPatientId && activePatients.some((p) => p.id === preselectedPatientId)) {
      setSelectedPatientId(preselectedPatientId);
    }
  }, [preselectedPatientId, activePatients]);

  const selectedPatient = useMemo(
    () => activePatients.find((p) => p.id === selectedPatientId),
    [activePatients, selectedPatientId]
  );

  // Form inputs
  const [tempInput, setTempInput] = useState<string>('36.8');
  const [measurementTime, setMeasurementTime] = useState<string>('08:30');
  const [observations, setObservations] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // Check if today's reading already exists
  const existingTodayReading = useMemo(() => {
    if (!selectedPatientId) return undefined;
    return getPatientDailyTemperature(
      selectedPatientId,
      settings.currentSimulatedDate,
      temperatureReadings
    );
  }, [selectedPatientId, settings.currentSimulatedDate, temperatureReadings]);

  // Live input validation preview
  const liveValidation = useMemo(() => {
    return validateTemperatureInput(tempInput, settings.feverThreshold);
  }, [tempInput, settings.feverThreshold]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);

    if (!selectedPatient) {
      setErrorMessage('Please select an active patient');
      return;
    }

    // Duplicate check
    if (existingTodayReading) {
      setErrorMessage(
        `Duplicate Entry Blocked: ${selectedPatient.name} already has an official reading (${existingTodayReading.temperature.toFixed(
          1
        )}°C) recorded today. CareTrack policy permits exactly 1 official daily measurement.`
      );
      // Execute attempt to log to audit log
      recordTemperature(selectedPatient.id, parseFloat(tempInput), observations);
      return;
    }

    if (!liveValidation.valid || liveValidation.value === undefined) {
      setErrorMessage(liveValidation.error || 'Invalid temperature');
      return;
    }

    setIsSubmitting(true);
    const res = recordTemperature(
      selectedPatient.id,
      liveValidation.value,
      observations
    );
    setIsSubmitting(false);

    if (res.success) {
      setSuccessInfo(
        `Successfully logged ${liveValidation.value}°C for ${selectedPatient.name} (Room ${selectedPatient.roomNumber}).`
      );
      setObservations('');
    } else {
      setErrorMessage(res.error || 'Could not record temperature');
    }
  };

  // Find next pending patient
  const nextPendingPatient = useMemo(() => {
    return activePatients.find(
      (p) =>
        p.id !== selectedPatientId &&
        !hasRecordedTemperatureToday(p.id, settings.currentSimulatedDate, temperatureReadings)
    );
  }, [activePatients, selectedPatientId, settings.currentSimulatedDate, temperatureReadings]);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
              Daily Temperature Recording
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
              Protocol: 1 Reading / Day
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official Celsius clinical logging for {settings.currentSimulatedDate} · Logged by{' '}
            <span className="font-semibold text-slate-800">{currentUser.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedPatient && (
            <button
              onClick={() => onNavigate('history', selectedPatient.id)}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              View Patient Chart &rarr;
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Patient Selector & Clinical Identity Card */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Quarantine Patient
            </label>

            <select
              value={selectedPatientId}
              onChange={(e) => {
                setSelectedPatientId(e.target.value);
                setErrorMessage(null);
                setSuccessInfo(null);
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              {activePatients.map((p) => {
                const recorded = hasRecordedTemperatureToday(
                  p.id,
                  settings.currentSimulatedDate,
                  temperatureReadings
                );
                return (
                  <option key={p.id} value={p.id}>
                    Room {p.roomNumber} — {p.name} ({recorded ? 'Logged Today' : 'PENDING'})
                  </option>
                );
              })}
            </select>

            {selectedPatient ? (
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-400 text-[10px]">{selectedPatient.id}</span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                    Room {selectedPatient.roomNumber}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900">{selectedPatient.name}</p>
                  <p className="text-slate-500 text-[11px]">
                    {selectedPatient.age} yrs · {selectedPatient.gender} · Admitted{' '}
                    {selectedPatient.admissionDate}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Attending Physician
                  </span>
                  <span className="text-slate-700 font-medium">{selectedPatient.assignedDoctor}</span>
                </div>
              </div>
            ) : null}

            {/* Daily Status Indicator */}
            {existingTodayReading ? (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Today&apos;s Reading Complete</p>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    {existingTodayReading.temperature.toFixed(1)}°C recorded by{' '}
                    {existingTodayReading.recordedBy} at{' '}
                    {existingTodayReading.timestamp.split('T')[1].substring(0, 5)}. Duplicate readings are locked.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Daily Check Pending</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    No official temperature reading has been recorded for this patient on{' '}
                    {settings.currentSimulatedDate}.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Progress Indicator */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Shift Progress
            </span>
            <div className="flex items-center justify-between font-mono">
              <span className="text-slate-600">Daily checks completed:</span>
              <span className="font-bold text-slate-900">
                {metrics.todayTempsCompleted} / {metrics.activePatients}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-teal-500 transition-all"
                style={{
                  width: `${
                    metrics.activePatients > 0
                      ? (metrics.todayTempsCompleted / metrics.activePatients) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Right: The Recording Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-5"
          >
            <div>
              <h2 className="text-base font-bold text-slate-900">Enter Clinical Measurement</h2>
              <p className="text-xs text-slate-500">
                Temperature is evaluated against the configurable fever threshold (
                <span className="font-semibold text-slate-800">{settings.feverThreshold}°C</span>).
              </p>
            </div>

            {/* Alerts if any */}
            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Entry Restricted</p>
                  <p className="mt-0.5 text-rose-800">{errorMessage}</p>
                </div>
              </div>
            )}

            {successInfo && (
              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Measurement Saved</p>
                  <p className="mt-0.5 text-emerald-800">{successInfo}</p>
                </div>
              </div>
            )}

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Temperature in Celsius */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Temperature (°C) *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Plausible: 33.0 – 44.0°C</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="36.8"
                    value={tempInput}
                    onChange={(e) => {
                      setTempInput(e.target.value);
                      setErrorMessage(null);
                    }}
                    className={`w-full px-3.5 py-2.5 text-lg font-mono font-bold rounded-lg border transition-all ${
                      !liveValidation.valid
                        ? 'border-rose-400 focus:ring-rose-500'
                        : liveValidation.isFever
                        ? 'border-amber-400 bg-amber-50/50 text-amber-950 focus:ring-amber-500'
                        : 'border-slate-300 focus:ring-teal-500'
                    }`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-400 font-bold">
                    °C
                  </span>
                </div>

                {/* Real-time threshold indicator preview */}
                <div className="mt-1.5 text-xs">
                  {liveValidation.valid && liveValidation.value !== undefined ? (
                    liveValidation.isFever ? (
                      <span className="text-amber-700 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Fever Alert: {liveValidation.value}°C &ge; {settings.feverThreshold}°C threshold
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Normal reading (&lt; {settings.feverThreshold}°C threshold)
                      </span>
                    )
                  ) : (
                    <span className="text-rose-600 text-[11px]">{liveValidation.error}</span>
                  )}
                </div>
              </div>

              {/* Time of measurement */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Time of Measurement
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="time"
                    value={measurementTime}
                    onChange={(e) => setMeasurementTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-mono font-semibold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Recorded on facility date: {settings.currentSimulatedDate}
                </span>
              </div>

              {/* Observations */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Clinical Observations & Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., Patient denies chills or headache. Skin warm and dry. Resting in bed..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Duplicate Notice */}
            {existingTodayReading && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  <strong>Duplicate Safeguard:</strong> This patient already has an official temperature check for today. Saving is locked to maintain clinical record integrity.
                </span>
              </div>
            )}

            {/* Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                {nextPendingPatient && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPatientId(nextPendingPatient.id);
                      setErrorMessage(null);
                      setSuccessInfo(null);
                    }}
                    className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
                  >
                    <span>Next pending: {nextPendingPatient.name} (Room {nextPendingPatient.roomNumber})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={isSubmitting || !!existingTodayReading}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Thermometer className="w-4 h-4" />
                  <span>Save Official Daily Reading</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
