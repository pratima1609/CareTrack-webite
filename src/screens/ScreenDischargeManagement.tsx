/**
 * CareTrack — Screen 7: Discharge Management & Bed Release
 * Implements Rule 10 (3 full fever-free days), Rule 11 (fever/missing resets),
 * Rule 12 (eligibility != auto-discharge), Rule 13 (admin-only confirmation),
 * Rule 14 (immediate room release), and Scenario C.
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Bed,
  ShieldCheck,
  Calendar,
  X,
  FileCheck,
  AlertCircle,
  HelpCircle,
  UserCheck,
} from 'lucide-react';
import { Patient } from '../types';
import { calculateDischargeEligibility } from '../utils/businessLogic';

interface ScreenDischargeManagementProps {
  preselectedPatientId?: string;
  onNavigate: (screenId: string, patientId?: string) => void;
}

export const ScreenDischargeManagement: React.FC<ScreenDischargeManagementProps> = ({
  preselectedPatientId,
  onNavigate,
}) => {
  const {
    patients,
    temperatureReadings,
    settings,
    currentUser,
    currentRole,
    dischargePatient,
    metrics,
  } = useApp();

  const [filter, setFilter] = useState<'eligible' | 'ineligible' | 'all'>('eligible');
  const [selectedPatientForDischarge, setSelectedPatientForDischarge] = useState<Patient | null>(
    null
  );
  const [adminNotes, setAdminNotes] = useState('');
  const [showIneligibleWarningModal, setShowIneligibleWarningModal] = useState<{
    patient: Patient;
    reason: string;
  } | null>(null);

  const activePatients = useMemo(
    () => patients.filter((p) => p.status === 'active'),
    [patients]
  );

  // Calculate eligibility for each patient
  const patientEligibilityList = useMemo(() => {
    return activePatients.map((patient) => {
      const eligibility = calculateDischargeEligibility(
        patient,
        temperatureReadings,
        settings.currentSimulatedDate,
        settings.feverThreshold,
        settings.quarantineRequiredDays
      );
      return { patient, eligibility };
    });
  }, [activePatients, temperatureReadings, settings]);

  const displayedList = useMemo(() => {
    return patientEligibilityList.filter(({ eligibility }) => {
      if (filter === 'eligible') return eligibility.isEligible;
      if (filter === 'ineligible') return !eligibility.isEligible;
      return true;
    });
  }, [patientEligibilityList, filter]);

  // Handle click on discharge action
  const handleInitiateDischarge = (patient: Patient, isEligible: boolean, reason?: string) => {
    if (!isEligible) {
      setShowIneligibleWarningModal({
        patient,
        reason:
          reason ||
          'Patient has not satisfied the mandatory 3 full consecutive documented fever-free days.',
      });
      return;
    }
    setSelectedPatientForDischarge(patient);
    setAdminNotes('All discharge criteria verified. Patient released to home quarantine completion.');
  };

  const handleConfirmDischarge = () => {
    if (!selectedPatientForDischarge) return;
    const res = dischargePatient(selectedPatientForDischarge.id, adminNotes);
    if (res.success) {
      setSelectedPatientForDischarge(null);
      setAdminNotes('');
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
              Quarantine Discharge Coordination
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
              Protocol: 3 Consecutive Fever-Free Days
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Admin verification board · Authorized release immediately frees bed capacity in Ward Alpha
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
          <button
            onClick={() => setFilter('eligible')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filter === 'eligible'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Qualified for Discharge ({metrics.dischargeEligibleCount})
          </button>
          <button
            onClick={() => setFilter('ineligible')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filter === 'ineligible'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Quarantine ({activePatients.length - metrics.dischargeEligibleCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Active ({activePatients.length})
          </button>
        </div>
      </div>

      {/* Protocol Explanation Box */}
      <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 text-xs text-teal-950 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-teal-900">
              Clinical Discharge Criterion (Rule 10 & 11)
            </span>
            <p className="text-teal-800 text-[11px] mt-0.5 leading-relaxed">
              To prevent secondary transmission, patients qualify for discharge <strong>only after 3 full consecutive documented calendar days</strong> with temperature strictly below the {settings.feverThreshold}°C threshold. Any fever reading or missing daily check completely breaks the consecutive streak.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-teal-700 uppercase font-bold block">Authorized Role</span>
          <span className="font-bold text-teal-900 font-mono">
            {currentRole === 'admin' || currentRole === 'sysadmin' ? 'Authorized (Admin)' : 'Admin Staff Required'}
          </span>
        </div>
      </div>

      {/* Patient Cards / Review Board */}
      <div className="space-y-3">
        {displayedList.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200 shadow-2xs">
            No patients currently match the &quot;{filter}&quot; filter.
          </div>
        ) : (
          displayedList.map(({ patient, eligibility }) => {
            const isEligible = eligibility.isEligible;
            const hasDoctorClearance = !!patient.doctorDischargeRecommended;

            return (
              <div
                key={patient.id}
                className={`p-5 rounded-xl border transition-all ${
                  isEligible
                    ? 'bg-white border-teal-300 shadow-xs'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Patient Identity */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                        isEligible
                          ? 'bg-teal-600 text-white border-teal-700 shadow-2xs'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      Rm {patient.roomNumber}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{patient.name}</h3>
                        <span className="font-mono text-xs text-slate-400">{patient.id}</span>
                        {isEligible ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-900 border border-teal-300">
                            ELIGIBLE FOR DISCHARGE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            NOT ELIGIBLE
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-0.5">
                        {patient.age} yrs · {patient.gender} · Admitted: {patient.admissionDate} · Doctor: {patient.assignedDoctor}
                      </p>

                      {/* Doctor Notes / Recommendation */}
                      {patient.doctorDischargeNotes && (
                        <p className="text-[11px] text-slate-600 mt-1 italic">
                          &quot;{patient.doctorDischargeNotes}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Center: Consecutive Days Trajectory Checklist */}
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 mr-1 hidden sm:block">
                      Last Days:
                    </span>
                    {eligibility.dailyBreakdown.slice(0, 4).reverse().map((day) => {
                      const isFever = day.status === 'fever';
                      const isMissing = day.status === 'missing';
                      const isFeverFree = day.status === 'fever_free';

                      return (
                        <div
                          key={day.date}
                          className={`px-2.5 py-1 rounded-md border text-center text-xs min-w-[70px] ${
                            isFeverFree
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                              : isFever
                              ? 'bg-rose-50 border-rose-300 text-rose-900'
                              : isMissing
                              ? 'bg-amber-50 border-amber-300 text-amber-900'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          <span className="text-[9px] font-mono block text-slate-500">
                            {day.date.substring(5)}
                          </span>
                          <span className="font-mono font-bold block text-xs">
                            {day.temperature !== undefined ? `${day.temperature}°C` : 'MISSING'}
                          </span>
                          <span className="text-[9px] block font-semibold">
                            {isFeverFree ? 'Pass' : isFever ? 'Fever' : isMissing ? 'Streak Broken' : 'N/A'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right: Discharge Action Button */}
                  <div className="flex items-center gap-2 self-end lg:self-center">
                    <button
                      onClick={() =>
                        handleInitiateDischarge(
                          patient,
                          isEligible,
                          eligibility.ineligibilityReason
                        )
                      }
                      className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                        isEligible
                          ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer'
                      }`}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{isEligible ? 'Confirm Admin Discharge' : 'Discharge Blocked'}</span>
                    </button>
                  </div>
                </div>

                {/* Ineligibility Reason Note */}
                {!isEligible && eligibility.ineligibilityReason && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-amber-800 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{eligibility.ineligibilityReason}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal for Admin Discharge */}
      {selectedPatientForDischarge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Confirm Quarantine Discharge & Bed Release
                </h3>
                <p className="text-xs text-slate-500">
                  Patient: {selectedPatientForDischarge.name} (Room {selectedPatientForDischarge.roomNumber})
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-950 space-y-1">
              <p className="font-bold">Protocol Verification Summary:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-teal-800 text-[11px]">
                <li>3 full consecutive documented fever-free days verified.</li>
                <li>Attending physician has cleared clinical status.</li>
                <li>
                  <strong>Room {selectedPatientForDischarge.roomNumber}</strong> will immediately become vacant and available for incoming patients.
                </li>
              </ul>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Administrative Release Remarks
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedPatientForDischarge(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDischarge}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Confirm Discharge & Free Room</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ineligible Attempt Warning Modal */}
      {showIneligibleWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Discharge Action Strictly Blocked
                </h3>
                <p className="text-xs text-slate-500">
                  Patient: {showIneligibleWarningModal.patient.name} (Room{' '}
                  {showIneligibleWarningModal.patient.roomNumber})
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1.5">
              <p className="font-bold">Ineligibility Reason:</p>
              <p className="text-[11px] leading-relaxed">
                {showIneligibleWarningModal.reason}
              </p>
              <p className="text-[11px] text-rose-800 mt-2">
                CareTrack Rule 10 strictly forbids releasing quarantine patients before documenting 3 unbroken afebrile days. Missing records do not count.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowIneligibleWarningModal(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Acknowledge Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
