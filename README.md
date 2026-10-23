# CareTrack — Quarantine Facility Management System

**CareTrack** is a specialized clinical operations and quarantine facility management system designed for virus treatment isolation centers. Developed for a Technical Product Management assessment, it solves daily patient vital tracking, physician round coordination, objective discharge qualification, and epidemiological mortality monitoring for facilities with a hard capacity limit of 74 patients.

---

## 1. Problem Statement & Key Solutions

In virus quarantine environments, manual paper logs lead to missed vitals, uncoordinated physician visits, delayed releases, and capacity gridlock. CareTrack resolves these issues through strict clinical workflow automation:

1. **Ensures 100% Daily Vital Compliance:** Every active patient requires exactly one official daily temperature check in Celsius.
2. **Eliminates Duplicate Work:** Enforces a duplicate lock preventing redundant official daily temperature checks for the same patient on the same day.
3. **Synchronizes Physician Rounds:** Blocks routine doctor visits if today's vitals are missing, while providing a strictly audited emergency override for acute cases.
4. **Enforces Objective Discharge Criteria:** Patient release strictly requires **3 full consecutive documented fever-free days** (< configured threshold). Missing records break the sequence; fever resets it to zero.
5. **Instant Room Turnaround:** Discharging an eligible patient immediately frees room capacity (1–74) for incoming patients.
6. **Epidemiological Surveillance:** Tracks mortality against an expected 15% benchmark and 85% success benchmark using the resolved outcomes cohort.

---

## 2. Core Business Rules

The system is powered by pure, reusable business logic (`src/utils/businessLogic.ts`):

- **Rule 1 — Hard Capacity:** The facility accommodates a strict maximum of 74 patients (Rooms 1 to 74).
- **Rule 2 & 3 — Unique Allocation:** Room numbers and Patient IDs are strictly unique among active patients.
- **Rule 4 — Active Patients Only:** Only active quarantine patients can receive new official vital entries.
- **Rule 5 — Single Daily Measurement:** Enforces exactly 1 official temperature record per patient per facility calendar day.
- **Rule 6 — Configurable Fever Threshold:** Initially configured at 37.5°C (*Provisional Demonstration Setting*).
- **Rule 7 — Missing Readings are Not Normal:** A missing reading is never assumed to be afebrile.
- **Rule 8 — Physician Dependency:** Routine doctor rounds require today's temperature check.
- **Rule 9 — Documented Emergency Override:** Physicians can perform emergency rounds without vitals by submitting a mandatory clinical justification (which does not falsely mark vitals as complete).
- **Rule 10 & 11 — 3-Day Consecutive Afebrile Streak:** Discharge eligibility requires 3 unbroken consecutive documented calendar days with temperatures below the threshold. Fever or missing days reset/break the streak.
- **Rule 12 & 13 — Admin Discharge Authorization:** Eligibility does not auto-discharge. Authorized admin staff must confirm release.
- **Rule 14 — Immediate Room Release:** Discharge immediately vacates the room, updating capacity.
- **Rule 15 — Full Audit Trail:** All registrations, vitals, duplicate blocks, overrides, and releases are immutably logged.
- **Rule 16 — Epidemiological Outcome Math:**
  $$\text{Mortality Rate} = \frac{\text{Deaths}}{\text{Resolved Outcomes (Discharges + Deaths)}} \times 100$$
  $$\text{Success Rate} = \frac{\text{Discharges}}{\text{Resolved Outcomes (Discharges + Deaths)}} \times 100$$
  Active quarantine patients are strictly excluded from the denominator to prevent underestimating mortality.

---

## 3. Demonstration Roles

Switch between the 5 roles instantly via the top navigation bar:

| Role | Demo User | Key Responsibilities & Capabilities |
| :--- | :--- | :--- |
| **Nurse** | Priya Sharma, RN | Records daily Celsius vitals, enters clinical remarks, prevented from duplicate daily entries. |
| **Doctor** | Dr. Alistair Ross, MD | Conducts daily rounds, reviews thermal trajectories, invokes emergency overrides, issues discharge recommendations. |
| **Admin Staff** | Clara Oswald | Manages admissions, assigns rooms 1–74, verifies 3-day afebrile criteria, confirms discharge to free rooms. |
| **Facility Manager** | Dir. James Sterling | Monitors bed occupancy, operational queues, and mortality against the 15% alert benchmark. |
| **System Admin** | Tariq Vance | Configures clinical thresholds, inspects system audit trail, simulates calendar dates. |

---

## 4. End-to-End Demonstration Scenarios

Click **"Assessor Demo Scenarios"** in the top navigation to follow guided walkthroughs:

### Scenario A: Nurse Records Temperature & Duplicate Lock
1. Select the **Nurse** role from the header dropdown.
2. Navigate to **Temperature Recording**.
3. Select **Liam O'Connor (Room 22)** (today's vital is pending).
4. Enter `36.8`°C with notes *"Patient afebrile and resting"*, click **Save Official Daily Reading**.
5. Observe success toast; Liam's pending status clears and shift progress updates.
6. Try saving a second reading for Liam on the same day -> verify the **Duplicate Entry Safeguard** blocks submission and logs an audit record!

### Scenario B: Doctor Rounds & Emergency Override
1. Select the **Doctor** role.
2. Navigate to **Doctor Rounds**.
3. Select **David Chen (Room 15)** who has NO temperature logged today.
4. Click **Record Visit** -> observe clinical alert: *Routine Visit Blocked: Today's official temperature check is required*.
5. Click **Switch to Emergency Override**, enter reason: *"Acute dyspnea requiring urgent bedside assessment"*, and confirm.
6. Verify the emergency visit is logged in the audit log while David's daily vital check remains flagged as pending!
7. Select **Elena Rostova (Room 19)** (vitals complete) and successfully submit routine visit notes.

### Scenario C: Admin Discharges an Eligible Patient
1. Select the **Admin** role.
2. Navigate to **Discharge Management**.
3. Review **Sarah Jenkins (Room 4)**: 4 consecutive documented afebrile days and physician recommendation verified.
4. Click **Confirm Admin Discharge** -> review confirmation details noting Room 4 will be released.
5. Confirm discharge -> verify Room 4 immediately becomes vacant, capacity drops, and Sarah moves to Discharged.
6. Attempt to discharge an ineligible patient (e.g. Marcus Vance in Room 8 who has fever) -> verify action is strictly blocked with clinical rationale.

### Scenario D: Manager Monitors Mortality Benchmark (>15%)
1. Select the **Facility Manager** role.
2. Navigate to **Facility Performance**.
3. Observe the high-priority **Mortality Rate Warning Banner**: mortality is currently at **20.0%** (2 deaths out of 10 resolved cases), exceeding the 15.0% threshold.
4. Review the cohort table and mathematical formulas explaining that active patients are excluded from the denominator.

---

## 5. Technology Stack & Architecture

- **Frontend:** React 19, TypeScript, Vite.
- **Styling:** Tailwind CSS v4, Lucide React icons.
- **Persistence:** Client-side reactive `localStorage` with initial seed datasets, exportable audit trails, and 1-click **Reset Demo Data**.
- **Date Simulation:** Built-in timeline simulator (`+1 Day` / `-1 Day`) enabling assessors to test multi-day quarantine rules without waiting 24 real hours.

---

## 6. Local Development & Deployment

### Quick Start
```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Build for production
npm run build
```

### Vercel Deployment
The repository is 100% standard Vite React SPA:
1. Connect repository to Vercel.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Deploy with zero additional environment configuration required.
