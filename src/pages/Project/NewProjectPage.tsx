import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderPlus, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const NewProjectPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <Card className="border-surface-border">
        <CardHeader className="p-6">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-200 text-brand-primary flex items-center justify-center mb-3">
            <FolderPlus className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl">Create AI Project</CardTitle>
          <CardDescription>
            Configure your safety project name, problem statement, AI goal, and mission.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 uppercase">Phase 2 Module Placeholder</div>
            <p>
              Full multi-field project creation wizard (Project Name, Safety Problem, AI Goal, Mission) will be implemented in Phase 2.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/build')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to 01 Build
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
