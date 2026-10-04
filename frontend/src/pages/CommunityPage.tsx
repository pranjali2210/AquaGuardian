import React from 'react';
import { 
  Award, Flame, Sparkles, Droplets, CheckCircle2, 
  Users, Trophy, ArrowRight, ShieldCheck
} from 'lucide-react';
import { UserEcoProfile } from '../types';

interface CommunityPageProps {
  userProfile: UserEcoProfile | null;
  onOpenReportModal: () => void;
  onNavigate: (tab: string) => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({
  userProfile,
  onOpenReportModal,
  onNavigate
}) => {
  const mockLeaderboard = [
    { rank: 1, name: 'Elena Rostova', badge: 'Stream Guardian', points: 680, reports: 22, cleanups: 4 },
    { rank: 2, name: 'Dr. Maya Patel', badge: 'Citizen Scientist', points: 540, reports: 18, cleanups: 2 },
    { rank: 3, name: userProfile?.name || 'Alex Rivera', badge: 'Stream Scout', points: userProfile?.eco_points || 420, reports: userProfile?.observations_count || 14, cleanups: userProfile?.cleanups_attended || 2, isMe: true },
    { rank: 4, name: 'Marcus Vance', badge: 'Cleanup Champion', points: 390, reports: 11, cleanups: 3 },
    { rank: 5, name: 'Aaliyah Chen', badge: 'River Friend', points: 310, reports: 9, cleanups: 1 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Community & Citizen Stewardship
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
              Track 5: Community & Gamification
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Rewarding sustained, rigorous environmental monitoring and verified community cleanup participation.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          Submit Observation (+25 pts)
        </button>
      </div>

      {/* User Stats Card (Section 19) */}
      {userProfile && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-900/30">
                {userProfile.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{userProfile.name}</h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Active Guardian
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Watershed Sector 4 • Verified Citizen Contributor
                </p>
              </div>
            </div>

            {/* Metrics Counter */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                  <span>🔥</span> Streak
                </div>
                <div className="text-2xl font-black text-amber-400 mt-0.5">
                  {userProfile.streak_days} days
                </div>
              </div>

              <div className="text-center border-l border-slate-800 pl-4 sm:pl-6">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                  <span>🌱</span> Eco Points
                </div>
                <div className="text-2xl font-black text-emerald-400 mt-0.5">
                  {userProfile.eco_points}
                </div>
              </div>

              <div className="text-center border-l border-slate-800 pl-4 sm:pl-6">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                  <span>🧹</span> Cleanups
                </div>
                <div className="text-2xl font-black text-purple-400 mt-0.5">
                  {userProfile.cleanups_attended}
                </div>
              </div>
            </div>

          </div>

          {/* Earned Badges Grid (Section 19) */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>Earned Scientific Badges</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {userProfile.badges.map((badge, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors text-xs space-y-1"
                >
                  <div className="text-xl">{badge.icon}</div>
                  <div className="font-bold text-slate-200">{badge.name}</div>
                  <div className="text-[11px] text-slate-400 leading-snug">{badge.desc}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Community Leaderboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Watershed Stewardship Leaderboard
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Recognizing dedicated stream monitors and volunteer coordinators.
            </p>
          </div>
          <span className="text-[11px] text-slate-400">Austin Watershed Basin</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Guardian</th>
                <th className="py-3 px-4">Role Badge</th>
                <th className="py-3 px-4">Observations</th>
                <th className="py-3 px-4">Cleanups</th>
                <th className="py-3 px-4 text-right">Eco Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {mockLeaderboard.map((item) => (
                <tr 
                  key={item.rank} 
                  className={`hover:bg-slate-800/40 transition-colors ${
                    item.isMe ? 'bg-cyan-950/20 font-semibold' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-bold text-slate-400">
                    {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`}
                  </td>
                  <td className="py-3 px-4 text-slate-100 flex items-center gap-1.5">
                    <span>{item.name}</span>
                    {item.isMe && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                        YOU
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{item.badge}</td>
                  <td className="py-3 px-4 text-slate-300">{item.reports}</td>
                  <td className="py-3 px-4 text-slate-300">{item.cleanups}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-400">
                    {item.points} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
