// Script to verify dynamic competency differentiation across all 5 demo officers
const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET'
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resBody) });
        } catch (e) {
          resolve({ status: res.statusCode, text: resBody });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function verifyDifferentiation() {
  console.log('=== VERIFYING DYNAMIC COMPETENCY SELECTION ACROSS 5 DEMO OFFICERS ===\n');

  const officers = [
    { id: 'usr-001', name: 'Ananya Sharma', role: 'Data/ML Officer', expectedKeyComps: ['ai_ml', 'python', 'sql'] },
    { id: 'usr-002', name: 'Rahul Verma', role: 'Survey Officer', expectedKeyComps: ['survey_design', 'sampling'] },
    { id: 'usr-003', name: 'Priya Nair', role: 'Statistical Analysis Officer', expectedKeyComps: ['statistical_analysis', 'price_statistics'] },
    { id: 'usr-004', name: 'Arjun Reddy', role: 'Technical Officer', expectedKeyComps: ['python', 'sql', 'apis'] },
    { id: 'usr-005', name: 'Sneha Das', role: 'SDG/Data Management Officer', expectedKeyComps: ['sdg_indicators', 'gis'] }
  ];

  const competencySets = {};

  for (const officer of officers) {
    const res = await get(`/api/competencies?userId=${officer.id}`);
    if (res.status !== 200 || !res.data?.selectedCompetencies) {
      throw new Error(`Failed to fetch competencies for ${officer.name} (${officer.id}): Status ${res.status}`);
    }

    const selected = res.data.selectedCompetencies;
    const selectedIds = selected.map(c => c.id);
    competencySets[officer.id] = selectedIds;

    console.log(`Officer: ${officer.name} (${officer.role})`);
    console.log(`Total Competencies Selected: ${selected.length}`);
    console.log(`Competency List: ${selected.map(c => c.name).join(', ')}`);
    console.log(`Key IDs: [${selectedIds.join(', ')}]`);

    // Verify presence of expected key competencies
    for (const exp of officer.expectedKeyComps) {
      if (!selectedIds.includes(exp)) {
        throw new Error(`Expected competency '${exp}' missing for ${officer.name}! Selected: ${selectedIds.join(', ')}`);
      }
    }

    // Verify calibrations exist
    const hasCalibrations = selected.every(c => c.calibrationReason && c.requiredLevel);
    if (!hasCalibrations) {
      throw new Error(`Calibration reason or requiredLevel missing on competencies for ${officer.name}`);
    }

    console.log(`Verified tailored competencies & calibration reasons for ${officer.name} ✅\n`);
  }

  // Cross-check that no two officers have identical competency portfolios
  console.log('--- CHECKING PORTFOLIO UNIQUENESS ---');
  const officerIds = Object.keys(competencySets);
  for (let i = 0; i < officerIds.length; i++) {
    for (let j = i + 1; j < officerIds.length; j++) {
      const id1 = officerIds[i];
      const id2 = officerIds[j];
      const set1 = competencySets[id1].slice().sort().join(',');
      const set2 = competencySets[id2].slice().sort().join(',');
      if (set1 === set2) {
        throw new Error(`CRITICAL: Officer ${id1} and Officer ${id2} received identical competency portfolios!`);
      }
    }
  }

  console.log('All 5 officers have distinct, unique, specialized competency suites! ✅');
  console.log('\n>>> DYNAMIC COMPETENCY PERSONALIZATION FULLY VERIFIED! <<<');
}

verifyDifferentiation().catch(err => {
  console.error('Differentiation verification failed:', err);
  process.exit(1);
});
