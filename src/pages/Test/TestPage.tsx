import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  UploadCloud,
  Camera,
  Play,
  ArrowRight,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

import { useModel, useDataset, useTesting } from '@/context/ProjectContext';
import { CameraCaptureModal } from '@/components/dataset/CameraCaptureModal';

export const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeModel } = useModel();
  const { images } = useDataset();
  const { runTestInference, isInferring } = useTesting();

  const [testImage, setTestImage] = useState<string | null>(() => {
    return images.length > 0 ? images[0].previewUrl : null;
  });

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [inferenceResult, setInferenceResult] = useState<{
    predictionSummary: string;
    confidence: number;
    safetyDecision: 'SAFE' | 'WARNING' | 'UNSAFE';
    actionTriggered: string;
    explanation: string;
    detections: Array<{
      className: string;
      confidence: number;
      bbox?: { x: number; y: number; width: number; height: number };
    }>;
  } | null>(null);

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
      setTestImage(reader.result as string);
      setInferenceResult(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRunInference = async () => {
    if (!testImage) return;
    setErrorMessage(null);

    try {
      const evalResult = await runTestInference(testImage);
      const dets = evalResult.detections || [];
      const topConfidence = dets[0]?.confidence ?? (evalResult.conditionResult === 'YES' ? 0.94 : 0.88);

      setInferenceResult({
        predictionSummary: evalResult.predictionSummary,
        confidence: topConfidence,
        safetyDecision: evalResult.safetyDecision,
        actionTriggered: evalResult.actionTriggered,
        explanation: evalResult.explanation,
        detections: dets,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Inference evaluation failed.';
      setErrorMessage(msg);
    }
  };

  // If no model has been trained yet
  if (!activeModel) {
    return (
      <div className="space-y-6">
        <PageHeader
          stepNumber="04"
          title="TEST YOUR AI"
          subtitle="See how your trained safety model responds to real examples."
          badge={<Badge variant="neutral">MODULE 04</Badge>}
        />
        <div className="min-h-[380px] rounded-xl border border-dashed border-surface-border bg-white p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-800">
              Train a Model Before Testing
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              You must dispatch and complete a training run in the Train Module before evaluating inference against safety rules.
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
        stepNumber="04"
        title="TEST YOUR AI"
        subtitle="See how your trained safety model responds to real examples."
        badge={<Badge variant="accent">ACTIVE: {activeModel.modelName}</Badge>}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/challenge')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Next: Challenge AI
          </Button>
        }
      />

      {errorMessage && (
        <div className="p-3 rounded-lg border border-rose-300 bg-rose-50 text-rose-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Image Canvas & Detection Visualizer */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-surface-border bg-white shadow-subtle overflow-hidden">
            <CardHeader className="p-4 pb-2 bg-surface-subtle border-b border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-primary" />
                <CardTitle className="text-xs font-mono uppercase">
                  Safety Inspection Viewport
                </CardTitle>
              </div>

              {/* Input Action Controls */}
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
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-[11px] font-semibold text-slate-700"
                >
                  <UploadCloud className="w-3 h-3" />
                  <span>Upload Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-[11px] font-semibold text-slate-700"
                >
                  <Camera className="w-3 h-3" />
                  <span>Camera</span>
                </button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!testImage || isInferring}
                  onClick={handleRunInference}
                  leftIcon={<Play className="w-3.5 h-3.5" />}
                >
                  {isInferring ? 'Processing...' : 'Run Test'}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="relative aspect-16/10 bg-slate-900 flex items-center justify-center overflow-hidden">
                {testImage ? (
                  <div className="relative max-h-full max-w-full">
                    <img
                      src={testImage}
                      alt="Inspection target"
                      className="max-h-[460px] w-auto object-contain mx-auto"
                    />

                    {/* Bounding Box Canvas Overlay */}
                    {inferenceResult?.detections.map((det, idx) => {
                      if (!det.bbox) return null;
                      const { x, y, width, height } = det.bbox;
                      const isViolation = det.className.toLowerCase().includes('no');

                      const isNorm = x <= 1 && y <= 1 && width <= 1 && height <= 1;
                      const baseW = isNorm ? 1 : (x > 320 || width > 320 ? 640 : 320);
                      const baseH = isNorm ? 1 : (y > 240 || height > 240 ? 640 : 240);
                      const leftPct = isNorm ? x * 100 : (x / baseW) * 100;
                      const topPct = isNorm ? y * 100 : (y / baseH) * 100;
                      const widthPct = isNorm ? width * 100 : (width / baseW) * 100;
                      const heightPct = isNorm ? height * 100 : (height / baseH) * 100;

                      return (
                        <div
                          key={idx}
                          className={`absolute border-2 font-mono text-[10px] font-bold ${
                            isViolation
                              ? 'border-rose-500 bg-rose-500/15 text-rose-300'
                              : 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                          }`}
                          style={{
                            left: `${Math.min(100, Math.max(0, leftPct))}%`,
                            top: `${Math.min(100, Math.max(0, topPct))}%`,
                            width: `${Math.min(100, Math.max(0, widthPct))}%`,
                            height: `${Math.min(100, Math.max(0, heightPct))}%`,
                          }}
                        >
                          <span
                            className={`absolute -top-5 left-0 px-1 py-0.5 rounded text-[9px] uppercase ${
                              isViolation ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {det.className} {Math.round(det.confidence * 100)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-slate-500 text-xs font-mono">
                    Select or capture an image to test
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preset Sample Gallery */}
          {images.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">
                Quick Select Workshop Sample:
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.slice(0, 8).map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => {
                      setTestImage(img.previewUrl);
                      setInferenceResult(null);
                    }}
                    className={`w-20 aspect-4/3 rounded border overflow-hidden shrink-0 transition-all ${
                      testImage === img.previewUrl
                        ? 'border-brand-primary ring-2 ring-brand-primary/30'
                        : 'border-surface-border hover:border-slate-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.previewUrl} alt={img.filename} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Prediction vs Safety Decision Separation */}
        <div className="space-y-4">
          <Card className="border border-surface-border bg-white shadow-subtle">
            <CardHeader className="p-4 pb-2 bg-surface-subtle border-b border-surface-border">
              <CardTitle className="text-xs font-mono uppercase text-slate-700">
                Decision vs Prediction Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs font-mono">
              {inferenceResult ? (
                <>
                  {/* Model Prediction */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      1. RAW MODEL PREDICTION
                    </span>
                    <div className="text-sm font-bold text-slate-800">
                      {inferenceResult.predictionSummary}
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Generated by YOLO26n bounding box detector
                    </span>
                  </div>

                  {/* Workflow Decision */}
                  <div
                    className={`p-3 rounded-lg border space-y-1 ${
                      inferenceResult.safetyDecision === 'SAFE'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold opacity-75">
                      2. WORKFLOW SAFETY DECISION
                    </span>
                    <div className="text-lg font-black tracking-wider">
                      {inferenceResult.safetyDecision}
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      {inferenceResult.explanation}
                    </p>
                  </div>

                  {/* Safety Action */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      3. TRIGGERED ACTION
                    </span>
                    <div className="text-xs font-bold text-slate-800">
                      {inferenceResult.actionTriggered}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Click [Run Test] to execute inference and evaluate against configured workflow rules.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Educational Note */}
          <div className="p-3 rounded-lg border border-surface-border bg-surface-subtle text-surface-foreground-subtle text-[10px] leading-relaxed flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
            <span>
              <strong>Testing Principle:</strong> Testing shows how the trained model behaves on examples it receives. Notice how the safety decision is evaluated directly by your workflow.
            </span>
          </div>
        </div>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        classNameLabel="Test Target"
        onClose={() => setIsCameraOpen(false)}
        onCaptureImage={(dataUrl) => {
          setTestImage(dataUrl);
          setInferenceResult(null);
        }}
      />
    </div>
  );
};
