/**
 * CareTrack — Quarantine Facility Management System
 * Global Application Context & State Management
 *
 * Handles persistent storage (localStorage), role-based permissions,
 * simulated date control, and core operational transactions.
 */

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Role,
  UserProfile,
  Patient,
  TemperatureReading,
  DoctorVisit,
  AuditLogEntry,
  FacilitySettings,
  FacilityMetrics,
  ToastNotification,
  VisitType,
} from '../types';
import {
  DEMO_USERS,
  INITIAL_SETTINGS,
  getInitialPatients,
  getInitialTemperatureReadings,
  getInitialDoctorVisits,
  getInitialAuditLogs,
} from '../data/seedData';
import {
  calculateFacilityMetrics,
  calculateDischargeEligibility,
  validateTemperatureInput,
  hasRecordedTemperatureToday,
  isRoomAvailable,
  MAX_FACILITY_CAPACITY,
  offsetDate,
} from '../utils/businessLogic';

interface AppContextValue {
  // Current user & role
  currentUser: UserProfile;
  currentRole: Role;
  setRole: (role: Role) => void;
  users: UserProfile[];

  // Settings & date simulation
  settings: FacilitySettings;
  updateFeverThreshold: (newThreshold: number) => void;
  setSimulatedDate: (newDate: string) => void;
  advanceSimulatedDate: (days: number) => void;

  // Data collections
  patients: Patient[];
  temperatureReadings: TemperatureReading[];
  doctorVisits: DoctorVisit[];
  auditLogs: AuditLogEntry[];
  metrics: FacilityMetrics;

  // Core Actions
  recordTemperature: (
    patientId: string,
    temperature: number,
    observations?: string,
    isEmergency?: boolean
  ) => { success: boolean; error?: string; isDuplicate?: boolean; isFever?: boolean };

  recordDoctorVisit: (
    patientId: string,
    notes: string,
    visitType: VisitType,
    emergencyReason?: string,
    recommendation?: 'continue_quarantine' | 'eligible_for_discharge' | 'urgent_care'
  ) => { success: boolean; error?: string };

  registerPatient: (data: {
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    roomNumber: number;
    underlyingConditions: string[];
    assignedDoctor: string;
    admissionNotes?: string;
  }) => { success: boolean; error?: string; patient?: Patient };

  dischargePatient: (
    patientId: string,
    notes?: string
  ) => { success: boolean; error?: string };

  recordPatientOutcomeDeath: (
    patientId: string,
    clinicalNotes: string
  ) => { success: boolean; error?: string };

  // Reset & State management
  resetToSeedData: () => void;

  // Toasts
  toasts: ToastNotification[];
  dismissToast: (id: string) => void;
  showToast: (type: ToastNotification['type'], title: string, message: string) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'caretrack_quarantine_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial or stored settings
  const [settings, setSettings] = useState<FacilitySettings>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}_settings`);
      return stored ? JSON.parse(stored) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Role state
  const [currentRole, setCurrentRole] = useState<Role>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}_role`);
      return (stored as Role) || 'nurse';
    } catch {
      return 'nurse';
    }
  });

  // Patients state
  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}_patients`);
      return stored ? JSON.parse(stored) : getInitialPatients();
    } catch {
      return getInitialPatients();
    }
  });

  // Temperature readings
  const [temperatureReadings, setTemperatureReadings] = useState<TemperatureReading[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}_temperatures`);
      return stored ? JSON.parse(stored) : getInitialTemperatureReadings();
    } catch {
      return getInitialTemperatureReadings();
    }
  });

  // Doctor visits
  const [doctorVisits, setDoctorVisits] = useState<DoctorVisit[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}_visits`);
      return stored ? JSON.parse(stored) : getInitialDoctorVisits();
    } catch {
      return getInitialDoctorVisits();
    }
  });

  // Audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}_audit`);
      return stored ? JSON.parse(stored) : getInitialAuditLogs();
    } catch {
      return getInitialAuditLogs();
    }
  });

  // Toast notifications
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Find user profile based on role
  const currentUser = useMemo(() => {
    return DEMO_USERS.find((u) => u.role === currentRole) || DEMO_USERS[0];
  }, [currentRole]);

  // Persist state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_settings`, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_role`, currentRole);
    } catch (e) {
      console.warn('Failed to save role to localStorage', e);
    }
  }, [currentRole]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_patients`, JSON.stringify(patients));
    } catch (e) {
      console.warn('Failed to save patients to localStorage', e);
    }
  }, [patients]);

  useEffect(() => {
    try {
      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}_temperatures`,
        JSON.stringify(temperatureReadings)
      );
    } catch (e) {
      console.warn('Failed to save temperature readings to localStorage', e);
    }
  }, [temperatureReadings]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_visits`, JSON.stringify(doctorVisits));
    } catch (e) {
      console.warn('Failed to save doctor visits to localStorage', e);
    }
  }, [doctorVisits]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_audit`, JSON.stringify(auditLogs));
    } catch (e) {
      console.warn('Failed to save audit logs to localStorage', e);
    }
  }, [auditLogs]);

  // Toast Helper
  const showToast = (type: ToastNotification['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, title, message, timestamp: Date.now() }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper: Log audit entry
  const logAudit = (
    action: string,
    category: AuditLogEntry['category'],
    details: string,
    patientId?: string
  ) => {
    const newEntry: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      role: currentRole,
      action,
      details,
      category,
      patientId,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Precomputed Facility Metrics
  const metrics = useMemo(() => {
    return calculateFacilityMetrics(
      patients,
      temperatureReadings,
      doctorVisits,
      settings.currentSimulatedDate,
      settings.feverThreshold
    );
  }, [patients, temperatureReadings, doctorVisits, settings.currentSimulatedDate, settings.feverThreshold]);

  // Set Role
  const setRole = (role: Role) => {
    setCurrentRole(role);
    const targetUser = DEMO_USERS.find((u) => u.role === role);
    if (targetUser) {
      showToast('info', 'Role Switched', `Active role is now ${targetUser.title} (${targetUser.name})`);
    }
  };

  // Update Fever Threshold
  const updateFeverThreshold = (newThreshold: number) => {
    const prev = settings.feverThreshold;
    setSettings((s) => ({ ...s, feverThreshold: newThreshold }));
    logAudit(
      'Configurable Fever Threshold Updated',
      'settings',
      `Fever threshold changed from ${prev.toFixed(1)}°C to ${newThreshold.toFixed(1)}°C (Provisional Demo Setting).`
    );
    showToast(
      'success',
      'Threshold Updated',
      `Fever threshold configured to ${newThreshold.toFixed(1)}°C`
    );
  };

  // Simulated Date Controls
  const setSimulatedDate = (newDate: string) => {
    setSettings((s) => ({ ...s, currentSimulatedDate: newDate }));
    logAudit(
      'Simulated Date Changed',
      'settings',
      `System operational date shifted to ${newDate} for scenario simulation.`
    );
    showToast('info', 'Calendar Date Shifted', `Facility operations simulated for ${newDate}`);
  };

  const advanceSimulatedDate = (days: number) => {
    const nextDate = offsetDate(settings.currentSimulatedDate, days);
    setSimulatedDate(nextDate);
  };

  // Action: Record Temperature (Rule 4, 5, 6, 7)
  const recordTemperature = (
    patientId: string,
    temp: number,
    observations?: string,
    isEmergency?: boolean
  ) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) {
      showToast('error', 'Patient Not Found', `No patient record with ID ${patientId}`);
      return { success: false, error: 'Patient not found' };
    }

    if (patient.status !== 'active') {
      showToast('error', 'Patient Inactive', `Cannot record temperature for a ${patient.status} patient.`);
      return { success: false, error: 'Patient is not active' };
    }

    // Check duplicate daily measurement (Rule 5)
    const alreadyRecorded = hasRecordedTemperatureToday(
      patientId,
      settings.currentSimulatedDate,
      temperatureReadings
    );

    if (alreadyRecorded) {
      logAudit(
        'Duplicate Temperature Submission Blocked',
        'temperature',
        `Attempted to record duplicate daily temperature for ${patient.name} (Room ${patient.roomNumber}) on ${settings.currentSimulatedDate}. Action blocked by duplicate prevention rule.`,
        patientId
      );
      showToast(
        'warning',
        'Duplicate Entry Blocked',
        `Official temperature for ${patient.name} has already been logged today (${settings.currentSimulatedDate}). CareTrack policy allows 1 official reading per day.`
      );
      return { success: false, error: 'Duplicate entry blocked', isDuplicate: true };
    }

    // Validate temperature range
    const validation = validateTemperatureInput(temp, settings.feverThreshold);
    if (!validation.valid || validation.value === undefined) {
      showToast('error', 'Invalid Temperature', validation.error || 'Please enter a valid temperature.');
      return { success: false, error: validation.error };
    }

    const isFever = validation.isFever || false;
    const newReading: TemperatureReading = {
      id: `TR-${patientId}-${Date.now()}`,
      patientId,
      date: settings.currentSimulatedDate,
      timestamp: new Date().toISOString(),
      temperature: validation.value,
      isFever,
      recordedBy: currentUser.name,
      recordedByRole: currentRole,
      observations: observations?.trim() || undefined,
      isEmergencyReading: isEmergency,
    };

    setTemperatureReadings((prev) => [newReading, ...prev]);

    // Audit log
    const feverText = isFever
      ? `FEVER DETECTED (${validation.value}°C >= ${settings.feverThreshold}°C)`
      : `Normal reading (${validation.value}°C)`;
    
    logAudit(
      isFever ? 'Official Temperature Recorded - Fever Alert' : 'Official Temperature Recorded',
      'temperature',
      `Recorded ${validation.value}°C for ${patient.name} in Room ${patient.roomNumber}. ${feverText}.${
        observations ? ` Observation: "${observations}"` : ''
      }`,
      patientId
    );

    if (isFever) {
      showToast(
        'warning',
        'Fever Alert Triggered',
        `${patient.name} (Room ${patient.roomNumber}) recorded ${validation.value}°C. Fever-free sequence reset to 0.`
      );
    } else {
      showToast(
        'success',
        'Temperature Saved',
        `Recorded ${validation.value}°C for ${patient.name} (Room ${patient.roomNumber}).`
      );
    }

    return { success: true, isFever };
  };

  // Action: Record Doctor Visit (Rule 8, 9)
  const recordDoctorVisit = (
    patientId: string,
    notes: string,
    visitType: VisitType,
    emergencyReason?: string,
    recommendation?: 'continue_quarantine' | 'eligible_for_discharge' | 'urgent_care'
  ) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) {
      showToast('error', 'Patient Not Found', `No patient record with ID ${patientId}`);
      return { success: false, error: 'Patient not found' };
    }

    if (patient.status !== 'active') {
      showToast('error', 'Patient Inactive', `Cannot record visit for an inactive patient.`);
      return { success: false, error: 'Patient is not active' };
    }

    const hasTodayTemp = hasRecordedTemperatureToday(
      patientId,
      settings.currentSimulatedDate,
      temperatureReadings
    );

    // Rule 8: Routine doctor visit requires today's temperature
    if (visitType === 'routine' && !hasTodayTemp) {
      showToast(
        'error',
        'Routine Visit Blocked',
        `Routine doctor visits require today's temperature record first. Use Emergency Visit Override if urgent clinical care is required.`
      );
      return {
        success: false,
        error: "Today's official temperature check is missing. Routine visit cannot be completed.",
      };
    }

    // Rule 9: Emergency override validation
    if (visitType === 'emergency' && (!emergencyReason || !emergencyReason.trim())) {
      showToast('error', 'Emergency Reason Required', 'Please provide an explicit clinical justification for the emergency override.');
      return { success: false, error: 'Emergency reason is mandatory for override visits.' };
    }

    const newVisit: DoctorVisit = {
      id: `DV-${patientId}-${Date.now()}`,
      patientId,
      date: settings.currentSimulatedDate,
      timestamp: new Date().toISOString(),
      doctorName: currentUser.name,
      visitType,
      notes: notes.trim(),
      emergencyReason: visitType === 'emergency' ? emergencyReason?.trim() : undefined,
      dischargeRecommendation: recommendation,
    };

    setDoctorVisits((prev) => [newVisit, ...prev]);

    // If recommendation is eligible for discharge, update patient metadata
    if (recommendation === 'eligible_for_discharge') {
      setPatients((prev) =>
        prev.map((p) =>
          p.id === patientId
            ? {
                ...p,
                doctorDischargeRecommended: true,
                doctorDischargeNotes: notes,
              }
            : p
        )
      );
    }

    const auditAction =
      visitType === 'emergency'
        ? 'Emergency Doctor Visit Override Completed'
        : 'Routine Doctor Visit Completed';
    const auditCategory = visitType === 'emergency' ? 'clinical_override' : 'doctor_visit';
    const auditDetail =
      visitType === 'emergency'
        ? `Emergency override executed for ${patient.name} (Room ${patient.roomNumber}) without today's temperature. Justification: "${emergencyReason}". Visit Notes: "${notes}". Note: Daily temperature check remains pending.`
        : `Completed routine rounds for ${patient.name} (Room ${patient.roomNumber}). Clinical assessment: "${notes}". Recommendation: ${recommendation || 'Continue standard quarantine'}.`;

    logAudit(auditAction, auditCategory, auditDetail, patientId);

    showToast(
      visitType === 'emergency' ? 'warning' : 'success',
      visitType === 'emergency' ? 'Emergency Visit Logged' : 'Doctor Visit Recorded',
      `Rounds recorded for ${patient.name} (Room ${patient.roomNumber}).`
    );

    return { success: true };
  };

  // Action: Register Patient (Rule 1, 2, 3)
  const registerPatient = (data: {
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    roomNumber: number;
    underlyingConditions: string[];
    assignedDoctor: string;
    admissionNotes?: string;
  }) => {
    // Check total capacity
    const activePatients = patients.filter((p) => p.status === 'active');
    if (activePatients.length >= MAX_FACILITY_CAPACITY) {
      showToast(
        'error',
        'Facility at Maximum Capacity',
        `Facility is at maximum limit of ${MAX_FACILITY_CAPACITY} patients. No beds available.`
      );
      return { success: false, error: 'Facility at maximum capacity' };
    }

    // Check room availability
    if (!isRoomAvailable(data.roomNumber, patients)) {
      showToast(
        'error',
        'Room Occupied',
        `Room ${data.roomNumber} is currently occupied by an active patient. Please assign an available room.`
      );
      return { success: false, error: `Room ${data.roomNumber} is already occupied` };
    }

    // Generate unique Patient ID
    const newNum = patients.length + 1;
    const newId = `CT-${String(newNum).padStart(3, '0')}`;

    const newPatient: Patient = {
      id: newId,
      name: data.name.trim(),
      age: data.age,
      gender: data.gender,
      roomNumber: data.roomNumber,
      admissionDate: settings.currentSimulatedDate,
      status: 'active',
      assignedDoctor: data.assignedDoctor,
      underlyingConditions: data.underlyingConditions,
      admissionNotes: data.admissionNotes?.trim(),
      doctorDischargeRecommended: false,
    };

    setPatients((prev) => [newPatient, ...prev]);

    logAudit(
      'New Patient Admitted & Room Assigned',
      'registration',
      `Registered ${newPatient.name} (Age ${newPatient.age}, ${newPatient.gender}) with Patient ID ${newId}. Assigned Room ${newPatient.roomNumber}. Doctor: ${newPatient.assignedDoctor}.`,
      newId
    );

    showToast(
      'success',
      'Patient Registered',
      `${newPatient.name} admitted successfully. Assigned Room ${newPatient.roomNumber}.`
    );

    return { success: true, patient: newPatient };
  };

  // Action: Discharge Patient (Rule 10, 11, 12, 13, 14, 15)
  const dischargePatient = (patientId: string, notes?: string) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) {
      showToast('error', 'Patient Not Found', `No patient record with ID ${patientId}`);
      return { success: false, error: 'Patient not found' };
    }

    if (patient.status !== 'active') {
      showToast('error', 'Already Discharged', `Patient ${patient.name} is already ${patient.status}.`);
      return { success: false, error: `Patient is already ${patient.status}` };
    }

    // Verify 3 full consecutive fever-free days (Rule 10)
    const eligibility = calculateDischargeEligibility(
      patient,
      temperatureReadings,
      settings.currentSimulatedDate,
      settings.feverThreshold,
      settings.quarantineRequiredDays
    );

    if (!eligibility.isEligible) {
      const reason =
        eligibility.ineligibilityReason ||
        `Patient has only ${eligibility.consecutiveFeverFreeDays} of ${settings.quarantineRequiredDays} required consecutive documented fever-free days.`;
      showToast('error', 'Discharge Ineligible', reason);
      return { success: false, error: reason };
    }

    // Execute discharge: updates status and immediately releases room
    const releasedRoom = patient.roomNumber;
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              status: 'discharged',
              dischargeDate: settings.currentSimulatedDate,
            }
          : p
      )
    );

    logAudit(
      'Patient Discharged & Room Released',
      'discharge',
      `Admin confirmed official discharge for ${patient.name} (Patient ID: ${patientId}). Verified 3+ consecutive fever-free days. Room ${releasedRoom} has been released and is now available for new admissions.${
        notes ? ` Admin Notes: "${notes}"` : ''
      }`,
      patientId
    );

    showToast(
      'success',
      'Patient Discharged',
      `${patient.name} discharged successfully. Room ${releasedRoom} is now vacant and ready for new intake.`
    );

    return { success: true };
  };

  // Action: Record Patient Outcome (Death) - for epidemiological mortality monitoring
  const recordPatientOutcomeDeath = (patientId: string, clinicalNotes: string) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient || patient.status !== 'active') {
      showToast('error', 'Error', 'Patient not found or inactive.');
      return { success: false, error: 'Patient not found or inactive' };
    }

    const releasedRoom = patient.roomNumber;
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              status: 'deceased',
              deathDate: settings.currentSimulatedDate,
            }
          : p
      )
    );

    logAudit(
      'Mortality Outcome Recorded',
      'discharge',
      `Deceased outcome recorded for ${patient.name} (ID: ${patientId}, Room ${releasedRoom}). Released Room ${releasedRoom}. Clinical report: "${clinicalNotes}". Facility mortality metrics updated.`,
      patientId
    );

    showToast(
      'warning',
      'Outcome Recorded',
      `Deceased outcome logged for ${patient.name}. Room ${releasedRoom} released.`
    );

    return { success: true };
  };

  // Action: Reset Demo Data
  const resetToSeedData = () => {
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_settings`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_role`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_patients`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_temperatures`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_visits`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_audit`);
    } catch (e) {
      console.warn('Failed clearing localStorage', e);
    }

    setSettings(INITIAL_SETTINGS);
    setCurrentRole('nurse');
    setPatients(getInitialPatients());
    setTemperatureReadings(getInitialTemperatureReadings());
    setDoctorVisits(getInitialDoctorVisits());
    setAuditLogs(getInitialAuditLogs());

    showToast('info', 'Demo Data Restored', 'All patient records, temperature logs, and visits have been reset to default.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        setRole,
        users: DEMO_USERS,
        settings,
        updateFeverThreshold,
        setSimulatedDate,
        advanceSimulatedDate,
        patients,
        temperatureReadings,
        doctorVisits,
        auditLogs,
        metrics,
        recordTemperature,
        recordDoctorVisit,
        registerPatient,
        dischargePatient,
        recordPatientOutcomeDeath,
        resetToSeedData,
        toasts,
        dismissToast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
