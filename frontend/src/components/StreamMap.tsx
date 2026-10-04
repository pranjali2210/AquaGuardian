import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Stream, PollutionCluster } from '../types';

interface StreamMapProps {
  streams: Stream[];
  clusters: PollutionCluster[];
  selectedStreamId?: string | null;
  onSelectStream: (stream: Stream) => void;
  height?: string;
}

export const StreamMap: React.FC<StreamMapProps> = ({
  streams,
  clusters,
  selectedStreamId,
  onSelectStream,
  height = '500px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Status to badge styling mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy':
        return '#10b981'; // emerald-500
      case 'Watch':
        return '#f59e0b'; // amber-500
      case 'At Risk':
        return '#ef4444'; // red-500
      case 'Cleanup Required':
        return '#8b5cf6'; // violet-500
      case 'Recently Cleaned':
        return '#06b6d4'; // cyan-500
      default:
        return '#64748b';
    }
  };

  const getStatusIconEmoji = (status: string) => {
    switch (status) {
      case 'Healthy': return '🟢';
      case 'Watch': return '🟡';
      case 'At Risk': return '🔴';
      case 'Cleanup Required': return '🧹';
      case 'Recently Cleaned': return '✅';
      default: return '📍';
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center around Austin watershed
      const map = L.map(mapContainerRef.current, {
        center: [30.2625, -97.7400],
        zoom: 13,
        zoomControl: true,
      });

      // Standard public OpenStreetMap tiles (no API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers and clusters when data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // Render spatial pollution cluster radius circles
    clusters.forEach((cluster) => {
      const circle = L.circle([cluster.latitude, cluster.longitude], {
        color: cluster.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b',
        fillColor: cluster.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b',
        fillOpacity: 0.18,
        weight: 1.5,
        dashArray: '4, 4',
        radius: cluster.radius_meters || 300
      });

      circle.bindTooltip(`
        <div style="font-size:11px; padding:2px;">
          <div style="font-weight:700; color:#f87171;">⚠️ ${cluster.title}</div>
          <div style="color:#94a3b8;">${cluster.observation_count} clustered citizen reports (${cluster.affected_area_sqm} m²)</div>
        </div>
      `, { permanent: false, direction: 'top' });

      circle.addTo(markersLayer);
    });

    // Render stream markers
    streams.forEach((stream) => {
      const isSelected = selectedStreamId === stream.id;
      const color = getStatusColor(stream.status);
      const emoji = getStatusIconEmoji(stream.status);

      const customIcon = L.divIcon({
        className: 'custom-stream-pin',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? '38px' : '32px'};
            height: ${isSelected ? '38px' : '32px'};
            border-radius: 50%;
            background: #0f172a;
            border: 2.5px solid ${color};
            box-shadow: 0 0 ${isSelected ? '15px' : '8px'} ${color}99;
            font-size: ${isSelected ? '16px' : '13px'};
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            <span>${emoji}</span>
          </div>
        `,
        iconSize: [isSelected ? 38 : 32, isSelected ? 38 : 32],
        iconAnchor: [isSelected ? 19 : 16, isSelected ? 19 : 16],
      });

      const marker = L.marker([stream.latitude, stream.longitude], { icon: customIcon });

      marker.on('click', () => {
        onSelectStream(stream);
      });

      marker.bindTooltip(`
        <div style="font-size:12px; font-weight:600; padding:2px 4px;">
          <span style="color:${color};">${emoji} ${stream.name}</span>
          <div style="font-size:10px; color:#94a3b8; font-weight:normal;">Score: ${stream.health_score}/100 • ${stream.status}</div>
        </div>
      `, { direction: 'top', offset: [0, -10] });

      marker.addTo(markersLayer);
    });

    // Fit bounds if streams available
    if (streams.length > 0) {
      const bounds = L.latLngBounds(streams.map(s => [s.latitude, s.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [streams, clusters, selectedStreamId]);

  return (
    <div
      className="relative isolate w-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900"
      style={{ position: 'relative', overflow: 'hidden', height: height === '100%' ? '100%' : undefined }}
    >
      {/* Map Element (isolated stacking context keeps Leaflet panes/controls inside this container) */}
      <div ref={mapContainerRef} style={{ height, width: '100%', minHeight: '300px', position: 'relative' }} />

      {/* Accessible Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-lg shadow-lg text-[11px] flex flex-wrap gap-3 items-center">
        <span className="font-bold text-slate-300 mr-1 text-[10px] uppercase tracking-wider">Statuses:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
          <span className="text-slate-300">Healthy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span>
          <span className="text-slate-300">Watch</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></span>
          <span className="text-slate-300">At Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50"></span>
          <span className="text-slate-300">Cleanup Req.</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50"></span>
          <span className="text-slate-300">Cleaned</span>
        </div>
        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
          <span className="w-3 h-3 rounded-full border border-dashed border-red-400 bg-red-500/20"></span>
          <span className="text-red-300">Pollution Cluster</span>
        </div>
      </div>
    </div>
  );
};
