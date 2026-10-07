import React from 'react';
import { cn } from '@/utils';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  subMessage?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading platform resource...',
  subMessage,
  size = 'md',
  className,
  ...props
}) => {
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-surface-border bg-white',
        className
      )}
      {...props}
    >
      <Loader2
        className={cn('text-brand-primary animate-spin mb-3', iconSizes[size])}
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-surface-foreground tracking-tight">
        {message}
      </p>
      {subMessage && (
        <p className="text-xs text-surface-foreground-muted mt-1 max-w-sm">
          {subMessage}
        </p>
      )}
      <span className="sr-only">Loading</span>
    </div>
  );
};
