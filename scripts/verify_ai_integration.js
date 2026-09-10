// scripts/verify_ai_integration.js
const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', reject);
  });
}

function post(path, body) {
  return new Promise((resolve, reject) => {
    const dataStr = JSON.stringify(body);
    const req = http.request(`http://localhost:5000${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataStr)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.write(dataStr);
    req.end();
  });
}

async function runTests() {
  console.log('--- RUNNING SAMARTHYA SANKHYIKI API VERIFICATION ---');

  // Test 1: Health
  const health = await get('/api/health');
  console.log('\n[1] GET /api/health:');
  console.log(`    Status: ${health.status}`);
  console.log(`    aiEngine: ${health.body?.aiEngine}`);
  console.log(`    aiStatus: ${health.body?.aiStatus}`);
  console.log(`    isConfigured: ${health.body?.isConfigured}`);

  // Test 2: Integrations Status
  const integrations = await get('/api/integrations/status');
  console.log('\n[2] GET /api/integrations/status:');
  console.log(`    Status: ${integrations.status}`);
  console.log(`    AI Provider Status: ${integrations.body?.aiProvider?.status}`);
  console.log(`    iGOT Mode: ${integrations.body?.igot?.mode}`);
  console.log(`    NSSTA Mode: ${integrations.body?.nssta?.mode}`);

  // Test 3: Officer Profile (Non-AI, should work)
  const profile = await get('/api/officer/profile?userId=usr-001');
  console.log('\n[3] GET /api/officer/profile:');
  console.log(`    Status: ${profile.status}`);
  console.log(`    Officer Name: ${profile.body?.profile?.name}`);
  console.log(`    Current Assignment: ${profile.body?.profile?.currentAssignment}`);

  // Test 4: Competencies with unconfigured OpenAI (must return 503 and exact error message)
  const comp = await get('/api/competencies?userId=usr-001');
  console.log('\n[4] GET /api/competencies (Unconfigured Key Test):');
  console.log(`    Status: ${comp.status}`);
  console.log(`    error: ${comp.body?.error}`);
  console.log(`    Does it return fake AI questions/data? ${comp.body?.selectedCompetencies?.length > 0 ? 'YES (FAIL)' : 'NO (CORRECT)'}`);

  // Test 5: Assessment Start (Unconfigured Key Test)
  const assess = await post('/api/assessment/start', { userId: 'usr-001' });
  console.log('\n[5] POST /api/assessment/start (Unconfigured Key Test):');
  console.log(`    Status: ${assess.status}`);
  console.log(`    error: ${assess.body?.error}`);
  console.log(`    Does it return fake hardcoded questions? ${assess.body?.question ? 'YES (FAIL)' : 'NO (CORRECT)'}`);

  // Test 6: Roadmap (Unconfigured Key Test)
  const roadmap = await get('/api/roadmap?userId=usr-001');
  console.log('\n[6] GET /api/roadmap (Unconfigured Key Test):');
  console.log(`    Status: ${roadmap.status}`);
  console.log(`    error: ${roadmap.body?.error}`);

  // Test 7: Course Recommendations (Unconfigured Key Test)
  const courses = await get('/api/courses/recommendations?userId=usr-001');
  console.log('\n[7] GET /api/courses/recommendations (Unconfigured Key Test):');
  console.log(`    Status: ${courses.status}`);
  console.log(`    error: ${courses.body?.error}`);

  console.log('\n--- VERIFICATION FINISHED ---');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
