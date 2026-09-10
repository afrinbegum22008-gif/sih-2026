import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OfficerProvider, useOfficer } from './context/OfficerContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import SystemArchitectureModal from './components/SystemArchitectureModal';
import AIAssistantChatbox from './components/AIAssistantChatbox';

// Pages
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import CompetencySelectPage from './pages/CompetencySelectPage';
import AdaptiveAssessmentPage from './pages/AdaptiveAssessmentPage';
import ActualCompetencyPage from './pages/ActualCompetencyPage';
import SkillGapPage from './pages/SkillGapPage';
import RoadmapPage from './pages/RoadmapPage';
import CourseRecommendationsPage from './pages/CourseRecommendationsPage';
import LearningProgressPage from './pages/LearningProgressPage';
import OfficerDashboardPage from './pages/OfficerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

class TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('[TabErrorBoundary] Caught render error:', error, errorInfo);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.activeTab !== this.props.activeTab && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="app-container main-content" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '36px', borderLeft: '5px solid #EF4444' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991B1B', marginBottom: '8px' }}>
              Module Temporarily Unavailable
            </h2>
            <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '20px' }}>
              An unexpected display issue occurred in this section. Your progress and profile are safely stored.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Retry View
              </button>
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => this.props.onResetTab && this.props.onResetTab()}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const { user } = useAuth();
  const { activeTab, setActiveTab, aiConfigured } = useOfficer();
  const [showArchModal, setShowArchModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  // If user is not logged in, render the Login Page
  if (!user) {
    return (
      <LoginPage 
        onLoginSuccess={(loggedInUser) => {
          if (loggedInUser?.role === 'admin') {
            setActiveTab('admin');
          } else {
            setActiveTab('dashboard');
          }
        }} 
      />
    );
  }

  // Guard role routing on mount / switch
  React.useEffect(() => {
    if (user?.role === 'admin' && !activeTab.startsWith('admin')) {
      setActiveTab('admin');
    } else if (user?.role === 'officer' && activeTab.startsWith('admin')) {
      setActiveTab('dashboard');
    }
  }, [user?.role, activeTab, setActiveTab]);

  return (
    <div className="app-root">
      {/* Top Header Bar */}
      <Navbar 
        onOpenArchitectureModal={() => setShowArchModal(true)}
        onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)}
      />

      {/* Main Layout: Left Sidebar + Right Content Viewport */}
      <div className="app-layout-body">
        <Sidebar 
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
          onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
          onOpenArchitectureModal={() => setShowArchModal(true)}
        />

        <div className={`app-main-viewport ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          {!aiConfigured && user?.role === 'officer' && (
            <div className="ai-unconfigured-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                <span>
                  <strong>AI Status Notice:</strong> <code>OPENAI_API_KEY is not configured</code>. To enable real-time AI competency selection, adaptive assessment question generation, and personalized roadmap synthesis, set <code>OPENAI_API_KEY</code> in the backend <code>.env</code> file.
                </span>
              </div>
              <span style={{
                background: '#FEE2E2',
                color: '#DC2626',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                whiteSpace: 'nowrap'
              }}>
                AI UNCONFIGURED
              </span>
            </div>
          )}

          <main className="app-main-content">
            <TabErrorBoundary activeTab={activeTab} onResetTab={() => setActiveTab(user?.role === 'admin' ? 'admin' : 'dashboard')}>
              {/* ADMIN ROLE EXPERIENCE: Institutional Oversight (Never shows officer workflow) */}
              {user?.role === 'admin' && (
                <AdminDashboardPage 
                  activeSection={activeTab} 
                  onNavigateSection={(sec) => setActiveTab(sec)} 
                />
              )}

              {/* OFFICER ROLE EXPERIENCE: Personalized 8-step Competency Lifecycle */}
              {user?.role === 'officer' && (
                <>
                  {activeTab === 'dashboard' && (
                    <OfficerDashboardPage 
                      isChatOpen={isAIAssistantOpen}
                      onToggleChat={() => setIsAIAssistantOpen(prev => !prev)}
                      onCloseChat={() => setIsAIAssistantOpen(false)}
                    />
                  )}
                  {activeTab === 'profile' && <ProfilePage />}
                  {activeTab === 'competencies' && <CompetencySelectPage />}
                  {activeTab === 'assessment' && <AdaptiveAssessmentPage />}
                  {activeTab === 'results' && <ActualCompetencyPage />}
                  {activeTab === 'gaps' && <SkillGapPage />}
                  {activeTab === 'roadmap' && <RoadmapPage />}
                  {activeTab === 'courses' && <CourseRecommendationsPage />}
                  {activeTab === 'progress' && <LearningProgressPage />}
                </>
              )}
            </TabErrorBoundary>
          </main>

          <Footer />
        </div>
      </div>

      {/* Global AI Assistant Chatbox for Officers on non-dashboard pages */}
      {user?.role === 'officer' && activeTab !== 'dashboard' && (
        <AIAssistantChatbox 
          isOpen={isAIAssistantOpen} 
          onClose={() => setIsAIAssistantOpen(false)} 
        />
      )}

      <SystemArchitectureModal
        isOpen={showArchModal}
        onClose={() => setShowArchModal(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <OfficerProvider>
        <MainApp />
      </OfficerProvider>
    </AuthProvider>
  );
}
