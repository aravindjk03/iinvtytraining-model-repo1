import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface WorkshopDisclaimerProps {
  className?: string;
}

export const WorkshopDisclaimer: React.FC<WorkshopDisclaimerProps> = ({ className = '' }) => {
  return (
    <footer
      role="contentinfo"
      aria-label="Workshop educational safety disclaimer"
      className={`w-full py-2 px-4 bg-slate-900 border-t border-slate-800 text-slate-400 text-center text-xs flex items-center justify-center gap-2 select-none shrink-0 ${className}`}
    >
      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
      <span className="font-mono text-[11px] tracking-wide text-slate-300">
        Workshop model only — not for production safety control
      </span>
    </footer>
  );
};
