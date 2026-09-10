import React, { useState, useRef, useEffect } from 'react';
import { useOfficer } from '../context/OfficerContext';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  AlertTriangle, 
  RotateCcw, 
  ChevronDown, 
  HelpCircle,
  BookOpen,
  Target,
  Calendar,
  Layers
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  { icon: Target, text: "Explain my recommended competency." },
  { icon: BookOpen, text: "Why was this course recommended for my role?" },
  { icon: HelpCircle, text: "Explain this topic in simple language." },
  { icon: Layers, text: "Help me understand my skill gap." },
  { icon: Sparkles, text: "Give me practice questions related to this competency." },
  { icon: Calendar, text: "Help me create a learning plan." },
  { icon: BookOpen, text: "Explain uploaded learning material." }
];

export default function AIAssistantChatbox({ isOpen, onClose }) {
  const { 
    profile, 
    competenciesData, 
    skillGaps, 
    roadmap, 
    recommendations, 
    progressRecords,
    aiConfigured 
  } = useOfficer();

  const [messages, setMessages] = useState(() => {
    return [
      {
        id: 'initial-greeting',
        role: 'assistant',
        content: `Namaste ${profile?.name ? 'Officer ' + profile.name.split(' ').pop() : 'Officer'}! I am your **Samarthya AI Assistant**, personalized for your assignment in **${profile?.currentAssignment || 'Official Statistics'}** (${profile?.jobRole || 'MoSPI'}).\n\nI can help you understand your recommended competencies, skill gaps, official iGOT & NSSTA courses, or formulate customized learning plans and practice questions. How can I assist you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverAiConfigured, setServerAiConfigured] = useState(aiConfigured);
  const [errorMessage, setErrorMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setErrorMessage(null);

    // Prepare active officer context payload
    const context = {
      profile: {
        name: profile?.name,
        designation: profile?.designation,
        jobRole: profile?.jobRole,
        department: profile?.department,
        currentAssignment: profile?.currentAssignment,
        specialization: profile?.specialization,
        previousTraining: profile?.previousTraining,
        careerGoals: profile?.careerGoals
      },
      skillGaps: (skillGaps || []).map(g => ({
        competencyId: g.competencyId,
        competencyName: g.competencyName,
        actualLevel: g.actualLevel,
        requiredLevel: g.requiredLevel,
        gapSeverity: g.gapSeverity,
        diff: g.diff,
        aiReasoning: g.aiReasoning,
        whyImportant: g.whyImportant
      })),
      roadmap: (roadmap || []).map(r => ({
        priorityRank: r.priorityRank,
        milestoneTitle: r.milestoneTitle,
        requiredLevel: r.requiredLevel,
        estHours: r.estHours,
        phase: r.phase
      })),
      recommendations: (recommendations || []).map(rec => ({
        title: rec.title,
        provider: rec.provider,
        competencyName: rec.competencyName,
        mode: rec.mode,
        duration: rec.duration,
        officialUrl: rec.officialCourseUrl || rec.officialUrl
      })),
      progressRecords: (progressRecords || []).map(p => ({
        courseName: p.courseName || p.competencyName,
        score: p.score || p.quizScore
      }))
    };

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          userId: profile?.id || 'usr-001',
          context
        })
      });

      const data = await response.json();

      if (data.aiConfigured === false) {
        setServerAiConfigured(false);
        setErrorMessage(data.error || 'AI is not configured. OPENAI_API_KEY is missing from the backend environment.');
      } else if (!data.success) {
        setErrorMessage(data.error || 'Failed to get response from AI assistant.');
      } else {
        setServerAiConfigured(true);
        const assistantMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error('[AIAssistantChatbox] Network error:', err);
      setErrorMessage('Network connection error. Could not connect to backend AI service.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'initial-greeting-reset',
        role: 'assistant',
        content: `Conversation refreshed. How else can I assist with your **${profile?.currentAssignment || 'Official Statistics'}** competency goals?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setErrorMessage(null);
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '440px',
        maxWidth: 'calc(100vw - 32px)',
        height: '620px',
        maxHeight: 'calc(100vh - 48px)',
        background: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(12, 35, 64, 0.35), 0 0 0 1px rgba(12, 35, 64, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 9999,
        overflow: 'hidden',
        fontFamily: 'inherit',
        animation: 'slideUpChat 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <style>{`
        @keyframes slideUpChat {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Header */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #071528 0%, #0C2340 60%, #143258 100%)',
          color: '#FFFFFF',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #FF9933'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(255, 153, 51, 0.2)',
              border: '1px solid #FF9933',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bot size={20} color="#FF9933" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Samarthya AI Assistant</span>
              <span className="badge badge-saffron" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>MoSPI</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#CBD5E1', marginTop: '1px' }}>
              {profile?.name ? `${profile.name} • ${profile.jobRole || 'Officer'}` : 'Official Learning Counselor'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={handleResetChat}
            title="Clear conversation"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'}
            onMouseOut={(e) => e.currentTarget.style.color = '#94A3B8'}
          >
            <RotateCcw size={16} />
          </button>

          <button
            type="button"
            onClick={onClose}
            title="Close Assistant"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Context Indicator Strip */}
      <div 
        style={{
          background: '#F1F5F9',
          padding: '8px 16px',
          fontSize: '0.72rem',
          color: '#475569',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Active: <strong>{profile?.currentAssignment || 'Official Statistics'}</strong>
        </div>
        <div style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
          Context Active
        </div>
      </div>

      {/* AI Not Configured Alert Banner */}
      {(!serverAiConfigured || errorMessage) && (
        <div 
          style={{
            background: '#FFFBEB',
            borderBottom: '1px solid #FED7AA',
            padding: '10px 16px',
            fontSize: '0.78rem',
            color: '#92400E',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}
        >
          <AlertTriangle size={16} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>AI Configuration Status:</strong> {errorMessage || 'AI is not configured. OPENAI_API_KEY is missing from backend environment. The assistant is running in ready-state.'}
          </div>
        </div>
      )}

      {/* Message History */}
      <div 
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          background: '#FAFAFA'
        }}
      >
        {messages.map(msg => {
          const isUser = msg.role === 'user';
          return (
            <div 
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                gap: '4px'
              }}
            >
              <div 
                style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: isUser ? '#0C2340' : '#FFFFFF',
                  color: isUser ? '#FFFFFF' : '#0C2340',
                  boxShadow: isUser ? 'none' : '0 2px 6px rgba(0,0,0,0.06)',
                  border: isUser ? 'none' : '1px solid #E2E8F0',
                  fontSize: '0.86rem',
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {/* Simple bold markdown renderer */}
                {msg.content.split('\n').map((line, lIdx) => {
                  // Format bullet points
                  const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('• ');
                  const cleanLine = isBullet ? line.trim().substring(2) : line;

                  // Parse bold text **text**
                  const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

                  return (
                    <div key={lIdx} style={{ marginBottom: line === '' ? '8px' : '2px', paddingLeft: isBullet ? '12px' : '0' }}>
                      {isBullet && <span style={{ marginRight: '6px', color: isUser ? '#FF9933' : '#E65100' }}>•</span>}
                      {parts.map((p, pIdx) => {
                        if (p.startsWith('**') && p.endsWith('**')) {
                          return <strong key={pIdx} style={{ color: isUser ? '#FFFFFF' : '#0C2340' }}>{p.slice(2, -2)}</strong>;
                        }
                        return <span key={pIdx}>{p}</span>;
                      })}
                    </div>
                  );
                })}
              </div>

              <span style={{ fontSize: '0.65rem', color: '#94A3B8', padding: '0 4px' }}>
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#FFFFFF', borderRadius: '12px', width: 'fit-content', border: '1px solid #E2E8F0' }}>
            <Sparkles size={14} color="#FF9933" className="animate-spin" />
            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Counselor is reviewing your roadmap...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div 
        style={{
          padding: '8px 12px',
          background: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}
      >
        {SUGGESTED_PROMPTS.map((prompt, idx) => {
          const Icon = prompt.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt.text)}
              disabled={loading}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '0.72rem',
                color: '#334155',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                flexShrink: 0,
                transition: 'all 0.15s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#FF9933';
                e.currentTarget.style.color = '#C2410C';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#CBD5E1';
                e.currentTarget.style.color = '#334155';
              }}
            >
              <Icon size={11} color="#E65100" />
              <span>{prompt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Message Input Bar */}
      <div 
        style={{
          padding: '12px 16px',
          background: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI Counselor about competencies, courses, gaps..."
          rows={1}
          style={{
            flex: 1,
            resize: 'none',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            padding: '10px 12px',
            fontSize: '0.85rem',
            fontFamily: 'inherit',
            outline: 'none',
            maxHeight: '80px',
            lineHeight: 1.4
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#0C2340'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#CBD5E1'}
        />

        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={!input.trim() || loading}
          style={{
            background: input.trim() && !loading ? '#0C2340' : '#E2E8F0',
            color: input.trim() && !loading ? '#FFFFFF' : '#94A3B8',
            border: 'none',
            borderRadius: '10px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s',
            flexShrink: 0
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
