import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  History,
  ShieldCheck,
  StopCircle,
  Info,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

import {
  useProject,
  useWorkflow,
  useDataset,
  useTraining,
  useModel,
} from '@/context/ProjectContext';
import { useModelEngineHealth } from '@/hooks/useModelEngineHealth';

export const TrainPage: React.FC = () => {
  const navigate = useNavigate();
  const { project } = useProject();
  const { workflow, validation } = useWorkflow();
  const { classes, images, quality, validation: datasetValidation } = useDataset();
  const {
    trainingConfig,
    selectedWorkflowModel,
    activeJob,
    isTraining,
    trainingError,
    startTrainingJob,
    cancelTrainingJob,
    trainingHistory,
  } = useTraining();
  const { activeModel } = useModel();
  const { isOnline } = useModelEngineHealth();

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Trainability check
  const isModelTrainable = selectedWorkflowModel.trainable;

  // Verification checks for training readiness
  const missingRequirements: string[] = [];
  if (!project.safetyProblem || project.safetyProblem.trim().length === 0) {
    missingRequirements.push('Safety problem is not defined');
  }
  if (!validation.isValid) {
    missingRequirements.push('Workflow graph is incomplete or invalid (visit /build)');
  }
  if (classes.length < 2) {
    missingRequirements.push('At least two safety classes are required');
  }
  classes.forEach((cls) => {
    if (cls.count < 10) {
      missingRequirements.push(`${cls.name} class has insufficient examples (${cls.count}/10)`);
    }
  });
  if (!isOnline) {
    missingRequirements.push('Model Engine connection required (service is offline)');
  }

  const isReadyToTrain = missingRequirements.length === 0 && isModelTrainable;

  return (
    <div className="space-y-6">
      <PageHeader
        stepNumber="03"
        title="TRAIN YOUR AI"
        subtitle="Turn your safety dataset into a trained model."
        badge={<Badge variant="accent">MODULE 03</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/teach')}
            >
              Back to Teach
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/test')}
              disabled={!activeModel && isModelTrainable}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Next: Test AI
            </Button>
          </div>
        }
      />

      {/* Non-Trainable Pretrained Capability Banner */}
      {!isModelTrainable && (
        <div className="p-4 rounded-xl border border-sky-300 bg-sky-50 text-sky-950 flex items-start gap-3 shadow-subtle font-mono">
          <Info className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-sky-900">
              THIS AI DOES NOT REQUIRE CUSTOM TRAINING
            </h4>
            <p className="text-xs text-sky-800 leading-relaxed font-sans">
              This safety capability uses a pretrained model ({selectedWorkflowModel.modelName || selectedWorkflowModel.modelId}) and configured safety logic. Custom participant dataset training is not required for this task.
            </p>
            <div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/test')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                PROCEED TO TEST YOUR AI
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Project & Workflow Summary */}
        <Card className="border border-surface-border bg-white shadow-subtle">
          <CardHeader className="p-4 pb-2 bg-surface-subtle border-b border-surface-border">
            <CardTitle className="text-xs font-mono uppercase text-slate-700">
              Project & Workflow
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Project:</span>
              <span className="font-bold text-slate-800">{project.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Safety Problem:</span>
              <span className="text-slate-700 truncate block">{project.safetyProblem}</span>
            </div>
            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">
                Nodes: {workflow.nodes.length} | Edges: {workflow.connections.length}
              </span>
              {validation.isValid ? (
                <Badge variant="accent" size="sm">✓ Valid</Badge>
              ) : (
                <Badge variant="neutral" size="sm" className="bg-amber-100 text-amber-800">⚠ Incomplete</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dataset Summary */}
        <Card className="border border-surface-border bg-white shadow-subtle">
          <CardHeader className="p-4 pb-2 bg-surface-subtle border-b border-surface-border">
            <CardTitle className="text-xs font-mono uppercase text-slate-700">
              Dataset Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Classes:</span>
              <span className="font-bold text-slate-800">
                {classes.map((c) => c.name).join(' • ')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Total Samples:</span>
              <span className="font-bold text-slate-800">{images.length} images</span>
            </div>
            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Repo 2 Check:</span>
              <span className={datasetValidation?.valid ? 'text-emerald-700 font-bold' : quality.isBalanced ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                {datasetValidation?.valid ? '✓ Verified' : quality.isBalanced ? '✓ Balanced' : '⚠ Imbalance'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Training Config & Engine Status */}
        <Card className="border border-surface-border bg-white shadow-subtle">
          <CardHeader className="p-4 pb-2 bg-surface-subtle border-b border-surface-border">
            <CardTitle className="text-xs font-mono uppercase text-slate-700">
              Compute & Engine Target
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Model Architecture:</span>
              <span className="font-bold text-brand-primary">
                {selectedWorkflowModel.modelName || 'YOLO26n'} ({selectedWorkflowModel.modelId || 'ppe-workshop-v1'})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Training Profile:</span>
              <span className="text-slate-700">
                workshop_cpu (CPU) • {trainingConfig.epochs} epochs
              </span>
            </div>
            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Model Engine:</span>
              <span className={isOnline ? 'text-emerald-700 font-bold' : 'text-slate-500 font-bold'}>
                {isOnline ? '● CONNECTED' : '○ OFFLINE'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Action Area */}
      <Card className="border border-surface-border bg-white shadow-subtle">
        <CardContent className="p-6 space-y-5">
          {/* Missing Requirements Warnings */}
          {!isReadyToTrain && isModelTrainable && (
            <div className="p-3.5 rounded-lg border border-amber-300 bg-amber-50/80 text-amber-900 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-[11px] font-mono">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>TRAINING NOT READY</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-1 font-mono text-[11px]">
                {missingRequirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Active Job Progress View */}
          {isTraining && activeJob && (
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-brand-primary">
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>TRAINING YOUR AI IN PROGRESS</span>
                </div>
                <span className="text-slate-600">
                  Status: <strong className="capitalize">{activeJob.status}</strong>
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span>
                    Epoch: {activeJob.epoch || 0} / {activeJob.totalEpochs || trainingConfig.epochs}
                  </span>
                  <span>{activeJob.progress || 0}%</span>
                </div>
                <div className="w-full bg-emerald-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-brand-primary h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(5, activeJob.progress || 0)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">Job ID: {activeJob.jobId}</span>
                <button
                  type="button"
                  onClick={cancelTrainingJob}
                  className="flex items-center gap-1 text-[11px] text-rose-700 hover:text-rose-900 font-semibold"
                >
                  <StopCircle className="w-3.5 h-3.5" />
                  <span>Cancel Job</span>
                </button>
              </div>
            </div>
          )}

          {/* Active Trained Model Success View */}
          {activeModel && !isTraining && (
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-brand-primary font-bold text-xs font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>YOUR AI HAS LEARNED — MODEL READY</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  Model ID: <strong>{activeModel.modelId}</strong>
                </span>
              </div>

              {/* Real Metrics Display */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-2.5 rounded bg-white border border-emerald-200 text-center">
                  <span className="text-[10px] text-slate-500 block">Precision</span>
                  <strong className="text-sm text-brand-primary block">
                    {activeModel.metrics?.precision !== undefined
                      ? `${Math.round(activeModel.metrics.precision * 100)}%`
                      : 'Not available'}
                  </strong>
                </div>
                <div className="p-2.5 rounded bg-white border border-emerald-200 text-center">
                  <span className="text-[10px] text-slate-500 block">Recall</span>
                  <strong className="text-sm text-brand-primary block">
                    {activeModel.metrics?.recall !== undefined
                      ? `${Math.round(activeModel.metrics.recall * 100)}%`
                      : 'Not available'}
                  </strong>
                </div>
                <div className="p-2.5 rounded bg-white border border-emerald-200 text-center">
                  <span className="text-[10px] text-slate-500 block">mAP50</span>
                  <strong className="text-sm text-brand-primary block">
                    {activeModel.metrics?.map50 !== undefined
                      ? `${Math.round(activeModel.metrics.map50 * 100)}%`
                      : 'Not available'}
                  </strong>
                </div>
                <div className="p-2.5 rounded bg-white border border-emerald-200 text-center">
                  <span className="text-[10px] text-slate-500 block">mAP50-95</span>
                  <strong className="text-sm text-brand-primary block">
                    {activeModel.metrics?.map50_95 !== undefined
                      ? `${Math.round(activeModel.metrics.map50_95 * 100)}%`
                      : 'Not available'}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {trainingError && (
            <div className="p-3 rounded-lg border border-rose-300 bg-rose-50 text-rose-900 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{trainingError}</span>
            </div>
          )}

          {/* Educational Note */}
          <p className="text-[11px] text-slate-500 text-center">
            Training teaches the model patterns from your dataset.
          </p>

          {/* Dispatch Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-surface-border">
            <span className="text-xs text-slate-500 font-mono">
              Profile: workshop_cpu • {trainingConfig.epochs} epochs
            </span>

            <div className="flex items-center gap-2">
              {isModelTrainable && (
                <Button
                  variant="primary"
                  size="md"
                  disabled={isTraining || !isReadyToTrain}
                  onClick={() => setShowConfirmModal(true)}
                  leftIcon={<Play className="w-4 h-4" />}
                >
                  {activeModel ? 'RETRAIN MY AI' : 'TRAIN MY AI'}
                </Button>
              )}

              {(activeModel || !isModelTrainable) && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigate('/test')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  TEST MY AI
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pre-Training Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-surface-border max-w-md w-full p-6 space-y-4 font-mono">
            <div className="flex items-center gap-2 text-brand-primary font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-brand-primary" />
              <span>READY TO TRAIN?</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Model:</span>
                <span className="font-bold text-slate-800">{selectedWorkflowModel.modelName || 'PPE Detection'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dataset:</span>
                <span className="font-bold text-slate-800">{images.length} examples</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Classes:</span>
                <span className="font-bold text-slate-800">{classes.length} classes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Training:</span>
                <span className="font-bold text-slate-800">{trainingConfig.epochs} epochs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Device:</span>
                <span className="font-bold text-brand-primary">CPU (workshop_cpu)</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-3 py-1.5 rounded border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                GO BACK
              </button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setShowConfirmModal(false);
                  startTrainingJob();
                }}
              >
                START TRAINING
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Training History Card */}
      {trainingHistory.length > 0 && (
        <Card className="border border-surface-border bg-white shadow-subtle">
          <CardHeader className="p-4 pb-2 bg-surface-subtle border-b border-surface-border flex items-center gap-2">
            <History className="w-4 h-4 text-brand-primary" />
            <CardTitle className="text-xs font-mono uppercase">
              Training Run History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {trainingHistory.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded border border-surface-border bg-slate-50 text-xs font-mono"
              >
                <div>
                  <span className="font-bold text-slate-800">
                    Run #{trainingHistory.length - idx}: {item.modelName}
                  </span>
                  <span className="text-slate-400 block text-[10px]">
                    Model ID: {item.modelId} • {new Date(item.trainedAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  {item.metrics?.map50 !== undefined && (
                    <span className="text-emerald-700 font-bold">
                      mAP: {Math.round(item.metrics.map50 * 100)}%
                    </span>
                  )}
                  <Badge variant="accent" size="sm">Completed</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Non-intrusive safety statement */}
      <div className="p-3 rounded-lg border border-surface-border bg-surface-subtle text-surface-foreground-subtle text-[10px] flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
        <span>
          Workshop model only. Do not use this training model as a production safety control without formal validation.
        </span>
      </div>
    </div>
  );
};
