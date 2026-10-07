import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

import {
  useProject,
  useDataset,
  useTraining,
} from '@/context/ProjectContext';
import {
  ProjectInfoCard,
  DatasetClassList,
  ImageUploader,
  CameraCaptureModal,
  ImageGrid,
  DatasetQuality,
  DatasetEducationalPanel,
  TrainingConfigCard,
  DatasetReadiness,
} from '@/components/dataset';

export const TeachPage: React.FC = () => {
  const navigate = useNavigate();
  const { project, updateProject } = useProject();
  const {
    classes,
    images,
    quality,
    addClass,
    renameClass,
    removeClass,
    addImage,
    removeImage,
    resetDataset,
  } = useDataset();

  const { trainingConfig, updateTrainingConfig, trainingRequest } = useTraining();

  const [selectedClassId, setSelectedClassId] = useState<string | null>(
    classes.length > 0 ? classes[0].id : null
  );
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  const handleAddBatchImages = (
    fileItems: Array<{ filename: string; dataUrl: string; size: number; mimeType: string }>
  ) => {
    if (!activeClass) return;
    fileItems.forEach((f) => {
      addImage(activeClass.id, f.filename, f.dataUrl, f.size, f.mimeType);
    });
  };

  const handleCaptureCamera = (dataUrl: string) => {
    if (!activeClass) return;
    const filename = `camera_capture_${Date.now().toString(36)}.jpg`;
    addImage(activeClass.id, filename, dataUrl, 52000, 'image/jpeg');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        stepNumber="02"
        title="TEACH YOUR AI"
        subtitle="Give your AI examples so it can learn the safety condition you want it to recognize."
        badge={<Badge variant="accent">MODULE 02</Badge>}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/train')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Next: Train Module
          </Button>
        }
      />

      {/* 1. Project Definition */}
      <ProjectInfoCard project={project} onUpdateProject={updateProject} />

      {/* 2. Dataset Classes Management */}
      <DatasetClassList
        classes={classes}
        selectedClassId={selectedClassId || (classes[0]?.id ?? null)}
        onSelectClass={setSelectedClassId}
        onAddClass={addClass}
        onRenameClass={renameClass}
        onRemoveClass={removeClass}
        onOpenUpload={(classId) => {
          setSelectedClassId(classId);
        }}
      />

      {/* 3. Image Examples Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Uploader & Gallery */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-xl border border-surface-border bg-white shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-border">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase text-slate-800">
                  Examples: {activeClass?.name || 'Class Examples'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Add photos representing positive or negative safety instances
                </p>
              </div>

              {/* Class Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {classes.map((cls) => (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all shrink-0 ${
                      (selectedClassId || classes[0]?.id) === cls.id
                        ? 'bg-brand-primary text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cls.name} ({cls.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Uploader Box */}
            <ImageUploader
              selectedClassName={activeClass?.name || 'Selected Class'}
              onAddImages={handleAddBatchImages}
              onOpenCamera={() => setIsCameraOpen(true)}
            />

            {/* Gallery Grid */}
            <ImageGrid
              images={images}
              selectedClassId={selectedClassId || (classes[0]?.id ?? null)}
              onRemoveImage={removeImage}
            />
          </div>
        </div>

        {/* Right Col: Educational Panels */}
        <div className="space-y-4">
          <DatasetEducationalPanel />
        </div>
      </div>

      {/* 4. Dataset Quality Analysis */}
      <DatasetQuality quality={quality} />

      {/* 5. Training Configuration */}
      <TrainingConfigCard
        config={trainingConfig}
        onUpdateConfig={updateTrainingConfig}
      />

      {/* 6. Training Readiness & Actions */}
      <DatasetReadiness
        project={project}
        quality={quality}
        trainingRequest={trainingRequest}
        onResetDataset={resetDataset}
      />

      {/* Camera Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        classNameLabel={activeClass?.name || 'Safety Gear'}
        onClose={() => setIsCameraOpen(false)}
        onCaptureImage={handleCaptureCamera}
      />
    </div>
  );
};
