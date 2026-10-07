import React from 'react';
import { cn } from '@/utils';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0 to 100
  max?: number;
  indeterminate?: boolean;
  label?: string;
  showValueLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  max = 100,
  indeterminate = false,
  label,
  showValueLabel = false,
  className,
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full space-y-1', className)} {...props}>
      {(label || showValueLabel) && (
        <div className="flex justify-between items-center text-xs text-surface-foreground-muted font-medium">
          {label && <span>{label}</span>}
          {showValueLabel && !indeterminate && (
            <span className="font-mono">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
        className="w-full h-1.5 bg-surface-muted rounded-full overflow-hidden border border-surface-border"
      >
        {indeterminate ? (
          <div className="h-full bg-brand-primary w-1/3 animate-indeterminate rounded-full" />
        ) : (
          <div
            className="h-full bg-brand-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
};
