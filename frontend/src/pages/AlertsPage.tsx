import React from 'react';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, Radar, 
  MapPin, Clock, Users, ArrowRight, ShieldCheck
} from 'lucide-react';
import { RiskAlert, PollutionCluster } from '../types';
import { api } from '../services/api';

interface AlertsPageProps {
  alerts: RiskAlert[];
  clusters: PollutionCluster[];
  onResolveAlert: (alertId: string) => void;
  onNavigate: (tab: string) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  alerts,
  clusters,
  onResolveAlert,
  onNavigate
}) => {
  const handleResolve = async (id: string) => {
    try {
      await api.resolveAlert(id);
      onResolveAlert(id);
    } catch (err) {
      console.error("Resolve failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Early Warning Alerts & Spatial Clusters
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
              Track 6: Resilience Informatics
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time anomaly clustering engine grouping co-located citizen reports into actionable early warnings.
          </p>
        </div>

        <button
          onClick={() => onNavigate('map')}
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 self-start sm:self-auto"
        >
          <span>View Spatial Overlays on Map</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Spatial Pollution Clusters (Section 12) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Radar className="h-4 w-4 text-cyan-400" />
            <span>Detected Pollution Clusters ({clusters.length})</span>
          </h2>
          <span className="text-xs text-slate-400">
            Clustered radius &lt; 1.2 km • Time window &lt; 72 hours
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clusters.map((cluster) => (
            <div 
              key={cluster.id}
              className={`p-5 rounded-xl border transition-all shadow-md ${
                cluster.severity === 'CRITICAL'
                  ? 'bg-red-950/20 border-red-800/80'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{cluster.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{cluster.stream_name}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                  cluster.severity === 'CRITICAL'
                    ? 'bg-red-950 text-red-300 border-red-800'
                    : 'bg-amber-950 text-amber-300 border-amber-800'
                }`}>
                  {cluster.severity}
                </span>
              </div>

              {/* Cluster Metrics */}
              <div className="grid grid-cols-3 gap-2 my-3 text-xs">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Reports</span>
                  <span className="text-slate-100 font-bold">{cluster.observation_count} logs</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Affected Area</span>
                  <span className="text-slate-100 font-bold">{cluster.affected_area_sqm} m²</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Confidence</span>
                  <span className="text-cyan-400 font-bold">{cluster.confidence}%</span>
                </div>
              </div>

              {/* Timeline & Issues */}
              <div className="space-y-2 text-xs">
                <div className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span>{cluster.timeline_desc}</span>
                </div>

                <div className="flex flex-wrap gap-1 mt-1">
                  {cluster.primary_issues.map((issue, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      • {issue}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <strong className="text-slate-300">Suggested Action Reach: </strong>
                  {cluster.suggested_cleanup_zone}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Active Early Warnings (Section 11) */}
      <div className="space-y-3 pt-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <span>Active Early Warnings ({alerts.length})</span>
        </h2>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div 
              key={alert.id}
              className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-md ${
                alert.is_hazardous
                  ? 'bg-red-950/30 border-red-800'
                  : alert.is_resolved
                  ? 'bg-slate-900/50 border-slate-800 opacity-60'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="space-y-2 max-w-3xl text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                    alert.severity === 'CRITICAL' ? 'bg-red-950 text-red-300 border-red-800' :
                    alert.severity === 'HIGH' ? 'bg-orange-950 text-orange-300 border-orange-800' :
                    'bg-amber-950 text-amber-300 border-amber-800'
                  }`}>
                    {alert.severity} SEVERITY
                  </span>
                  <span className="font-bold text-slate-200 text-sm">{alert.title}</span>
                  {alert.is_hazardous && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white uppercase">
                      HAZARDOUS CONTAMINATION • NO CITIZEN ENTRY
                    </span>
                  )}
                </div>

                <div className="text-slate-400 flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  <span>{alert.location_desc} ({alert.stream_name})</span>
                  <span>•</span>
                  <span>{alert.timestamp}</span>
                  <span>•</span>
                  <span className="text-cyan-400 font-semibold">{alert.confidence}% AI confidence</span>
                </div>

                {/* Evidence & Indicators */}
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Evidence Supporting Alert ({alert.observation_count} observations within {alert.radius_km} km):
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {alert.detected_indicators.map((ind, i) => (
                      <span key={i} className="text-[11px] text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-slate-300 italic">
                  <strong className="text-emerald-400 not-italic">Recommended Next Step: </strong>
                  "{alert.recommended_next_step}"
                </div>
              </div>

              {/* Action */}
              <div className="flex-shrink-0 self-end md:self-center">
                {alert.is_resolved ? (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="h-4 w-4" /> Resolved
                  </span>
                ) : (
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
                  >
                    Mark Verified / Resolved
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
