import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const OfficerContext = createContext(null);

export function isProfileComplete(p) {
  if (!p) return false;
  const reqFields = [
    'name',
    'designation',
    'department',
    'jobRole',
    'currentAssignment',
    'educationalQualification',
    'workExperience'
  ];
  return reqFields.every(f => typeof p[f] === 'string' && p[f].trim().length > 0);
}

export function OfficerProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id || 'usr-001';

  const [activeTab, setActiveTabState] = useState(() => {
    try {
      const saved = localStorage.getItem('mospi_active_tab');
      if (saved) return saved;
    } catch {}
    return user?.role === 'admin' ? 'admin' : 'dashboard';
  });

  const setActiveTab = useCallback((tab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('mospi_active_tab', tab);
    } catch {}
  }, []);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(() => {
    try {
      const cached = localStorage.getItem(`mospi_profile_${userId}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [competenciesData, setCompetenciesData] = useState({ allCompetencies: [], selectedCompetencies: [], selfRatings: {} });
  const [assessmentResults, setAssessmentResults] = useState(null);
  const [skillGaps, setSkillGaps] = useState([]);
  const [roadmap, setRoadmap] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [progressRecords, setProgressRecords] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [aiConfigured, setAiConfigured] = useState(true);
  const [aiError, setAiError] = useState(null);

  // Selected Course Context for Learning and Assessment Flow
  const [selectedCourse, setSelectedCourseState] = useState(() => {
    try {
      const saved = localStorage.getItem(`mospi_selected_course_${userId}`) || localStorage.getItem('mospi_selected_course');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setSelectedCourse = useCallback((course) => {
    setSelectedCourseState(course);
    try {
      if (course) {
        localStorage.setItem(`mospi_selected_course_${userId}`, JSON.stringify(course));
        localStorage.setItem('mospi_selected_course', JSON.stringify(course));
      } else {
        localStorage.removeItem(`mospi_selected_course_${userId}`);
        localStorage.removeItem('mospi_selected_course');
      }
    } catch {}
  }, [userId]);

  const startCourse = useCallback((rec, openInNewTab = true) => {
    if (!rec) return;
    if (user?.role === 'admin') {
      console.warn('[OfficerContext] Administrative view cannot initiate course learning as an officer.');
      return;
    }
    const courseId = rec.courseId || rec.id;
    const courseName = rec.courseName || rec.title;
    const hasPdf = Boolean(rec.pdfFileName);
    const pdfUrl = rec.pdfUrl || (hasPdf ? `/api/courses/${courseId}/pdf?userId=${encodeURIComponent(userId)}` : null);

    const courseData = {
      officerId: userId,
      courseId,
      courseName,
      provider: rec.provider,
      source: rec.source,
      competencyId: rec.competencyId,
      competencyName: rec.competencyName,
      pdfFileName: rec.pdfFileName || null,
      pdfPath: rec.pdfPath || null,
      pdfAvailable: Boolean(rec.pdfAvailable),
      pdfUrl,
      officialUrl: rec.officialUrl || null
    };

    setSelectedCourse(courseData);

    // If mapped PDF exists, open ONLY this course's PDF in a new tab
    if (openInNewTab && pdfUrl) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    } else if (openInNewTab && rec.officialUrl) {
      window.open(rec.officialUrl, '_blank', 'noopener,noreferrer');
    }

    // Switch to learning progress tab
    setActiveTabState('progress');
    try {
      localStorage.setItem('mospi_active_tab', 'progress');
    } catch {}
  }, [userId, user?.role, setSelectedCourse]);

  const fetchAllOfficerData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // 0. System Health & AI status
      try {
        const healthRes = await fetch('/api/health').then(r => r.json()).catch(() => ({}));
        if (healthRes.isConfigured === false || healthRes.aiStatus?.includes('not configured')) {
          setAiConfigured(false);
          setAiError('OPENAI_API_KEY is not configured');
        } else {
          setAiConfigured(true);
          setAiError(null);
        }
      } catch (hErr) {
        console.warn('[OfficerContext] Health check error:', hErr);
      }

      // Integrations & System Status
      try {
        const statusRes = await fetch('/api/integrations/status').then(r => r.json()).catch(() => ({}));
        setSystemStatus(statusRes);
      } catch (sErr) {
        console.warn('[OfficerContext] Status check error:', sErr);
      }

      // If user is Admin, do NOT query individual officer endpoints for admin user id
      if (user?.role === 'admin') {
        setLoading(false);
        return;
      }

      // 1. Profile
      const profRes = await fetch(`/api/officer/profile?userId=${userId}`).then(r => r.json());
      if (profRes.profile) {
        setProfile(profRes.profile);
        localStorage.setItem(`mospi_profile_${userId}`, JSON.stringify(profRes.profile));
      }

      // 2. Competencies & Self-Ratings
      const compRes = await fetch(`/api/competencies?userId=${userId}`).then(r => r.json());
      if (compRes?.error?.includes('OPENAI_API_KEY is not configured')) {
        setAiConfigured(false);
        setAiError('OPENAI_API_KEY is not configured');
      }
      setCompetenciesData(compRes);

      // 3. Assessment Results
      const assessRes = await fetch(`/api/assessment/results?userId=${userId}`).then(r => r.json());
      setAssessmentResults(assessRes.results || null);

      // 4. Skill Gaps
      const gapsRes = await fetch(`/api/skill-gaps?userId=${userId}`).then(r => r.json());
      setSkillGaps(gapsRes.gaps || []);

      // 5. Roadmap
      const roadRes = await fetch(`/api/roadmap?userId=${userId}`).then(r => r.json());
      setRoadmap(roadRes.roadmap || []);

      // 6. Recommendations
      const recRes = await fetch(`/api/courses/recommendations?userId=${userId}`).then(r => r.json());
      setRecommendations(recRes.recommendations || []);

      // 7. Progress Records
      const progRes = await fetch(`/api/learning/progress?userId=${userId}`).then(r => r.json());
      setProgressRecords(progRes.records || []);
    } catch (err) {
      console.error('[OfficerContext] Failed loading officer data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, user?.role]);

  // Synchronize profile state immediately whenever userId changes upon login
  useEffect(() => {
    try {
      const cached = localStorage.getItem(`mospi_profile_${userId}`);
      if (cached) {
        setProfile(JSON.parse(cached));
      }
    } catch {
      // ignore
    }
  }, [userId]);

  useEffect(() => {
    fetchAllOfficerData();
  }, [fetchAllOfficerData]);

  // Tab switcher with role and completeness protection
  const handleSetActiveTab = useCallback((targetTab) => {
    if (user?.role === 'admin') {
      const validAdminTabs = [
        'admin',
        'admin-dashboard',
        'admin-employees',
        'admin-competencies',
        'admin-gaps',
        'admin-training',
        'admin-reports'
      ];
      const nextTab = validAdminTabs.includes(targetTab) ? targetTab : 'admin';
      setActiveTab(nextTab);
      return true;
    }

    const profileDone = isProfileComplete(profile);
    // If officer profile is incomplete, force profile completion before accessing any other module
    if (user?.role === 'officer' && !profileDone && targetTab !== 'profile') {
      setActiveTab('profile');
      return false;
    }
    setActiveTab(targetTab);
    return true;
  }, [profile, user?.role, setActiveTab]);

  // Update profile handler (Blocked for Admin)
  const updateProfile = async (newProfile) => {
    if (user?.role === 'admin') {
      console.warn('[OfficerContext] Admin role cannot edit officer profile.');
      return false;
    }
    try {
      const merged = { ...profile, ...newProfile, userId };
      // Save locally immediately
      localStorage.setItem(`mospi_profile_${userId}`, JSON.stringify(merged));
      setProfile(merged);

      const res = await fetch('/api/officer/profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'x-user-role': user?.role || 'officer'
        },
        body: JSON.stringify(merged)
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        localStorage.setItem(`mospi_profile_${userId}`, JSON.stringify(data.profile));
        // Refresh dependent competencies and roadmap
        await fetchAllOfficerData();
        return true;
      }
    } catch (e) {
      console.error('Error saving profile:', e);
    }
    return false;
  };

  // Save self-ratings handler (Blocked for Admin)
  const saveSelfRatings = async (ratings) => {
    if (user?.role === 'admin') {
      console.warn('[OfficerContext] Admin role cannot submit self-ratings.');
      return false;
    }
    try {
      const res = await fetch('/api/competencies/self-rating', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'x-user-role': user?.role || 'officer'
        },
        body: JSON.stringify({ userId, ratings })
      });
      const data = await res.json();
      if (data.success) {
        setCompetenciesData(prev => ({ ...prev, selfRatings: data.ratings }));
        localStorage.setItem(`mospi_ratings_${userId}`, JSON.stringify(data.ratings));
        return true;
      }
    } catch (e) {
      console.error('Error saving self-ratings:', e);
    }
    return false;
  };

  const profileComplete = isProfileComplete(profile);

  return (
    <OfficerContext.Provider
      value={{
        loading,
        activeTab,
        setActiveTab: handleSetActiveTab,
        profile,
        profileComplete,
        isProfileComplete: profileComplete,
        updateProfile,
        competenciesData,
        saveSelfRatings,
        assessmentResults,
        skillGaps,
        roadmap,
        recommendations,
        progressRecords,
        selectedCourse,
        setSelectedCourse,
        startCourse,
        systemStatus,
        aiConfigured,
        aiError,
        refreshAllData: fetchAllOfficerData
      }}
    >
      {children}
    </OfficerContext.Provider>
  );
}

export function useOfficer() {
  return useContext(OfficerContext);
}
