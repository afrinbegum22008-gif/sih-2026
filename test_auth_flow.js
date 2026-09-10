// Test script to verify authentication endpoints, validations, and 6 demo accounts
const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
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
    req.write(data);
    req.end();
  });
}

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

async function runTests() {
  console.log('--- STARTING AUTHENTICATION VERIFICATION TESTS ---');

  // Test 1: Empty identifier or password
  const emptyRes = await post('/api/auth/login', { identifier: '', password: '' });
  console.log('Test 1 (Empty fields): Status', emptyRes.status, 'Response:', emptyRes.data);
  if (emptyRes.status !== 400) throw new Error('Expected 400 for empty fields');

  // Test 2: Non-existent user
  const unknownRes = await post('/api/auth/login', { identifier: 'unknown.user@mospi.gov.in', password: 'SomePassword123' });
  console.log('Test 2 (Unknown user): Status', unknownRes.status, 'Response:', unknownRes.data);
  if (unknownRes.status !== 401) throw new Error('Expected 401 for unknown user');

  // Test 3: Incorrect password
  const wrongPassRes = await post('/api/auth/login', { identifier: 'ananya.sharma@mospi.gov.in', password: 'WrongPassword123' });
  console.log('Test 3 (Wrong password): Status', wrongPassRes.status, 'Response:', wrongPassRes.data);
  if (wrongPassRes.status !== 401) throw new Error('Expected 401 for wrong password');

  // Test 4: Admin login
  const adminRes = await post('/api/auth/login', { identifier: 'admin@mospi.gov.in', password: 'Admin@123' });
  console.log('Test 4 (Admin login): Status', adminRes.status, 'User Role:', adminRes.data?.user?.role);
  if (adminRes.status !== 200 || adminRes.data?.user?.role !== 'admin') throw new Error('Admin login failed');

  // Test 5: 5 Employee accounts
  const employees = [
    { email: 'ananya.sharma@mospi.gov.in', name: 'Ananya Sharma' },
    { email: 'rahul.verma@mospi.gov.in', name: 'Rahul Verma' },
    { email: 'priya.nair@mospi.gov.in', name: 'Priya Nair' },
    { email: 'arjun.reddy@mospi.gov.in', name: 'Arjun Reddy' },
    { email: 'sneha.das@mospi.gov.in', name: 'Sneha Das' }
  ];

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    const empRes = await post('/api/auth/login', { identifier: emp.email, password: 'MoSPI@123' });
    console.log(`Test 5.${i + 1} (Employee ${emp.name}): Status`, empRes.status, 'Role:', empRes.data?.user?.role);
    if (empRes.status !== 200 || empRes.data?.user?.role !== 'officer') {
      throw new Error(`Employee login failed for ${emp.email}`);
    }
  }

  // Test 6: Verify /api/auth/users strips passwords and returns exactly 6 accounts
  const usersRes = await get('/api/auth/users');
  console.log('Test 6 (Users endpoint): Total users:', usersRes.data?.users?.length);
  const hasPassword = usersRes.data?.users?.some(u => u.password !== undefined);
  if (hasPassword) throw new Error('Passwords exposed in /api/auth/users!');
  if (usersRes.data?.users?.length !== 6) throw new Error(`Expected 6 demo accounts, got ${usersRes.data?.users?.length}`);

  // Test 7: Email normalization edge cases (casing, whitespace, prefix)
  console.log('--- TESTING NORMALIZATION & CASE-TOLERANCE ---');
  const upperRes = await post('/api/auth/login', { identifier: 'ANANYA.SHARMA@MOSPI.GOV.IN', password: 'MoSPI@123' });
  console.log('Test 7.1 (Uppercase email): Status', upperRes.status, 'User:', upperRes.data?.user?.name);
  if (upperRes.status !== 200 || upperRes.data?.user?.id !== 'usr-001') throw new Error('Uppercase email login failed');

  const spaceRes = await post('/api/auth/login', { identifier: '  rahul.verma@mospi.gov.in  ', password: 'MoSPI@123' });
  console.log('Test 7.2 (Whitespace padded email): Status', spaceRes.status, 'User:', spaceRes.data?.user?.name);
  if (spaceRes.status !== 200 || spaceRes.data?.user?.id !== 'usr-002') throw new Error('Padded email login failed');

  const prefixRes = await post('/api/auth/login', { identifier: 'priya.nair', password: 'MoSPI@123' });
  console.log('Test 7.3 (Prefix without domain): Status', prefixRes.status, 'User:', prefixRes.data?.user?.name);
  if (prefixRes.status !== 200 || prefixRes.data?.user?.id !== 'usr-003') throw new Error('Prefix login failed');

  const casePassRes = await post('/api/auth/login', { identifier: 'arjun.reddy@mospi.gov.in', password: 'mospi@123' });
  console.log('Test 7.4 (Case-tolerant password "mospi@123"): Status', casePassRes.status, 'User:', casePassRes.data?.user?.name);
  if (casePassRes.status !== 200 || casePassRes.data?.user?.id !== 'usr-004') throw new Error('Case-tolerant password login failed');

  const adminLowerRes = await post('/api/auth/login', { identifier: 'admin@mospi.gov.in', password: 'admin@123' });
  console.log('Test 7.5 (Admin case-tolerant password "admin@123"): Status', adminLowerRes.status, 'Role:', adminLowerRes.data?.user?.role);
  if (adminLowerRes.status !== 200 || adminLowerRes.data?.user?.role !== 'admin') throw new Error('Admin case-tolerant login failed');

  // Test 8: Officer profile loading verification for all 5 officers
  console.log('--- TESTING PROFILE LOADING FOR ALL 5 OFFICERS ---');
  for (let i = 0; i < employees.length; i++) {
    const userId = `usr-00${i + 1}`;
    const profRes = await get(`/api/officer/profile?userId=${userId}`);
    const prof = profRes.data?.profile;
    console.log(`Test 8.${i + 1} (${employees[i].name} Profile): Designation: "${prof?.designation}", Assignment: "${prof?.currentAssignment}"`);
    if (!prof || prof.name !== employees[i].name) {
      throw new Error(`Profile name mismatch for ${userId}`);
    }
  }

  console.log('\n>>> ALL AUTHENTICATION & NORMALIZATION TESTS PASSED SUCCESSFULLY! <<<');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
