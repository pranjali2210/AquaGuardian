import React from 'react';
import { 
  Activity, AlertTriangle, Droplets, Sparkles, CheckCircle2, 
  MapPin, ArrowUpRight, TrendingUp, Users, HeartHandshake, Eye, ArrowRight, ShieldCheck
} from 'lucide-react';
import { 
  Stream, Observation, RiskAlert, CleanupEvent, 
  DashboardStats, PollutionCluster 
} from '../types';
import { StreamMap } from '../components/StreamMap';
import { StreamHealthCard } from '../components/StreamHealthCard';

interface DashboardPageProps {
  stats: DashboardStats | null;
  streams: Stream[];
  observations: Observation[];
  alerts: RiskAlert[];
  clusters: PollutionCluster[];
  cleanups: CleanupEvent[];
  selectedStream: Stream | null;
  onSelectStream: (stream: Stream) => void;
  onOpenReportModal: () => void;
  onOpenExplainRisk: (stream: Stream) => void;
  onOpenVerifyModal: (cleanup: CleanupEvent) => void;
  onOpenAIAssistant: () => void;
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  streams,
  observations,
  alerts,
  clusters,
  cleanups,
  selectedStream,
  onSelectStream,
  onOpenReportModal,
  onOpenExplainRisk,
  onOpenVerifyModal,
  onOpenAIAssistant,
  onNavigate
}) => {
  return (
    <div className="space-y-6">
      
      {/* Top Hero Banner & Hackathon Demo CTAs (Section 28) */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                LIVE ECOSYSTEM TELEMETRY
              </span>
              <span className="text-xs text-slate-400">Austin Watershed Basin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI-Assisted Urban Freshwater Early Warning & Action
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Detect anomalous runoff & litter → Explain ecological risk factors → Coordinate verified community cleanups → Track riparian recovery.
            </p>
          </div>

          {/* Quick Action Buttons Bar (Section 28 Hackathon Demo CTAs) */}
          <div className="flex flex-wrap md:flex-col gap-2 flex-shrink-0">
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-900/30 transition-all active:scale-95"
            >
              <Droplets className="h-4 w-4" />
              <span>REPORT OBSERVATION</span>
            </button>

            <button
              onClick={onOpenAIAssistant}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-bold rounded-xl transition-all"
            >
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>ANALYZE WITH AI</span>
            </button>

            <button
              onClick={() => onNavigate('alerts')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
            >
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>VIEW ACTIVE ALERTS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overall Ecosystem Status KPI Cards (Section 5 Requirement) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Healthy Streams */}
        <div 
          onClick={() => onNavigate('map')}
          className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-xl cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold text-slate-300">Healthy</span>
            <span>🟢</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 group-hover:scale-105 transition-transform">
            {stats ? stats.healthy_count : 1}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Ecosystem baseline intact</div>
        </div>

        {/* Watch */}
        <div 
          onClick={() => onNavigate('map')}
          className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold text-slate-300">Watch</span>
            <span>🟡</span>
          </div>
          <div className="text-2xl font-black text-amber-400 group-hover:scale-105 transition-transform">
            {stats ? stats.watch_count : 1}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Sub-threshold stress</div>
        </div>

        {/* At Risk */}
        <div 
          onClick={() => onNavigate('map')}
          className="bg-slate-900/90 border border-slate-800 hover:border-red-500/50 p-4 rounded-xl cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold text-slate-300">At Risk</span>
            <span>🔴</span>
          </div>
          <div className="text-2xl font-black text-red-400 group-hover:scale-105 transition-transform">
            {stats ? stats.at_risk_count : 1}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Severe anomaly / Hazmat</div>
        </div>

        {/* Cleanup Required */}
        <div 
          onClick={() => onNavigate('cleanup')}
          className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 p-4 rounded-xl cursor-pointer transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold text-slate-300">Cleanup Req.</span>
            <span>🧹</span>
          </div>
          <div className="text-2xl font-black text-purple-400 group-hover:scale-105 transition-transform">
            {stats ? stats.cleanup_required_count : 1}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Volunteer mobilization</div>
        </div>

        {/* Recently Cleaned / Restored */}
        <div 
          onClick={() => onNavigate('impact')}
          className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 p-4 rounded-xl cursor-pointer transition-all shadow-sm group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold text-slate-300">Cleaned & Verified</span>
            <span>✅</span>
          </div>
          <div className="text-2xl font-black text-cyan-400 group-hover:scale-105 transition-transform">
            {stats ? stats.verified_improvements_count : 1}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">AI Verified Recovery</div>
        </div>

      </div>

      {/* Main Grid: Interactive Map + Selected Stream Health Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Stream Map & Spatial Clusters */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Watershed Stream Map & Cluster Detection
              </h2>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              <span>Full Screen View</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <StreamMap
            streams={streams}
            clusters={clusters}
            selectedStreamId={selectedStream?.id}
            onSelectStream={onSelectStream}
            height="440px"
          />
        </div>

        {/* Selected Stream Health Card or Default Focus Stream */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Stream Health Profile
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">Click any marker to inspect</span>
          </div>

          {selectedStream ? (
            <StreamHealthCard
              stream={selectedStream}
              onExplainRisk={onOpenExplainRisk}
              onReportObservation={onOpenReportModal}
              onViewCleanup={() => onNavigate('cleanup')}
            />
          ) : streams[0] ? (
            <StreamHealthCard
              stream={streams[0]}
              onExplainRisk={onOpenExplainRisk}
              onReportObservation={onOpenReportModal}
              onViewCleanup={() => onNavigate('cleanup')}
            />
          ) : null}
        </div>

      </div>

      {/* Bottom Grid: Active Alerts & Recent Observations & Cleanup Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Active Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Active Early Warnings</span>
            </h3>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
              {alerts.length} Triggered
            </span>
          </div>

          <div className="space-y-2.5">
            {alerts.slice(0, 3).map((alert) => (
              <div 
                key={alert.id}
                className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 rounded-lg p-3 text-xs transition-colors"
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <div className="font-bold text-slate-200">{alert.title}</div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${
                    alert.severity === 'CRITICAL' ? 'bg-red-950 text-red-300 border-red-800' :
                    alert.severity === 'HIGH' ? 'bg-orange-950 text-orange-300 border-orange-800' :
                    'bg-amber-950 text-amber-300 border-amber-800'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">{alert.location_desc} • {alert.observation_count} reports</div>
                <div className="text-[11px] text-slate-300 mt-1 italic">"{alert.recommended_next_step}"</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('alerts')}
            className="w-full text-center text-xs text-cyan-400 hover:text-cyan-300 pt-2 font-medium flex items-center justify-center gap-1"
          >
            <span>View All Clustered Incidents</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Recent Citizen Observations */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Droplets className="h-4 w-4 text-cyan-400" />
              <span>Recent Observations</span>
            </h3>
            <span className="text-[10px] text-slate-400">Citizen Science UX</span>
          </div>

          <div className="space-y-2.5">
            {observations.slice(0, 3).map((obs) => (
              <div 
                key={obs.id}
                className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 text-xs flex gap-3"
              >
                {obs.photo_url && (
                  <img src={obs.photo_url} alt="" className="h-12 w-12 rounded object-cover flex-shrink-0 border border-slate-800" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-200 truncate">{obs.stream_name}</div>
                  <div className="text-[11px] text-slate-400">{obs.water_appearance} • {obs.timestamp}</div>
                  {obs.ai_analysis && (
                    <div className="text-[10px] text-cyan-400 mt-1 truncate">
                      AI: {obs.ai_analysis.classification} ({obs.ai_analysis.confidence_score}%)
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('observations')}
            className="w-full text-center text-xs text-cyan-400 hover:text-cyan-300 pt-2 font-medium flex items-center justify-center gap-1"
          >
            <span>Explore All Observations</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Community Cleanup Actions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>Community Cleanup Actions</span>
            </h3>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">
              Response
            </span>
          </div>

          <div className="space-y-2.5">
            {cleanups.slice(0, 2).map((cl) => (
              <div 
                key={cl.id}
                className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 text-xs space-y-1.5"
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="font-bold text-slate-200">{cl.title}</div>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    {cl.priority_level}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">{cl.location_desc} • {cl.date_str}</div>
                <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span>{cl.participants_count}/{cl.max_participants} Volunteers Joined</span>
                  {cl.status === 'Completed' ? (
                    <span className="text-emerald-400 font-bold">Verified ({cl.visual_improvement_pct}% Imp.)</span>
                  ) : (
                    <button
                      onClick={() => onOpenVerifyModal(cl)}
                      className="text-cyan-400 hover:underline font-semibold"
                    >
                      Verify Cleanup →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('cleanup')}
            className="w-full text-center text-xs text-cyan-400 hover:text-cyan-300 pt-2 font-medium flex items-center justify-center gap-1"
          >
            <span>Open Cleanup Hub</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

      </div>

    </div>
  );
};
