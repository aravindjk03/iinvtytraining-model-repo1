import React from 'react';
import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils';

export interface NavigationItemProps {
  to: string;
  label: string;
  icon: LucideIcon | React.ReactNode;
  stepNumber?: string;
  isCollapsed?: boolean;
  onClick?: () => void;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  to,
  label,
  icon,
  stepNumber,
  isCollapsed = false,
  onClick,
}) => {
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
      const IconComponent = icon as React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
      return <IconComponent className={cn('shrink-0', isCollapsed ? 'w-5 h-5' : 'w-4 h-4')} aria-hidden={true} />;
    }
    return icon as React.ReactNode;
  };

  return (
    <NavLink
      to={to}
      onClick={onClick}
      title={isCollapsed ? (stepNumber ? `${stepNumber} ${label}` : label) : undefined}
      aria-label={stepNumber ? `Stage ${stepNumber}: ${label}` : label}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center rounded-md font-medium text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2',
          isCollapsed ? 'justify-center w-10 h-10 px-0 my-1 mx-auto' : 'w-full px-3 py-2.5 my-0.5 gap-3',
          isActive
            ? 'bg-brand-primary text-white shadow-subtle'
            : 'text-surface-foreground-muted hover:text-surface-foreground hover:bg-surface-muted/80'
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'shrink-0 flex items-center justify-center transition-colors',
              isActive
                ? 'text-white'
                : 'text-surface-foreground-muted group-hover:text-surface-foreground'
            )}
            aria-hidden="true"
          >
            {renderIcon()}
          </span>

          {!isCollapsed && (
            <div className="flex items-center justify-between w-full min-w-0">
              <span className="truncate">{label}</span>
              {stepNumber && (
                <span
                  className={cn(
                    'font-mono text-[10px] tracking-wider px-1.5 py-0.5 rounded shrink-0 transition-colors',
                    isActive
                      ? 'bg-white/20 text-white/90'
                      : 'text-slate-400 group-hover:text-slate-600 bg-surface-muted'
                  )}
                >
                  {stepNumber}
                </span>
              )}
            </div>
          )}

          {isCollapsed && stepNumber && (
            <span
              className={cn(
                'absolute -bottom-1 -right-1 font-mono text-[8px] font-bold px-1 rounded-full border',
                isActive
                  ? 'bg-white text-brand-primary border-brand-primary'
                  : 'bg-surface-muted text-slate-500 border-surface-border'
              )}
            >
              {stepNumber}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};
