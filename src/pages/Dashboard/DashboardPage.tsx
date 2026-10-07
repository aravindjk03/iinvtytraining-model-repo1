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
  Server,
  Layers,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/common/SectionHeader';
import { WORKFLOW_CARDS, APP_CONFIG } from '@/config/constants';
import { env } from '@/config/env';

const stepIcons: Record<string, React.ReactNode> = {
  '01': <Workflow className="w-5 h-5 text-brand-primary" />,
  '02': <FolderKanban className="w-5 h-5 text-brand-primary" />,
  '03': <Cpu className="w-5 h-5 text-brand-primary" />,
  '04': <CheckCircle2 className="w-5 h-5 text-brand-primary" />,
  '05': <ShieldAlert className="w-5 h-5 text-brand-primary" />,
  '06': <RefreshCw className="w-5 h-5 text-brand-primary" />,
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Prominent Philosophy Hero Banner */}
      <section className="bg-white rounded-xl border border-surface-border p-6 md:p-8 shadow-card relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
            <Badge variant="primary" size="sm">
              PHASE 1 FOUNDATION
            </Badge>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-surface-foreground tracking-tight">
            {APP_CONFIG.name}
          </h2>

          <div className="font-mono text-xs md:text-sm font-semibold text-brand-primary tracking-wider uppercase">
            {APP_CONFIG.philosophyBullets}
          </div>

          <p className="text-xs md:text-sm text-surface-foreground-muted leading-relaxed">
            Welcome to the Industrial AI Safety training platform. Design, train, and validate
            computer vision safety workflows for industrial environments. Complete each stage in sequence to build a verified safety system.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/build')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Begin Stage 01: Build
            </Button>
          </div>
        </div>

        {/* Technical background decoration (subtle grid) */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1/3 opacity-5 pointer-events-none hidden md:block"
          style={{
            backgroundImage:
              'radial-gradient(circle, #0F513E 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
          aria-hidden="true"
        />
      </section>

      {/* Grid Layout: Workflow Stages + Project Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 spans): Workflow Cards */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeader
            title="TRAINING WORKFLOW"
            subtitle="Follow the step-by-step cycle to develop reliable safety detection"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WORKFLOW_CARDS.map((card) => (
              <Card
                key={card.step}
                interactive
                onClick={() => navigate(card.route)}
                aria-label={`Open Stage ${card.step}: ${card.title} - ${card.description}`}
                className="group border-surface-border hover:border-brand-accent/50"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-surface-muted border border-surface-border flex items-center justify-center shrink-0">
                        {stepIcons[card.step]}
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-brand-primary transition-colors">
                        STAGE {card.step}
                      </span>
                    </div>
                    <Badge variant="neutral" size="sm">
                      {card.badgeText}
                    </Badge>
                  </div>
                  <CardTitle className="mt-3 text-sm flex items-center justify-between">
                    <span>{card.step} {card.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-1">
                  <CardDescription className="text-xs">
                    {card.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column (1 span): Project Status Card & System Arch Card */}
        <div className="space-y-6">
          {/* Project Status Card */}
          <Card className="border-surface-border">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-mono tracking-wider uppercase text-surface-foreground-subtle">
                  PROJECT STATUS
                </CardTitle>
                <Badge variant="neutral" size="sm">
                  INITIALIZED
                </Badge>
              </div>
              <p className="text-xs text-surface-foreground-muted mt-1">
                Current progress across all lifecycle stages
              </p>
            </CardHeader>

            <CardContent className="p-5 pt-2 space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-surface-border text-xs">
                <span className="font-medium text-surface-foreground">Workflow</span>
                <StatusBadge status="not_started" label="Not started" />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-surface-border text-xs">
                <span className="font-medium text-surface-foreground">Dataset</span>
                <StatusBadge status="not_created" label="Not created" />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-surface-border text-xs">
                <span className="font-medium text-surface-foreground">Model</span>
                <StatusBadge status="not_trained" label="Not trained" />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-surface-border text-xs">
                <span className="font-medium text-surface-foreground">Testing</span>
                <StatusBadge status="not_started" label="Not started" />
              </div>

              <div className="flex items-center justify-between py-2 text-xs">
                <span className="font-medium text-surface-foreground">Challenge</span>
                <StatusBadge status="not_started" label="Not started" />
              </div>
            </CardContent>
          </Card>

          {/* Model Engine Configuration / Technical Spec Card */}
          <Card className="border-surface-border bg-surface-subtle/50">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center gap-2 text-surface-foreground-muted">
                <Server className="w-4 h-4 text-brand-primary" />
                <CardTitle className="text-xs font-mono uppercase tracking-wider">
                  Model Engine Integration
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3 text-xs">
              <div className="rounded border border-surface-border bg-white p-3 space-y-1.5 font-mono text-[11px]">
                <div className="text-slate-400 uppercase text-[10px]">API Endpoint (env)</div>
                <div className="text-slate-800 font-semibold truncate">
                  {env.modelApiUrl}
                </div>
              </div>

              <div className="flex items-start gap-2 text-surface-foreground-muted text-[11px] leading-relaxed">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  The external Model Engine will connect to this frontend shell via REST API in Phase 2.
                </span>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-slate-400" />
                  Frontend Shell:
                </span>
                <span className="text-brand-primary font-semibold">Active & Typed</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
