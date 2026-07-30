const request = require("supertest");
const { app } = require("../src/server");

// Tests will use the Supabase client implicitly without needing a persistent open/close hook

jest.setTimeout(15000);

describe("ResumeAI Backend API Tests", () => {
  
  describe("Health Check API", () => {
    it("should return 200 and API Running status", async () => {
      const res = await request(app).get("/");
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("ResumeAI API Running ✅");
    });
  });

  describe("Authentication API", () => {
    const timestamp = Date.now();
    const testUser = {
      fullName: `JestTestUser${timestamp}`,
      email: `jesttestuser${timestamp}@gmail.com`,
      password: "password123",
      role: "user"
    };

    let token = "";

    it("should signup a new user", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send(testUser);
      
      // Allow 201 Created or 400 if user already exists
      expect([201, 400]).toContain(res.statusCode);
    });

    it("should login the user and return a token", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("token");
      token = res.body.token;
    });

    it("should fail ATS scoring without token", async () => {
      const res = await request(app)
        .post("/api/ats/score")
        .send({
          fileName: "test.pdf",
          extractedText: "Some text"
        });
      expect(res.statusCode).toEqual(401);
    });

    it("should successfully score ATS with token", async () => {
      if (!token) {
        console.warn("Skipping ATS test because token is missing.");
        return;
      }
      
      const res = await request(app)
        .post("/api/ats/score")
        .set("Authorization", `Bearer ${token}`)
        .send({
          fileName: "test_resume.pdf",
          extractedText: "Experienced software engineer with Node.js and React",
          jobDescription: "Looking for Node.js developer"
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("message", "ATS Analysis Completed");
      expect(res.body.resume).toBeDefined();
    });
  });

});
