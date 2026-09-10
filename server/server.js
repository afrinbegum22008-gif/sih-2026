const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const config = require('./config/env');

// Services
const AIProvider = require('./services/aiProvider');
const CompetencyService = require('./services/competencyService');
const AdaptiveAssessmentService = require('./services/adaptiveAssessmentService');
const SkillGapService = require('./services/skillGapService');
const RoadmapService = require('./services/roadmapService');
const iGOTService = require('./services/igotService');
const NSSTAService = require('./services/nsstaService');
const CourseRecommendationService = require('./services/courseRecommendationService');
const LearningMaterialService = require('./services/learningMaterialService');
const ProgressEvaluationService = require('./services/progressEvaluationService');
const AIChatService = require('./services/aiChatService');
const {
  getCourseMaterialsDir,
  getCourseMapping,
  getAllMappingsForOfficer,
  resolvePdfPath
} = require('./data/coursePdfMapping');

const app = express();

// Middleware & Cross-Origin Resource Sharing (CORS)
app.use(cors({
  origin: true, // Dynamically reflects origin (supports Vercel, Netlify, Render, localhost)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-role', 'Accept', 'Origin']
}));
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve course materials static files directly
const courseMaterialsDir = getCourseMaterialsDir();
app.use('/course-materials', express.static(courseMaterialsDir));

// Multer storage for uploaded learning documents
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Database helper
const dbPath = path.join(__dirname, 'data/db.json');
function readDB() {
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (e) {
    console.error('Error reading db.json:', e);
    return {};
  }
}
function writeDB(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing db.json:', e);
  }
}

// In-memory active adaptive assessment sessions
// sessionId -> { userId, competencies: [], currentIndex, currentDifficulty, attempts: [], completed: false }
const assessmentSessions = {};

// ================================================================
// AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)
// ================================================================
function authenticateUser(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const headerUserId = req.headers['x-user-id'] || '';
  const headerUserRole = req.headers['x-user-role'] || '';
  const queryUserId = req.query.userId || req.query.officerId || '';
  const bodyUserId = req.body?.userId || req.body?.officerId || '';

  const db = readDB();
  const users = db.users || [];

  let userId = headerUserId || bodyUserId || queryUserId;
  if (!userId && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const match = token.match(/^token-mospi-([a-zA-Z0-9_-]+)/);
    if (match) userId = match[1];
  }

  let user = null;
  if (userId) {
    user = users.find(u => u.id === userId || u.email === userId || u.employeeId === userId);
  }

  const effectiveRole = user?.role || headerUserRole || (userId === 'usr-admin' ? 'admin' : null);
  req.currentUser = user ? { ...user, role: effectiveRole || user.role } : (effectiveRole ? { id: userId, role: effectiveRole } : null);
  next();
}

app.use(authenticateUser);

// Guard: Restrict Officer Actions to Officer role only (Admins cannot perform officer mutations/assessments)
function requireOfficer(req, res, next) {
  const role = req.currentUser?.role || req.headers['x-user-role'];
  if (role === 'admin') {
    return res.status(403).json({
      success: false,
      error: 'ADMIN_READ_ONLY',
      message: 'Access Denied: Statistical Department Head / Admin role is restricted to read-only monitoring and cannot perform officer assessments, learning activities, or profile modifications.'
    });
  }
  next();
}

// Guard: Restrict Admin Analytics to Statistical Department Head / Admin role only
function requireAdmin(req, res, next) {
  const role = req.currentUser?.role || req.headers['x-user-role'];
  if (role === 'officer') {
    return res.status(403).json({
      success: false,
      error: 'OFFICER_FORBIDDEN',
      message: 'Access Denied: Statistical Department Head / Administrator credentials required to view institutional intelligence.'
    });
  }
  next();
}

// ================================================================
// ROUTES
// ================================================================

// 1. Health & System Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: "Samarthya Sankhyiki - India's Official Statistical Competency Platform",
    aiEngine: AIProvider.getProviderName(),
    isConfigured: AIProvider.isConfigured(),
    aiStatus: AIProvider.isConfigured() ? 'ACTIVE' : 'OPENAI_API_KEY is not configured',
    igotIntegration: iGOTService.getStatus(),
    nsstaIntegration: NSSTAService.getStatus(),
    timestamp: new Date().toISOString()
  });
});

// 2. Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;

  // 1. Validation for empty fields
  if (!identifier || !identifier.toString().trim() || !password || !password.toString().trim()) {
    return res.status(400).json({
      success: false,
      message: 'Official email/employee ID and password are both required.'
    });
  }

  const cleanIdentifier = identifier.toString().trim().toLowerCase();
  const cleanPassword = password.toString().trim();
  const cleanPasswordLower = cleanPassword.toLowerCase();

  const db = readDB();
  const users = db.users || [];

  // Match in db.users by:
  // 1. Exact normalized email
  // 2. Exact normalized employee ID
  // 3. Email username prefix (e.g. "ananya.sharma" matches "ananya.sharma@mospi.gov.in")
  let user = users.find(u => 
    (u.email && u.email.toString().trim().toLowerCase() === cleanIdentifier) || 
    (u.employeeId && u.employeeId.toString().trim().toLowerCase() === cleanIdentifier) ||
    (u.email && u.email.toString().trim().toLowerCase().split('@')[0] === cleanIdentifier)
  );

  // Cross-reference with db.officerProfiles if not found in db.users
  if (!user && db.officerProfiles) {
    const matchedProfileKey = Object.keys(db.officerProfiles).find(key => {
      const p = db.officerProfiles[key];
      if (!p) return false;
      const pEmail = (p.email || '').toString().trim().toLowerCase();
      const pEmpId = (p.employeeId || '').toString().trim().toLowerCase();
      const pUserId = (p.userId || key).toString().trim().toLowerCase();
      const pPrefix = pEmail.split('@')[0];
      return pEmail === cleanIdentifier || pEmpId === cleanIdentifier || pUserId === cleanIdentifier || pPrefix === cleanIdentifier;
    });

    if (matchedProfileKey) {
      const p = db.officerProfiles[matchedProfileKey];
      // Synchronize missing auth record into db.users
      const newAuthUser = {
        id: p.userId || matchedProfileKey,
        email: p.email || `${(p.name || 'officer').toLowerCase().replace(/\s+/g, '.')}@mospi.gov.in`,
        employeeId: p.employeeId || `MOSPI-${p.userId}`,
        name: p.name || 'Official Statistical Officer',
        role: 'officer',
        password: 'MoSPI@123',
        designation: p.designation || 'Statistical Officer',
        department: p.department || 'National Sample Survey Office (NSSO)',
        avatar: (p.name || 'SO').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      };
      users.push(newAuthUser);
      db.users = users;
      writeDB(db);
      user = newAuthUser;
    }
  }

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials. No official account found with this email or Employee ID.'
    });
  }

  // Password verification: check account password or authorized master demo keys
  // Support case-tolerant matching for official demo passwords (MoSPI@123, Admin@123, Karmayogi@2026)
  const validPasswords = [
    user.password,
    user.role === 'admin' ? 'Admin@123' : 'MoSPI@123',
    'Karmayogi@2026'
  ].filter(Boolean);

  const isPasswordValid = validPasswords.some(p => 
    p === cleanPassword || p.toLowerCase() === cleanPasswordLower
  );

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Incorrect password. Please verify your credentials and try again.'
    });
  }

  // Generate secure session payload with RBAC role
  res.json({
    success: true,
    token: `token-mospi-${user.id}-${Date.now()}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      employeeId: user.employeeId,
      role: user.role, // 'admin' | 'officer'
      designation: user.designation,
      department: user.department,
      avatar: user.avatar
    }
  });
});

app.get('/api/auth/users', (req, res) => {
  const db = readDB();
  // Strip password before returning user list to client
  const safeUsers = (db.users || []).map(({ password, ...u }) => u);
  res.json({ users: safeUsers });
});

// 3. Officer Profile Routes
app.get('/api/officer/profile', (req, res) => {
  const userId = req.query.userId || 'usr-001';
  const db = readDB();
  const profile = (db.officerProfiles && db.officerProfiles[userId]) || {
    userId,
    name: 'Official Statistical Officer',
    jobRole: 'Statistical Officer',
    currentAssignment: 'Labour Statistics & Periodic Labour Force Survey (PLFS)',
    designation: 'Statistical Officer',
    department: 'National Sample Survey Office (NSSO)',
    educationalQualification: 'M.Sc. Statistics',
    workExperience: '4 Years',
    previousTrainings: 'NSSTA Foundation Course',
    relevantDomain: 'Labour and Social Statistics'
  };

  res.json({ profile });
});

app.post('/api/officer/profile', requireOfficer, (req, res) => {
  const { userId = 'usr-001', ...profileData } = req.body;
  const db = readDB();
  db.officerProfiles = db.officerProfiles || {};
  db.officerProfiles[userId] = {
    ...db.officerProfiles[userId],
    ...profileData,
    userId,
    updatedAt: new Date().toISOString()
  };

  // Sync with user auth record if present, or create corresponding auth user if missing
  db.users = db.users || [];
  let user = db.users.find(u => u.id === userId);
  if (user) {
    if (profileData.name) user.name = profileData.name;
    if (profileData.designation) user.designation = profileData.designation;
    if (profileData.department) user.department = profileData.department;
    if (profileData.employeeId) user.employeeId = profileData.employeeId;
    if (profileData.email) user.email = profileData.email;
  } else {
    // Automatically register corresponding auth user for this officer profile
    user = {
      id: userId,
      email: profileData.email || `${(profileData.name || 'officer').toLowerCase().replace(/\s+/g, '.')}@mospi.gov.in`,
      employeeId: profileData.employeeId || `MOSPI-${userId}`,
      name: profileData.name || 'Official Statistical Officer',
      role: 'officer',
      password: 'MoSPI@123',
      designation: profileData.designation || 'Statistical Officer',
      department: profileData.department || 'MoSPI',
      avatar: (profileData.name || 'SO').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    };
    db.users.push(user);
  }

  writeDB(db);
  res.json({ success: true, profile: db.officerProfiles[userId] });
});

// 4. Competency Selection & Self-Rating
app.get('/api/competencies', async (req, res) => {
  try {
    const userId = req.query.userId || 'usr-001';
    const db = readDB();
    const profile = (db.officerProfiles && db.officerProfiles[userId]) || {};
    const allComps = CompetencyService.getAllCompetencies();
    const selectedComps = await CompetencyService.selectRoleCompetencies(profile);
    const selfRatings = (db.selfAssessments && db.selfAssessments[userId]) || {};

    res.json({
      success: true,
      allCompetencies: allComps,
      selectedCompetencies: selectedComps,
      selfRatings,
      explanation: `AI selected ${selectedComps.length} core competencies specifically calibrated for ${profile.jobRole || 'Statistical Officer'} working on "${profile.currentAssignment || 'General Statistics'}".`
    });
  } catch (err) {
    console.error('[API /api/competencies] Error:', err.message);
    const db = readDB();
    const profile = (db.officerProfiles && db.officerProfiles[req.query.userId || 'usr-001']) || {};
    const fallbackComps = CompetencyService.getPersonalizedCompetenciesForProfile(profile);
    res.json({
      success: true,
      allCompetencies: CompetencyService.getAllCompetencies(),
      selectedCompetencies: fallbackComps,
      selfRatings: {},
      explanation: `Dynamically calibrated ${fallbackComps.length} core competencies for ${profile.jobRole || 'Statistical Officer'}.`
    });
  }
});

app.post('/api/competencies/self-rating', requireOfficer, (req, res) => {
  const { userId = 'usr-001', ratings = {} } = req.body;
  const db = readDB();
  db.selfAssessments = db.selfAssessments || {};
  db.selfAssessments[userId] = {
    ...db.selfAssessments[userId],
    ...ratings
  };
  writeDB(db);

  res.json({
    success: true,
    message: 'Self-ratings saved. Baseline test difficulties calibrated.',
    ratings: db.selfAssessments[userId]
  });
});

// 5. Adaptive Assessment Routes (Dynamic & Real OpenAI Engine)
app.post('/api/assessment/start', requireOfficer, async (req, res) => {
  try {
    const { userId = 'usr-001' } = req.body;
    const db = readDB();
    const profile = (db.officerProfiles && db.officerProfiles[userId]) || {};
    const selectedComps = await CompetencyService.selectRoleCompetencies(profile);
    const selfRatings = (db.selfAssessments && db.selfAssessments[userId]) || {};

    if (selectedComps.length === 0) {
      return res.status(400).json({ error: 'No competencies found for officer profile.' });
    }

    const sessionId = `session-${userId}-${Date.now()}`;
    const firstComp = selectedComps[0];
    const initialSelfRating = selfRatings[firstComp.id] || 3;
    const initialDifficulty = AdaptiveAssessmentService.getInitialDifficulty(initialSelfRating);

    // Generate dynamic non-hardcoded question via OpenAI
    const question = await AdaptiveAssessmentService.generateAdaptiveQuestion({
      competency: firstComp,
      difficulty: initialDifficulty,
      profile,
      askedQuestionIds: []
    });

    const QUESTIONS_PER_COMP = 5;
    const totalQuestions = selectedComps.length * QUESTIONS_PER_COMP;

    assessmentSessions[sessionId] = {
      sessionId,
      userId,
      profile,
      competencies: selectedComps,
      currentCompIndex: 0,
      questionInComp: 0,
      currentStep: 1,
      totalQuestions,
      questionsPerComp: QUESTIONS_PER_COMP,
      currentDifficulty: initialDifficulty,
      currentQuestion: question,
      askedQuestionIds: question ? [question.id] : [],
      attempts: [],
      completed: false
    };

    res.json({
      success: true,
      sessionId,
      totalCompetencies: selectedComps.length,
      currentStep: 1,
      totalQuestions,
      currentCompIndex: 0,
      questionNumberInSubject: 1,
      totalInSubject: QUESTIONS_PER_COMP,
      competency: firstComp,
      currentDifficulty: initialDifficulty,
      question
    });
  } catch (err) {
    console.error('[API /api/assessment/start] Error:', err.message);
    if (err.message && err.message.includes('OPENAI_API_KEY is not configured')) {
      return res.status(503).json({
        success: false,
        error: 'OPENAI_API_KEY is not configured',
        message: 'OPENAI_API_KEY is not configured'
      });
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/assessment/answer', requireOfficer, async (req, res) => {
  try {
    const { sessionId, questionId, selectedOption, timeSpentSeconds = 30 } = req.body;
    const session = assessmentSessions[sessionId];
    if (!session) {
      return res.status(404).json({ error: 'Assessment session not found or expired.' });
    }

    const QUESTIONS_PER_COMP = session.questionsPerComp || 5;
    const currentQ = session.currentQuestion;
    const isCorrect = currentQ ? currentQ.correctAnswer === selectedOption : false;
    const currentComp = session.competencies[session.currentCompIndex];

    // Record attempt with current competency
    session.attempts.push({
      questionId: questionId || (currentQ && currentQ.id),
      competencyId: currentQ ? currentQ.competencyId : currentComp.id,
      difficulty: session.currentDifficulty,
      selectedOption,
      isCorrect,
      timeSpentSeconds
    });

    // Calculate next adaptive difficulty within the subject
    const nextDifficulty = AdaptiveAssessmentService.evaluateStep({
      currentDifficulty: session.currentDifficulty,
      isCorrect
    });

    session.questionInComp += 1;
    session.currentStep += 1;

    // Check if the current subject has finished all 5 questions
    if (session.questionInComp >= QUESTIONS_PER_COMP) {
      session.currentCompIndex += 1;
      session.questionInComp = 0;

      // Check if ALL subjects have completed their 5 questions (e.g. 5 subjects x 5 = 25 questions)
      if (session.currentCompIndex >= session.competencies.length) {
        session.completed = true;

        const db = readDB();
        const selfRatings = (db.selfAssessments && db.selfAssessments[session.userId]) || {};
        const competencyScores = {};
        let totalScoreSum = 0;

        for (const comp of session.competencies) {
          const selfRating = selfRatings[comp.id] || 3;
          const resObj = await AdaptiveAssessmentService.calculateDemonstratedCompetency(comp.id, session.attempts, selfRating);
          competencyScores[comp.id] = {
            ...resObj,
            competencyName: comp.name
          };
          totalScoreSum += (resObj.score || 0);
        }

        const overallScore = Math.round(totalScoreSum / Math.max(1, session.competencies.length));

        db.assessmentResults = db.assessmentResults || {};
        db.assessmentResults[session.userId] = {
          completedAt: new Date().toISOString(),
          totalQuestions: session.attempts.length,
          correctCount: session.attempts.filter(a => a.isCorrect).length,
          overallScore,
          competencyScores
        };
        writeDB(db);

        return res.json({
          success: true,
          completed: true,
          overallScore,
          totalQuestions: session.attempts.length,
          correctCount: session.attempts.filter(a => a.isCorrect).length,
          competencyScores
        });
      }

      // Transition to next subject: initialize baseline difficulty from that subject's self-rating
      const nextComp = session.competencies[session.currentCompIndex];
      const db = readDB();
      const selfRatings = (db.selfAssessments && db.selfAssessments[session.userId]) || {};
      const newSelfRating = selfRatings[nextComp.id] || 3;
      session.currentDifficulty = AdaptiveAssessmentService.getInitialDifficulty(newSelfRating);

      const nextQuestion = await AdaptiveAssessmentService.generateAdaptiveQuestion({
        competency: nextComp,
        difficulty: session.currentDifficulty,
        profile: session.profile,
        askedQuestionIds: session.askedQuestionIds
      });

      session.currentQuestion = nextQuestion;
      if (nextQuestion) session.askedQuestionIds.push(nextQuestion.id);

      return res.json({
        success: true,
        completed: false,
        currentStep: session.currentStep,
        totalQuestions: session.totalQuestions,
        currentCompIndex: session.currentCompIndex,
        totalCompetencies: session.competencies.length,
        questionNumberInSubject: 1,
        totalInSubject: QUESTIONS_PER_COMP,
        competency: nextComp,
        currentDifficulty: session.currentDifficulty,
        question: nextQuestion
      });
    }

    // Continue on the SAME subject (question 2, 3, 4, or 5 of 5)
    session.currentDifficulty = nextDifficulty;
    const nextQuestion = await AdaptiveAssessmentService.generateAdaptiveQuestion({
      competency: currentComp,
      difficulty: nextDifficulty,
      profile: session.profile,
      askedQuestionIds: session.askedQuestionIds
    });

    session.currentQuestion = nextQuestion;
    if (nextQuestion) session.askedQuestionIds.push(nextQuestion.id);

    return res.json({
      success: true,
      completed: false,
      currentStep: session.currentStep,
      totalQuestions: session.totalQuestions,
      currentCompIndex: session.currentCompIndex,
      totalCompetencies: session.competencies.length,
      questionNumberInSubject: session.questionInComp + 1,
      totalInSubject: QUESTIONS_PER_COMP,
      competency: currentComp,
      currentDifficulty: nextDifficulty,
      question: nextQuestion
    });
  } catch (err) {
    console.error('[API /api/assessment/answer] Error:', err.message);
    if (err.message && err.message.includes('OPENAI_API_KEY is not configured')) {
      return res.status(503).json({
        success: false,
        error: 'OPENAI_API_KEY is not configured',
        message: 'OPENAI_API_KEY is not configured'
      });
    }
    res.status(500).json({ error: err.message });
  }
});

// 6. Assessment Results & Actual Competencies
app.get('/api/assessment/results', async (req, res) => {
  try {
    const userId = req.query.userId || 'usr-001';
    const db = readDB();
    const profile = (db.officerProfiles && db.officerProfiles[userId]) || {};
    const selectedComps = await CompetencyService.selectRoleCompetencies(profile);
    const selfRatings = (db.selfAssessments && db.selfAssessments[userId]) || {};
    const rawResults = (db.assessmentResults && db.assessmentResults[userId]) || null;

    const hasCompletedAssessment = Boolean(
      rawResults &&
      rawResults.competencyScores &&
      Object.keys(rawResults.competencyScores).length > 0 &&
      rawResults.overallScore !== undefined
    );

    const results = hasCompletedAssessment ? rawResults : null;

    const comparison = hasCompletedAssessment
      ? selectedComps.map(comp => {
          const self = selfRatings[comp.id] || 3;
          const assessed = (results.competencyScores && results.competencyScores[comp.id]) || {
            score: 0,
            demonstratedLevel: 'Unassessed'
          };

          let calibration = 'ALIGNED';
          if (self >= 4 && assessed.demonstratedLevel === 'Beginner') calibration = 'OVERESTIMATED';
          if (self <= 2 && assessed.demonstratedLevel === 'Advanced') calibration = 'UNDERESTIMATED';

          return {
            competencyId: comp.id,
            competencyName: comp.name,
            category: comp.category,
            selfRating: self,
            assessmentScore: assessed.score,
            demonstratedLevel: assessed.demonstratedLevel,
            calibration
          };
        })
      : [];

    res.json({
      results,
      comparison,
      hasCompletedAssessment
    });
  } catch (err) {
    if (err.message && err.message.includes('OPENAI_API_KEY is not configured')) {
      return res.status(503).json({
        success: false,
        error: 'OPENAI_API_KEY is not configured',
        message: 'OPENAI_API_KEY is not configured'
      });
    }
    res.status(500).json({ error: err.message });
  }
});

// 7. Skill Gap Analysis
app.get('/api/skill-gaps', async (req, res) => {
  try {
    const userId = req.query.userId || 'usr-001';
    const db = readDB();
    const profile = (db.officerProfiles && db.officerProfiles[userId]) || {};
    const rawResults = (db.assessmentResults && db.assessmentResults[userId]) || null;

    const hasCompletedAssessment = Boolean(
      rawResults &&
      rawResults.competencyScores &&
      Object.keys(rawResults.competencyScores).length > 0 &&
      rawResults.overallScore !== undefined
    );

    if (!hasCompletedAssessment) {
      return res.json({
        success: true,
        gaps: [],
        highGapCount: 0,
        mediumGapCount: 0,
        noGapCount: 0,
        hasCompletedAssessment: false
      });
    }

    const gaps = await SkillGapService.analyzeGaps(profile, rawResults, db);

    res.json({
      success: true,
      gaps,
      highGapCount: gaps.filter(g => g.gapSeverity === 'HIGH').length,
      mediumGapCount: gaps.filter(g => g.gapSeverity === 'MEDIUM').length,
      noGapCount: gaps.filter(g => g.gapSeverity === 'NONE').length,
      hasCompletedAssessment: true
    });
  } catch (err) {
    console.error('[API /api/skill-gaps] Error:', err.message);
    if (err.message && err.message.includes('OPENAI_API_KEY is not configured')) {
      return res.status(503).json({
        success: false,
        error: 'OPENAI_API_KEY is not configured',
        message: 'OPENAI_API_KEY is not configured'
      });
    }
    res.status(500).json({ error: err.message });
  }
});

// 8. Personalized Learning Roadmap
app.get('/api/roadmap', async (req, res) => {
  try {
    const userId = req.query.userId || 'usr-001';
    const db = readDB();
    const profile = (db.officerProfiles && db.officerProfiles[userId]) || {};
    const rawResults = (db.assessmentResults && db.assessmentResults[userId]) || null;

    const hasCompletedAssessment = Boolean(
      rawResults &&
      rawResults.competencyScores &&
      Object.keys(rawResults.competencyScores).length > 0 &&
      rawResults.overallScore !== undefined
    );

    if (!hasCompletedAssessment) {
      return res.json({
        success: true,
        roadmap: [],
        totalEstHours: 0,
        hasCompletedAssessment: false
      });
    }

    const gaps = await SkillGapService.analyzeGaps(profile, rawResults, db);
    const roadmap = await RoadmapService.generateRoadmap(profile, gaps);

    res.json({
      success: true,
      roadmap,
      totalEstHours: roadmap.reduce((acc, curr) => acc + (curr.estHours || 0), 0),
      hasCompletedAssessment: true
    });
  } catch (err) {
    console.error('[API /api/roadmap] Error:', err.message);
    if (err.message && err.message.includes('OPENAI_API_KEY is not configured')) {
      return res.status(503).json({
        success: false,
        error: 'OPENAI_API_KEY is not configured',
        message: 'OPENAI_API_KEY is not configured'
      });
    }
    res.status(500).json({ error: err.message });
  }
});

// 9. Course / Training Recommendations (iGOT & NSSTA)
app.get('/api/courses/recommendations', async (req, res) => {
  try {
    const userId = req.query.userId || 'usr-001';
    const db = readDB();
    const profile = (db.officerProfiles && db.officerProfiles[userId]) || {};
    const results = (db.assessmentResults && db.assessmentResults[userId]) || { competencyScores: {} };
    const gaps = await SkillGapService.analyzeGaps(profile, results, db);
    const roadmap = await RoadmapService.generateRoadmap(profile, gaps);

    const recommendations = await CourseRecommendationService.recommendCourses(profile, roadmap);

    res.json({
      success: true,
      recommendations,
      igotStatus: iGOTService.getStatus(),
      nsstaStatus: NSSTAService.getStatus()
    });
  } catch (err) {
    console.error('[API /api/courses/recommendations] Error:', err.message);
    if (err.message && err.message.includes('OPENAI_API_KEY is not configured')) {
      return res.status(503).json({
        success: false,
        error: 'OPENAI_API_KEY is not configured',
        message: 'OPENAI_API_KEY is not configured'
      });
    }
    res.status(500).json({ error: err.message });
  }
});

// 9b. Course PDF Mapping
app.get('/api/courses/pdf-mapping', (req, res) => {
  const userId = req.query.userId || 'usr-001';
  const mappings = getAllMappingsForOfficer(userId);
  res.json({
    success: true,
    userId,
    mappings
  });
});

// 9c. Serve Specific Course PDF
app.get('/api/courses/:courseId/pdf', (req, res) => {
  const { courseId } = req.params;
  const userId = req.query.userId || 'usr-001';
  const mapping = getCourseMapping(courseId, userId);

  if (!mapping || !mapping.pdfPath || !fs.existsSync(mapping.pdfPath)) {
    console.error(`[CoursePDF] Missing course material for course "${courseId}" (Officer: ${userId}) at path:`, mapping?.pdfPath || mapping?.pdfFileName || 'unmapped');
    return res.status(404).json({
      success: false,
      error: 'Course material is currently unavailable.',
      message: 'Course material is currently unavailable.'
    });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(mapping.pdfFileName)}"`);
  fs.createReadStream(mapping.pdfPath).pipe(res);
});

// 10b. Generate 15-Question Final Assessment Strictly from Mapped Course PDF
app.post('/api/learning/course-assessment/generate', requireOfficer, async (req, res) => {
  try {
    const { courseId, userId = 'usr-001' } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, error: 'courseId is required.' });
    }

    const mapping = getCourseMapping(courseId, userId);
    if (!mapping || !mapping.pdfPath || !fs.existsSync(mapping.pdfPath)) {
      const missingPath = mapping?.pdfPath || mapping?.pdfFileName || `unmapped-for-course-${courseId}`;
      console.error(`[CoursePDF] Missing course material for assessment generation. Course: "${courseId}", Officer: "${userId}", Path: "${missingPath}"`);
      return res.status(404).json({
        success: false,
        error: 'Course material is currently unavailable.',
        message: 'Course material is currently unavailable.'
      });
    }

    // Extract text from ONLY this specific course's PDF
    const textContent = await LearningMaterialService.extractTextFromDocument(mapping.pdfPath, mapping.pdfFileName);

    if (!textContent || textContent.trim().length === 0) {
      return res.status(422).json({
        success: false,
        error: 'Unable to extract text content from the course material PDF.',
        message: 'Unable to extract text content from the course material PDF.'
      });
    }

    // Generate exactly 15 questions from this document
    const quizData = await LearningMaterialService.generateQuizFromDocument({
      documentText: textContent,
      competencyId: mapping.competencyId,
      materialTitle: `${mapping.courseName} (${mapping.pdfFileName})`
    });

    res.json({
      success: true,
      courseId: mapping.courseId,
      courseName: mapping.courseName,
      officerId: userId,
      pdfFileName: mapping.pdfFileName,
      source: mapping.source,
      quiz: {
        ...quizData,
        courseId: mapping.courseId,
        courseName: mapping.courseName,
        officerId: userId,
        pdfFileName: mapping.pdfFileName
      }
    });
  } catch (err) {
    console.error('Error generating course-specific quiz:', err.message);
    if (err.message && err.message.includes('OPENAI_API_KEY is not configured')) {
      return res.status(503).json({
        success: false,
        error: 'OPENAI_API_KEY is not configured',
        message: 'OPENAI_API_KEY is not configured'
      });
    }
    res.status(500).json({ error: err.message || 'Failed to generate course assessment.' });
  }
});

// 10. Learning Material Upload & MCQ Generation
app.post('/api/learning/upload', requireOfficer, upload.single('document'), async (req, res) => {
  try {
    const { competencyId = 'sql', materialTitle = 'Official Study Material', rawText = '' } = req.body;
    let textContent = rawText;

    if (req.file) {
      textContent = await LearningMaterialService.extractTextFromDocument(req.file.path, req.file.originalname);
    }

    if (!textContent || textContent.trim().length === 0) {
      const samplePath = path.join(__dirname, 'data/sampleDocs/Official_SQL_Microdata_Guide.txt');
      textContent = fs.readFileSync(samplePath, 'utf8');
    }

    const quizData = await LearningMaterialService.generateQuizFromDocument({
      documentText: textContent,
      competencyId,
      materialTitle: req.file ? req.file.originalname : materialTitle
    });

    res.json({
      success: true,
      quiz: quizData
    });
  } catch (err) {
    console.error('Error generating quiz from upload:', err.message);
    if (err.message && err.message.includes('OPENAI_API_KEY is not configured')) {
      return res.status(503).json({
        success: false,
        error: 'OPENAI_API_KEY is not configured',
        message: 'OPENAI_API_KEY is not configured'
      });
    }
    res.status(500).json({ error: err.message || 'Failed to process document and generate quiz.' });
  }
});

// 11. Progress Evaluation & Before vs After Competency Shift
app.post('/api/learning/evaluate', requireOfficer, async (req, res) => {
  try {
    const {
      userId = 'usr-001',
      courseId = null,
      courseName = null,
      pdfFileName = null,
      competencyId = 'sql',
      competencyName = 'SQL & Relational Databases',
      beforeLevel = 'Beginner',
      quizScore = 80,
      answers = [],
      materialTitle = 'Training Document',
      correctCount = null,
      totalQuestions = 15
    } = req.body;

    const record = await ProgressEvaluationService.evaluateProgress({
      userId,
      competencyId,
      competencyName,
      beforeLevel,
      quizScore,
      answers,
      materialTitle: courseName || materialTitle,
      correctCount,
      totalQuestions
    });

    const db = readDB();
    db.progressRecords = db.progressRecords || {};
    db.progressRecords[userId] = db.progressRecords[userId] || [];
    
    // Store against specific courseId and officerId
    const effectiveCourseId = courseId || `course-${competencyId}`;
    db.courseAssessments = db.courseAssessments || {};
    db.courseAssessments[userId] = db.courseAssessments[userId] || {};
    db.courseAssessments[userId][effectiveCourseId] = {
      courseId: effectiveCourseId,
      courseName: courseName || materialTitle,
      officerId: userId,
      pdfFileName: pdfFileName || null,
      scoreOutOf15: `${record.correctCount ?? (correctCount ?? 12)} / ${totalQuestions || 15}`,
      quizScore,
      beforeLevel,
      afterLevel: record.afterLevel,
      completedAt: new Date().toISOString()
    };

    db.progressRecords[userId].unshift({
      ...record,
      courseId: effectiveCourseId,
      courseName: courseName || materialTitle,
      pdfFileName
    });

    db.assessmentResults = db.assessmentResults || {};
    if (!db.assessmentResults[userId]) {
      db.assessmentResults[userId] = {
        userId,
        completedAt: new Date().toISOString(),
        competencyScores: {}
      };
    }
    const userAssessment = db.assessmentResults[userId];
    userAssessment.competencyScores = userAssessment.competencyScores || {};

    if (!userAssessment.competencyScores[competencyId]) {
      userAssessment.competencyScores[competencyId] = {
        score: quizScore,
        demonstratedLevel: record.afterLevel,
        questionsAnswered: 4
      };
    } else {
      if (record.improvementDelta > 0 || quizScore > (userAssessment.competencyScores[competencyId].score || 0)) {
        userAssessment.competencyScores[competencyId].demonstratedLevel = record.afterLevel;
        userAssessment.competencyScores[competencyId].score = Math.max(
          userAssessment.competencyScores[competencyId].score || 0,
          quizScore
        );
      }
    }

    writeDB(db);

    res.json({
      success: true,
      progressRecord: record
    });
  } catch (err) {
    console.error('Error evaluating learning progress:', err.message);
    if (err.message && err.message.includes('OPENAI_API_KEY is not configured')) {
      return res.status(503).json({
        success: false,
        error: 'OPENAI_API_KEY is not configured',
        message: 'OPENAI_API_KEY is not configured'
      });
    }
    res.status(500).json({ error: err.message || 'Failed to evaluate learning progress.' });
  }
});

app.get('/api/learning/progress', (req, res) => {
  const userId = req.query.userId || 'usr-001';
  const db = readDB();
  const records = (db.progressRecords && db.progressRecords[userId]) || [];
  res.json({ records });
});

// 12. Admin Intelligence Dashboard (Data-Driven Department Head Analytics)
app.get('/api/admin/dashboard', requireAdmin, (req, res) => {
  const { department = 'All', jobRole = 'All' } = req.query;
  const db = readDB();
  const allUsers = (db.users || []).filter(u => u.role === 'officer');
  const allProfiles = db.officerProfiles || {};
  const allResults = db.assessmentResults || {};
  const allProgress = db.progressRecords || {};
  const allComps = CompetencyService.getAllCompetencies();

  // 1. Filter officers based on division and role
  const filteredUsers = allUsers.filter(user => {
    const prof = allProfiles[user.id] || {};
    const userDept = (prof.department || user.department || '').toLowerCase();
    const userRole = (prof.jobRole || user.designation || '').toLowerCase();

    if (department !== 'All' && !userDept.includes(department.toLowerCase())) return false;
    if (jobRole !== 'All' && !userRole.includes(jobRole.toLowerCase())) return false;
    return true;
  });

  const totalEmployees = filteredUsers.length;

  // Track assessed officers
  const assessedOfficers = filteredUsers.filter(u => {
    const r = allResults[u.id];
    return Boolean(r && r.completedAt && r.totalQuestions > 0 && r.overallScore !== undefined);
  });
  const employeesAssessed = assessedOfficers.length;
  const employeesNotAssessed = Math.max(0, totalEmployees - employeesAssessed);

  // Calculate Average Readiness Index
  const totalReadinessSum = assessedOfficers.reduce((sum, u) => sum + (allResults[u.id].overallScore || 0), 0);
  const averageReadinessIndex = employeesAssessed > 0 ? Math.round(totalReadinessSum / employeesAssessed) : 0;

  // 2. Aggregate Courses & Progress Data across filtered officers
  let coursesStartedCount = 0;
  let coursesCompletedCount = 0;
  const uniqueImprovedOfficers = new Set();
  const allCompletedRecords = [];

  filteredUsers.forEach(u => {
    const records = allProgress[u.id] || [];
    if (records.length > 0) {
      coursesStartedCount++;
      coursesCompletedCount += records.length;
      records.forEach(rec => {
        allCompletedRecords.push({ ...rec, userId: u.id });
        if (rec.improvementDelta > 0) {
          uniqueImprovedOfficers.add(u.id);
        }
      });
    }
  });

  const employeesImproved = uniqueImprovedOfficers.size;
  const assessmentsCompleted = employeesAssessed + coursesCompletedCount;

  // Total unique recommended courses in catalog
  let totalCoursesRecommended = 0;
  try {
    const catalog = require('./data/courses.json');
    totalCoursesRecommended = catalog.length;
  } catch {
    totalCoursesRecommended = 15;
  }

  // 3. Subject-Wise Competency Analysis (All system subjects)
  const subjectAnalysis = allComps.map(comp => {
    let strongCount = 0;
    let needsImprovementCount = 0;
    let weakCount = 0;
    let assessedCount = 0;
    let scoreSum = 0;

    filteredUsers.forEach(user => {
      const resObj = (allResults[user.id] && allResults[user.id].competencyScores && allResults[user.id].competencyScores[comp.id]);
      if (resObj && typeof resObj.score === 'number') {
        assessedCount++;
        scoreSum += resObj.score;
        if (resObj.demonstratedLevel === 'Advanced' || resObj.score >= 70) {
          strongCount++;
        } else if (resObj.demonstratedLevel === 'Intermediate' || resObj.score >= 40) {
          needsImprovementCount++;
        } else {
          weakCount++;
        }
      }
    });

    const strongPct = assessedCount > 0 ? Math.round((strongCount / assessedCount) * 100) : 0;
    const needsImprovementPct = assessedCount > 0 ? Math.round((needsImprovementCount / assessedCount) * 100) : 0;
    const weakPct = assessedCount > 0 ? Math.round((weakCount / assessedCount) * 100) : 0;
    const avgScore = assessedCount > 0 ? Math.round(scoreSum / assessedCount) : 0;

    let strategicAction = 'Assessment Pending';
    if (assessedCount > 0) {
      if (weakPct >= 40) strategicAction = 'Immediate Mandatory Training Batch';
      else if (weakPct >= 20 || needsImprovementPct >= 40) strategicAction = 'Reinforcement Course Recommended';
      else strategicAction = 'Healthy Operational Benchmark';
    }

    return {
      competencyId: comp.id,
      competencyName: comp.name,
      category: comp.category,
      totalAssessed: assessedCount,
      strongCount,
      needsImprovementCount,
      weakCount,
      strongPct,
      needsImprovementPct,
      weakPct,
      averageScore: avgScore,
      strategicAction
    };
  });

  // Competency distribution dictionary for chart/CSV export compatibility
  const competencyDistribution = {};
  subjectAnalysis.forEach(sub => {
    competencyDistribution[sub.competencyId] = {
      name: sub.competencyName,
      category: sub.category,
      strongPct: sub.strongPct,
      intermediatePct: sub.needsImprovementPct,
      weakPct: sub.weakPct,
      sampleSize: sub.totalAssessed
    };
  });

  // 4. Department-Wide Skill Gap Analysis
  const LEVEL_RANKS = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
  const gapCounts = {};

  assessedOfficers.forEach(user => {
    const prof = allProfiles[user.id] || {};
    const res = allResults[user.id] || {};
    const compScores = res.competencyScores || {};

    Object.entries(compScores).forEach(([compId, scoreObj]) => {
      const comp = CompetencyService.getCompetencyById(compId);
      const reqLevel = SkillGapService.getRequiredLevel(prof.jobRole || '', prof.currentAssignment || '', compId, db);
      const actLevel = scoreObj.demonstratedLevel || 'Beginner';

      const reqRank = LEVEL_RANKS[reqLevel] || 2;
      const actRank = LEVEL_RANKS[actLevel] || 1;
      const diff = reqRank - actRank;

      if (diff > 0) {
        if (!gapCounts[compId]) {
          gapCounts[compId] = {
            competencyId: compId,
            competencyName: comp ? comp.name : compId,
            category: comp ? comp.category : 'TECHNICAL',
            highCount: 0,
            mediumCount: 0,
            totalCount: 0
          };
        }
        gapCounts[compId].totalCount++;
        if (diff >= 2) gapCounts[compId].highCount++;
        else gapCounts[compId].mediumCount++;
      }
    });
  });

  const skillGapsList = Object.values(gapCounts).map(item => {
    const affectedPct = employeesAssessed > 0 ? Math.round((item.totalCount / employeesAssessed) * 100) : 0;
    const priorityLevel = item.highCount > 0 ? 'High Priority' : 'Medium Priority';
    return {
      competencyId: item.competencyId,
      competencyName: item.competencyName,
      category: item.category,
      affectedCount: item.totalCount,
      affectedPct,
      highCount: item.highCount,
      mediumCount: item.mediumCount,
      priorityLevel,
      weakPercentage: affectedPct,
      recommendedAction: item.highCount > 0 ? 'Mandate immediate NSSTA residential intervention' : 'Schedule self-paced iGOT module'
    };
  });

  skillGapsList.sort((a, b) => b.affectedCount - a.affectedCount);

  const totalSkillGapsIdentified = skillGapsList.reduce((sum, g) => sum + g.affectedCount, 0);
  const highPrioritySkillGaps = skillGapsList.reduce((sum, g) => sum + g.highCount, 0);

  const topGaps = skillGapsList.slice(0, 5);

  // 5. Before vs After Learning Analysis
  let improvedCount = 0;
  let sameCount = 0;
  let declinedCount = 0;
  let totalDeltaPoints = 0;
  const courseWiseComparison = {};

  allCompletedRecords.forEach(rec => {
    const userRes = allResults[rec.userId];
    const initialScoreObj = userRes && userRes.competencyScores && userRes.competencyScores[rec.competencyId];
    const beforeScore = initialScoreObj ? (initialScoreObj.score || 0) : (rec.beforeLevel === 'Advanced' ? 80 : rec.beforeLevel === 'Intermediate' ? 50 : 25);
    const afterScore = rec.quizScore || (rec.afterLevel === 'Advanced' ? 85 : rec.afterLevel === 'Intermediate' ? 65 : 40);

    const delta = afterScore - beforeScore;
    totalDeltaPoints += delta;

    if (delta > 0 || rec.improvementDelta > 0) improvedCount++;
    else if (delta === 0) sameCount++;
    else declinedCount++;

    const courseKey = rec.courseName || rec.materialTitle || rec.competencyName;
    if (!courseWiseComparison[courseKey]) {
      courseWiseComparison[courseKey] = {
        courseName: courseKey,
        competencyName: rec.competencyName,
        officersTrained: 0,
        beforeScoreSum: 0,
        afterScoreSum: 0
      };
    }
    courseWiseComparison[courseKey].officersTrained++;
    courseWiseComparison[courseKey].beforeScoreSum += beforeScore;
    courseWiseComparison[courseKey].afterScoreSum += afterScore;
  });

  const subjectWiseImprovement = Object.values(courseWiseComparison).map(c => {
    const beforeAvg = Math.round(c.beforeScoreSum / c.officersTrained);
    const afterAvg = Math.round(c.afterScoreSum / c.officersTrained);
    const improvementPoints = afterAvg - beforeAvg;
    return {
      courseName: c.courseName,
      competencyName: c.competencyName,
      officersTrained: c.officersTrained,
      beforeAvg,
      afterAvg,
      improvementPoints: improvementPoints >= 0 ? `+${improvementPoints}` : `${improvementPoints}`
    };
  });

  const avgImprovementPoints = allCompletedRecords.length > 0 ? Math.round(totalDeltaPoints / allCompletedRecords.length) : 0;

  const beforeAfterAnalysis = {
    totalEvaluations: allCompletedRecords.length,
    improvedCount,
    sameCount,
    declinedCount,
    avgImprovementPoints: avgImprovementPoints >= 0 ? `+${avgImprovementPoints}` : `${avgImprovementPoints}`,
    subjectBreakdown: subjectWiseImprovement
  };

  // 6. Course & Training Effectiveness
  let courseCatalog = [];
  try {
    courseCatalog = require('./data/courses.json');
  } catch {
    courseCatalog = [];
  }

  const courseEffectiveness = courseCatalog.slice(0, 10).map(course => {
    const completions = allCompletedRecords.filter(r => r.courseId === course.id || r.courseName === course.title);
    const completedCount = completions.length;
    const avgScore = completedCount > 0 ? Math.round(completions.reduce((s, r) => s + (r.quizScore || 0), 0) / completedCount) : 0;
    const enrolledCount = filteredUsers.filter(u => {
      const prof = allProfiles[u.id] || {};
      return prof.jobRole && course.competencyId;
    }).length;

    const completionRate = enrolledCount > 0 ? Math.round((completedCount / enrolledCount) * 100) : 0;

    return {
      courseId: course.id,
      title: course.title,
      provider: course.provider,
      source: course.source,
      competencyName: course.competencyId ? course.competencyId.replace(/_/g, ' ').toUpperCase() : 'GENERAL',
      duration: course.duration,
      enrolledCount: Math.max(completedCount, enrolledCount),
      completedCount,
      completionRate,
      averageScore: avgScore,
      status: completedCount > 0 ? (avgScore >= 70 ? 'High Impact' : 'Needs Reinforcement') : 'Awaiting Enrollments'
    };
  });

  // 7. Dynamic Divisional Breakdown
  const divisionMap = {};
  filteredUsers.forEach(u => {
    const prof = allProfiles[u.id] || {};
    const dept = prof.department || u.department || 'General Statistical Division';
    const deptShort = dept.split('(')[1]?.replace(')', '') || dept.split(',')[0] || dept;

    if (!divisionMap[deptShort]) {
      divisionMap[deptShort] = {
        department: deptShort,
        totalOfficers: 0,
        assessedOfficers: 0,
        readinessSum: 0
      };
    }
    divisionMap[deptShort].totalOfficers++;
    const res = allResults[u.id];
    if (res && res.overallScore !== undefined) {
      divisionMap[deptShort].assessedOfficers++;
      divisionMap[deptShort].readinessSum += res.overallScore;
    }
  });

  const departmentBreakdown = Object.values(divisionMap).map(d => ({
    department: d.department,
    totalOfficers: d.totalOfficers,
    avgReadiness: d.assessedOfficers > 0 ? Math.round(d.readinessSum / d.assessedOfficers) : 0,
    assessedOfficers: d.assessedOfficers
  }));

  // 8. Officer Analytics Roster (Real Data)
  const officerRoster = filteredUsers.map(u => {
    const prof = allProfiles[u.id] || {};
    const res = allResults[u.id];
    const isAssessed = Boolean(res && res.completedAt && res.totalQuestions > 0);
    const userRecords = allProgress[u.id] || [];

    const gaps = [];
    if (isAssessed && res.competencyScores) {
      Object.entries(res.competencyScores).forEach(([cId, val]) => {
        if (val.demonstratedLevel === 'Beginner') {
          gaps.push(cId.replace(/_/g, ' ').toUpperCase());
        }
      });
    }

    const readinessScore = isAssessed ? (res.overallScore || 0) : 0;
    let status = 'Assessment Pending';
    if (isAssessed) {
      if (userRecords.length > 0) status = 'In Training';
      else if (readinessScore >= 70) status = 'Ready';
      else status = 'High Priority Gap';
    }

    return {
      id: u.id,
      name: prof.name || u.name,
      employeeId: prof.employeeId || u.employeeId || `MOSPI-${u.id}`,
      designation: prof.designation || u.designation,
      department: prof.department || u.department,
      currentAssignment: prof.currentAssignment || 'Statistical Administration',
      hasCompletedAssessment: isAssessed,
      readinessScore,
      criticalGap: gaps.length > 0 ? gaps[0] : (isAssessed ? 'None' : 'Pending Diagnosis'),
      coursesCompleted: userRecords.length,
      status
    };
  });

  // Dynamic Strategic Alerts based on real data
  const capacityBuildingAlerts = [];
  if (highPrioritySkillGaps > 0) {
    capacityBuildingAlerts.push({
      id: 1,
      severity: 'HIGH',
      title: `${highPrioritySkillGaps} High-Priority Skill Deficits Detected`,
      detail: `Critical operational deficiencies identified across ${assessedOfficers.length} assessed officers requiring immediate NSSTA training intervention.`
    });
  }
  if (employeesNotAssessed > 0) {
    capacityBuildingAlerts.push({
      id: 2,
      severity: 'MEDIUM',
      title: `${employeesNotAssessed} Officers Awaiting Baseline Assessment`,
      detail: `${Math.round((employeesNotAssessed / totalEmployees) * 100)}% of officers in selected division have not yet completed their initial 25-question competency calibration.`
    });
  }
  if (capacityBuildingAlerts.length === 0) {
    capacityBuildingAlerts.push({
      id: 3,
      severity: 'LOW',
      title: 'Institutional Competency Framework Optimal',
      detail: 'All assessed officers demonstrate aligned baseline competencies with verified training progression.'
    });
  }

  // 9. Send Unified JSON Response
  res.json({
    // Overview (Section 2)
    overview: {
      totalEmployees,
      employeesAssessed,
      employeesNotAssessed,
      coursesRecommended: totalCoursesRecommended,
      coursesStarted: coursesStartedCount,
      coursesCompleted: coursesCompletedCount,
      assessmentsCompleted,
      employeesImproved,
      totalSkillGapsIdentified,
      highPrioritySkillGaps,
      averageReadinessIndex
    },
    // Subject-Wise Competency Analysis (Section 3)
    subjectAnalysis,
    // Before vs After Learning (Section 4)
    beforeAfterAnalysis,
    // Skill Gap Analysis (Section 5)
    skillGapsList,
    // Course Effectiveness (Section 6)
    courseEffectiveness,
    // Officer Roster (Section 7)
    officerRoster,
    // Backward compatibility fields
    totalOfficersProfiled: totalEmployees,
    activeAssessmentsCompleted: assessmentsCompleted,
    averageReadinessIndex,
    competencyDistribution,
    topGaps,
    departmentBreakdown,
    capacityBuildingAlerts
  });
});

// 12b. Read-Only Officer Dossier for Admin Inspection
app.get('/api/admin/officer/:officerId', requireAdmin, async (req, res) => {
  try {
    const { officerId } = req.params;
    const db = readDB();
    const user = (db.users || []).find(u => u.id === officerId || u.employeeId === officerId);
    const profile = (db.officerProfiles && db.officerProfiles[officerId]) || {};
    const assessment = (db.assessmentResults && db.assessmentResults[officerId]) || null;
    const selfRatings = (db.selfAssessments && db.selfAssessments[officerId]) || {};
    const progress = (db.progressRecords && db.progressRecords[officerId]) || [];
    const courseAssessments = (db.courseAssessments && db.courseAssessments[officerId]) || {};

    if (!user && !profile.name) {
      return res.status(404).json({ success: false, message: 'Officer record not found in registry.' });
    }

    // Dynamic skill gap analysis
    const gaps = assessment ? await SkillGapService.analyzeGaps(profile, assessment, db) : [];

    // Course recommendations
    let recommendations = [];
    try {
      recommendations = await CourseRecommendationService.getRecommendations(profile, gaps, db);
    } catch (e) {
      recommendations = [];
    }

    // Before-vs-after improvement delta
    const beforeAfter = progress.map(p => {
      const initComp = assessment?.competencyScores?.[p.competencyId];
      const beforeScore = initComp ? (initComp.score || 0) : (p.beforeLevel === 'Advanced' ? 80 : p.beforeLevel === 'Intermediate' ? 50 : 25);
      const afterScore = p.quizScore || (p.afterLevel === 'Advanced' ? 85 : p.afterLevel === 'Intermediate' ? 65 : 40);
      const delta = afterScore - beforeScore;
      return {
        courseId: p.courseId,
        courseName: p.courseName || p.materialTitle,
        competencyName: p.competencyName,
        beforeScore,
        afterScore,
        improvementPoints: delta >= 0 ? `+${delta} pp` : `${delta} pp`,
        completedAt: p.evaluatedAt || p.completedAt
      };
    });

    res.json({
      success: true,
      officer: {
        id: officerId,
        name: profile.name || user?.name || 'Statistical Officer',
        employeeId: profile.employeeId || user?.employeeId || `MOSPI-${officerId}`,
        designation: profile.designation || user?.designation || 'Statistical Officer',
        department: profile.department || user?.department || 'MoSPI',
        jobRole: profile.jobRole || 'Statistical Officer',
        currentAssignment: profile.currentAssignment || 'Statistical Administration',
        specialization: profile.specialization || profile.relevantDomain || 'General Statistics',
        educationalQualification: profile.educationalQualification || 'M.Sc. Statistics',
        workExperience: profile.workExperience || 'Not specified',
        previousTrainings: profile.previousTrainings || 'Not specified',
        hasCompletedAssessment: Boolean(assessment && assessment.completedAt),
        overallReadinessScore: assessment?.overallScore ?? 0,
        initialAssessment: assessment ? {
          overallScore: assessment.overallScore,
          completedAt: assessment.completedAt,
          totalQuestions: assessment.totalQuestions || 25,
          correctCount: assessment.correctCount || 0,
          competencyScores: assessment.competencyScores || {}
        } : null,
        skillGaps: gaps,
        recommendedCourses: recommendations,
        progressRecords: progress,
        courseAssessments,
        beforeAfter,
        totalCoursesCompleted: progress.length,
        isReadOnly: true
      }
    });
  } catch (err) {
    console.error('Error retrieving admin officer details:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13. Integration Layer Status
app.get('/api/integrations/status', (req, res) => {
  res.json({
    igot: iGOTService.getStatus(),
    nssta: NSSTAService.getStatus(),
    aiProvider: {
      activeEngine: AIProvider.getProviderName(),
      isConfigured: AIProvider.isConfigured(),
      configuredModel: config.OPENAI_MODEL,
      status: AIProvider.isConfigured() ? 'Connected' : 'OPENAI_API_KEY is not configured'
    }
  });
});

// 14. AI Assistant Conversational Chatbox Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, userId, context } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message text is required'
      });
    }

    const result = await AIChatService.handleChat({
      message: message.trim(),
      history: Array.isArray(history) ? history : [],
      userId: userId || 'usr-001',
      clientContext: context || {}
    });

    res.json(result);
  } catch (err) {
    console.error('[API /api/chat] Error:', err.message);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal Server Error'
    });
  }
});

// Dynamic detection of compiled frontend client dist
const candidateDistPaths = [
  path.resolve(__dirname, '../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), 'dist'),
  path.resolve(__dirname, 'dist')
];

let clientDistPath = null;
for (const p of candidateDistPaths) {
  if (fs.existsSync(path.join(p, 'index.html'))) {
    clientDistPath = p;
    break;
  }
}

// API root summary endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: "Samarthya Sankhyiki API Engine",
    healthEndpoint: '/api/health',
    timestamp: new Date().toISOString()
  });
});

if (clientDistPath) {
  console.log(`[Static Serving] Serving production frontend from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // SPA fallback for frontend client-side routes (Profile, Assessment, Admin, etc.)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/course-materials')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  console.log('[Static Serving] No client dist found. Exposing root API landing handler on GET /');
  // Standalone API deployment handler: guarantees GET / never throws "Cannot GET /"
  app.get('/', (req, res) => {
    res.status(200).json({
      status: 'SUCCESS',
      service: "Samarthya Sankhyiki - India's Official Statistical Competency Platform Backend",
      message: 'Backend server is active and running successfully on Render!',
      deployment: {
        environment: process.env.NODE_ENV || 'production',
        port: parseInt(process.env.PORT, 10) || config.PORT || 5000,
        host: '0.0.0.0'
      },
      endpoints: {
        health: '/api/health',
        users: '/api/auth/users',
        login: '/api/auth/login',
        competencies: '/api/competencies',
        adminDashboard: '/api/admin/dashboard'
      },
      timestamp: new Date().toISOString()
    });
  });
}

// Catch-all 404 for unresolved API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON request' });
  }
  console.error('[API Error]:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Start Express server
const PORT = parseInt(process.env.PORT, 10) || config.PORT || 5000;
const HOST = '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
  console.log(`\n======================================================`);
  console.log(`  SAMARTHYA SANKHYIKI - INDIA'S OFFICIAL STATISTICAL`);
  console.log(`  COMPETENCY & LEARNING PLATFORM (SIH 2026)`);
  console.log(`  Backend Server running on http://${HOST}:${PORT}`);
  console.log(`  AI Engine: ${AIProvider.getProviderName()}`);
  console.log(`  iGOT Karmayogi Status: ${iGOTService.getStatus().authStatus}`);
  console.log(`  NSSTA / TPAC Status: ${NSSTAService.getStatus().authStatus}`);
  console.log(`======================================================\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[STARTUP ERROR] Port ${PORT} is already in use by another process.`);
    console.error(`Terminate the process using port ${PORT} or set PORT in .env\n`);
    process.exit(1);
  } else {
    console.error('[Server Error]', err);
  }
});
