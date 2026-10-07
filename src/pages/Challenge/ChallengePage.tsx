import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Sun,
  CloudFog,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  ArrowRight,
  PlusCircle,
  UploadCloud,
  Camera,
  History,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

import { useModel, useChallenge, useDataset } from '@/context/ProjectContext';
import { CameraCaptureModal } from '@/components/dataset/CameraCaptureModal';
import type { StressCategory, ChallengeRunItem } from '@/types/challenge';

export const ChallengePage: React.FC = () => {
  const navigate = useNavigate();
  const { activeModel } = useModel();
  const { classes } = useDataset();
  const {
    history,
    stats,
    runChallengeTest,
    addFailedExampleToDataset,
    clearHistory,
  } = useChallenge();

  const [selectedCategory, setSelectedCategory] = useState<StressCategory>('low_light');
  const [expectedClass, setExpectedClass] = useState<string>('No Helmet');
  const [testCaseName, setTestCaseName] = useState<string>('Dim Warehouse Corner');
  const [challengeImage, setChallengeImage] = useState<string | null>(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [latestResult, setLatestResult] = useState<ChallengeRunItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const predefinedScenarios: Array<{
    category: StressCategory;
    name: string;
    description: string;
    icon: React.ElementType;
    defaultExpected: string;
  }> = [
    {
      category: 'low_light',
      name: 'Shadowed Boiler Room',
      description: 'Dim illumination causing dark shadows on worker heads.',
      icon: CloudFog,
      defaultExpected: 'No Helmet',
    },
    {
      category: 'glare_reflection',
      name: 'Weld Flash Reflection',
      description: 'High-intensity optical flare masking true helmet color.',
      icon: Sun,
      defaultExpected: 'No Helmet',
    },
    {
      category: 'occlusion',
      name: 'Partial Scaffolding Pillar',
      description: 'Worker head 50% obstructed by structural beam.',
      icon: AlertTriangle,
      defaultExpected: 'Helmet',
    },
    {
      category: 'motion_blur',
      name: 'Rapid Transit Forklift',
      description: 'Camera vibration causing linear motion smearing.',
      icon: Zap,
      defaultExpected: 'No Helmet',
    },
  ];

  const handleSelectScenario = (sc: typeof predefinedScenarios[0]) => {
    setSelectedCategory(sc.category);
    setTestCaseName(sc.name);
    setExpectedClass(sc.defaultExpected);
    setLatestResult(null);
    setErrorMessage(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.type.toLowerCase()) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      setErrorMessage('Unsupported file type. Please use JPG, PNG, or WEBP.');
      e.target.value = '';
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage(`File "${file.name}" exceeds the 15 MB maximum size limit.`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setChallengeImage(reader.result as string);
      setLatestResult(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRunChallenge = async () => {
    setIsEvaluating(true);
    setErrorMessage(null);
    try {
      const result = await runChallengeTest({
        testCaseName,
        category: selectedCategory,
        expectedClass,
        image: challengeImage || 'sample-challenge-frame',
      });
      setLatestResult(result);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Stress test execution failed.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleAddWeaknessToDataset = (item: ChallengeRunItem) => {
    addFailedExampleToDataset(item);
    navigate('/teach');
  };

  // If no model trained
  if (!activeModel) {
    return (
      <div className="space-y-6">
        <PageHeader
          stepNumber="05"
          title="BREAK YOUR AI"
          subtitle="Try to find situations where your model does not perform reliably."
          badge={<Badge variant="neutral">MODULE 05</Badge>}
        />
        <div className="min-h-[380px] rounded-xl border border-dashed border-surface-border bg-white p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-800">
              Train a Model Before Starting the Challenge
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              You must train and evaluate a model before subjecting it to adversarial stress tests.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/train')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Go to Train Module
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      <PageHeader
        stepNumber="05"
        title="BREAK YOUR AI"
        subtitle="Try to find situations where your model does not perform reliably."
        badge={<Badge variant="primary">ADVERSARIAL SUITE</Badge>}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/teach')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Loop: Improve Dataset
          </Button>
        }
      />

      {errorMessage && (
        <div className="p-3 rounded-lg border border-rose-300 bg-rose-50 text-rose-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Session Score Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-3.5 rounded-lg border border-surface-border bg-white shadow-subtle text-center">
          <span className="text-[10px] text-slate-400 uppercase block">Total Stress Tests</span>
          <strong className="text-xl text-slate-900 block mt-1">{stats.totalRuns}</strong>
        </div>

        <div className="p-3.5 rounded-lg border border-surface-border bg-white shadow-subtle text-center">
          <span className="text-[10px] text-slate-400 uppercase block">Correct Predictions</span>
          <strong className="text-xl text-emerald-700 block mt-1">{stats.correctCount}</strong>
        </div>

        <div className="p-3.5 rounded-lg border border-surface-border bg-white shadow-subtle text-center">
          <span className="text-[10px] text-slate-400 uppercase block">Model Failures</span>
          <strong className="text-xl text-amber-700 block mt-1">{stats.failedCount}</strong>
        </div>

        <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/70 shadow-subtle text-center text-rose-900">
          <span className="text-[10px] uppercase font-bold block">Critical Misses</span>
          <strong className="text-xl text-rose-700 block mt-1">{stats.criticalMisses}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Challenge Configuration & Test Runner */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-surface-border bg-white shadow-subtle">
            <CardHeader className="p-4 pb-2 bg-surface-subtle border-b border-surface-border">
              <CardTitle className="text-xs font-mono uppercase text-slate-700">
                1. Select Adversarial Plant Condition
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {predefinedScenarios.map((sc) => {
                  const Icon = sc.icon;
                  const isSelected = selectedCategory === sc.category;

                  return (
                    <div
                      key={sc.category}
                      onClick={() => handleSelectScenario(sc)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-brand-primary bg-emerald-50/30 ring-2 ring-brand-primary/20'
                          : 'border-surface-border bg-slate-50 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-brand-primary" />
                        <span className="font-bold text-xs text-slate-800">{sc.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">{sc.description}</p>
                    </div>
                  );
                })}
              </div>

              {/* Expected Class & Custom Input */}
              <div className="pt-2 border-t border-surface-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Ground Truth (Expected Outcome)
                  </label>
                  <select
                    value={expectedClass}
                    onChange={(e) => setExpectedClass(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-surface-border text-xs focus:ring-1 focus:ring-brand-primary bg-white"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.name}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Input Frame Source
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{challengeImage ? 'Photo Loaded' : 'Upload File'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Camera</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Trigger Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  disabled={isEvaluating}
                  onClick={handleRunChallenge}
                  leftIcon={<Play className="w-4 h-4" />}
                >
                  {isEvaluating ? 'Challenging Model...' : 'Execute Stress Test'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Result Card */}
          {latestResult && (
            <Card
              className={`border shadow-subtle ${
                latestResult.result === 'CORRECT'
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : latestResult.isFalseNegative
                  ? 'border-rose-400 bg-rose-50/80'
                  : 'border-amber-300 bg-amber-50/50'
              }`}
            >
              <CardContent className="p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {latestResult.result === 'CORRECT' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                    <span className="font-bold text-sm tracking-tight text-slate-800">
                      {latestResult.result === 'CORRECT'
                        ? '✓ MODEL PASSED STRESS TEST'
                        : '✕ MODEL FAILED STRESS TEST'}
                    </span>
                  </div>

                  {latestResult.isFalseNegative && (
                    <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold tracking-wider">
                      ⚠ CRITICAL FALSE NEGATIVE
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded bg-white/80 border border-surface-border">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Expected Ground Truth:</span>
                    <strong className="text-slate-800 text-sm">{latestResult.expectedClass}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Actual Model Prediction:</span>
                    <strong className="text-slate-800 text-sm">
                      {latestResult.predictedClass} ({Math.round(latestResult.confidence * 100)}%)
                    </strong>
                  </div>
                </div>

                {latestResult.result === 'FAILED' && (
                  <div className="p-3 rounded-lg border border-rose-300 bg-white space-y-2">
                    <span className="font-bold text-rose-900 block text-[11px] uppercase">
                      MODEL WEAKNESS IDENTIFIED:
                    </span>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      {latestResult.weaknessIdentified}
                    </p>
                    <div className="pt-2 flex justify-end">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAddWeaknessToDataset(latestResult)}
                        leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
                      >
                        ADD THIS EXAMPLE TO DATASET
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Col: Stress History & Educational Note */}
        <div className="space-y-4">
          <Card className="border border-surface-border bg-white shadow-subtle">
            <CardHeader className="p-4 pb-2 bg-surface-subtle border-b border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-brand-primary" />
                <CardTitle className="text-xs font-mono uppercase">
                  Challenge Log
                </CardTitle>
              </div>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-[10px] text-slate-400 hover:text-slate-600"
                >
                  Clear Log
                </button>
              )}
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {history.length === 0 ? (
                <p className="text-center py-6 text-slate-400 text-xs">
                  No stress tests recorded this session.
                </p>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded border border-surface-border bg-slate-50 text-xs font-mono flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 block truncate max-w-[150px]">
                        {item.testCaseName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Exp: {item.expectedClass} • Pred: {item.predictedClass}
                      </span>
                    </div>
                    {item.result === 'CORRECT' ? (
                      <Badge variant="accent" size="sm">✓ Correct</Badge>
                    ) : (
                      <Badge variant="neutral" size="sm" className="bg-rose-100 text-rose-800 border-rose-300">
                        ✕ Miss
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Educational Note */}
          <div className="p-3 rounded-lg border border-surface-border bg-surface-subtle text-surface-foreground-subtle text-[10px] leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Model Fragility Principle:</strong> A model can perform well on familiar examples and still fail in new conditions. Adding failed edge cases back into your dataset is the core of AI improvement.
            </span>
          </div>

          <div className="p-3 rounded-lg border border-surface-border bg-white text-[10px] text-slate-500 font-mono">
            Metric standard: <strong>Workshop challenge performance</strong> (Not an OSHA safety certification).
          </div>
        </div>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        classNameLabel="Challenge Test"
        onClose={() => setIsCameraOpen(false)}
        onCaptureImage={(dataUrl) => {
          setChallengeImage(dataUrl);
          setLatestResult(null);
        }}
      />
    </div>
  );
};
