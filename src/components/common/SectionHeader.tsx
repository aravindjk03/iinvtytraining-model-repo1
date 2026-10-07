import React from 'react';
import { cn } from '@/utils';

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  action,
  className,
  ...props
}) => {
  return (
    <div
      className={cn('flex items-center justify-between gap-4 mb-4', className)}
      {...props}
    >
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold tracking-wider text-surface-foreground uppercase">
            {title}
          </h2>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs text-surface-foreground-muted">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
