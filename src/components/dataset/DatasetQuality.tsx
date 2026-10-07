import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Activity, AlertTriangle, Info } from 'lucide-react';
import type { DatasetQualityReport } from '@/types/dataset';

export interface DatasetQualityProps {
  quality: DatasetQualityReport;
}

export const DatasetQuality: React.FC<DatasetQualityProps> = ({ quality }) => {
  const {
    status,
    totalImages,
    classCount,
    classDistribution,
    isBalanced,
    isThresholdMet,
    issues,
  } = quality;

  return (
    <Card className="border border-surface-border bg-white shadow-subtle">
      <CardHeader className="p-4 pb-2 bg-surface-subtle border-b border-surface-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-primary" />
          <CardTitle className="text-xs font-mono uppercase">
            3. Dataset Quality Analysis
          </CardTitle>
        </div>

        <div>
          {status === 'READY' && (
            <Badge variant="accent" size="sm">
              ✓ READY FOR TRAINING
            </Badge>
          )}
          {status === 'WARNING' && (
            <Badge variant="neutral" size="sm" className="bg-amber-100 text-amber-800 border-amber-300">
              ⚠ QUALITY WARNING
            </Badge>
          )}
          {status === 'INCOMPLETE' && (
            <Badge variant="neutral" size="sm" className="bg-slate-100 text-slate-700">
              INCOMPLETE
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        {/* Class Balance Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg border border-surface-border bg-slate-50 space-y-0.5 font-mono">
            <span className="text-[10px] text-slate-500 uppercase">Total Samples</span>
            <div className="text-base font-bold text-slate-900">{totalImages} images</div>
            <span className="text-[10px] text-slate-400">
              {isThresholdMet ? '✓ Workshop threshold met' : '⚠ Below 10/class minimum'}
            </span>
          </div>

          <div className="p-3 rounded-lg border border-surface-border bg-slate-50 space-y-0.5 font-mono">
            <span className="text-[10px] text-slate-500 uppercase">Class Count</span>
            <div className="text-base font-bold text-slate-900">{classCount} classes</div>
            <span className="text-[10px] text-slate-400">
              {classCount >= 2 ? '✓ Binary distinction active' : '⚠ Needs at least 2 classes'}
            </span>
          </div>

          <div className="p-3 rounded-lg border border-surface-border bg-slate-50 space-y-0.5 font-mono">
            <span className="text-[10px] text-slate-500 uppercase">Class Balance</span>
            <div className={`text-base font-bold ${isBalanced ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isBalanced ? 'Reasonably Balanced' : 'Imbalance Detected'}
            </div>
            <span className="text-[10px] text-slate-400">
              {isBalanced ? '✓ Proportion is consistent' : '⚠ Skewed representation'}
            </span>
          </div>
        </div>

        {/* Per-Class Counts List */}
        <div className="p-3 rounded-lg border border-surface-border bg-surface-subtle space-y-2">
          <span className="text-[11px] font-semibold text-slate-700 block">
            Class Distribution:
          </span>
          <div className="space-y-1.5">
            {Object.entries(classDistribution).map(([className, count]) => {
              const maxCount = Math.max(1, ...Object.values(classDistribution));
              const pct = Math.round((count / maxCount) * 100);

              return (
                <div key={className} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-mono">
                    <span className="font-semibold text-slate-800">{className}</span>
                    <span className="text-slate-600">{count} examples</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-brand-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Issues and Recommendations */}
        {issues.length > 0 && (
          <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/70 text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Dataset Observations:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-1">
              {issues.map((iss, idx) => (
                <li key={idx}>{iss}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Workshop Exercise Disclaimer */}
        <div className="p-2.5 rounded bg-slate-100 border border-slate-200 text-slate-600 text-[10px] flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
          <span>
            <strong>Educational threshold note:</strong> The 10-image minimum is an interactive workshop threshold designed for rapid learning. It is NOT sufficient for certified industrial plant deployment without exhaustive dataset validation.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
