import React, { useEffect, useState } from 'react';
import { 
  HelpCircle, ShieldAlert, CheckCircle2, AlertTriangle, 
  ExternalLink, Sparkles, Brain, Cpu, Loader2, X
} from 'lucide-react';
import { Stream, RiskExplanation } from '../types';
import { api } from '../services/api';

interface ExplainRiskModalProps {
  stream: Stream | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReport?: (stream: Stream) => void;
}

export const ExplainRiskModal: React.FC<ExplainRiskModalProps> = ({
  stream,
  isOpen,
  onClose,
  onOpenReport
}) => {
  const [explanation, setExplanation] = useState<RiskExplanation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && stream) {
      setLoading(true);
      setError(null);
      api.explainRisk(stream.id)
        .then((data) => setExplanation(data))
        .catch((err) => {
          console.error("Failed to load explanation:", err);
          setError("Unable to generate live explanation. Displaying offline risk decomposition.");
        })
        .finally(() => setLoading(false));
    } else {
      setExplanation(null);
    }
  }, [isOpen, stream]);

  if (!isOpen || !stream) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'MODERATE': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        
        {/* Top Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-950/90 border border-indigo-700/60 flex items-center justify-center text-indigo-400">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Explainable AI: Why is this stream at risk?
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Evaluating {stream.name} • Prototype Health Score: {stream.health_score}/100
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
              <p className="text-xs text-slate-400">Synthesizing spatial, sensory, and hydrologic indicators...</p>
            </div>
          ) : explanation ? (
            <>
              {/* Risk Level & Confidence Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Assessed Risk Level
                    </div>
                    <span className={`inline-block mt-1 px-2.5 py-1 rounded-md text-xs font-black border uppercase tracking-wider ${getRiskColor(explanation.risk_level)}`}>
                      {explanation.risk_level} RISK
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      AI Synthesis Confidence
                    </div>
                    <div className="flex items-baseline justify-end gap-1 mt-0.5">
                      <span className="text-xl font-black text-cyan-400">{explanation.overall_confidence}%</span>
                      <span className="text-xs text-slate-500">probabilistic</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Natural Language AI Summary */}
              <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-xl p-4 text-xs text-indigo-200/90 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-indigo-300 mb-1.5 text-xs">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Synthesized Diagnostic Rationale</span>
                </div>
                {explanation.summary}
              </div>

              {/* Factors Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Contributing Environmental Risk Factors
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {explanation.factors.length} Corroborating Signals
                  </span>
                </div>

                <div className="space-y-2.5">
                  {explanation.factors.map((factor, idx) => (
                    <div 
                      key={idx}
                      className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-lg p-3.5 transition-colors text-xs"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="font-semibold text-slate-200 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                          <span>{factor.factor_name}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                          factor.impact === 'HIGH' ? 'bg-red-950/80 text-red-300 border-red-800' :
                          factor.impact === 'MODERATE' ? 'bg-amber-950/80 text-amber-300 border-amber-800' :
                          'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        }`}>
                          {factor.impact} IMPACT
                        </span>
                      </div>
                      
                      <p className="text-slate-300 mb-2 leading-relaxed">
                        {factor.description}
                      </p>

                      <div className="bg-slate-900/90 border border-slate-800 rounded p-2 text-[11px] text-slate-400">
                        <strong className="text-slate-300 font-semibold">Corroborating Evidence:</strong> {factor.evidence}
                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                          <span>Verification Factor: Estimated</span>
                          <span>Factor Confidence: {factor.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Next Step */}
              <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-4 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-400 mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Recommended Action</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {explanation.recommended_action}
                </p>
              </div>

              {/* Responsible AI Disclaimer (Prompt Requirement: Section 9 & 30) */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 leading-normal flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 font-semibold">Responsible AI Transparency Notice:</strong> {explanation.disclaimer}
                  <div className="text-[10px] text-slate-500 mt-1">
                    Labels applied: <span className="text-slate-400 font-medium">"Potential"</span>, <span className="text-slate-400 font-medium">"Estimated"</span>, <span className="text-slate-400 font-medium">"AI-assisted assessment"</span>, <span className="text-slate-400 font-medium">"Requires verification"</span>.
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              No explanation data available.
            </div>
          )}

        </div>

        {/* Footer CTAs */}
        <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-4 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-indigo-400" />
            <span>Model: {explanation?.ai_model_note || "AquaGuardian AI Ensemble"}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            {onOpenReport && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReport(stream);
                }}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                Submit Corroborating Observation
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
