import {
  Stream, Observation, RiskAlert, PollutionCluster, CleanupEvent,
  CleanupVerification, ImpactTrackingRecord, OneHealthInsight,
  UserEcoProfile, DashboardStats, SettingsStatus, RiskExplanation
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`API error (${res.status}): ${errBody || res.statusText}`);
    }
    return await res.json();
  } catch (err: any) {
    console.warn(`[AquaGuardian API] Call to ${endpoint} failed:`, err.message);
    throw err;
  }
}

export const api = {
  // Dashboard
  getDashboard: () => fetchJson<DashboardStats>('/api/dashboard'),

  // Streams
  getStreams: () => fetchJson<Stream[]>('/api/streams'),
  getStream: (id: string) => fetchJson<Stream>(`/api/streams/${id}`),
  explainRisk: (streamId: string) => fetchJson<RiskExplanation>(`/api/streams/${streamId}/explain-risk`),

  // Observations
  getObservations: (streamId?: string) => 
    fetchJson<Observation[]>(streamId ? `/api/observations?stream_id=${streamId}` : '/api/observations'),
  submitObservation: (data: any) => 
    fetchJson<Observation>('/api/observations', { method: 'POST', body: JSON.stringify(data) }),

  // Early Warning & Clusters
  getAlerts: (streamId?: string) => 
    fetchJson<RiskAlert[]>(streamId ? `/api/alerts?stream_id=${streamId}` : '/api/alerts'),
  resolveAlert: (alertId: string) =>
    fetchJson<RiskAlert>(`/api/alerts/${alertId}/resolve`, { method: 'POST' }),
  getClusters: () => fetchJson<PollutionCluster[]>('/api/alerts/clusters/spatial'),

  // Cleanup Hub
  getCleanups: () => fetchJson<CleanupEvent[]>('/api/cleanup'),
  getCleanup: (id: string) => fetchJson<CleanupEvent>(`/api/cleanup/${id}`),
  createCleanup: (data: any) =>
    fetchJson<CleanupEvent>('/api/cleanup', { method: 'POST', body: JSON.stringify(data) }),
  joinCleanup: (id: string) =>
    fetchJson<CleanupEvent>(`/api/cleanup/${id}/join`, { method: 'POST' }),
  verifyCleanup: (id: string, data: any) =>
    fetchJson<CleanupVerification>(`/api/cleanup/${id}/verify`, { method: 'POST', body: JSON.stringify(data) }),

  // Impact Tracking
  getImpactRecords: () => fetchJson<ImpactTrackingRecord[]>('/api/impact'),
  getStreamImpact: (streamId: string) => fetchJson<ImpactTrackingRecord>(`/api/impact/${streamId}`),

  // One Health
  getInsights: (streamId?: string) =>
    fetchJson<OneHealthInsight[]>(streamId ? `/api/insights?stream_id=${streamId}` : '/api/insights'),

  // Community
  getUserProfile: () => fetchJson<UserEcoProfile>('/api/community/profile'),

  // Settings
  getSettings: () => fetchJson<SettingsStatus>('/api/settings'),

  // Grounded AI Query
  askAIAssistant: (message: string, streamId?: string) =>
    fetchJson<{ reply: string; evidence_citations: any[]; confidence: number; suggested_followups: string[] }>(
      '/api/ai/query',
      { method: 'POST', body: JSON.stringify({ message, stream_id: streamId }) }
    ),
};
