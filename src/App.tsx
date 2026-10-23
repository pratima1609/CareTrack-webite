/**
 * CareTrack — Quarantine Facility Management System
 * Main Application Shell & View Routing
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import { ScenarioGuideModal } from './components/ScenarioGuideModal';

import { ScreenLogin } from './screens/ScreenLogin';
import { ScreenOverview } from './screens/ScreenOverview';
import { ScreenPatients } from './screens/ScreenPatients';
import { ScreenTemperatureRecording } from './screens/ScreenTemperatureRecording';
import { ScreenTemperatureHistory } from './screens/ScreenTemperatureHistory';
import { ScreenDoctorRounds } from './screens/ScreenDoctorRounds';
import { ScreenDischargeManagement } from './screens/ScreenDischargeManagement';
import { ScreenFacilityPerformance } from './screens/ScreenFacilityPerformance';
import { ScreenAuditLog } from './screens/ScreenAuditLog';
import { ScreenSettings } from './screens/ScreenSettings';

import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Thermometer,
  Stethoscope,
  LogOut,
  BarChart3,
  ClipboardList,
  Sliders,
  Sparkles,
} from 'lucide-react';

function CareTrackApp() {
  const [currentScreen, setCurrentScreen] = useState<string>('overview');
  const [preselectedPatientId, setPreselectedPatientId] = useState<string | undefined>(undefined);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateTo = (screenId: string, patientId?: string) => {
    setPreselectedPatientId(patientId);
    setCurrentScreen(screenId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user is on the login screen
  if (currentScreen === 'login') {
    return (
      <>
        <ScreenLogin
          onLoginSuccess={() => setCurrentScreen('overview')}
          onOpenGuide={() => setIsGuideOpen(true)}
        />
        <ScenarioGuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
          onNavigateToScreen={navigateTo}
        />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar onOpenGuide={() => setIsGuideOpen(true)} onNavigateToScreen={navigateTo} />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <Sidebar currentScreen={currentScreen} onSelectScreen={navigateTo} />
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-64 bg-slate-900 text-slate-200 flex flex-col h-full z-10">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <span className="font-bold text-sm text-white">CareTrack Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar currentScreen={currentScreen} onSelectScreen={navigateTo} />
            </div>
          </div>
        )}

        {/* Screen Content Body */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-6">
          {/* Mobile Bottom Quick Bar */}
          <div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 p-1.5 rounded-lg border border-slate-200 bg-slate-50"
            >
              <Menu className="w-4 h-4" />
              <span>Menu</span>
            </button>
            <span className="text-xs font-bold text-slate-900 capitalize">
              {currentScreen.replace('_', ' ')}
            </span>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="p-1.5 rounded-lg text-teal-700 bg-teal-50 border border-teal-200 text-xs font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demos</span>
            </button>
          </div>

          {/* Active Screen View */}
          {currentScreen === 'overview' && (
            <ScreenOverview onNavigate={navigateTo} onOpenGuide={() => setIsGuideOpen(true)} />
          )}

          {currentScreen === 'patients' && <ScreenPatients onNavigate={navigateTo} />}

          {currentScreen === 'temperatures' && (
            <ScreenTemperatureRecording
              preselectedPatientId={preselectedPatientId}
              onNavigate={navigateTo}
            />
          )}

          {currentScreen === 'history' && (
            <ScreenTemperatureHistory
              preselectedPatientId={preselectedPatientId}
              onNavigate={navigateTo}
            />
          )}

          {currentScreen === 'doctor_rounds' && (
            <ScreenDoctorRounds
              preselectedPatientId={preselectedPatientId}
              onNavigate={navigateTo}
            />
          )}

          {currentScreen === 'discharge' && (
            <ScreenDischargeManagement
              preselectedPatientId={preselectedPatientId}
              onNavigate={navigateTo}
            />
          )}

          {currentScreen === 'performance' && (
            <ScreenFacilityPerformance
              onNavigate={navigateTo}
              onOpenGuide={() => setIsGuideOpen(true)}
            />
          )}

          {currentScreen === 'audit' && <ScreenAuditLog />}

          {currentScreen === 'settings' && (
            <ScreenSettings onOpenGuide={() => setIsGuideOpen(true)} />
          )}
        </main>
      </div>

      {/* Global Assessor Scenario Modal */}
      <ScenarioGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onNavigateToScreen={navigateTo}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <CareTrackApp />
    </AppProvider>
  );
}
