const { spawn } = require('child_process');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log("Starting backend server for testing...");
  
  const server = spawn('node', ['src/server.js'], { env: process.env, stdio: 'pipe' });
  
  let serverStarted = false;

  server.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`[Server] ${output.trim()}`);
    if (output.includes('Server running on port')) {
      serverStarted = true;
    }
  });

  server.stderr.on('data', (data) => {
    console.error(`[Server Error] ${data.toString().trim()}`);
  });

  // Wait up to 5 seconds for server to start
  for (let i = 0; i < 50; i++) {
    if (serverStarted) break;
    await sleep(100);
  }

  if (!serverStarted) {
    console.error("❌ Server failed to start in time. Check if MongoDB is running and PORT 5000 is available.");
    server.kill();
    process.exit(1);
  }

  console.log("✅ Server started successfully. Running API tests...\n");

  const baseUrl = "http://localhost:5000";
  let token = "";

  try {
    // 1. Health Check
    console.log("--- 1. Testing Health Check ---");
    const healthRes = await fetch(`${baseUrl}/`);
    const healthData = await healthRes.json();
    console.log("Response:", healthData);
    if (healthData.status === "ResumeAI API Running ✅") {
      console.log("✅ Health Check Passed!\n");
    } else {
      throw new Error("Health Check Failed");
    }

    // 2. Signup / Login
    console.log("--- 2. Testing User Signup/Login ---");
    const timestamp = Date.now();
    const testUser = {
      fullName: `TestUser${timestamp}`,
      email: `testuser${timestamp}@gmail.com`,
      password: "password123",
      role: "user"
    };

    const signupRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser)
    });
    
    let signupData;
    try {
      signupData = await signupRes.json();
    } catch(e) {
      signupData = null;
    }
    
    console.log("Signup Response:", signupData);
    if (signupRes.status === 201 || signupRes.status === 200) {
      console.log("✅ Signup Passed!");
    } else {
      console.log("⚠️ Signup didn't return 20x. Might be due to MongoDB not running or validation. Assuming failed.");
    }

    // Login
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });
    
    let loginData;
    try {
      loginData = await loginRes.json();
    } catch(e) {
      loginData = null;
    }
    
    console.log("Login Response:", loginData);
    if (loginRes.status === 200 && loginData && loginData.token) {
      console.log("✅ Login Passed!");
      token = loginData.token;
    } else {
      console.log("❌ Login Failed. Cannot proceed with authenticated routes.");
    }

    // 3. ATS Scoring Engine (if we have token)
    if (token) {
      console.log("\n--- 3. Testing ATS Scoring Endpoint ---");
      const atsRes = await fetch(`${baseUrl}/api/ats/score`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          fileName: "test_resume.pdf",
          extractedText: "Experienced software engineer with skills in JavaScript, Node.js, and React.",
          jobDescription: "Looking for a full stack developer with Node.js and React experience."
        })
      });

      let atsData;
      try {
        atsData = await atsRes.json();
      } catch(e) {
        atsData = null;
      }
      
      console.log("ATS Score Response:", atsData);
      if (atsRes.status === 200) {
        console.log("✅ ATS Scoring Passed!\n");
      } else {
        console.log("❌ ATS Scoring Failed!\n");
      }
    }

  } catch (error) {
    console.error("❌ Test execution error:", error.message);
  } finally {
    console.log("Stopping server...");
    await sleep(1000);
    server.kill();
    process.exit(0);
  }
}

runTests();
