import React, { useState } from 'react';
import { useOfficer } from '../context/OfficerContext';
import { BookOpen, ExternalLink, Sparkles, Building, Globe, CheckCircle2, ArrowRight, ShieldCheck, Filter, AlertTriangle } from 'lucide-react';

export default function CourseRecommendationsPage() {
  const { recommendations, setActiveTab, profile, startCourse } = useOfficer();
  const [sourceFilter, setSourceFilter] = useState('ALL'); // 'ALL' | 'iGOT' | 'NSSTA' | 'TPAC'
  const [portalNotice, setPortalNotice] = useState(null);

  const filtered = recommendations.filter(rec => {
    if (sourceFilter === 'ALL') return true;
    if (sourceFilter === 'iGOT') {
      return rec.source === 'iGOT' || (rec.provider && rec.provider.toLowerCase().includes('igot'));
    }
    if (sourceFilter === 'NSSTA') {
      return (rec.source && rec.source.includes('NSSTA')) || (rec.provider && rec.provider.toLowerCase().includes('nssta'));
    }
    if (sourceFilter === 'TPAC') {
      return (rec.source && rec.source.includes('TPAC')) ||
             (rec.provider && rec.provider.toLowerCase().includes('tpac')) ||
             (rec.title && rec.title.toLowerCase().includes('tpac')) ||
             (rec.description && rec.description.toLowerCase().includes('tpac')) ||
             (rec.tags && rec.tags.some(t => t.toLowerCase().includes('tpac')));
    }
    return true;
  });

  const handleStartCourse = (rec, e) => {
    if (e && e.preventDefault) e.preventDefault();

    // If this recommended course has a mapped course PDF, open ONLY that PDF and set learning context
    if (rec.hasMappedPdf || rec.pdfFileName) {
      startCourse(rec, true);
      return;
    }

    // Check if the external destination cannot be safely reached (e.g. NSSTA/TPAC certificate authority issue)
    const isUnsafe = rec.portalSafe === false || 
                     rec.portalStatus === 'CERTIFICATE_ISSUE' || 
                     (rec.officialUrl && rec.officialUrl.includes('nssta.gov.in') && rec.portalSafe !== true);

    if (isUnsafe) {
      setPortalNotice({
        type: 'warning',
        title: 'Official Portal Access Notice',
        message: 'Official NSSTA/TPAC portal is currently unavailable or has a certificate issue. Please try again later.',
        officialUrl: rec.officialCourseUrl || rec.officialUrl || 'https://www.nssta.gov.in/',
        provider: rec.provider
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Determine target URL: verified course-specific URL if present, otherwise official portal fallback
    const hasVerifiedCourseUrl = Boolean(rec.officialCourseUrl);
    const destinationUrl = hasVerifiedCourseUrl ? rec.officialCourseUrl : (rec.officialUrl || 'https://igotkarmayogi.gov.in/');

    if (hasVerifiedCourseUrl) {
      setPortalNotice({
        type: 'info',
        title: 'Opening Verified Course Destination',
        message: `Opening verified course page on ${rec.provider} in a new tab: ${destinationUrl}`,
        officialUrl: destinationUrl,
        provider: rec.provider
      });
    } else {
      setPortalNotice({
        type: 'info',
        title: 'Exact Course Link Unavailable — Opening Official Portal Fallback',
        message: `Exact official course URL is currently unavailable for "${rec.title}". Opening official ${rec.provider} portal as fallback: ${destinationUrl}`,
        officialUrl: destinationUrl,
        provider: rec.provider
      });
    }

    // Open external destination in a new browser tab safely
    window.open(destinationUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="app-container main-content">
      <div className="page-header">
        <div>
          <div className="badge badge-saffron" style={{ marginBottom: '8px' }}>
            Page 8 • Official Capacity Building Programmes
          </div>
          <h1 className="page-title">
            <BookOpen size={28} color="#FF9933" />
            <span>Course & Training Recommendations</span>
          </h1>
          <p className="page-subtitle">
            Curated from <strong>iGOT Karmayogi Bharat</strong>, <strong>NSSTA Academy</strong>, and <strong>TPAC Approved Programmes</strong>, directly matched to your verified competency gaps.
          </p>
        </div>

        <button
          className="btn btn-emerald btn-lg"
          onClick={() => setActiveTab('progress')}
        >
          <span>After Learning: Upload Notes & Take Quiz</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Portal Access Notice Banner */}
      {portalNotice && (
        <div 
          className={`callout ${portalNotice.type === 'warning' ? 'callout-warning' : 'callout-info'}`} 
          style={{ 
            marginBottom: '20px', 
            borderLeft: portalNotice.type === 'warning' ? '4px solid #F59E0B' : '4px solid #2563EB',
            background: portalNotice.type === 'warning' ? '#FFFBEB' : '#EFF6FF',
            padding: '16px 20px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            {portalNotice.type === 'warning' ? (
              <AlertTriangle size={22} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <ExternalLink size={20} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: portalNotice.type === 'warning' ? '#92400E' : '#1E40AF', marginBottom: '2px' }}>
                {portalNotice.title}
              </div>
              <div style={{ fontSize: '0.88rem', color: portalNotice.type === 'warning' ? '#B45309' : '#1E3A8A', lineHeight: 1.5, fontWeight: 500 }}>
                {portalNotice.message}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '6px' }}>
                Configured Official Destination: <code>{portalNotice.officialUrl}</code>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPortalNotice(null)}
            className="btn btn-sm btn-outline"
            style={{ fontSize: '0.75rem', padding: '4px 8px', flexShrink: 0 }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* System Architecture & Official Destination Distinction */}
      <div className="callout callout-success" style={{ marginBottom: '24px' }}>
        <ShieldCheck size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontWeight: 700 }}>
            System Architecture: Official Training Portals & External Destination Handling
          </div>
          <div style={{ fontSize: '0.84rem', marginTop: '6px', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div>
              • <strong>Internal Prototype Platform:</strong> Competency diagnostics, AI gap analysis, and personalized roadmap sequencing run entirely within this MoSPI prototype application.
            </div>
            <div>
              • <strong>External Official Destinations:</strong> Course content is hosted on official government platforms (<strong>iGOT Karmayogi Bharat</strong> at <code>https://igotkarmayogi.gov.in/</code> and <strong>NSSTA Academy</strong> at <code>https://www.nssta.gov.in/</code>). Links open in a new tab without simulated players.
            </div>
            <div>
              • <strong>Live Government API Status:</strong> Courses are curated from verified official training calendars. Direct bidirectional API synchronization will activate when official production API credentials are configured in <code>.env</code> (no simulated or fake APIs are used).
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${sourceFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSourceFilter('ALL')}
          >
            All Sources ({recommendations.length})
          </button>
          <button
            className={`btn btn-sm ${sourceFilter === 'iGOT' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSourceFilter('iGOT')}
          >
            iGOT Karmayogi ({recommendations.filter(r => r.source === 'iGOT' || (r.provider && r.provider.includes('iGOT'))).length})
          </button>
          <button
            className={`btn btn-sm ${sourceFilter === 'NSSTA' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSourceFilter('NSSTA')}
          >
            NSSTA Academy ({recommendations.filter(r => (r.source && r.source.includes('NSSTA')) || (r.provider && r.provider.includes('NSSTA'))).length})
          </button>
          <button
            className={`btn btn-sm ${sourceFilter === 'TPAC' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSourceFilter('TPAC')}
          >
            TPAC Programmes ({recommendations.filter(r => (r.source && r.source.includes('TPAC')) || (r.provider && r.provider.includes('TPAC')) || (r.title && r.title.includes('TPAC')) || (r.tags && r.tags.some(t => t.includes('TPAC')))).length})
          </button>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
          Showing <strong>{filtered.length}</strong> prioritized courses
        </div>
      </div>

      {/* Recommendations Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filtered.map(rec => {
          const isIGOT = rec.source === 'iGOT';
          const isCritical = rec.recommendationPriority === 'Critical';

          return (
            <div key={rec.id} className="card card-hover" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span className={`badge ${isIGOT ? 'badge-saffron' : 'badge-emerald'}`}>
                      {isIGOT ? <Globe size={12} /> : <Building size={12} />}
                      <span>{rec.provider}</span>
                    </span>

                    <span className={`badge ${isCritical ? 'badge-red' : 'badge-amber'}`}>
                      {rec.recommendationPriority} Priority
                    </span>

                    <span className="badge badge-slate">{rec.mode}</span>
                    <span className="badge badge-slate">{rec.duration}</span>
                  </div>

                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0C2340', marginTop: '4px' }}>
                    {rec.title}
                  </h3>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-navy" style={{ fontSize: '0.78rem' }}>
                    Target: {rec.targetLevel} {rec.competencyName}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, marginBottom: '16px' }}>
                {rec.description}
              </p>

              {/* Explainable Recommendation Rationale */}
              <div style={{ background: '#FFF7ED', padding: '12px 16px', borderRadius: '8px', border: '1px solid #FED7AA', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#C2410C', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <Sparkles size={14} />
                  <span>Explainable AI Recommendation Rationale:</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#7C2D12' }}>
                  {rec.whyRecommended}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    Official Destination: <code>{rec.officialCourseUrl || rec.officialUrl}</code>
                  </div>
                  {isIGOT && !rec.officialCourseUrl && (
                    <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '3px' }}>
                      Exact course link unavailable • Opens official iGOT portal as fallback
                    </div>
                  )}
                  {isIGOT && rec.officialCourseUrl && (
                    <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '3px', fontWeight: 600 }}>
                      Verified course deep-link available
                    </div>
                  )}
                  {(!isIGOT || rec.portalStatus === 'CERTIFICATE_ISSUE') && (
                    <div style={{ fontSize: '0.72rem', color: '#D97706', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={12} />
                      <span>External portal currently has SSL certificate authority issue</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={(e) => handleStartCourse(rec, e)}
                    className="btn btn-saffron"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                  >
                    <span>Start Course on {isIGOT ? 'iGOT Portal' : (rec.provider?.includes('TPAC') || rec.source?.includes('TPAC')) ? 'TPAC / NSSTA Portal' : 'NSSTA Portal'}</span>
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '36px', background: '#F8FAFC', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0C2340' }}>
            Completed your learning session on the official portal?
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
            Upload course presentations, handbook PDFs, or training notes to take an AI-generated progress quiz and measure your Before vs After competency improvement!
          </p>
        </div>

        <button
          className="btn btn-emerald btn-lg"
          onClick={() => setActiveTab('progress')}
        >
          <span>Upload Material & Take Evaluation Quiz</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
