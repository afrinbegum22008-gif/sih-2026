import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  Building2,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Mail,
  ChevronRight,
  Info
} from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const { login, availableUsers } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showDemoAccountsModal, setShowDemoAccountsModal] = useState(false);

  // Validate form inputs before submission
  const validate = () => {
    const errors = {};
    if (!identifier.trim()) {
      errors.identifier = 'Official Email or Employee ID is required.';
    } else if (identifier.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim())) {
      errors.identifier = 'Please enter a valid email address format.';
    }

    if (!password) {
      errors.password = 'Password / SSO PIN is required.';
    } else if (password.length < 4) {
      errors.password = 'Password must be at least 4 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const res = await login({
        identifier: identifier.trim(),
        password: password.trim()
      });

      if (res.success && res.user) {
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        }
      } else {
        setError(res.message || 'Invalid credentials. Please verify your email/ID and password.');
      }
    } catch (err) {
      setError('An unexpected error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to pre-fill an official demo email and authorized demo credentials
  const handleSelectDemoAccount = (userObj) => {
    if (!userObj) return;
    const email = typeof userObj === 'string' ? userObj : userObj.email;
    const role = typeof userObj === 'object' ? userObj.role : 'officer';
    const pwd = role === 'admin' ? 'Admin@123' : 'MoSPI@123';

    setIdentifier(email || '');
    setPassword(pwd);
    setFieldErrors({});
    setError('');
    setShowDemoAccountsModal(false);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 50%, #F1F5F9 100%)'
    }}>
      <div style={{
        maxWidth: '1120px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '48px',
        alignItems: 'center'
      }}>

        {/* ============================================================
            LEFT COLUMN: iGOT Karmayogi & MoSPI Official Mandate
           ============================================================ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Government & Mission Header Badge */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <div className="badge badge-navy" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', fontSize: '0.78rem', borderRadius: '6px' }}>
              <Building2 size={13} color="#FF9933" />
              <span>Government of India • MoSPI</span>
            </div>
            <div className="badge badge-saffron" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', fontSize: '0.78rem', borderRadius: '6px' }}>
              <Sparkles size={13} color="#C2410C" />
              <span>SIH Problem Statement 26101</span>
            </div>
          </div>

          {/* iGOT Karmayogi Branding Banner */}
          <div style={{
            background: 'linear-gradient(90deg, #071528 0%, #143258 100%)',
            padding: '16px 20px',
            borderRadius: '12px',
            borderLeft: '5px solid #FF9933',
            color: '#FFFFFF',
            boxShadow: '0 8px 24px -6px rgba(7, 21, 40, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255, 153, 51, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1rem',
                  color: '#FF9933',
                  border: '1px solid rgba(255, 153, 51, 0.3)'
                }}>
                  सं
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.02em', color: '#FFFFFF' }}>
                    iGOT Karmayogi Bharat
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                    National Programme for Civil Services Capacity Building (NPCSCB)
                  </div>
                </div>
              </div>
              <span style={{
                fontSize: '0.7rem',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34D399',
                padding: '3px 8px',
                borderRadius: '4px',
                fontWeight: 600,
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                PORTAL INTEGRATED
              </span>
            </div>
          </div>

          {/* Website / Platform Title */}
          <div>
            <h1 style={{
              fontSize: '2.35rem',
              fontWeight: 800,
              color: '#071528',
              lineHeight: 1.18,
              letterSpacing: '-0.025em'
            }}>
              AI Skill Intelligence &amp; Learning Platform
            </h1>

            <p style={{
              marginTop: '14px',
              fontSize: '1.05rem',
              color: '#334155',
              lineHeight: 1.6,
              fontWeight: 500
            }}>
              AI-powered competency assessment and personalized learning for Official Statistics.
            </p>
          </div>

          {/* Value Propositions / Key Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                marginTop: '3px',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <CheckCircle2 size={16} color="#059669" />
              </div>
              <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
                <strong style={{ color: '#0F172A' }}>Cadre-Specific Competency Modeling:</strong> Dynamic mapping for ISS / SSS cadres, NSSO, DQAD, and National Accounts assignments.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                marginTop: '3px',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <CheckCircle2 size={16} color="#059669" />
              </div>
              <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
                <strong style={{ color: '#0F172A' }}>Adaptive Competency Assessment:</strong> Dynamic difficulty branching calibrated to measure demonstrated vs self-perceived skill levels.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                marginTop: '3px',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <CheckCircle2 size={16} color="#059669" />
              </div>
              <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
                <strong style={{ color: '#0F172A' }}>Official Learning Roadmaps:</strong> Curated deep-links to verified courses on iGOT Karmayogi Bharat and NSSTA Greater Noida.
              </div>
            </div>
          </div>

          {/* Left Footer: Standards & Compliance Note */}
          <div style={{
            marginTop: '10px',
            paddingTop: '16px',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.78rem',
            color: '#64748B'
          }}>
            <ShieldCheck size={18} color="#0C2340" />
            <span>
              National Statistical Systems Training Academy (NSSTA) • Role-Based Access Control (RBAC) Architecture
            </span>
          </div>
        </div>

        {/* ============================================================
            RIGHT COLUMN: Centered Government Sign-In Card
           ============================================================ */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '460px',
            padding: '40px 36px',
            boxShadow: '0 20px 45px -12px rgba(12, 35, 64, 0.14), 0 2px 6px -1px rgba(12, 35, 64, 0.05)',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            background: '#FFFFFF'
          }}>

            {/* Header / Security Emblem */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #071528 0%, #0C2340 100%)',
                color: '#FF9933',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                boxShadow: '0 6px 16px -4px rgba(12, 35, 64, 0.3)'
              }}>
                <ShieldCheck size={28} />
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#071528', letterSpacing: '-0.015em' }}>
                Government Portal Sign-In
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#64748B', marginTop: '6px' }}>
                Ministry of Statistics and Programme Implementation
              </p>
            </div>

            {/* Error Message Callout */}
            {error && (
              <div
                role="alert"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px 14px',
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  color: '#B91C1C',
                  fontSize: '0.84rem',
                  lineHeight: 1.4
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
                <div>
                  <strong>Authentication Failed:</strong> {error}
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} noValidate>

              {/* Email / Identifier Field */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label
                  htmlFor="login-email"
                  className="form-label"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>Official Email or Employee ID</span>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 500 }}>e.g. @mospi.gov.in</span>
                </label>

                <div style={{ position: 'relative' }}>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (fieldErrors.identifier) {
                        setFieldErrors(prev => ({ ...prev, identifier: '' }));
                      }
                      if (error) setError('');
                    }}
                    placeholder="e.g. ananya.sharma@mospi.gov.in"
                    className="form-input"
                    disabled={loading}
                    style={{
                      paddingLeft: '38px',
                      borderColor: fieldErrors.identifier ? '#EF4444' : undefined,
                      fontSize: '0.9rem',
                      background: loading ? '#F8FAFC' : '#FFFFFF'
                    }}
                    aria-invalid={!!fieldErrors.identifier}
                    aria-describedby={fieldErrors.identifier ? 'identifier-error' : undefined}
                  />
                  <Mail
                    size={16}
                    color={fieldErrors.identifier ? '#EF4444' : '#94A3B8'}
                    style={{ position: 'absolute', left: '12px', top: '13px' }}
                  />
                </div>
                {fieldErrors.identifier && (
                  <div id="identifier-error" style={{ color: '#DC2626', fontSize: '0.76rem', marginTop: '5px', fontWeight: 500 }}>
                    {fieldErrors.identifier}
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label
                  htmlFor="login-password"
                  className="form-label"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>Password / SSO Security PIN</span>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 500 }}>Masked</span>
                </label>

                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors(prev => ({ ...prev, password: '' }));
                      }
                      if (error) setError('');
                    }}
                    placeholder="Enter your confidential password"
                    className="form-input"
                    disabled={loading}
                    style={{
                      paddingLeft: '38px',
                      paddingRight: '42px',
                      borderColor: fieldErrors.password ? '#EF4444' : undefined,
                      fontSize: '0.9rem',
                      background: loading ? '#F8FAFC' : '#FFFFFF'
                    }}
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  />
                  <Lock
                    size={16}
                    color={fieldErrors.password ? '#EF4444' : '#94A3B8'}
                    style={{ position: 'absolute', left: '12px', top: '13px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '10px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94A3B8',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <div id="password-error" style={{ color: '#DC2626', fontSize: '0.76rem', marginTop: '5px', fontWeight: 500 }}>
                    {fieldErrors.password}
                  </div>
                )}
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="btn btn-saffron"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '13px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(230, 81, 0, 0.28)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.8 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Platform</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Prototype Demo Accounts Helper Accordion / Modal Trigger */}
            <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setShowDemoAccountsModal(!showDemoAccountsModal)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#0C2340',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}
              >
                <Info size={13} color="#FF9933" />
                <span>Prototype Demo Accounts (1 Admin • 5 Employees)</span>
              </button>

              {showDemoAccountsModal && (
                <div style={{
                  marginTop: '12px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '12px',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Click an account to fill email (passwords are confidential):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                    {availableUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSelectDemoAccount(u.email)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '0.76rem'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: '#0F172A' }}>{u.name}</div>
                          <div style={{ color: '#64748B', fontSize: '0.7rem' }}>
                            {u.designation} • {u.email} • <span style={{ fontWeight: 700, color: u.role === 'admin' ? '#0C2340' : '#E65100' }}>{u.role === 'admin' ? 'Admin' : 'Employee'}</span>
                          </div>
                        </div>
                        <ChevronRight size={14} color="#94A3B8" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Legal & IT Act Security Notice */}
            <div style={{
              marginTop: '16px',
              fontSize: '0.72rem',
              color: '#94A3B8',
              textAlign: 'center',
              lineHeight: 1.4
            }}>
              Protected under the Collection of Statistics Act, 2008 &amp; Information Technology Act. SSO Integration Ready for Jan Parichay.
            </div>

          </div>
        </div>

      </div>

      {/* Global CSS keyframes for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: '1.2fr 1fr'"],
          div[style*="grid-template-columns: 1.2fr 1fr"] {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </div>
  );
}
