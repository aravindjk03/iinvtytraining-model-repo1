import React from 'react';
import { cn } from '@/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'neutral'
    | 'primary'
    | 'accent'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-surface-muted text-surface-foreground-muted border-surface-border',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-brand-primary-light text-brand-primary border-brand-primary/20',
    accent: 'bg-brand-accent-light text-brand-primary border-brand-accent/30',
    success: 'bg-semantic-success-bg text-semantic-success-text border-semantic-success-border',
    warning: 'bg-semantic-warning-bg text-semantic-warning-text border-semantic-warning-border',
    danger: 'bg-semantic-danger-bg text-semantic-danger-text border-semantic-danger-border',
    info: 'bg-semantic-info-bg text-semantic-info-text border-semantic-info-border',
  };

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 tracking-wide uppercase font-semibold',
    md: 'text-xs px-2.5 py-0.5 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded border font-mono select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
