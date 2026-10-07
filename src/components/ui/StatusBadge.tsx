import React from 'react';
import { cn } from '@/utils';
import type { ModuleState } from '@/types';

export type StatusType =
  | ModuleState
  | 'not_created'
  | 'not_trained'
  | 'ready'
  | 'idle'
  | 'healthy'
  | 'offline'
  | 'failed';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType | string;
  label?: string;
  showDot?: boolean;
  pulse?: boolean;
}

const statusConfig: Record<
  string,
  { label: string; dotClass: string; badgeClass: string }
> = {
  not_started: {
    label: 'Not started',
    dotClass: 'bg-slate-400',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  not_created: {
    label: 'Not created',
    dotClass: 'bg-slate-400',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  not_trained: {
    label: 'Not trained',
    dotClass: 'bg-slate-400',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  ready: {
    label: 'READY',
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  healthy: {
    label: 'Healthy',
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  in_progress: {
    label: 'In progress',
    dotClass: 'bg-amber-500 animate-pulse',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  completed: {
    label: 'Completed',
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  blocked: {
    label: 'Blocked',
    dotClass: 'bg-rose-500',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
  },
  idle: {
    label: 'Idle',
    dotClass: 'bg-slate-400',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  offline: {
    label: 'Offline',
    dotClass: 'bg-slate-400',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  failed: {
    label: 'Failed',
    dotClass: 'bg-rose-500',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  showDot = true,
  pulse = false,
  className,
  ...props
}) => {
  const normalizedKey = status.toLowerCase().replace(/[-\s]/g, '_');
  const config = statusConfig[normalizedKey] || {
    label: label || status,
    dotClass: 'bg-slate-400',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const displayLabel = label || config.label;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium border select-none',
        config.badgeClass,
        className
      )}
      {...props}
    >
      {showDot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            config.dotClass,
            pulse && 'animate-pulse'
          )}
          aria-hidden="true"
        />
      )}
      <span>{displayLabel}</span>
    </span>
  );
};
