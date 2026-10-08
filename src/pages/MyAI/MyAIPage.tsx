import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Workflow, FolderKanban, Cpu, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { useProject, useWorkflow, useDataset, useModel, useTraining } from '@/context/ProjectContext';

export const MyAIPage: React.FC = () => {
  const navigate = useNavigate();
  const { project } = useProject();
  const { workflow } = useWorkflow();
  const { classes, images } = useDataset();
  const { activeModel } = useModel();
  const { trainingHistory } = useTraining();

  return (
    <div className="space-y-6">
      <PageHeader
        title="MY AI SAFETY SYSTEM"
        subtitle="Comprehensive verified model and workflow presentation"
        badge={
          <Badge variant="success" size="sm">
            PRESENTATION
          </Badge>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project & Model Summary */}
        <Card className="border-surface-border">
          <CardHeader className="p-5">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-brand-primary" />
              <CardTitle className="text-base">{project?.name || 'Helmet Safety AI'}</CardTitle>
            </div>
            <CardDescription className="text-xs">
              {project?.safetyProblem || 'Worker PPE compliance detection system'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-surface-border">
              <span className="text-slate-500">Active Model:</span>
              <span className="font-bold text-slate-800">{activeModel?.modelId || 'None'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-surface-border">
              <span className="text-slate-500">Training Runs:</span>
              <span className="font-semibold text-slate-700">{trainingHistory.length} run(s)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-surface-border">
              <span className="text-slate-500">Workflow Nodes:</span>
              <span className="font-semibold text-slate-700">{workflow.nodes.length} connected</span>
            </div>
            <div className="flex justify-between py-1.5 text-xs">
              <span className="text-slate-500">Dataset Size:</span>
              <span className="font-semibold text-slate-700">
                {images.length} images ({classes.length} classes)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Phase 18 Presentation Architecture Placeholder */}
        <Card className="border-surface-border bg-slate-50">
          <CardHeader className="p-5">
            <CardTitle className="text-sm font-mono uppercase text-slate-700">
              Executive Presentation View
            </CardTitle>
            <CardDescription className="text-xs">
              Phase 18 will deliver interactive summary cards, exportable project summaries, and presentation mode.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-white border border-slate-200">
                <div className="text-[10px] text-slate-400">WORKFLOW</div>
                <div className="flex items-center gap-1 font-bold text-slate-700 mt-1">
                  <Workflow className="w-3.5 h-3.5 text-brand-primary" />
                  <span>{workflow.nodes.length} Nodes</span>
                </div>
              </div>
              <div className="p-2.5 rounded bg-white border border-slate-200">
                <div className="text-[10px] text-slate-400">CLASSES</div>
                <div className="flex items-center gap-1 font-bold text-slate-700 mt-1">
                  <FolderKanban className="w-3.5 h-3.5 text-brand-primary" />
                  <span>{classes.length} Safety Classes</span>
                </div>
              </div>
              <div className="p-2.5 rounded bg-white border border-slate-200">
                <div className="text-[10px] text-slate-400">COMPUTE</div>
                <div className="flex items-center gap-1 font-bold text-slate-700 mt-1">
                  <Cpu className="w-3.5 h-3.5 text-brand-primary" />
                  <span>{trainingHistory.length} Runs</span>
                </div>
              </div>
              <div className="p-2.5 rounded bg-white border border-slate-200">
                <div className="text-[10px] text-slate-400">VERIFICATION</div>
                <div className="flex items-center gap-1 font-bold text-emerald-700 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Workshop Demo Only</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
