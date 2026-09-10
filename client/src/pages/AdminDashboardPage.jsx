import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  AlertTriangle, 
  Download, 
  Filter, 
  TrendingUp, 
  PieChart, 
  CheckCircle2, 
  Sparkles,
  Layers,
  ArrowUpRight,
  BarChart3,
  Award,
  Clock,
  BookOpen,
  Search,
  Target,
  GraduationCap,
  ChevronRight,
  TrendingDown,
  Minus,
  Info,
  Eye,
  X,
  FileText,
  Lock,
  ExternalLink,
  CheckCircle
} from 'lucide-react';

/**
 * Read-Only Officer Dossier Modal
 * Strictly VIEW-ONLY: allows Statistical Department Head to inspect individual officer
 * profile, baseline calibration scores, skill gaps, course recommendations, and post-course assessment results.
 */
function OfficerDossierModal({ officerId, onClose, getAuthHeaders }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!officerId) return;
    setLoading(true);
    setError('');

    const headers = getAuthHeaders ? getAuthHeaders() : {};
    fetch(`/api/admin/officer/${encodeURIComponent(officerId)}`, { headers })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch officer record.`);
        return res.json();
      })
      .then(json => {
        if (json.success && json.officer) {
          setData(json.officer);
        } else {
          setError(json.message || 'Officer dossier unavailable.');
        }
      })
      .catch(err => {
        console.error('Error fetching officer dossier:', err);
        setError(err.message || 'Failed to load officer details.');
      })
      .finally(() => setLoading(false));
  }, [officerId, getAuthHeaders]);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(7, 21, 40, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        className="card" 
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 0,
          background: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          margin: 0
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div 
          style={{
            background: 'linear-gradient(135deg, #071528 0%, #0C2340 100%)',
            color: '#FFFFFF',
            padding: '20px 24px',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '3px solid #FF9933'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div 
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: '#FF9933',
                color: '#0C2340',
                fontWeight: 800,
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {data?.name ? data.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SO'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {data?.name || 'Officer Dossier'}
                </h3>
                <span className="badge badge-saffron" style={{ fontSize: '0.72rem' }}>
                  {data?.employeeId || officerId}
                </span>
                <span className="badge badge-slate" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <Lock size={10} />
                  <span>READ-ONLY</span>
                </span>
              </div>
              <div style={{ fontSize: '0.84rem', color: '#CBD5E1', marginTop: '3px' }}>
                {data?.designation || 'Statistical Officer'} &bull; {data?.department || 'MoSPI'}
              </div>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#CBD5E1',
              cursor: 'pointer'
            }}
            title="Close Dossier"
          >
            <X size={18} />
          </button>
        </div>

        {/* Read-Only Banner */}
        <div style={{ background: '#FFF7ED', borderBottom: '1px solid #FED7AA', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#9A3412', fontWeight: 600 }}>
          <Lock size={14} color="#EA580C" />
          <span>ADMINISTRATIVE READ-ONLY MODE: This dossier provides institutional monitoring. Assessments, course actions, and profile modifications cannot be executed from administrative mode.</span>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {loading && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0C2340' }}>Loading official officer dossier...</div>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '4px' }}>Retrieving assessment records, competency calibrations, and training logs.</p>
            </div>
          )}

          {error && (
            <div className="callout callout-warning">
              <AlertTriangle size={20} color="#DC2626" />
              <div>
                <div style={{ fontWeight: 700, color: '#991B1B' }}>Error Loading Dossier</div>
                <div style={{ fontSize: '0.85rem', color: '#475569' }}>{error}</div>
              </div>
            </div>
          )}

          {!loading && data && (
            <>
              {/* SECTION A: OFFICER PROFILE DETAILS */}
              <div style={{ background: '#F8FAFC', padding: '16px 20px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.9rem', color: '#0C2340', marginBottom: '12px' }}>
                  <Users size={16} color="#0C2340" />
                  <span>1. Official Profile & Assignment Details</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>PRIMARY JOB ROLE</span>
                    <strong style={{ color: '#0C2340' }}>{data.jobRole || 'Statistical Officer'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>CURRENT ASSIGNMENT</span>
                    <strong style={{ color: '#0C2340' }}>{data.currentAssignment || 'Statistical Administration'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>SPECIALIZATION / DOMAIN</span>
                    <strong style={{ color: '#0C2340' }}>{data.specialization || 'Not specified'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>QUALIFICATION & EXPERIENCE</span>
                    <strong style={{ color: '#0C2340' }}>{data.educationalQualification} ({data.workExperience})</strong>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>PREVIOUS TRAININGS LOGGED</span>
                    <span style={{ color: '#334155' }}>{data.previousTrainings || 'None recorded'}</span>
                  </div>
                </div>
              </div>

              {/* SECTION B: INITIAL 25-QUESTION ASSESSMENT RESULTS */}
              <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.9rem', color: '#0C2340' }}>
                    <CheckCircle2 size={16} color="#059669" />
                    <span>2. Initial 25-Question Assessment & Baseline Calibration</span>
                  </div>
                  {data.hasCompletedAssessment ? (
                    <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                      Overall Readiness Score: {data.overallReadinessScore}%
                    </span>
                  ) : (
                    <span className="badge badge-slate" style={{ fontSize: '0.75rem' }}>
                      Assessment Pending
                    </span>
                  )}
                </div>

                {!data.hasCompletedAssessment ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748B', background: '#F8FAFC', borderRadius: '6px' }}>
                    This officer has not yet taken the initial 25-question adaptive assessment. Competencies remain uncalibrated.
                  </div>
                ) : (
                  <div className="data-table-wrapper" style={{ margin: 0 }}>
                    <table className="data-table" style={{ fontSize: '0.82rem' }}>
                      <thead>
                        <tr>
                          <th>Subject Area</th>
                          <th style={{ textAlign: 'center' }}>Demonstrated Level</th>
                          <th style={{ textAlign: 'center' }}>Score %</th>
                          <th>Calibration Benchmark</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(data.initialAssessment?.competencyScores || {}).map(([cId, comp]) => (
                          <tr key={cId}>
                            <td>
                              <strong style={{ color: '#0C2340' }}>{comp.competencyName || cId.replace(/_/g, ' ').toUpperCase()}</strong>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={`badge ${comp.demonstratedLevel === 'Advanced' ? 'badge-emerald' : comp.demonstratedLevel === 'Intermediate' ? 'badge-amber' : 'badge-red'}`} style={{ fontSize: '0.72rem' }}>
                                {comp.demonstratedLevel || 'Beginner'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 800, color: comp.score >= 70 ? '#059669' : comp.score >= 50 ? '#D97706' : '#DC2626' }}>
                              {comp.score}%
                            </td>
                            <td>
                              <span style={{ fontSize: '0.78rem', color: '#475569' }}>
                                {comp.demonstratedLevel === 'Advanced' ? 'Mastery verified' : comp.demonstratedLevel === 'Intermediate' ? 'Operational competence' : 'Deficit identified'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* SECTION C: DIAGNOSED SKILL GAPS */}
              <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.9rem', color: '#0C2340' }}>
                    <AlertTriangle size={16} color="#DC2626" />
                    <span>3. Diagnosed Skill Gaps & Deficit Priority</span>
                  </div>
                  <span className={`badge ${data.skillGaps?.length > 0 ? 'badge-red' : 'badge-emerald'}`} style={{ fontSize: '0.75rem' }}>
                    {data.skillGaps?.length || 0} Gap{data.skillGaps?.length === 1 ? '' : 's'}
                  </span>
                </div>

                {(!data.skillGaps || data.skillGaps.length === 0) ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#64748B', background: '#F8FAFC', borderRadius: '6px', fontSize: '0.85rem' }}>
                    {data.hasCompletedAssessment ? 'No skill gaps identified. All competencies meet or exceed official role benchmarks.' : 'Awaiting initial assessment completion.'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {data.skillGaps.map(gap => (
                      <div key={gap.competencyId} style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <strong style={{ color: '#0C2340', fontSize: '0.88rem' }}>{gap.competencyName}</strong>
                          <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                            Assessed at <strong>{gap.actualLevel || 'Beginner'}</strong> vs Required <strong>{gap.requiredLevel || 'Advanced'}</strong> standard for assignment.
                          </div>
                        </div>
                        <span className={`badge ${gap.gapSeverity === 'HIGH' ? 'badge-red' : 'badge-amber'}`} style={{ fontSize: '0.72rem' }}>
                          {gap.gapSeverity || 'MEDIUM'} PRIORITY
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION D: RECOMMENDED COURSES & TRAINING SYLLABUS */}
              <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.9rem', color: '#0C2340' }}>
                    <BookOpen size={16} color="#2563EB" />
                    <span>4. Recommended Courses (Official Curriculum)</span>
                  </div>
                  <span className="badge badge-slate" style={{ fontSize: '0.72rem' }}>
                    {data.recommendedCourses?.length || 0} Courses
                  </span>
                </div>

                {(!data.recommendedCourses || data.recommendedCourses.length === 0) ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#64748B', background: '#F8FAFC', borderRadius: '6px', fontSize: '0.85rem' }}>
                    No course recommendations available.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
                    {data.recommendedCourses.slice(0, 4).map(c => (
                      <div key={c.id || c.courseId} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '10px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                          <strong style={{ fontSize: '0.82rem', color: '#0C2340', lineHeight: 1.3 }}>{c.title || c.courseName}</strong>
                          <span className={`badge ${c.source === 'iGOT' ? 'badge-saffron' : 'badge-navy'}`} style={{ fontSize: '0.68rem' }}>
                            {c.source || 'NSSTA'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                          {c.provider} &bull; {c.duration || 'Self-Paced'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '6px', fontStyle: 'italic' }}>
                          Officer action only (Disabled in Admin View)
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION E: COURSE PROGRESS & BEFORE-VS-AFTER EVALUATION */}
              <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.9rem', color: '#0C2340' }}>
                    <TrendingUp size={16} color="#059669" />
                    <span>5. Course Progress & Before-vs-After Evaluation</span>
                  </div>
                  <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                    {data.totalCoursesCompleted} Completed
                  </span>
                </div>

                {(!data.beforeAfter || data.beforeAfter.length === 0) ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#64748B', background: '#F8FAFC', borderRadius: '6px', fontSize: '0.85rem' }}>
                    No course assessment evaluations completed by this officer yet.
                  </div>
                ) : (
                  <div className="data-table-wrapper" style={{ margin: 0 }}>
                    <table className="data-table" style={{ fontSize: '0.82rem' }}>
                      <thead>
                        <tr>
                          <th>Course Name</th>
                          <th>Competency</th>
                          <th style={{ textAlign: 'center' }}>Pre-Score</th>
                          <th style={{ textAlign: 'center' }}>Post-Quiz Score</th>
                          <th style={{ textAlign: 'center' }}>Improvement</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.beforeAfter.map((rec, i) => (
                          <tr key={i}>
                            <td>
                              <strong style={{ color: '#0C2340' }}>{rec.courseName}</strong>
                            </td>
                            <td>
                              <span className="badge badge-slate" style={{ fontSize: '0.72rem' }}>
                                {rec.competencyName}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center', color: '#64748B' }}>
                              {rec.beforeScore}%
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 800, color: '#0C2340' }}>
                              {rec.afterScore}%
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 800, color: '#059669' }}>
                              {rec.improvementPoints}
                            </td>
                            <td>
                              <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                                Passed &amp; Verified
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div 
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E2E8F0',
            background: '#F8FAFC',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
          }}
        >
          <button 
            type="button"
            className="btn btn-outline"
            onClick={onClose}
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * SVG Bar Chart: Divisional Competency Readiness
 */
function DepartmentReadinessChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B', fontSize: '0.9rem' }}>
        No divisional assessment data available yet.
      </div>
    );
  }

  const height = 230;
  const width = 540;
  const padding = { top: 25, right: 30, bottom: 45, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const barWidth = Math.min(48, chartWidth / data.length - 16);

  return (
    <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: '100%' }}>
        {/* Horizontal grid lines */}
        {[0, 25, 50, 75, 100].map((val) => {
          const y = padding.top + chartHeight - (val / 100) * chartHeight;
          return (
            <g key={val}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#E2E8F0"
                strokeDasharray={val === 0 ? 'none' : '3,3'}
              />
              <text
                x={padding.left - 8}
                y={y + 3}
                fontSize="10"
                fill="#94A3B8"
                textAnchor="end"
              >
                {val}%
              </text>
            </g>
          );
        })}

        {/* National Average Threshold Line (70%) */}
        <line
          x1={padding.left}
          y1={padding.top + chartHeight - (70 / 100) * chartHeight}
          x2={width - padding.right}
          y2={padding.top + chartHeight - (70 / 100) * chartHeight}
          stroke="#E65100"
          strokeWidth="1.5"
          strokeDasharray="4,4"
        />
        <text
          x={width - padding.right}
          y={padding.top + chartHeight - (70 / 100) * chartHeight - 5}
          fontSize="9"
          fill="#E65100"
          fontWeight="700"
          textAnchor="end"
        >
          National Benchmark: 70%
        </text>

        {/* Bars */}
        {data.map((dept, idx) => {
          const x = padding.left + idx * (chartWidth / data.length) + ((chartWidth / data.length) - barWidth) / 2;
          const barH = dept.avgReadiness > 0 ? (dept.avgReadiness / 100) * chartHeight : 4;
          const y = padding.top + chartHeight - barH;
          const isHigh = dept.avgReadiness >= 75;

          const label = dept.department.split('(')[1]?.replace(')', '') || dept.department.slice(0, 6);

          return (
            <g key={idx}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                fill={dept.avgReadiness === 0 ? '#CBD5E1' : isHigh ? '#059669' : dept.avgReadiness >= 50 ? '#FF9933' : '#EF4444'}
                rx="4"
                style={{ transition: 'all 0.5s ease' }}
              />
              <text
                x={x + barWidth / 2}
                y={y - 6}
                fontSize="11"
                fontWeight="800"
                fill={dept.avgReadiness === 0 ? '#94A3B8' : '#0C2340'}
                textAnchor="middle"
              >
                {dept.avgReadiness}%
              </text>
              <text
                x={x + barWidth / 2}
                y={height - padding.bottom + 16}
                fontSize="10"
                fontWeight="700"
                fill="#475569"
                textAnchor="middle"
              >
                {label}
              </text>
              <text
                x={x + barWidth / 2}
                y={height - padding.bottom + 28}
                fontSize="8.5"
                fill="#94A3B8"
                textAnchor="middle"
              >
                {dept.assessedOfficers || 0}/{dept.totalOfficers} Assessed
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function AdminDashboardPage({ activeSection = 'admin', onNavigateSection = () => {} }) {
  const { getAuthHeaders } = useAuth();

  const [department, setDepartment] = useState('All');
  const [jobRole, setJobRole] = useState('All');
  const [searchOfficer, setSearchOfficer] = useState('');
  const [subjectCategoryFilter, setSubjectCategoryFilter] = useState('All');
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Selected officer for Read-Only Dossier Modal inspection
  const [selectedOfficerId, setSelectedOfficerId] = useState(null);

  useEffect(() => {
    setLoading(true);
    const headers = getAuthHeaders ? getAuthHeaders() : {};
    fetch(`/api/admin/dashboard?department=${encodeURIComponent(department)}&jobRole=${encodeURIComponent(jobRole)}`, { headers })
      .then(res => res.json())
      .then(data => setAdminData(data))
      .catch(err => console.error('Error fetching admin dashboard:', err))
      .finally(() => setLoading(false));
  }, [department, jobRole, getAuthHeaders]);

  // Export Subject-Wise Competency Distribution to CSV
  const handleExportCSV = () => {
    if (!adminData || !adminData.subjectAnalysis) return;
    const rows = [
      ['Competency Name', 'Category', 'Total Assessed', 'Strong % (>=75%)', 'Needs Improvement % (50-74%)', 'Weak % (<50%)', 'Avg Score %', 'Strategic Action']
    ];
    adminData.subjectAnalysis.forEach(item => {
      rows.push([
        `"${item.competencyName}"`,
        item.category,
        item.totalAssessed,
        `${item.strongPct}%`,
        `${item.needsImprovementPct}%`,
        `${item.weakPct}%`,
        `${item.averageScore}%`,
        `"${item.strategicAction}"`
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MoSPI_Competency_Analysis_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const overview = adminData?.overview || {
    totalEmployees: 0,
    employeesAssessed: 0,
    employeesNotAssessed: 0,
    coursesRecommended: 0,
    coursesStarted: 0,
    coursesCompleted: 0,
    assessmentsCompleted: 0,
    employeesImproved: 0,
    totalSkillGapsIdentified: 0,
    highPrioritySkillGaps: 0,
    averageReadinessIndex: 0
  };

  const subjectAnalysisList = (adminData?.subjectAnalysis || []).filter(sub => {
    if (subjectCategoryFilter === 'All') return true;
    return sub.category === subjectCategoryFilter;
  });

  const beforeAfter = adminData?.beforeAfterAnalysis || {
    totalEvaluations: 0,
    improvedCount: 0,
    sameCount: 0,
    declinedCount: 0,
    avgImprovementPoints: '+0',
    subjectBreakdown: []
  };

  const skillGaps = adminData?.skillGapsList || [];
  const courses = adminData?.courseEffectiveness || [];

  const filteredOfficers = (adminData?.officerRoster || []).filter(off => {
    if (!searchOfficer) return true;
    const q = searchOfficer.toLowerCase();
    return (
      (off.name || '').toLowerCase().includes(q) ||
      (off.employeeId || '').toLowerCase().includes(q) ||
      (off.department || '').toLowerCase().includes(q) ||
      (off.designation || '').toLowerCase().includes(q) ||
      (off.currentAssignment || '').toLowerCase().includes(q)
    );
  });

  // Check section visibility with guaranteed fallback
  const validSections = [
    'admin',
    'admin-dashboard',
    'admin-employees',
    'admin-competencies',
    'admin-gaps',
    'admin-training',
    'admin-reports'
  ];
  const effectiveSection = validSections.includes(activeSection) ? activeSection : 'admin';

  const showOverview = effectiveSection === 'admin' || effectiveSection === 'admin-dashboard';
  const showEmployees = effectiveSection === 'admin' || effectiveSection === 'admin-employees';
  const showCompetencies = effectiveSection === 'admin' || effectiveSection === 'admin-competencies';
  const showGaps = effectiveSection === 'admin' || effectiveSection === 'admin-gaps';
  const showTraining = effectiveSection === 'admin' || effectiveSection === 'admin-training';
  const showReports = effectiveSection === 'admin' || effectiveSection === 'admin-reports';

  return (
    <div className="app-container main-content">
      {/* Read-Only Dossier Modal */}
      {selectedOfficerId && (
        <OfficerDossierModal 
          officerId={selectedOfficerId}
          onClose={() => setSelectedOfficerId(null)}
          getAuthHeaders={getAuthHeaders}
        />
      )}

      {/* SECTION 1: ROLE SEPARATION & LEADERSHIP HEADER */}
      <div 
        className="card" 
        style={{ 
          marginBottom: '20px', 
          background: 'linear-gradient(135deg, #071528 0%, #0C2340 100%)', 
          color: '#FFFFFF', 
          padding: '26px 30px',
          borderLeft: '5px solid #FF9933'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-saffron" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <ShieldCheck size={13} />
                <span>Statistical Department Head & Director General Intelligence</span>
              </span>
              <span className="badge badge-slate" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={11} />
                <span>Administrative Read-Only View</span>
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '4px 0 6px 0', color: '#FFFFFF' }}>
              National Statistical Capacity & Department Head Dashboard
            </h1>
            <p style={{ color: '#CBD5E1', fontSize: '0.92rem', maxWidth: '850px', lineHeight: 1.5 }}>
              Aggregated institutional intelligence across all registered statistical divisions. Monitors baseline calibration, subject mastery distributions, before-vs-after training impact, and critical skill deficits.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={handleExportCSV}
              className="btn btn-emerald"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={15} />
              <span>Export Competency CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* ADMINISTRATIVE VIEW TABS (Quick Switcher) */}
      <div 
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          marginBottom: '20px',
          paddingBottom: '4px'
        }}
      >
        {[
          { key: 'admin', label: 'All Intelligence Overview', icon: ShieldCheck },
          { key: 'admin-employees', label: 'Employees Directory', icon: Users },
          { key: 'admin-competencies', label: 'Competency Analytics', icon: PieChart },
          { key: 'admin-gaps', label: 'Skill Gaps', icon: AlertTriangle },
          { key: 'admin-training', label: 'Training Analytics', icon: TrendingUp },
          { key: 'admin-reports', label: 'Reports & Benchmarks', icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = effectiveSection === tab.key || (tab.key === 'admin' && effectiveSection === 'admin-dashboard');
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onNavigateSection(tab.key)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: isActive ? '#0C2340' : '#CBD5E1',
                background: isActive ? '#0C2340' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#475569',
                fontWeight: 700,
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={14} color={isActive ? '#FF9933' : '#64748B'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="card" style={{ marginBottom: '24px', padding: '14px 20px', background: '#F8FAFC' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.88rem', color: '#0C2340' }}>
            <Filter size={16} color="#E65100" />
            <span>Filter Department Analytics:</span>
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>Division / DES:</label>
              <select
                className="form-select"
                style={{ padding: '6px 12px', fontSize: '0.82rem', minWidth: '190px' }}
                value={department}
                onChange={e => setDepartment(e.target.value)}
              >
                <option value="All">All Divisions & State DES</option>
                <option value="SDRD">Survey Design & Research (SDRD)</option>
                <option value="DQAD">Data Quality Assurance (DQAD)</option>
                <option value="ESD">Economic Statistics Division (ESD)</option>
                <option value="NAD">National Accounts Division (NAD)</option>
                <option value="FOD">Field Operations Division (FOD)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>Job Role:</label>
              <select
                className="form-select"
                style={{ padding: '6px 12px', fontSize: '0.82rem', minWidth: '170px' }}
                value={jobRole}
                onChange={e => setJobRole(e.target.value)}
              >
                <option value="All">All Official Roles</option>
                <option value="Statistical">Statistical Officers</option>
                <option value="Technical">Technical & Data Officers</option>
                <option value="Leadership">Leadership & Directors</option>
              </select>
            </div>

            {(department !== 'All' || jobRole !== 'All') && (
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                onClick={() => { setDepartment('All'); setJobRole('All'); }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: 10 OVERVIEW KPIS (DATA-DRIVEN) */}
      {showOverview && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0C2340', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} color="#FF9933" />
              <span>Institutional Key Performance Indicators (Real-Time Metrics)</span>
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
              Calculated dynamically from live system records
            </span>
          </div>

          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', 
              gap: '14px' 
            }}
          >
            {/* KPI 1: Total Officers / Employees */}
            <div className="card" style={{ padding: '16px', margin: 0, borderLeft: '4px solid #0C2340' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.78rem', fontWeight: 700 }}>
                <span>TOTAL OFFICERS</span>
                <Users size={16} color="#0C2340" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0C2340', marginTop: '6px' }}>
                {overview.totalEmployees}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                Registered in MoSPI roster
              </div>
            </div>

            {/* KPI 2: Assessed Officers */}
            <div className="card" style={{ padding: '16px', margin: 0, borderLeft: '4px solid #059669' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#059669', fontSize: '0.78rem', fontWeight: 700 }}>
                <span>ASSESSED OFFICERS</span>
                <CheckCircle2 size={16} color="#059669" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
                {overview.employeesAssessed}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                Completed initial calibration
              </div>
            </div>

            {/* KPI 3: Unassessed Officers */}
            <div className="card" style={{ padding: '16px', margin: 0, borderLeft: '4px solid #D97706' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#D97706', fontSize: '0.78rem', fontWeight: 700 }}>
                <span>UNASSESSED OFFICERS</span>
                <Clock size={16} color="#D97706" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#D97706', marginTop: '6px' }}>
                {overview.employeesNotAssessed}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                Pending baseline test
              </div>
            </div>

            {/* KPI 4: Courses Recommended */}
            <div className="card" style={{ padding: '16px', margin: 0, borderLeft: '4px solid #2563EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#2563EB', fontSize: '0.78rem', fontWeight: 700 }}>
                <span>COURSES RECOMMENDED</span>
                <BookOpen size={16} color="#2563EB" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563EB', marginTop: '6px' }}>
                {overview.coursesRecommended}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                In official iGOT / NSSTA catalog
              </div>
            </div>

            {/* KPI 5: Courses Started */}
            <div className="card" style={{ padding: '16px', margin: 0, borderLeft: '4px solid #4F46E5' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#4F46E5', fontSize: '0.78rem', fontWeight: 700 }}>
                <span>COURSES STARTED</span>
                <GraduationCap size={16} color="#4F46E5" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4F46E5', marginTop: '6px' }}>
                {overview.coursesStarted}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                Active officer enrolments
              </div>
            </div>

            {/* KPI 6: Courses Completed */}
            <div className="card" style={{ padding: '16px', margin: 0, borderLeft: '4px solid #10B981' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#059669', fontSize: '0.78rem', fontWeight: 700 }}>
                <span>COURSES COMPLETED</span>
                <Award size={16} color="#10B981" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
                {overview.coursesCompleted}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                Passed 15-Q course quiz (&ge;60%)
              </div>
            </div>

            {/* KPI 7: Assessments Completed */}
            <div className="card" style={{ padding: '16px', margin: 0, borderLeft: '4px solid #0891B2' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#0891B2', fontSize: '0.78rem', fontWeight: 700 }}>
                <span>ASSESSMENTS COMPLETED</span>
                <PieChart size={16} color="#0891B2" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0891B2', marginTop: '6px' }}>
                {overview.assessmentsCompleted}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                Initial (25Q) + Course Quizzes (15Q)
              </div>
            </div>

            {/* KPI 8: Officers Improved */}
            <div className="card" style={{ padding: '16px', margin: 0, borderLeft: '4px solid #16A34A' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#16A34A', fontSize: '0.78rem', fontWeight: 700 }}>
                <span>OFFICERS IMPROVED</span>
                <TrendingUp size={16} color="#16A34A" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16A34A', marginTop: '6px' }}>
                {overview.employeesImproved}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                Post-course score &gt; initial score
              </div>
            </div>

            {/* KPI 9: Total Skill Gaps Identified */}
            <div className="card" style={{ padding: '16px', margin: 0, borderLeft: '4px solid #DC2626' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#DC2626', fontSize: '0.78rem', fontWeight: 700 }}>
                <span>TOTAL SKILL GAPS</span>
                <AlertTriangle size={16} color="#DC2626" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#DC2626', marginTop: '6px' }}>
                {overview.totalSkillGapsIdentified}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                Institutional competency deficits
              </div>
            </div>

            {/* KPI 10: High Priority Skill Gaps */}
            <div className="card" style={{ padding: '16px', margin: 0, borderLeft: '4px solid #991B1B' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#991B1B', fontSize: '0.78rem', fontWeight: 700 }}>
                <span>HIGH PRIORITY GAPS</span>
                <AlertTriangle size={16} color="#991B1B" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#991B1B', marginTop: '6px' }}>
                {overview.highPrioritySkillGaps}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                Critical deficiency &lt;50% or &Delta;&ge;2
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 8 / EMPLOYEES DIRECTORY & READ-ONLY DOSSIER INSPECTION */}
      {showEmployees && (
        <div className="card" style={{ marginBottom: '28px' }}>
          <div className="card-header">
            <div>
              <div className="card-title">
                <Users size={18} color="#0C2340" />
                <span>Employee Directory & Individual Competency Dossiers (Read-Only Inspection)</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                Inspect verified profiles, baseline calibrations, diagnosed gaps, and post-course results. Select any officer to open their read-only dossier.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search officer name, ID, or assignment..."
                  value={searchOfficer}
                  onChange={e => setSearchOfficer(e.target.value)}
                  className="form-input"
                  style={{ padding: '6px 12px 6px 32px', fontSize: '0.82rem', width: '270px' }}
                />
                <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Officer Details</th>
                  <th>Designation & Division</th>
                  <th>Current Assignment</th>
                  <th style={{ textAlign: 'center' }}>Baseline Test</th>
                  <th style={{ textAlign: 'center' }}>Readiness Score</th>
                  <th>Critical Skill Gap</th>
                  <th>Training Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOfficers.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                      No officers match the search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOfficers.map(off => (
                    <tr key={off.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0C2340' }}>{off.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{off.employeeId}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: '#0C2340' }}>{off.designation}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{off.department}</div>
                      </td>
                      <td>
                        <span className="badge badge-slate" style={{ fontSize: '0.75rem' }}>
                          {off.currentAssignment}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {off.hasCompletedAssessment ? (
                          <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                            Completed
                          </span>
                        ) : (
                          <span className="badge badge-slate" style={{ fontSize: '0.72rem' }}>
                            Pending
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: off.readinessScore >= 70 ? '#059669' : off.readinessScore >= 50 ? '#D97706' : off.hasCompletedAssessment ? '#DC2626' : '#94A3B8' }}>
                        {off.hasCompletedAssessment ? `${off.readinessScore}%` : '0%'}
                      </td>
                      <td>
                        <span 
                          className={`badge ${
                            off.criticalGap === 'None' 
                              ? 'badge-emerald' 
                              : off.criticalGap === 'Pending Diagnosis' 
                              ? 'badge-slate' 
                              : 'badge-red'
                          }`} 
                          style={{ fontSize: '0.72rem' }}
                        >
                          {off.criticalGap}
                        </span>
                      </td>
                      <td>
                        <span 
                          className={`badge ${
                            off.status === 'Ready' 
                              ? 'badge-emerald' 
                              : off.status === 'In Training' 
                              ? 'badge-amber' 
                              : off.status === 'High Priority Gap'
                              ? 'badge-red'
                              : 'badge-slate'
                          }`}
                        >
                          {off.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ 
                            padding: '4px 10px', 
                            fontSize: '0.75rem', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            borderColor: '#0C2340',
                            color: '#0C2340'
                          }}
                          onClick={() => setSelectedOfficerId(off.id)}
                          title="View complete officer dossier in read-only mode"
                        >
                          <Eye size={13} />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: SUBJECT-WISE COMPETENCY ANALYSIS */}
      {showCompetencies && (
        <div className="card" style={{ marginBottom: '28px' }}>
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div className="card-title">
                <PieChart size={18} color="#0C2340" />
                <span>Subject-Wise Competency Analysis & Distribution</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                Breakdown for all official statistical competencies: Strong (&ge;75%), Needs Improvement (50-74%), and Weak (&lt;50%)
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Category:</span>
              <select
                className="form-select"
                style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                value={subjectCategoryFilter}
                onChange={e => setSubjectCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="DOMAIN">DOMAIN</option>
                <option value="TECHNICAL">TECHNICAL</option>
                <option value="ANALYTICAL">ANALYTICAL</option>
                <option value="POLICY">POLICY</option>
              </select>
            </div>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject / Competency Name</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'center' }}>Officers Assessed</th>
                  <th style={{ width: '260px' }}>Distribution (Strong / Needs Improvement / Weak)</th>
                  <th style={{ textAlign: 'center' }}>Strong (&ge;75%)</th>
                  <th style={{ textAlign: 'center' }}>Needs Imprv (50-74%)</th>
                  <th style={{ textAlign: 'center' }}>Weak (&lt;50%)</th>
                  <th style={{ textAlign: 'center' }}>Avg Score</th>
                  <th>Strategic Action / Directive</th>
                </tr>
              </thead>
              <tbody>
                {subjectAnalysisList.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                      No subjects match selected category filter.
                    </td>
                  </tr>
                ) : (
                  subjectAnalysisList.map(item => {
                    const hasAssessed = item.totalAssessed > 0;
                    const isWeakHigh = item.weakPct >= 35;

                    return (
                      <tr key={item.competencyId}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0C2340' }}>{item.competencyName}</div>
                        </td>
                        <td>
                          <span className="badge badge-slate" style={{ fontSize: '0.72rem' }}>
                            {item.category}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: hasAssessed ? '#0C2340' : '#94A3B8' }}>
                          {item.totalAssessed}
                        </td>
                        <td>
                          {hasAssessed ? (
                            <div style={{ height: '14px', width: '100%', background: '#F1F5F9', borderRadius: '4px', display: 'flex', overflow: 'hidden' }}>
                              {item.strongPct > 0 && (
                                <div style={{ width: `${item.strongPct}%`, background: '#10B981' }} title={`Strong: ${item.strongPct}%`} />
                              )}
                              {item.needsImprovementPct > 0 && (
                                <div style={{ width: `${item.needsImprovementPct}%`, background: '#F59E0B' }} title={`Needs Improvement: ${item.needsImprovementPct}%`} />
                              )}
                              {item.weakPct > 0 && (
                                <div style={{ width: `${item.weakPct}%`, background: '#EF4444' }} title={`Weak: ${item.weakPct}%`} />
                              )}
                            </div>
                          ) : (
                            <div style={{ height: '14px', width: '100%', background: '#E2E8F0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600 }}>No assessments yet</span>
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: hasAssessed ? '#059669' : '#94A3B8' }}>
                          {hasAssessed ? `${item.strongPct}%` : '0%'}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: hasAssessed ? '#D97706' : '#94A3B8' }}>
                          {hasAssessed ? `${item.needsImprovementPct}%` : '0%'}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 800, color: hasAssessed ? (isWeakHigh ? '#DC2626' : '#64748B') : '#94A3B8' }}>
                          {hasAssessed ? `${item.weakPct}%` : '0%'}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: hasAssessed ? '#0C2340' : '#94A3B8' }}>
                          {hasAssessed ? `${item.averageScore}%` : '0%'}
                        </td>
                        <td>
                          {!hasAssessed ? (
                            <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>
                              Awaiting Assessments
                            </span>
                          ) : isWeakHigh ? (
                            <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>
                              Immediate NSSTA Batch Required
                            </span>
                          ) : item.weakPct > 0 ? (
                            <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                              Reinforcement Course Recommended
                            </span>
                          ) : (
                            <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                              Healthy Operational Benchmark
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: BEFORE VS AFTER LEARNING (EVALUATION) */}
      {showTraining && (
        <div className="card" style={{ marginBottom: '28px' }}>
          <div className="card-header">
            <div className="card-title">
              <TrendingUp size={18} color="#059669" />
              <span>Before vs After Learning Evaluation (Training Impact Assessment)</span>
            </div>
            <span className="badge badge-emerald">Course Assessment &Delta; Analysis</span>
          </div>

          {/* Evaluation Summary Cards */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
              gap: '12px',
              marginBottom: '18px'
            }}
          >
            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>OFFICERS EVALUATED</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0C2340', marginTop: '4px' }}>
                {beforeAfter.totalEvaluations}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>Completed course post-tests</div>
            </div>

            <div style={{ background: '#F0FDF4', padding: '14px', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={13} color="#166534" />
                <span>SCORES IMPROVED</span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#166534', marginTop: '4px' }}>
                {beforeAfter.improvedCount}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#16A34A', marginTop: '2px' }}>Higher post-course score</div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Minus size={13} color="#475569" />
                <span>SCORES UNCHANGED</span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#334155', marginTop: '4px' }}>
                {beforeAfter.sameCount}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>Retained baseline score</div>
            </div>

            <div style={{ background: '#FEF2F2', padding: '14px', borderRadius: '8px', border: '1px solid #FECACA' }}>
              <div style={{ fontSize: '0.75rem', color: '#991B1B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingDown size={13} color="#991B1B" />
                <span>SCORES DECLINED</span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#991B1B', marginTop: '4px' }}>
                {beforeAfter.declinedCount}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#DC2626', marginTop: '2px' }}>Requires retraining review</div>
            </div>

            <div style={{ background: '#EFF6FF', padding: '14px', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
              <div style={{ fontSize: '0.75rem', color: '#1E40AF', fontWeight: 700 }}>AVG NET IMPROVEMENT</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1D4ED8', marginTop: '4px' }}>
                {beforeAfter.avgImprovementPoints} pp
              </div>
              <div style={{ fontSize: '0.7rem', color: '#2563EB', marginTop: '2px' }}>Percentage points gained</div>
            </div>
          </div>

          {/* Detailed Before-After Course Breakdown or Required Empty State */}
          {beforeAfter.totalEvaluations === 0 || beforeAfter.subjectBreakdown.length === 0 ? (
            <div 
              style={{ 
                padding: '36px 24px', 
                textAlign: 'center', 
                background: '#F8FAFC', 
                borderRadius: '8px', 
                border: '1px dashed #CBD5E1' 
              }}
            >
              <Info size={24} color="#64748B" style={{ margin: '0 auto 8px auto' }} />
              <div style={{ fontWeight: 700, color: '#0C2340', fontSize: '0.95rem' }}>
                No post-course assessment data available yet.
              </div>
              <p style={{ color: '#64748B', fontSize: '0.85rem', maxWidth: '540px', margin: '6px auto 0 auto', lineHeight: 1.5 }}>
                Data will appear as officers complete courses and take course assessments.
              </p>
            </div>
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Course / Subject Area</th>
                    <th>Competency Domain</th>
                    <th style={{ textAlign: 'center' }}>Officers Evaluated</th>
                    <th style={{ textAlign: 'center' }}>Pre-Assessment Avg</th>
                    <th style={{ textAlign: 'center' }}>Post-Assessment Avg</th>
                    <th style={{ textAlign: 'center' }}>Net Improvement</th>
                    <th>Training Impact Status</th>
                  </tr>
                </thead>
                <tbody>
                  {beforeAfter.subjectBreakdown.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0C2340' }}>{item.courseName}</div>
                      </td>
                      <td>
                        <span className="badge badge-slate" style={{ fontSize: '0.72rem' }}>
                          {item.competencyName}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>
                        {item.officersTrained}
                      </td>
                      <td style={{ textAlign: 'center', color: '#64748B', fontWeight: 600 }}>
                        {item.beforeAvg}%
                      </td>
                      <td style={{ textAlign: 'center', color: '#0C2340', fontWeight: 700 }}>
                        {item.afterAvg}%
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: item.improvementPoints.startsWith('+') && item.improvementPoints !== '+0' ? '#059669' : '#64748B' }}>
                        {item.improvementPoints} pp
                      </td>
                      <td>
                        {item.improvementPoints.startsWith('+') && item.improvementPoints !== '+0' ? (
                          <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                            Verified Knowledge Gain
                          </span>
                        ) : (
                          <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>
                            Baseline Maintained
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: DEPARTMENT-WIDE SKILL GAP ANALYSIS */}
      {showGaps && (
        <div className="card" style={{ marginBottom: '28px' }}>
          <div className="card-header">
            <div className="card-title">
              <AlertTriangle size={18} color="#DC2626" />
              <span>Department-Wide Skill Gap Analysis (Ranked Deficit Areas)</span>
            </div>
            <span className="badge badge-red">{skillGaps.length} Active Gaps</span>
          </div>

          {skillGaps.length === 0 ? (
            <div 
              style={{ 
                padding: '36px 24px', 
                textAlign: 'center', 
                background: '#F8FAFC', 
                borderRadius: '8px', 
                border: '1px dashed #CBD5E1' 
              }}
            >
              <CheckCircle2 size={24} color="#059669" style={{ margin: '0 auto 8px auto' }} />
              <div style={{ fontWeight: 700, color: '#0C2340', fontSize: '0.95rem' }}>
                No skill gaps identified yet. Awaiting initial assessments.
              </div>
              <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '4px auto 0 auto' }}>
                As officers complete the initial 25-question calibration test, priority gaps will be dynamically ranked here.
              </p>
            </div>
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>Rank</th>
                    <th>Skill / Competency Area</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'center' }}>Affected Officers</th>
                    <th style={{ textAlign: 'center' }}>Affected %</th>
                    <th style={{ textAlign: 'center' }}>Priority Level</th>
                    <th>Recommended Intervention / Programme</th>
                  </tr>
                </thead>
                <tbody>
                  {skillGaps.map((gap, index) => (
                    <tr key={gap.competencyId}>
                      <td>
                        <span 
                          style={{ 
                            width: '24px', 
                            height: '24px', 
                            borderRadius: '50%', 
                            background: index < 3 ? '#FEE2E2' : '#F1F5F9', 
                            color: index < 3 ? '#DC2626' : '#64748B', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontWeight: 800, 
                            fontSize: '0.75rem' 
                          }}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0C2340' }}>{gap.competencyName}</div>
                      </td>
                      <td>
                        <span className="badge badge-slate" style={{ fontSize: '0.72rem' }}>
                          {gap.category}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#0C2340' }}>
                        {gap.affectedCount} Officer{gap.affectedCount === 1 ? '' : 's'}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: gap.affectedPct >= 50 ? '#DC2626' : '#D97706' }}>
                        {gap.affectedPct}%
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${gap.priorityLevel === 'High Priority' ? 'badge-red' : 'badge-amber'}`} style={{ fontSize: '0.72rem' }}>
                          {gap.priorityLevel}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
                          {gap.recommendedAction}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 6: COURSE & TRAINING EFFECTIVENESS */}
      {showTraining && (
        <div className="card" style={{ marginBottom: '28px' }}>
          <div className="card-header">
            <div className="card-title">
              <Award size={18} color="#0C2340" />
              <span>Course & Training Effectiveness (iGOT & NSSTA Catalog Performance)</span>
            </div>
            <span className="badge badge-slate">Official Syllabus Evaluation</span>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Provider / Source</th>
                  <th>Competency Focus</th>
                  <th style={{ textAlign: 'center' }}>Enrolled / Started</th>
                  <th style={{ textAlign: 'center' }}>Completed</th>
                  <th style={{ width: '180px' }}>Completion Rate</th>
                  <th style={{ textAlign: 'center' }}>Avg Post-Score</th>
                  <th>Effectiveness Status</th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                      No courses found in catalog.
                    </td>
                  </tr>
                ) : (
                  courses.map(course => (
                    <tr key={course.courseId}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0C2340' }}>{course.title}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{course.duration || 'Self-Paced Module'}</div>
                      </td>
                      <td>
                        <span className={`badge ${course.source === 'iGOT' ? 'badge-saffron' : 'badge-navy'}`} style={{ fontSize: '0.72rem' }}>
                          {course.source || 'NSSTA'}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-slate" style={{ fontSize: '0.72rem' }}>
                          {course.competencyName}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>
                        {course.enrolledCount}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: course.completedCount > 0 ? '#059669' : '#64748B' }}>
                        {course.completedCount}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div 
                              style={{ 
                                width: `${course.completionRate}%`, 
                                height: '100%', 
                                background: course.completionRate >= 70 ? '#10B981' : course.completionRate >= 40 ? '#F59E0B' : '#EF4444' 
                              }} 
                            />
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, minWidth: '35px', textAlign: 'right' }}>
                            {course.completionRate}%
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: course.completedCount > 0 ? (course.averageScore >= 70 ? '#059669' : '#D97706') : '#94A3B8' }}>
                        {course.completedCount > 0 ? `${course.averageScore}%` : '—'}
                      </td>
                      <td>
                        <span 
                          className={`badge ${
                            course.status === 'High Impact' 
                              ? 'badge-emerald' 
                              : course.status === 'Needs Reinforcement' 
                              ? 'badge-amber' 
                              : 'badge-slate'
                          }`} 
                          style={{ fontSize: '0.72rem' }}
                        >
                          {course.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 7: DIVISIONAL READINESS CHART & INSTITUTIONAL CAPACITY ALERTS */}
      {showReports && (
        <div className="grid-2" style={{ marginBottom: '28px' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <BarChart3 size={18} color="#0C2340" />
                <span>Divisional Competency Readiness</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>5 Key MoSPI Divisions</span>
            </div>
            <DepartmentReadinessChart data={adminData?.departmentBreakdown || []} />
            <div style={{ fontSize: '0.75rem', color: '#64748B', textAlign: 'center', marginTop: '10px' }}>
              Bars indicate average officer statistical readiness score per division.
            </div>
          </div>

          {/* Capacity Alerts */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <AlertTriangle size={18} color="#DC2626" />
                <span>Urgent Institutional Capacity Directives</span>
              </div>
              <span className="badge badge-red">Leadership Action</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(adminData?.capacityBuildingAlerts || []).map(alert => (
                <div 
                  key={alert.id} 
                  className="callout callout-warning" 
                  style={{ 
                    margin: 0, 
                    borderLeftColor: alert.severity === 'HIGH' ? '#DC2626' : alert.severity === 'MEDIUM' ? '#F59E0B' : '#059669' 
                  }}
                >
                  <AlertTriangle 
                    size={20} 
                    color={alert.severity === 'HIGH' ? '#DC2626' : alert.severity === 'MEDIUM' ? '#F59E0B' : '#059669'} 
                    style={{ flexShrink: 0, marginTop: '2px' }} 
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: '#0C2340', fontSize: '0.92rem' }}>
                      {alert.title}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px', lineHeight: 1.4 }}>
                      {alert.detail}
                    </div>
                  </div>
                </div>
              ))}

              {(adminData?.topGaps || []).slice(0, 2).map((gap, i) => (
                <div key={i} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#0C2340', fontSize: '0.88rem' }}>{gap.competencyName}</span>
                    <span className="badge badge-red">{gap.weakPercentage}% Deficit</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
                    <strong>Mandate:</strong> {gap.recommendedAction}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
