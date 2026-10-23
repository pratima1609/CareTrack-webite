/**
 * CareTrack — Sidebar Navigation
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Thermometer,
  LineChart,
  Stethoscope,
  LogOut,
  BarChart3,
  ClipboardList,
  Sliders,
  Bed,
} from 'lucide-react';

interface SidebarProps {
  currentScreen: string;
  onSelectScreen: (screenId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onSelectScreen }) => {
  const { metrics, currentRole } = useApp();

  const navItems = [
    {
      id: 'overview',
      label: 'Overview Dashboard',
      icon: LayoutDashboard,
      badge: null,
      roles: ['nurse', 'doctor', 'admin', 'manager', 'sysadmin'],
    },
    {
      id: 'patients',
      label: 'Patient Management',
      icon: Users,
      badge: `${metrics.activePatients} Active`,
      badgeStyle: 'bg-slate-100 text-slate-700',
      roles: ['nurse', 'doctor', 'admin', 'manager', 'sysadmin'],
    },
    {
      id: 'temperatures',
      label: 'Temperature Recording',
      icon: Thermometer,
      badge: metrics.todayTempsPending > 0 ? `${metrics.todayTempsPending} Pending` : 'All Done',
      badgeStyle:
        metrics.todayTempsPending > 0
          ? 'bg-amber-100 text-amber-800 font-semibold'
          : 'bg-emerald-100 text-emerald-800',
      roles: ['nurse', 'doctor', 'manager', 'sysadmin'],
    },
    {
      id: 'history',
      label: 'Temperature History',
      icon: LineChart,
      badge: null,
      roles: ['nurse', 'doctor', 'admin', 'manager', 'sysadmin'],
    },
    {
      id: 'doctor_rounds',
      label: 'Doctor Rounds',
      icon: Stethoscope,
      badge:
        metrics.todayDoctorVisitsPending > 0
          ? `${metrics.todayDoctorVisitsPending} Pending`
          : 'Complete',
      badgeStyle:
        metrics.todayDoctorVisitsPending > 0
          ? 'bg-blue-100 text-blue-800 font-semibold'
          : 'bg-emerald-100 text-emerald-800',
      roles: ['doctor', 'nurse', 'manager', 'sysadmin'],
    },
    {
      id: 'discharge',
      label: 'Discharge Management',
      icon: LogOut,
      badge: metrics.dischargeEligibleCount > 0 ? `${metrics.dischargeEligibleCount} Eligible` : null,
      badgeStyle: 'bg-teal-100 text-teal-800 font-bold animate-pulse',
      roles: ['admin', 'doctor', 'manager', 'sysadmin'],
    },
    {
      id: 'performance',
      label: 'Facility Performance',
      icon: BarChart3,
      badge: metrics.isMortalityExceeded ? 'Mortality Alert' : null,
      badgeStyle: 'bg-rose-100 text-rose-800 font-semibold',
      roles: ['manager', 'admin', 'sysadmin', 'doctor', 'nurse'],
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: ClipboardList,
      badge: null,
      roles: ['sysadmin', 'manager', 'admin', 'doctor', 'nurse'],
    },
    {
      id: 'settings',
      label: 'Clinical Protocols',
      icon: Sliders,
      badge: null,
      roles: ['sysadmin', 'manager', 'admin'],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Clinical Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          const isRolePermitted = item.roles.includes(currentRole);

          return (
            <button
              key={item.id}
              onClick={() => onSelectScreen(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-teal-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${
                    isActive ? 'bg-white/20 text-white' : item.badgeStyle
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Capacity & Facility Gauge */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Bed className="w-3.5 h-3.5 text-teal-400" />
              Facility Occupancy
            </span>
            <span className="font-mono font-bold text-white">
              {metrics.occupiedRooms} / {metrics.totalCapacity}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                metrics.occupancyRate > 90
                  ? 'bg-rose-500'
                  : metrics.occupancyRate > 75
                  ? 'bg-amber-500'
                  : 'bg-teal-500'
              }`}
              style={{ width: `${Math.min(100, metrics.occupancyRate)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>{metrics.availableRooms} rooms free</span>
            <span className="font-medium text-slate-300">{metrics.occupancyRate}% full</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
