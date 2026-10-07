import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tag, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import type { DatasetClassItem } from '@/types/dataset';
import { WORKSHOP_MIN_EXAMPLES_PER_CLASS } from '@/services/dataset';

export interface DatasetClassListProps {
  classes: DatasetClassItem[];
  selectedClassId: string | null;
  onSelectClass: (id: string) => void;
  onAddClass: (name: string) => { success: boolean; error?: string };
  onRenameClass: (id: string, newName: string) => { success: boolean; error?: string };
  onRemoveClass: (id: string) => void;
  onOpenUpload: (classId: string) => void;
}

export const DatasetClassList: React.FC<DatasetClassListProps> = ({
  classes,
  selectedClassId,
  onSelectClass,
  onAddClass,
  onRenameClass,
  onRemoveClass,
  onOpenUpload,
}) => {
  const [newClassName, setNewClassName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = onAddClass(newClassName);
    if (res.success) {
      setNewClassName('');
    } else {
      setErrorMessage(res.error || 'Failed to add class.');
    }
  };

  const handleStartRename = (cls: DatasetClassItem) => {
    setEditingClassId(cls.id);
    setEditingName(cls.name);
  };

  const handleSaveRename = (id: string) => {
    const res = onRenameClass(id, editingName);
    if (res.success) {
      setEditingClassId(null);
    }
  };

  return (
    <Card className="border border-surface-border bg-white shadow-subtle">
      <CardHeader className="p-4 pb-2 bg-surface-subtle border-b border-surface-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-brand-primary" />
          <CardTitle className="text-xs font-mono uppercase">
            2. Safety Dataset Classes
          </CardTitle>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          Target labels for detector training
        </span>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Class Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {classes.map((cls) => {
            const isSelected = selectedClassId === cls.id;
            const isReady = cls.count >= WORKSHOP_MIN_EXAMPLES_PER_CLASS;
            const isEditing = editingClassId === cls.id;

            return (
              <div
                key={cls.id}
                onClick={() => onSelectClass(cls.id)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-brand-primary ring-2 ring-brand-primary/20 bg-emerald-50/30 shadow-subtle'
                    : 'border-surface-border bg-surface-subtle/50 hover:border-slate-300 hover:bg-white'
                }`}
              >
                {/* Header row: Class Name or Inline Edit */}
                <div className="flex items-start justify-between gap-1 mb-2">
                  {isEditing ? (
                    <div
                      className="flex items-center gap-1 w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full px-2 py-0.5 text-xs rounded border border-brand-primary"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRename(cls.id)}
                        className="p-1 text-emerald-700 hover:bg-emerald-100 rounded"
                        title="Save rename"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingClassId(null)}
                        className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h4 className="text-xs font-bold text-surface-foreground uppercase tracking-tight truncate max-w-[130px]">
                        {cls.name}
                      </h4>
                      <div
                        className="flex items-center gap-0.5 opacity-60 hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleStartRename(cls)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded"
                          title="Rename class"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        {classes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => onRemoveClass(cls.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Delete class"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Counter & Status */}
                <div className="flex items-baseline justify-between mb-3 font-mono text-[11px]">
                  <span className="text-slate-600">
                    <strong className="text-slate-900 text-sm">{cls.count}</strong> examples
                  </span>
                  {isReady ? (
                    <Badge variant="accent" size="sm">
                      ✓ Ready
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">
                      ⚠ Needs {WORKSHOP_MIN_EXAMPLES_PER_CLASS - cls.count} more
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div
                  className="flex items-center gap-1.5 pt-2 border-t border-surface-border text-[11px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onSelectClass(cls.id)}
                    className="flex-1 py-1 px-2 rounded bg-white hover:bg-slate-100 border border-surface-border text-slate-700 font-medium text-center transition-colors"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenUpload(cls.id)}
                    className="flex-1 py-1 px-2 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-brand-primary font-semibold text-center transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Class Form */}
        <form onSubmit={handleAddSubmit} className="pt-2 border-t border-surface-border">
          <div className="flex items-center gap-2 max-w-md">
            <input
              type="text"
              value={newClassName}
              onChange={(e) => {
                setNewClassName(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="New class name (e.g. Safety Glasses, High-Vis Vest)"
              className="flex-1 px-3 py-1.5 rounded border border-surface-border text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-semibold flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Class</span>
            </button>
          </div>
          {errorMessage && (
            <p className="text-[11px] text-rose-600 font-semibold mt-1.5">
              {errorMessage}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
