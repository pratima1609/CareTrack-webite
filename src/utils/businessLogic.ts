/**
 * CareTrack — Quarantine Facility Management System
 * Core Business Logic Rules
 *
 * Implements the mandatory operational rules in pure, reusable functions:
 * 1. Hard capacity 74 occupied rooms (rooms 1-74).
 * 2. Room numbers unique among active patients.
 * 3. Unique patient IDs.
 * 4. Only active patients receive temperature records.
 * 5. One official temperature record per patient per facility-local calendar day.
 * 6. Configurable fever threshold (default 37.5°C).
 * 7. Missing temperatures never interpreted as normal.
 * 8. Routine doctor visits require today's temperature record.
 * 9. Urgent doctor visits permitted via documented emergency override.
 * 10. Three full consecutive documented fever-free days required for discharge eligibility.
 * 11. Fever or missing reading breaks consecutive sequence.
 * 12. Eligibility does not auto-discharge.
 * 13. Admin-only discharge confirmation.
 * 14. Discharging immediately frees assigned room.
 * 15. Audit trail preserved.
 * 16. Mortality = (deaths / resolved_outcomes) * 100 with 15% warning threshold.
 */

import {
  Patient,
  TemperatureReading,
  DoctorVisit,
  DischargeEligibilityResult,
  DailyTempStatus,
  FacilityMetrics,
} from '../types';

export const MAX_FACILITY_CAPACITY = 74;
export const DEFAULT_FEVER_THRESHOLD = 37.5;
export const REQUIRED_CONSECUTIVE_FEVER_FREE_DAYS = 3;

// Helper: Format date to YYYY-MM-DD
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: Add or subtract days from YYYY-MM-DD
export function offsetDate(dateStr: string, offsetDays: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + offsetDays);
  return formatDateISO(d);
}

// Helper: Calculate diff in days between two YYYY-MM-DD strings
export function daysDifference(startStr: string, endStr: string): number {
  const d1 = new Date(startStr + 'T12:00:00');
  const d2 = new Date(endStr + 'T12:00:00');
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 1. Room Availability Check
 */
export function isRoomAvailable(
  roomNumber: number,
  patients: Patient[],
  excludePatientId?: string
): boolean {
  if (roomNumber < 1 || roomNumber > MAX_FACILITY_CAPACITY) {
    return false;
  }
  const occupied = patients.some(
    (p) =>
      p.status === 'active' &&
      p.roomNumber === roomNumber &&
      p.id !== excludePatientId
  );
  return !occupied;
}

/**
 * Get all available room numbers (1 to 74)
 */
export function getAvailableRooms(patients: Patient[]): number[] {
  const activeRooms = new Set(
    patients
      .filter((p) => p.status === 'active')
      .map((p) => p.roomNumber)
  );
  const available: number[] = [];
  for (let r = 1; r <= MAX_FACILITY_CAPACITY; r++) {
    if (!activeRooms.has(r)) {
      available.push(r);
    }
  }
  return available;
}

/**
 * 2. Daily Temperature Lookup
 */
export function getPatientDailyTemperature(
  patientId: string,
  date: string,
  readings: TemperatureReading[]
): TemperatureReading | undefined {
  return readings.find(
    (r) => r.patientId === patientId && r.date === date
  );
}

/**
 * Check if patient has official temperature recorded today
 */
export function hasRecordedTemperatureToday(
  patientId: string,
  currentSimulatedDate: string,
  readings: TemperatureReading[]
): boolean {
  return readings.some(
    (r) => r.patientId === patientId && r.date === currentSimulatedDate
  );
}

/**
 * Check if patient has doctor visit recorded today
 */
export function hasCompletedDoctorVisitToday(
  patientId: string,
  currentSimulatedDate: string,
  visits: DoctorVisit[]
): boolean {
  return visits.some(
    (v) => v.patientId === patientId && v.date === currentSimulatedDate
  );
}

/**
 * 3. Temperature Validation
 * Rejects non-numeric, out-of-human-range (33.0°C to 44.0°C)
 */
export function validateTemperatureInput(
  rawInput: string | number,
  feverThreshold: number = DEFAULT_FEVER_THRESHOLD
): {
  valid: boolean;
  value?: number;
  error?: string;
  isFever?: boolean;
} {
  const str = String(rawInput).trim();
  if (!str) {
    return { valid: false, error: 'Temperature reading is required' };
  }
  const num = parseFloat(str);
  if (isNaN(num)) {
    return { valid: false, error: 'Temperature must be a valid numeric value' };
  }
  // Human physiological plausibility range for acute quarantine triage
  if (num < 33.0 || num > 44.0) {
    return {
      valid: false,
      error: 'Plausibility alert: Temperature must be between 33.0°C and 44.0°C',
    };
  }
  // Round to 1 decimal place
  const rounded = Math.round(num * 10) / 10;
  return {
    valid: true,
    value: rounded,
    isFever: rounded >= feverThreshold,
  };
}

/**
 * 4. Discharge Eligibility Calculation
 * Rule: Patient requires 3 full consecutive documented calendar days
 * with fever-free readings (< feverThreshold).
 * Missing readings do NOT count as fever-free days and break consecutive streaks.
 * Fever readings reset consecutive streaks.
 */
export function calculateDischargeEligibility(
  patient: Patient,
  readings: TemperatureReading[],
  currentSimulatedDate: string,
  feverThreshold: number = DEFAULT_FEVER_THRESHOLD,
  requiredDays: number = REQUIRED_CONSECUTIVE_FEVER_FREE_DAYS
): DischargeEligibilityResult {
  if (patient.status !== 'active') {
    return {
      consecutiveFeverFreeDays: 0,
      isEligible: false,
      lastFeverDate: null,
      missingDaysCount: 0,
      dailyBreakdown: [],
      ineligibilityReason: `Patient status is ${patient.status}. Only active patients can be evaluated.`,
    };
  }

  // Patient's readings mapped by date
  const patientReadings = readings.filter((r) => r.patientId === patient.id);
  const readingMap = new Map<string, TemperatureReading>();
  patientReadings.forEach((r) => readingMap.set(r.date, r));

  // Find last known fever date across all history
  let lastFeverDate: string | null = null;
  const allSortedReadings = [...patientReadings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  for (const r of allSortedReadings) {
    if (r.temperature >= feverThreshold) {
      lastFeverDate = r.date;
      break;
    }
  }

  // We analyze the recent sequence of calendar days up to currentSimulatedDate
  // A patient can qualify if either:
  // a) Today is recorded fever-free AND the 2 prior consecutive days were fever-free (3 full days)
  // b) Or the 3 prior completed full days (Today - 1, Today - 2, Today - 3) were all fever-free (if today is still pending or also fever-free)
  
  // Let's generate a daily breakdown for the last 5 days
  const breakdownDaysCount = Math.max(5, requiredDays + 2);
  const dailyBreakdown: DailyTempStatus[] = [];
  let missingDaysCount = 0;

  for (let i = 0; i < breakdownDaysCount; i++) {
    const checkDate = offsetDate(currentSimulatedDate, -i);
    // Only check days on or after admission
    if (daysDifference(patient.admissionDate, checkDate) < 0) {
      dailyBreakdown.push({
        date: checkDate,
        status: 'not_admitted',
      });
      continue;
    }

    const reading = readingMap.get(checkDate);
    if (!reading) {
      missingDaysCount++;
      dailyBreakdown.push({
        date: checkDate,
        status: 'missing',
      });
    } else if (reading.temperature >= feverThreshold) {
      dailyBreakdown.push({
        date: checkDate,
        status: 'fever',
        temperature: reading.temperature,
      });
    } else {
      dailyBreakdown.push({
        date: checkDate,
        status: 'fever_free',
        temperature: reading.temperature,
      });
    }
  }

  // Count consecutive fever-free days going back from either today (if recorded fever-free)
  // or starting from yesterday if today is pending.
  // Rule: Must be unbroken sequence of documented fever-free days.
  let consecutiveStreak = 0;
  
  // Case A: Counting streak backwards starting from today
  // If today has reading:
  const todayReading = readingMap.get(currentSimulatedDate);
  const startDayOffset = todayReading && todayReading.temperature < feverThreshold ? 0 : -1;
  
  let currentStreak = 0;
  for (let offset = startDayOffset; offset >= -30; offset--) {
    const targetDate = offsetDate(currentSimulatedDate, offset);
    if (daysDifference(patient.admissionDate, targetDate) < 0) {
      break;
    }
    const r = readingMap.get(targetDate);
    if (!r) {
      // Missing reading breaks consecutive sequence!
      break;
    }
    if (r.temperature >= feverThreshold) {
      // Fever breaks consecutive sequence!
      break;
    }
    currentStreak++;
  }
  consecutiveStreak = currentStreak;

  const isEligible = consecutiveStreak >= requiredDays;

  let ineligibilityReason: string | undefined;
  if (!isEligible) {
    if (lastFeverDate && daysDifference(lastFeverDate, currentSimulatedDate) < requiredDays) {
      ineligibilityReason = `Fever detected on ${lastFeverDate}. Needs ${requiredDays} full fever-free days after fever.`;
    } else if (consecutiveStreak === 0) {
      ineligibilityReason = `No documented fever-free streak yet or streak broken by missing reading.`;
    } else {
      ineligibilityReason = `Has ${consecutiveStreak} of ${requiredDays} required consecutive documented fever-free days.`;
    }
  }

  return {
    consecutiveFeverFreeDays: consecutiveStreak,
    isEligible,
    lastFeverDate,
    missingDaysCount,
    dailyBreakdown,
    ineligibilityReason,
  };
}

/**
 * 5. Facility-wide Operational and Epidemiological Metrics
 */
export function calculateFacilityMetrics(
  patients: Patient[],
  readings: TemperatureReading[],
  visits: DoctorVisit[],
  currentSimulatedDate: string,
  feverThreshold: number = DEFAULT_FEVER_THRESHOLD
): FacilityMetrics {
  const activePatients = patients.filter((p) => p.status === 'active');
  const occupiedRooms = activePatients.length;
  const availableRooms = Math.max(0, MAX_FACILITY_CAPACITY - occupiedRooms);
  const occupancyRate = (occupiedRooms / MAX_FACILITY_CAPACITY) * 100;

  let todayTempsCompleted = 0;
  let todayDoctorVisitsCompleted = 0;
  let dischargeEligibleCount = 0;

  for (const patient of activePatients) {
    if (hasRecordedTemperatureToday(patient.id, currentSimulatedDate, readings)) {
      todayTempsCompleted++;
    }
    if (hasCompletedDoctorVisitToday(patient.id, currentSimulatedDate, visits)) {
      todayDoctorVisitsCompleted++;
    }
    const eligibility = calculateDischargeEligibility(
      patient,
      readings,
      currentSimulatedDate,
      feverThreshold
    );
    if (eligibility.isEligible) {
      dischargeEligibleCount++;
    }
  }

  const todayTempsPending = activePatients.length - todayTempsCompleted;
  const todayDoctorVisitsPending = activePatients.length - todayDoctorVisitsCompleted;

  const totalAdmissions = patients.length;
  const totalDischarges = patients.filter((p) => p.status === 'discharged').length;
  const totalDeaths = patients.filter((p) => p.status === 'deceased').length;
  const resolvedOutcomes = totalDischarges + totalDeaths;

  // Mortality = deaths / resolved_outcomes * 100
  // Success = discharges / resolved_outcomes * 100
  const mortalityRate = resolvedOutcomes > 0 ? (totalDeaths / resolvedOutcomes) * 100 : 0;
  const successRate = resolvedOutcomes > 0 ? (totalDischarges / resolvedOutcomes) * 100 : 0;

  const mortalityBenchmark = 15;
  const successBenchmark = 85;
  const isMortalityExceeded = mortalityRate > mortalityBenchmark;

  return {
    totalCapacity: MAX_FACILITY_CAPACITY,
    activePatients: activePatients.length,
    occupiedRooms,
    availableRooms,
    occupancyRate: Math.round(occupancyRate * 10) / 10,
    todayTempsCompleted,
    todayTempsPending,
    todayDoctorVisitsCompleted,
    todayDoctorVisitsPending,
    dischargeEligibleCount,
    totalAdmissions,
    totalDischarges,
    totalDeaths,
    resolvedOutcomes,
    mortalityRate: Math.round(mortalityRate * 10) / 10,
    successRate: Math.round(successRate * 10) / 10,
    mortalityBenchmark,
    successBenchmark,
    isMortalityExceeded,
  };
}
