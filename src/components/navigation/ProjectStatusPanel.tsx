import React from 'react';
import type { ProjectSidebarStatus } from '@/types';
import { cn } from '@/utils/cn';

export interface ProjectStatusPanelProps {
  status: ProjectSidebarStatus;
  isCollapsed?: boolean;
  className?: string;
}

export const ProjectStatusPanel: React.FC<ProjectStatusPanelProps> = ({
  status,
  isCollapsed = false,
  className,
}) => {
  if (isCollapsed) {
    return (
      <div
        className={cn('p-2 text-center border-t border-surface-border bg-surface-subtle', className)}
        title={`Project: ${status.projectName}\nWorkflow: ${status.workflowStatus}\nModel: ${status.modelStatus}\nEngine: ${status.engineStatus}`}
        aria-label="Project Status Summary"
      >
        <div className="flex flex-col items-center gap-1.5 py-1">
          <span
            className={cn(
              'w-2.5 h-2.5 rounded-full',
              status.engineStatus === 'CONNECTED'
                ? 'bg-emerald-500'
                : status.engineStatus === 'CONNECTING'
                ? 'bg-amber-500 animate-ping'
                : 'bg-slate-400'
            )}
            title={`Engine: ${status.engineStatus}`}
          />
          <span
            className={cn(
              'w-2.5 h-2.5 rounded-full',
              status.modelStatus === 'READY'
                ? 'bg-emerald-500'
                : status.modelStatus === 'TRAINING'
                ? 'bg-amber-500 animate-pulse'
                : 'bg-slate-300'
            )}
            title={`Model: ${status.modelStatus}`}
          />
        </div>
      </div>
    );
  }

  const renderWorkflowStatus = () => {
    switch (status.workflowStatus) {
      case 'VALID':
        return <span className="font-semibold text-emerald-600">✓ Valid</span>;
      case 'INVALID':
        return <span className="font-semibold text-rose-600">✗ Invalid</span>;
      case 'IN_PROGRESS':
        return <span className="font-semibold text-amber-600">In progress</span>;
      case 'NOT_STARTED':
      default:
        return <span className="text-slate-500">Not started</span>;
    }
  };

  const renderDatasetStatus = () => {
    switch (status.datasetStatus) {
      case 'READY':
        return <span className="font-semibold text-emerald-600">Ready</span>;
      case 'INVALID':
        return <span className="font-semibold text-rose-600">Needs attention</span>;
      case 'IN_PROGRESS':
        return <span className="font-semibold text-amber-600">In progress</span>;
      case 'NOT_STARTED':
      default:
        return <span className="text-slate-500">Not started</span>;
    }
  };

  const renderModelStatus = () => {
    switch (status.modelStatus) {
      case 'READY':
        return <span className="font-semibold text-emerald-600">✓ Trained</span>;
      case 'TRAINING':
        return <span className="font-semibold text-amber-600 animate-pulse">Training...</span>;
      case 'FAILED':
        return <span className="font-semibold text-rose-600">Failed</span>;
      case 'NO_MODEL':
      default:
        return <span className="text-slate-500">No model</span>;
    }
  };

  const renderEngineStatus = () => {
    switch (status.engineStatus) {
      case 'CONNECTED':
        return <span className="font-semibold text-emerald-600">● Connected</span>;
      case 'CONNECTING':
        return <span className="font-semibold text-amber-600">◌ Connecting...</span>;
      case 'ERROR':
        return <span className="font-semibold text-rose-600">▲ Error</span>;
      case 'OFFLINE':
      case 'UNKNOWN':
      default:
        return <span className="text-slate-500">○ Offline</span>;
    }
  };

  return (
    <div
      role="region"
      aria-label="Project Status Panel"
      className={cn(
        'p-3 border-t border-surface-border bg-slate-50/80 text-xs font-mono select-none space-y-2',
        className
      )}
    >
      <div className="flex items-center justify-between pb-1 border-b border-surface-border/60">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          PROJECT STATUS
        </span>
        <span className="text-[10px] font-semibold text-slate-700 truncate max-w-[110px]" title={status.projectName}>
          {status.projectName}
        </span>
      </div>

      <div className="space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">WORKFLOW</span>
          <div>{renderWorkflowStatus()}</div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">DATASET</span>
          <div>{renderDatasetStatus()}</div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">MODEL</span>
          <div>{renderModelStatus()}</div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">ENGINE</span>
          <div>{renderEngineStatus()}</div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px]">
          <span className="text-slate-400">LAST TRAINING</span>
          <span className="text-slate-600 font-semibold">{status.lastTrainingRun}</span>
        </div>

        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-400">CURRENT MODEL</span>
          <span
            className="text-slate-600 font-semibold truncate max-w-[90px]"
            title={status.activeModelId}
          >
            {status.activeModelId}
          </span>
        </div>
      </div>
    </div>
  );
};
