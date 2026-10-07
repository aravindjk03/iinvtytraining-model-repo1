import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-14 h-14 rounded-full bg-surface-muted border border-surface-border flex items-center justify-center text-slate-500 mb-4 shadow-subtle">
        <FileQuestion className="w-7 h-7" aria-hidden="true" />
      </div>

      <span className="font-mono text-xs font-bold text-brand-primary uppercase tracking-widest">
        404 — Route Not Found
      </span>

      <h1 className="text-xl sm:text-2xl font-bold text-surface-foreground tracking-tight mt-1 mb-2">
        Industrial Pipeline Segment Undefined
      </h1>

      <p className="text-xs sm:text-sm text-surface-foreground-subtle max-w-md leading-relaxed mb-6">
        The requested training route does not exist in the AI Safety Builder workspace.
        Please return to the main dashboard.
      </p>

      <Button
        variant="primary"
        size="md"
        onClick={() => navigate('/')}
        leftIcon={<Home className="w-4 h-4" />}
      >
        Return to Platform Dashboard
      </Button>
    </div>
  );
};
