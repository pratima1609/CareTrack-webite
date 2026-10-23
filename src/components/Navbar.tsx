/**
 * CareTrack — Quarantine Facility Header Navigation
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  Calendar,
  ChevronDown,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { Role } from '../types';

interface NavbarProps {
  onOpenGuide: () => void;
  onNavigateToScreen: (screenId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenGuide, onNavigateToScreen }) => {
  const {
    currentUser,
    currentRole,
    setRole,
    users,
    settings,
    advanceSimulatedDate,
    resetToSeedData,
    metrics,
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const roleColors: Record<Role, string> = {
    nurse: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    doctor: 'bg-blue-50 text-blue-800 border-blue-300',
    admin: 'bg-indigo-50 text-indigo-800 border-indigo-300',
    manager: 'bg-amber-50 text-amber-800 border-amber-300',
    sysadmin: 'bg-slate-100 text-slate-800 border-slate-300',
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onNavigateToScreen('overview')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-600 group-hover:bg-teal-700 transition-colors flex items-center justify-center text-white shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base leading-none">
                  CareTrack
                </span>
                <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 uppercase tracking-wider">
                  Quarantine MVP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal leading-tight mt-0.5 hidden sm:block">
                Virus Quarantine & Treatment Centre · Max Cap: 74
              </p>
            </div>
          </div>
        </div>

        {/* Center: Operational Date Controls */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-500 font-medium">Facility Date:</span>
          <span className="font-mono font-bold text-slate-800 px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-2xs">
            {settings.currentSimulatedDate}
          </span>
          <div className="flex items-center ml-1 border-l border-slate-200 pl-1">
            <button
              onClick={() => advanceSimulatedDate(-1)}
              title="Step backward 1 day"
              className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              onClick={() => advanceSimulatedDate(1)}
              title="Advance forward 1 day (Simulate next shift)"
              className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right Actions: Scenarios, Role Switcher & Reset */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Assessor Guide Button */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors shadow-2xs"
            title="Open Assessor Walkthrough for Scenarios A, B, C, D"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Assessor Demo Scenarios</span>
            <span className="sm:hidden">Demos</span>
          </button>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${roleColors[currentRole]}`}
            >
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <div className="text-left hidden lg:block leading-tight">
                <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                  Active Role
                </span>
                <span className="font-bold">{currentUser.title.split(' ')[0]} ({currentUser.name.split(' ')[0]})</span>
              </div>
              <span className="lg:hidden uppercase font-bold">{currentRole}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
            </button>

            {roleDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setRoleDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Demo Role Switcher
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Switch roles to test role-specific permissions and UI workflows.
                    </p>
                  </div>
                  <div className="p-1 space-y-0.5">
                    {users.map((u) => {
                      const isCurrent = u.role === currentRole;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            setRole(u.role);
                            setRoleDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            isCurrent
                              ? 'bg-teal-50 text-teal-900 font-semibold'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{u.title}</p>
                            <p className="text-[11px] text-slate-500 font-normal">{u.name}</p>
                          </div>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {u.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset to fresh demo dataset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Confirmation Dialog for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Reset Demo Data?</h3>
                <p className="text-xs text-slate-500">
                  This will restore the 22+ active patients, fictional historical logs, and default settings.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetToSeedData();
                  setShowResetConfirm(false);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
