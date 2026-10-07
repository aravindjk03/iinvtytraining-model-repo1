import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface CameraCaptureModalProps {
  isOpen: boolean;
  classNameLabel: string;
  onClose: () => void;
  onCaptureImage: (dataUrl: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  classNameLabel,
  onClose,
  onCaptureImage,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize camera when opened
  useEffect(() => {
    if (!isOpen) {
      // Cleanup stream when closed
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      setCapturedDataUrl(null);
      setErrorStatus(null);
      return;
    }

    let activeStream: MediaStream | null = null;
    setIsInitializing(true);
    setErrorStatus(null);

    async function initCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setErrorStatus('Camera access is not supported by your current browser.');
          setIsInitializing(false);
          return;
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false,
        });

        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }
      } catch (err: unknown) {
        const errObj = err as { name?: string; message?: string };
        if (errObj.name === 'NotAllowedError' || errObj.name === 'PermissionDeniedError') {
          setErrorStatus('Camera permission was denied. Please allow camera access in browser settings.');
        } else if (errObj.name === 'NotFoundError' || errObj.name === 'DevicesNotFoundError') {
          setErrorStatus('No video camera device was detected on your computer.');
        } else if (errObj.name === 'NotReadableError' || errObj.name === 'TrackStartError') {
          setErrorStatus('Camera is currently in use by another application or tab.');
        } else {
          setErrorStatus('Unable to access camera feed. Please check video hardware permissions.');
        }
      } finally {
        setIsInitializing(false);
      }
    }

    void initCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedDataUrl(dataUrl);
    }
  };

  const handleRetake = () => {
    setCapturedDataUrl(null);
  };

  const handleUseImage = () => {
    if (capturedDataUrl) {
      onCaptureImage(capturedDataUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-xl shadow-2xl border border-surface-border max-w-lg w-full overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-3.5 border-b border-surface-border bg-surface-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-emerald-50 text-brand-primary border border-emerald-200">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-surface-foreground uppercase font-mono">
                Capture Safety Example
              </h3>
              <p className="text-[10px] text-surface-foreground-muted">
                Class: <strong className="text-brand-primary uppercase">[{classNameLabel}]</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="relative aspect-4/3 bg-slate-900 flex items-center justify-center overflow-hidden">
          {errorStatus ? (
            <div className="p-6 text-center text-slate-300 max-w-sm space-y-2">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-rose-200">{errorStatus}</p>
              <p className="text-[10px] text-slate-400">
                You can alternatively upload image files directly from your computer.
              </p>
            </div>
          ) : isInitializing ? (
            <div className="text-center text-slate-400 text-xs flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Connecting to camera hardware...</span>
            </div>
          ) : capturedDataUrl ? (
            <img
              src={capturedDataUrl}
              alt="Captured frame"
              className="w-full h-full object-contain"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

          {/* Hidden Canvas for Drawing Snapshots */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Modal Footer Controls */}
        <div className="p-3 bg-surface-subtle border-t border-surface-border flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200"
          >
            Cancel
          </button>

          {!errorStatus && (
            <div className="flex items-center gap-2">
              {capturedDataUrl ? (
                <>
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleUseImage}
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                  >
                    Use Image
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isInitializing}
                  onClick={handleCapture}
                  leftIcon={<Camera className="w-3.5 h-3.5" />}
                >
                  Capture Frame
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
