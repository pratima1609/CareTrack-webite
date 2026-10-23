/**
 * CareTrack — Screen 6: Doctor Daily Rounds & Emergency Overrides
 * Implements Rule 8 (routine visits require today's temp),
 * Rule 9 (urgent visits via documented override), and Scenario B.
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  FileText,
  X,
  AlertCircle,
  Eye,
  Thermometer,
  ChevronRight,
} from 'lucide-react';
import { Patient, VisitType } from '../types';
import {
  hasRecordedTemperatureToday,
  hasCompletedDoctorVisitToday,
  getPatientDailyTemperature,
  calculateDischargeEligibility,
} from '../utils/businessLogic';

interface ScreenDoctorRoundsProps {
  preselectedPatientId?: string;
  onNavigate: (screenId: string, patientId?: string) => void;
}

export const ScreenDoctorRounds: React.FC<ScreenDoctorRoundsProps> = ({
  preselectedPatientId,
  onNavigate,
}) => {
  const {
    patients,
    temperatureReadings,
    doctorVisits,
    settings,
    currentUser,
    currentRole,
    recordDoctorVisit,
    metrics,
  } = useApp();

  const [filterType, setFilterType] = useState<'pending' | 'completed' | 'all'>('pending');
  const [selectedPatientForModal, setSelectedPatientForModal] = useState<Patient | null>(null);
  const [isEmergencyModal, setIsEmergencyModal] = useState(false);

  // Form State
  const [notes, setNotes] = useState('');
  const [emergencyReason, setEmergencyReason] = useState('');
  const [recommendation, setRecommendation] = useState<
    'continue_quarantine' | 'eligible_for_discharge' | 'urgent_care'
  >('continue_quarantine');
  const [formError, setFormError] = useState<string | null>(null);

  const activePatients = useMemo(
    () => patients.filter((p) => p.status === 'active'),
    [patients]
  );

  // Filtered patients for rounds checklist
  const displayPatients = useMemo(() => {
    return activePatients.filter((p) => {
      const isCompleted = hasCompletedDoctorVisitToday(
        p.id,
        settings.currentSimulatedDate,
        doctorVisits
      );
      if (filterType === 'pending') return !isCompleted;
      if (filterType === 'completed') return isCompleted;
      return true;
    });
  }, [activePatients, filterType, settings.currentSimulatedDate, doctorVisits]);

  // Open visit modal
  const handleOpenVisitModal = (patient: Patient, isEmergency: boolean = false) => {
    setSelectedPatientForModal(patient);
    setIsEmergencyModal(isEmergency);
    setFormError(null);
    setEmergencyReason('');

    // Pre-populate sensible defaults
    const todayTemp = getPatientDailyTemperature(
      patient.id,
      settings.currentSimulatedDate,
      temperatureReadings
    );
    const elig = calculateDischargeEligibility(
      patient,
      temperatureReadings,
      settings.currentSimulatedDate,
      settings.feverThreshold
    );

    if (elig.isEligible) {
      setRecommendation('eligible_for_discharge');
      setNotes('Patient has completed 3 consecutive documented afebrile days with clear clinical presentation. Cleared for release.');
    } else if (todayTemp?.isFever) {
      setRecommendation('continue_quarantine');
      setNotes('Active febrile state. Prescribe antipyretics and maintain quarantine protocol.');
    } else {
      setRecommendation('continue_quarantine');
      setNotes('Stable vital trajectory. Continue routine daily monitoring.');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedPatientForModal) return;

    const hasTodayTemp = hasRecordedTemperatureToday(
      selectedPatientForModal.id,
      settings.currentSimulatedDate,
      temperatureReadings
    );

    // Rule 8: Prevent routine visit completion if today's temp is missing
    if (!isEmergencyModal && !hasTodayTemp) {
      setFormError(
        "Routine Visit Blocked: Today's official temperature check is required prior to standard rounds. If urgent, use the documented Emergency Override."
      );
      return;
    }

    // Rule 9: Emergency override requires documented reason
    if (isEmergencyModal && !emergencyReason.trim()) {
      setFormError('Clinical justification is required to authorize an emergency override.');
      return;
    }

    if (!notes.trim()) {
      setFormError('Clinical visit notes are required.');
      return;
    }

    const visitType: VisitType = isEmergencyModal ? 'emergency' : 'routine';
    const res = recordDoctorVisit(
      selectedPatientForModal.id,
      notes,
      visitType,
      isEmergencyModal ? emergencyReason : undefined,
      recommendation
    );

    if (res.success) {
      setSelectedPatientForModal(null);
      setNotes('');
      setEmergencyReason('');
    } else {
      setFormError(res.error || 'Failed to record visit');
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
              Physician Daily Rounds
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              Clinical Review
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Conducting rounds for {settings.currentSimulatedDate} · Attending:{' '}
            <span className="font-semibold text-slate-800">{currentUser.name}</span>
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
          <button
            onClick={() => setFilterType('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filterType === 'pending'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending Rounds ({metrics.todayDoctorVisitsPending})
          </button>
          <button
            onClick={() => setFilterType('completed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filterType === 'completed'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({metrics.todayDoctorVisitsCompleted})
          </button>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filterType === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Active ({metrics.activePatients})
          </button>
        </div>
      </div>

      {/* Rounds Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Patient / ID</th>
                <th className="py-3 px-3">Room</th>
                <th className="py-3 px-3">Latest Temp</th>
                <th className="py-3 px-3">Temp Recorded Today</th>
                <th className="py-3 px-3">Rounds Status</th>
                <th className="py-3 px-4">Today&apos;s Clinical Assessment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No patients match the {filterType} filter.
                  </td>
                </tr>
              ) : (
                displayPatients.map((patient) => {
                  const hasTempToday = hasRecordedTemperatureToday(
                    patient.id,
                    settings.currentSimulatedDate,
                    temperatureReadings
                  );
                  const hasVisitToday = hasCompletedDoctorVisitToday(
                    patient.id,
                    settings.currentSimulatedDate,
                    doctorVisits
                  );

                  const todayReading = getPatientDailyTemperature(
                    patient.id,
                    settings.currentSimulatedDate,
                    temperatureReadings
                  );

                  const todayVisit = doctorVisits.find(
                    (v) => v.patientId === patient.id && v.date === settings.currentSimulatedDate
                  );

                  return (
                    <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{patient.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">{patient.id}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {patient.age} yrs · {patient.underlyingConditions?.join(', ') || 'No known comorbidities'}
                        </div>
                      </td>

                      {/* Room */}
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          Rm {patient.roomNumber}
                        </span>
                      </td>

                      {/* Latest Temp */}
                      <td className="py-3.5 px-3">
                        {todayReading ? (
                          <div>
                            <span
                              className={`font-mono font-bold ${
                                todayReading.isFever ? 'text-rose-600' : 'text-slate-900'
                              }`}
                            >
                              {todayReading.temperature.toFixed(1)}°C
                            </span>
                            {todayReading.isFever && (
                              <span className="block text-[10px] text-rose-600 font-semibold">
                                Fever Alert
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-amber-700 italic font-medium">None today</span>
                        )}
                      </td>

                      {/* Temp Today: Yes / No */}
                      <td className="py-3.5 px-3">
                        {hasTempToday ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Clock className="w-3.5 h-3.5" /> No (Pending)
                          </span>
                        )}
                      </td>

                      {/* Doctor Visit Status */}
                      <td className="py-3.5 px-3">
                        {hasVisitToday ? (
                          <span className="inline-flex items-center gap-1 text-blue-700 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {todayVisit?.visitType === 'emergency' ? 'Emergency' : 'Completed'}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">Pending</span>
                        )}
                      </td>

                      {/* Notes Preview */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {todayVisit ? (
                          <div>
                            <p className="truncate font-medium text-slate-800">{todayVisit.notes}</p>
                            {todayVisit.visitType === 'emergency' && (
                              <span className="text-[10px] text-rose-600 font-semibold block">
                                Override: {todayVisit.emergencyReason}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Rounds not yet recorded</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Standard Visit Button */}
                          <button
                            onClick={() => handleOpenVisitModal(patient, false)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors shadow-2xs flex items-center gap-1"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span>{hasVisitToday ? 'Update Notes' : 'Record Visit'}</span>
                          </button>

                          {/* Emergency Override Button: visible if temp is missing */}
                          {!hasTempToday && (
                            <button
                              onClick={() => handleOpenVisitModal(patient, true)}
                              title="Override and conduct emergency urgent visit without today's temperature"
                              className="px-2 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors shadow-2xs flex items-center gap-1"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Emergency Override</span>
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
      </div>

      {/* Visit Recording Modal (Handles Routine & Emergency Override) */}
      {selectedPatientForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            {/* Header */}
            <div
              className={`p-5 border-b flex items-center justify-between ${
                isEmergencyModal
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isEmergencyModal ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
                  }`}
                >
                  {isEmergencyModal ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Stethoscope className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {isEmergencyModal ? 'Emergency Physician Visit Override' : 'Routine Doctor Rounds'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Patient: {selectedPatientForModal.name} (Room {selectedPatientForModal.roomNumber})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatientForModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              {/* Check if temp missing and this is routine attempt */}
              {!isEmergencyModal &&
                !hasRecordedTemperatureToday(
                  selectedPatientForModal.id,
                  settings.currentSimulatedDate,
                  temperatureReadings
                ) && (
                  <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      Routine Visit Blocked by Clinical Policy
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      CareTrack Rule 8 requires today&apos;s official temperature check before completing routine rounds. Today&apos;s reading is currently missing.
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const id = selectedPatientForModal.id;
                          setSelectedPatientForModal(null);
                          onNavigate('temperatures', id);
                        }}
                        className="px-2.5 py-1 bg-white border border-amber-300 text-amber-900 rounded font-semibold text-xs hover:bg-amber-100 transition-colors"
                      >
                        Record Temp First &rarr;
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEmergencyModal(true)}
                        className="px-2.5 py-1 bg-rose-600 text-white rounded font-semibold text-xs hover:bg-rose-700 transition-colors"
                      >
                        Switch to Emergency Override
                      </button>
                    </div>
                  </div>
                )}

              {/* Emergency Override Warning Banner */}
              {isEmergencyModal && (
                <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-950 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-rose-900">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    Documented Emergency Override Active
                  </div>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    Executing an emergency override allows acute clinical intervention without today&apos;s temperature check.
                    <strong className="block mt-1">
                      Note: This visit will NOT falsely mark the patient&apos;s daily temperature check as complete. A clinical audit entry will be generated.
                    </strong>
                  </p>
                </div>
              )}

              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 font-medium">
                  {formError}
                </div>
              )}

              {/* Emergency Override Reason */}
              {isEmergencyModal && (
                <div>
                  <label className="block font-bold text-rose-900 mb-1">
                    Mandatory Clinical Justification for Override *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Acute dyspnea refractory to oxygen, patient in distress, triage team dispatched..."
                    value={emergencyReason}
                    onChange={(e) => setEmergencyReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-rose-50/20"
                  />
                </div>
              )}

              {/* Visit Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Clinical Examination & Treatment Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Auscultation results, symptoms, treatment prescribed, medication adjustments..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Recommendation */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Physician Quarantine Recommendation
                </label>
                <select
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="continue_quarantine">Continue Standard Quarantine Isolation</option>
                  <option value="eligible_for_discharge">
                    Authorize Clearance for Admin Discharge (Afebrile 3+ Days)
                  </option>
                  <option value="urgent_care">Transfer to High-Dependency / Urgent Care</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPatientForModal(null)}
                  className="px-3.5 py-1.5 font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 font-semibold text-white rounded-lg shadow-xs transition-colors ${
                    isEmergencyModal ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isEmergencyModal ? 'Confirm Emergency Override' : 'Complete Routine Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
