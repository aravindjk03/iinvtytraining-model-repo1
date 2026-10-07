import React, { useRef, useState } from 'react';
import { UploadCloud, Camera, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ImageUploaderProps {
  selectedClassName: string;
  onAddImages: (files: Array<{ filename: string; dataUrl: string; size: number; mimeType: string }>) => void;
  onOpenCamera: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  selectedClassName,
  onAddImages,
  onOpenCamera,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const processFiles = async (fileList: FileList | File[]) => {
    setErrorMessage(null);
    const files = Array.from(fileList);
    if (files.length === 0) return;

    // Filter and validate formats
    const validFiles: File[] = [];
    for (const f of files) {
      if (!allowedMimeTypes.includes(f.type.toLowerCase()) && !/\.(jpe?g|png|webp)$/i.test(f.name)) {
        setErrorMessage('Unsupported file type. Please use JPG, PNG, or WEBP.');
        return;
      }
      if (f.size > 15 * 1024 * 1024) {
        setErrorMessage(`File "${f.name}" exceeds the 15 MB maximum size limit.`);
        return;
      }
      validFiles.push(f);
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: validFiles.length });

    const processedResults: Array<{ filename: string; dataUrl: string; size: number; mimeType: string }> = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        processedResults.push({
          filename: file.name,
          dataUrl,
          size: file.size,
          mimeType: file.type || 'image/jpeg',
        });
      } catch {
        // ignore single read failure
      }

      setProgress({ current: i + 1, total: validFiles.length });
    }

    onAddImages(processedResults);
    setIsProcessing(false);
    setProgress(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      void processFiles(e.target.files);
    }
    // reset input value so re-selecting same file triggers change
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      void processFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="p-6 rounded-lg border-2 border-dashed border-slate-300 hover:border-brand-primary/70 bg-slate-50/60 hover:bg-emerald-50/20 transition-all text-center flex flex-col items-center justify-center cursor-pointer select-none"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-10 h-10 rounded-full bg-emerald-50 text-brand-primary flex items-center justify-center mb-2 border border-emerald-200">
          <UploadCloud className="w-5 h-5" />
        </div>

        <p className="text-xs font-bold text-surface-foreground">
          Upload images for class: <span className="text-brand-primary uppercase">[{selectedClassName}]</span>
        </p>
        <p className="text-[11px] text-surface-foreground-muted mt-0.5">
          Drag & drop JPG, PNG, or WEBP photos here, or click to browse files
        </p>

        {/* Buttons Row */}
        <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
          >
            Select Image Files
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenCamera}
            leftIcon={<Camera className="w-3.5 h-3.5" />}
          >
            Capture From Camera
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      {isProcessing && progress && (
        <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/70 text-xs text-brand-primary font-mono space-y-1.5 animate-pulse">
          <div className="flex justify-between items-center text-[11px]">
            <span>Adding images to training batch...</span>
            <span className="font-bold">
              {progress.current} / {progress.total}
            </span>
          </div>
          <div className="w-full bg-emerald-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-brand-primary h-1.5 transition-all duration-200"
              style={{
                width: `${Math.round((progress.current / progress.total) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-2.5 rounded border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
