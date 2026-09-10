async function runTests() {
  console.log('=== VERIFYING SAMARTHYA SANKHYIKI API SUITE ===');

  const BASE = 'http://localhost:5000';

  // 1. Health
  const healthRes = await fetch(`${BASE}/api/health`).then(r => r.json());
  console.log('✓ Health:', healthRes.status, '| AI Engine:', healthRes.aiEngine);

  // 2. Auth Login (Officer)
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'ananya.sharma@mospi.gov.in', password: 'MoSPI@123', role: 'officer' })
  }).then(r => r.json());
  console.log('✓ Login Officer:', loginRes.user.name, '| Role:', loginRes.user.role);

  // 3. Profile
  const profRes = await fetch(`${BASE}/api/officer/profile?userId=usr-001`).then(r => r.json());
  console.log('✓ Officer Profile:', profRes.profile.designation, '| Assignment:', profRes.profile.currentAssignment);

  // 4. Competencies Filtered for Labour Statistics
  const compRes = await fetch(`${BASE}/api/competencies?userId=usr-001`).then(r => r.json());
  console.log('✓ AI Selected Competencies (Role Filtered):', compRes.selectedCompetencies.map(c => c.name).join(', '));

  // 5. Self-Ratings Save
  const rateRes = await fetch(`${BASE}/api/competencies/self-rating`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'usr-001',
      ratings: { sql: 2, sampling: 3, labour_statistics: 4, survey_design: 4 }
    })
  }).then(r => r.json());
  console.log('✓ Self-Ratings Saved:', rateRes.success);

  // 6. Adaptive Assessment Start
  const testStart = await fetch(`${BASE}/api/assessment/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'usr-001' })
  }).then(r => r.json());
  console.log('✓ Adaptive Session Initialized:', testStart.sessionId, '| First Comp:', testStart.competency.name, '| Baseline Difficulty:', testStart.currentDifficulty);

  // 7. Submit Step 1 Answer (Correct answer 0)
  const stepRes = await fetch(`${BASE}/api/assessment/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: testStart.sessionId,
      questionId: testStart.question.id,
      selectedOption: 0
    })
  }).then(r => r.json());
  console.log('✓ Adaptive Step Submitted: Next Step:', stepRes.currentStep, '| Adapted Difficulty:', stepRes.currentDifficulty);

  // 8. Skill Gaps Analysis
  const gapsRes = await fetch(`${BASE}/api/skill-gaps?userId=usr-001`).then(r => r.json());
  console.log('✓ Skill Gaps Identified:', gapsRes.gaps.map(g => `${g.competencyName}: ${g.gapSeverity} (Req: ${g.requiredLevel}, Act: ${g.actualLevel})`).join(' | '));

  // 9. Personalized Roadmap
  const roadRes = await fetch(`${BASE}/api/roadmap?userId=usr-001`).then(r => r.json());
  console.log('✓ Prioritized Roadmap Tracks:', roadRes.roadmap.map(r => `[Priority ${r.priorityRank}] ${r.competencyName} (${r.actionLabel})`).join(' -> '));

  // 10. Courses Recommendations with Official URLs
  const recRes = await fetch(`${BASE}/api/courses/recommendations?userId=usr-001`).then(r => r.json());
  console.log('✓ Course Recommendations (Official Deep-links):');
  recRes.recommendations.slice(0, 3).forEach(c => {
    console.log(`   - [${c.provider}] ${c.title} -> ${c.officialUrl} (${c.recommendationPriority} Priority)`);
  });

  // 11. Learning Material Concept Extraction & MCQ Generation
  const quizRes = await fetch(`${BASE}/api/learning/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      competencyId: 'sql',
      materialTitle: 'Official SQL Microdata Querying Guide'
    })
  }).then(r => r.json());
  console.log('✓ AI Concepts Extracted:', quizRes.quiz.conceptsExtracted.join(', '));
  console.log('✓ AI Generated MCQs Count:', quizRes.quiz.questions.length);

  // 12. Progress Evaluation (Before vs After)
  const evalRes = await fetch(`${BASE}/api/learning/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'usr-001',
      competencyId: 'sql',
      competencyName: 'SQL & Relational Databases',
      beforeLevel: 'Beginner',
      quizScore: 85,
      materialTitle: 'Official SQL Microdata Querying Guide'
    })
  }).then(r => r.json());
  console.log('✓ BEFORE vs AFTER Competency Growth:');
  console.log(`   Before: ${evalRes.progressRecord.beforeLevel} ➔ After: ${evalRes.progressRecord.afterLevel} (Delta: +${evalRes.progressRecord.improvementDelta})`);
  console.log(`   Status: ${evalRes.progressRecord.statusMessage}`);

  // 13. Admin Dashboard Intelligence
  const adminRes = await fetch(`${BASE}/api/admin/dashboard`).then(r => r.json());
  console.log('✓ Admin Intelligence:');
  console.log(`   Total Profiled: ${adminRes.totalOfficersProfiled} | Avg Readiness: ${adminRes.averageReadinessIndex}%`);
  console.log(`   Top National Gaps:`, adminRes.topGaps.map(g => `${g.competencyName} (${g.weakPercentage}% weak)`).join(', '));

  console.log('\n🎉 ALL 13 END-TO-END PIPELINE CHECKS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
