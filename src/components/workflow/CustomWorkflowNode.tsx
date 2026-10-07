import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import {
  Camera,
  Image as ImageIcon,
  Video,
  Radio,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  Bell,
  Volume2,
  Send,
  OctagonAlert,
  FileText,
  HelpCircle,
} from 'lucide-react';
import type { CustomNodeData, NodeCategory, NodeSubtype } from '@/types/workflow';

function getNodeIcon(_category: NodeCategory, subtype: NodeSubtype) {
  switch (subtype) {
    case 'camera':
      return Camera;
    case 'image':
      return ImageIcon;
    case 'video':
      return Video;
    case 'sensor':
      return Radio;
    case 'object_detection':
      return Cpu;
    case 'image_classification':
      return Layers;
    case 'pose_detection':
      return Activity;
    case 'object_detected':
      return CheckCircle2;
    case 'confidence_threshold':
      return Sliders;
    case 'zone_entered':
    case 'count_threshold':
      return Activity;
    case 'safe':
      return ShieldCheck;
    case 'warning':
    case 'unsafe':
      return AlertTriangle;
    case 'yes_no':
      return HelpCircle;
    case 'alert':
      return Bell;
    case 'alarm':
      return Volume2;
    case 'notify_supervisor':
      return Send;
    case 'stop_process':
      return OctagonAlert;
    case 'log_event':
      return FileText;
    default:
      return Cpu;
  }
}

function getCategoryColor(category: NodeCategory): {
  container: string;
  badge: string;
  border: string;
  handleColor: string;
} {
  switch (category) {
    case 'input':
      return {
        container: 'bg-white border-slate-300 hover:border-slate-400',
        badge: 'bg-slate-100 text-slate-700 border-slate-200',
        border: 'border-l-4 border-l-slate-500',
        handleColor: '#64748b',
      };
    case 'model':
      return {
        container: 'bg-emerald-50/30 border-brand-primary/50 hover:border-brand-primary',
        badge: 'bg-emerald-100 text-brand-primary border-emerald-200',
        border: 'border-l-4 border-l-brand-primary',
        handleColor: '#0F513E',
      };
    case 'condition':
      return {
        container: 'bg-sky-50/30 border-sky-400 hover:border-sky-500',
        badge: 'bg-sky-100 text-sky-800 border-sky-200',
        border: 'border-l-4 border-l-sky-600',
        handleColor: '#0284c7',
      };
    case 'decision':
      return {
        container: 'bg-amber-50/30 border-amber-400 hover:border-amber-500',
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
        border: 'border-l-4 border-l-amber-600',
        handleColor: '#d97706',
      };
    case 'action':
      return {
        container: 'bg-rose-50/30 border-rose-400 hover:border-rose-500',
        badge: 'bg-rose-100 text-rose-800 border-rose-200',
        border: 'border-l-4 border-l-rose-600',
        handleColor: '#e11d48',
      };
  }
}

export const CustomWorkflowNode: React.FC<NodeProps<CustomNodeData>> = memo(
  ({ data, selected }) => {
    const { category, subtype, title, description, config } = data;
    const Icon = getNodeIcon(category, subtype);
    const colors = getCategoryColor(category);

    const isCondition = category === 'condition';
    const isInput = category === 'input';
    const isAction = category === 'action';

    return (
      <div
        className={`relative min-w-[210px] max-w-[240px] rounded-lg border bg-white p-3 shadow-sm transition-all text-xs font-sans select-none ${
          colors.container
        } ${colors.border} ${
          selected
            ? 'ring-2 ring-brand-accent ring-offset-1 shadow-md'
            : 'hover:shadow'
        }`}
      >
        {/* Incoming handle (left) - All except Input */}
        {!isInput && (
          <Handle
            type="target"
            position={Position.Left}
            id="input"
            className="!w-3 !h-3 !-left-1.5 !bg-white !border-2 transition-colors hover:!scale-125"
            style={{ borderColor: colors.handleColor }}
          />
        )}

        {/* Node Header */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded bg-white shadow-subtle border border-surface-border">
              <Icon className="w-3.5 h-3.5 text-surface-foreground" />
            </div>
            <span className="font-bold text-surface-foreground leading-tight tracking-tight">
              {title}
            </span>
          </div>

          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border shrink-0 ${colors.badge}`}
          >
            {category}
          </span>
        </div>

        {/* Node Description */}
        <p className="text-[11px] text-surface-foreground-muted leading-tight mb-2 line-clamp-2">
          {description}
        </p>

        {/* Configuration Summary Badge */}
        {category === 'model' && (
          <div className="mt-1 pt-1.5 border-t border-surface-border/60 flex items-center justify-between text-[10px] text-surface-foreground-subtle font-mono">
            <span>Threshold:</span>
            <span className="font-bold text-brand-primary">
              {((config as { confidenceThreshold?: number })?.confidenceThreshold ?? 0.5).toFixed(2)}
            </span>
          </div>
        )}

        {category === 'condition' && (
          <div className="mt-1 pt-1.5 border-t border-surface-border/60 flex items-center justify-between text-[10px] text-surface-foreground-subtle font-mono">
            <span>Target:</span>
            <span className="font-bold text-sky-700 capitalize">
              {(config as { objectClass?: string })?.objectClass || 'helmet'}
            </span>
          </div>
        )}

        {/* Outgoing handles (right) */}
        {isCondition ? (
          // Condition nodes have 2 explicit branching output handles: YES and NO
          <>
            <div className="absolute -right-1 top-3 flex items-center">
              <span className="text-[9px] font-mono font-bold text-emerald-700 mr-2 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200 shadow-xs">
                YES
              </span>
              <Handle
                type="source"
                position={Position.Right}
                id="yes"
                className="!w-3 !h-3 !-right-1.5 !bg-emerald-600 !border-2 !border-white hover:!scale-125"
              />
            </div>
            <div className="absolute -right-1 bottom-3 flex items-center">
              <span className="text-[9px] font-mono font-bold text-rose-700 mr-2 bg-rose-50 px-1 py-0.5 rounded border border-rose-200 shadow-xs">
                NO
              </span>
              <Handle
                type="source"
                position={Position.Right}
                id="no"
                className="!w-3 !h-3 !-right-1.5 !bg-rose-600 !border-2 !border-white hover:!scale-125"
              />
            </div>
          </>
        ) : !isAction ? (
          // Standard single output handle on the right
          <Handle
            type="source"
            position={Position.Right}
            id="output"
            className="!w-3 !h-3 !-right-1.5 !bg-white !border-2 transition-colors hover:!scale-125"
            style={{ borderColor: colors.handleColor }}
          />
        ) : null}
      </div>
    );
  }
);

CustomWorkflowNode.displayName = 'CustomWorkflowNode';
