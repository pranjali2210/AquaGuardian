import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, 
  X, Loader2, Image as ImageIcon, Sliders
} from 'lucide-react';
import { CleanupEvent, CleanupVerification } from '../types';
import { api } from '../services/api';

interface CleanupVerifyModalProps {
  cleanup: CleanupEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onVerified: (verification: CleanupVerification) => void;
}

export const CleanupVerifyModal: React.FC<CleanupVerifyModalProps> = ({
  cleanup,
  isOpen,
  onClose,
  onVerified
}) => {
  const [beforeUrl, setBeforeUrl] = useState<string>(
    cleanup?.before_photo_url || "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80"
  );
  const [afterUrl, setAfterUrl] = useState<string>(
    "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80"
  );
  const [volunteerNotes, setVolunteerNotes] = useState<string>("Volunteers cleared 12 bags of consumer plastic packaging and beverage cans.");
  const [verifying, setVerifying] = useState<boolean>(false);
  const [result, setResult] = useState<CleanupVerification | null>(null);

  if (!isOpen || !cleanup) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);

    try {
      const verif = await api.verifyCleanup(cleanup.id, {
        before_photo_url: beforeUrl,
        after_photo_url: afterUrl,
        volunteer_notes: volunteerNotes
      });
      setResult(verif);
      onVerified(verif);
    } catch (err) {
      console.error("Verification failed:", err);
    } finally {
      setVerifying(false);
    }
  };

  const handleDone = () => {
    setResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl relative">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-950/90 border border-purple-700/60 flex items-center justify-center text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                AI Cleanup Verification
              </h2>
              <p className="text-xs text-slate-400">
                Visual Differential Evaluation • {cleanup.title}
              </p>
            </div>
          </div>
          <button 
            onClick={handleDone}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {result ? (
            /* Verification Results View (Section 15) */
            <div className="space-y-5 animate-fadeIn">
              
              <div className="bg-emerald-950/40 border border-emerald-700/60 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-300 text-sm">
                    Cleanup Verified: {result.status}
                  </div>
                  <p className="text-xs text-emerald-200/90 mt-0.5">
                    Stream health index updated to 'Recently Cleaned' and +100 Community Eco Points recorded!
                  </p>
                </div>
              </div>

              {/* Before & After Visual Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>Before Cleanup</span>
                    <span className="text-red-400 font-semibold">High Litter Load</span>
                  </div>
                  <img 
                    src={result.before_photo_url} 
                    alt="Before Cleanup" 
                    className="h-36 w-full object-cover rounded-lg border border-slate-800" 
                  />
                  <div className="text-[11px] text-slate-400 mt-2">
                    {result.before_litter_level}
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>After Cleanup</span>
                    <span className="text-emerald-400 font-semibold">Restored Shoreline</span>
                  </div>
                  <img 
                    src={result.after_photo_url} 
                    alt="After Cleanup" 
                    className="h-36 w-full object-cover rounded-lg border border-slate-800" 
                  />
                  <div className="text-[11px] text-slate-400 mt-2">
                    {result.after_litter_level}
                  </div>
                </div>
              </div>

              {/* Improvement Gauge & AI Summary */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Estimated Visual Improvement
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-emerald-400">
                      {result.estimated_visual_improvement_pct}%
                    </span>
                    <span className="text-xs text-slate-500">improvement</span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${result.estimated_visual_improvement_pct}%` }}
                  />
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900 p-3 rounded-lg border border-slate-800">
                  "{result.ai_summary}"
                </p>

                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Next Step: {result.follow_up_recommended}</span>
                </div>
              </div>

              {/* Responsible AI Disclaimer (Prompt Requirement) */}
              <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg text-[11px] text-amber-200/80 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Verification Transparency:</strong> {result.disclaimer}
                </div>
              </div>

              <button
                onClick={handleDone}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md"
              >
                Close & View Impact Loop
              </button>

            </div>
          ) : (
            /* Upload Before & After Photos Form */
            <form onSubmit={handleVerify} className="space-y-5 text-xs">
              
              <p className="text-slate-300 leading-relaxed">
                Upload Before and After cleanup photos. AquaGuardian's visual differential model will assess surface debris clearance, unobstructed hydraulic flow, and assign community impact points.
              </p>

              {/* Before Photo */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  1. Before Cleanup Photo URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={beforeUrl}
                    onChange={(e) => setBeforeUrl(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                {beforeUrl && (
                  <img src={beforeUrl} alt="Before preview" className="h-24 w-full object-cover rounded-lg border border-slate-800 mt-2" />
                )}
              </div>

              {/* After Photo */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  2. After Cleanup Photo URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={afterUrl}
                    onChange={(e) => setAfterUrl(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                {afterUrl && (
                  <img src={afterUrl} alt="After preview" className="h-24 w-full object-cover rounded-lg border border-slate-800 mt-2" />
                )}
              </div>

              {/* Volunteer Field Notes */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Volunteer Notes / Litter Quantification
                </label>
                <textarea
                  rows={2}
                  value={volunteerNotes}
                  onChange={(e) => setVolunteerNotes(e.target.value)}
                  placeholder="e.g. 14 volunteers collected 12 bags of plastics, zero chemical hazards spotted..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Verify CTA */}
              <button
                type="submit"
                disabled={verifying}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20 transition-all disabled:opacity-50"
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Running Visual Differential AI Analysis...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Run AI Verification & Calculate Impact</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
