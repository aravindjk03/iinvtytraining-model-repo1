import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  AlertTriangle,
  Save,
  Play,
  RotateCcw,
} from 'lucide-react';
import type { WorkflowValidationResult } from '@/types/workflow';

export interface WorkflowStatusBarProps {
  nodeCount: number;
  connectionCount: number;
  validation: WorkflowValidationResult;
  isSaved?: boolean;
  onSave: () => void;
  onRestoreStarter: () => void;
}

export const WorkflowStatusBar: React.FC<WorkflowStatusBarProps> = ({
  nodeCount,
  connectionCount,
  validation,
  onSave,
  onRestoreStarter,
}) => {
  const navigate = useNavigate();
  const { isValid, errors } = validation;

  return (
    <div className="border-t border-surface-border bg-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      {/* Left: Metrics & Validation Status */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500 border-r border-slate-200 pr-3">
          <span>
            Nodes: <strong className="text-slate-800">{nodeCount}</strong>
          </span>
          <span>
            Connections: <strong className="text-slate-800">{connectionCount}</strong>
          </span>
        </div>

        {/* Validation Badge */}
        {isValid ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold font-mono text-[11px]">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>✓ WORKFLOW VALID</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 border border-amber-300 text-amber-900 font-semibold font-mono text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>⚠ WORKFLOW INCOMPLETE</span>
            </div>
            {errors.length > 0 && (
              <span className="text-[11px] text-slate-500 max-w-[360px] truncate hidden md:inline">
                {errors[0]}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRestoreStarter}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          title="Restore standard PPE Hardhat starter pipeline"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Starter Workflow</span>
        </button>

        <button
          type="button"
          onClick={onSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-semibold text-brand-primary bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors"
          title="Save workflow JSON to local storage"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Workflow</span>
        </button>

        <button
          type="button"
          disabled={!isValid}
          onClick={() => navigate('/test')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-[11px] font-bold shadow-subtle transition-all ${
            isValid
              ? 'bg-brand-primary text-white hover:bg-brand-primary/90 cursor-pointer'
              : 'bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed opacity-80'
          }`}
          title={isValid ? 'Proceed to Test Module with valid graph' : 'Complete required workflow connections first'}
        >
          <Play className="w-3.5 h-3.5" />
          <span>TEST WORKFLOW</span>
        </button>
      </div>
    </div>
  );
};
