import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import type { DatasetImageItem } from '@/types/dataset';

export interface ImageGridProps {
  images: DatasetImageItem[];
  selectedClassId: string | null;
  onRemoveImage: (id: string) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  selectedClassId,
  onRemoveImage,
}) => {
  const filteredImages = selectedClassId
    ? images.filter((img) => img.classId === selectedClassId)
    : images;

  if (filteredImages.length === 0) {
    return (
      <div className="p-8 rounded-lg border border-dashed border-slate-300 text-center text-slate-500 bg-slate-50/40 space-y-2 select-none">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <ImageIcon className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-slate-700">No examples added yet</p>
        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
          Upload plant images or capture from camera to build training data for this safety class.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
        <span>
          Showing <strong>{filteredImages.length}</strong> examples
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {filteredImages.map((img) => (
          <div
            key={img.id}
            className="group relative rounded-lg border border-surface-border bg-white overflow-hidden shadow-xs hover:shadow-subtle transition-all aspect-4/3 flex flex-col"
          >
            {/* Image Preview */}
            <div className="flex-1 w-full h-full relative overflow-hidden bg-slate-100">
              <img
                src={img.previewUrl}
                alt={img.filename}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />

              {/* Class Badge Overlay */}
              <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono font-bold uppercase truncate max-w-[85%]">
                {img.className}
              </div>

              {/* Remove Button Overlay */}
              <button
                type="button"
                onClick={() => onRemoveImage(img.id)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600/90 hover:bg-rose-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                title="Remove image"
                aria-label={`Remove image ${img.filename}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
