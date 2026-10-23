/**
 * CareTrack — Assessor Scenario Demonstration Guide Modal
 * Guides assessors step-by-step through Scenarios A, B, C, and D.
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, ChevronRight, X, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Role } from '../types';

interface ScenarioGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToScreen: (screenId: string, preselectPatientId?: string) => void;
}

export const ScenarioGuideModal: React.FC<ScenarioGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateToScreen,
}) => {
  const { setRole, currentRole, resetToSeedData } = useApp();
  const [activeTab, setActiveTab] = useState<'A' | 'B' | 'C' | 'D'>('A');

  if (!isOpen) return null;

  const scenarios = {
    A: {
      title: 'Scenario A: Nurse Records Temperature & Duplicate Prevention',
      role: 'nurse' as Role,
      targetScreen: 'temperatures',
      testPatientId: 'CT-006',
      testPatientName: "Liam O'Connor (Room 22)",
      description: 'Demonstrates temperature input validation, live threshold alerts, immediate persistence, and duplicate daily measurement blocking.',
      steps: [
        'Switch role to Nurse (auto-activates when you click below).',
        'Open "Record Temperature" screen.',
        'Select patient Liam O\'Connor (Room 22) whose temperature is pending today.',
        'Enter 36.8°C with observation "Patient feeling well" and click "Save Official Reading".',
        'Verify toast confirms success, today\'s pending count decrements, and record appears in history.',
        'Attempt to save a second reading for Liam on the same day -> verify duplicate entry warning blocks the save and logs the attempt!',
      ],
    },
    B: {
      title: 'Scenario B: Doctor Routine Rounds & Emergency Override',
      role: 'doctor' as Role,
      targetScreen: 'doctor_rounds',
      testPatientId: 'CT-004',
      testPatientName: 'David Chen (Room 15) & Elena Rostova (Room 19)',
      description: 'Demonstrates clinical dependency rule (routine visit requires today\'s temperature) and the separate emergency override workflow.',
      steps: [
        'Switch role to Doctor (auto-activates below).',
        'Open "Doctor Rounds" screen.',
        'Attempt routine visit on David Chen (Room 15) who has NO temperature logged today -> verify system blocks routine completion.',
        'Click "Emergency Override" for David Chen, enter clinical justification ("Acute respiratory decompensation"), and record visit.',
        'Verify emergency visit is logged with an audit trail while David\'s temperature check remains flagged as pending.',
        'Now select Elena Rostova (Room 19) who HAS a temperature recorded -> complete routine visit with notes & discharge recommendation.',
      ],
    },
    C: {
      title: 'Scenario C: Admin Confirms Discharge & Room Release',
      role: 'admin' as Role,
      targetScreen: 'discharge',
      testPatientId: 'CT-001',
      testPatientName: 'Sarah Jenkins (Room 4)',
      description: 'Demonstrates the 3 full consecutive fever-free day criterion, doctor recommendation check, admin confirmation, and immediate room release.',
      steps: [
        'Switch role to Admin Staff (auto-activates below).',
        'Open "Discharge Management" screen.',
        'Review Sarah Jenkins (Room 4): has 4 consecutive documented fever-free days and doctor clearance.',
        'Click "Confirm Discharge" for Sarah -> confirm dialog notes Room 4 will be released.',
        'Verify Sarah status updates to Discharged, Room 4 immediately becomes available (capacity increases), and audit trail is created.',
        'Try attempting discharge on Marcus Vance (Room 8, has active fever) or Amira Patel (missing readings) -> verify action is blocked!',
      ],
    },
    D: {
      title: 'Scenario D: Facility Manager Monitors 15% Mortality Benchmark',
      role: 'manager' as Role,
      targetScreen: 'performance',
      testPatientId: undefined,
      testPatientName: 'Ward Alpha Operations',
      description: 'Demonstrates facility-wide operational metrics, resolved outcomes calculation, and dynamic warning when mortality exceeds 15%.',
      steps: [
        'Switch role to Facility Manager (auto-activates below).',
        'Open "Facility Performance" screen.',
        'Examine Occupancy, Total Admissions, Discharges, and Deceased metrics.',
        'Review Mortality Rate (calculated strictly from resolved outcomes cohort: deaths / [discharges + deaths] * 100).',
        'Observe the high-priority amber warning banner triggered because initial mortality (2 deaths / 10 resolved = 20.0%) exceeds the 15% benchmark.',
        'Use the interactive Outcome Simulation tool to discharge a patient and observe mortality drop back below 15% with warning clearing!',
      ],
    },
  };

  const currentScenario = scenarios[activeTab];

  const handleLaunchScenario = () => {
    setRole(currentScenario.role);
    onNavigateToScreen(currentScenario.targetScreen, currentScenario.testPatientId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Assessor Demonstration Scenarios</h2>
              <p className="text-xs text-slate-500">Fast-track verification of technical assessment workflows</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-white px-5 pt-3 gap-2 overflow-x-auto">
          {(['A', 'B', 'C', 'D'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Scenario {tab}</span>
              <span className="text-[10px] font-normal text-slate-400">
                ({tab === 'A' ? 'Nurse' : tab === 'B' ? 'Doctor' : tab === 'C' ? 'Admin' : 'Manager'})
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Role: {currentScenario.role.toUpperCase()}
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-2">{currentScenario.title}</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{currentScenario.description}</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700">Recommended Test Target: </span>
            <span className="font-mono text-teal-800 font-medium">{currentScenario.testPatientName}</span>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Step-by-Step Verification Script
            </h4>
            <div className="space-y-2">
              {currentScenario.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="flex-1 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              resetToSeedData();
            }}
            className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2"
          >
            Reset Seed Data to Start Clean
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleLaunchScenario}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Launch Scenario {activeTab}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
