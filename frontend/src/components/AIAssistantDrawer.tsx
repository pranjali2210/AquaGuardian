import React, { useState } from 'react';
import { 
  MessageSquareText, Send, Sparkles, Brain, Bot, 
  User, CheckCircle2, ExternalLink, X, Loader2
} from 'lucide-react';
import { api } from '../services/api';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStreamId?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: Array<{ source: string; timestamp: string; confidence: number }>;
  followups?: string[];
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  defaultStreamId
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: "Hello! I am AquaGuardian's Grounded Environmental AI Assistant. I synthesize live watershed indicators, spatial clusters, and volunteer reports to answer questions about stream health and interventions without inventing measurements.",
      timestamp: 'Just now',
      followups: [
        'Why is Mill Creek at risk?',
        'Where are the highest-priority cleanup zones?',
        'What changed this week?',
        'What evidence supports the active alerts?'
      ]
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.askAIAssistant(query, defaultStreamId);
      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: 'Just now',
        citations: res.evidence_citations,
        followups: res.suggested_followups
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("AI query failed:", err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: "I encountered an error querying the watershed knowledge base. Please check backend connection.",
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-slideLeft">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Watershed AI Assistant</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                Grounded
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Trained on actual citizen observations & streams</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div 
            key={m.id}
            className={`flex gap-2.5 text-xs ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="h-6 w-6 rounded-full bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
                <Bot className="h-3.5 w-3.5" />
              </div>
            )}

            <div className={`max-w-[85%] rounded-xl p-3 leading-relaxed ${
              m.sender === 'user'
                ? 'bg-cyan-600 text-white font-medium rounded-br-none shadow-md shadow-cyan-950/30'
                : 'bg-slate-950/90 text-slate-200 border border-slate-800 rounded-bl-none shadow-sm'
            }`}>
              <div className="whitespace-pre-line">{m.text}</div>

              {/* Evidence Citations (Section 18 Requirement) */}
              {m.citations && m.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    Verified Evidence Citations:
                  </div>
                  {m.citations.map((cite, ci) => (
                    <div key={ci} className="bg-slate-900 px-2 py-1 rounded text-[10px] text-slate-300 flex items-center justify-between border border-slate-800">
                      <span>• {cite.source}</span>
                      <span className="text-cyan-400 font-semibold">{cite.confidence}% conf.</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Follow-up Prompts */}
              {m.followups && m.followups.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5">
                  {m.followups.map((f, fi) => (
                    <button
                      key={fi}
                      onClick={() => handleSend(f)}
                      className="px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-850 text-indigo-300 border border-slate-800 text-[10px] hover:border-indigo-500/50 transition-colors text-left"
                    >
                      {f} →
                    </button>
                  ))}
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="h-6 w-6 rounded-full bg-cyan-700 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 text-xs">
            <div className="h-6 w-6 rounded-full bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-2 text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
              <span>Querying watershed telemetry and observations...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about stream risks, alerts, cleanup priority..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <p className="text-[10px] text-slate-500 mt-1.5 text-center">
          Answers grounded in application observations. Never replaces laboratory testing.
        </p>
      </div>

    </div>
  );
};
