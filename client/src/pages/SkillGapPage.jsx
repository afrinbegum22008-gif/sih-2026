import React from 'react';
import { useOfficer } from '../context/OfficerContext';
import { 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  HelpCircle, 
  Sparkles, 
  Building2, 
  Loader2, 
  AlertCircle, 
  Award,
  BookOpen
} from 'lucide-react';

export default function SkillGapPage() {
  const { skillGaps = [], profile, setActiveTab, loading } = useOfficer();

  const safeGaps = Array.isArray(skillGaps) ? skillGaps : [];

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'HIGH':
        return <span className="badge badge-red" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>HIGH GAP (Critical Priority)</span>;
      case 'MEDIUM':
        return <span className="badge badge-amber" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>MEDIUM GAP (Functional Priority)</span>;
      case 'NONE':
        return <span className="badge badge-emerald" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>NO GAP (Target Met)</span>;
      default:
        return <span className="badge badge-slate">{severity}</span>;
    }
  };

  const highCount = safeGaps.filter(g => g?.gapSeverity === 'HIGH').length;
  const mediumCount = safeGaps.filter(g => g?.gapSeverity === 'MEDIUM').length;
  const noneCount = safeGaps.filter(g => g?.gapSeverity === 'NONE').length;

  const gapsNeedingImprovement = safeGaps.filter(g => g?.gapSeverity === 'HIGH' || g?.gapSeverity === 'MEDIUM');
  const satisfiedStrengths = safeGaps.filter(g => g?.gapSeverity === 'NONE');

  // 1. Loading State
  if (loading && safeGaps.length === 0) {
    return (
      <div className="app-container main-content" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <Loader2 size={36} className="spin-animation" style={{ color: '#FF9933', margin: '0 auto 16px auto' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0C2340' }}>
          Analyzing Officer Skill Gaps & Competency Benchmarks...
        </h2>
        <p style={{ color: '#64748B', maxWidth: '500px', margin: '8px auto 0 auto', fontSize: '0.9rem' }}>
          Connecting demonstrated adaptive test results against official MoSPI role requirements for {profile?.jobRole || 'Statistical Officer'}.
        </p>
      </div>
    );
  }

  // 2. Empty State (Assessment Not Yet Taken)
  if (safeGaps.length === 0) {
    return (
      <div className="app-container main-content">
        <div className="page-header">
          <div>
            <div className="badge badge-navy" style={{ marginBottom: '8px' }}>
              Page 4 • AI Skill Gap Analysis
            </div>
            <h1 className="page-title">
              <AlertTriangle size={28} color="#EF4444" />
              <span>AI Competency Gap Evaluation</span>
            </h1>
            <p className="page-subtitle">
              Comparison of <strong>Required Competency Level for Your Role & Assignment</strong> vs <strong>Actual Demonstrated Level</strong>.
            </p>
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '60px 24px', maxWidth: '640px', margin: '40px auto' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#EFF6FF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Award size={28} color="#0284C7" />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            No Assessment Results Available Yet
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6, marginBottom: '24px' }}>
            To generate a clinical AI skill-gap diagnosis for <strong>{profile?.name || 'Officer'}</strong> ({profile?.designation || 'Statistical Officer'}), please complete the adaptive competency assessment first.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => setActiveTab('competencies')}
            >
              <span>View Competencies</span>
            </button>
            <button 
              type="button" 
              className="btn btn-saffron"
              onClick={() => setActiveTab('assessment')}
            >
              <span>Start Adaptive Assessment</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container main-content">
      <div className="page-header">
        <div>
          <div className="badge badge-red" style={{ marginBottom: '8px' }}>
            Page 4 • Role-Specific Skill Gap Analysis
          </div>
          <h1 className="page-title">
            <AlertTriangle size={28} color="#EF4444" />
            <span>AI Competency Gap Evaluation</span>
          </h1>
          <p className="page-subtitle">
            Rigorous comparison of <strong>Required Level for Your Role &amp; Assignment</strong> vs <strong>Actual Demonstrated Level</strong> from your adaptive assessment.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-saffron btn-lg"
          onClick={() => setActiveTab('roadmap')}
        >
          <span>Generate Personalized Roadmap</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid-3" style={{ marginBottom: '28px' }}>
        <div className="stat-card red">
          <div className="stat-title">High Priority Gaps</div>
          <div className="stat-value" style={{ color: '#DC2626' }}>{highCount}</div>
          <div className="stat-desc">Competencies with 2+ level deficit requiring immediate capacity building</div>
        </div>

        <div className="stat-card" style={{ borderColor: '#F59E0B' }}>
          <div className="stat-title">Medium Priority Gaps</div>
          <div className="stat-value" style={{ color: '#D97706' }}>{mediumCount}</div>
          <div className="stat-desc">Competencies with 1 level deficit requiring functional upskilling</div>
        </div>

        <div className="stat-card emerald">
          <div className="stat-title">Target Levels Satisfied (Strengths)</div>
          <div className="stat-value" style={{ color: '#059669' }}>{noneCount}</div>
          <div className="stat-desc">Demonstrated mastery meets or exceeds official role specifications</div>
        </div>
      </div>

      {/* Section 1: Competencies Needing Improvement */}
      {gapsNeedingImprovement.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertTriangle size={20} color="#DC2626" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
              Areas Needing Improvement ({gapsNeedingImprovement.length})
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {gapsNeedingImprovement.map(gap => {
              const isHigh = gap.gapSeverity === 'HIGH';
              const isMedium = gap.gapSeverity === 'MEDIUM';

              // Safe extraction of explainable reasoning
              const whyWeakText = typeof gap.aiReasoning === 'object' && gap.aiReasoning !== null
                ? gap.aiReasoning.whyWeak
                : (typeof gap.aiReasoning === 'string' ? gap.aiReasoning : (gap.explanation || ''));

              const operationalRiskText = typeof gap.aiReasoning === 'object' && gap.aiReasoning !== null
                ? gap.aiReasoning.operationalRisk
                : null;

              const recommendedActionText = typeof gap.aiReasoning === 'object' && gap.aiReasoning !== null
                ? gap.aiReasoning.recommendedAction
                : null;

              return (
                <div 
                  key={gap.competencyId} 
                  className="card card-hover" 
                  style={{ 
                    borderLeft: isHigh ? '5px solid #EF4444' : '5px solid #F59E0B',
                    padding: '24px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0C2340' }}>{gap.competencyName}</h3>
                        <span className="badge badge-slate">{gap.category}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                        Competency ID: <code>{gap.competencyId}</code> • Assessment Score: <strong>{gap.score}%</strong>
                      </div>
                    </div>

                    <div>
                      {getSeverityBadge(gap.gapSeverity)}
                    </div>
                  </div>

                  {/* Levels Comparison Bar: Required, Actual, Skill Gap, Priority Level */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', background: '#F8FAFC', padding: '16px', borderRadius: '10px', marginBottom: '18px' }}>
                    <div>
                      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                        Required Level
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0C2340', marginTop: '2px' }}>
                        {gap.requiredLevel}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>Role benchmark</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                        Current Level
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: isHigh ? '#DC2626' : '#D97706', marginTop: '2px' }}>
                        {gap.actualLevel} ({gap.score}%)
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>Adaptive test score</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                        Skill Gap
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: isHigh ? '#DC2626' : '#D97706', marginTop: '2px' }}>
                        {gap.skillGap || (gap.diff ? `${gap.diff} Level Deficit` : gap.gapSeverity)}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                        {gap.diff > 0 ? `${gap.diff} level deficit` : 'Deficit identified'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                        Priority Level
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: isHigh ? '#B91C1C' : '#B45309', marginTop: '4px' }}>
                        {gap.priorityLevel || (isHigh ? 'Immediate Action' : 'High Priority')}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>Capacity building urgency</div>
                    </div>
                  </div>

                  {/* AI Explanation of Why Gap Exists */}
                  {whyWeakText && (
                    <div style={{ marginBottom: '14px', background: isHigh ? '#FEF2F2' : '#FFFBEB', padding: '14px 16px', borderRadius: '8px', borderLeft: `4px solid ${isHigh ? '#EF4444' : '#F59E0B'}` }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isHigh ? '#991B1B' : '#92400E', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={14} color={isHigh ? '#EF4444' : '#F59E0B'} />
                        <span>AI Reasoning (Explanation of why this gap exists):</span>
                      </div>
                      <div style={{ fontSize: '0.86rem', color: isHigh ? '#7F1D1D' : '#78350F', lineHeight: 1.5 }}>
                        {whyWeakText}
                      </div>

                      {operationalRiskText && (
                        <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#78350F', borderTop: '1px dashed #FED7AA', paddingTop: '6px' }}>
                          <strong>Operational Risk:</strong> {operationalRiskText}
                        </div>
                      )}

                      {recommendedActionText && (
                        <div style={{ marginTop: '4px', fontSize: '0.82rem', color: '#0369A1' }}>
                          <strong>Recommended Intervention:</strong> {recommendedActionText}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Why Important for Role */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0C2340', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building2 size={14} color="#E65100" />
                      <span>Mandate Criticality for {profile?.currentAssignment || profile?.jobRole}:</span>
                    </div>
                    <div style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.5, background: '#FFF7ED', padding: '10px 14px', borderRadius: '8px', border: '1px solid #FED7AA' }}>
                      {gap.whyImportant || `Crucial for executing ${profile?.currentAssignment || 'official duties'} without data quality deficits.`}
                    </div>
                  </div>

                  {/* Areas Needing Improvement */}
                  {Array.isArray(gap.weakAreas) && gap.weakAreas.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0C2340', marginBottom: '6px' }}>
                        Specific Weak Areas to Address in Learning:
                      </div>
                      <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {gap.weakAreas.map((area, idx) => (
                          <li key={idx}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 2: Cadre Strengths & Satisfied Benchmarks */}
      {satisfiedStrengths.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <CheckCircle2 size={20} color="#059669" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
              Cadre Strengths &amp; Verified Masteries ({satisfiedStrengths.length})
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {satisfiedStrengths.map(gap => (
              <div 
                key={gap.competencyId} 
                className="card" 
                style={{ 
                  borderLeft: '5px solid #10B981', 
                  padding: '18px 20px',
                  background: '#F0FDF4'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#065F46' }}>{gap.competencyName}</h3>
                    <span style={{ fontSize: '0.74rem', color: '#047857' }}>{gap.category}</span>
                  </div>
                  <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>Target Met</span>
                </div>

                <div style={{ fontSize: '0.84rem', color: '#166534', marginBottom: '8px' }}>
                  Demonstrated <strong>{gap.actualLevel}</strong> mastery ({gap.score}%) meets the required <strong>{gap.requiredLevel}</strong> level for {profile?.currentAssignment || 'assignment'}.
                </div>

                {Array.isArray(gap.strengths) && gap.strengths.length > 0 && (
                  <ul style={{ paddingLeft: '16px', fontSize: '0.78rem', color: '#15803D', margin: 0 }}>
                    {gap.strengths.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setActiveTab('results')}
        >
          Back to Demonstrated Levels
        </button>

        <button
          type="button"
          className="btn btn-saffron btn-lg"
          onClick={() => setActiveTab('roadmap')}
        >
          <span>View Prioritized Learning Roadmap</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

