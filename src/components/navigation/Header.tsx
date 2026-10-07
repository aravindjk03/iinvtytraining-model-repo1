import React, { useState } from 'react';
import { Menu, RefreshCw, X, Server, AlertTriangle } from 'lucide-react';
import { APP_CONFIG } from '@/config/constants';
import { useModelEngineHealth } from '@/hooks/useModelEngineHealth';
import { env } from '@/config/env';

export interface HeaderProps {
  pageTitle: string;
  onOpenMobile?: () => void;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  onOpenMobile,
  onOpenMobileMenu,
}) => {
  const handleOpen = onOpenMobile || onOpenMobileMenu;
  const { isOnline, isChecking, health, recheck } = useModelEngineHealth();
  const [showStatusModal, setShowStatusModal] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-surface-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-subtle shrink-0 select-none">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        {handleOpen && (
          <button
            type="button"
            onClick={handleOpen}
            className="lg:hidden p-2 rounded-md text-surface-foreground-muted hover:text-surface-foreground hover:bg-surface-muted"
            aria-label="Open navigation sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col">
          <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-surface-foreground-subtle hidden sm:block">
            {APP_CONFIG.name}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-surface-foreground tracking-tight">
            {pageTitle}
          </h2>
        </div>
      </div>

      {/* Right: Project Name & Model Engine Status Area */}
      <div className="flex items-center gap-4">
        {/* Project Context */}
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs font-semibold text-surface-foreground">
            Industrial PPE Vision
          </span>
          <span className="text-[10px] text-surface-foreground-subtle font-mono">
            Protocol #01 • YOLO26n
          </span>
        </div>

        <div className="h-7 w-[1px] bg-surface-border hidden sm:block" />

        {/* Engine Connectivity Indicator Button */}
        <button
          type="button"
          onClick={() => setShowStatusModal(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all cursor-pointer shadow-xs ${
            isOnline
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
              : isChecking
              ? 'bg-amber-50 border-amber-300 text-amber-800'
              : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
          }`}
          title="Click to inspect Model Engine connectivity"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline
                ? 'bg-emerald-500 animate-pulse'
                : isChecking
                ? 'bg-amber-500 animate-ping'
                : 'bg-slate-400'
            }`}
          />
          <span className="hidden sm:inline">
            {isOnline
              ? '● MODEL ENGINE CONNECTED'
              : isChecking
              ? 'CONNECTING...'
              : '○ MODEL ENGINE OFFLINE'}
          </span>
          <span className="sm:hidden">
            {isOnline ? 'CONNECTED' : 'OFFLINE'}
          </span>
        </button>
      </div>

      {/* Model Engine Connection Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-surface-border max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-brand-primary" />
                <h4 className="text-xs font-bold font-mono uppercase text-slate-800">
                  Model Engine Status
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
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
                  <span className="text-slate-500">Status:</span>
                  <span
                    className={`font-bold ${
                      isOnline ? 'text-emerald-700' : 'text-slate-600'
                    }`}
                  >
                    {isOnline ? 'ONLINE (HEALTHY)' : 'OFFLINE / UNREACHABLE'}
                  </span>
                </div>
                {health?.version && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service Version:</span>
                    <span className="text-slate-700 font-semibold">{health.version}</span>
                  </div>
                )}
              </div>

              {!isOnline && (
                <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    The external Model Engine worker is not running on {env.modelApiUrl}. Local workflow building and dataset prep remain active.
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-surface-border">
              <button
                type="button"
                disabled={isChecking}
                onClick={() => void recheck()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-semibold disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                <span>CHECK CONNECTION</span>
              </button>

              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-3 py-1.5 rounded border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
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
