/**
 * CareTrack — Screen 3: Patient Management & Room Allocation (1-74)
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Plus,
  Bed,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Filter,
  Eye,
  X,
  Stethoscope,
  Thermometer,
  LogOut,
  Building,
} from 'lucide-react';
import { Patient, Role } from '../types';
import {
  getAvailableRooms,
  calculateDischargeEligibility,
  hasRecordedTemperatureToday,
  hasCompletedDoctorVisitToday,
  MAX_FACILITY_CAPACITY,
} from '../utils/businessLogic';

interface ScreenPatientsProps {
  onNavigate: (screenId: string, patientId?: string) => void;
}

type FilterType =
  | 'active'
  | 'temp_pending'
  | 'doctor_pending'
  | 'fever_detected'
  | 'eligible'
  | 'discharged'
  | 'all';

export const ScreenPatients: React.FC<ScreenPatientsProps> = ({ onNavigate }) => {
  const {
    patients,
    temperatureReadings,
    doctorVisits,
    settings,
    currentRole,
    registerPatient,
    metrics,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('active');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showRoomMapModal, setShowRoomMapModal] = useState(false);
  const [selectedPatientForDrawer, setSelectedPatientForDrawer] = useState<Patient | null>(null);

  // Registration Form State
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newGender, setNewGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [newRoom, setNewRoom] = useState<number | ''>('');
  const [newDoctor, setNewDoctor] = useState('Dr. Alistair Ross, MD');
  const [newConditions, setNewConditions] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const availableRooms = useMemo(() => getAvailableRooms(patients), [patients]);

  // Set default available room when modal opens
  const handleOpenRegister = () => {
    if (availableRooms.length > 0) {
      setNewRoom(availableRooms[0]);
    }
    setFormError(null);
    setShowRegisterModal(true);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newName.trim()) {
      setFormError('Patient name is required');
      return;
    }
    const ageNum = parseInt(newAge);
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      setFormError('Please enter a valid age between 1 and 120');
      return;
    }
    if (newRoom === '' || typeof newRoom !== 'number') {
      setFormError('Please select an available room number (1-74)');
      return;
    }

    const conditionsList = newConditions
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const res = registerPatient({
      name: newName,
      age: ageNum,
      gender: newGender,
      roomNumber: newRoom,
      assignedDoctor: newDoctor,
      underlyingConditions: conditionsList,
      admissionNotes: newNotes,
    });

    if (res.success) {
      setShowRegisterModal(false);
      setNewName('');
      setNewAge('');
      setNewConditions('');
      setNewNotes('');
    } else {
      setFormError(res.error || 'Failed to register patient');
    }
  };

  // Filtered Patients List
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // Search
      const matchesSearch =
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(patient.roomNumber).includes(searchQuery);

      if (!matchesSearch) return false;

      // Status filters
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

      const readingToday = temperatureReadings.find(
        (r) => r.patientId === patient.id && r.date === settings.currentSimulatedDate
      );
      const hasFeverToday = readingToday && readingToday.temperature >= settings.feverThreshold;

      const eligibility = calculateDischargeEligibility(
        patient,
        temperatureReadings,
        settings.currentSimulatedDate,
        settings.feverThreshold
      );

      if (activeFilter === 'active') return patient.status === 'active';
      if (activeFilter === 'temp_pending') return patient.status === 'active' && !hasTempToday;
      if (activeFilter === 'doctor_pending') return patient.status === 'active' && !hasVisitToday;
      if (activeFilter === 'fever_detected') return patient.status === 'active' && hasFeverToday;
      if (activeFilter === 'eligible') return patient.status === 'active' && eligibility.isEligible;
      if (activeFilter === 'discharged') return patient.status === 'discharged';
      return true;
    });
  }, [patients, searchQuery, activeFilter, settings, temperatureReadings, doctorVisits]);

  // Room status map for 1-74
  const roomStatusMap = useMemo(() => {
    const map = new Map<number, { patient?: Patient; hasFever?: boolean }>();
    patients
      .filter((p) => p.status === 'active')
      .forEach((p) => {
        const todayR = temperatureReadings.find(
          (r) => r.patientId === p.id && r.date === settings.currentSimulatedDate
        );
        map.set(p.roomNumber, {
          patient: p,
          hasFever: todayR ? todayR.temperature >= settings.feverThreshold : false,
        });
      });
    return map;
  }, [patients, temperatureReadings, settings]);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
            Patient Registry & Room Allocation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking {metrics.activePatients} active patients across 74 isolation rooms · {metrics.availableRooms} rooms vacant
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRoomMapModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Bed className="w-3.5 h-3.5 text-teal-600" />
            <span>Room Map (1–74)</span>
          </button>

          {/* Admin or Doctor can admit patients */}
          {['admin', 'sysadmin', 'doctor'].includes(currentRole) && (
            <button
              onClick={handleOpenRegister}
              disabled={metrics.occupiedRooms >= MAX_FACILITY_CAPACITY}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register New Patient</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'active', label: 'Active', count: metrics.activePatients },
            { id: 'temp_pending', label: 'Temp Pending', count: metrics.todayTempsPending },
            { id: 'doctor_pending', label: 'Doctor Pending', count: metrics.todayDoctorVisitsPending },
            { id: 'eligible', label: 'Discharge Ready', count: metrics.dischargeEligibleCount },
            { id: 'fever_detected', label: 'Fever Today', count: null },
            { id: 'discharged', label: 'Discharged', count: metrics.totalDischarges },
            { id: 'all', label: 'All Records', count: metrics.totalAdmissions },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as FilterType)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeFilter === tab.id
                  ? 'bg-teal-600 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    activeFilter === tab.id ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, ID or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          />
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Patient / ID</th>
                <th className="py-3 px-3">Room</th>
                <th className="py-3 px-3">Latest Temp</th>
                <th className="py-3 px-3">Today&apos;s Temp</th>
                <th className="py-3 px-3">Doctor Visit</th>
                <th className="py-3 px-3">Fever-Free Days</th>
                <th className="py-3 px-3">Eligibility</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No patients match the current filter or search query.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
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

                  // Latest temperature reading
                  const patientReadings = temperatureReadings.filter((r) => r.patientId === patient.id);
                  const latestReading = patientReadings[0]; // array is newest first

                  const eligibility = calculateDischargeEligibility(
                    patient,
                    temperatureReadings,
                    settings.currentSimulatedDate,
                    settings.feverThreshold
                  );

                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      onClick={() => setSelectedPatientForDrawer(patient)}
                    >
                      {/* Name / ID */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                            {patient.name}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {patient.id}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {patient.age} yrs · {patient.gender} · Adm: {patient.admissionDate}
                        </div>
                      </td>

                      {/* Room */}
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          Rm {patient.roomNumber}
                        </span>
                      </td>

                      {/* Latest Temp */}
                      <td className="py-3 px-3">
                        {latestReading ? (
                          <div>
                            <span
                              className={`font-mono font-bold ${
                                latestReading.isFever ? 'text-rose-600' : 'text-slate-800'
                              }`}
                            >
                              {latestReading.temperature.toFixed(1)}°C
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {latestReading.date === settings.currentSimulatedDate
                                ? 'Today'
                                : latestReading.date}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None logged</span>
                        )}
                      </td>

                      {/* Today's Temp Status */}
                      <td className="py-3 px-3">
                        {patient.status !== 'active' ? (
                          <span className="text-slate-400 text-[11px]">N/A ({patient.status})</span>
                        ) : hasTempToday ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Logged
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                            <Clock className="w-3.5 h-3.5" /> Pending
                          </span>
                        )}
                      </td>

                      {/* Doctor Visit Status */}
                      <td className="py-3 px-3">
                        {patient.status !== 'active' ? (
                          <span className="text-slate-400 text-[11px]">N/A</span>
                        ) : hasVisitToday ? (
                          <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> Pending
                          </span>
                        )}
                      </td>

                      {/* Fever-Free Days */}
                      <td className="py-3 px-3">
                        {patient.status !== 'active' ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span
                              className={`font-mono font-bold ${
                                eligibility.consecutiveFeverFreeDays >= 3
                                  ? 'text-teal-700'
                                  : 'text-slate-700'
                              }`}
                            >
                              {eligibility.consecutiveFeverFreeDays} / 3 days
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Eligibility Status */}
                      <td className="py-3 px-3">
                        {patient.status === 'discharged' ? (
                          <span className="text-slate-500 font-medium">Discharged</span>
                        ) : patient.status === 'deceased' ? (
                          <span className="text-rose-700 font-medium">Deceased</span>
                        ) : eligibility.isEligible ? (
                          <span className="text-teal-800 font-bold bg-teal-50 border border-teal-200 px-2 py-0.5 rounded text-[10px]">
                            Eligible
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Ineligible</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {patient.status === 'active' && (
                            <>
                              <button
                                onClick={() => onNavigate('temperatures', patient.id)}
                                title="Record official temperature"
                                className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-md transition-colors"
                              >
                                <Thermometer className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onNavigate('doctor_rounds', patient.id)}
                                title="Doctor Rounds"
                                className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-md transition-colors"
                              >
                                <Stethoscope className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedPatientForDrawer(patient)}
                            title="View patient history and details"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
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

      {/* Patient Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Register Patient & Room Intake</h3>
                <p className="text-xs text-slate-500">
                  Room assigned exclusively from available beds (1–74)
                </p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kenneth Cooper"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    placeholder="e.g. 42"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender *
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Room Number Assignment (1–74) *
                  </label>
                  <select
                    value={newRoom}
                    onChange={(e) => setNewRoom(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    {availableRooms.map((r) => (
                      <option key={r} value={r}>
                        Room {r} (Available)
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {availableRooms.length} rooms currently free
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Attending Physician
                  </label>
                  <input
                    type="text"
                    value={newDoctor}
                    onChange={(e) => setNewDoctor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pre-existing Conditions (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Asthma, Hypertension"
                    value={newConditions}
                    onChange={(e) => setNewConditions(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Intake Notes / Clinical Presentation
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Symptoms, exposure history, initial vital remarks..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs"
                >
                  Admit Patient & Assign Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visual Room Map (1-74) Modal */}
      {showRoomMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Bed className="w-5 h-5 text-teal-600" />
                  Facility Isolation Ward Bed Grid (Rooms 1 to 74)
                </h3>
                <p className="text-xs text-slate-500">
                  {metrics.occupiedRooms} occupied · {metrics.availableRooms} available beds
                </p>
              </div>
              <button
                onClick={() => setShowRoomMapModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-300" />
                <span className="text-slate-600">Vacant / Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-teal-100 border border-teal-300 text-teal-900" />
                <span className="text-slate-600">Occupied (Normal)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-rose-100 border border-rose-300 text-rose-900" />
                <span className="text-slate-600">Occupied (Fever Alert Today)</span>
              </div>
            </div>

            {/* Grid of 74 Rooms */}
            <div className="overflow-y-auto p-1 flex-1">
              <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-2">
                {Array.from({ length: MAX_FACILITY_CAPACITY }, (_, i) => i + 1).map((roomNum) => {
                  const entry = roomStatusMap.get(roomNum);
                  const isOccupied = !!entry?.patient;
                  const hasFever = entry?.hasFever;

                  return (
                    <div
                      key={roomNum}
                      onClick={() => {
                        if (entry?.patient) {
                          setSelectedPatientForDrawer(entry.patient);
                          setShowRoomMapModal(false);
                        }
                      }}
                      className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                        !isOccupied
                          ? 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-400'
                          : hasFever
                          ? 'bg-rose-50 border-rose-300 text-rose-900 hover:bg-rose-100 font-bold'
                          : 'bg-teal-50 border-teal-300 text-teal-900 hover:bg-teal-100 font-semibold'
                      }`}
                      title={
                        isOccupied
                          ? `Room ${roomNum}: ${entry.patient?.name} (Click to inspect)`
                          : `Room ${roomNum}: Available for intake`
                      }
                    >
                      <span className="block text-[11px] font-mono leading-none">
                        #{roomNum}
                      </span>
                      <span className="text-[9px] block truncate mt-1">
                        {isOccupied ? entry.patient?.name.split(' ')[0] : 'Free'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowRoomMapModal(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Details Drawer / Modal */}
      {selectedPatientForDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white h-full max-w-md w-full shadow-2xl border-l border-slate-200 flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  Patient Profile · {selectedPatientForDrawer.id}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedPatientForDrawer.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPatientForDrawer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Assigned Room</span>
                  <p className="font-bold text-sm text-slate-900">Room {selectedPatientForDrawer.roomNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Status</span>
                  <p className="font-bold text-sm text-slate-900 capitalize">{selectedPatientForDrawer.status}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Admission Date</span>
                  <p className="font-semibold text-slate-800">{selectedPatientForDrawer.admissionDate}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Demographics</span>
                  <p className="font-semibold text-slate-800">
                    {selectedPatientForDrawer.age} yrs · {selectedPatientForDrawer.gender}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Attending Physician
                </span>
                <p className="font-medium text-slate-800">{selectedPatientForDrawer.assignedDoctor}</p>
              </div>

              {selectedPatientForDrawer.underlyingConditions?.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Pre-existing Medical Conditions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPatientForDrawer.underlyingConditions.map((c, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] border border-slate-200">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedPatientForDrawer.admissionNotes && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Intake Notes
                  </span>
                  <p className="p-2.5 rounded bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed text-[11px]">
                    {selectedPatientForDrawer.admissionNotes}
                  </p>
                </div>
              )}

              {/* Quick Actions in Drawer */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Clinical Shortcuts
                </span>
                <button
                  onClick={() => {
                    const id = selectedPatientForDrawer.id;
                    setSelectedPatientForDrawer(null);
                    onNavigate('temperatures', id);
                  }}
                  className="w-full py-2 px-3 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold flex items-center justify-between text-xs transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-teal-600" /> Record Temperature
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const id = selectedPatientForDrawer.id;
                    setSelectedPatientForDrawer(null);
                    onNavigate('history', id);
                  }}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold flex items-center justify-between text-xs transition-colors"
                >
                  <span>View Temperature History & Chart</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const id = selectedPatientForDrawer.id;
                    setSelectedPatientForDrawer(null);
                    onNavigate('doctor_rounds', id);
                  }}
                  className="w-full py-2 px-3 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold flex items-center justify-between text-xs transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-blue-600" /> Open Doctor Rounds
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const id = selectedPatientForDrawer.id;
                    setSelectedPatientForDrawer(null);
                    onNavigate('discharge', id);
                  }}
                  className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold flex items-center justify-between text-xs transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-indigo-600" /> Evaluate Discharge
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
