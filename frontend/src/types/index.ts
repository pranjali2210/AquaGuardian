export type StreamStatus = 
  | 'Healthy' 
  | 'Watch' 
  | 'At Risk' 
  | 'Cleanup Required' 
  | 'Recently Cleaned';

export interface StreamIndicators {
  water_appearance_score: number;
  biodiversity_score: number;
  pollution_score: number;
  habitat_score: number;
  climate_stress_score: number;
}

export interface Stream {
  id: string;
  name: string;
  location_name: string;
  latitude: number;
  longitude: number;
  health_score: number;
  status: StreamStatus;
  length_km: number;
  catch_basin_desc: string;
  indicators: StreamIndicators;
  recent_observations_count: number;
  last_observation_time: string;
  cleanup_required: boolean;
  cleanup_priority: number;
  safe_for_citizen_action: boolean;
  special_hazard_warning?: string | null;
  historical_health_trend?: Array<{ month: string; score: number }>;
}

export interface AIAnalysis {
  id: string;
  observation_id?: string;
  timestamp: string;
  detected_indicators: string[];
  classification: string;
  potential_concern: string;
  confidence_score: number;
  evidence: string[];
  human_verification_recommended: boolean;
  rationale: string;
  model_used: string;
  is_simulated: boolean;
  disclaimer: string;
}

export interface Observation {
  id: string;
  stream_id: string;
  stream_name: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  water_appearance: string;
  smell: string;
  visible_litter: boolean;
  litter_type?: string;
  algae_present: boolean;
  algae_type?: string;
  aquatic_organisms?: string;
  vegetation?: string;
  unusual_events?: string;
  reporter_name: string;
  notes?: string;
  photo_url?: string;
  ai_analysis?: AIAnalysis;
}

export interface RiskFactor {
  factor_name: string;
  impact: string;
  description: string;
  evidence: string;
  confidence: number;
}

export interface RiskExplanation {
  stream_id: string;
  stream_name: string;
  risk_level: string;
  health_score: number;
  summary: string;
  factors: RiskFactor[];
  overall_confidence: number;
  ai_model_note: string;
  recommended_action: string;
  disclaimer: string;
}

export interface RiskAlert {
  id: string;
  stream_id: string;
  stream_name: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  location_desc: string;
  latitude: number;
  longitude: number;
  observation_count: number;
  radius_km: number;
  detected_indicators: string[];
  confidence: number;
  recommended_next_step: string;
  is_resolved: boolean;
  is_hazardous: boolean;
}

export interface PollutionCluster {
  id: string;
  stream_id: string;
  stream_name: string;
  title: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  observation_count: number;
  timeline_desc: string;
  primary_issues: string[];
  severity: string;
  confidence: number;
  affected_area_sqm: number;
  suggested_cleanup_zone: string;
}

export interface CleanupEvent {
  id: string;
  stream_id: string;
  stream_name: string;
  title: string;
  location_desc: string;
  latitude: number;
  longitude: number;
  date_str: string;
  time_str: string;
  status: 'Upcoming' | 'Active' | 'Completed';
  priority_score: number;
  priority_level: string;
  participants_count: number;
  max_participants: number;
  target_issue: string;
  estimated_duration_hours: number;
  equipment_needed: string[];
  safety_guidelines: string[];
  is_hazardous_warning: boolean;
  before_photo_url?: string;
  after_photo_url?: string;
  verification_summary?: string;
  visual_improvement_pct?: number;
}

export interface CleanupVerification {
  id: string;
  cleanup_id: string;
  stream_id: string;
  timestamp: string;
  before_photo_url: string;
  after_photo_url: string;
  before_litter_level: string;
  after_litter_level: string;
  estimated_visual_improvement_pct: number;
  status: string;
  ai_summary: string;
  confidence: number;
  follow_up_recommended: string;
  disclaimer: string;
}

export interface ImpactTimelineEvent {
  stage: string;
  date_str: string;
  health_score: number;
  summary: string;
  status_badge: string;
}

export interface ImpactTrackingRecord {
  stream_id: string;
  stream_name: string;
  initial_detection_score: number;
  post_cleanup_score: number;
  current_recovered_score: number;
  improvement_points: number;
  timeline: ImpactTimelineEvent[];
  ecological_observations: string;
}

export interface OneHealthInsight {
  id: string;
  stream_id: string;
  stream_name: string;
  title: string;
  ecosystem_health: string;
  biodiversity_nexus: string;
  human_wellbeing_link: string;
  cautious_statement: string;
  recommended_action: string;
  timestamp: string;
}

export interface UserEcoProfile {
  user_id: string;
  name: string;
  eco_points: number;
  streak_days: number;
  badges: Array<{ name: string; icon: string; desc: string }>;
  observations_count: number;
  cleanups_attended: number;
}

export interface DashboardStats {
  healthy_count: number;
  watch_count: number;
  at_risk_count: number;
  cleanup_required_count: number;
  total_streams: number;
  total_observations: number;
  active_alerts_count: number;
  upcoming_cleanups_count: number;
  verified_improvements_count: number;
  community_volunteers_count: number;
  avg_health_score: number;
}

export interface SettingsStatus {
  app_name: string;
  version: string;
  environment: string;
  ai_service: {
    provider: string;
    configured: boolean;
    model: string;
    mode: string;
  };
  weather_service: {
    configured: boolean;
    mode: string;
  };
  maps_service: {
    configured: boolean;
    mode: string;
  };
  database: {
    configured: boolean;
    type: string;
  };
}
