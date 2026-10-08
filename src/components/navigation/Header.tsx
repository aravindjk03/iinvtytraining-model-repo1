import React, { useState } from 'react';
import { Menu, RefreshCw, X, Server, AlertTriangle } from 'lucide-react';
import { APP_CONFIG } from '@/config/constants';
import { useModelEngineHealth } from '@/hooks/useModelEngineHealth';
import { useProjectOptional } from '@/context/ProjectContext';
import { EngineStatusIndicator } from './EngineStatusIndicator';
import { env } from '@/config/env';

export interface HeaderProps {
  pageTitle: string;
  projectName?: string;
  onOpenMobile?: () => void;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  projectName,
  onOpenMobile,
  onOpenMobileMenu,
}) => {
  const handleOpen = onOpenMobile || onOpenMobileMenu;
  const { engineState, isChecking, health, recheck } = useModelEngineHealth();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const projectContext = useProjectOptional();

  // Read project from context if not explicitly provided as a prop
  const activeProjectName =
    projectName || projectContext?.project?.name || APP_CONFIG.defaultProjectName;

  return (
    <header className="h-16 bg-white border-b border-surface-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-subtle shrink-0 select-none">
      {/* Left: Mobile hamburger & Application Branding + Current Page */}
      <div className="flex items-center gap-3">
        {handleOpen && (
          <button
            type="button"
            onClick={handleOpen}
            className="lg:hidden p-2 rounded-md text-surface-foreground-muted hover:text-surface-foreground hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-brand-accent"
            aria-label="Open navigation sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-primary">
              {APP_CONFIG.name}
            </span>
            <span className="hidden sm:inline-block text-slate-300 font-mono text-[10px]">|</span>
            {/* Dynamic Project Context on Left */}
            <span className="text-xs font-semibold text-slate-700 hidden sm:inline-block truncate max-w-[220px]">
              Project: <span className="text-brand-primary font-bold">{activeProjectName}</span>
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-surface-foreground tracking-tight leading-tight">
            {pageTitle}
          </h2>
        </div>
      </div>

      {/* Right: Engine Connectivity Indicator */}
      <div className="flex items-center gap-3">
        {/* Mobile Project indicator */}
        <div className="sm:hidden flex flex-col text-right max-w-[120px]">
          <span className="text-[10px] text-slate-400 font-mono">Project</span>
          <span className="text-xs font-semibold text-slate-800 truncate">
            {activeProjectName}
          </span>
        </div>

        <div className="h-7 w-[1px] bg-surface-border hidden sm:block" />

        {/* Engine Connectivity Indicator Button */}
        <EngineStatusIndicator
          state={engineState}
          onClick={() => setShowStatusModal(true)}
        />
      </div>

      {/* Model Engine Connection Modal */}
      {showStatusModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-engine-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="bg-white rounded-xl shadow-xl border border-surface-border max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-brand-primary" />
                <h4 id="modal-engine-title" className="text-xs font-bold font-mono uppercase text-slate-800">
                  Model Engine Status
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                aria-label="Close engine status modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Configured URL:</span>
                  <span className="font-bold text-slate-700 truncate max-w-[180px]">
                    {env.modelApiUrl}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">State:</span>
                  <span
                    className={`font-bold ${
                      engineState === 'CONNECTED'
                        ? 'text-emerald-700'
                        : engineState === 'CONNECTING'
                        ? 'text-amber-700'
                        : 'text-slate-600'
                    }`}
                  >
                    {engineState === 'CONNECTED'
                      ? 'ONLINE (HEALTHY)'
                      : engineState === 'CONNECTING'
                      ? 'CONNECTING...'
                      : 'OFFLINE / UNREACHABLE'}
                  </span>
                </div>
                {health?.version && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service Version:</span>
                    <span className="text-slate-700 font-semibold">{health.version}</span>
                  </div>
                )}
              </div>

              {engineState !== 'CONNECTED' && (
                <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    The external Model Engine worker is not running on {env.modelApiUrl}. Local workflow building and dataset prep remain fully active.
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-surface-border">
              <button
                type="button"
                disabled={isChecking}
                onClick={() => void recheck()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-semibold disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-accent"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                <span>CHECK CONNECTION</span>
              </button>

              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-3 py-1.5 rounded border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-accent"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
