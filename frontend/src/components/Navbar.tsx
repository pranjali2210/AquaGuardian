import React, { useState, useRef, useEffect } from 'react';
import { 
  Droplets, Map, AlertTriangle, Sparkles, 
  Award, Activity, Settings as SettingsIcon, PlusCircle, CheckCircle2, ChevronDown
} from 'lucide-react';
import { UserEcoProfile } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile?: UserEcoProfile | null;
  onOpenReportModal: () => void;
  demoMode: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userProfile,
  onOpenReportModal,
  demoMode
}) => {
  // Primary navigation
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'map', label: 'Stream Map', icon: Map },
    { id: 'observations', label: 'Observations', icon: Droplets },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: '2 Active' },
    { id: 'cleanup', label: 'Cleanup Hub', icon: Sparkles },
  ];

  // Secondary pages: still routable, just not primary navigation
  const moreItems = [
    { id: 'impact', label: 'Impact Loop', icon: CheckCircle2 },
    { id: 'insights', label: 'One Health', icon: Droplets },
    { id: 'community', label: 'Community', icon: Award },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const [moreOpen, setMoreOpen] = useState<boolean>(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const isMoreActive = moreItems.some((i) => i.id === activeTab);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold">
              <Droplets className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  AquaGuardian
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                  One Health AI
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Urban Freshwater Early Warning & Action
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 border border-amber-800/50">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* More: secondary pages */}
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={moreOpen}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isMoreActive || moreOpen
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span>More</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {moreOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1 z-50"
                >
                  {moreItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        role="menuitem"
                        onClick={() => {
                          setActiveTab(item.id);
                          setMoreOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                          isActive
                            ? 'bg-slate-800 text-cyan-400'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* User Points + Quick Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Gamification status */}
            {userProfile && (
              <div 
                onClick={() => setActiveTab('community')}
                className="hidden md:flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-2.5 py-1 rounded-full cursor-pointer hover:border-emerald-500/50 transition-colors"
                title={`${userProfile.eco_points} Eco Points • ${userProfile.streak_days} Day Streak`}
              >
                <span className="text-xs">🔥</span>
                <span className="text-xs font-semibold text-amber-300">{userProfile.streak_days}d</span>
                <span className="text-slate-600">|</span>
                <span className="text-xs">🌱</span>
                <span className="text-xs font-semibold text-emerald-400">{userProfile.eco_points} pts</span>
              </div>
            )}

            {/* Report Observation CTA */}
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-semibold transition-all shadow-md shadow-cyan-900/20 active:scale-95"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Report</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-800/80 no-scrollbar">
          {[...navItems, ...moreItems].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
