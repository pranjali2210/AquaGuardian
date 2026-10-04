import React, { useState } from 'react';
import { 
  Sparkles, ShieldAlert, CheckCircle2, Users, Clock, 
  MapPin, Wrench, ShieldCheck, ArrowRight, PlusCircle, AlertTriangle
} from 'lucide-react';
import { CleanupEvent, Stream } from '../types';
import { api } from '../services/api';

interface CleanupHubPageProps {
  cleanups: CleanupEvent[];
  streams: Stream[];
  onOpenVerifyModal: (cleanup: CleanupEvent) => void;
  onJoinSuccess: (updated: CleanupEvent) => void;
  onNavigate: (tab: string) => void;
}

export const CleanupHubPage: React.FC<CleanupHubPageProps> = ({
  cleanups,
  streams,
  onOpenVerifyModal,
  onJoinSuccess,
  onNavigate
}) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const filtered = cleanups.filter(c => {
    if (filter === 'ALL') return true;
    return c.status.toUpperCase() === filter.toUpperCase();
  });

  const handleJoin = async (id: string) => {
    setJoiningId(id);
    try {
      const updated = await api.joinCleanup(id);
      onJoinSuccess(updated);
    } catch (err) {
      console.error("Join cleanup failed:", err);
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Community Cleanup Hub & Priority Engine
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
              Detect → Act → Verify
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Data-driven intervention scheduling, volunteer mobilization, and safety-verified debris clearance.
          </p>
        </div>

        {/* Safety Banner notice (Section 14) */}
        <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2 max-w-sm">
          <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span>
            Citizen events are strictly limited to non-hazardous surface plastics. Chemical/industrial events are referred to HAZMAT authorities.
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        {['ALL', 'Upcoming', 'Completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === tab
                ? 'bg-purple-600 text-white font-bold shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab} Cleanups ({tab === 'ALL' ? cleanups.length : cleanups.filter(c => c.status === tab).length})
          </button>
        ))}
      </div>

      {/* Cleanups List */}
      <div className="space-y-5">
        {filtered.map((cl) => (
          <div 
            key={cl.id}
            className={`bg-slate-900 border rounded-2xl p-6 transition-all shadow-xl space-y-4 ${
              cl.is_hazardous_warning
                ? 'border-red-800/80 bg-red-950/10'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Top Bar: Title & Priority Score (Section 13) */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                    cl.status === 'Completed'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : 'bg-purple-950 text-purple-300 border-purple-800'
                  }`}>
                    {cl.status}
                  </span>
                  <h3 className="text-base font-bold text-white tracking-tight">{cl.title}</h3>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-cyan-400" />
                    {cl.location_desc}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    {cl.date_str} ({cl.time_str})
                  </span>
                </div>
              </div>

              {/* Priority Badge */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3 self-start">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Cleanup Priority
                  </div>
                  <div className="text-sm font-black text-purple-400">
                    {cl.priority_score}/100 • {cl.priority_level}
                  </div>
                </div>
              </div>
            </div>

            {/* Target Issue & Photos Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              <div className="md:col-span-2 space-y-3">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <strong className="text-slate-300 block mb-1">Target Issue:</strong>
                  <p className="text-slate-400 leading-relaxed">{cl.target_issue}</p>
                </div>

                {/* Equipment & Volunteers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-1">
                      <Wrench className="h-3 w-3 text-cyan-400" />
                      Required Equipment Provided
                    </span>
                    <div className="flex flex-wrap gap-1 text-[11px] text-slate-300">
                      {cl.equipment_needed.map((eq, i) => (
                        <span key={i} className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-1">
                      <Users className="h-3 w-3 text-emerald-400" />
                      Community Turnout
                    </span>
                    <div className="text-sm font-bold text-slate-200">
                      {cl.participants_count} / {cl.max_participants} Participants Registered
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                      <div 
                        className="bg-emerald-500 h-full rounded-full" 
                        style={{ width: `${(cl.participants_count / cl.max_participants) * 100}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Safety Guidelines */}
                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  <strong className="text-amber-300 font-semibold block mb-0.5">Safety Protocol:</strong>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                    {cl.safety_guidelines.slice(0, 2).map((sg, i) => (
                      <li key={i}>{sg}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Before/After Photo Preview */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                    {cl.status === 'Completed' ? 'Verified Impact Photos' : 'Site Assessment Photo'}
                  </div>
                  {cl.before_photo_url && (
                    <img 
                      src={cl.after_photo_url || cl.before_photo_url} 
                      alt="" 
                      className="h-28 w-full object-cover rounded-lg border border-slate-800" 
                    />
                  )}
                  {cl.verification_summary && (
                    <div className="text-[11px] text-emerald-400 font-semibold mt-2">
                      {cl.verification_summary}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  {cl.status === 'Completed' ? (
                    <button
                      onClick={() => onNavigate('impact')}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <span>View Recovery Timeline</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleJoin(cl.id)}
                        disabled={joiningId === cl.id || cl.participants_count >= cl.max_participants}
                        className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                      >
                        {joiningId === cl.id ? 'Joining...' : 'Join Cleanup'}
                      </button>

                      <button
                        onClick={() => onOpenVerifyModal(cl)}
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-bold rounded-lg transition-colors"
                      >
                        Verify with AI
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
