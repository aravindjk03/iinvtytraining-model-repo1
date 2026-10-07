import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-xl bg-surface-muted border border-surface-border flex items-center justify-center text-surface-foreground-muted mb-4 shadow-subtle">
        <FileQuestion className="w-8 h-8 text-slate-500" aria-hidden="true" />
      </div>

      <span className="font-mono text-xs font-semibold text-slate-400 tracking-wider uppercase mb-1">
        404 — Route Not Found
      </span>

      <h1 className="text-2xl font-bold text-surface-foreground tracking-tight mb-2">
        Industrial Pipeline Segment Undefined
      </h1>

      <p className="text-xs md:text-sm text-surface-foreground-muted max-w-md leading-relaxed mb-6">
        The route or view you requested does not exist within the AI Safety platform navigation schema.
      </p>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          Go Back
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/')}
          leftIcon={<Home className="w-3.5 h-3.5" />}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};
