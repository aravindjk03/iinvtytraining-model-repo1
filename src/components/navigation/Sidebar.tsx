import React from 'react';
import {
  LayoutDashboard,
  Workflow,
  FolderKanban,
  Cpu,
  CheckCircle2,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { NavigationItem } from './NavigationItem';
import { APP_CONFIG } from '@/config/constants';

export interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  isMobileOpen,
  onToggleCollapse,
  onCloseMobile,
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        onCloseMobile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/build',
      label: 'Build',
      stepNumber: '01',
      icon: Workflow,
    },
    {
      to: '/teach',
      label: 'Teach',
      stepNumber: '02',
      icon: FolderKanban,
    },
    {
      to: '/train',
      label: 'Train',
      stepNumber: '03',
      icon: Cpu,
    },
    {
      to: '/test',
      label: 'Test',
      stepNumber: '04',
      icon: CheckCircle2,
    },
    {
      to: '/challenge',
      label: 'Challenge',
      stepNumber: '05',
      icon: ShieldAlert,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-surface-border transition-all duration-200 ease-in-out',
          'lg:static lg:z-auto',
          isCollapsed ? 'w-16' : 'w-64',
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Primary Navigation"
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-md bg-brand-primary flex items-center justify-center text-white shrink-0 shadow-subtle">
              <ShieldCheck className="w-5 h-5" />
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold tracking-tight text-surface-foreground uppercase font-sans truncate">
                  {APP_CONFIG.name}
                </span>
                <span className="text-[10px] text-surface-foreground-subtle tracking-wide uppercase font-mono">
                  TRAINING PLATFORM
                </span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-md text-surface-foreground-subtle hover:text-surface-foreground hover:bg-surface-muted"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Learning Journey Section Header */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="px-4 pt-4 pb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-surface-foreground-subtle">
              LEARNING PIPELINE
            </span>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavigationItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              stepNumber={item.stepNumber}
              isCollapsed={isCollapsed && !isMobileOpen}
              onClick={onCloseMobile}
            />
          ))}
        </nav>

        {/* Footer / Workflow Philosophy Indicator */}
        <div className="p-3 border-t border-surface-border bg-surface-subtle">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="space-y-3">
              <div className="px-2 py-1.5 rounded bg-surface-muted border border-surface-border">
                <span className="block text-[9px] font-mono text-surface-foreground-subtle uppercase tracking-wider">
                  Industrial Methodology
                </span>
                <span className="block text-[10px] font-mono font-medium text-brand-primary mt-0.5 truncate">
                  BUILD → TEACH → TRAIN
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-surface-foreground-subtle px-1">
                <span className="font-mono text-[10px]">Phase 1 Foundation</span>
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="hidden lg:flex items-center justify-center p-1 rounded hover:bg-surface-muted text-surface-foreground-muted"
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex items-center justify-center p-1.5 rounded hover:bg-surface-muted text-surface-foreground-muted"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
