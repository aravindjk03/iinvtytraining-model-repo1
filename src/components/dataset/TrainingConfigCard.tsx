import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Sliders, Cpu, Eye, RotateCw } from 'lucide-react';
import type { TrainingHyperparameters } from '@/types/dataset';

export interface TrainingConfigCardProps {
  config: TrainingHyperparameters;
  onUpdateConfig: (patch: Partial<TrainingHyperparameters>) => void;
}

export const TrainingConfigCard: React.FC<TrainingConfigCardProps> = ({
  config,
  onUpdateConfig,
}) => {
  return (
    <Card className="border border-surface-border bg-white shadow-subtle">
      <CardHeader className="p-4 pb-2 bg-surface-subtle border-b border-surface-border">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand-primary" />
          <CardTitle className="text-xs font-mono uppercase">
            4. Training Configuration
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Model Family */}
          <div className="p-3 rounded-lg border border-surface-border bg-slate-50 space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              Model Family
            </span>
            <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-brand-primary" />
              <span>YOLO26n</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Compact high-speed neural network optimized for real-time plant safety.
            </p>
          </div>

          {/* Task */}
          <div className="p-3 rounded-lg border border-surface-border bg-slate-50 space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              Vision Task
            </span>
            <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-brand-primary" />
              <span>Object Detection</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Identifies location coordinates and class tags for safety gear.
            </p>
          </div>

          {/* Image Size */}
          <div className="p-3 rounded-lg border border-surface-border bg-slate-50 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                Image Resolution
              </span>
              <span className="font-mono font-bold text-slate-700">640 px</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Resolution used by the model while learning. Standard 640×640 square grid.
            </p>
          </div>

          {/* Epochs Input */}
          <div className="p-3 rounded-lg border border-surface-border bg-slate-50 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                <RotateCw className="w-3 h-3 text-brand-primary" />
                <span>Training Epochs</span>
              </span>
              <span className="font-mono font-bold text-brand-primary text-sm">
                {config.epochs}
              </span>
            </div>
            <input
              type="number"
              min={5}
              max={100}
              step={5}
              value={config.epochs}
              onChange={(e) =>
                onUpdateConfig({ epochs: Math.max(5, parseInt(e.target.value) || 20) })
              }
              className="w-full px-2 py-1 rounded border border-surface-border text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white font-mono"
            />
            <p className="text-[10px] text-slate-500">
              How many times the model goes through the training dataset.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
