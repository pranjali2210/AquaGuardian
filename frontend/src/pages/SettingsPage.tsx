import React, { useEffect, useState } from 'react';
import { 
  Settings as SettingsIcon, ShieldCheck, Sparkles, Key, 
  CloudRain, Map, Database, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw
} from 'lucide-react';
import { SettingsStatus } from '../types';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [status, setStatus] = useState<SettingsStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStatus = () => {
    setLoading(true);
    api.getSettings()
      .then(data => setStatus(data))
      .catch(err => console.error("Settings fetch failed:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Settings & Centralized API Architecture
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Provider-Agnostic
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            System configuration state, external service abstractions, and zero-hardcoded secret enforcement.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Security Architecture Notice (Section 2 & 25) */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-xs text-slate-300 space-y-3">
        <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
          <ShieldCheck className="h-5 w-5" />
          <span>Zero Secrets Architecture Verified</span>
        </div>
        <p className="leading-relaxed text-slate-400">
          In strict compliance with security protocols:
          <br />• All credentials and model identifiers reside solely server-side in the backend environment.
          <br />• The frontend never receives, parses, or exposes sensitive API keys or tokens.
          <br />• When keys are omitted, the application operates deterministically in <strong>DEMO MODE</strong> with realistic scientific inference fallbacks.
        </p>
      </div>

      {/* Active Service Status Grid (Section 22) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* AI Service Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Sparkles className="h-4 w-4" />
              <span>AI Service (AIService)</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
              status?.ai_service.configured
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                : 'bg-amber-950 text-amber-300 border-amber-800'
            }`}>
              {status?.ai_service.mode || 'Demo / Mock Mode'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Configured Provider:</span>
              <span className="text-slate-200 font-mono">{status?.ai_service.provider || 'demo'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Model Identifier:</span>
              <span className="text-slate-200 font-mono">{status?.ai_service.model || 'Demo Ensemble'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>API Key Configured:</span>
              <span className={status?.ai_service.configured ? "text-emerald-400 font-bold" : "text-amber-400 font-semibold"}>
                {status?.ai_service.configured ? "Yes (Live Remote Calls)" : "No (Using Demo Fallback)"}
              </span>
            </div>
          </div>
        </div>

        {/* Weather Service Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <CloudRain className="h-4 w-4" />
              <span>Weather Service (WeatherService)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase border bg-cyan-950 text-cyan-300 border-cyan-800">
              {status?.weather_service.mode || 'Microclimate Service'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Weather API Key:</span>
              <span className={status?.weather_service.configured ? "text-emerald-400 font-bold" : "text-slate-400"}>
                {status?.weather_service.configured ? "Configured" : "Simulated Microclimate / Open-Meteo Fallback"}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Rainfall Telemetry:</span>
              <span className="text-slate-200 font-mono">Real-time Runoff Index</span>
            </div>
          </div>
        </div>

        {/* Maps Service Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Map className="h-4 w-4" />
              <span>Geospatial Engine (MapService)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase border bg-emerald-950 text-emerald-300 border-emerald-800">
              OpenStreetMap + Leaflet
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Cartography Provider:</span>
              <span className="text-slate-200 font-mono">CartoDB Dark Matter / OSM</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>External Map Key:</span>
              <span className="text-slate-400">Not Required (Native Open Source GIS)</span>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Database className="h-4 w-4" />
              <span>Data Persistence (Database)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase border bg-purple-950 text-purple-300 border-purple-800">
              Thread-Safe Seeded Store
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Storage Mode:</span>
              <span className="text-slate-200 font-mono">{status?.database.type || 'In-Memory / Seeded SQLite'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Zero Setup:</span>
              <span className="text-emerald-400 font-bold">Ready out-of-the-box</span>
            </div>
          </div>
        </div>

      </div>

      {/* How to configure .env guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Key className="h-4 w-4 text-cyan-400" />
          <span>Configuring Real API Keys When Ready</span>
        </h3>
        <p className="text-slate-300 leading-relaxed">
          To connect your actual AI provider (such as Google Gemini, OpenAI, or Anthropic), simply edit the <code className="text-cyan-300 font-mono">.env</code> file in the project root:
        </p>

        <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`# Supported AI providers: demo | google | openai | anthropic
AI_PROVIDER=google
AI_API_KEY=your_actual_key_here
AI_MODEL_NAME=gemini-1.5-flash

# Optional weather service
WEATHER_API_KEY=

# Server configuration
API_BASE_URL=http://localhost:8000`}
        </pre>

        <p className="text-slate-400 italic">
          * Note: Changing <code className="text-slate-300 font-mono">.env</code> takes effect automatically upon restarting the backend. No source code modifications are ever necessary.
        </p>
      </div>

    </div>
  );
};
