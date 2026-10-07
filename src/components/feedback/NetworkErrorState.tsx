import React from 'react';
import { cn } from '@/utils';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { env } from '@/config/env';

export interface NetworkErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  onRetry?: () => void;
  targetEndpoint?: string;
}

export const NetworkErrorState: React.FC<NetworkErrorStateProps> = ({
  onRetry,
  targetEndpoint = env.modelApiUrl,
  className,
  ...props
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg border border-amber-200 bg-amber-50/70 p-6 text-amber-900 max-w-lg mx-auto my-6',
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-md bg-amber-100 flex items-center justify-center text-amber-800 shrink-0 border border-amber-200">
          <WifiOff className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="text-sm font-semibold text-amber-900 tracking-tight">
            Unable to connect to the AI Model Engine
          </h4>
          <p className="text-xs text-amber-800 leading-relaxed">
            The frontend application could not establish a connection with the backend service.
            The external Model Engine service will be connected in Phase 2.
          </p>
          <div className="rounded bg-white/80 p-2.5 border border-amber-200/80 font-mono text-[11px] text-amber-900 flex flex-col gap-1">
            <span className="text-slate-500 text-[10px] uppercase font-semibold">Configured Endpoint</span>
            <span className="font-semibold text-slate-800">{targetEndpoint}</span>
          </div>
          {onRetry && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                className="border-amber-300 text-amber-900 hover:bg-amber-100"
              >
                Retry Connection
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
