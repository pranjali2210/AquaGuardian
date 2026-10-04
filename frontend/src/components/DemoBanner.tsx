import React from 'react';
import { Info, Sparkles, ChevronRight, ShieldCheck } from 'lucide-react';

interface DemoBannerProps {
  onOpenSettings: () => void;
  isDemo: boolean;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ onOpenSettings, isDemo }) => {
  if (!isDemo) return null;

  return (
    <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-cyan-950/80 border-b border-amber-800/40 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-amber-200">
          <span className="flex items-center gap-1 font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider text-[10px]">
            <Sparkles className="h-3 w-3" />
            DEMO MODE ACTIVE
          </span>
          <span className="text-slate-300">
            Running offline with realistic ecological datasets and simulated multi-modal AI vision.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 hidden md:inline flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            No API keys required to test full MVP workflow
          </span>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>Configure Keys / View Status</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
