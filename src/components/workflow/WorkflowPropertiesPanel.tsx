import React, { useState, useEffect } from 'react';
import {
  Trash2,
  X,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Sparkles,
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
import { repo2Connector } from '@/services/api/repo2Connector';
import { isModelCompatible } from '@/services/api/modelCatalog';
import type { Repo2ModelMetadata, EngineStatusResult } from '@/types/api';

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
  const [availableModels, setAvailableModels] = useState<Repo2ModelMetadata[]>([]);
  const [engineStatus, setEngineStatus] = useState<EngineStatusResult>({
    status: 'CONNECTING',
    connected: false,
    message: 'Checking engine...',
  });
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Load models from Repo 2 connector whenever panel opens on a model node
  useEffect(() => {
    if (!selectedNode || selectedNode.type !== 'model') return;

    let isMounted = true;
    const loadCatalog = async () => {
      setIsLoadingModels(true);
      try {
        const [status, models] = await Promise.all([
          repo2Connector.getEngineStatus(),
          repo2Connector.listModels(),
        ]);
        if (isMounted) {
          setEngineStatus(status);
          setAvailableModels(models);
        }
      } catch {
        if (isMounted) {
          setEngineStatus({
            status: 'OFFLINE',
            connected: false,
            message: 'Model Engine is offline.',
          });
          setAvailableModels([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingModels(false);
        }
      }
    };

    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, [selectedNode?.id, selectedNode?.type]);

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
  const isDemoActive = repo2Connector.isDemoMode();

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
            <span className="text-slate-700 font-semibold capitalize">{subtype.replace(/_/g, ' ')}</span>
          </div>
        </div>

        {/* AI MODEL CATEGORY CONFIGURATION */}
        {type === 'model' && (
          <div className="space-y-4">
            {/* Capability Heading */}
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider block">
                AI Capability
              </span>
              <span className="text-xs font-bold text-brand-primary capitalize">
                {subtype.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Engine Status & Demo Fixture */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Model Engine Catalog
              </label>

              {isLoadingModels ? (
                <div className="p-2.5 rounded border border-slate-200 bg-slate-50 text-slate-600 flex items-center gap-2 text-[11px]">
                  <RotateCw className="w-3.5 h-3.5 animate-spin text-brand-primary" />
                  <span>Loading catalog from Model Engine...</span>
                </div>
              ) : engineStatus.connected ? (
                <div className="p-2 rounded border border-emerald-200 bg-emerald-50 text-emerald-900 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>● CONNECTED</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-mono">v{engineStatus.version || '1.0'}</span>
                </div>
              ) : isDemoActive ? (
                <div className="p-2.5 rounded border border-amber-300 bg-amber-50 text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>DEMO CATALOG (Demo Mode - Not real engine)</span>
                  </div>
                  <span className="text-[10px] text-amber-800 block">
                    Using local workshop fixtures for testing visual builder.
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded border border-rose-300 bg-rose-50/90 text-rose-900 space-y-2">
                  <div className="flex items-start gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[11px] block">MODEL ENGINE OFFLINE</span>
                      <span className="text-[10px] text-rose-800 leading-tight block">
                        Start the AI Model Engine to load available models.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      repo2Connector.setDemoMode(true);
                      repo2Connector.listModels().then(setAvailableModels);
                    }}
                    className="w-full px-2 py-1 bg-white border border-rose-200 hover:bg-rose-100 rounded text-[10px] font-mono font-bold text-rose-800 transition-colors"
                  >
                    Enable Workshop Demo Catalog
                  </button>
                </div>
              )}
            </div>

            {/* Model Selection Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Select Model
              </label>

              {availableModels.length === 0 && !isDemoActive && !engineStatus.connected ? (
                <div className="p-2 rounded bg-slate-100 border border-slate-200 text-slate-500 text-[11px] font-mono">
                  No models available (Engine offline)
                </div>
              ) : (
                <select
                  value={(config as ModelNodeConfig)?.modelId || ''}
                  onChange={(e) => {
                    const chosenId = e.target.value;
                    if (!chosenId) {
                      onUpdateConfig(id, {
                        ...config,
                        modelId: null,
                        modelName: undefined,
                      });
                      return;
                    }
                    const chosenModel = availableModels.find((m) => m.modelId === chosenId);
                    if (chosenModel) {
                      onUpdateConfig(id, {
                        ...config,
                        modelId: chosenModel.modelId,
                        modelName: chosenModel.name,
                        classes: chosenModel.classes || (config as ModelNodeConfig)?.classes || ['object'],
                      });
                    }
                  }}
                  className="w-full px-2.5 py-1.5 rounded border border-surface-border text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                >
                  <option value="">-- Select AI Model --</option>
                  {availableModels.map((model) => {
                    const compatible = isModelCompatible(subtype, model.taskType);
                    return (
                      <option
                        key={model.modelId}
                        value={model.modelId}
                        disabled={!compatible}
                      >
                        {model.name} ({model.modelId}) {compatible ? '' : `[Incompatible with ${subtype}]`}
                      </option>
                    );
                  })}
                </select>
              )}

              {/* Selected Model Details Card */}
              {(config as ModelNodeConfig)?.modelId && (
                <div className="mt-2 p-2.5 rounded border border-slate-200 bg-slate-50 space-y-1 font-mono text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Selected ID:</span>
                    <strong className="text-brand-primary font-bold">{(config as ModelNodeConfig).modelId}</strong>
                  </div>
                  {(config as ModelNodeConfig).modelName && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Model Name:</span>
                      <span className="text-slate-700">{(config as ModelNodeConfig).modelName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Weights:</span>
                    <span className="text-slate-500 italic">Managed by Repo 2</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confidence Threshold Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-semibold text-slate-700">
                  Confidence Threshold
                </label>
                <span className="font-mono font-bold text-brand-primary text-xs">
                  {Math.round(((config as ModelNodeConfig)?.confidenceThreshold ?? 0.5) * 100)}%
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

        {/* CONDITION NODE CONFIGURATION */}
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
                  {Math.round(((config as ConditionNodeConfig)?.threshold ?? 0.5) * 100)}%
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
          </div>
        )}

        {/* DECISION NODE CONFIGURATION */}
        {type === 'decision' && (
          <div className="space-y-3">
            <label className="block text-[11px] font-semibold text-slate-700">
              Decision Safety Semantic
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['safe', 'warning', 'unsafe'] as const).map((dec) => (
                <button
                  key={dec}
                  type="button"
                  onClick={() =>
                    onUpdateConfig(id, {
                      ...config,
                      decisionType: dec,
                    })
                  }
                  className={`py-1.5 px-2 rounded border text-center font-mono font-bold text-[10px] uppercase transition-all ${
                    (config as DecisionNodeConfig)?.decisionType === dec
                      ? dec === 'safe'
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : dec === 'warning'
                        ? 'bg-amber-600 text-white border-amber-700'
                        : 'bg-rose-600 text-white border-rose-700'
                      : 'bg-white text-slate-600 border-surface-border hover:bg-slate-50'
                  }`}
                >
                  {dec}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ACTION NODE CONFIGURATION */}
        {type === 'action' && (
          <div className="space-y-3">
            <label className="block text-[11px] font-semibold text-slate-700">
              Safety Urgency Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['info', 'warning', 'critical'] as const).map((urg) => (
                <button
                  key={urg}
                  type="button"
                  onClick={() =>
                    onUpdateConfig(id, {
                      ...config,
                      urgency: urg,
                    })
                  }
                  className={`py-1.5 px-2 rounded border text-center font-mono font-bold text-[10px] uppercase transition-all ${
                    (config as ActionNodeConfig)?.urgency === urg
                      ? urg === 'critical'
                        ? 'bg-rose-600 text-white border-rose-700'
                        : urg === 'warning'
                        ? 'bg-amber-600 text-white border-amber-700'
                        : 'bg-blue-600 text-white border-blue-700'
                      : 'bg-white text-slate-600 border-surface-border hover:bg-slate-50'
                  }`}
                >
                  {urg}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* INPUT NODE CONFIGURATION */}
        {type === 'input' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Stream Resolution
              </label>
              <select
                value={(config as InputNodeConfig)?.resolution || '1080p'}
                onChange={(e) =>
                  onUpdateConfig(id, {
                    ...config,
                    resolution: e.target.value,
                  })
                }
                className="w-full px-2.5 py-1.5 rounded border border-surface-border text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary"
              >
                <option value="720p">720p (HD 1280×720)</option>
                <option value="1080p">1080p (FHD 1920×1080)</option>
                <option value="4k">4K (UHD 3840×2160)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Footer Delete Button */}
      <div className="p-3 border-t border-surface-border bg-slate-50 shrink-0">
        <button
          type="button"
          onClick={() => onDeleteNode(id)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-rose-600 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 font-semibold text-xs transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Node</span>
        </button>
      </div>
    </div>
  );
};
