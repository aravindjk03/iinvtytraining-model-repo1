import React from 'react';
import { cn } from '@/utils';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  code?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Platform Operation Encountered an Error',
  message = 'An unexpected condition prevented the request from completing. The system state remains safe.',
  code,
  onRetry,
  retryLabel = 'Try Again',
  className,
  ...props
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg border border-semantic-danger-border bg-semantic-danger-bg p-6 text-semantic-danger-text max-w-xl mx-auto my-6',
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-4">
        <div className="w-9 h-9 rounded-md bg-red-100 flex items-center justify-center text-semantic-danger shrink-0 border border-semantic-danger-border">
          <AlertCircle className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="flex-1 space-y-1.5">
          <h4 className="text-sm font-semibold text-semantic-danger-text tracking-tight">
            {title}
          </h4>
          <p className="text-xs text-red-700 leading-relaxed">
            {message}
          </p>
          {code && (
            <p className="font-mono text-[11px] text-red-600 bg-red-100/60 inline-block px-1.5 py-0.5 rounded border border-red-200">
              Code: {code}
            </p>
          )}
          {onRetry && (
            <div className="pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                className="border-red-300 text-red-800 hover:bg-red-100"
              >
                {retryLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
