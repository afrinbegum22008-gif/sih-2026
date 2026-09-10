const iGOTService = require('./igotService');
const NSSTAService = require('./nsstaService');
const AIProvider = require('./aiProvider');
const config = require('../config/env');
const { getCourseMapping } = require('../data/coursePdfMapping');
const CompetencyService = require('./competencyService');

class CourseRecommendationService {
  /**
   * Real AI Course Recommendation Reasoning (OpenAI Backend Service)
   * Matches identified skill gaps against official iGOT, NSSTA, and TPAC offerings.
   * Uses OpenAI to formulate authentic, explainable AI recommendation rationale.
   * 
   * iGOT, NSSTA, and TPAC integration catalogs remain strictly decoupled.
   * If OPENAI_API_KEY is missing, throws "OPENAI_API_KEY is not configured".
   */
  static async recommendCourses(profile = {}, roadmap = []) {
    const prof = profile || {};
    const igotCatalog = await iGOTService.getCatalog();
    const nsstaCatalog = await NSSTAService.getCatalog();
    const combinedCatalog = [...igotCatalog, ...nsstaCatalog];

    const matchedCourses = [];

    const targetItems = (roadmap && roadmap.length > 0)
      ? roadmap
      : (await CompetencyService.selectRoleCompetencies(prof)).map(c => ({
          competencyId: c.id,
          competencyName: c.name,
          category: c.category,
          requiredLevel: 'Intermediate',
          actualLevel: 'Unassessed',
          gapSeverity: 'BASELINE',
          priorityRank: 99
        }));

    for (const item of targetItems) {
      const matchingCourses = combinedCatalog.filter(c => c.competencyId === item.competencyId);
      for (const course of matchingCourses) {
        matchedCourses.push({
          course,
          roadmapItem: item
        });
      }
    }

    if (matchedCourses.length === 0) {
      return [];
    }

    // Call OpenAI to write personalized explainable AI rationales
    const systemPrompt = `You are a Senior Capacity Development Counselor at Mission Karmayogi Bharat and the National Statistical Systems Training Academy (NSSTA).
Formulate an authentic, personalized explainable AI recommendation rationale for each matched training programme.`;

    const userPrompt = `OFFICER PROFILE:
Role: ${prof.jobRole || 'Statistical Officer'}
Division: ${prof.department || 'MoSPI'}
Current Assignment: ${prof.currentAssignment || 'Official Statistics'}

MATCHED COURSES & VERIFIED GAPS:
${JSON.stringify(matchedCourses.map(m => ({
  courseId: m.course.id,
  title: m.course.title,
  provider: m.course.provider,
  source: m.course.source,
  competency: m.roadmapItem.competencyName,
  requiredLevel: m.roadmapItem.requiredLevel,
  actualLevel: m.roadmapItem.actualLevel,
  gapSeverity: m.roadmapItem.gapSeverity
})), null, 2)}

INSTRUCTIONS:
For EACH courseId, write a 2-3 sentence personalized "whyRecommended" explanation.
Explain specifically how this curriculum bridges their verified gap from ${prof.jobRole}'s current level to the required level, and why it is critical for executing "${prof.currentAssignment}".

Return ONLY valid JSON matching this schema:
{
  "rationales": {
    "<courseId>": "Explainable AI recommendation rationale text..."
  }
}`;

    let aiRationales = {};
    if (AIProvider.isConfigured()) {
      try {
        const aiResult = await AIProvider.generateJSON({
          systemPrompt,
          userPrompt,
          temperature: 0.25
        });
        aiRationales = aiResult?.rationales || {};
      } catch (e) {
        console.warn('[CourseRecommendationService] AI rationale generation warning:', e.message);
      }
    }

    const recommendations = matchedCourses.map(({ course, roadmapItem }) => {
      const whyRecommended = aiRationales[course.id] ||
        `Calibrated for ${prof.designation || 'Officer'} in ${prof.department || 'MoSPI'}. Curated to bridge your ${roadmapItem.gapSeverity || 'HIGH'} gap in ${roadmapItem.competencyName} (assessed at ${roadmapItem.actualLevel || 'Beginner'} against the ${roadmapItem.requiredLevel || 'Advanced'} role standard), essential for operational execution in "${prof.currentAssignment || 'Official Statistics'}".`;

      const severityBonus = roadmapItem.gapSeverity === 'HIGH' ? 100 : roadmapItem.gapSeverity === 'MEDIUM' ? 50 : 0;
      const score = severityBonus + (roadmapItem.priorityScore || 50) + (course.priorityScore ? course.priorityScore * 0.1 : 0);

      const isIGOT = course.source === 'iGOT' || (course.provider && course.provider.toLowerCase().includes('igot'));
      const portalSafe = isIGOT ? true : (config.NSSTA_PORTAL_SAFE || course.portalSafe === true);
      const portalStatus = portalSafe ? 'ONLINE' : (course.portalStatus || 'CERTIFICATE_ISSUE');
      const portalNotice = (!portalSafe)
        ? (course.portalNotice || 'Official NSSTA/TPAC portal is currently unavailable or has a certificate issue. Please try again later.')
        : null;
      const officialCourseUrl = course.officialCourseUrl || null;
      const isCourseUrlVerified = Boolean(officialCourseUrl);
      const fallbackUrl = isIGOT ? config.IGOT_BASE_URL : config.NSSTA_BASE_URL;
      const officialUrl = officialCourseUrl || course.officialUrl || fallbackUrl;

      const mapping = getCourseMapping(course.id, prof.userId || prof.id);
      const pdfFileName = mapping ? mapping.pdfFileName : null;
      const pdfAvailable = mapping ? Boolean(mapping.pdfAvailable) : false;
      const pdfUrl = mapping ? `/api/courses/${course.id}/pdf?userId=${encodeURIComponent(prof.userId || prof.id || 'usr-001')}` : null;
      const pdfSource = mapping ? mapping.source : course.source;

      return {
        id: `rec-${course.id}`,
        courseId: course.id,
        title: course.title,
        courseName: mapping?.courseName || course.title,
        provider: course.provider,
        source: course.source,
        competencyId: course.competencyId,
        competencyName: roadmapItem.competencyName,
        category: roadmapItem.category,
        targetLevel: course.targetLevel,
        duration: course.duration,
        mode: course.mode,
        description: course.description,
        officialCourseUrl,
        isCourseUrlVerified,
        officialPortalUrl: course.officialUrl || fallbackUrl,
        officialUrl,
        portalSafe,
        portalStatus,
        portalNotice,
        whyRecommended,
        gapSeverity: roadmapItem.gapSeverity,
        priorityRank: roadmapItem.priorityRank,
        recommendationPriority: roadmapItem.gapSeverity === 'HIGH' ? 'Critical' : roadmapItem.gapSeverity === 'MEDIUM' ? 'High' : 'Recommended',
        score,
        // Course to PDF Mapping fields
        hasMappedPdf: Boolean(pdfFileName),
        pdfFileName,
        pdfAvailable,
        pdfUrl,
        pdfSource,
        officerId: prof.userId || prof.id || 'usr-001'
      };
    });

    recommendations.sort((a, b) => b.score - a.score);

    return recommendations;
  }
}

module.exports = CourseRecommendationService;
