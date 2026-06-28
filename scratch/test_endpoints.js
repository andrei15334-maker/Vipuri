const http = require('http');

function makeRequest(options, postData = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const headers = { ...options.headers };
    if (cookie) {
      headers['Cookie'] = cookie;
    }
    if (postData) {
      headers['Content-Type'] = 'application/json';
    }

    const req = http.request({ ...options, headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log("=== STARTING ADVANCED APPLICATIONS API TESTS ===");

  let cookie = null;
  let appId = null;

  // 1. Submit a pending SMURD app
  try {
    console.log("\n1. Submitting a new SMURD application...");
    const submitRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/applications/submit',
      method: 'POST'
    }, {
      type: 'smurd',
      formData: {
        idJoc: '999',
        varsta: '20',
        oreJucate: '12',
        motiv: 'Deoarece vreau sa fiu medic.',
        cazier: 'NU',
        consecinteCoruptie: 'DA'
      }
    });
    console.log("Submit Response Status:", submitRes.statusCode);
    appId = submitRes.body.application.id;
    console.log("Saved App ID:", appId);
  } catch (err) {
    console.error("Submit Failed:", err.message);
    return;
  }

  // 2. Login as manager_staff
  try {
    console.log("\n2. Logging in as manager_staff...");
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST'
    }, {
      username: 'manager_staff',
      password: 'vipuri2026'
    });
    console.log("Login Response Status:", loginRes.statusCode);
    console.log("Login Response Body:", loginRes.body);
    
    const setCookie = loginRes.headers['set-cookie'];
    if (setCookie && setCookie.length > 0) {
      cookie = setCookie[0];
      console.log("Captured Session Cookie!");
    } else {
      console.error("No Set-Cookie header returned!");
      return;
    }
  } catch (err) {
    console.error("Login Failed:", err.message);
    return;
  }

  // 3. GET /api/admin/applications (with cookie)
  try {
    console.log("\n3. Testing GET /api/admin/applications (Authenticated)...");
    const adminAppsRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/applications',
      method: 'GET'
    }, null, cookie);
    console.log("Admin Apps Status:", adminAppsRes.statusCode);
    console.log("Total Applications Found:", adminAppsRes.body.applications ? adminAppsRes.body.applications.length : 0);
  } catch (err) {
    console.error("Admin Apps Failed:", err.message);
  }

  // 4. POST /api/admin/applications/process (Approve SMURD app)
  try {
    console.log(`\n4. Testing POST /api/admin/applications/process (Approve App ID ${appId})...`);
    const processRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/applications/process',
      method: 'POST'
    }, {
      appId: appId,
      status: 'accepted'
    }, cookie);
    console.log("Process Response Status:", processRes.statusCode);
    console.log("Process Response Body:", processRes.body);
  } catch (err) {
    console.error("Process Failed:", err.message);
  }

  // 5. GET /api/admin/applications/logs (with cookie)
  try {
    console.log("\n5. Testing GET /api/admin/applications/logs...");
    const logsRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/applications/logs',
      method: 'GET'
    }, null, cookie);
    console.log("Logs Status:", logsRes.statusCode);
    console.log("Logs Body:", logsRes.body.logs ? logsRes.body.logs.slice(-2) : []);
  } catch (err) {
    console.error("Logs Failed:", err.message);
  }
}

runTests();
