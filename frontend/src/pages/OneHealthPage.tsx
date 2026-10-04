import React, { useEffect, useState } from 'react';
import { 
  Droplets, ShieldAlert, Heart, Bug, Sparkles, 
  Info, AlertTriangle, CheckCircle2, ArrowRight
} from 'lucide-react';
import { OneHealthInsight } from '../types';
import { api } from '../services/api';

export const OneHealthPage: React.FC = () => {
  const [insights, setInsights] = useState<OneHealthInsight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getInsights()
      .then(data => setInsights(data))
      .catch(err => console.error("Insights fetch failed:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              One Health Ecological Insights
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
              Ecosystem ⇄ Biodiversity ⇄ Human Wellbeing
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing the interconnected feedback loop between urban stream water quality, riparian wildlife, and public community health.
          </p>
        </div>

        {/* Responsible AI Disclaimer (Prompt Section 17) */}
        <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2 max-w-sm">
          <Info className="h-4 w-4 text-cyan-400 flex-shrink-0" />
          <span>
            Strict Scientific Standard: We avoid unsupported clinical claims. Interventions focus on environmental indicators and recreational wellbeing.
          </span>
        </div>
      </div>

      {/* Triad Conceptual Architecture Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <span className="text-base">🌊</span>
            <span>1. Freshwater Ecosystem</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Turbidity, dissolved oxygen, flow rates, and gross solid waste loads govern whether the physical aquatic system can support organic respiration.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <span className="text-base">🦋</span>
            <span>2. Biodiversity Sentinel Species</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Mayflies, caddisflies, dragonflies, and benthic macroinvertebrates serve as early warning bio-indicators responding days before chemical shifts show.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <span className="text-base">👥</span>
            <span>3. Human & Community Wellbeing</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Accessible, clean waterways reduce stagnant vector breeding grounds, mitigate urban heat islands, and provide restorative green public corridors.
          </p>
        </div>
      </div>

      {/* Insights Cards */}
      <div className="space-y-5">
        {insights.map((item) => (
          <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">{item.title}</h3>
                <span className="text-xs text-cyan-400 font-semibold">{item.stream_name}</span>
              </div>
              <span className="text-[10px] text-slate-400">{item.timestamp}</span>
            </div>

            {/* Triad Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-cyan-400 block text-[11px] uppercase tracking-wider">
                  Ecosystem Health
                </span>
                <p className="text-slate-300 leading-relaxed">{item.ecosystem_health}</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 block text-[11px] uppercase tracking-wider">
                  Biodiversity Nexus
                </span>
                <p className="text-slate-300 leading-relaxed">{item.biodiversity_nexus}</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-purple-400 block text-[11px] uppercase tracking-wider">
                  Human & Community Link
                </span>
                <p className="text-slate-300 leading-relaxed">{item.human_wellbeing_link}</p>
              </div>
            </div>

            {/* Cautious Statement (Section 17 requirement) */}
            <div className="bg-amber-950/20 border border-amber-800/40 p-3 rounded-lg text-xs text-amber-200/90 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 font-semibold">Scientific Boundary Notice: </strong>
                {item.cautious_statement}
              </div>
            </div>

            {/* Recommended Action */}
            <div className="text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
              <div className="text-slate-300">
                <strong className="text-emerald-400">Actionable Intervention: </strong>
                {item.recommended_action}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
