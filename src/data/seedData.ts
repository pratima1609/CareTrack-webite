/**
 * CareTrack — Quarantine Facility Management System
 * Comprehensive Seed Data
 *
 * Provides realistic, fictional demo records covering all 74 rooms,
 * multiple active clinical scenarios, and historical resolved outcomes.
 */

import {
  Patient,
  TemperatureReading,
  DoctorVisit,
  AuditLogEntry,
  FacilitySettings,
  UserProfile,
} from '../types';
import { offsetDate } from '../utils/businessLogic';

export const SIMULATED_TODAY = '2026-10-23';

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'u-nurse',
    name: 'Nurse Priya Sharma, RN',
    role: 'nurse',
    title: 'Senior Quarantine Triage Nurse',
    avatarInitials: 'PS',
  },
  {
    id: 'u-doctor',
    name: 'Dr. Alistair Ross, MD',
    role: 'doctor',
    title: 'Infectious Disease Consultant',
    avatarInitials: 'AR',
  },
  {
    id: 'u-admin',
    name: 'Clara Oswald',
    role: 'admin',
    title: 'Admissions & Patient Registrar',
    avatarInitials: 'CO',
  },
  {
    id: 'u-manager',
    name: 'Director James Sterling',
    role: 'manager',
    title: 'Facility Operations Manager',
    avatarInitials: 'JS',
  },
  {
    id: 'u-sysadmin',
    name: 'Tariq Vance',
    role: 'sysadmin',
    title: 'Clinical IT Administrator',
    avatarInitials: 'TV',
  },
];

export const INITIAL_SETTINGS: FacilitySettings = {
  facilityName: 'CareTrack Regional Quarantine Centre — Ward Alpha',
  feverThreshold: 37.5,
  maxCapacity: 74,
  currentSimulatedDate: SIMULATED_TODAY,
  quarantineRequiredDays: 3,
};

export function getInitialPatients(): Patient[] {
  return [
    // 1. ELIGIBLE FOR DISCHARGE (Scenario C candidate: 3 full fever-free days, doctor recommended)
    {
      id: 'CT-001',
      name: 'Sarah Jenkins',
      age: 34,
      gender: 'Female',
      roomNumber: 4,
      admissionDate: offsetDate(SIMULATED_TODAY, -6),
      status: 'active',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: ['Mild Asthma'],
      doctorDischargeRecommended: true,
      doctorDischargeNotes: 'Patient completed 3+ consecutive afebrile days with clear lungs. Ready for discharge.',
      admissionNotes: 'Transferred from port of entry triage. Mild respiratory symptoms upon intake.',
    },
    // 2. ACTIVE FEVER TODAY
    {
      id: 'CT-002',
      name: 'Marcus Vance',
      age: 46,
      gender: 'Male',
      roomNumber: 8,
      admissionDate: offsetDate(SIMULATED_TODAY, -4),
      status: 'active',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: ['Type 2 Diabetes'],
      doctorDischargeRecommended: false,
      admissionNotes: 'High viral load detected. Requires antipyretics and close oxygenation monitoring.',
    },
    // 3. PENDING TODAY'S TEMPERATURE (Scenario A candidate: Nurse records reading)
    {
      id: 'CT-003',
      name: 'Amira Patel',
      age: 29,
      gender: 'Female',
      roomNumber: 12,
      admissionDate: offsetDate(SIMULATED_TODAY, -5),
      status: 'active',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: [],
      doctorDischargeRecommended: false,
      admissionNotes: 'Quarantine day 5. Asymptomatic carrier.',
    },
    // 4. MISSING TEMP TODAY - ROUTINE VISIT BLOCKED / EMERGENCY OVERRIDE (Scenario B candidate)
    {
      id: 'CT-004',
      name: 'David Chen',
      age: 52,
      gender: 'Male',
      roomNumber: 15,
      admissionDate: offsetDate(SIMULATED_TODAY, -3),
      status: 'active',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: ['Hypertension'],
      doctorDischargeRecommended: false,
      admissionNotes: 'Reported sudden acute chest tightness during morning shift check.',
    },
    // 5. TEMP DONE, DOCTOR VISIT PENDING (Scenario B routine visit candidate)
    {
      id: 'CT-005',
      name: 'Elena Rostova',
      age: 38,
      gender: 'Female',
      roomNumber: 19,
      admissionDate: offsetDate(SIMULATED_TODAY, -4),
      status: 'active',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: [],
      doctorDischargeRecommended: false,
      admissionNotes: 'Recovering well, stable vitals.',
    },
    // 6. FRESH ADMISSION - TODAY TEMP PENDING
    {
      id: 'CT-006',
      name: "Liam O'Connor",
      age: 41,
      gender: 'Male',
      roomNumber: 22,
      admissionDate: offsetDate(SIMULATED_TODAY, -1),
      status: 'active',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: [],
      doctorDischargeRecommended: false,
      admissionNotes: 'Newly admitted yesterday from community quarantine transport.',
    },
    // 7. FEVER YESTERDAY (Streak broken, 1 day fever-free today)
    {
      id: 'CT-007',
      name: 'Fatimah Al-Mansoor',
      age: 31,
      gender: 'Female',
      roomNumber: 27,
      admissionDate: offsetDate(SIMULATED_TODAY, -6),
      status: 'active',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: [],
      doctorDischargeRecommended: false,
      admissionNotes: 'Spiked 38.3°C yesterday after 2 days of normal temps.',
    },
    // 8. MISSING HISTORICAL READING (Streak broken 2 days ago)
    {
      id: 'CT-008',
      name: 'Carlos Mendez',
      age: 49,
      gender: 'Male',
      roomNumber: 31,
      admissionDate: offsetDate(SIMULATED_TODAY, -5),
      status: 'active',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: ['Smoking history'],
      doctorDischargeRecommended: false,
      admissionNotes: 'Missed scheduled vitals two days ago due to facility transfer delay.',
    },
    // 9. 3 DAYS FEVER FREE BUT DOCTOR HAS NOT CONFIRMED DISCHARGE
    {
      id: 'CT-009',
      name: 'Grace Hopper-Kim',
      age: 26,
      gender: 'Female',
      roomNumber: 35,
      admissionDate: offsetDate(SIMULATED_TODAY, -5),
      status: 'active',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: [],
      doctorDischargeRecommended: false,
      admissionNotes: 'Clinically fever-free 3 days, awaiting doctor rounds review.',
    },
    // 10. ELDERLY PATIENT - ELIGIBLE FOR DISCHARGE (4 fever-free days)
    {
      id: 'CT-010',
      name: 'Arthur Pendelton',
      age: 78,
      gender: 'Male',
      roomNumber: 40,
      admissionDate: offsetDate(SIMULATED_TODAY, -7),
      status: 'active',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: ['Hypertension', 'Osteoarthritis'],
      doctorDischargeRecommended: true,
      doctorDischargeNotes: 'Vitals stable x 4 days. Cleared for discharge to home care.',
      admissionNotes: 'Monitored closely due to age cohort.',
    },
    // 11-22: ADDITIONAL ACTIVE PATIENTS IN WARDS
    {
      id: 'CT-011',
      name: 'Beatrice Thorne',
      age: 62,
      gender: 'Female',
      roomNumber: 42,
      admissionDate: offsetDate(SIMULATED_TODAY, -4),
      status: 'active',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: ['Thyroid disorder'],
      doctorDischargeRecommended: false,
    },
    {
      id: 'CT-012',
      name: 'Samuel Kalu',
      age: 33,
      gender: 'Male',
      roomNumber: 45,
      admissionDate: offsetDate(SIMULATED_TODAY, -3),
      status: 'active',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: [],
      doctorDischargeRecommended: false,
    },
    {
      id: 'CT-013',
      name: 'Hannah Abbott',
      age: 24,
      gender: 'Female',
      roomNumber: 48,
      admissionDate: offsetDate(SIMULATED_TODAY, -2),
      status: 'active',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: ['Mild allergy'],
      doctorDischargeRecommended: false,
    },
    {
      id: 'CT-014',
      name: 'Dmitri Volkov',
      age: 55,
      gender: 'Male',
      roomNumber: 51,
      admissionDate: offsetDate(SIMULATED_TODAY, -5),
      status: 'active',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: ['Coronary artery disease'],
      doctorDischargeRecommended: false,
    },
    {
      id: 'CT-015',
      name: 'Nia Williams',
      age: 39,
      gender: 'Female',
      roomNumber: 55,
      admissionDate: offsetDate(SIMULATED_TODAY, -4),
      status: 'active',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: [],
      doctorDischargeRecommended: false,
    },
    {
      id: 'CT-016',
      name: 'Zane Malik',
      age: 44,
      gender: 'Male',
      roomNumber: 58,
      admissionDate: offsetDate(SIMULATED_TODAY, -3),
      status: 'active',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: [],
      doctorDischargeRecommended: false,
    },
    {
      id: 'CT-017',
      name: 'Chloe Dubois',
      age: 30,
      gender: 'Female',
      roomNumber: 60,
      admissionDate: offsetDate(SIMULATED_TODAY, -6),
      status: 'active',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: [],
      doctorDischargeRecommended: true,
      doctorDischargeNotes: 'Eligible for release, asymptomatic.',
    },
    {
      id: 'CT-018',
      name: 'Kenji Sato',
      age: 50,
      gender: 'Male',
      roomNumber: 62,
      admissionDate: offsetDate(SIMULATED_TODAY, -4),
      status: 'active',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: [],
      doctorDischargeRecommended: false,
    },
    {
      id: 'CT-019',
      name: 'Amina Diallo',
      age: 28,
      gender: 'Female',
      roomNumber: 65,
      admissionDate: offsetDate(SIMULATED_TODAY, -2),
      status: 'active',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: [],
      doctorDischargeRecommended: false,
    },
    {
      id: 'CT-020',
      name: 'Oliver Queen',
      age: 47,
      gender: 'Male',
      roomNumber: 68,
      admissionDate: offsetDate(SIMULATED_TODAY, -5),
      status: 'active',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: [],
      doctorDischargeRecommended: false,
    },
    {
      id: 'CT-021',
      name: 'Rosa Salazar',
      age: 36,
      gender: 'Female',
      roomNumber: 71,
      admissionDate: offsetDate(SIMULATED_TODAY, -3),
      status: 'active',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: [],
      doctorDischargeRecommended: false,
    },
    {
      id: 'CT-022',
      name: 'Viktor Reznov',
      age: 68,
      gender: 'Male',
      roomNumber: 74,
      admissionDate: offsetDate(SIMULATED_TODAY, -6),
      status: 'active',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: ['Chronic Bronchitis'],
      doctorDischargeRecommended: false,
    },

    // 23-32: HISTORICAL RESOLVED OUTCOMES (8 DISCHARGED, 2 DECEASED = 10 RESOLVED OUTCOMES, 20% MORTALITY)
    // Satisfies:
    // - Calculate mortality as deaths / resolved outcomes * 100
    // - Success as discharges / resolved outcomes * 100
    // - Show warning when mortality exceeds 15% (20% > 15% triggers warning!)
    {
      id: 'CT-D01',
      name: 'Eleanor Vance',
      age: 31,
      gender: 'Female',
      roomNumber: 1,
      admissionDate: offsetDate(SIMULATED_TODAY, -18),
      dischargeDate: offsetDate(SIMULATED_TODAY, -10),
      status: 'discharged',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: [],
      admissionNotes: 'Completed 14-day protocol, fever-free.',
    },
    {
      id: 'CT-D02',
      name: 'Gabriel Reyes',
      age: 40,
      gender: 'Male',
      roomNumber: 2,
      admissionDate: offsetDate(SIMULATED_TODAY, -16),
      dischargeDate: offsetDate(SIMULATED_TODAY, -8),
      status: 'discharged',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: [],
    },
    {
      id: 'CT-D03',
      name: 'Mei-Ling Zhou',
      age: 27,
      gender: 'Female',
      roomNumber: 3,
      admissionDate: offsetDate(SIMULATED_TODAY, -14),
      dischargeDate: offsetDate(SIMULATED_TODAY, -7),
      status: 'discharged',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: [],
    },
    {
      id: 'CT-D04',
      name: 'Jonathan Archer',
      age: 49,
      gender: 'Male',
      roomNumber: 5,
      admissionDate: offsetDate(SIMULATED_TODAY, -15),
      dischargeDate: offsetDate(SIMULATED_TODAY, -6),
      status: 'discharged',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: [],
    },
    {
      id: 'CT-D05',
      name: 'Sofia Coppola',
      age: 35,
      gender: 'Female',
      roomNumber: 6,
      admissionDate: offsetDate(SIMULATED_TODAY, -12),
      dischargeDate: offsetDate(SIMULATED_TODAY, -5),
      status: 'discharged',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: [],
    },
    {
      id: 'CT-D06',
      name: 'Patrick Stewart',
      age: 72,
      gender: 'Male',
      roomNumber: 7,
      admissionDate: offsetDate(SIMULATED_TODAY, -14),
      dischargeDate: offsetDate(SIMULATED_TODAY, -4),
      status: 'discharged',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: ['Mild hypertension'],
    },
    {
      id: 'CT-D07',
      name: 'Aisha Al-Nuaimi',
      age: 30,
      gender: 'Female',
      roomNumber: 9,
      admissionDate: offsetDate(SIMULATED_TODAY, -11),
      dischargeDate: offsetDate(SIMULATED_TODAY, -3),
      status: 'discharged',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: [],
    },
    {
      id: 'CT-D08',
      name: 'Lucas Silva',
      age: 43,
      gender: 'Male',
      roomNumber: 10,
      admissionDate: offsetDate(SIMULATED_TODAY, -10),
      dischargeDate: offsetDate(SIMULATED_TODAY, -2),
      status: 'discharged',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: [],
    },
    // Deceased outcomes:
    {
      id: 'CT-DEC01',
      name: 'Harold Finch',
      age: 82,
      gender: 'Male',
      roomNumber: 11,
      admissionDate: offsetDate(SIMULATED_TODAY, -20),
      deathDate: offsetDate(SIMULATED_TODAY, -9),
      status: 'deceased',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: ['Severe COPD', 'Congestive Heart Failure'],
      admissionNotes: 'Developed acute respiratory distress syndrome (ARDS) refractory to oxygen therapy.',
    },
    {
      id: 'CT-DEC02',
      name: 'Valerie Tremblay',
      age: 79,
      gender: 'Female',
      roomNumber: 13,
      admissionDate: offsetDate(SIMULATED_TODAY, -15),
      deathDate: offsetDate(SIMULATED_TODAY, -5),
      status: 'deceased',
      assignedDoctor: 'Dr. Alistair Ross, MD',
      underlyingConditions: ['Late-stage Renal Failure'],
      admissionNotes: 'Severe cytokine storm complications on day 10.',
    },
  ];
}

export function getInitialTemperatureReadings(): TemperatureReading[] {
  const readings: TemperatureReading[] = [];
  const nurseName = 'Nurse Priya Sharma, RN';

  // Helper to add reading
  const addR = (patientId: string, dayOffset: number, temp: number, obs = '', isEmg = false) => {
    const date = offsetDate(SIMULATED_TODAY, dayOffset);
    readings.push({
      id: `TR-${patientId}-${date}`,
      patientId,
      date,
      timestamp: `${date}T08:30:00.000Z`,
      temperature: temp,
      isFever: temp >= 37.5,
      recordedBy: nurseName,
      recordedByRole: 'nurse',
      observations: obs,
      isEmergencyReading: isEmg,
    });
  };

  // CT-001 (Sarah Jenkins): 4 consecutive fever-free days up to today -> ELIGIBLE
  addR('CT-001', -3, 36.6, 'Patient resting comfortably. Pulse 72.');
  addR('CT-001', -2, 36.5, 'Normal breath sounds. Appetite good.');
  addR('CT-001', -1, 36.6, 'No coughing observed. Afebrile.');
  addR('CT-001', 0, 36.5, 'Official morning check. Patient cheerful, ready for release.');

  // CT-002 (Marcus Vance): Active fever today
  addR('CT-002', -3, 37.2, 'Normal vitals.');
  addR('CT-002', -2, 37.8, 'Low grade fever started. Paracetamol administered.');
  addR('CT-002', -1, 38.2, 'Persistent fever, moderate dry cough.');
  addR('CT-002', 0, 38.8, 'Acute high fever detected. Oxygen saturation 94%. Alerts triggered!');

  // CT-003 (Amira Patel): 2 fever-free days, TODAY IS PENDING
  addR('CT-003', -3, 36.7, 'Stable.');
  addR('CT-003', -2, 36.8, 'Stable.');
  addR('CT-003', -1, 36.6, 'Afebrile.');
  // Day 0 (today) intentionally omitted so nurse can record it!

  // CT-004 (David Chen): Missing today!
  addR('CT-004', -2, 36.9, 'Clear chest.');
  addR('CT-004', -1, 37.1, 'Mild fatigue noted.');
  // Day 0 intentionally missing for Scenario B emergency visit override test!

  // CT-005 (Elena Rostova): Recorded today, doctor visit pending
  addR('CT-005', -2, 36.7, 'Normal vitals.');
  addR('CT-005', -1, 36.6, 'Normal vitals.');
  addR('CT-005', 0, 36.8, 'Morning reading completed. Vitals stable.');

  // CT-006 (Liam O'Connor): Today pending
  addR('CT-006', -1, 36.9, 'Intake baseline temperature.');
  // Day 0 pending

  // CT-007 (Fatimah): Fever yesterday (38.3°C), today normal (37.1°C)
  addR('CT-007', -3, 36.8, 'Normal.');
  addR('CT-007', -2, 36.7, 'Normal.');
  addR('CT-007', -1, 38.3, 'Spike in fever at 14:00. Treated with antipyretics.');
  addR('CT-007', 0, 37.1, 'Temperature subsided following medication.');

  // CT-008 (Carlos Mendez): Missing reading -2 days ago
  addR('CT-008', -4, 36.7, 'Normal.');
  addR('CT-008', -3, 36.8, 'Normal.');
  // Day -2 MISSING intentionally!
  addR('CT-008', -1, 36.6, 'Normal reading resumed.');
  addR('CT-008', 0, 36.5, 'Afebrile today.');

  // CT-009 (Grace Hopper-Kim): 3 fever-free days, waiting for doctor
  addR('CT-009', -3, 36.6, 'Afebrile.');
  addR('CT-009', -2, 36.7, 'Afebrile.');
  addR('CT-009', -1, 36.5, 'Afebrile.');
  addR('CT-009', 0, 36.6, 'Consecutive 4th day fever-free.');

  // CT-010 (Arthur Pendelton): 4 fever-free days
  addR('CT-010', -4, 36.7, 'Vitals normal.');
  addR('CT-010', -3, 36.6, 'Vitals normal.');
  addR('CT-010', -2, 36.5, 'Vitals normal.');
  addR('CT-010', -1, 36.6, 'Afebrile.');
  addR('CT-010', 0, 36.5, 'Afebrile.');

  // Readings for other patients today to provide varied metrics
  addR('CT-011', 0, 36.9, 'Morning check normal.');
  addR('CT-012', 0, 37.0, 'Complaining of slight headache, no fever.');
  // CT-013 pending
  addR('CT-014', 0, 37.3, 'Borderline normal.');
  // CT-015 pending
  addR('CT-016', 0, 36.7, 'Stable.');
  addR('CT-017', 0, 36.5, 'Afebrile.');
  // CT-018 pending
  addR('CT-019', 0, 37.1, 'Normal.');
  // CT-020 pending
  addR('CT-021', 0, 36.8, 'Normal.');
  addR('CT-022', 0, 37.6, 'Fever detected (37.6°C). Cough observed.');

  return readings;
}

export function getInitialDoctorVisits(): DoctorVisit[] {
  const visits: DoctorVisit[] = [];
  const doctorName = 'Dr. Alistair Ross, MD';

  // CT-001: Completed today, discharge recommended
  visits.push({
    id: 'DV-CT001-TODAY',
    patientId: 'CT-001',
    date: SIMULATED_TODAY,
    timestamp: `${SIMULATED_TODAY}T10:15:00.000Z`,
    doctorName,
    visitType: 'routine',
    notes: 'Lungs clear bilaterally. Vitals normal across 4 continuous days. Recommended for immediate discharge.',
    dischargeRecommendation: 'eligible_for_discharge',
  });

  // CT-010: Completed today
  visits.push({
    id: 'DV-CT010-TODAY',
    patientId: 'CT-010',
    date: SIMULATED_TODAY,
    timestamp: `${SIMULATED_TODAY}T10:45:00.000Z`,
    doctorName,
    visitType: 'routine',
    notes: 'Patient clear for discharge. Prescribed maintenance anti-hypertensives upon release.',
    dischargeRecommendation: 'eligible_for_discharge',
  });

  // CT-017: Completed today
  visits.push({
    id: 'DV-CT017-TODAY',
    patientId: 'CT-017',
    date: SIMULATED_TODAY,
    timestamp: `${SIMULATED_TODAY}T11:00:00.000Z`,
    doctorName,
    visitType: 'routine',
    notes: 'Recovery confirmed. Patient cleared.',
    dischargeRecommendation: 'eligible_for_discharge',
  });

  return visits;
}

export function getInitialAuditLogs(): AuditLogEntry[] {
  return [
    {
      id: 'AUD-001',
      timestamp: `${offsetDate(SIMULATED_TODAY, -6)}T09:00:00.000Z`,
      actor: 'Clara Oswald',
      role: 'admin',
      action: 'Patient Registered & Room Assigned',
      patientId: 'CT-001',
      details: 'Registered Sarah Jenkins (Age 34) and assigned Room 4.',
      category: 'registration',
    },
    {
      id: 'AUD-002',
      timestamp: `${offsetDate(SIMULATED_TODAY, -1)}T14:30:00.000Z`,
      actor: 'Nurse Priya Sharma, RN',
      role: 'nurse',
      action: 'Fever Alert Triggered',
      patientId: 'CT-007',
      details: 'Recorded 38.3°C for Fatimah Al-Mansoor (Room 27). Consecutive fever-free count reset to 0.',
      category: 'temperature',
    },
    {
      id: 'AUD-003',
      timestamp: `${SIMULATED_TODAY}T08:15:00.000Z`,
      actor: 'Nurse Priya Sharma, RN',
      role: 'nurse',
      action: 'High Fever Recorded',
      patientId: 'CT-002',
      details: 'Recorded 38.8°C for Marcus Vance (Room 8). Urgent notification sent to attending physician.',
      category: 'temperature',
    },
    {
      id: 'AUD-004',
      timestamp: `${SIMULATED_TODAY}T10:15:00.000Z`,
      actor: 'Dr. Alistair Ross, MD',
      role: 'doctor',
      action: 'Doctor Visit Completed & Discharge Recommended',
      patientId: 'CT-001',
      details: 'Routine rounds completed. Patient Sarah Jenkins qualified for discharge after 3+ fever-free days.',
      category: 'doctor_visit',
    },
    {
      id: 'AUD-005',
      timestamp: `${SIMULATED_TODAY}T07:00:00.000Z`,
      actor: 'System IT',
      role: 'sysadmin',
      action: 'System Boot & Daily Protocol Initialized',
      details: 'CareTrack quarantine daily tracking active. Fever threshold configured at 37.5°C.',
      category: 'system',
    },
  ];
}
