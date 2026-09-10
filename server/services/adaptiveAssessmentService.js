const fs = require('fs');
const path = require('path');
const AIProvider = require('./aiProvider');

const questionsPath = path.join(__dirname, '../data/questions.json');
let fallbackQuestions = [];
try {
  fallbackQuestions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
} catch (e) {
  console.warn('[AdaptiveAssessmentService] Could not read questions.json:', e.message);
}

class AdaptiveAssessmentService {
  /**
   * Baseline difficulty is derived from the officer's self-rating for that competency.
   */
  static getInitialDifficulty(selfRating) {
    if (selfRating >= 4) return 3; // Advanced / Level 3
    if (selfRating === 3) return 2; // Operational / Level 2
    return 1; // Foundational / Level 1
  }

  /**
   * Fetches a matching scenario question from the verified question bank.
   */
  static getBankQuestion(compId, difficulty = 2, askedQuestionIds = []) {
    const unasked = fallbackQuestions.filter(q => q.competencyId === compId && !askedQuestionIds.includes(q.id));
    if (unasked.length > 0) {
      const matchDiff = unasked.find(q => q.difficulty === difficulty);
      if (matchDiff) return matchDiff;
      return unasked[0];
    }
    const anyComp = fallbackQuestions.filter(q => q.competencyId === compId);
    if (anyComp.length > 0) return anyComp[0];
    
    // Generic fallback if not in bank
    return {
      id: `fallback-${compId}-diff${difficulty}`,
      competencyId: compId,
      difficulty,
      scenario: `An officer is evaluating statistical protocols and quality frameworks under the Collection of Statistics Act.`,
      question: `Which operational practice best upholds institutional data integrity and standard statistical compliance for ${compId.replace(/_/g, ' ')}?`,
      options: [
        "Applying verified MoSPI NQAF guidelines, reproducible scripts, and dual-entry validation",
        "Informally overriding raw enumeration records without documentation",
        "Discontinuing outlier audits to accelerate publication",
        "Deleting non-conforming sample primary sampling units"
      ],
      correctAnswer: 0,
      explanation: "Official statistical integrity requires strict adherence to standardized quality assurance, reproducibility, and transparent documentation.",
      keyConcept: "Official Statistical Standards & Methodological Integrity"
    };
  }

  /**
   * Adaptive Question Generation (OpenAI with Question Bank Fallback)
   */
  static async generateAdaptiveQuestion({ competency, difficulty = 2, profile = {}, askedQuestionIds = [] }) {
    const compId = competency?.id || 'sampling';
    const compName = competency?.name || 'Statistical Competency';
    const compCategory = competency?.category || 'STATISTICAL';
    const role = profile?.jobRole || 'Statistical Officer';
    const assignment = profile?.currentAssignment || 'National Statistical Surveys';
    const dept = profile?.department || 'Survey Design and Research Division (SDRD)';

    if (!AIProvider.isConfigured()) {
      return this.getBankQuestion(compId, difficulty, askedQuestionIds);
    }

    try {
      const diffLabel = difficulty === 3
        ? 'Level 3: Advanced / Specialized Analytical Decision-Making'
        : difficulty === 2
        ? 'Level 2: Intermediate / Operational Methodology Execution'
        : 'Level 1: Foundational / Basic Principles & Standards';

      const systemPrompt = `You are a Senior Statistical Officer and psychometrician in India's National Statistical Systems Training Academy (NSSTA), Ministry of Statistics and Programme Implementation (MoSPI).
Generate an authentic, scenario-based multiple-choice question testing the following competency:
- Competency: ${compName} (Category: ${compCategory})
- Target Difficulty Level: Level ${difficulty} of 3 (${diffLabel})
- Target Officer Role: ${role}
- Official Assignment: ${assignment}
- Department / Division: ${dept}`;

      const userPrompt = `Generate a new Level ${difficulty} scenario question testing "${compName}" for ${role} working on "${assignment}".`;

      const aiResult = await AIProvider.generateJSON({
        systemPrompt,
        userPrompt,
        temperature: 0.35,
        maxTokens: 1200
      });

      if (!aiResult?.question || !Array.isArray(aiResult?.options) || aiResult.options.length !== 4 || typeof aiResult?.correctAnswer !== 'number') {
        return this.getBankQuestion(compId, difficulty, askedQuestionIds);
      }

      return {
        id: `dyn-ai-${compId}-lvl${difficulty}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        competencyId: compId,
        difficulty,
        scenario: aiResult.scenario || `Operational scenario in ${assignment}.`,
        question: aiResult.question,
        options: aiResult.options,
        correctAnswer: aiResult.correctAnswer,
        explanation: aiResult.explanation || 'Evaluated against MoSPI statistical standards.',
        keyConcept: aiResult.keyConcept || compName
      };
    } catch (err) {
      console.warn('[AdaptiveAssessmentService] OpenAI question generation fallback:', err.message);
      return this.getBankQuestion(compId, difficulty, askedQuestionIds);
    }
  }

  /**
   * Adapts next difficulty step:
   * Correct -> advance difficulty (max 3)
   * Incorrect -> decrease difficulty (min 1)
   */
  static evaluateStep({ currentDifficulty = 2, isCorrect = false }) {
    if (isCorrect) {
      return Math.min(3, currentDifficulty + 1);
    } else {
      return Math.max(1, currentDifficulty - 1);
    }
  }

  /**
   * Offline Psychometric Trajectory Scoring
   * Evaluates performance across the 5 subject-specific questions.
   */
  static calculateDemonstratedCompetencyOffline(competencyId, attempts = [], selfRating = 3) {
    const compAttempts = attempts.filter(a => a.competencyId === competencyId);
    if (compAttempts.length === 0) {
      const defaultLevel = selfRating >= 4 ? 'Advanced' : selfRating === 3 ? 'Intermediate' : 'Beginner';
      return {
        score: selfRating >= 4 ? 80 : selfRating === 3 ? 60 : 40,
        correctCount: selfRating >= 4 ? 4 : selfRating === 3 ? 3 : 2,
        totalQuestions: 5,
        subjectScoreText: `${selfRating >= 4 ? 4 : selfRating === 3 ? 3 : 2} / 5`,
        demonstratedLevel: defaultLevel,
        explanation: 'Calibrated based on baseline self-rating and institutional assessment standard.',
        strengths: ['Basic operational familiarity'],
        weaknesses: ['Demonstrated assessment pending']
      };
    }

    const totalQuestions = compAttempts.length;
    const correctCount = compAttempts.filter(a => a.isCorrect).length;
    const maxDiff = Math.max(...compAttempts.map(a => a.difficulty));
    const score = Math.round((correctCount / totalQuestions) * 100);

    // Strict 5-question psychometric cutoff:
    // 4-5 correct -> Advanced (Mastery)
    // 2-3 correct -> Intermediate (Operational)
    // 0-1 correct -> Beginner (Foundational deficit)
    let demonstratedLevel = 'Beginner';
    if (correctCount >= 4) {
      demonstratedLevel = 'Advanced';
    } else if (correctCount >= 2) {
      demonstratedLevel = 'Intermediate';
    } else {
      demonstratedLevel = 'Beginner';
    }

    return {
      score,
      correctCount,
      totalQuestions,
      subjectScoreText: `${correctCount} / ${totalQuestions}`,
      demonstratedLevel,
      explanation: `Officer answered ${correctCount} of ${totalQuestions} questions correctly (${score}%), demonstrating ${demonstratedLevel.toLowerCase()} operational capability across tested scenarios.`,
      strengths: correctCount >= 3
        ? [`Demonstrated analytical accuracy in ${competencyId.replace(/_/g, ' ')} up to Level ${maxDiff}`]
        : [`Completed baseline scenario questions in ${competencyId.replace(/_/g, ' ')}`],
      weaknesses: demonstratedLevel === 'Beginner'
        ? ['Foundational concepts and standard statutory workflows require immediate remediation']
        : demonstratedLevel === 'Intermediate'
        ? ['Advanced methodological nuances and edge-case execution require reinforcement']
        : []
    };
  }

  /**
   * Psychometric Competency Calculation
   */
  static async calculateDemonstratedCompetency(competencyId, attempts = [], selfRating = 3) {
    const compAttempts = attempts.filter(a => a.competencyId === competencyId);
    const offlineResult = this.calculateDemonstratedCompetencyOffline(competencyId, attempts, selfRating);

    if (!AIProvider.isConfigured() || compAttempts.length === 0) {
      return offlineResult;
    }

    try {
      const systemPrompt = `You are the Chief Psychometric Evaluator at the National Statistical Systems Training Academy (NSSTA).
Analyze an officer's live examination responses for a specific competency (${compAttempts.length} questions total) and determine their verified demonstrated level and score out of 5.`;

      const userPrompt = `COMPETENCY ID: ${competencyId}
OFFICER SELF-RATING (1-5 Stars): ${selfRating} / 5
ATTEMPTS RECORDED (${compAttempts.length} questions):
${JSON.stringify(compAttempts.map(a => ({
  difficulty: a.difficulty,
  isCorrect: a.isCorrect,
  timeSpentSeconds: a.timeSpentSeconds
})), null, 2)}`;

      const aiResult = await AIProvider.generateJSON({
        systemPrompt,
        userPrompt,
        temperature: 0.2
      });

      const demonstratedLevel = ['Beginner', 'Intermediate', 'Advanced'].includes(aiResult?.demonstratedLevel)
        ? aiResult.demonstratedLevel
        : offlineResult.demonstratedLevel;

      return {
        ...offlineResult,
        score: typeof aiResult?.score === 'number' ? aiResult.score : offlineResult.score,
        demonstratedLevel,
        explanation: aiResult?.explanation || offlineResult.explanation,
        strengths: Array.isArray(aiResult?.strengths) && aiResult.strengths.length > 0 ? aiResult.strengths : offlineResult.strengths,
        weaknesses: Array.isArray(aiResult?.weaknesses) && aiResult.weaknesses.length > 0 ? aiResult.weaknesses : offlineResult.weaknesses
      };
    } catch (err) {
      console.warn('[AdaptiveAssessmentService] OpenAI scoring fallback:', err.message);
      return offlineResult;
    }
  }
}

module.exports = AdaptiveAssessmentService;
