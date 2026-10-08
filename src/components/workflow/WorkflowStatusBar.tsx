import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  AlertTriangle,
  Save,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import type { WorkflowValidationResult, WorkflowNodeDescriptor } from '@/types/workflow';

export interface WorkflowStatusBarProps {
  nodeCount: number;
  connectionCount: number;
  validation: WorkflowValidationResult;
  nodes?: WorkflowNodeDescriptor[];
  isSaved?: boolean;
  onSave: () => void;
  onRestoreStarter: () => void;
  onContinue?: () => void;
}

export const WorkflowStatusBar: React.FC<WorkflowStatusBarProps> = ({
  nodeCount,
  connectionCount,
  validation,
  nodes = [],
  onSave,
  onRestoreStarter,
  onContinue,
}) => {
  const navigate = useNavigate();
  const { isValid, errors } = validation;

  // Build a concise workflow summary preview: Image -> Model (modelId) -> Condition -> Action
  const summaryPreview = React.useMemo(() => {
    if (nodes.length === 0) return null;
    const parts: string[] = [];

    const input = nodes.find((n) => n.type === 'input');
    if (input) parts.push(input.title || 'Input');

    const model = nodes.find((n) => n.type === 'model');
    if (model) {
      const modelCfg = model.config as { modelId?: string | null; modelName?: string } | undefined;
      const modelLabel = modelCfg?.modelName || modelCfg?.modelId || model.title || 'AI Model';
      parts.push(modelLabel);
    }

    const condition = nodes.find((n) => n.type === 'condition' || n.type === 'decision');
    if (condition) parts.push(condition.title || 'Condition');

    const action = nodes.find((n) => n.type === 'action');
    if (action) parts.push(action.title || 'Action');

    return parts.length >= 2 ? parts.join(' → ') : null;
  }, [nodes]);

  const handleContinue = () => {
    onSave();
    if (onContinue) {
      onContinue();
    } else {
      navigate('/teach');
    }
  };

  return (
    <div className="border-t border-surface-border bg-white px-4 py-2 flex flex-col gap-2 text-xs select-none shadow-xs">
      {/* Top Preview Line: Simple Workflow Summary */}
      {summaryPreview && (
        <div className="flex items-center gap-2 text-[11px] font-mono border-b border-slate-100 pb-1.5 text-slate-600">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Your AI:</span>
          <span className="font-semibold text-brand-primary truncate">{summaryPreview}</span>
        </div>
      )}

      {/* Main Status & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
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
              <span>✓ YOUR AI WORKFLOW IS READY</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 border border-amber-300 text-amber-900 font-semibold font-mono text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>⚠ WORKFLOW NEEDS ATTENTION</span>
              </div>
              {errors.length > 0 && (
                <span className="text-[11px] text-slate-600 max-w-[380px] truncate hidden md:inline">
                  Missing: {errors[0]}
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
            title="Save workflow JSON to project state and local storage"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Workflow</span>
          </button>

          {/* SAVE & CONTINUE / CONTINUE TO TEACH BUTTON */}
          <button
            type="button"
            disabled={!isValid}
            onClick={handleContinue}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-[11px] font-bold shadow-subtle transition-all ${
              isValid
                ? 'bg-brand-primary text-white hover:bg-brand-primary/90 cursor-pointer'
                : 'bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed opacity-80'
            }`}
            title={isValid ? 'Save workflow and continue to Teach module' : 'Complete all required connections and model selections first'}
          >
            <span>CONTINUE TO TEACH</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
