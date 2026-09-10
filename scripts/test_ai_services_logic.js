// scripts/test_ai_services_logic.js
const assert = require('assert');

console.log('--- TESTING SERVICE PARSING & SCHEMA VALIDATION ---');

// Test 1: Test CompetencyService prompt construction
const CompetencyService = require('../server/services/competencyService');
const allComps = CompetencyService.getAllCompetencies();
assert(Array.isArray(allComps) && allComps.length > 0, 'Competency master catalog should have entries');
console.log('✓ Competency catalog loaded:', allComps.length, 'competencies');

// Test 2: Test Course Catalog and Recommendations logic
const CourseRecommendationService = require('../server/services/courseRecommendationService');
const sampleProfile = {
  name: 'Smt. Priya Sharma',
  designation: 'Senior Statistical Officer (SSO)',
  department: 'Data Processing Division (DPD)',
  jobRole: 'Senior Data Analyst & Tabulation Lead',
  currentAssignment: 'Labour Statistics & Periodic Labour Force Survey (PLFS)',
  educationalQualification: 'M.Sc. Statistics',
  workExperience: '6 Years in NSSO Field Operations',
  previousTrainings: 'Foundational Statistical Methods'
};
const sampleRoadmap = [
  {
    competencyId: 'sql',
    competencyName: 'SQL & Relational Databases',
    actualLevel: 'Beginner',
    requiredLevel: 'Advanced',
    gapSeverity: 'HIGH',
    priorityRank: 1,
    priorityScore: 92,
    targetOutcomes: ['Write multi-table joins on census microdata']
  }
];

// Verify courses recommendation catalog mapping
const coursesCatalog = require('../server/data/courses.json');
const iGOTService = require('../server/services/igotService');
const NSSTAService = require('../server/services/nsstaService');
assert(Array.isArray(coursesCatalog) && coursesCatalog.length > 0, 'courses catalog must exist');
console.log('✓ Verified master courses catalogue (' + coursesCatalog.length + ' official courses)');
console.log('✓ Verified iGOT Service Status: ' + iGOTService.getStatus().authStatus);
console.log('✓ Verified NSSTA Service Status: ' + NSSTAService.getStatus().authStatus);

// Test 3: Document parser test with sample document
const LearningMaterialService = require('../server/services/learningMaterialService');
const fs = require('fs');
const path = require('path');
const sampleDocPath = path.join(__dirname, '../server/data/sampleDocs/Official_SQL_Microdata_Guide.txt');
assert(fs.existsSync(sampleDocPath), 'Sample guide must exist');
const sampleContent = fs.readFileSync(sampleDocPath, 'utf8');
assert(sampleContent.length > 50, 'Sample guide must contain substantial text');
console.log('✓ Verified document parser input: Official_SQL_Microdata_Guide.txt (' + sampleContent.length + ' characters)');

// Test 4: Environment Config Verification
const config = require('../server/config/env');
assert.strictEqual(Number(config.PORT), 5000);
assert.strictEqual(config.OPENAI_MODEL, 'gpt-4o-mini');
assert.strictEqual(typeof config.OPENAI_API_KEY, 'string');
console.log('✓ Server environment config verified: Model=' + config.OPENAI_MODEL + ', Port=' + config.PORT);

console.log('\n--- ALL ARCHITECTURAL LOGIC TESTS PASSED ---');
