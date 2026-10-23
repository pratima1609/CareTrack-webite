/**
 * CareTrack — Toast Notifications Component
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
          info: <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />,
        };

        const borders = {
          success: 'border-emerald-200 bg-emerald-50/95 text-emerald-950',
          warning: 'border-amber-200 bg-amber-50/95 text-amber-950',
          error: 'border-rose-200 bg-rose-50/95 text-rose-950',
          info: 'border-sky-200 bg-sky-50/95 text-sky-950',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-lg border shadow-lg backdrop-blur-xs flex items-start gap-3 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${borders[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 text-xs">
              <p className="font-semibold text-sm leading-tight text-slate-900 mb-0.5">{toast.title}</p>
              <p className="text-slate-700 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
