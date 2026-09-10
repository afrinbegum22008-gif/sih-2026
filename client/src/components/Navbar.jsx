import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOfficer } from '../context/OfficerContext';
import { 
  Menu,
  Layers,
  ChevronDown,
  LogOut,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const TAB_TITLES = {
  dashboard: 'Officer Dashboard',
  profile: 'Step 1 • Officer Profile',
  competencies: 'Step 2 • AI Selected Competencies',
  assessment: 'Step 3 • AI Adaptive Test',
  results: 'Step 4 • Demonstrated Levels',
  gaps: 'Step 5 • Skill Gap Analysis',
  roadmap: 'Step 6 • Learning Roadmap',
  courses: 'Step 7 • iGOT / NSSTA Recommendations',
  progress: 'Step 8 • Learning & Progress Evaluation',
  admin: 'Admin Dashboard • Department Overview',
  'admin-dashboard': 'Admin Dashboard • Department Overview',
  'admin-employees': 'Admin Dashboard • Employee Directory',
  'admin-competencies': 'Admin Dashboard • Competency Analytics',
  'admin-gaps': 'Admin Dashboard • Skill Gaps',
  'admin-training': 'Admin Dashboard • Training Analytics',
  'admin-reports': 'Admin Dashboard • Institutional Reports'
};

export default function Navbar({ onOpenArchitectureModal, onToggleMobileSidebar }) {
  const { user, availableUsers, switchDemoUser, logout } = useAuth();
  const { activeTab, setActiveTab } = useOfficer();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <>
      <div className="top-tricolor-bar" />
      <header className="main-navbar">
        <div className="navbar-inner">
          <div className="brand-section">
            {/* Mobile Hamburger Drawer Toggle */}
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={onToggleMobileSidebar}
              aria-label="Toggle navigation sidebar"
              title="Open Navigation Menu"
            >
              <Menu size={22} color="#FFFFFF" />
            </button>

            <div className="emblem-icon">
              <span>सं</span>
            </div>
            
            <div className="brand-titles">
              <h1>सामर्थ्य सांख्यिकी • Samarthya Sankhyiki</h1>
              <p>National Statistical System Competency Platform | MoSPI &amp; NSSTA</p>
            </div>

            {/* Active Page / Section Breadcrumb */}
            <div className="header-section-indicator">
              <span className="indicator-dot" />
              <span className="indicator-label">{TAB_TITLES[activeTab] || 'Officer Dashboard'}</span>
            </div>
          </div>

          <div className="user-ctrl-section">
            {/* System Integration Indicator */}
            <button 
              className="btn btn-sm btn-outline arch-header-btn" 
              style={{ color: '#E2E8F0', borderColor: 'rgba(255,255,255,0.2)', padding: '5px 12px', fontSize: '0.75rem' }}
              onClick={onOpenArchitectureModal}
              title="View Integration Architecture & API Status"
            >
              <Layers size={14} color="#FF9933" />
              <span>iGOT &amp; NSSTA Ready</span>
            </button>

            {/* Quick Demo Persona Switcher */}
            <div style={{ position: 'relative' }}>
              <button 
                className="user-badge" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ cursor: 'pointer', border: 'none' }}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="user-avatar">{user?.avatar || 'IN'}</div>
                <div className="user-details-mini" style={{ textAlign: 'left' }}>
                  <div className="user-name">{user?.name || 'Officer'}</div>
                  <div className="user-role">{user?.role === 'admin' ? 'Administrator' : user?.designation || 'Statistical Officer'}</div>
                </div>
                <ChevronDown size={14} color="#94A3B8" />
              </button>

              {dropdownOpen && (
                <div 
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '115%',
                    background: '#FFFFFF',
                    borderRadius: '10px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3), 0 0 1px 1px rgba(0,0,0,0.05)',
                    border: '1px solid #E2E8F0',
                    width: '310px',
                    zIndex: 2001,
                    padding: '8px 0'
                  }}
                >
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid #F1F5F9', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Switch Demo Persona (SIH Profiles)
                  </div>
                  {availableUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchDemoUser(u.id);
                        setActiveTab(u.role === 'admin' ? 'admin' : 'dashboard');
                        setDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 16px',
                        background: u.id === user?.id ? '#F8FAFC' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        borderLeft: u.id === user?.id ? '3px solid #E65100' : '3px solid transparent',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: u.role === 'admin' ? '#0C2340' : '#E65100',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                        {u.avatar}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.designation}</div>
                      </div>
                    </button>
                  ))}

                  <div style={{ borderTop: '1px solid #F1F5F9', margin: '6px 0 2px 0', paddingTop: '4px' }}>
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 16px',
                        background: 'transparent',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 600
                      }}
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
