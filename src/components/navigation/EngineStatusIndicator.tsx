import React from 'react';
import type { EngineConnectionState } from '@/types';
import { cn } from '@/utils/cn';

export interface EngineStatusIndicatorProps {
  state: EngineConnectionState;
  showLabel?: boolean;
  compact?: boolean;
  onClick?: () => void;
  className?: string;
}

export const EngineStatusIndicator: React.FC<EngineStatusIndicatorProps> = ({
  state,
  showLabel = true,
  compact = false,
  onClick,
  className,
}) => {
  const getStatusConfig = () => {
    switch (state) {
      case 'CONNECTED':
        return {
          symbol: '●',
          text: 'CONNECTED',
          longText: 'MODEL ENGINE CONNECTED',
          ariaLabel: 'Model Engine is connected and operational',
          badgeClass: 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100',
          dotClass: 'bg-emerald-500 animate-pulse',
        };
      case 'CONNECTING':
        return {
          symbol: '◌',
          text: 'CONNECTING',
          longText: 'MODEL ENGINE CONNECTING...',
          ariaLabel: 'Attempting connection to Model Engine',
          badgeClass: 'bg-amber-50 border-amber-300 text-amber-800',
          dotClass: 'bg-amber-500 animate-ping',
        };
      case 'ERROR':
        return {
          symbol: '▲',
          text: 'ERROR',
          longText: 'MODEL ENGINE ERROR',
          ariaLabel: 'Model Engine encountered a connection error',
          badgeClass: 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100',
          dotClass: 'bg-rose-500',
        };
      case 'OFFLINE':
        return {
          symbol: '○',
          text: 'OFFLINE',
          longText: 'MODEL ENGINE OFFLINE',
          ariaLabel: 'Model Engine is offline or unreachable',
          badgeClass: 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100',
          dotClass: 'bg-slate-400',
        };
      case 'UNKNOWN':
      default:
        return {
          symbol: '?',
          text: 'NOT CONNECTED',
          longText: 'MODEL ENGINE NOT CONNECTED',
          ariaLabel: 'Model Engine connection state is unknown',
          badgeClass: 'bg-slate-50 border-slate-200 text-slate-500',
          dotClass: 'bg-slate-300',
        };
    }
  };

  const config = getStatusConfig();

  const content = (
    <>
      <span
        className={cn('inline-block w-2 h-2 rounded-full shrink-0', config.dotClass)}
        aria-hidden="true"
      />
      <span className="font-mono text-xs font-semibold tracking-wide">
        <span aria-hidden="true" className="mr-1">{config.symbol}</span>
        {compact ? config.text : (showLabel ? config.longText : config.text)}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={config.ariaLabel}
        title={config.ariaLabel}
        className={cn(
          'flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer shadow-xs select-none focus:outline-none focus:ring-2 focus:ring-brand-accent',
          config.badgeClass,
          className
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      role="status"
      aria-label={config.ariaLabel}
      className={cn(
        'inline-flex items-center gap-2 px-2 py-1 rounded-md border text-xs font-mono select-none',
        config.badgeClass,
        className
      )}
    >
      {content}
    </div>
  );
};
