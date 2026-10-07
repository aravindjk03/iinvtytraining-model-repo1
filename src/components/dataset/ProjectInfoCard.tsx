import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Shield } from 'lucide-react';
import type { Project } from '@/types/project';

export interface ProjectInfoCardProps {
  project: Project;
  onUpdateProject: (patch: Partial<Project>) => void;
}

export const ProjectInfoCard: React.FC<ProjectInfoCardProps> = ({
  project,
  onUpdateProject,
}) => {
  return (
    <Card className="border border-surface-border bg-white shadow-subtle">
      <CardHeader className="p-4 pb-2 bg-surface-subtle border-b border-surface-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-primary" />
            <CardTitle className="text-xs font-mono uppercase">
              1. Safety Problem Definition
            </CardTitle>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Project Context: {project.id}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={project.name}
              onChange={(e) => onUpdateProject({ name: e.target.value })}
              placeholder="e.g. Helmet Safety Detection"
              className="w-full px-3 py-1.5 rounded border border-surface-border text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Safety Problem To Solve
            </label>
            <input
              type="text"
              value={project.safetyProblem}
              onChange={(e) => onUpdateProject({ safetyProblem: e.target.value })}
              placeholder="e.g. Detect whether workers are wearing helmets."
              className="w-full px-3 py-1.5 rounded border border-surface-border text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Hazard Context & Environment Description (Optional)
          </label>
          <input
            type="text"
            value={project.description || ''}
            onChange={(e) => onUpdateProject({ description: e.target.value })}
            placeholder="e.g. Heavy fabrication bay with overhead gantry cranes requiring hardhat compliance."
            className="w-full px-3 py-1.5 rounded border border-surface-border text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary text-slate-600"
          />
        </div>
      </CardContent>
    </Card>
  );
};
