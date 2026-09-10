import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useOfficer } from '../context/OfficerContext';
import { 
  BarChart3, 
  User, 
  Target, 
  BrainCircuit, 
  Award, 
  AlertTriangle, 
  Compass, 
  BookOpen, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  Bot, 
  Lock, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Layers,
  Users,
  PieChart,
  Download
} from 'lucide-react';

export default function Sidebar({ 
  mobileOpen = false, 
  onCloseMobile = () => {}, 
  isCollapsed = false, 
  onToggleCollapse = () => {},
  onOpenAIAssistant = () => {},
  onOpenArchitectureModal = () => {}
}) {
  const { user } = useAuth();
  const { activeTab, setActiveTab, profileComplete } = useOfficer();

  const isOfficer = user?.role === 'officer';
  const isAdmin = user?.role === 'admin';

  const handleNavClick = (tabKey, isLocked = false) => {
    if (isLocked) return;
    setActiveTab(tabKey);
    if (mobileOpen) {
      onCloseMobile();
    }
  };

  const handleAIClick = () => {
    onOpenAIAssistant();
    if (mobileOpen) {
      onCloseMobile();
    }
  };

  // Define the exact navigation items to preserve all names and steps
  const navSteps = [
    {
      key: 'profile',
      stepNumber: 1,
      label: 'Officer Profile',
      icon: User,
      locked: false,
      badge: !profileComplete && isOfficer ? 'Required' : null
    },
    {
      key: 'competencies',
      stepNumber: 2,
      label: 'AI Selected Competencies',
      icon: Target,
      locked: !profileComplete && isOfficer
    },
    {
      key: 'assessment',
      stepNumber: 3,
      label: 'AI Adaptive Test',
      icon: BrainCircuit,
      locked: !profileComplete && isOfficer
    },
    {
      key: 'results',
      stepNumber: 4,
      label: 'Demonstrated Levels',
      icon: Award,
      locked: !profileComplete && isOfficer
    },
    {
      key: 'gaps',
      stepNumber: 5,
      label: 'Skill Gap Analysis',
      icon: AlertTriangle,
      locked: !profileComplete && isOfficer
    },
    {
      key: 'roadmap',
      stepNumber: 6,
      label: 'Learning Roadmap',
      icon: Compass,
      locked: !profileComplete && isOfficer
    },
    {
      key: 'courses',
      stepNumber: 7,
      label: 'iGOT / NSSTA Recommendations',
      icon: BookOpen,
      locked: !profileComplete && isOfficer
    },
    {
      key: 'progress',
      stepNumber: 8,
      label: 'Learning & Progress Evaluation',
      icon: TrendingUp,
      locked: !profileComplete && isOfficer
    }
  ];

  // Define Admin-specific department management navigation items
  const adminNavItems = [
    {
      key: 'admin',
      label: 'Admin Dashboard',
      icon: ShieldCheck,
      badge: 'Overview'
    },
    {
      key: 'admin-employees',
      label: 'Employees',
      icon: Users,
      badge: null
    },
    {
      key: 'admin-competencies',
      label: 'Competency Analytics',
      icon: PieChart,
      badge: null
    },
    {
      key: 'admin-gaps',
      label: 'Skill Gaps',
      icon: AlertTriangle,
      badge: null
    },
    {
      key: 'admin-training',
      label: 'Training Analytics',
      icon: TrendingUp,
      badge: null
    },
    {
      key: 'admin-reports',
      label: 'Reports',
      icon: Download,
      badge: 'CSV'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar-container ${mobileOpen ? 'mobile-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Header / Brand */}
        <div className="sidebar-header">
          <div className="sidebar-brand-group" onClick={() => handleNavClick(isAdmin ? 'admin' : 'dashboard')} style={{ cursor: 'pointer' }}>
            <div className="sidebar-emblem">
              <span>सं</span>
            </div>
            {!isCollapsed && (
              <div className="sidebar-brand-text">
                <div className="sidebar-brand-title">सामर्थ्य सांख्यिकी</div>
                <div className="sidebar-brand-sub">MoSPI &bull; NSSTA Platform</div>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button 
            type="button"
            className="sidebar-close-btn mobile-only"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Officer / Admin mini profile card (when expanded) */}
        {!isCollapsed && (
          <div className="sidebar-officer-card">
            <div className="sidebar-officer-avatar">{user?.avatar || (isAdmin ? 'DG' : 'IN')}</div>
            <div className="sidebar-officer-info">
              <div className="sidebar-officer-name" title={user?.name}>{user?.name || (isAdmin ? 'Director General' : 'Statistical Officer')}</div>
              <div className="sidebar-officer-role" title={user?.designation}>
                {isAdmin ? 'Statistical Department Head' : user?.designation || 'MoSPI Officer'}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Content */}
        <nav className="sidebar-nav" aria-label="Main sidebar navigation">
          
          {/* IF ADMIN: Render ONLY Admin-Specific Department Management Pages */}
          {isAdmin ? (
            <>
              <div className="sidebar-section-title">
                {!isCollapsed ? 'DEPARTMENT MANAGEMENT' : '•'}
              </div>

              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key || (item.key === 'admin' && activeTab === 'admin-dashboard');
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.key)}
                    title={item.label}
                  >
                    <span className="sidebar-link-icon">
                      <Icon size={18} color={isActive ? '#FF9933' : '#94A3B8'} />
                    </span>

                    {!isCollapsed && (
                      <>
                        <span className="sidebar-link-text">{item.label}</span>

                        {item.badge && (
                          <span className={`sidebar-tag ${item.badge === 'CSV' ? 'badge-emerald' : 'badge-saffron'}`}>
                            {item.badge}
                          </span>
                        )}

                        {isActive && <span className="sidebar-active-indicator" />}
                      </>
                    )}
                  </button>
                );
              })}

              <div className="sidebar-section-title" style={{ marginTop: '16px' }}>
                {!isCollapsed ? 'INSTITUTIONAL GOVERNANCE' : '•'}
              </div>

              <button
                type="button"
                className="sidebar-link arch-sidebar-btn"
                onClick={() => {
                  onOpenArchitectureModal();
                  if (mobileOpen) onCloseMobile();
                }}
                title="iGOT & NSSTA Integration Architecture"
              >
                <span className="sidebar-link-icon">
                  <Layers size={17} color="#94A3B8" />
                </span>
                {!isCollapsed && (
                  <span className="sidebar-link-text" style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                    System Architecture
                  </span>
                )}
              </button>
            </>
          ) : (
            /* IF OFFICER: Render Officer Workflow Unchanged */
            <>
              {/* Main Dashboard Section */}
              <div className="sidebar-section-title">
                {!isCollapsed ? 'PORTAL OVERVIEW' : '•'}
              </div>

              <button
                type="button"
                className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleNavClick('dashboard')}
                title="Officer Dashboard"
              >
                <span className="sidebar-link-icon">
                  <BarChart3 size={18} />
                </span>
                {!isCollapsed && <span className="sidebar-link-text">Officer Dashboard</span>}
                {!isCollapsed && activeTab === 'dashboard' && <span className="sidebar-active-indicator" />}
              </button>

              {/* Competency Journey Section */}
              <div className="sidebar-section-title" style={{ marginTop: '14px' }}>
                {!isCollapsed ? 'COMPETENCY LIFECYCLE' : '•'}
              </div>

              {navSteps.map((step) => {
                const Icon = step.icon;
                const isActive = activeTab === step.key;
                return (
                  <button
                    key={step.key}
                    type="button"
                    className={`sidebar-link ${isActive ? 'active' : ''} ${step.locked ? 'locked' : ''}`}
                    onClick={() => handleNavClick(step.key, step.locked)}
                    title={step.locked ? 'Complete Officer Profile to unlock' : step.label}
                    disabled={step.locked}
                  >
                    <span className={`sidebar-step-badge ${isActive ? 'active-badge' : ''}`}>
                      {step.stepNumber}
                    </span>

                    {!isCollapsed && (
                      <>
                        <span className="sidebar-link-text">{step.label}</span>

                        {step.badge && (
                          <span className="sidebar-tag badge-amber">
                            {step.badge}
                          </span>
                        )}

                        {step.locked && (
                          <span className="sidebar-lock-icon" title="Locked until profile complete">
                            <Lock size={13} />
                          </span>
                        )}

                        {isActive && <span className="sidebar-active-indicator" />}
                      </>
                    )}
                  </button>
                );
              })}

              {/* AI & Administration Section */}
              <div className="sidebar-section-title" style={{ marginTop: '14px' }}>
                {!isCollapsed ? 'AI & GOVERNANCE' : '•'}
              </div>

              {/* AI Assistant Chatbox Action Button in Sidebar */}
              <button
                type="button"
                className="sidebar-link ai-assistant-link"
                onClick={handleAIClick}
                title="Open AI Assistant Counselor"
              >
                <span className="sidebar-link-icon ai-glow-icon">
                  <Bot size={18} color="#FF9933" />
                </span>
                {!isCollapsed && (
                  <>
                    <span className="sidebar-link-text" style={{ fontWeight: 600, color: '#F8FAFC' }}>
                      AI Assistant
                    </span>
                    <span className="sidebar-tag badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Sparkles size={10} />
                      <span>Counselor</span>
                    </span>
                  </>
                )}
              </button>

              {/* Architecture Modal trigger inside sidebar for convenient access */}
              <button
                type="button"
                className="sidebar-link arch-sidebar-btn"
                onClick={() => {
                  onOpenArchitectureModal();
                  if (mobileOpen) onCloseMobile();
                }}
                title="iGOT & NSSTA Integration Architecture"
                style={{ marginTop: '4px' }}
              >
                <span className="sidebar-link-icon">
                  <Layers size={17} color="#94A3B8" />
                </span>
                {!isCollapsed && (
                  <span className="sidebar-link-text" style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                    System Architecture
                  </span>
                )}
              </button>
            </>
          )}
        </nav>

        {/* Sidebar Footer with Collapse Toggle */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-info">
            <div className="sidebar-footer-text">
              {!isCollapsed ? (
                <>
                  <span className="official-pill">MoSPI • NSSTA</span>
                  <p>Official Statistics Capacity Framework</p>
                </>
              ) : (
                <span className="official-pill">•</span>
              )}
            </div>
          </div>

          {/* Desktop collapse/expand toggle */}
          <button
            type="button"
            className="sidebar-collapse-toggle desktop-only"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>
    </>
  );
}
