/**
 * CareTrack — Screen 1: Login & Demonstration Access
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  UserCheck,
  Stethoscope,
  HeartPulse,
  Building2,
  LineChart,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Role } from '../types';

interface ScreenLoginProps {
  onLoginSuccess: () => void;
  onOpenGuide: () => void;
}

export const ScreenLogin: React.FC<ScreenLoginProps> = ({ onLoginSuccess, onOpenGuide }) => {
  const { currentRole, setRole, users } = useApp();

  const roleIcons: Record<Role, React.ReactNode> = {
    nurse: <HeartPulse className="w-5 h-5 text-emerald-600" />,
    doctor: <Stethoscope className="w-5 h-5 text-blue-600" />,
    admin: <Building2 className="w-5 h-5 text-indigo-600" />,
    manager: <LineChart className="w-5 h-5 text-amber-600" />,
    sysadmin: <Lock className="w-5 h-5 text-slate-700" />,
  };

  const roleDescriptions: Record<Role, string> = {
    nurse: 'Perform daily patient temperature checks, log clinical observations, and prevent duplicate daily records.',
    doctor: 'Review temperature histories, conduct clinical rounds, provide discharge clearances, or invoke emergency overrides.',
    admin: 'Manage patient admissions, room assignments (1–74), and authorize final discharges to release bed capacity.',
    manager: 'Monitor facility-wide operations, occupancy levels, and evaluate mortality against the 15% threshold benchmark.',
    sysadmin: 'Configure clinical parameters (fever threshold), manage system users, and audit all clinical operations.',
  };

  const handleSelectAndLogin = (role: Role) => {
    setRole(role);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200/80 flex flex-col justify-center items-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-6 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-700/20">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CareTrack</h1>
                <p className="text-xs text-slate-500 font-medium">
                  Quarantine Facility Management System · 74-Bed Capacity
                </p>
              </div>
            </div>
            <button
              onClick={onOpenGuide}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Assessor Guide</span>
            </button>
          </div>

          <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs text-slate-600 flex items-start gap-3">
            <UserCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">Technical Product Management Assessment Prototype</p>
              <p className="mt-0.5 text-slate-600 leading-relaxed">
                Demonstration access is enabled with pre-configured staff profiles. Select any role below to explore role-specific permissions, workflows, and clinical business logic.
              </p>
            </div>
          </div>
        </div>

        {/* Role Selector Grid */}
        <div className="p-8 pt-6 space-y-3 bg-slate-50/50">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Select Demonstration Role
          </label>

          <div className="grid grid-cols-1 gap-2.5">
            {users.map((user) => {
              const isSelected = currentRole === user.role;
              return (
                <div
                  key={user.id}
                  onClick={() => setRole(user.role)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? 'bg-white border-teal-600 ring-2 ring-teal-600/10 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-white flex items-center justify-center shrink-0 border border-slate-200/60">
                      {roleIcons[user.role]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{user.title}</h3>
                        <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                          {user.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{user.name}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        {roleDescriptions[user.role]}
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="login-role"
                    checked={isSelected}
                    onChange={() => setRole(user.role)}
                    className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                  />
                </div>
              );
            })}
          </div>

          {/* Action button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              Session state persists in browser localStorage
            </span>
            <button
              onClick={onLoginSuccess}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>Enter Quarantine Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-8 py-3 bg-slate-100/70 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span>CareTrack Protocol Build v1.2</span>
          <span>Hard Capacity: 74 Rooms · Zero Pill Discipline</span>
        </div>
      </div>
    </div>
  );
};
