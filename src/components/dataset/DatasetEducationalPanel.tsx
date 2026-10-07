import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BookOpen, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

export const DatasetEducationalPanel: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Why Data Matters Card */}
      <Card className="border border-surface-border bg-white shadow-subtle">
        <CardHeader className="p-4 pb-2 bg-surface-subtle border-b border-surface-border">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-primary" />
            <CardTitle className="text-xs font-mono uppercase">
              Why Your Data Matters
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 text-xs text-slate-600 leading-relaxed space-y-2">
          <p>
            Your AI learns patterns strictly from the examples you provide. Different lighting,
            camera angles, people, environments, and safety equipment can change what the model
            learns.
          </p>
          <p className="text-[11px] text-slate-500">
            If your dataset only shows white helmets under bright laboratory lights, the model will
            struggle to detect blue or yellow hardhats in shadowed plant environments.
          </p>
        </CardContent>
      </Card>

      {/* Dataset Observation Coverage Card */}
      <Card className="border border-surface-border bg-white shadow-subtle">
        <CardHeader className="p-4 pb-2 bg-surface-subtle border-b border-surface-border">
          <CardTitle className="text-xs font-mono uppercase text-slate-700">
            Dataset Observation Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-2 text-xs">
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Different people represented</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Multiple camera viewing angles</span>
            </div>
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Add more lighting variation (low-light, glare)</span>
            </div>
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Add background clutter & occlusions</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Corporate Safety Standard Disclaimer */}
      <div className="p-3 rounded-lg border border-surface-border bg-surface-subtle text-surface-foreground-subtle text-[10px] leading-relaxed flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          <strong>Workshop model only.</strong> Do not use this training model as a production safety control without formal industrial validation.
        </span>
      </div>
    </div>
  );
};
