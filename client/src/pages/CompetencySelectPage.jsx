import React, { useState, useEffect } from 'react';
import { useOfficer } from '../context/OfficerContext';
import { Target, AlertCircle, CheckCircle2, ArrowRight, Star, Sparkles, Filter } from 'lucide-react';

const RATING_TIERS = [
  { score: 5, stars: '★★★★★', label: 'Very Strong', color: '#059669', bg: '#ECFDF5' },
  { score: 4, stars: '★★★★☆', label: 'Strong', color: '#2563EB', bg: '#EFF6FF' },
  { score: 3, stars: '★★★☆☆', label: 'Moderate', color: '#D97706', bg: '#FFFBEB' },
  { score: 2, stars: '★★☆☆☆', label: 'Weak', color: '#EA580C', bg: '#FFF7ED' },
  { score: 1, stars: '★☆☆☆☆', label: 'Very Weak', color: '#DC2626', bg: '#FEF2F2' }
];

// Dynamic fallback generator ensuring every officer gets distinct competencies calibrated to their profile
function getProfileSpecificCompetencies(profile = {}) {
  const userId = profile.userId || '';
  const roleText = `${profile.jobRole || ''} ${profile.designation || ''}`.toLowerCase();
  const assignText = `${profile.currentAssignment || ''}`.toLowerCase();
  const specText = `${profile.specialization || ''} ${profile.relevantDomain || ''}`.toLowerCase();

  // 1. National Accounts & Macroeconomics Compilation (Officer 1: Smt. Ananya Sharma)
  if (userId === 'usr-001' || assignText.includes('national accounts') || assignText.includes('gva') || assignText.includes('gdp') || roleText.includes('national accounts') || roleText.includes('economic') || specText.includes('national accounts') || specText.includes('macroeconomic')) {
    return [
      { id: 'national_accounts', name: 'National Accounts & GDP Compilation', category: 'STATISTICAL', requiredLevel: 'Advanced', description: 'System of National Accounts (SNA 2008), Gross Value Added (GVA), base year revisions, and supply-use tables.', calibrationReason: 'Directly required for quarterly Gross Value Added (GVA) compilation and System of National Accounts (SNA 2008) compliance.' },
      { id: 'price_statistics', name: 'Price Statistics & Index Numbers', category: 'STATISTICAL', requiredLevel: 'Advanced', description: 'Consumer Price Index (CPI-Rural/Urban/Combined), WPI, Laspeyres formula, chaining, and geometric mean.', calibrationReason: 'Mandatory for formulating constant-price deflators and linking Consumer Price Index (CPI/WPI) baskets to national aggregates.' },
      { id: 'statistical_analysis', name: 'Statistical Analysis & Inference', category: 'STATISTICAL', requiredLevel: 'Advanced', description: 'Hypothesis testing, descriptive and inferential statistics, variance estimation, and regression modeling.', calibrationReason: 'Crucial for econometric validation, causal inference, and residual diagnostics across macroeconomic sub-sectors.' },
      { id: 'data_visualization', name: 'Data Visualization & Dashboards', category: 'TECHNICAL', requiredLevel: 'Intermediate', description: 'Translating statistical findings into interactive charts, thematic maps, executive dashboards, and infographics.', calibrationReason: 'Required for presenting executive GDP bulletins, sector-wise growth trajectories, and macroeconomic dashboards.' },
      { id: 'data_quality_frameworks', name: 'Data Quality Frameworks', category: 'STATISTICAL', requiredLevel: 'Intermediate', description: 'UN Fundamental Principles of Official Statistics, National Quality Assurance Framework (NQAF).', calibrationReason: 'Ensures macroeconomic data returns conform to the MoSPI National Quality Assurance Framework (NQAF).' }
    ];
  }

  // 2. Survey Design & Sampling Methodologist (Officer 2: Shri Rahul Verma)
  if (userId === 'usr-002' || assignText.includes('household') || assignText.includes('plfs') || assignText.includes('labour') || assignText.includes('socio-economic') || roleText.includes('survey') || roleText.includes('data collection') || specText.includes('sampling') || specText.includes('survey design')) {
    return [
      { id: 'survey_design', name: 'Survey Design', category: 'STATISTICAL', requiredLevel: 'Advanced', description: 'Design of sampling frames, questionnaire schedules, stratification, and estimation procedures.', calibrationReason: 'Mandatory for formulating multi-stage sampling frames, schedule questionnaires, and stratification for socio-economic surveys.' },
      { id: 'sampling', name: 'Sampling Techniques', category: 'STATISTICAL', requiredLevel: 'Advanced', description: 'Probability sampling, two-stage stratified sampling (FSU/SSU), cluster sampling, and variance estimation.', calibrationReason: 'Essential for circular systematic sampling, FSU/SSU probability selection, multiplier generation, and survey variance estimation.' },
      { id: 'labour_statistics', name: 'Labour Statistics & PLFS', category: 'STATISTICAL', requiredLevel: 'Advanced', description: 'Periodic Labour Force Survey (PLFS) concepts, Usual Status (ps+ss), Current Weekly Status, and survey classifications.', calibrationReason: 'Required for applying official priority rules, activity statuses (ps+ss/CWS), and household socio-economic classifications.' },
      { id: 'data_quality_frameworks', name: 'Data Quality Frameworks', category: 'STATISTICAL', requiredLevel: 'Intermediate', description: 'UN Fundamental Principles of Official Statistics, National Quality Assurance Framework (NQAF).', calibrationReason: 'Required to audit field survey returns against MoSPI NQAF standards and logical consistency checks.' },
      { id: 'sql', name: 'SQL & Relational Databases', category: 'TECHNICAL', requiredLevel: 'Intermediate', description: 'Relational data querying, multi-table joins on census/survey microdata, window functions, and indexing.', calibrationReason: 'Necessary for querying raw survey microdata relational stores and preparing tabular validation extracts.' }
    ];
  }

  // 3. Big Data, AI & Analytics Systems Lead (Officer 3: Dr. Priya Nair)
  if (userId === 'usr-003' || assignText.includes('big data') || assignText.includes('ai analytics') || assignText.includes('anomaly') || specText.includes('machine learning') || specText.includes('artificial intelligence') || roleText.includes('technical') || roleText.includes('data-oriented') || roleText.includes('innovation')) {
    return [
      { id: 'ai_ml', name: 'AI & Machine Learning in Statistics', category: 'TECHNICAL', requiredLevel: 'Advanced', description: 'Supervised/unsupervised learning, outlier anomaly detection in enterprise microdata, and NLP.', calibrationReason: 'Critical for automated anomaly detection, ML-driven microdata outlier imputation, and predictive statistical modeling.' },
      { id: 'python', name: 'Python for Statistical Computing', category: 'TECHNICAL', requiredLevel: 'Advanced', description: 'Pandas, NumPy, Scipy, data cleaning, automated statistical pipeline scripting, and API integration.', calibrationReason: 'Required for high-performance vectorized data transformations and automated statistical pipelines using Pandas and NumPy.' },
      { id: 'sql', name: 'SQL & Relational Databases', category: 'TECHNICAL', requiredLevel: 'Advanced', description: 'Relational data querying, multi-table joins on census/survey microdata, window functions, and indexing.', calibrationReason: 'Essential for querying complex relational microdata repositories, multi-table joins, and database indexing.' },
      { id: 'data_visualization', name: 'Data Visualization & Dashboards', category: 'TECHNICAL', requiredLevel: 'Advanced', description: 'Translating statistical findings into interactive charts, thematic maps, executive dashboards, and infographics.', calibrationReason: 'Necessary for translating AI/ML model inferences and complex statistical metrics into interactive executive dashboards.' },
      { id: 'dpi', name: 'Digital Public Infrastructure & Gov Cloud', category: 'DIGITAL GOVERNANCE', requiredLevel: 'Intermediate', description: 'India Stack, MeghRaj cloud, Digilocker, e-Sign, and National Data Governance Framework Policy.', calibrationReason: 'Required for deploying automated statistical workloads onto Government Cloud (MeghRaj) and conforming to NDGFP.' }
    ];
  }

  // 4. Technical Systems Engineer (Officer 4: Arjun Reddy)
  if (userId === 'usr-004' || roleText.includes('systems') || assignText.includes('processing & automation') || specText.includes('cloud') || specText.includes('automation')) {
    return [
      { id: 'python', name: 'Python for Statistical Computing', category: 'TECHNICAL', requiredLevel: 'Advanced', description: 'Pandas, NumPy, Scipy, data cleaning, automated statistical pipeline scripting, and API integration.', calibrationReason: 'Vital for engineering robust automation scripts, batch processing engines, and ETL data pipelines.' },
      { id: 'sql', name: 'SQL & Relational Databases', category: 'TECHNICAL', requiredLevel: 'Advanced', description: 'Relational data querying, multi-table joins on census/survey microdata, window functions, and indexing.', calibrationReason: 'Mandatory for optimizing high-volume query execution plans, microdata warehousing, and database indexing.' },
      { id: 'apis', name: 'APIs & System Integration', category: 'TECHNICAL', requiredLevel: 'Advanced', description: 'RESTful API consumption, statistical microservices, JSON/XML serialization, and secure endpoints.', calibrationReason: 'Required for developing secure statistical microservices, Open Government Data (OGD) connectors, and REST endpoints.' },
      { id: 'dpi', name: 'Digital Public Infrastructure & Gov Cloud', category: 'DIGITAL GOVERNANCE', requiredLevel: 'Intermediate', description: 'India Stack, MeghRaj cloud, Digilocker, e-Sign, and National Data Governance Framework Policy.', calibrationReason: 'Critical for hosting automated workloads on MeghRaj cloud and adhering to National Data Governance Framework policies.' },
      { id: 'data_quality_frameworks', name: 'Data Quality Frameworks', category: 'STATISTICAL', requiredLevel: 'Intermediate', description: 'UN Fundamental Principles of Official Statistics, National Quality Assurance Framework (NQAF).', calibrationReason: 'Required for implementing automated programmatic validation gates and data pipeline sanity checks.' },
      { id: 'cybersecurity', name: 'Cybersecurity & Data Protection', category: 'DIGITAL GOVERNANCE', requiredLevel: 'Intermediate', description: 'Securing national statistical repositories, role-based access control, cryptographic hashing.', calibrationReason: 'Essential for safeguarding national statistical microdata stores and enforcing role-based access security.' }
    ];
  }

  // 5. Programme & SDG Dissemination Officer (Officer 5: Sneha Das)
  if (userId === 'usr-005' || roleText.includes('programme') || assignText.includes('sdg') || specText.includes('gis') || specText.includes('open data')) {
    return [
      { id: 'sdg_indicators', name: 'SDG Indicators & NIF', category: 'STATISTICAL', requiredLevel: 'Advanced', description: 'National Indicator Framework (NIF) for Sustainable Development Goals, baseline monitoring, and metadata tracking.', calibrationReason: 'Mandatory for tracking MoSPI\'s National Indicator Framework, baseline indicator calculation, and SDG metadata harmonization.' },
      { id: 'gis', name: 'GIS & Spatial Statistics', category: 'TECHNICAL', requiredLevel: 'Advanced', description: 'Geographical Information Systems, QGIS, spatial autocorrelation, geofencing primary sampling units (PSUs).', calibrationReason: 'Essential for spatial autocorrelation analysis, thematic district mapping, and geofencing administrative boundaries.' },
      { id: 'data_visualization', name: 'Data Visualization & Dashboards', category: 'TECHNICAL', requiredLevel: 'Advanced', description: 'Translating statistical findings into interactive charts, thematic maps, executive dashboards, and infographics.', calibrationReason: 'Crucial for designing citizen-facing Open Data dashboards and SDG progress scorecards for line ministries.' },
      { id: 'metadata_standards', name: 'Metadata Standards & DDI', category: 'STATISTICAL', requiredLevel: 'Advanced', description: 'Statistical Data and Metadata eXchange (SDMX), Data Documentation Initiative (DDI), and codebooks.', calibrationReason: 'Directly determines capability to publish open government microdata conforming to DDI, SDMX, and open data schemas.' },
      { id: 'leadership', name: 'Leadership & Decision Making', category: 'BEHAVIOURAL / MANAGERIAL', requiredLevel: 'Advanced', description: 'Strategic direction, evidence-informed policy leadership, crisis management, and inter-disciplinary teams.', calibrationReason: 'Required for steering inter-ministerial SDG working groups, high-level data dissemination, and policy coordination.' }
    ];
  }

  // Fallback general statistical competencies
  return [
    { id: 'survey_design', name: 'Survey Design', category: 'STATISTICAL', requiredLevel: 'Intermediate', description: 'Design of sampling frames, questionnaire schedules, and stratification.' },
    { id: 'sampling', name: 'Sampling Techniques', category: 'STATISTICAL', requiredLevel: 'Intermediate', description: 'Probability sampling and two-stage stratified sampling.' },
    { id: 'sql', name: 'SQL & Relational Databases', category: 'TECHNICAL', requiredLevel: 'Intermediate', description: 'Relational data querying and microdata joins.' },
    { id: 'data_visualization', name: 'Data Visualization & Dashboards', category: 'TECHNICAL', requiredLevel: 'Intermediate', description: 'Translating statistical findings into interactive charts and maps.' },
    { id: 'data_quality_frameworks', name: 'Data Quality Frameworks', category: 'STATISTICAL', requiredLevel: 'Intermediate', description: 'National Quality Assurance Framework standards.' }
  ];
}

export default function CompetencySelectPage() {
  const { competenciesData, saveSelfRatings, setActiveTab, profile } = useOfficer();
  const rawSelected = competenciesData?.selectedCompetencies || [];
  // Ensure the page is personalized to the logged-in officer's profile
  const selectedComps = rawSelected.length > 0 ? rawSelected : getProfileSpecificCompetencies(profile);
  const initialRatings = competenciesData?.selfRatings || {};

  const [ratings, setRatings] = useState({});
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialRatings && Object.keys(initialRatings).length > 0) {
      setRatings(initialRatings);
    } else {
      // Default initial 3 (Moderate) across all competencies
      const defaults = {};
      selectedComps.forEach(c => {
        defaults[c.id] = 3;
      });
      setRatings(defaults);
    }
  }, [competenciesData]);

  const handleRate = (compId, val) => {
    setRatings(prev => ({ ...prev, [compId]: val }));
  };

  const handleSaveRatings = async () => {
    setSaving(true);
    const ok = await saveSelfRatings(ratings);
    setSaving(false);
    if (ok) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      return true;
    }
    return false;
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'STATISTICAL': return <span className="badge badge-emerald">Statistical</span>;
      case 'TECHNICAL': return <span className="badge badge-saffron">Technical</span>;
      case 'DIGITAL GOVERNANCE': return <span className="badge badge-navy">Digital Governance</span>;
      case 'BEHAVIOURAL / MANAGERIAL': return <span className="badge badge-slate">Managerial</span>;
      default: return <span className="badge badge-slate">{category}</span>;
    }
  };

  const getTierForScore = (score) => {
    return RATING_TIERS.find(t => t.score === score) || RATING_TIERS[2];
  };

  return (
    <div className="app-container main-content">
      <div className="page-header">
        <div>
          <div className="badge badge-saffron" style={{ marginBottom: '8px' }}>
            Page 2 • AI Competency Filter & Self-Rating
          </div>
          <h1 className="page-title">
            <Target size={28} color="#FF9933" />
            <span>AI-Selected Competencies & Self-Rating</span>
          </h1>
          <p className="page-subtitle">
            Calibrated for your role as <strong>{profile?.jobRole || 'Statistical Officer'}</strong> in <strong>"{profile?.currentAssignment || 'Labour Statistics & PLFS'}"</strong>.
            Rate your familiarity across the <strong>{selectedComps.length} required competencies</strong> below.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={async () => {
            await handleSaveRatings();
            setActiveTab('assessment');
          }}
        >
          <span>Take AI Adaptive Test</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Critical Governance Principle Disclaimer */}
      <div className="callout callout-warning" style={{ marginBottom: '20px' }}>
        <AlertCircle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            CRITICAL GOVERNANCE PRINCIPLE: Self-Rating Sets Baseline Adaptive Difficulty
          </div>
          <div style={{ marginTop: '4px', fontSize: '0.85rem' }}>
            Your self-rating represents perceived familiarity. It calibrates the initial question difficulty of the AI adaptive assessment.
            Your verified demonstrated competency level is calculated through live test performance.
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="callout callout-success" style={{ marginBottom: '20px' }}>
          <CheckCircle2 size={18} />
          <div><strong>All ratings saved successfully!</strong> Adaptive assessment question difficulties have been calibrated.</div>
        </div>
      )}

      {/* Role Context Bar */}
      <div className="card" style={{ marginBottom: '24px', background: '#F8FAFC', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sparkles size={20} color="#E65100" />
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0C2340' }}>
                Role-Based Competency Benchmark Active
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Officer: {profile?.name || 'Officer'} • {profile?.designation || 'Statistical Officer'} • Assignment: {profile?.currentAssignment || 'National Statistics'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={15} color="#64748B" />
            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
              Showing <strong>{selectedComps.length}</strong> required competencies
            </span>
          </div>
        </div>
      </div>

      {/* Competencies List Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {selectedComps.map((comp, idx) => {
          const currentVal = ratings[comp.id] || 3;
          const activeTier = getTierForScore(currentVal);

          return (
            <div key={comp.id} className="card card-hover" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748B' }}>#{idx + 1}</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0C2340' }}>{comp.name}</h3>
                    {getCategoryBadge(comp.category)}
                    {comp.requiredLevel && (
                      <span className="badge badge-navy" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                        Required: {comp.requiredLevel}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#475569', maxWidth: '780px', lineHeight: 1.5 }}>
                    {comp.description}
                  </p>
                  {comp.calibrationReason && (
                    <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#1E293B', background: '#F8FAFC', borderLeft: '3px solid #FF9933', padding: '6px 10px', borderRadius: '4px', maxWidth: '850px' }}>
                      <strong style={{ color: '#C2410C' }}>Role Calibration:</strong> {comp.calibrationReason}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    Self-Assessed Rating
                  </div>
                  <div 
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      background: activeTier.bg, 
                      color: activeTier.color, 
                      border: `1px solid ${activeTier.color}`, 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontWeight: 800, 
                      fontSize: '0.85rem',
                      marginTop: '4px' 
                    }}
                  >
                    <span>{activeTier.stars}</span>
                    <span>{activeTier.label} ({currentVal}/5)</span>
                  </div>
                </div>
              </div>

              {/* 5-Star Selectable Ratings with exact stars & labels */}
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '10px' }}>
                  Select rating:
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  {RATING_TIERS.map(tier => {
                    const isSelected = currentVal === tier.score;
                    return (
                      <button
                        key={tier.score}
                        type="button"
                        onClick={() => handleRate(comp.id, tier.score)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: isSelected ? `2px solid ${tier.color}` : '1px solid #CBD5E1',
                          background: isSelected ? tier.bg : '#FFFFFF',
                          color: isSelected ? tier.color : '#334155',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                        }}
                      >
                        <span style={{ fontSize: '1rem', letterSpacing: '2px', color: isSelected ? tier.color : '#94A3B8' }}>
                          {tier.stars}
                        </span>
                        <span style={{ fontSize: '0.82rem', fontWeight: isSelected ? 800 : 600 }}>
                          {tier.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
        <button
          type="button"
          className="btn btn-outline btn-lg"
          onClick={handleSaveRatings}
          disabled={saving}
        >
          <span>{saving ? 'Saving...' : 'Save Self-Ratings'}</span>
        </button>

        <button
          type="button"
          className="btn btn-saffron btn-lg"
          onClick={async () => {
            await handleSaveRatings();
            setActiveTab('assessment');
          }}
        >
          <span>Start AI Adaptive Assessment</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
