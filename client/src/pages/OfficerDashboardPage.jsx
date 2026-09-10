import React, { useState } from 'react';
import { useOfficer } from '../context/OfficerContext';
import AIAssistantChatbox from '../components/AIAssistantChatbox';
import { 
  BarChart3, 
  Target, 
  AlertTriangle, 
  Compass, 
  BookOpen, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Award, 
  ExternalLink, 
  ArrowRight,
  Sparkles,
  Zap,
  Building,
  UserCheck,
  History,
  FileCheck,
  Activity,
  Layers,
  Bot
} from 'lucide-react';

/**
 * Pure SVG Competency Spider / Radar Chart
 * Compares Required Level vs Actual Demonstrated Level
 */
function CompetencyRadarChart({ skillGaps }) {
  if (!skillGaps || skillGaps.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
        <Activity size={36} color="#CBD5E1" style={{ margin: '0 auto 12px auto', display: 'block' }} />
        <div style={{ fontWeight: 700, color: '#0C2340', fontSize: '0.95rem' }}>Assessment Pending</div>
        <div style={{ fontSize: '0.8rem', marginTop: '4px', maxWidth: '280px', margin: '4px auto 0 auto' }}>
          Take the Starting Adaptive Assessment to calibrate competency levels and view your diagnostic radar.
        </div>
      </div>
    );
  }
  const size = 320;
  const center = size / 2;
  const radius = 100;
  const n = skillGaps.length;

  const levelToNum = (lvl) => (lvl === 'Advanced' ? 3 : lvl === 'Intermediate' ? 2 : 1);

  const getCoordinates = (index, value) => {
    const angle = (Math.PI * 2 / n) * index - Math.PI / 2;
    const r = (value / 3) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const gridLevels = [1, 2, 3];

  const targetPoints = skillGaps.map((g, i) => {
    const pt = getCoordinates(i, levelToNum(g.requiredLevel));
    return `${pt.x},${pt.y}`;
  }).join(' ');

  const actualPoints = skillGaps.map((g, i) => {
    const pt = getCoordinates(i, levelToNum(g.actualLevel));
    return `${pt.x},${pt.y}`;
  }).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Concentric grid webs */}
        {gridLevels.map((lvl) => {
          const pts = Array.from({ length: n }).map((_, i) => {
            const pt = getCoordinates(i, lvl);
            return `${pt.x},${pt.y}`;
          }).join(' ');
          return (
            <polygon
              key={lvl}
              points={pts}
              fill={lvl === 3 ? '#F8FAFC' : lvl === 2 ? '#F1F5F9' : '#FFFFFF'}
              stroke="#E2E8F0"
              strokeWidth="1.2"
            />
          );
        })}

        {/* Spokes radiating out */}
        {skillGaps.map((_, i) => {
          const outerPt = getCoordinates(i, 3);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={outerPt.x}
              y2={outerPt.y}
              stroke="#CBD5E1"
              strokeDasharray="2,2"
            />
          );
        })}

        {/* Target Level Polygon (Navy) */}
        <polygon
          points={targetPoints}
          fill="rgba(12, 35, 64, 0.12)"
          stroke="#0C2340"
          strokeWidth="2"
        />

        {/* Actual Demonstrated Level Polygon (Saffron/Orange) */}
        <polygon
          points={actualPoints}
          fill="rgba(255, 153, 51, 0.38)"
          stroke="#FF9933"
          strokeWidth="2.5"
        />

        {/* Actual points dots */}
        {skillGaps.map((g, i) => {
          const pt = getCoordinates(i, levelToNum(g.actualLevel));
          return (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r="4.5"
              fill="#E65100"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Outer labels */}
        {skillGaps.map((g, i) => {
          const labelPt = getCoordinates(i, 3.5);
          const shortName = g.competencyName.length > 16 ? g.competencyName.slice(0, 14) + '…' : g.competencyName;
          return (
            <text
              key={i}
              x={labelPt.x}
              y={labelPt.y}
              fontSize="9"
              fontWeight="700"
              textAnchor={labelPt.x > center + 8 ? 'start' : labelPt.x < center - 8 ? 'end' : 'middle'}
              dominantBaseline="central"
              fill="#334155"
            >
              {shortName}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '8px', fontSize: '0.78rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', background: 'rgba(12, 35, 64, 0.2)', border: '2px solid #0C2340', borderRadius: '3px' }} />
          <span style={{ color: '#475569', fontWeight: 600 }}>Required Target Level</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', background: 'rgba(255, 153, 51, 0.4)', border: '2px solid #FF9933', borderRadius: '3px' }} />
          <span style={{ color: '#C2410C', fontWeight: 700 }}>Demonstrated Level</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Visual Skill Gap Dual Comparative Bar Chart
 */
function SkillGapComparativeChart({ skillGaps }) {
  if (!skillGaps || skillGaps.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
        <BarChart3 size={36} color="#CBD5E1" style={{ margin: '0 auto 12px auto', display: 'block' }} />
        <div style={{ fontWeight: 700, color: '#0C2340', fontSize: '0.95rem' }}>No Skill Gaps Identified</div>
        <div style={{ fontSize: '0.8rem', marginTop: '4px', maxWidth: '280px', margin: '4px auto 0 auto' }}>
          Complete your Starting Assessment to compare verified performance against role benchmarks.
        </div>
      </div>
    );
  }
  const levelWidth = (lvl) => (lvl === 'Advanced' ? '100%' : lvl === 'Intermediate' ? '66%' : '33%');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {skillGaps.map((g) => {
        const isHigh = g.gapSeverity === 'HIGH';
        const isMedium = g.gapSeverity === 'MEDIUM';
        const isNone = g.gapSeverity === 'NONE';

        return (
          <div key={g.competencyId} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0C2340' }}>{g.competencyName}</span>
              <span className={`badge ${isHigh ? 'badge-red' : isMedium ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '0.72rem' }}>
                {isNone ? 'Target Met' : `${g.gapSeverity} Gap`}
              </span>
            </div>

            {/* Target vs Actual Dual Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Target Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748B', marginBottom: '2px' }}>
                  <span>Target for Role: <strong>{g.requiredLevel}</strong></span>
                </div>
                <div style={{ height: '7px', width: '100%', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: levelWidth(g.requiredLevel), background: '#0C2340', borderRadius: '4px' }} />
                </div>
              </div>

              {/* Actual Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748B', marginBottom: '2px' }}>
                  <span>Demonstrated: <strong style={{ color: isHigh ? '#DC2626' : isMedium ? '#D97706' : '#059669' }}>{g.actualLevel}</strong></span>
                  <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Priority: {g.priorityRank || 'Normal'}</span>
                </div>
                <div style={{ height: '7px', width: '100%', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: levelWidth(g.actualLevel), 
                      background: isHigh ? '#EF4444' : isMedium ? '#F59E0B' : '#10B981',
                      borderRadius: '4px',
                      transition: 'width 0.6s ease'
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OfficerDashboardPage({ isChatOpen: externalIsChatOpen, onToggleChat, onCloseChat }) {
  const { profile, assessmentResults, skillGaps, roadmap, recommendations, progressRecords, setActiveTab, startCourse } = useOfficer();
  const [courseNotice, setCourseNotice] = useState(null);
  const [internalIsChatOpen, setInternalIsChatOpen] = useState(false);

  const isChatOpen = externalIsChatOpen !== undefined ? externalIsChatOpen : internalIsChatOpen;
  const toggleChat = onToggleChat || (() => setInternalIsChatOpen(prev => !prev));
  const closeChat = onCloseChat || (() => setInternalIsChatOpen(false));

  const handleStartCourse = (rec, e) => {
    if (e && e.preventDefault) e.preventDefault();

    // If course has mapped PDF, start course with its mapped PDF
    if (rec.hasMappedPdf || rec.pdfFileName) {
      startCourse(rec, true);
      return;
    }

    const isUnsafe = rec.portalSafe === false || 
                     rec.portalStatus === 'CERTIFICATE_ISSUE' || 
                     (rec.officialUrl && rec.officialUrl.includes('nssta.gov.in') && rec.portalSafe !== true);

    if (isUnsafe) {
      setCourseNotice('Official NSSTA/TPAC portal is currently unavailable or has a certificate issue. Please try again later.');
      return;
    }

    const hasVerifiedCourseUrl = Boolean(rec.officialCourseUrl);
    const destinationUrl = hasVerifiedCourseUrl ? rec.officialCourseUrl : (rec.officialUrl || 'https://igotkarmayogi.gov.in/');

    if (!hasVerifiedCourseUrl) {
      setCourseNotice(`Exact course link unavailable for "${rec.title}". Opening official iGOT portal as fallback: ${destinationUrl}`);
    } else {
      setCourseNotice(`Opening verified course page in a new tab: ${destinationUrl}`);
    }

    window.open(destinationUrl, '_blank', 'noopener,noreferrer');
  };

  const highGaps = skillGaps.filter(g => g.gapSeverity === 'HIGH');
  const mediumGaps = skillGaps.filter(g => g.gapSeverity === 'MEDIUM');
  const targetMet = skillGaps.filter(g => g.gapSeverity === 'NONE');

  const topPriority = roadmap[0] || null;
  const overallScore = assessmentResults?.overallScore ?? 0;

  // Roadmap Progress Calculation
  const totalMilestones = roadmap.length;
  const completedCount = progressRecords.length + targetMet.length;
  const roadmapProgressPct = (totalMilestones + targetMet.length > 0)
    ? Math.min(100, Math.round((completedCount / (totalMilestones + targetMet.length)) * 100))
    : 0;

  return (
    <div className="app-container main-content">
      {/* Officer Welcome & Mandate Banner */}
      <div className="card" style={{ marginBottom: '28px', background: 'linear-gradient(135deg, #071528 0%, #0C2340 50%, #143258 100%)', color: '#FFFFFF', padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-saffron" style={{ fontSize: '0.72rem' }}>
                Active Official Mandate
              </span>
              <span style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>
                Employee ID: {profile?.employeeId || 'MOSPI-ISS-8842'}
              </span>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {profile?.name || 'Statistical Officer'}
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '0.95rem', marginTop: '4px' }}>
              {profile?.designation} • {profile?.department}
            </p>

            <div style={{ marginTop: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.08)', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
              <Sparkles size={15} color="#FF9933" />
              <span style={{ fontSize: '0.85rem', color: '#E2E8F0' }}>
                Current Assignment: <strong>{profile?.currentAssignment || 'Labour Statistics & PLFS'}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-emerald"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={toggleChat}
            >
              <Sparkles size={16} />
              <span>AI Assistant</span>
            </button>

            <button
              className="btn btn-outline"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.25)' }}
              onClick={() => setActiveTab('profile')}
            >
              <UserCheck size={16} />
              <span>Update Profile</span>
            </button>

            <button
              className="btn btn-saffron"
              onClick={() => setActiveTab('assessment')}
            >
              <Zap size={16} />
              <span>Re-Test Competencies</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <div className="stat-card emerald">
          <div className="stat-title">Statistical Readiness Index</div>
          <div className="stat-value">{overallScore}%</div>
          <div className="stat-desc">
            {assessmentResults ? 'Based on verified adaptive examination' : 'Initial examination pending'}
          </div>
        </div>

        <div className="stat-card red">
          <div className="stat-title">High Priority Skill Gaps</div>
          <div className="stat-value" style={{ color: '#DC2626' }}>{highGaps.length}</div>
          <div className="stat-desc">
            {assessmentResults ? 'Critical deficiencies requiring training' : 'No gaps diagnosed yet'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Roadmap Progress</div>
          <div className="stat-value" style={{ color: '#E65100' }}>{roadmapProgressPct}%</div>
          <div className="stat-desc">
            {totalMilestones + targetMet.length > 0 
              ? `${completedCount} of ${totalMilestones + targetMet.length} tracks addressed`
              : '0 tracks addressed (Assessment Pending)'}
          </div>
        </div>

        <div className="stat-card navy">
          <div className="stat-title">Progress Records Logged</div>
          <div className="stat-value">{progressRecords.length}</div>
          <div className="stat-desc">Before vs After evaluations completed</div>
        </div>
      </div>

      {/* Recommended Next Action Banner */}
      {topPriority ? (
        <div className="card" style={{ marginBottom: '28px', background: '#FFF7ED', borderColor: '#FED7AA', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#E65100', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Recommended Immediate Next Action
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0C2340', marginTop: '2px' }}>
                  {topPriority.milestoneTitle} (Est. {topPriority.estHours} Hours)
                </div>
                <div style={{ fontSize: '0.85rem', color: '#7C2D12', marginTop: '2px' }}>
                  Current: <strong>{topPriority.actualLevel}</strong> ➔ Target: <strong>{topPriority.requiredLevel}</strong> • {topPriority.whyImportant}
                </div>
              </div>
            </div>

            <button
              className="btn btn-saffron"
              onClick={() => setActiveTab('courses')}
            >
              <span>Access Recommended Course</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: '28px', background: '#F0FDF4', borderColor: '#BBF7D0', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Action Required • Assessment Pending
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0C2340', marginTop: '2px' }}>
                  Complete Starting Adaptive Assessment (25 Questions)
                </div>
                <div style={{ fontSize: '0.85rem', color: '#14532D', marginTop: '2px' }}>
                  Calibrate your demonstrated baseline across 5 key competencies to generate your personalized learning roadmap.
                </div>
              </div>
            </div>

            <button
              className="btn btn-saffron"
              onClick={() => setActiveTab('assessment')}
            >
              <span>Start Assessment</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Visual Analytics Row: Radar Chart + Skill Gap Comparative Chart */}
      <div className="grid-2" style={{ marginBottom: '28px' }}>
        {/* Radar Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Activity size={18} color="#FF9933" />
              <span>Competency Radar Chart (Target vs Actual)</span>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setActiveTab('results')}
            >
              Details
            </button>
          </div>
          <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'center' }}>
            <CompetencyRadarChart skillGaps={skillGaps} />
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', textAlign: 'center', marginTop: '6px' }}>
            Multi-axial spider plot comparing official required proficiency with demonstrated mastery.
          </div>
        </div>

        {/* Skill Gap Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <BarChart3 size={18} color="#059669" />
              <span>Skill Gap Comparative Chart</span>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setActiveTab('gaps')}
            >
              Gap Details
            </button>
          </div>
          <SkillGapComparativeChart skillGaps={skillGaps} />
        </div>
      </div>

      {/* Roadmap Progress Section */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-header">
          <div className="card-title">
            <Compass size={18} color="#FF9933" />
            <span>Personalized Capacity Roadmap Progress</span>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setActiveTab('roadmap')}
          >
            Full Roadmap ({roadmap.length} Tracks)
          </button>
        </div>

        {/* Roadmap Progress Bar */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0C2340' }}>
              Overall Role Competency Alignment
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#E65100' }}>
              {roadmapProgressPct}%
            </span>
          </div>
          <div style={{ height: '10px', width: '100%', background: '#F1F5F9', borderRadius: '5px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${roadmapProgressPct}%`, 
                background: 'linear-gradient(90deg, #FF9933 0%, #10B981 100%)',
                borderRadius: '5px',
                transition: 'width 0.8s ease'
              }} 
            />
          </div>
        </div>

        {/* Roadmap Milestone Steps Checklist */}
        {roadmap.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 20px', color: '#64748B' }}>
            <Compass size={36} color="#CBD5E1" style={{ margin: '0 auto 12px auto', display: 'block' }} />
            <div style={{ fontWeight: 700, color: '#0C2340', fontSize: '0.95rem' }}>No Active Learning Milestones</div>
            <div style={{ fontSize: '0.8rem', marginTop: '4px', maxWidth: '340px', margin: '4px auto 16px auto' }}>
              Complete your Starting Assessment to allow the AI engine to diagnose gaps and generate your prioritized learning roadmap.
            </div>
            <button
              className="btn btn-navy btn-sm"
              onClick={() => setActiveTab('assessment')}
            >
              Start Assessment
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {roadmap.map((item, idx) => {
              const isFirst = idx === 0;
              const isHigh = item.gapSeverity === 'HIGH';

              return (
                <div 
                  key={item.competencyId} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    background: isFirst ? '#FFF7ED' : '#F8FAFC',
                    border: isFirst ? '1px solid #FED7AA' : '1px solid #E2E8F0',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isFirst ? '#E65100' : '#0C2340', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem' }}>
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0C2340' }}>
                        {item.milestoneTitle}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        Current: <strong>{item.actualLevel}</strong> ➔ Target: <strong>{item.requiredLevel}</strong> • Est. {item.estHours} hrs
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`badge ${isHigh ? 'badge-red' : item.gapSeverity === 'MEDIUM' ? 'badge-amber' : 'badge-emerald'}`}>
                      {item.gapSeverity} Gap
                    </span>
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                      onClick={() => setActiveTab('courses')}
                    >
                      View Courses
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recommended Official Courses Row */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-header">
          <div className="card-title">
            <BookOpen size={18} color="#2563EB" />
            <span>Recommended Programmes on Official Portals</span>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setActiveTab('courses')}
          >
            Explore All ({recommendations.length})
          </button>
        </div>

        {courseNotice && (
          <div className="callout callout-warning" style={{ margin: '0 20px 16px 20px', background: '#FFFBEB', borderLeft: '4px solid #F59E0B', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400E', fontSize: '0.86rem', fontWeight: 600 }}>
              <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0 }} />
              <span>{courseNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setCourseNotice(null)}
              className="btn btn-sm btn-outline"
              style={{ fontSize: '0.72rem', padding: '2px 8px' }}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid-3">
          {recommendations.slice(0, 3).map(rec => (
            <div key={rec.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className={`badge ${rec.source === 'iGOT' ? 'badge-saffron' : 'badge-emerald'}`}>
                    {rec.provider}
                  </span>
                  <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>{rec.duration}</span>
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0C2340', marginBottom: '8px', lineHeight: 1.4 }}>
                  {rec.title}
                </h4>

                <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, marginBottom: '14px' }}>
                  {rec.description.slice(0, 110)}...
                </p>
              </div>

              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E65100' }}>
                  {rec.competencyName}
                </span>

                <button
                  type="button"
                  onClick={(e) => handleStartCourse(rec, e)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                >
                  <span>Start Course</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assessment History Section */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-header">
          <div className="card-title">
            <History size={18} color="#0C2340" />
            <span>Assessment & Examination History</span>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setActiveTab('assessment')}
          >
            Take New Assessment
          </button>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Assessment Type</th>
                <th>Evaluation Date</th>
                <th>Mode / Method</th>
                <th>Questions Evaluated</th>
                <th>Score Obtained</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {!assessmentResults && progressRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px 20px', color: '#64748B' }}>
                    <div style={{ fontWeight: 600, color: '#0C2340', marginBottom: '4px' }}>No Official Assessments Completed Yet</div>
                    <div style={{ fontSize: '0.82rem' }}>Take your Starting Assessment to calibrate competencies and record your official baseline score.</div>
                  </td>
                </tr>
              ) : (
                <>
                  {assessmentResults && (
                    <tr>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0C2340' }}>
                          Adaptive Statistical Competency Examination
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          Multi-domain branching diagnostic for {profile?.jobRole || 'Official Role'}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                        {assessmentResults.completedAt ? new Date(assessmentResults.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Official Baseline'}
                      </td>
                      <td>
                        <span className="badge badge-navy">IRT Adaptive Engine</span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>
                        {assessmentResults.totalQuestions || 25} Questions
                      </td>
                      <td style={{ fontWeight: 800, color: overallScore >= 70 ? '#059669' : '#D97706' }}>
                        {overallScore}%
                      </td>
                      <td>
                        <span className="badge badge-emerald">
                          <CheckCircle2 size={12} />
                          <span>Official Baseline Verified</span>
                        </span>
                      </td>
                    </tr>
                  )}

                  {/* Learning Progress Quiz Records */}
                  {progressRecords.map(rec => (
                    <tr key={rec.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0C2340' }}>
                          Learning Module Quiz: {rec.competencyName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {rec.materialTitle}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                        {new Date(rec.evaluatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <span className="badge badge-saffron">AI Document Quiz</span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>
                        4 MCQs
                      </td>
                      <td style={{ fontWeight: 800, color: rec.quizScore >= 70 ? '#059669' : '#D97706' }}>
                        {rec.quizScore}%
                      </td>
                      <td>
                        <span className="badge badge-emerald">
                          {rec.improvementDelta > 0 ? `+${rec.improvementDelta} Level Upgraded` : 'Demonstrated'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Before vs After Competency Level Comparison */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <TrendingUp size={18} color="#059669" />
            <span>Before vs After Competency Level Comparison</span>
          </div>
          <button
            className="btn btn-emerald btn-sm"
            onClick={() => setActiveTab('progress')}
          >
            Upload Material & Take Quiz
          </button>
        </div>

        {progressRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px', color: '#64748B', fontSize: '0.88rem' }}>
            <FileCheck size={32} color="#CBD5E1" style={{ margin: '0 auto 10px', display: 'block' }} />
            <div>No post-learning evaluations logged yet.</div>
            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
              Complete an iGOT or NSSTA course and upload study notes in the Learning module to record your verified Before vs After competency improvement!
            </div>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Competency</th>
                  <th>Training Module Document</th>
                  <th style={{ textAlign: 'center' }}>Before Learning Level</th>
                  <th style={{ textAlign: 'center' }}>Shift</th>
                  <th style={{ textAlign: 'center' }}>After Learning Level</th>
                  <th style={{ textAlign: 'center' }}>Evaluation Score</th>
                  <th>Next Action Directive</th>
                </tr>
              </thead>
              <tbody>
                {progressRecords.map(rec => (
                  <tr key={rec.id}>
                    <td style={{ fontWeight: 700, color: '#0C2340' }}>{rec.competencyName}</td>
                    <td style={{ fontSize: '0.82rem', color: '#475569' }}>{rec.materialTitle}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-slate">{rec.beforeLevel}</span>
                    </td>
                    <td style={{ textAlign: 'center', color: '#059669', fontWeight: 800 }}>
                      ➔
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-emerald" style={{ fontWeight: 700 }}>
                        {rec.afterLevel}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 800, color: '#059669' }}>
                      {rec.quizScore}%
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                      {rec.nextStep || 'Proceed to next priority roadmap milestone.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating AI Assistant Trigger Button (when chat is closed) */}
      {!isChatOpen && (
        <button
          type="button"
          onClick={() => setIsChatOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #071528 0%, #0C2340 60%, #143258 100%)',
            color: '#FFFFFF',
            border: '2px solid #FF9933',
            borderRadius: '50px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 10px 25px -5px rgba(12, 35, 64, 0.4), 0 0 15px rgba(255, 153, 51, 0.25)',
            cursor: 'pointer',
            zIndex: 9000,
            fontSize: '0.9rem',
            fontWeight: 700,
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
            e.currentTarget.style.boxShadow = '0 14px 28px -4px rgba(12, 35, 64, 0.5), 0 0 20px rgba(255, 153, 51, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(12, 35, 64, 0.4), 0 0 15px rgba(255, 153, 51, 0.25)';
          }}
          onClick={toggleChat}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={20} color="#FF9933" />
            <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', border: '1px solid #0C2340' }}></span>
          </div>
          <span>AI Assistant</span>
          <Sparkles size={14} color="#FF9933" />
        </button>
      )}

      {/* AI Assistant Chatbox Modal / Drawer */}
      <AIAssistantChatbox isOpen={isChatOpen} onClose={closeChat} />
    </div>
  );
}
