/**
 * CareTrack — Screen 5: Patient Temperature History & Visual Trend Chart
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  LineChart as LineChartIcon,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Thermometer,
  Clock,
  User,
  Plus,
} from 'lucide-react';
import { calculateDischargeEligibility } from '../utils/businessLogic';

interface ScreenTemperatureHistoryProps {
  preselectedPatientId?: string;
  onNavigate: (screenId: string, patientId?: string) => void;
}

export const ScreenTemperatureHistory: React.FC<ScreenTemperatureHistoryProps> = ({
  preselectedPatientId,
  onNavigate,
}) => {
  const { patients, temperatureReadings, settings } = useApp();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    preselectedPatientId || patients[0]?.id || ''
  );

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) || patients[0],
    [patients, selectedPatientId]
  );

  // Chronologically sorted readings for this patient (oldest first for chart)
  const patientReadingsChronological = useMemo(() => {
    if (!selectedPatient) return [];
    return temperatureReadings
      .filter((r) => r.patientId === selectedPatient.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [selectedPatient, temperatureReadings]);

  // Reverse sorted for table (newest first)
  const patientReadingsNewest = useMemo(() => {
    return [...patientReadingsChronological].reverse();
  }, [patientReadingsChronological]);

  const eligibility = useMemo(() => {
    if (!selectedPatient) return null;
    return calculateDischargeEligibility(
      selectedPatient,
      temperatureReadings,
      settings.currentSimulatedDate,
      settings.feverThreshold
    );
  }, [selectedPatient, temperatureReadings, settings]);

  // Chart coordinates calculation (pure responsive SVG)
  const chartHeight = 220;
  const chartWidth = 600;
  const paddingX = 45;
  const paddingY = 30;

  const minY = 35.5;
  const maxY = 40.0;

  const getYCoord = (temp: number) => {
    const clamped = Math.max(minY, Math.min(maxY, temp));
    const ratio = (clamped - minY) / (maxY - minY);
    return chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
  };

  const feverThresholdY = getYCoord(settings.feverThreshold);

  // Generate SVG path points
  const points = useMemo(() => {
    if (patientReadingsChronological.length === 0) return [];
    const count = patientReadingsChronological.length;
    const stepX = count > 1 ? (chartWidth - paddingX * 2) / (count - 1) : 0;

    return patientReadingsChronological.map((r, i) => {
      const x = count === 1 ? chartWidth / 2 : paddingX + i * stepX;
      const y = getYCoord(r.temperature);
      return { x, y, reading: r };
    });
  }, [patientReadingsChronological, settings.feverThreshold]);

  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [points]);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
            Patient Temperature History & Clinical Trends
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking afebrile progression against the {settings.feverThreshold}°C threshold
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600 hidden sm:block">
            Select Patient:
          </label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                Room {p.roomNumber} — {p.name} ({p.status})
              </option>
            ))}
          </select>
          {selectedPatient?.status === 'active' && (
            <button
              onClick={() => onNavigate('temperatures', selectedPatient.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Reading</span>
            </button>
          )}
        </div>
      </div>

      {selectedPatient && (
        <>
          {/* Patient Clinical Summary Banner */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm border border-teal-200">
                Rm {selectedPatient.roomNumber}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">{selectedPatient.name}</h2>
                  <span className="font-mono text-[10px] text-slate-400">{selectedPatient.id}</span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {selectedPatient.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {selectedPatient.age} yrs · {selectedPatient.gender} · Admitted: {selectedPatient.admissionDate}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 text-xs">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Consecutive Fever-Free
                </span>
                <span className="font-mono font-bold text-sm text-teal-700">
                  {eligibility?.consecutiveFeverFreeDays || 0} / 3 days
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Last Documented Fever
                </span>
                <span className="font-mono font-bold text-sm text-slate-800">
                  {eligibility?.lastFeverDate || 'None recorded'}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Discharge Status
                </span>
                <span
                  className={`font-semibold text-xs ${
                    eligibility?.isEligible ? 'text-teal-700 font-bold' : 'text-slate-600'
                  }`}
                >
                  {eligibility?.isEligible ? 'Eligible' : 'Ineligible'}
                </span>
              </div>
            </div>
          </div>

          {/* Temperature Trend SVG Chart */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <LineChartIcon className="w-4 h-4 text-teal-600" />
                  Thermal Trajectory Chart
                </h3>
                <p className="text-[11px] text-slate-500">
                  Daily recorded Celsius values with clinical fever ceiling at {settings.feverThreshold}°C
                </p>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                  <span className="text-slate-600">Afebrile (&lt;{settings.feverThreshold}°C)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span className="text-slate-600">Fever (&ge;{settings.feverThreshold}°C)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-0 border-t-2 border-dashed border-rose-400" />
                  <span className="text-rose-600 font-medium">Threshold</span>
                </div>
              </div>
            </div>

            {patientReadingsChronological.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 bg-slate-50/50 rounded-lg">
                No official temperature readings recorded yet for this patient.
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-56 select-none"
                >
                  {/* Grid Lines */}
                  {[36.0, 37.0, 38.0, 39.0].map((gridTemp) => {
                    const y = getYCoord(gridTemp);
                    return (
                      <g key={gridTemp}>
                        <line
                          x1={paddingX}
                          y1={y}
                          x2={chartWidth - paddingX}
                          y2={y}
                          stroke="#e2e8f0"
                          strokeWidth="1"
                        />
                        <text
                          x={paddingX - 8}
                          y={y + 3}
                          fontSize="9"
                          fill="#94a3b8"
                          textAnchor="end"
                          fontFamily="monospace"
                        >
                          {gridTemp.toFixed(1)}°
                        </text>
                      </g>
                    );
                  })}

                  {/* Configurable Fever Threshold Line */}
                  <line
                    x1={paddingX}
                    y1={feverThresholdY}
                    x2={chartWidth - paddingX}
                    y2={feverThresholdY}
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <text
                    x={chartWidth - paddingX + 5}
                    y={feverThresholdY + 3}
                    fontSize="9"
                    fontWeight="bold"
                    fill="#e11d48"
                    fontFamily="monospace"
                  >
                    {settings.feverThreshold}°C
                  </text>

                  {/* Trend line */}
                  {points.length > 1 && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#0d9488"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Data Point Dots */}
                  {points.map((pt, i) => {
                    const isFever = pt.reading.isFever;
                    return (
                      <g key={i}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="5"
                          fill={isFever ? '#e11d48' : '#0d9488'}
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="hover:r-7 transition-all cursor-pointer"
                        />
                        {/* Temperature Label */}
                        <text
                          x={pt.x}
                          y={pt.y - 9}
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                          fill={isFever ? '#be123c' : '#0f766e'}
                          fontFamily="monospace"
                        >
                          {pt.reading.temperature.toFixed(1)}°C
                        </text>
                        {/* Date Label on bottom */}
                        <text
                          x={pt.x}
                          y={chartHeight - 8}
                          fontSize="9"
                          textAnchor="middle"
                          fill="#64748b"
                          fontFamily="monospace"
                        >
                          {pt.reading.date.substring(5)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </div>

          {/* Historical Log Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Detailed Measurement Log ({patientReadingsNewest.length} Entries)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Reading (°C)</th>
                    <th className="py-2.5 px-3">Clinical Status</th>
                    <th className="py-2.5 px-4">Staff Observations</th>
                    <th className="py-2.5 px-4">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patientReadingsNewest.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No recorded measurements on file.
                      </td>
                    </tr>
                  ) : (
                    patientReadingsNewest.map((reading) => (
                      <tr key={reading.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-800">
                          {reading.date}
                          {reading.date === settings.currentSimulatedDate && (
                            <span className="ml-1.5 text-[9px] bg-teal-50 text-teal-800 border border-teal-200 px-1 py-0.2 rounded font-sans font-bold">
                              TODAY
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500">
                          {reading.timestamp.split('T')[1]?.substring(0, 5) || '08:30'}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-mono font-bold text-sm ${
                              reading.isFever ? 'text-rose-600' : 'text-slate-900'
                            }`}
                          >
                            {reading.temperature.toFixed(1)}°C
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {reading.isFever ? (
                            <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[10px]">
                              <AlertTriangle className="w-3 h-3" /> Fever (&ge;{settings.feverThreshold}°)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                              <CheckCircle2 className="w-3 h-3" /> Normal
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                          {reading.observations || <span className="text-slate-300 italic">None</span>}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <span className="font-medium">{reading.recordedBy}</span>
                          <span className="block text-[10px] text-slate-400 uppercase">
                            {reading.recordedByRole}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
