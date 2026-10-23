/**
 * CareTrack — Quarantine Facility Management System
 * Core Types & Data Contracts
 */

export type Role = 'nurse' | 'doctor' | 'admin' | 'manager' | 'sysadmin';

export interface UserProfile {
  id: string;
  name: string;
  role: Role;
  title: string;
  avatarInitials: string;
}

export type PatientStatus = 'active' | 'discharged' | 'deceased';

export interface Patient {
  id: string; // e.g. "CT-001"
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  roomNumber: number; // 1 - 74
  admissionDate: string; // YYYY-MM-DD
  status: PatientStatus;
  dischargeDate?: string; // YYYY-MM-DD
  deathDate?: string; // YYYY-MM-DD
  assignedDoctor: string;
  underlyingConditions: string[];
  contactNumber?: string;
  emergencyContact?: string;
  doctorDischargeRecommended?: boolean;
  doctorDischargeNotes?: string;
  admissionNotes?: string;
}

export interface TemperatureReading {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD (facility-local date)
  timestamp: string; // ISO string
  temperature: number; // in Celsius e.g. 36.8
  isFever: boolean;
  recordedBy: string;
  recordedByRole: Role;
  observations?: string;
  isEmergencyReading?: boolean;
}

export type VisitType = 'routine' | 'emergency';

export interface DoctorVisit {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD (facility-local date)
  timestamp: string; // ISO string
  doctorName: string;
  visitType: VisitType;
  notes: string;
  emergencyReason?: string;
  dischargeRecommendation?: 'continue_quarantine' | 'eligible_for_discharge' | 'urgent_care';
}

export type AuditCategory =
  | 'registration'
  | 'temperature'
  | 'doctor_visit'
  | 'discharge'
  | 'clinical_override'
  | 'settings'
  | 'system';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: Role;
  action: string;
  patientId?: string;
  details: string;
  category: AuditCategory;
}

export interface FacilitySettings {
  feverThreshold: number; // e.g. 37.5 °C
  maxCapacity: number; // 74
  currentSimulatedDate: string; // YYYY-MM-DD
  facilityName: string;
  quarantineRequiredDays: number; // 3 full consecutive fever-free days
}

export interface DailyTempStatus {
  date: string;
  status: 'fever_free' | 'fever' | 'missing' | 'not_admitted';
  temperature?: number;
}

export interface DischargeEligibilityResult {
  consecutiveFeverFreeDays: number;
  isEligible: boolean;
  lastFeverDate: string | null;
  missingDaysCount: number;
  dailyBreakdown: DailyTempStatus[];
  ineligibilityReason?: string;
}

export interface FacilityMetrics {
  totalCapacity: number; // 74
  activePatients: number;
  occupiedRooms: number;
  availableRooms: number;
  occupancyRate: number; // %
  todayTempsCompleted: number;
  todayTempsPending: number;
  todayDoctorVisitsCompleted: number;
  todayDoctorVisitsPending: number;
  dischargeEligibleCount: number;
  totalAdmissions: number;
  totalDischarges: number;
  totalDeaths: number;
  resolvedOutcomes: number;
  mortalityRate: number; // (deaths / resolvedOutcomes) * 100
  successRate: number; // (discharges / resolvedOutcomes) * 100
  mortalityBenchmark: number; // 15%
  successBenchmark: number; // 85%
  isMortalityExceeded: boolean;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: number;
}
