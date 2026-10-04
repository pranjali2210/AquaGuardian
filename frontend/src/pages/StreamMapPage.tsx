import React, { useState } from 'react';
import { Map, Filter, Layers, Info } from 'lucide-react';
import { Stream, PollutionCluster } from '../types';
import { StreamMap } from '../components/StreamMap';
import { StreamHealthCard } from '../components/StreamHealthCard';

interface StreamMapPageProps {
  streams: Stream[];
  clusters: PollutionCluster[];
  selectedStream: Stream | null;
  onSelectStream: (stream: Stream) => void;
  onOpenReportModal: () => void;
  onOpenExplainRisk: (stream: Stream) => void;
  onNavigate: (tab: string) => void;
}

export const StreamMapPage: React.FC<StreamMapPageProps> = ({
  streams,
  clusters,
  selectedStream,
  onSelectStream,
  onOpenReportModal,
  onOpenExplainRisk,
  onNavigate
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredStreams = streams.filter(s => {
    if (statusFilter === 'ALL') return true;
    return s.status.toUpperCase() === statusFilter.toUpperCase();
  });

  return (
    <div className="space-y-5">
      
      {/* Page Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Map className="h-5 w-5 text-cyan-400" />
            <span>Interactive Watershed Stream Map</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Geospatial tracking of riparian conditions, spatial pollution clusters, and volunteer cleanup zones.
          </p>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {['ALL', 'Healthy', 'Watch', 'At Risk', 'Cleanup Required', 'Recently Cleaned'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                statusFilter === st
                  ? 'bg-cyan-600 text-white font-bold shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map View & Selected Stream Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className={`${selectedStream ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all`}>
          <StreamMap
            streams={filteredStreams}
            clusters={clusters}
            selectedStreamId={selectedStream?.id}
            onSelectStream={onSelectStream}
            height="580px"
          />
        </div>

        {selectedStream && (
          <div className="lg:col-span-5 space-y-4 animate-fadeIn">
            <StreamHealthCard
              stream={selectedStream}
              onExplainRisk={onOpenExplainRisk}
              onReportObservation={onOpenReportModal}
              onViewCleanup={() => onNavigate('cleanup')}
              onClose={() => onSelectStream(null as any)}
            />
          </div>
        )}

      </div>

    </div>
  );
};
