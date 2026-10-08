import React from 'react';
import { NavLink } from 'react-router-dom';
import { Lock, Check, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils';
import type { JourneyStepStatus } from '@/types';

export interface NavigationItemProps {
  to: string;
  label: string;
  icon: LucideIcon | React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }> | React.ReactNode;
  stepNumber?: string;
  isCollapsed?: boolean;
  stepStatus?: JourneyStepStatus;
  prerequisiteReason?: string;
  onClick?: () => void;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  to,
  label,
  icon,
  stepNumber,
  isCollapsed = false,
  stepStatus = 'AVAILABLE',
  prerequisiteReason,
  onClick,
}) => {
  const isLocked = stepStatus === 'LOCKED';
  const isCompleted = stepStatus === 'COMPLETED';

  const renderIcon = () => {
    if (isLocked) {
      return <Lock className={cn('shrink-0', isCollapsed ? 'w-4 h-4' : 'w-4 h-4 text-slate-400')} aria-hidden="true" />;
    }
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
      const IconComponent = icon as React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
      return (
        <IconComponent
          className={cn('shrink-0', isCollapsed ? 'w-5 h-5' : 'w-4 h-4')}
          aria-hidden={true}
        />
      );
    }
    return icon as React.ReactNode;
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isLocked) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick();
    }
  };

  const titleText = isLocked
    ? `Stage ${stepNumber || ''} ${label} (Locked: ${prerequisiteReason || 'Prerequisite required'})`
    : isCompleted
    ? `Stage ${stepNumber || ''} ${label} (Completed - Click to return)`
    : stepNumber
    ? `Stage ${stepNumber}: ${label}`
    : label;

  return (
    <NavLink
      to={to}
      onClick={handleClick}
      aria-disabled={isLocked ? 'true' : undefined}
      tabIndex={isLocked ? -1 : 0}
      title={titleText}
      aria-label={titleText}
      className={({ isActive }) => {
        const isCurrent = isActive || stepStatus === 'CURRENT';
        return cn(
          'group relative flex items-center rounded-md font-medium text-sm transition-all outline-none',
          isCollapsed ? 'justify-center w-10 h-10 px-0 my-1 mx-auto' : 'w-full px-3 py-2.5 my-0.5 gap-3',
          isLocked
            ? 'opacity-60 cursor-not-allowed bg-transparent text-slate-400 select-none'
            : isCurrent
            ? 'bg-brand-primary text-white shadow-subtle focus-visible:ring-2 focus-visible:ring-brand-accent'
            : 'text-surface-foreground-muted hover:text-surface-foreground hover:bg-surface-muted/80 focus-visible:ring-2 focus-visible:ring-brand-accent'
        );
      }}
    >
      {({ isActive }) => {
        const isCurrent = isActive || stepStatus === 'CURRENT';
        return (
          <>
            <span
              className={cn(
                'shrink-0 flex items-center justify-center transition-colors',
                isCurrent && !isLocked
                  ? 'text-white'
                  : isLocked
                  ? 'text-slate-400'
                  : 'text-surface-foreground-muted group-hover:text-surface-foreground'
              )}
              aria-hidden="true"
            >
              {renderIcon()}
            </span>

            {!isCollapsed && (
              <div className="flex items-center justify-between w-full min-w-0">
                <span className={cn('truncate', isLocked && 'line-through decoration-slate-300 text-slate-400')}>
                  {label}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isCompleted && (
                    <span
                      title="Completed stage — accessible"
                      aria-label="Completed stage"
                      className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold"
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}

                  {isLocked && (
                    <span
                      title="Stage locked"
                      aria-label="Locked stage"
                      className="inline-flex items-center justify-center text-[10px] text-slate-400 font-mono"
                    >
                      <Lock className="w-3 h-3" />
                    </span>
                  )}

                  {stepNumber && (
                    <span
                      className={cn(
                        'font-mono text-[10px] tracking-wider px-1.5 py-0.5 rounded transition-colors',
                        isCurrent && !isLocked
                          ? 'bg-white/20 text-white/90'
                          : 'text-slate-400 group-hover:text-slate-600 bg-surface-muted'
                      )}
                    >
                      {stepNumber}
                    </span>
                  )}
                </div>
              </div>
            )}

            {isCollapsed && stepNumber && (
              <span
                className={cn(
                  'absolute -bottom-1 -right-1 font-mono text-[8px] font-bold px-1 rounded-full border',
                  isCurrent && !isLocked
                    ? 'bg-white text-brand-primary border-brand-primary'
                    : isCompleted
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : isLocked
                    ? 'bg-slate-200 text-slate-500 border-slate-300'
                    : 'bg-surface-muted text-slate-500 border-surface-border'
                )}
              >
                {isCompleted ? '✓' : stepNumber}
              </span>
            )}
          </>
        );
      }}
    </NavLink>
  );
};
