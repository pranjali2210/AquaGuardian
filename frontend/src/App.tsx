import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DemoBanner } from './components/DemoBanner';
import { ObservationModal } from './components/ObservationModal';
import { ExplainRiskModal } from './components/ExplainRiskModal';
import { CleanupVerifyModal } from './components/CleanupVerifyModal';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';

import { DashboardPage } from './pages/DashboardPage';
import { StreamMapPage } from './pages/StreamMapPage';
import { ObservationsPage } from './pages/ObservationsPage';
import { AlertsPage } from './pages/AlertsPage';
import { CleanupHubPage } from './pages/CleanupHubPage';
import { ImpactPage } from './pages/ImpactPage';
import { OneHealthPage } from './pages/OneHealthPage';
import { CommunityPage } from './pages/CommunityPage';
import { SettingsPage } from './pages/SettingsPage';

import { 
  Stream, Observation, RiskAlert, PollutionCluster, 
  CleanupEvent, DashboardStats, UserEcoProfile, CleanupVerification 
} from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Data state
  const [streams, setStreams] = useState<Stream[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [clusters, setClusters] = useState<PollutionCluster[]>([]);
  const [cleanups, setCleanups] = useState<CleanupEvent[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userProfile, setUserProfile] = useState<UserEcoProfile | null>(null);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [demoMode, setDemoMode] = useState<boolean>(true);

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isExplainRiskOpen, setIsExplainRiskOpen] = useState<boolean>(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState<boolean>(false);
  const [selectedCleanupToVerify, setSelectedCleanupToVerify] = useState<CleanupEvent | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);

  // Initial data loading
  const loadAllData = async () => {
    try {
      const [
        streamsData,
        obsData,
        alertsData,
        clustersData,
        cleanupsData,
        statsData,
        profileData,
        settingsData
      ] = await Promise.all([
        api.getStreams(),
        api.getObservations(),
        api.getAlerts(),
        api.getClusters(),
        api.getCleanups(),
        api.getDashboard(),
        api.getUserProfile(),
        api.getSettings()
      ]);

      setStreams(streamsData);
      setObservations(obsData);
      setAlerts(alertsData);
      setClusters(clustersData);
      setCleanups(cleanupsData);
      setStats(statsData);
      setUserProfile(profileData);
      if (streamsData.length > 0 && !selectedStream) {
        setSelectedStream(streamsData[0]);
      }
      setDemoMode(!settingsData.ai_service.configured || settingsData.ai_service.provider === 'demo');
    } catch (err) {
      console.warn("Error fetching data from backend:", err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers for workflows
  const handleObservationCreated = (newObs: Observation) => {
    setObservations(prev => [newObs, ...prev]);
    // Refresh streams & stats to reflect new observation
    loadAllData();
  };

  const handleOpenExplainRisk = (stream: Stream) => {
    setSelectedStream(stream);
    setIsExplainRiskOpen(true);
  };

  const handleOpenVerifyModal = (cleanup: CleanupEvent) => {
    setSelectedCleanupToVerify(cleanup);
    setIsVerifyModalOpen(true);
  };

  const handleCleanupVerified = (verif: CleanupVerification) => {
    loadAllData();
  };

  const handleJoinCleanupSuccess = (updated: CleanupEvent) => {
    setCleanups(prev => prev.map(c => c.id === updated.id ? updated : c));
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        eco_points: userProfile.eco_points + 50,
        cleanups_attended: userProfile.cleanups_attended + 1
      });
    }
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_resolved: true } : a));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Demo Banner */}
      <DemoBanner 
        isDemo={demoMode} 
        onOpenSettings={() => setActiveTab('settings')} 
      />

      {/* Main Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        demoMode={demoMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
        {activeTab === 'dashboard' && (
          <DashboardPage
            stats={stats}
            streams={streams}
            observations={observations}
            alerts={alerts}
            clusters={clusters}
            cleanups={cleanups}
            selectedStream={selectedStream}
            onSelectStream={setSelectedStream}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenExplainRisk={handleOpenExplainRisk}
            onOpenVerifyModal={handleOpenVerifyModal}
            onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'map' && (
          <StreamMapPage
            streams={streams}
            clusters={clusters}
            selectedStream={selectedStream}
            onSelectStream={setSelectedStream}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenExplainRisk={handleOpenExplainRisk}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'observations' && (
          <ObservationsPage
            observations={observations}
            streams={streams}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsPage
            alerts={alerts}
            clusters={clusters}
            onResolveAlert={handleResolveAlert}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'cleanup' && (
          <CleanupHubPage
            cleanups={cleanups}
            streams={streams}
            onOpenVerifyModal={handleOpenVerifyModal}
            onJoinSuccess={handleJoinCleanupSuccess}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'impact' && (
          <ImpactPage />
        )}

        {activeTab === 'insights' && (
          <OneHealthPage />
        )}

        {activeTab === 'community' && (
          <CommunityPage
            userProfile={userProfile}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage />
        )}
      </main>

      {/* Modals & Slide-out Drawers */}
      <ObservationModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        streams={streams}
        selectedStream={selectedStream}
        onObservationCreated={handleObservationCreated}
      />

      <ExplainRiskModal
        stream={selectedStream}
        isOpen={isExplainRiskOpen}
        onClose={() => setIsExplainRiskOpen(false)}
        onOpenReport={() => setIsReportModalOpen(true)}
      />

      <CleanupVerifyModal
        cleanup={selectedCleanupToVerify}
        isOpen={isVerifyModalOpen}
        onClose={() => {
          setIsVerifyModalOpen(false);
          setSelectedCleanupToVerify(null);
        }}
        onVerified={handleCleanupVerified}
      />

      <AIAssistantDrawer
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        defaultStreamId={selectedStream?.id}
      />

      {/* Floating Ask AI trigger (reuses the existing AIAssistantDrawer above) */}
      {!isAIAssistantOpen && (
        <button
          type="button"
          onClick={() => setIsAIAssistantOpen(true)}
          className="fixed bottom-5 right-4 sm:right-6 z-30 flex items-center gap-2 px-3 py-2.5 sm:px-4 rounded-full bg-indigo-950/90 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/60 text-xs font-semibold shadow-lg shadow-indigo-950/40 backdrop-blur-md transition-colors"
          title="Open Grounded AI Assistant"
          aria-label="Ask AquaGuardian AI"
        >
          <span aria-hidden="true">✨</span>
          <span className="hidden sm:inline">Ask AquaGuardian AI</span>
        </button>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">AquaGuardian</span>
            <span>•</span>
            <span>AI-Assisted Citizen Freshwater Monitoring</span>
          </div>
          <div className="text-slate-500 text-center sm:text-right">
            Responsible AI Architecture: Outputs are probabilistic and support human ecological judgment.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
