const express        = require("express");
const cors           = require("cors");
const path           = require("path");
const helmet         = require("helmet");
const rateLimit      = require("express-rate-limit");
const cookieParser   = require("cookie-parser");
const sanitizeInputs = require("./middleware/sanitizeMiddleware");
require("dotenv").config();

const app = express();

/* ── SECURITY HEADERS (Helmet) ──────────────────
   Sets 11 HTTP security headers automatically:
   X-Content-Type-Options, X-Frame-Options,
   Strict-Transport-Security, etc.
─────────────────────────────────────────────── */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    frameguard: false,
    contentSecurityPolicy: false,
  })
);

/* ── CORS ───────────────────────────────────────
   Restrict to known frontend origin(s) only.
   Set ALLOWED_ORIGINS in .env for production.
─────────────────────────────────────────────── */
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server (e.g. Postman, Mobile native HTTP, Jest tests) — no Origin header
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // In development mode, allow localhost ports (Expo 8081, 19006, 8082, etc.) & local IP ranges
      if (
        process.env.NODE_ENV !== "production" ||
        /^http:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin) ||
        origin.startsWith("exp://")
      ) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin '${origin}' is not allowed`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

/* ── RATE LIMITING ──────────────────────────────
   Auth endpoints: max 10 requests per IP per
   15 minutes — prevents brute-force attacks.
─────────────────────────────────────────────── */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 failed attempts per window
  skipSuccessfulRequests: true, // Only count FAILED attempts — successful logins are never restricted
  skip: () => process.env.NODE_ENV !== "production", // Disabled during local development
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many failed attempts from this IP. Please try again after 15 minutes.",
  },
});

/* ── BODY PARSING (with size limit) ─────────────
   50 KB max JSON body — prevents payload DoS.
─────────────────────────────────────────────── */
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));
app.use(cookieParser()); // Parse httpOnly cookies on every request

/* ── INPUT SANITIZATION ─────────────────────────
   Runs on every request after body is parsed.
   Trims strings, strips HTML tags & JS URIs,
   caps each field at 10,000 characters.
─────────────────────────────────────────────── */
app.use(sanitizeInputs);

// Serve compiled PDFs as static files with iframe & CORS headers
app.use(
  "/uploads",
  (req, res, next) => {
    res.removeHeader("X-Frame-Options");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Content-Security-Policy", "frame-ancestors *");
    next();
  },
  express.static(path.join(__dirname, "../uploads"))
);

/* ── ROUTES ─────────────────────────────────────
   Auth routes get rate-limited individually.
─────────────────────────────────────────────── */
app.use("/api/auth",        authLimiter, require("./routes/authRoutes"));
app.use("/api/user",        require("./routes/userRoutes"));
app.use("/api/recruiter",   require("./routes/recruiterRoutes"));
app.use("/api/admin",       require("./routes/adminRoutes"));
app.use("/api/resumes",     require("./routes/resumeRoutes"));
app.use("/api/ats",         require("./routes/atsRoutes"));
app.use("/api/suggestions", require("./routes/suggestionRoutes"));
app.use("/api/dashboard",   require("./routes/dashboardRoutes"));
app.use("/api/editor",      require("./routes/editorRoutes"));

// Health check
app.get("/", (req, res) =>
  res.json({ status: "ResumeAI API Running ✅", version: "3.0", db: "Supabase" })
);

/* ── GLOBAL ERROR HANDLER ───────────────────────
   Catches unhandled errors (e.g. CORS rejection,
   payload too large) without leaking stack traces.
─────────────────────────────────────────────── */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[server] unhandled error:", err.message);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: err.message || "An internal error occurred" });
});

/* ── START SERVER ───────────────────────────── */
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT} | DB: Supabase PostgreSQL`);

    // ── Verify required custom tables exist ─────────────────────────────────
    try {
      const supabase = require("./config/supabase");
      const { error } = await supabase.from("password_reset_otps").select("id").limit(1);
      if (error && (error.code === "42P01" || error.code === "PGRST205")) {
        console.warn("════════════════════════════════════════════════════════════");
        console.warn("⚠️  MISSING SUPABASE TABLE: password_reset_otps");
        console.warn("   ℹ️  In-Memory OTP Store ACTIVE: Forgot Password OTP WILL WORK in dev mode & E2E tests!");
        console.warn("   ➡  To enable persistent database storage, run backend/scripts/01_create_password_reset_otps.sql");
        console.warn("      in your Supabase SQL Editor: https://supabase.com/dashboard/project/radzlfnsqkhfpasdptde/sql/new");
        console.warn("════════════════════════════════════════════════════════════");
      } else {
        console.log("✅ password_reset_otps table: OK");
      }
    } catch (e) {
      console.warn("⚠️  Could not verify password_reset_otps table:", e.message);
    }
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} is already in use! Another server instance is already running.`);
    } else {
      console.error("[server] error:", err);
    }
  });
}

module.exports = { app };