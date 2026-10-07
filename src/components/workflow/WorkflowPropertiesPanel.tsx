import React from 'react';
import {
  Trash2,
  X,
  Sliders,
  Cpu,
  Info,
} from 'lucide-react';
import type {
  WorkflowNodeDescriptor,
  NodeConfig,
  ModelNodeConfig,
  ConditionNodeConfig,
  DecisionNodeConfig,
  ActionNodeConfig,
  InputNodeConfig,
} from '@/types/workflow';

export interface WorkflowPropertiesPanelProps {
  selectedNode: WorkflowNodeDescriptor | null;
  onClose: () => void;
  onUpdateConfig: (id: string, config: NodeConfig) => void;
  onDeleteNode: (id: string) => void;
}

export const WorkflowPropertiesPanel: React.FC<WorkflowPropertiesPanelProps> = ({
  selectedNode,
  onClose,
  onUpdateConfig,
  onDeleteNode,
}) => {
  if (!selectedNode) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-surface-foreground-muted bg-white border-l border-surface-border select-none">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-surface-border">
          <Sliders className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-bold font-mono uppercase text-slate-600 mb-1">
          No Node Selected
        </h4>
        <p className="text-[11px] text-surface-foreground-subtle max-w-[200px] leading-relaxed">
          Select a node on the canvas to configure detection parameters and thresholds.
        </p>
      </div>
    );
  }

  const { id, type, subtype, title, config } = selectedNode;

  return (
    <div className="w-full h-full flex flex-col bg-white border-l border-surface-border text-surface-foreground select-none overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-surface-border bg-surface-subtle flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded border border-slate-300">
            {type}
          </span>
          <h3 className="text-xs font-bold text-surface-foreground truncate max-w-[140px]">
            {title || subtype}
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          title="Deselect node"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Configuration Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Node Metadata Card */}
        <div className="p-2.5 rounded-lg border border-surface-border bg-slate-50 space-y-1 font-mono text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-400">Node ID:</span>
            <span className="text-slate-700 font-semibold">{id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Subtype:</span>
            <span className="text-slate-700 font-semibold">{subtype}</span>
          </div>
        </div>

        {/* Category-Specific Configuration Fields */}
        {type === 'model' && (
          <div className="space-y-4">
            {/* Model Engine Connection Status */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Model Engine Status
              </label>
              <div className="p-2.5 rounded border border-amber-200 bg-amber-50/70 text-amber-900 flex items-start gap-2">
                <Cpu className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-semibold block">Model Engine connection required</span>
                  <span className="text-[10px] text-amber-800">
                    Live inference requires connecting to the separate Model Engine worker.
                  </span>
                </div>
              </div>
            </div>

            {/* Confidence Threshold Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-semibold text-slate-700">
                  Confidence Threshold
                </label>
                <span className="font-mono font-bold text-brand-primary text-xs">
                  {((config as ModelNodeConfig)?.confidenceThreshold ?? 0.5).toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.95"
                step="0.05"
                value={(config as ModelNodeConfig)?.confidenceThreshold ?? 0.5}
                onChange={(e) =>
                  onUpdateConfig(id, {
                    ...config,
                    confidenceThreshold: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-brand-primary cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Detections below this cutoff will be treated as non-detections.
              </span>
            </div>

            {/* Configured Classes */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                Active Detection Classes
              </label>
              <div className="flex flex-wrap gap-1.5">
                {((config as ModelNodeConfig)?.classes || ['helmet', 'vest']).map((cls) => (
                  <span
                    key={cls}
                    className="px-2 py-0.5 rounded bg-emerald-50 text-brand-primary border border-emerald-200 font-mono text-[10px] font-bold"
                  >
                    [{cls}]
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {type === 'condition' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Target Object Class
              </label>
              <input
                type="text"
                value={(config as ConditionNodeConfig)?.objectClass || 'helmet'}
                onChange={(e) =>
                  onUpdateConfig(id, {
                    ...config,
                    objectClass: e.target.value,
                  })
                }
                placeholder="e.g. helmet, vest, machinery"
                className="w-full px-2.5 py-1.5 rounded border border-surface-border text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                The AI model detection class this rule checks for.
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-semibold text-slate-700">
                  Required Minimum Confidence
                </label>
                <span className="font-mono font-bold text-sky-700 text-xs">
                  {((config as ConditionNodeConfig)?.threshold ?? 0.5).toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.95"
                step="0.05"
                value={(config as ConditionNodeConfig)?.threshold ?? 0.5}
                onChange={(e) =>
                  onUpdateConfig(id, {
                    ...config,
                    threshold: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            <div className="p-2.5 rounded bg-sky-50 border border-sky-200 text-sky-900 text-[11px] flex items-start gap-2">
              <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Branching Logic:</span> If detected with confidence ≥ threshold, route takes <span className="font-bold text-emerald-700">YES</span>. Otherwise routes <span className="font-bold text-rose-700">NO</span>.
              </div>
            </div>
          </div>
        )}

        {type === 'decision' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Decision Semantic
              </label>
              <select
                value={(config as DecisionNodeConfig)?.decisionType || subtype || 'safe'}
                onChange={(e) =>
                  onUpdateConfig(id, {
                    ...config,
                    decisionType: e.target.value as 'safe' | 'warning' | 'unsafe' | 'yes_no',
                  })
                }
                className="w-full px-2.5 py-1.5 rounded border border-surface-border text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white"
              >
                <option value="safe">Safe (Compliant)</option>
                <option value="warning">Warning (Marginal)</option>
                <option value="unsafe">Unsafe (Violation)</option>
                <option value="yes_no">Binary YES / NO</option>
              </select>
            </div>
          </div>
        )}

        {type === 'action' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Action Severity Level
              </label>
              <select
                value={(config as ActionNodeConfig)?.urgency || 'critical'}
                onChange={(e) =>
                  onUpdateConfig(id, {
                    ...config,
                    urgency: e.target.value as 'info' | 'warning' | 'critical',
                  })
                }
                className="w-full px-2.5 py-1.5 rounded border border-surface-border text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white"
              >
                <option value="info">Informational Advisory</option>
                <option value="warning">Warning Escalation</option>
                <option value="critical">Critical Safety Interlock</option>
              </select>
            </div>
          </div>
        )}

        {type === 'input' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Input Stream Source
              </label>
              <select
                value={(config as InputNodeConfig)?.sourceType || 'live_stream'}
                onChange={(e) =>
                  onUpdateConfig(id, {
                    ...config,
                    sourceType: e.target.value as 'live_stream' | 'file' | 'device',
                  })
                }
                className="w-full px-2.5 py-1.5 rounded border border-surface-border text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white"
              >
                <option value="live_stream">RTSP Live Camera Feed</option>
                <option value="device">USB Plant WebCam</option>
                <option value="file">Static Inspection Frame</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Delete / Actions Footer */}
      <div className="p-3 border-t border-surface-border bg-surface-subtle">
        <button
          type="button"
          onClick={() => onDeleteNode(id)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Node</span>
        </button>
      </div>
    </div>
  );
};
