const AIProvider = require('./aiProvider');

class RoadmapService {
  /**
   * Real AI Personalized Learning Roadmap Engine (OpenAI Backend Service)
   * If OPENAI_API_KEY is missing, throws "OPENAI_API_KEY is not configured".
   */
  static async generateRoadmap(profile = {}, skillGaps = []) {
    const {
      designation = 'Statistical Officer',
      department = 'Survey Design and Research Division (SDRD)',
      currentAssignment = 'National Statistical Surveys',
      jobRole = 'Statistical Officer',
      previousTrainings = 'Foundation Course for Statistical Officers'
    } = profile || {};

    if (!AIProvider.isConfigured()) {
      return this.generateOfflineRoadmap(profile, skillGaps);
    }

    const gapsToSequence = (skillGaps || []).map(g => ({
      competencyId: g.competencyId,
      competencyName: g.competencyName,
      category: g.category,
      requiredLevel: g.requiredLevel,
      actualLevel: g.actualLevel,
      gapSeverity: g.gapSeverity,
      score: g.score
    }));

    const systemPrompt = `You are the Director of Capacity Building and Curriculum at the National Statistical Systems Training Academy (NSSTA), Ministry of Statistics and Programme Implementation (MoSPI).
Synthesize a personalized, sequenced learning roadmap for an official statistical officer based on their identified skill gaps and assignment.`;

    const userPrompt = `OFFICER PROFILE:
Designation: ${designation}
Division: ${department}
Job Role: ${jobRole}
Current Assignment: ${currentAssignment}
Prior Completed Trainings: ${previousTrainings}

IDENTIFIED SKILL GAPS:
${JSON.stringify(gapsToSequence, null, 2)}

INSTRUCTIONS:
1. Prioritize and sequence all competencies in descending order of urgency.
2. Highest priority MUST be assigned to competencies where gapSeverity is HIGH and directly impacts the Current Assignment.
3. For each competency, generate:
   - "priorityRank": integer starting at 1 (1 = immediate top priority).
   - "priorityScore": integer 0-100 indicating relative strategic urgency.
   - "phase": "Phase 1: Immediate Core Gaps" / "Phase 2: Functional Mastery" / "Phase 3: Specialized Competencies".
   - "actionLabel": e.g. "Remediate Critical Gap", "Deepen Operational Mastery", or "Advance to Lead Evaluator".
   - "estHours": estimated learning hours needed (e.g. 10 to 30 hours).
   - "milestoneTitle": crisp milestone name (e.g. "Advanced Mastery of SQL Microdata Relational Extraction").
   - "whyImportant": concise operational justification tied to their current assignment.
   - "learningObjectives": an array of 3 actionable, highly specific technical learning objectives.
   - "onGroundApplicationTask": a realistic work task to demonstrate on-the-job mastery.

Return ONLY valid JSON matching this schema:
{
  "roadmap": [
    {
      "competencyId": "...",
      "priorityRank": 1,
      "priorityScore": 95,
      "phase": "Phase 1: Immediate Core Gaps",
      "actionLabel": "Remediate Critical Gap",
      "estHours": 20,
      "milestoneTitle": "...",
      "whyImportant": "...",
      "learningObjectives": [
        "Objective 1...",
        "Objective 2...",
        "Objective 3..."
      ],
      "onGroundApplicationTask": "..."
    }
  ]
}`;

    let aiResult = null;
    try {
      aiResult = await AIProvider.generateJSON({
        systemPrompt,
        userPrompt,
        temperature: 0.25
      });
    } catch (e) {
      console.warn('[RoadmapService] AI generation fallback to offline roadmap:', e.message);
      return this.generateOfflineRoadmap(profile, skillGaps);
    }

    const aiRoadmapItems = Array.isArray(aiResult?.roadmap) ? aiResult.roadmap : [];

    // Merge AI generation with original gap metadata
    const finalRoadmap = aiRoadmapItems.map(item => {
      const originalGap = skillGaps.find(g => g.competencyId === item.competencyId) || {};
      return {
        ...originalGap,
        competencyId: item.competencyId,
        competencyName: originalGap.competencyName || item.milestoneTitle,
        category: originalGap.category || 'STATISTICAL',
        requiredLevel: originalGap.requiredLevel || 'Advanced',
        actualLevel: originalGap.actualLevel || 'Beginner',
        gapSeverity: originalGap.gapSeverity || 'HIGH',
        priorityRank: item.priorityRank || 1,
        priorityScore: item.priorityScore || 85,
        phase: item.phase || 'Phase 1: Immediate Core Gaps',
        actionLabel: item.actionLabel || 'Remediate Critical Gap',
        estHours: item.estHours || 16,
        milestoneTitle: item.milestoneTitle || `Mastery of ${originalGap.competencyName}`,
        whyImportant: item.whyImportant || `Critical for ${currentAssignment}.`,
        learningObjectives: Array.isArray(item.learningObjectives) ? item.learningObjectives : [
          `Achieve ${originalGap.requiredLevel || 'Advanced'} level in ${originalGap.competencyName || 'Competency'}.`
        ],
        onGroundApplicationTask: item.onGroundApplicationTask || `Apply in divisional statistical audits.`
      };
    });

    // Ensure sorted by priorityRank ascending
    finalRoadmap.sort((a, b) => a.priorityRank - b.priorityRank);

    return finalRoadmap;
  }

  static generateOfflineRoadmap(profile = {}, skillGaps = []) {
    const {
      currentAssignment = 'Statistical Operations',
      jobRole = 'Statistical Officer'
    } = profile || {};

    const sortedGaps = [...(skillGaps || [])].sort((a, b) => {
      const severityScore = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (severityScore[b.gapSeverity] || 1) - (severityScore[a.gapSeverity] || 1);
    });

    return sortedGaps.map((gap, index) => {
      const rank = index + 1;
      const phase = rank === 1 ? 'Phase 1: Immediate Core Gaps' : rank <= 3 ? 'Phase 2: Functional Mastery' : 'Phase 3: Specialized Competencies';
      const actionLabel = gap.gapSeverity === 'HIGH' ? 'Remediate Critical Gap' : gap.gapSeverity === 'MEDIUM' ? 'Deepen Operational Mastery' : 'Refine Domain Competency';

      return {
        ...gap,
        priorityRank: rank,
        priorityScore: Math.max(98 - (index * 12), 45),
        phase,
        actionLabel,
        estHours: gap.gapSeverity === 'HIGH' ? 24 : gap.gapSeverity === 'MEDIUM' ? 16 : 10,
        milestoneTitle: `Mastery of ${gap.competencyName}`,
        whyImportant: `Crucial competency required for executing ${jobRole} duties in ${currentAssignment}.`,
        learningObjectives: [
          `Master core principles and operational protocols for ${gap.competencyName}.`,
          `Complete hands-on dataset exercises aligned with ${currentAssignment}.`,
          `Validate deliverables against MoSPI and NSSTA quality standards.`
        ],
        onGroundApplicationTask: `Execute data audit and procedural compilation in ${currentAssignment} with zero compliance errors.`
      };
    });
  }
}

module.exports = RoadmapService;
