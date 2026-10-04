import React, { useState } from 'react';
import { 
  Droplets, PlusCircle, Sparkles, Filter, 
  CheckCircle2, AlertCircle, Clock, ShieldCheck, User
} from 'lucide-react';
import { Observation, Stream } from '../types';

interface ObservationsPageProps {
  observations: Observation[];
  streams: Stream[];
  onOpenReportModal: () => void;
}

export const ObservationsPage: React.FC<ObservationsPageProps> = ({
  observations,
  streams,
  onOpenReportModal
}) => {
  const [selectedStreamId, setSelectedStreamId] = useState<string>('ALL');

  const filtered = observations.filter(o => {
    if (selectedStreamId === 'ALL') return true;
    return o.stream_id === selectedStreamId;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Citizen Stream Observations</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
              Track 1 & 3: Citizen Science + AI
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Community-reported sensory & photographic stream logs evaluated by multimodal AI vision.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Observation</span>
        </button>
      </div>

      {/* Stream Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold flex items-center gap-1">
          <Filter className="h-3 w-3" /> Filter:
        </span>
        <button
          onClick={() => setSelectedStreamId('ALL')}
          className={`px-3 py-1 rounded-lg font-medium transition-all ${
            selectedStreamId === 'ALL'
              ? 'bg-cyan-600 text-white font-bold'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All Waterways ({observations.length})
        </button>
        {streams.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedStreamId(s.id)}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedStreamId === s.id
                ? 'bg-cyan-600 text-white font-bold'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Observations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((obs) => (
          <div 
            key={obs.id}
            className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all shadow-md flex flex-col justify-between"
          >
            <div>
              {/* Image Preview with Badges */}
              {obs.photo_url && (
                <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                  <img 
                    src={obs.photo_url} 
                    alt={obs.stream_name} 
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" 
                  />
                  <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-200 border border-slate-700">
                    {obs.stream_name}
                  </div>
                  <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-slate-300 flex items-center gap-1 border border-slate-700">
                    <Clock className="h-2.5 w-2.5" />
                    {obs.timestamp}
                  </div>
                </div>
              )}

              {/* Citizen Sensory Observations */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <User className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="font-semibold">{obs.reporter_name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">ID: {obs.id}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Water Appearance</span>
                    <span className="text-slate-200 font-medium">{obs.water_appearance}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Sensory Odor</span>
                    <span className="text-slate-200 font-medium">{obs.smell}</span>
                  </div>
                </div>

                {obs.visible_litter && (
                  <div className="bg-purple-950/40 border border-purple-800/60 p-2 rounded-lg text-xs text-purple-200">
                    <strong className="text-purple-300">Visible Litter: </strong>
                    {obs.litter_type || 'Consumer plastics & debris'}
                  </div>
                )}

                {obs.algae_present && (
                  <div className="bg-emerald-950/40 border border-emerald-800/60 p-2 rounded-lg text-xs text-emerald-200">
                    <strong className="text-emerald-300">Algae / Biofilm: </strong>
                    {obs.algae_type || 'Greenish surface layer'}
                  </div>
                )}

                {obs.notes && (
                  <p className="text-xs text-slate-400 italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    "{obs.notes}"
                  </p>
                )}

                {/* AI Multimodal Assessment (Section 8) */}
                {obs.ai_analysis && (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-cyan-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                        <Sparkles className="h-3 w-3" /> AI Vision Assessment
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {obs.ai_analysis.confidence_score}% Confidence
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-200">
                      {obs.ai_analysis.classification}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {obs.ai_analysis.detected_indicators.map((ind, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                          {ind}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1 text-slate-400 border-t border-slate-800">
                      <span>Human Verification:</span>
                      <span className="font-bold text-amber-300 uppercase">
                        {obs.ai_analysis.human_verification_recommended ? 'Recommended' : 'Confirmed'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
