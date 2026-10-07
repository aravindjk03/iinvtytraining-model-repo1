import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  FileCode,
  X,
  ArrowRight,
} from 'lucide-react';
import type { DatasetQualityReport, TrainingRequestPayload } from '@/types/dataset';
import type { Project } from '@/types/project';

export interface DatasetReadinessProps {
  project: Project;
  quality: DatasetQualityReport;
  trainingRequest: TrainingRequestPayload;
  onResetDataset: () => void;
}

export const DatasetReadiness: React.FC<DatasetReadinessProps> = ({
  project,
  quality,
  trainingRequest,
  onResetDataset,
}) => {
  const navigate = useNavigate();
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const hasProblem = Boolean(project.safetyProblem && project.safetyProblem.trim().length > 3);
  const hasClasses = quality.classCount >= 2;
  const hasExamples = quality.isThresholdMet;
  const isChecked = quality.status === 'READY';
  const hasConfig = Boolean(trainingRequest.training.epochs > 0);

  const isReady = hasProblem && hasClasses && hasExamples && isChecked && hasConfig;

  return (
    <Card className="border border-surface-border bg-white shadow-subtle">
      <CardHeader className="p-4 pb-2 bg-surface-subtle border-b border-surface-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-brand-primary" />
          <CardTitle className="text-xs font-mono uppercase">
            5. Training Readiness & Dispatch Preparation
          </CardTitle>
        </div>

        {isReady ? (
          <Badge variant="accent" size="sm">
            READY FOR TRAINING
          </Badge>
        ) : (
          <Badge variant="neutral" size="sm">
            TRAINING NOT READY
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        {/* Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            {hasProblem ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            <span className={hasProblem ? 'text-slate-800' : 'text-slate-400'}>
              Safety problem defined
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasClasses ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            <span className={hasClasses ? 'text-slate-800' : 'text-slate-400'}>
              Classes created (≥2)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasExamples ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            <span className={hasExamples ? 'text-slate-800' : 'text-slate-400'}>
              Examples added (≥10/class)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isChecked ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            <span className={isChecked ? 'text-slate-800' : 'text-slate-400'}>
              Dataset checked & balanced
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasConfig ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            <span className={hasConfig ? 'text-slate-800' : 'text-slate-400'}>
              Training configuration set
            </span>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-surface-border">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Dataset</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowJsonModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Inspect TrainingRequest JSON</span>
            </button>

            <Button
              variant="primary"
              size="sm"
              disabled={!isReady}
              onClick={() => navigate('/train')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Ready for Training
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-surface-border max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Confirm Dataset Reset</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Resetting the dataset will remove all example images associated with this project.
              <strong> Your workflow created in Phase 2 will NOT be deleted.</strong>
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetDataset();
                  setShowResetConfirm(false);
                }}
                className="px-3 py-1.5 rounded bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
              >
                Yes, Reset Dataset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JSON Inspector Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-surface-border max-w-2xl w-full flex flex-col max-h-[85vh] overflow-hidden">
            <div className="p-3.5 bg-surface-subtle border-b border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-brand-primary" />
                <h4 className="text-xs font-bold font-mono uppercase text-slate-800">
                  Serialized TrainingRequest Object (Phase 3 Contract)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowJsonModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 bg-slate-900 text-emerald-400 font-mono text-[11px] leading-relaxed">
              <pre>{JSON.stringify(trainingRequest, null, 2)}</pre>
            </div>
            <div className="p-3 bg-surface-subtle border-t border-surface-border flex justify-end">
              <button
                type="button"
                onClick={() => setShowJsonModal(false)}
                className="px-3 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
