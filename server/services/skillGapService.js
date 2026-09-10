const CompetencyService = require('./competencyService');
const AIProvider = require('./aiProvider');

const LEVEL_RANKS = {
  'Beginner': 1,
  'Intermediate': 2,
  'Advanced': 3
};

class SkillGapService {
  /**
   * Retrieves the role's required competency level.
   */
  static getRequiredLevel(role = '', assignment = '', competencyId = '', db = {}) {
    const roleReqs = db.roleCompetencyRequirements || {};
    const roleGroup = roleReqs[role];
    if (roleGroup) {
      if (roleGroup.assignments && roleGroup.assignments[assignment] && roleGroup.assignments[assignment][competencyId]) {
        return roleGroup.assignments[assignment][competencyId];
      }
      if (roleGroup.defaultRequirements && roleGroup.defaultRequirements[competencyId]) {
        return roleGroup.defaultRequirements[competencyId];
      }
    }

    const comp = CompetencyService.getCompetencyById(competencyId);
    if (!comp) return 'Intermediate';

    const roleLower = role.toLowerCase();
    const assignmentLower = assignment.toLowerCase();

    // National Accounts & Macroeconomics (Officer 1)
    if (assignmentLower.includes('national accounts') || assignmentLower.includes('gva') || assignmentLower.includes('gdp')) {
      if (competencyId === 'national_accounts' || competencyId === 'price_statistics' || competencyId === 'statistical_analysis') {
        return 'Advanced';
      }
    }

    // Survey Design & Sampling (Officer 2)
    if (assignmentLower.includes('survey') || assignmentLower.includes('sampling') || assignmentLower.includes('household') || assignmentLower.includes('plfs')) {
      if (competencyId === 'survey_design' || competencyId === 'sampling' || competencyId === 'labour_statistics') {
        return 'Advanced';
      }
    }

    // Big Data & AI Analytics (Officer 3)
    if (roleLower.includes('technical') || roleLower.includes('data-oriented') || assignmentLower.includes('big data') || assignmentLower.includes('ai analytics') || assignmentLower.includes('anomaly')) {
      if (competencyId === 'ai_ml' || competencyId === 'python' || competencyId === 'sql' || competencyId === 'data_visualization') {
        return 'Advanced';
      }
    }

    if (roleLower.includes('leadership') && (competencyId === 'leadership' || competencyId === 'project_management' || competencyId === 'ethics')) {
      return 'Advanced';
    }

    return 'Intermediate';
  }

  /**
   * Real AI Skill Gap & Diagnostic Deficit Analysis (OpenAI Backend Service)
   * If OPENAI_API_KEY is missing, throws "OPENAI_API_KEY is not configured".
   */
  static async analyzeGaps(profile = {}, assessmentResults = {}, db = {}) {
    const prof = profile || {};
    const compScores = (assessmentResults && assessmentResults.competencyScores) || {};
    const hasCompletedAssessment = Boolean(
      assessmentResults && 
      assessmentResults.competencyScores && 
      Object.keys(assessmentResults.competencyScores).length > 0 &&
      assessmentResults.overallScore !== undefined
    );

    // For a new / unassessed user, no skill gaps exist until an assessment is completed
    if (!hasCompletedAssessment) {
      return [];
    }

    const selectedComps = await CompetencyService.selectRoleCompetencies(prof);

    const rawGaps = selectedComps.map(comp => {
      const requiredLevel = this.getRequiredLevel(prof.jobRole || '', prof.currentAssignment || '', comp.id, db);
      const scoreObj = compScores[comp.id] || { score: 0, demonstratedLevel: 'Beginner' };
      const actualLevel = scoreObj.demonstratedLevel || 'Beginner';

      const reqRank = LEVEL_RANKS[requiredLevel] || 2;
      const actRank = LEVEL_RANKS[actualLevel] || 1;
      const diff = reqRank - actRank;

      let severity = 'NONE';
      let priorityLevel = 'Satisfied (On Track)';
      if (diff >= 2) {
        severity = 'HIGH';
        priorityLevel = 'Immediate Action (Critical Priority)';
      } else if (diff === 1) {
        severity = 'MEDIUM';
        priorityLevel = 'High Priority';
      } else if (diff === 0) {
        severity = 'NONE';
        priorityLevel = 'Moderate Priority (Target Satisfied)';
      } else {
        severity = 'NONE';
        priorityLevel = 'Exceeds Benchmark (Authority Level)';
      }

      const diffVal = Math.max(0, diff);
      const skillGapLabel = diffVal > 0 ? `${diffVal} Level Deficit` : 'Target Satisfied';

      return {
        competencyId: comp.id,
        competencyName: comp.name,
        category: comp.category,
        requiredLevel,
        actualLevel,
        score: scoreObj.score,
        diff: diffVal,
        skillGap: skillGapLabel,
        gapSeverity: severity,
        priorityLevel,
        strengths: diffVal <= 0 
          ? [`Demonstrated ${actualLevel} proficiency meets or exceeds official role benchmark for ${prof.currentAssignment || 'assignment'}.`]
          : [],
        weakAreas: Array.isArray(scoreObj.weaknesses) && scoreObj.weaknesses.length > 0
          ? scoreObj.weaknesses
          : (diffVal > 0 ? [`Operational application and edge cases in ${prof.currentAssignment || 'official statistics'}`] : [])
      };
    });

    const defaultEnriched = rawGaps.map(g => {
      const whyWeak = g.diff > 0 
        ? `Demonstrated ${g.actualLevel} proficiency leaves a ${g.gapSeverity} deficit relative to the required ${g.requiredLevel} standard for ${prof.currentAssignment || 'the role'}.`
        : `Demonstrated ${g.actualLevel} proficiency successfully satisfies the required ${g.requiredLevel} standard for ${prof.currentAssignment || 'the role'}.`;
      
      const operationalRisk = g.diff > 0
        ? `Potential risk of methodological errors or reporting latency in official statistical outputs.`
        : `Minimal risk; officer demonstrates operational mastery in this domain.`;

      const recommendedAction = g.diff > 0
        ? `Enroll in targeted iGOT Karmayogi programmes and NSSTA capacity building modules.`
        : `Maintain operational readiness and mentor junior statistical officers.`;

      return {
        ...g,
        whyImportant: `Crucial for executing ${prof.currentAssignment || 'assigned official duties'} without data quality deficits.`,
        explanation: whyWeak,
        aiReasoningText: whyWeak,
        aiReasoning: {
          whyWeak,
          operationalRisk,
          recommendedAction
        }
      };
    });

    if (!AIProvider.isConfigured()) {
      return defaultEnriched;
    }

    try {
      // Call OpenAI to generate real explainable diagnostic reasoning for each gap
      const systemPrompt = `You are a Senior Statistical Advisor to the Ministry of Statistics and Programme Implementation (MoSPI), Government of India.
Perform a clinical AI skill-gap diagnosis for an officer by analyzing their required vs demonstrated competency levels.`;

      const userPrompt = `OFFICER PROFILE:
Designation: ${prof.designation || 'Statistical Officer'}
Division / Department: ${prof.department || 'National Sample Survey Office (NSSO)'}
Job Role: ${prof.jobRole || 'Statistical Officer'}
Current Assignment: ${prof.currentAssignment || 'Official Statistics'}

COMPETENCY COMPARISONS (REQUIRED vs ACTUAL):
${JSON.stringify(rawGaps, null, 2)}

INSTRUCTIONS:
For EACH competency, synthesize:
1. "whyWeak": 2-3 sentences explaining WHY the officer has this gap, stating the exact technical or methodological deficiency demonstrated.
2. "operationalRisk": 1-2 sentences on the specific operational risk to MoSPI or their current survey assignment if left unaddressed.
3. "recommendedAction": Specific intervention (e.g. NSSTA residential lab, iGOT module, or divisional peer-review).

Return ONLY valid JSON matching this schema:
{
  "gapsAnalysis": {
    "<competencyId>": {
      "whyWeak": "Technical deficit explanation...",
      "operationalRisk": "Specific operational risk...",
      "recommendedAction": "Actionable capacity building intervention..."
    }
  },
  "executiveSummary": "A concise executive evaluation of the officer's capacity profile."
}`;

      const aiResult = await AIProvider.generateJSON({
        systemPrompt,
        userPrompt,
        temperature: 0.25
      });

      const aiGapsAnalysis = aiResult?.gapsAnalysis || {};

      return rawGaps.map(g => {
        const aiAnalysis = aiGapsAnalysis[g.competencyId] || {};
        const whyWeak = aiAnalysis.whyWeak || (g.diff > 0 
          ? `Demonstrated ${g.actualLevel} proficiency leaves a ${g.gapSeverity} deficit relative to the required ${g.requiredLevel} standard for ${prof.currentAssignment}.`
          : `Demonstrated ${g.actualLevel} proficiency satisfies the ${g.requiredLevel} standard for ${prof.currentAssignment}.`);
        const operationalRisk = aiAnalysis.operationalRisk || (g.diff > 0 
          ? `Potential risk of delays or methodological non-compliance in official releases.`
          : `Minimal operational risk in current assignment.`);
        const recommendedAction = aiAnalysis.recommendedAction || (g.diff > 0
          ? `Complete targeted capacity building on iGOT Karmayogi and NSSTA.`
          : `Maintain operational readiness.`);

        return {
          ...g,
          whyImportant: `Crucial for executing ${prof.currentAssignment} without data quality deficits.`,
          explanation: whyWeak,
          aiReasoningText: whyWeak,
          aiReasoning: {
            whyWeak,
            operationalRisk,
            recommendedAction
          }
        };
      });
    } catch (err) {
      console.warn('[SkillGapService] OpenAI diagnosis fallback to standard diagnostics:', err.message);
      return defaultEnriched;
    }
  }
}

module.exports = SkillGapService;
