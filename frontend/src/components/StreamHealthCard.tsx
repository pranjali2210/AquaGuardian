import React from 'react';
import { 
  Activity, AlertCircle, Droplets, HeartPulse, Sparkles, 
  HelpCircle, ChevronRight, ShieldAlert, CheckCircle2, Clock
} from 'lucide-react';
import { Stream } from '../types';

interface StreamHealthCardProps {
  stream: Stream;
  onExplainRisk: (stream: Stream) => void;
  onReportObservation: (stream: Stream) => void;
  onViewCleanup: (stream: Stream) => void;
  onClose?: () => void;
}

export const StreamHealthCard: React.FC<StreamHealthCardProps> = ({
  stream,
  onExplainRisk,
  onReportObservation,
  onViewCleanup,
  onClose
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Healthy':
        return { bg: 'bg-emerald-950/80', text: 'text-emerald-400', border: 'border-emerald-700/60', icon: '🟢' };
      case 'Watch':
        return { bg: 'bg-amber-950/80', text: 'text-amber-400', border: 'border-amber-700/60', icon: '🟡' };
      case 'At Risk':
        return { bg: 'bg-red-950/80', text: 'text-red-400', border: 'border-red-700/60', icon: '🔴' };
      case 'Cleanup Required':
        return { bg: 'bg-purple-950/80', text: 'text-purple-400', border: 'border-purple-700/60', icon: '🧹' };
      case 'Recently Cleaned':
        return { bg: 'bg-cyan-950/80', text: 'text-cyan-400', border: 'border-cyan-700/60', icon: '✅' };
      default:
        return { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700', icon: '📍' };
    }
  };

  const badge = getStatusBadge(stream.status);

  // Score meter color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-5 shadow-2xl backdrop-blur-md relative overflow-hidden transition-all">
      {/* Header Accent Bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-1" 
        style={{
          backgroundColor: stream.status === 'Healthy' ? '#10b981' :
                           stream.status === 'Watch' ? '#f59e0b' :
                           stream.status === 'At Risk' ? '#ef4444' :
                           stream.status === 'Cleanup Required' ? '#8b5cf6' : '#06b6d4'
        }}
      />

      {/* Title & Status */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight">{stream.name}</h3>
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
              <span>{badge.icon}</span>
              <span>{stream.status.toUpperCase()}</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <span>{stream.location_name}</span>
            <span>•</span>
            <span>{stream.length_km} km reach</span>
          </p>
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* Hazardous warning alert box if present */}
      {!stream.safe_for_citizen_action && (
        <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 rounded-lg flex items-start gap-2.5 text-xs text-red-200">
          <ShieldAlert className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-red-300">Hazardous Chemical Alert</div>
            <div className="text-[11px] text-red-200/90 mt-0.5">
              {stream.special_hazard_warning || "Suspected hazardous chemical effluent. Citizen entry strictly prohibited. Contact local environmental authorities."}
            </div>
          </div>
        </div>
      )}

      {/* Main Score & Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        
        {/* Health Score */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
            <HeartPulse className="h-3 w-3 text-cyan-400" />
            Health Score
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl font-black ${getScoreColor(stream.health_score)}`}>
              {stream.health_score}
            </span>
            <span className="text-xs text-slate-500 font-semibold">/100</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Prototype Index</span>
        </div>

        {/* Observations Count */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
            <Droplets className="h-3 w-3 text-emerald-400" />
            Observations
          </div>
          <div className="text-2xl font-black text-slate-100 mt-1">
            {stream.recent_observations_count}
          </div>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {stream.last_observation_time}
          </span>
        </div>

        {/* Cleanup Priority */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-purple-400" />
            Cleanup Need
          </div>
          <div className="text-xl font-bold mt-1 text-slate-100 flex items-center gap-1">
            {stream.cleanup_required ? (
              <span className="text-purple-400 font-extrabold">{stream.cleanup_priority}/100</span>
            ) : (
              <span className="text-slate-400 text-sm font-semibold">Not Required</span>
            )}
          </div>
          <span className="text-[10px] text-slate-400">
            {stream.cleanup_required ? 'High Priority Action' : 'Monitoring Normal'}
          </span>
        </div>

        {/* Safety / Status */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
            <Activity className="h-3 w-3 text-amber-400" />
            Citizen Safety
          </div>
          <div className="text-sm font-bold mt-1.5 flex items-center gap-1">
            {stream.safe_for_citizen_action ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Safe for Volunteers
              </span>
            ) : (
              <span className="text-red-400 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> Hazard Alert
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400">Protective Gear Standard</span>
        </div>

      </div>

      {/* Sub-Indicators Progress Bars */}
      <div className="space-y-2 mb-5 bg-slate-950/40 p-3.5 rounded-lg border border-slate-800/60">
        <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
          <span>Decomposed Ecological Indicators</span>
          <span className="text-[10px] text-slate-400">Weight: Composite Model</span>
        </div>

        {/* Water Appearance */}
        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
            <span>Water Appearance & Turbidity</span>
            <span className="font-semibold text-slate-200">{stream.indicators.water_appearance_score}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-cyan-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${stream.indicators.water_appearance_score}%` }} 
            />
          </div>
        </div>

        {/* Biodiversity */}
        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
            <span>Biodiversity & Macroinvertebrate Activity</span>
            <span className="font-semibold text-slate-200">{stream.indicators.biodiversity_score}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${stream.indicators.biodiversity_score}%` }} 
            />
          </div>
        </div>

        {/* Pollution */}
        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
            <span>Pollution Index (Debris & Litter Freedom)</span>
            <span className="font-semibold text-slate-200">{stream.indicators.pollution_score}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-purple-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${stream.indicators.pollution_score}%` }} 
            />
          </div>
        </div>

        {/* Habitat */}
        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
            <span>Riparian Buffer & Habitat Integrity</span>
            <span className="font-semibold text-slate-200">{stream.indicators.habitat_score}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-teal-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${stream.indicators.habitat_score}%` }} 
            />
          </div>
        </div>

        {/* Climate Stress */}
        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
            <span>Microclimate & Runoff Resilience</span>
            <span className="font-semibold text-slate-200">{stream.indicators.climate_stress_score}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${stream.indicators.climate_stress_score}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Catch Basin Description */}
      <p className="text-xs text-slate-400 italic mb-5 leading-relaxed">
        "{stream.catch_basin_desc}"
      </p>

      {/* Action Buttons (Section 6 Requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        
        {/* "Why is this stream at risk?" */}
        <button
          onClick={() => onExplainRisk(stream)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-semibold transition-all shadow-sm group"
        >
          <HelpCircle className="h-3.5 w-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span>Explain Risk (AI)</span>
        </button>

        {/* "Report Observation" */}
        <button
          onClick={() => onReportObservation(stream)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all shadow-sm"
        >
          <Droplets className="h-3.5 w-3.5 text-cyan-400" />
          <span>Report Observation</span>
        </button>

        {/* "View Cleanup" */}
        <button
          onClick={() => onViewCleanup(stream)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold transition-all shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>View Cleanup</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

      </div>
    </div>
  );
};
