import React, { useState } from 'react';
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
  ChevronDown,
  ChevronRight,
  Plus,
} from 'lucide-react';
import type { NodeCategory, NodeSubtype } from '@/types/workflow';

interface PaletteItem {
  category: NodeCategory;
  subtype: NodeSubtype;
  title: string;
  description: string;
  icon: React.ElementType;
}

const PALETTE_CATEGORIES: Array<{
  category: NodeCategory;
  name: string;
  badge: string;
  colorBorder: string;
  items: PaletteItem[];
}> = [
  {
    category: 'input',
    name: '1. INPUT',
    badge: 'Neutral',
    colorBorder: 'border-l-slate-400',
    items: [
      {
        category: 'input',
        subtype: 'camera',
        title: 'Camera',
        description: 'Capture real-time visual input from RTSP or USB feed',
        icon: Camera,
      },
      {
        category: 'input',
        subtype: 'image',
        title: 'Image',
        description: 'Ingest static inspection snapshot or photo',
        icon: ImageIcon,
      },
      {
        category: 'input',
        subtype: 'video',
        title: 'Video',
        description: 'Playback recorded safety video sequence',
        icon: Video,
      },
      {
        category: 'input',
        subtype: 'sensor',
        title: 'Sensor',
        description: 'Optical light barrier or photoelectric trigger',
        icon: Radio,
      },
    ],
  },
  {
    category: 'model',
    name: '2. AI MODEL',
    badge: 'Primary Accent',
    colorBorder: 'border-l-brand-primary',
    items: [
      {
        category: 'model',
        subtype: 'object_detection',
        title: 'Object Detection',
        description: 'Locate PPE equipment & hazards with bounding boxes',
        icon: Cpu,
      },
      {
        category: 'model',
        subtype: 'image_classification',
        title: 'Image Classification',
        description: 'Categorize entire scene compliance status',
        icon: Layers,
      },
      {
        category: 'model',
        subtype: 'pose_detection',
        title: 'Pose Detection',
        description: 'Estimate worker body ergonomics and posture',
        icon: Activity,
      },
    ],
  },
  {
    category: 'condition',
    name: '3. SAFETY CONDITION',
    badge: 'Information',
    colorBorder: 'border-l-sky-500',
    items: [
      {
        category: 'condition',
        subtype: 'object_detected',
        title: 'Object Detected?',
        description: 'Branch based on whether target safety item is present',
        icon: CheckCircle2,
      },
      {
        category: 'condition',
        subtype: 'confidence_threshold',
        title: 'Confidence Threshold',
        description: 'Verify prediction confidence exceeds safety cutoff',
        icon: Sliders,
      },
      {
        category: 'condition',
        subtype: 'zone_entered',
        title: 'Zone Entered?',
        description: 'Spatial boundary intersection with machinery polygon',
        icon: Activity,
      },
      {
        category: 'condition',
        subtype: 'count_threshold',
        title: 'Count Threshold',
        description: 'Evaluate minimum or maximum worker count',
        icon: Activity,
      },
    ],
  },
  {
    category: 'decision',
    name: '4. DECISION',
    badge: 'Warning/Neutral',
    colorBorder: 'border-l-amber-500',
    items: [
      {
        category: 'decision',
        subtype: 'yes_no',
        title: 'YES / NO',
        description: 'Binary logic gate splitting safe from violation flows',
        icon: HelpCircle,
      },
      {
        category: 'decision',
        subtype: 'safe',
        title: 'Safe',
        description: 'Confirm compliant status; clear active interlocks',
        icon: ShieldCheck,
      },
      {
        category: 'decision',
        subtype: 'warning',
        title: 'Warning',
        description: 'Marginal compliance or advisory operator condition',
        icon: AlertTriangle,
      },
      {
        category: 'decision',
        subtype: 'unsafe',
        title: 'Unsafe',
        description: 'Non-compliant state; triggers safety escalation',
        icon: AlertTriangle,
      },
    ],
  },
  {
    category: 'action',
    name: '5. ACTION',
    badge: 'Danger/Safety',
    colorBorder: 'border-l-rose-500',
    items: [
      {
        category: 'action',
        subtype: 'alert',
        title: 'Alert',
        description: 'Display visible workstation banner and screen flash',
        icon: Bell,
      },
      {
        category: 'action',
        subtype: 'alarm',
        title: 'Alarm',
        description: 'Sound high-decibel audible plant siren',
        icon: Volume2,
      },
      {
        category: 'action',
        subtype: 'notify_supervisor',
        title: 'Notify Supervisor',
        description: 'Dispatch immediate push notice or SMS to shift lead',
        icon: Send,
      },
      {
        category: 'action',
        subtype: 'stop_process',
        title: 'Stop Process',
        description: 'Trigger hard safety relay interlock to halt machine',
        icon: OctagonAlert,
      },
      {
        category: 'action',
        subtype: 'log_event',
        title: 'Log Event',
        description: 'Write audit trail evidence to compliance database',
        icon: FileText,
      },
    ],
  },
];

export interface NodePaletteProps {
  onAddNode: (category: NodeCategory, subtype: NodeSubtype) => void;
}

export const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode }) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    input: true,
    model: true,
    condition: true,
    decision: true,
    action: true,
  });

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const onDragStart = (
    e: React.DragEvent,
    category: NodeCategory,
    subtype: NodeSubtype
  ) => {
    e.dataTransfer.setData('application/reactflow/category', category);
    e.dataTransfer.setData('application/reactflow/subtype', subtype);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border-r border-surface-border text-surface-foreground select-none overflow-hidden">
      {/* Palette Header */}
      <div className="p-3 border-b border-surface-border bg-surface-subtle">
        <h3 className="text-xs font-bold font-mono tracking-wider text-surface-foreground uppercase">
          Component Palette
        </h3>
        <p className="text-[11px] text-surface-foreground-muted mt-0.5">
          Drag nodes onto canvas or click + to append.
        </p>
      </div>

      {/* Palette Categories List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {PALETTE_CATEGORIES.map((cat) => {
          const isOpen = openCategories[cat.category] ?? true;

          return (
            <div
              key={cat.category}
              className="rounded-lg border border-surface-border bg-slate-50/50 overflow-hidden"
            >
              {/* Category Collapsible Header */}
              <button
                type="button"
                onClick={() => toggleCategory(cat.category)}
                className="w-full flex items-center justify-between p-2 text-left hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span className="text-[11px] font-bold font-mono text-slate-700">
                    {cat.name}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-slate-400">
                  {cat.items.length} nodes
                </span>
              </button>

              {/* Items List */}
              {isOpen && (
                <div className="p-1.5 pt-0 space-y-1.5">
                  {cat.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.subtype}
                        draggable
                        onDragStart={(e) => onDragStart(e, item.category, item.subtype)}
                        className={`group relative p-2 rounded-md border border-surface-border bg-white cursor-grab active:cursor-grabbing hover:border-slate-400 hover:shadow-subtle transition-all border-l-4 ${cat.colorBorder}`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded bg-slate-100 text-slate-700 group-hover:text-brand-primary group-hover:bg-emerald-50 transition-colors">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-surface-foreground leading-tight">
                              {item.title}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddNode(item.category, item.subtype);
                            }}
                            title="Add to canvas"
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-brand-primary transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-[10px] text-surface-foreground-subtle leading-tight mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
