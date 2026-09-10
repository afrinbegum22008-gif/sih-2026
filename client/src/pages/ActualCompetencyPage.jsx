import React from 'react';
import { useOfficer } from '../context/OfficerContext';
import { Award, CheckCircle2, TrendingUp, AlertCircle, ArrowRight, Compass } from 'lucide-react';

export default function ActualCompetencyPage() {
  const { competenciesData, assessmentResults, setActiveTab } = useOfficer();

  const selectedComps = competenciesData?.selectedCompetencies || [];
  const selfRatings = competenciesData?.selfRatings || {};
  const compScores = assessmentResults?.competencyScores || {};

  const getLevelBadge = (level) => {
    switch (level) {
      case 'Advanced':
        return <span className="badge badge-emerald" style={{ fontSize: '0.8rem' }}>Advanced (Mastery)</span>;
      case 'Intermediate':
        return <span className="badge badge-amber" style={{ fontSize: '0.8rem' }}>Intermediate (Operational)</span>;
      case 'Beginner':
        return <span className="badge badge-red" style={{ fontSize: '0.8rem' }}>Beginner (Foundational)</span>;
      case 'Unassessed':
        return <span className="badge badge-slate" style={{ fontSize: '0.8rem' }}>Unassessed</span>;
      default:
        return <span className="badge badge-slate">{level || 'Unassessed'}</span>;
    }
  };

  const getCalibrationPill = (self, actualLevel) => {
    if (actualLevel === 'Unassessed' || !actualLevel) {
      return (
        <span className="badge badge-slate">
          Assessment Pending
        </span>
      );
    }
    const actScore = actualLevel === 'Advanced' ? 5 : actualLevel === 'Intermediate' ? 3 : 2;
    if (self >= 4 && actualLevel === 'Beginner') {
      return (
        <span className="badge badge-red" title="Perceived familiarity exceeded verified test performance">
          Overestimated Baseline (-2)
        </span>
      );
    }
    if (self <= 2 && actualLevel === 'Advanced') {
      return (
        <span className="badge badge-emerald" title="Demonstrated higher mastery than self-estimated">
          Underestimated (+2)
        </span>
      );
    }
    return (
      <span className="badge badge-slate">
        Accurately Aligned
      </span>
    );
  };

  return (
    <div className="app-container main-content">
      <div className="page-header">
        <div>
          <div className="badge badge-emerald" style={{ marginBottom: '8px' }}>
            Page 5 • Verified Competency Determination
          </div>
          <h1 className="page-title">
            <Award size={28} color="#059669" />
            <span>Actual Demonstrated Competency Levels</span>
          </h1>
          <p className="page-subtitle">
            System determination of your actual competency levels based on verified adaptive assessment performance.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setActiveTab('gaps')}
        >
          <span>Proceed to Detailed Skill Gap Analysis</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Core Conceptual Callout */}
      <div className="card" style={{ marginBottom: '28px', background: 'linear-gradient(135deg, #0C2340 0%, #1E4472 100%)', color: '#FFFFFF', padding: '24px' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FF9933', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Core Tripartite Assessment Paradigm
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '16px', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>PAGE 3</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px' }}>What You Think You Know</div>
            <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginTop: '4px' }}>Self-rated familiarity used strictly for initial difficulty calibration.</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.08)', padding: '16px', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>PAGE 4</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px' }}>What The Exam Measures</div>
            <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginTop: '4px' }}>Live adaptive test adjusting difficulty based on scenario correctness.</div>
          </div>

          <div style={{ background: 'rgba(255,153,51,0.2)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,153,51,0.4)' }}>
            <div style={{ fontSize: '0.78rem', color: '#FF9933', fontWeight: 700 }}>PAGE 5 (CURRENT)</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: '4px' }}>What You Actually Demonstrate</div>
            <div style={{ fontSize: '0.8rem', color: '#FFE0B2', marginTop: '4px' }}>Scientific psychometric determination of your true competency level.</div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <span>Competency Calibration & Demonstration Matrix</span>
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Competency Area</th>
                <th>Category</th>
                <th style={{ textAlign: 'center' }}>Self-Rating (What you thought)</th>
                <th style={{ textAlign: 'center' }}>Adaptive Test Score</th>
                <th>Actual Demonstrated Level (System Determined)</th>
                <th>Calibration Delta</th>
              </tr>
            </thead>
            <tbody>
              {selectedComps.map(comp => {
                const self = selfRatings[comp.id] || 3;
                const isAssessed = Boolean(assessmentResults && compScores && compScores[comp.id]);
                const evaluated = compScores[comp.id] || { score: 0, demonstratedLevel: 'Unassessed' };
                const actualLevel = evaluated.demonstratedLevel || 'Unassessed';

                return (
                  <tr key={comp.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0C2340' }}>{comp.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{comp.description.slice(0, 65)}...</div>
                    </td>
                    <td>
                      <span className="badge badge-slate">{comp.category}</span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.95rem', color: '#334155' }}>
                      {self} / 5
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, color: !isAssessed ? '#94A3B8' : evaluated.score >= 70 ? '#059669' : evaluated.score >= 45 ? '#D97706' : '#DC2626' }}>
                        {isAssessed ? `${evaluated.score}%` : '0% (Pending)'}
                      </div>
                    </td>
                    <td>
                      {getLevelBadge(actualLevel)}
                    </td>
                    <td>
                      {getCalibrationPill(self, actualLevel)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setActiveTab('assessment')}
        >
          Re-calibrate via Adaptive Test
        </button>

        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={() => setActiveTab('gaps')}
        >
          <span>Analyze Role-Specific Skill Gaps</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
