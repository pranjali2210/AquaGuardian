import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, TrendingUp, Sparkles, Activity, 
  ArrowRight, ShieldCheck, HeartPulse, RefreshCw
} from 'lucide-react';
import { ImpactTrackingRecord } from '../types';
import { api } from '../services/api';

export const ImpactPage: React.FC = () => {
  const [records, setRecords] = useState<ImpactTrackingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getImpactRecords()
      .then(data => setRecords(data))
      .catch(err => console.error("Impact records fetch failed:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Impact Tracking & Riparian Recovery Loop
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
              Detect → Act → Verify → Recover
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Validating whether community interventions actually restored ecological health over time.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-lg">
          <HeartPulse className="h-4 w-4" />
          <span>Full Loop Demonstration</span>
        </div>
      </div>

      {/* Impact Loop Concept Explanation Bar */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
        <div className="font-bold text-slate-200 mb-2">The Closed-Loop Freshwater Lifecycle:</div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px]">
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <span className="font-bold text-red-400 block">1. Detection</span>
            <span className="text-slate-400">Citizen reports anomaly</span>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <span className="font-bold text-purple-400 block">2. Cleanup</span>
            <span className="text-slate-400">Community mobilization</span>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <span className="font-bold text-cyan-400 block">3. Verification</span>
            <span className="text-slate-400">AI visual differential</span>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-slate-800">
            <span className="font-bold text-amber-400 block">4. Follow-up</span>
            <span className="text-slate-400">7-day bio-check</span>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-slate-800 col-span-2 sm:col-span-1">
            <span className="font-bold text-emerald-400 block">5. Recovery</span>
            <span className="text-slate-400">Score rebound</span>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-6">
        {records.map((rec) => (
          <div key={rec.stream_id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            
            {/* Stream Header & Scores Overview */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">{rec.stream_name}</h2>
                <p className="text-xs text-slate-400">Documented Closed-Loop Recovery Case Study</p>
              </div>

              {/* Score Progression Badges (Section 16) */}
              <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Detection</span>
                  <span className="text-base font-black text-red-400">{rec.initial_detection_score}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Post-Cleanup</span>
                  <span className="text-base font-black text-purple-400">{rec.post_cleanup_score}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Sustained</span>
                  <span className="text-base font-black text-emerald-400">{rec.current_recovered_score}</span>
                </div>
                <div className="ml-2 pl-3 border-l border-slate-800 text-emerald-400 font-extrabold text-sm">
                  +{rec.improvement_points} pts
                </div>
              </div>
            </div>

            {/* Visual Timeline (Section 16) */}
            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {rec.timeline.map((step, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline Node Dot */}
                  <div className={`absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-slate-900 transition-all ${
                    step.stage === 'Recovery' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/80' :
                    step.stage === 'Verification' ? 'bg-cyan-400' :
                    step.stage === 'Cleanup' ? 'bg-purple-400' : 'bg-slate-400'
                  }`} />

                  <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200 text-sm">{step.stage}</span>
                        <span className="text-[10px] font-semibold text-slate-400">({step.date_str})</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                        Health: {step.health_score}/100
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pt-0.5">
                      {step.summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Ecological Findings */}
            <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-4 text-xs text-slate-300 leading-relaxed">
              <strong className="text-emerald-300 font-semibold block mb-1">Observed Biological Recovery:</strong>
              {rec.ecological_observations}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
