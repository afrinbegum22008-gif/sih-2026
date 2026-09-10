import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOfficer } from '../context/OfficerContext';
import { UserCheck, Building2, Briefcase, GraduationCap, Clock, Award, Compass, ArrowRight, Save, Check, AlertCircle, Sparkles } from 'lucide-react';

const COMMON_ASSIGNMENTS = [
  'Labour Statistics & Periodic Labour Force Survey (PLFS)',
  'Price Statistics & Consumer Price Index (CPI) Modernization',
  'Annual Survey of Industries (ASI) & Index of Industrial Production (IIP)',
  'National Accounts & Gross Value Added (GVA) Compilation',
  'Big Data & AI Analytics Cell for Anomaly Detection',
  'SDG Localization & National Indicator Framework (NIF)',
  'Agricultural Statistics & General Crop Estimation Surveys (GCES)',
  'GIS Spatial Sampling & Geofencing of Primary Sampling Units',
  'Field Operations & Computer-Assisted Personal Interviewing (CAPI)'
];

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, updateProfile, setActiveTab, profileComplete } = useOfficer();

  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    designation: '',
    department: '',
    jobRole: 'Statistical Officer',
    currentAssignment: '',
    educationalQualification: '',
    workExperience: '',
    previousTrainings: '',
    relevantDomain: ''
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Automatically pre-fill profile data from the logged-in officer whenever available
  useEffect(() => {
    const p = profile || {};
    setFormData({
      name: p.name || user?.name || '',
      employeeId: p.employeeId || user?.employeeId || '',
      designation: p.designation || user?.designation || '',
      department: p.department || user?.department || '',
      jobRole: p.jobRole || 'Statistical Officer',
      currentAssignment: p.currentAssignment || '',
      educationalQualification: p.educationalQualification || '',
      workExperience: p.workExperience || '',
      previousTrainings: p.previousTrainings || '',
      relevantDomain: p.relevantDomain || ''
    });
  }, [profile, user]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationError) setValidationError('');
  };

  const validateForm = () => {
    if (!formData.name?.trim()) {
      setValidationError('Full Name of Officer is mandatory.');
      return false;
    }
    if (!formData.employeeId?.trim()) {
      setValidationError('Government Employee ID is mandatory.');
      return false;
    }
    if (!formData.designation?.trim()) {
      setValidationError('Official Designation is mandatory.');
      return false;
    }
    if (!formData.department?.trim()) {
      setValidationError('Department / Division is mandatory.');
      return false;
    }
    if (!formData.currentAssignment || !formData.currentAssignment.trim()) {
      setValidationError('Current Assignment cannot be empty. Please select or type your active statistical assignment.');
      return false;
    }
    if (!formData.educationalQualification?.trim()) {
      setValidationError('Educational Qualification is required to calibrate competencies.');
      return false;
    }
    if (!formData.workExperience?.trim()) {
      setValidationError('Work Experience is required to calibrate seniority level.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return false;

    setSaving(true);
    const ok = await updateProfile(formData);
    setSaving(false);
    if (ok) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      return true;
    }
    return false;
  };

  const applyPreset = (presetRole, presetAssignment, presetDept, presetDesig, presetSpec = '') => {
    setFormData(prev => ({
      ...prev,
      jobRole: presetRole,
      currentAssignment: presetAssignment,
      department: presetDept,
      designation: presetDesig,
      relevantDomain: presetSpec || prev.relevantDomain,
      specialization: presetSpec || prev.specialization
    }));
    setValidationError('');
  };

  return (
    <div className="app-container main-content">
      <div className="page-header">
        <div>
          <div className="badge badge-navy" style={{ marginBottom: '8px' }}>
            Page 1 • Official Government Officer Profile
          </div>
          <h1 className="page-title">
            <UserCheck size={28} color="#FF9933" />
            <span>Officer Details & Assignment Mandate</span>
          </h1>
          <p className="page-subtitle">
            Configure your designation, department, job role, and active assignment.
            Our AI engine dynamically personalizes competency benchmarks based on:
            <strong> ROLE + CURRENT ASSIGNMENT + REQUIRED COMPETENCIES</strong> (Calibrated for MoSPI, NSSTA, and State DES).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button"
            className="btn btn-primary"
            onClick={async (e) => {
              const ok = await handleSave(e);
              if (ok) {
                setActiveTab('competencies');
              }
            }}
          >
            <span>Proceed to AI Competencies</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {!profileComplete && (
        <div className="callout callout-warning" style={{ marginBottom: '24px' }}>
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Mandatory Profile Completion Required:</strong> Please verify and complete all mandatory fields (including Current Assignment, Qualifications, and Work Experience) below. Subsequent modules (Adaptive Assessment, Gap Analysis, Roadmap, Courses) will unlock once saved.
          </div>
        </div>
      )}

      {validationError && (
        <div className="callout callout-warning" style={{ marginBottom: '24px', borderColor: '#EF4444', background: '#FEF2F2', color: '#991B1B' }}>
          <AlertCircle size={18} color="#DC2626" />
          <div>{validationError}</div>
        </div>
      )}

      {savedSuccess && (
        <div className="callout callout-success" style={{ marginBottom: '24px' }}>
          <Check size={18} />
          <div>
            <strong>Officer Profile Updated Successfully!</strong> Saved to official database and local storage. Competencies have been recalibrated for your role and assignment.
          </div>
        </div>
      )}

      {/* Persona Quick Pre-Sets */}
      <div className="card" style={{ marginBottom: '24px', background: '#FFF7ED', borderColor: '#FED7AA' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#9A3412', textTransform: 'uppercase', marginBottom: '8px' }}>
          🎯 Quick-Load Assignment Archetypes (See Dynamic AI Personalization)
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            style={{ background: '#fff', borderColor: '#EA580C', color: '#9A3412' }}
            onClick={() => applyPreset(
              'Economic & National Accounts Analyst', 
              'National Accounts & Gross Value Added (GVA) Compilation',
              'National Accounts Division (NAD), New Delhi',
              'Senior Statistical Officer',
              'Macroeconomic Accounts, GVA/GDP Methodology, Index Deflators'
            )}
          >
            Officer 1: Senior Statistical Officer (National Accounts & GVA)
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline"
            style={{ background: '#fff', borderColor: '#2563EB', color: '#1E40AF' }}
            onClick={() => applyPreset(
              'Survey & Data Collection Officer', 
              'Household Socio-Economic Survey & Periodic Labour Force Survey (PLFS)',
              'Survey Design and Research Division (SDRD), Kolkata',
              'Statistical Officer',
              'Survey Design, Multi-Stage Sampling, Field Methodology'
            )}
          >
            Officer 2: Statistical Officer (Survey Design & PLFS)
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline"
            style={{ background: '#fff', borderColor: '#059669', color: '#065F46' }}
            onClick={() => applyPreset(
              'Technical / Data-Oriented Officer', 
              'Big Data & AI Analytics Cell for Anomaly Detection & Modernization',
              'Data Quality Assurance Division (DQAD) / Big Data Analytics Cell, New Delhi',
              'Deputy Director',
              'Artificial Intelligence, Python Automation, Relational Microdata'
            )}
          >
            Officer 3: Deputy Director (Big Data Analytics & AI Systems)
          </button>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="grid-2">
          {/* Section 1: Identification & Designation */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Building2 size={18} color="#0C2340" />
                <span>Organizational Details</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name of Officer</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Government Employee ID / ISS Service Code</label>
              <input
                type="text"
                className="form-input"
                value={formData.employeeId}
                onChange={e => handleChange('employeeId', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Designation</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Junior Statistical Officer, Senior Statistical Officer, Director"
                value={formData.designation}
                onChange={e => handleChange('designation', e.target.value)}
                required
              />
              <div className="form-hint">Flexible designation mapping — accommodates ISS, SSS, and State DES hierarchies.</div>
            </div>

            <div className="form-group">
              <label className="form-label">Department / Wing / Division</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. SDRD, FOD, NAD, ESD, DQAD, or State Economics & Statistics"
                value={formData.department}
                onChange={e => handleChange('department', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Section 2: Job Role & Current Assignment */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Briefcase size={18} color="#FF9933" />
                <span>Role & Active Assignment (Core Personalization Keys)</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Primary Job Role</label>
              <select
                className="form-select"
                value={formData.jobRole}
                onChange={e => handleChange('jobRole', e.target.value)}
                required
              >
                <option value="Statistical Officer">Statistical Officer (Core Field & Survey Methodology)</option>
                <option value="Technical / Data-Oriented Officer">Technical / Data-Oriented Officer (Data Science, AI & Systems)</option>
                <option value="Leadership / Management-Oriented Officer">Leadership / Management-Oriented Officer (Administration & Direction)</option>
                <option value="Economic & National Accounts Analyst">Economic & National Accounts Analyst</option>
                <option value="Survey Field Operations Supervisor">Survey Field Operations Supervisor</option>
              </select>
              <div className="form-hint">Governs the foundational competency baseline required for your position.</div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Current Assignment / Specific Programme Mandate <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <span className="badge badge-saffron" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                  Mandatory • Selectable & Editable
                </span>
              </div>

              {/* Quick Selectable Assignment Dropdown */}
              <div style={{ marginBottom: '8px' }}>
                <select
                  className="form-select"
                  style={{ fontSize: '0.82rem', background: '#F8FAFC' }}
                  value={COMMON_ASSIGNMENTS.includes(formData.currentAssignment) ? formData.currentAssignment : ''}
                  onChange={e => {
                    if (e.target.value) {
                      handleChange('currentAssignment', e.target.value);
                    }
                  }}
                >
                  <option value="">-- Quick Select Common MoSPI / State DES Assignment --</option>
                  {COMMON_ASSIGNMENTS.map((a, i) => (
                    <option key={i} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Editable Text Input with Datalist */}
              <input
                type="text"
                list="assignment-presets-list"
                className="form-input"
                placeholder="Select from above or type custom assignment here (must not be empty)..."
                value={formData.currentAssignment}
                onChange={e => handleChange('currentAssignment', e.target.value)}
                required
              />
              <datalist id="assignment-presets-list">
                {COMMON_ASSIGNMENTS.map((a, i) => (
                  <option key={i} value={a} />
                ))}
              </datalist>

              <div className="form-hint">
                Specific survey round, division cell, or policy unit assigned to you. Select a preset or customize directly.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Relevant Domain / Specialization</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Social & Labour Statistics, Household Surveys, Econometrics"
                value={formData.relevantDomain}
                onChange={e => handleChange('relevantDomain', e.target.value)}
              />
            </div>
          </div>

          {/* Section 3: Qualifications & Experience */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <GraduationCap size={18} color="#059669" />
                <span>Academic Qualifications</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Educational Qualification</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. M.Sc. Statistics, M.A. Economics, B.Tech Computer Science"
                value={formData.educationalQualification}
                onChange={e => handleChange('educationalQualification', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Official Work Experience</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 4.5 Years"
                value={formData.workExperience}
                onChange={e => handleChange('workExperience', e.target.value)}
              />
            </div>
          </div>

          {/* Section 4: Previous Training History */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Award size={18} color="#2563EB" />
                <span>Prior Training & Capacity Building</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Previous Trainings Completed (NSSTA / iGOT / External)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. NSSTA Foundation Course (2022); Basic R for Official Statistics; Mission Karmayogi Ethics Module"
                value={formData.previousTrainings}
                onChange={e => handleChange('previousTrainings', e.target.value)}
              />
              <div className="form-hint">Used by AI to de-duplicate recommendations and calibrate learning roadmap starting points.</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
          <button
            type="submit"
            className="btn btn-saffron btn-lg"
            disabled={saving}
          >
            <Save size={18} />
            <span>{saving ? 'Calibrating Competencies...' : 'Save Profile & Recalibrate Competencies'}</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={async (e) => {
              const ok = await handleSave(e);
              if (ok) {
                setActiveTab('competencies');
              }
            }}
          >
            <span>Proceed to AI Competencies</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
