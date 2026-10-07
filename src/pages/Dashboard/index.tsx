import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Workflow,
  FolderKanban,
  Cpu,
  CheckCircle2,
  ShieldAlert,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Server,
  Layers,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG, WORKFLOW_CARDS } from '@/config/constants';
import { env } from '@/config/env';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const getWorkflowIcon = (step: string) => {
    switch (step) {
      case '01':
        return <Workflow className="w-5 h-5 text-brand-primary" />;
      case '02':
        return <FolderKanban className="w-5 h-5 text-brand-primary" />;
      case '03':
        return <Cpu className="w-5 h-5 text-brand-primary" />;
      case '04':
        return <CheckCircle2 className="w-5 h-5 text-brand-primary" />;
      case '05':
        return <ShieldAlert className="w-5 h-5 text-brand-primary" />;
      case '06':
        return <RefreshCw className="w-5 h-5 text-brand-primary" />;
      default:
        return <Layers className="w-5 h-5 text-brand-primary" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Training Operations Dashboard"
        subtitle="Manage and advance through the industrial AI safety training lifecycle."
        badge={<Badge variant="brand">PHASE 1 FOUNDATION</Badge>}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/build')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Start Workflow
          </Button>
        }
      />

      {/* Prominent Philosophy & Platform Banner */}
      <div className="rounded-lg bg-brand-primary text-white p-6 sm:p-8 shadow-card relative overflow-hidden">
        {/* Subtle background industrial pattern hint */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center pointer-events-none">
          <ShieldCheck className="w-64 h-64 -mr-16 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-white/10 text-brand-accent text-xs font-mono tracking-wider font-semibold">
            <span>METHODOLOGY SPECIFICATION</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
            {APP_CONFIG.name}
          </h2>

          <p className="text-sm sm:text-base font-mono tracking-widest text-emerald-100 font-semibold uppercase">
            {APP_CONFIG.philosophyBullets}
          </p>

          <p className="text-xs sm:text-sm text-emerald-50/90 leading-relaxed pt-1 max-w-2xl">
            A structured framework for industrial safety practitioners to design, instruct, evaluate,
            and harden visual artificial intelligence systems prior to shop-floor deployment.
          </p>
        </div>
      </div>

      {/* Main Grid: Workflow Progression (Left 2 cols) & Project Status (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow Cards Section (Spans 2 columns on large screens) */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeader
            title="Training Lifecycle Pipeline"
            description="Interactive modules for building and validating your safety AI system."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WORKFLOW_CARDS.map((card) => (
              <Card
                key={card.step}
                interactive={true}
                onClick={() => navigate(card.route)}
                className="group flex flex-col justify-between"
              >
                <CardContent className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-md bg-brand-primary-light flex items-center justify-center">
                        {getWorkflowIcon(card.step)}
                      </div>
                      <span className="font-mono text-xs font-bold text-surface-foreground-subtle group-hover:text-brand-primary transition-colors">
                        {card.step}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-surface-foreground tracking-tight group-hover:text-brand-primary transition-colors">
                      {card.step} {card.title}
                    </h3>

                    <p className="text-xs text-surface-foreground-subtle mt-1.5 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between">
                    <span className="text-[11px] font-medium text-surface-foreground-subtle">
                      {card.badgeText}
                    </span>
                    <span className="text-xs font-medium text-brand-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Open Module
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Status & Engine Specifications (Spans 1 column) */}
        <div className="space-y-6">
          {/* Project Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">PROJECT STATUS</CardTitle>
                <Badge variant="neutral" size="sm">Active Spec</Badge>
              </div>
              <CardDescription>
                Current initialization state across training modules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div className="flex items-center justify-between text-xs py-1 border-b border-surface-border">
                <span className="text-surface-foreground-muted font-medium">Workflow:</span>
                <StatusBadge status="not_started" label="Not started" />
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-surface-border">
                <span className="text-surface-foreground-muted font-medium">Dataset:</span>
                <StatusBadge status="not_created" label="Not created" />
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-surface-border">
                <span className="text-surface-foreground-muted font-medium">Model:</span>
                <StatusBadge status="not_trained" label="Not trained" />
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-surface-border">
                <span className="text-surface-foreground-muted font-medium">Testing:</span>
                <StatusBadge status="not_started" label="Not started" />
              </div>

              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-surface-foreground-muted font-medium">Challenge:</span>
                <StatusBadge status="not_started" label="Not started" />
              </div>
            </CardContent>
          </Card>

          {/* Model Engine Integration Specification Card */}
          <Card className="bg-surface-subtle">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-brand-primary" />
                <CardTitle className="text-sm">MODEL ENGINE SPECIFICATION</CardTitle>
              </div>
              <CardDescription>
                Decoupled backend integration contract
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-2.5 rounded bg-white border border-surface-border font-mono text-[11px] text-surface-foreground-muted space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">API Endpoint:</span>
                  <span className="text-slate-800 font-semibold">{env.modelApiUrl}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Architecture:</span>
                  <span className="text-slate-800">REST Client Abstraction</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Engine Repo:</span>
                  <span className="text-slate-800">Standalone (Separate)</span>
                </div>
              </div>

              <p className="text-[11px] text-surface-foreground-subtle leading-relaxed">
                Phase 1 builds the strict frontend foundation. Model Engine training and inference
                will bind via typed REST adapters in Phase 2.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
