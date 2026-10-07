import React from 'react';
import { cn } from '@/utils';
import { Badge } from '@/components/ui/Badge';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  subtitle?: string;
  stepNumber?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  subtitle,
  stepNumber,
  badge,
  actions,
  className,
  ...props
}) => {
  const descText = description || subtitle;

  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-surface-border gap-4',
        className
      )}
      {...props}
    >
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          {stepNumber && (
            <Badge variant="primary" size="sm" className="font-mono">
              STEP {stepNumber}
            </Badge>
          )}
          <h1 className="text-xl md:text-2xl font-bold text-surface-foreground tracking-tight">
            {title}
          </h1>
          {badge}
        </div>
        {descText && (
          <p className="text-sm text-surface-foreground-muted max-w-3xl leading-relaxed">
            {descText}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
};
