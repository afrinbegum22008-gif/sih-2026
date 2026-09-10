import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOfficer } from '../context/OfficerContext';
import { BrainCircuit, Clock, CheckCircle2, ArrowRight, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdaptiveAssessmentPage() {
  const { user } = useAuth();
  const { setActiveTab, refreshAllData } = useOfficer();

  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [completedSummary, setCompletedSummary] = useState(null);

  // Start or restart session
  const startAssessment = async () => {
    setLoading(true);
    setCompletedSummary(null);
    setSelectedOption(null);
    try {
      const res = await fetch('/api/assessment/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id || 'usr-001' })
      });
      const data = await res.json();
      setSession(data);
      setTimerSeconds(60);
    } catch (err) {
      console.error('Failed to start assessment:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startAssessment();
  }, [user?.id]);

  // Timer countdown
  useEffect(() => {
    if (!session || session.completed || completedSummary) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [session, completedSummary]);

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/assessment/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          questionId: session.question?.id,
          selectedOption,
          timeSpentSeconds: 60 - timerSeconds
        })
      });
      const data = await res.json();

      if (data.completed) {
        setCompletedSummary(data);
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        await refreshAllData();
      } else {
        setSession(prev => ({
          ...prev,
          currentStep: data.currentStep,
          totalQuestions: data.totalQuestions || prev.totalQuestions || 25,
          totalCompetencies: data.totalCompetencies || prev.totalCompetencies || 5,
          currentCompIndex: data.currentCompIndex ?? prev.currentCompIndex ?? 0,
          questionNumberInSubject: data.questionNumberInSubject || 1,
          totalInSubject: data.totalInSubject || 5,
          competency: data.competency,
          currentDifficulty: data.currentDifficulty,
          question: data.question
        }));
        setSelectedOption(null);
        setTimerSeconds(60);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 1:
        return <span className="badge badge-slate">Level 1 • Foundational / Beginner</span>;
      case 2:
        return <span className="badge badge-amber">Level 2 • Operational / Intermediate</span>;
      case 3:
        return <span className="badge badge-saffron">Level 3 • Advanced / Specialized</span>;
      default:
        return <span className="badge badge-slate">Adaptive Level</span>;
    }
  };

  if (loading) {
    return (
      <div className="app-container main-content" style={{ textAlign: 'center', padding: '60px 0' }}>
        <BrainCircuit size={48} color="#FF9933" style={{ animation: 'spin 2s linear infinite' }} />
        <h2 style={{ marginTop: '16px', color: '#0C2340' }}>Calibrating Adaptive Engine...</h2>
        <p style={{ color: '#64748B' }}>Fetching role-specific questions and baseline difficulty from your self-ratings.</p>
      </div>
    );
  }

  // Error Screen (e.g., OPENAI_API_KEY is not configured)
  if (session?.error) {
    return (
      <div className="app-container main-content">
        <div className="card" style={{ maxWidth: '780px', margin: '40px auto', textAlign: 'center', padding: '40px 32px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEF2F2', color: '#DC2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <ShieldAlert size={36} />
          </div>

          <div className="badge badge-saffron" style={{ marginBottom: '12px' }}>
            Backend AI Engine Notice
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0C2340', marginBottom: '12px' }}>
            {session.error}
          </h1>
          <p style={{ color: '#64748B', maxWidth: '580px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
            {session.message || 'Adaptive questions are generated dynamically by real OpenAI inference. Please configure OPENAI_API_KEY in the server environment (.env) to generate real adaptive assessment questions.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button className="btn btn-navy" onClick={startAssessment}>
              Retry Connection
            </button>
            <button className="btn btn-outline" onClick={() => setActiveTab('profile')}>
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Completed Screen
  if (completedSummary) {
    return (
      <div className="app-container main-content">
        <div className="card" style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center', padding: '40px 32px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ECFDF5', color: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <CheckCircle2 size={36} />
          </div>

          <div className="badge badge-emerald" style={{ marginBottom: '12px' }}>
            Adaptive Assessment Completed
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0C2340' }}>
            Competency Evaluation Complete
          </h1>
          <p style={{ color: '#64748B', maxWidth: '560px', margin: '8px auto 24px auto' }}>
            The AI engine has recorded your adaptive response trajectory, verified correctness across varying difficulty levels, and calculated your actual demonstrated competencies.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', margin: '24px 0', background: '#F8FAFC', padding: '20px', borderRadius: '12px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Overall Score</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0C2340' }}>{completedSummary.overallScore}%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Total Questions Correct</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669' }}>
                {completedSummary.correctCount} / {completedSummary.totalQuestions || 25}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Subjects Evaluated</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#E65100' }}>
                {Object.keys(completedSummary.competencyScores || {}).length}
              </div>
            </div>
          </div>

          {/* Subject-Wise Performance Breakdown (5 questions per subject) */}
          <div style={{ marginTop: '24px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0C2340', marginBottom: '12px' }}>
              Subject-Wise Performance & Baseline Levels (5 Questions Per Subject)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(completedSummary.competencyScores || {}).map(([compId, scoreData], sIdx) => {
                const levelColor = scoreData.demonstratedLevel === 'Advanced' ? '#059669' : scoreData.demonstratedLevel === 'Intermediate' ? '#D97706' : '#DC2626';
                const levelBg = scoreData.demonstratedLevel === 'Advanced' ? '#ECFDF5' : scoreData.demonstratedLevel === 'Intermediate' ? '#FFFBEB' : '#FEF2F2';
                return (
                  <div
                    key={compId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#F1F5F9', color: '#0C2340', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {sIdx + 1}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0C2340' }}>
                          {scoreData.competencyName || compId.replace(/_/g, ' ')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {scoreData.explanation || '5 scenario questions evaluated'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0C2340' }}>
                          {scoreData.subjectScoreText || `${scoreData.correctCount ?? 0} / 5`}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          ({scoreData.score ?? 0}%)
                        </div>
                      </div>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          color: levelColor,
                          background: levelBg,
                          border: `1px solid ${levelColor}30`
                        }}
                      >
                        {scoreData.demonstratedLevel || 'Beginner'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '28px' }}>
            <button
              className="btn btn-outline"
              onClick={startAssessment}
            >
              Re-take Assessment
            </button>

            <button
              className="btn btn-saffron btn-lg"
              onClick={() => setActiveTab('results')}
            >
              <span>View Demonstrated Competency Levels</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = session?.question;
  const currentComp = session?.competency;

  return (
    <div className="app-container main-content">
      <div className="page-header">
        <div>
          <div className="badge badge-navy" style={{ marginBottom: '8px' }}>
            Starting Assessment Test • 5 Questions Per Subject (25 Questions Total)
          </div>
          <h1 className="page-title">
            <BrainCircuit size={28} color="#FF9933" />
            <span>Subject {(session?.currentCompIndex ?? 0) + 1} of {session?.totalCompetencies || 5}: {currentComp?.name || 'Competency'}</span>
          </h1>
          <p className="page-subtitle">
            Pre-learning baseline assessment: 5 dedicated questions per subject. Evaluates foundational, operational, and specialized capability with independent subject scoring.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F1F5F9', padding: '6px 14px', borderRadius: '20px', fontWeight: 600, fontSize: '0.88rem', color: '#0C2340' }}>
            <Clock size={16} color="#E65100" />
            <span>00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}</span>
          </div>

          <div className="badge badge-slate" style={{ fontSize: '0.82rem', padding: '6px 12px' }}>
            Question {session?.currentStep || 1} of {session?.totalQuestions || 25} (Subject Q{session?.questionNumberInSubject || 1} of 5)
          </div>
        </div>
      </div>

      {/* Test Card */}
      <div className="card" style={{ maxWidth: '880px', margin: '0 auto', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Subject {(session?.currentCompIndex ?? 0) + 1} of {session?.totalCompetencies || 5} • Question {session?.questionNumberInSubject || 1} of 5
            </span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0C2340' }}>
              {currentComp?.name}
            </div>
          </div>

          <div>
            {getDifficultyBadge(session?.currentDifficulty || 2)}
          </div>
        </div>

        {/* Real Statistical Scenario */}
        {q?.scenario && (
          <div style={{ background: '#F8FAFC', padding: '16px 20px', borderRadius: '10px', borderLeft: '4px solid #0C2340', marginBottom: '20px', fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
            <strong>Operational Scenario:</strong> {q.scenario}
          </div>
        )}

        {/* Question Text */}
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0C2340', marginBottom: '24px', lineHeight: 1.5 }}>
          {q?.question || 'Loading scenario question...'}
        </div>

        {/* 4 Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(q?.options || []).map((opt, idx) => {
            const isSelected = selectedOption === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedOption(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '16px 18px',
                  borderRadius: '10px',
                  border: isSelected ? '2px solid #E65100' : '1px solid #E2E8F0',
                  background: isSelected ? '#FFF7ED' : '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: isSelected ? '6px solid #E65100' : '2px solid #CBD5E1',
                  background: '#FFFFFF',
                  flexShrink: 0,
                  marginTop: '2px'
                }} />
                <div style={{ fontSize: '0.92rem', color: isSelected ? '#7C2D12' : '#334155', fontWeight: isSelected ? 600 : 400, lineHeight: 1.5 }}>
                  {opt}
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions Bar */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="#10B981" />
            <span>AI logs response and adapts next question without exposing hidden grading reasoning.</span>
          </div>

          <button
            type="button"
            className="btn btn-saffron btn-lg"
            onClick={handleSubmitAnswer}
            disabled={selectedOption === null || submitting}
          >
            <span>{submitting ? 'Evaluating...' : 'Confirm & Proceed to Next Step'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
