import React from 'react';
import { useOfficer } from '../context/OfficerContext';
import { Compass, Clock, CheckCircle2, ArrowRight, BookOpen, Layers, ShieldCheck, Sparkles } from 'lucide-react';

export default function RoadmapPage() {
  const { roadmap, profile, setActiveTab } = useOfficer();

  const safeRoadmap = Array.isArray(roadmap) ? roadmap : [];
  const totalHours = safeRoadmap.reduce((sum, item) => sum + (item.estHours || 0), 0);

  return (
    <div className="app-container main-content">
      <div className="page-header">
        <div>
          <div className="badge badge-navy" style={{ marginBottom: '8px' }}>
            Page 7 • AI Prioritized Capacity Building Roadmap
          </div>
          <h1 className="page-title">
            <Compass size={28} color="#FF9933" />
            <span>Personalized Learning Journey</span>
          </h1>
          <p className="page-subtitle">
            AI-sequenced progression path prioritizing what you must master first based on 
            <strong> skill-gap severity, current assignment ({profile?.currentAssignment}), and departmental statistical mandates</strong>.
          </p>
        </div>

        <button
          className="btn btn-emerald btn-lg"
          onClick={() => setActiveTab('courses')}
        >
          <span>Find Matching iGOT & NSSTA Courses</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Prioritization Algorithm Insights Card */}
      <div className="card" style={{ marginBottom: '28px', background: '#F8FAFC', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0C2340', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#E65100" />
              <span>Multi-Factor AI Prioritization Logic Applied</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px' }}>
              Weighted formula: <strong>40% Gap Severity</strong> + <strong>30% Current Assignment Criticality</strong> + <strong>15% Lack of Prior Training</strong> + <strong>15% National Statistical Priorities</strong>.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Estimated Total Hours
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0C2340' }}>
                {totalHours} Hours
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Roadmap Milestones
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#E65100' }}>
                {safeRoadmap.length} Tracks
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Step-by-Step Learning Timeline */}
      {safeRoadmap.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <Compass size={40} color="#94A3B8" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0C2340', marginBottom: '8px' }}>
            No Roadmap Milestones Available Yet
          </h3>
          <p style={{ color: '#64748B', maxWidth: '500px', margin: '0 auto 20px auto', fontSize: '0.9rem' }}>
            Complete your Officer Profile and take the Adaptive Assessment to have the AI engine generate your tailored learning roadmap.
          </p>
          <button className="btn btn-navy" onClick={() => setActiveTab('profile')}>
            Review Officer Profile
          </button>
        </div>
      ) : (
        <div className="roadmap-timeline">
          {safeRoadmap.map((item, index) => {
          const isPriority1 = item.priorityRank === 1;
          const isHigh = item.gapSeverity === 'HIGH';
          const isNone = item.gapSeverity === 'NONE';

          return (
            <div key={item.competencyId} className="roadmap-node">
              <div 
                className="card card-hover" 
                style={{ 
                  borderLeft: isHigh ? '4px solid #EF4444' : isNone ? '4px solid #10B981' : '4px solid #F59E0B',
                  padding: '24px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span className="badge badge-navy" style={{ fontSize: '0.8rem' }}>
                        PRIORITY {item.priorityRank}
                      </span>
                      <span className="badge badge-slate">{item.phase}</span>
                      {isPriority1 && <span className="badge badge-saffron">★ Top Immediate Action</span>}
                    </div>

                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0C2340', marginTop: '6px' }}>
                      {item.milestoneTitle}
                    </h3>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="badge badge-slate" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={12} />
                      <span>Est. {item.estHours} Learning Hours</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                      Priority Score: <strong>{item.priorityScore} / 100</strong>
                    </div>
                  </div>
                </div>

                {/* State Transition Matrix */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748B' }}>Current Demonstrated: </span>
                    <strong style={{ color: isHigh ? '#DC2626' : '#D97706' }}>{item.actualLevel}</strong>
                  </div>

                  <ArrowRight size={16} color="#94A3B8" />

                  <div style={{ fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748B' }}>Target Level: </span>
                    <strong style={{ color: '#0C2340' }}>{item.requiredLevel}</strong>
                  </div>

                  <div style={{ marginLeft: 'auto' }}>
                    <span className={`badge ${isHigh ? 'badge-red' : isNone ? 'badge-emerald' : 'badge-amber'}`}>
                      {item.actionLabel}
                    </span>
                  </div>
                </div>

                {/* Learning Objectives */}
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0C2340', marginBottom: '6px' }}>
                    Specific Actionable Learning Objectives:
                  </div>
                  <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {(item.learningObjectives || []).map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setActiveTab('courses')}
                  >
                    <BookOpen size={14} />
                    <span>View Recommended Courses for {item.competencyName}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setActiveTab('gaps')}
        >
          Back to Skill Gaps
        </button>

        <button
          type="button"
          className="btn btn-emerald btn-lg"
          onClick={() => setActiveTab('courses')}
        >
          <span>Explore Recommended iGOT & NSSTA Courses</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
