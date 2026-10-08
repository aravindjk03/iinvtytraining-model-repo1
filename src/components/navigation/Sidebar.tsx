import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Workflow,
  FolderKanban,
  Cpu,
  CheckCircle2,
  ShieldAlert,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { NavigationItem } from './NavigationItem';
import { ProjectStatusPanel } from './ProjectStatusPanel';
import { APP_CONFIG } from '@/config/constants';
import { useJourney, useProject } from '@/context/ProjectContext';
import { useModelEngineHealth } from '@/hooks/useModelEngineHealth';
import type { LucideIcon } from 'lucide-react';
import type { JourneyStepId, JourneyStepStatus } from '@/types';

export interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

const stepIcons: Record<JourneyStepId, LucideIcon> = {
  BUILD: Workflow,
  TEACH: FolderKanban,
  TRAIN: Cpu,
  TEST: CheckCircle2,
  CHALLENGE: ShieldAlert,
  IMPROVE: RefreshCw,
};

const routeToStepMap: Record<string, JourneyStepId> = {
  '/build': 'BUILD',
  '/teach': 'TEACH',
  '/train': 'TRAIN',
  '/test': 'TEST',
  '/challenge': 'CHALLENGE',
  '/improve': 'IMPROVE',
};

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  isMobileOpen,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const location = useLocation();
  const { engineState } = useModelEngineHealth();
  const { project } = useProject();
  const { journeySteps, sidebarStatus, currentStep, setCurrentStep } = useJourney();

  const currentRouteStep = routeToStepMap[location.pathname];

  React.useEffect(() => {
    if (currentRouteStep && currentRouteStep !== currentStep) {
      setCurrentStep(currentRouteStep);
    }
  }, [currentRouteStep, currentStep, setCurrentStep]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        onCloseMobile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  // Merge live engine state into sidebar status
  const liveSidebarStatus = {
    ...sidebarStatus,
    projectName: project?.name || sidebarStatus.projectName,
    engineStatus: engineState,
  };

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
        aria-label="Primary Navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-surface-border transition-all duration-200 ease-in-out',
          'lg:static lg:z-auto',
          isCollapsed ? 'w-16' : 'w-64',
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-surface-border flex items-center justify-between shrink-0">
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
                  SAFETY BUILDER
                </span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-md text-surface-foreground-subtle hover:text-surface-foreground hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-brand-accent"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Learning Journey Section Header */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="px-4 pt-3 pb-1 shrink-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-surface-foreground-subtle">
              PARTICIPANT JOURNEY
            </span>
          </div>
        )}

        {/* Navigation List: 6 Journey Stages */}
        <nav
          role="navigation"
          aria-label="Journey Stages"
          className="flex-1 px-3 py-1 space-y-1 overflow-y-auto"
        >
          {journeySteps.map((step) => {
            const Icon = stepIcons[step.id] || Workflow;
            // Mark step as CURRENT if route matches; if route is on a different step, completed steps remain COMPLETED
            let computedStatus: JourneyStepStatus = step.status;
            if (currentRouteStep === step.id) {
              computedStatus = 'CURRENT';
            } else if (currentRouteStep && computedStatus === 'CURRENT') {
              computedStatus = step.isCompleted ? 'COMPLETED' : 'AVAILABLE';
            }

            return (
              <NavigationItem
                key={step.id}
                to={step.route}
                label={step.title}
                icon={Icon}
                stepNumber={step.stepNumber}
                stepStatus={computedStatus}
                prerequisiteReason={step.prerequisiteDescription}
                isCollapsed={isCollapsed && !isMobileOpen}
                onClick={onCloseMobile}
              />
            );
          })}
        </nav>

        {/* Lower Section: Project Status Panel */}
        <ProjectStatusPanel
          status={liveSidebarStatus}
          isCollapsed={isCollapsed && !isMobileOpen}
          className="shrink-0"
        />

        {/* Footer Collapse Toggle */}
        <div className="p-2 border-t border-surface-border bg-surface-subtle shrink-0">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="flex items-center justify-between px-2 text-xs text-surface-foreground-subtle">
              <span className="font-mono text-[10px]">Phase 1 Foundation</span>
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex items-center justify-center p-1 rounded hover:bg-surface-muted text-surface-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand-accent"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex items-center justify-center p-1.5 rounded hover:bg-surface-muted text-surface-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand-accent"
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
