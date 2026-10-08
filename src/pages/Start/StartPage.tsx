import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG } from '@/config/constants';
import { useProject } from '@/context/ProjectContext';

export const StartPage: React.FC = () => {
  const navigate = useNavigate();
  const { project } = useProject();

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-6 sm:p-12 font-sans select-none">
      {/* Top Brand Bar */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand-primary flex items-center justify-center text-white shadow-card">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-mono font-bold tracking-wider text-slate-300 uppercase">
            {APP_CONFIG.name}
          </h1>
          <span className="text-[11px] font-mono text-emerald-400">
            INDUSTRIAL WORKSHOP EDITION
          </span>
        </div>
      </div>

      {/* Hero Content */}
      <main className="max-w-xl mx-auto text-center space-y-6 my-auto py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          PARTICIPANT EXPERIENCE
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            BUILD YOUR FIRST SAFETY AI
          </h2>
          <p className="font-mono text-sm sm:text-base text-emerald-300 font-semibold tracking-wide">
            Wire it. Teach it. Train it. Test it.
          </p>
        </div>

        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-md mx-auto">
          Design visual computer vision workflows, collect safety dataset examples,
          and validate real-time safety decisions without writing code.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/build')}
            rightIcon={<ArrowRight className="w-5 h-5" />}
            className="w-full sm:w-auto px-8 py-3 text-base shadow-lg shadow-emerald-950 font-bold"
          >
            START
          </Button>
        </div>

        {project?.name && (
          <div className="pt-6 border-t border-slate-800 text-xs text-slate-400">
            <span>Already have a project? </span>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              <Play className="w-3 h-3" />
              Continue {project.name}
            </button>
          </div>
        )}
      </main>

      {/* Mandatory Workshop Disclaimer */}
      <footer className="text-center py-4 border-t border-slate-800 text-slate-500 font-mono text-xs">
        Workshop model only — not for production safety control
      </footer>
    </div>
  );
};
