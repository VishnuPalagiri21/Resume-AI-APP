import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const TESTIMONIALS = [
  {
    quote: "The resume optimization is structured perfectly. The ATS score analysis and missing skill recommendations helped me land 4 interviews in two weeks.",
    author: "Rahul Mehta",
    role: "JOB SEEKER",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  },
  {
    quote: "Assessment variety is impressive — from resume tailoring to AI bullet rewrites. The real-time feedback helped me prepare for campus placements effectively.",
    author: "Ananya Singh",
    role: "SOFTWARE ENGINEER",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
  },
  {
    quote: "The LaTeX editor and AI keyword matching are a game changer. I transformed my generic resume into a highly targeted application in under 10 minutes.",
    author: "Vikram Sharma",
    role: "PRODUCT MANAGER",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
  },
];

export default function LandingPage() {
  const [mode, setMode]               = useState("login");
  const [form, setForm]               = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [unlocked, setUnlocked]       = useState(false);
  const [rememberMe, setRememberMe]   = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const { login, signup, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    setForm({ fullName: "", email: "", password: "" });
    setUnlocked(false);
    if (user && user.role === "user") {
      navigate("/dashboard/user", { replace: true });
    }
  }, [user, navigate]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const unlockInputs = () => {
    if (!unlocked) setUnlocked(true);
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await loginWithGoogle("user");
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("provider is not enabled") || msg.includes("validation_failed")) {
        setError("⚠️ Google Authentication is disabled in your Supabase Dashboard. Enable Google under Authentication -> Providers.");
      } else {
        setError(msg || "Failed to initialize Google login.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password, "user");
        navigate("/dashboard/user");
      } else {
        await signup({ ...form, role: "user" });
        setMode("login");
        setError("✅ Account created! Please sign in.");
        setForm({ fullName: "", email: "", password: "" });
        setUnlocked(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevTestimonial = () => {
    setActiveTestimonial((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const handleNextTestimonial = () => {
    setActiveTestimonial((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="split-page page-enter">
      {/* ── LEFT PANEL: Dark Editorial & Testimonials (58% width) ───────────────── */}
      <div className="split-left">
        <div>
          {/* Header Badge */}
          <div style={styles.leftTopBadge}>
            <span style={{ fontWeight: 700, color: "#14b8a6", letterSpacing: "0.1em" }}>01</span>
            <span style={{ height: 1, width: 32, background: "rgba(255,255,255,0.2)", display: "inline-block" }}></span>
            <span style={{ textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>
              JOB SEEKER PORTAL
            </span>
          </div>

          {/* Editorial Headline */}
          <h1 style={styles.leftTitle}>
            Where resumes <br />
            become <span className="serif-font" style={{ color: "#2dd4bf", fontStyle: "italic", fontWeight: 400 }}>interviews.</span>
          </h1>

          {/* Subtitle */}
          <p style={styles.leftSub}>
            Stop getting filtered out by Applicant Tracking Systems. Harness Google Gemini AI to analyze job descriptions, pinpoint missing skills, auto-tailor LaTeX resumes, and skyrocket your ATS score to land top-tier tech roles.
          </p>

          {/* Workspace Status Indicator */}
          <div style={styles.connectedTag}>
            <span className="ai-dot" style={{ background: "#2dd4bf", marginRight: 8 }}></span>
            <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Connected to </span>
            <span style={{ color: "#2dd4bf", fontSize: "0.85rem", fontWeight: 600 }}>resumeai workspace</span>
          </div>

          {/* Feature Highlights Grid filling vertical space */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginTop: "24px" }}>
            <div style={styles.featureGridCard}>
              <div style={{ fontSize: "1.2rem", marginBottom: "6px" }}>⚡</div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#f8fafc", marginBottom: "4px" }}>Gemini 1.5 AI Matching</div>
              <div style={{ fontSize: "0.78rem", color: "#94a3b8", lineHeight: 1.4 }}>Semantic resume optimization tailored to job descriptions.</div>
            </div>

            <div style={styles.featureGridCard}>
              <div style={{ fontSize: "1.2rem", marginBottom: "6px" }}>📄</div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#f8fafc", marginBottom: "4px" }}>Monaco LaTeX Editor</div>
              <div style={{ fontSize: "0.78rem", color: "#94a3b8", lineHeight: 1.4 }}>Live PDF compilation, version snapshots & clean templates.</div>
            </div>

            <div style={styles.featureGridCard}>
              <div style={{ fontSize: "1.2rem", marginBottom: "6px" }}>🎯</div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#f8fafc", marginBottom: "4px" }}>Precision ATS Scoring</div>
              <div style={{ fontSize: "0.78rem", color: "#94a3b8", lineHeight: 1.4 }}>Missing keyword detection and actionable impact metrics.</div>
            </div>
          </div>
        </div>

        {/* Testimonials Slider */}
        <div style={styles.testimonialsWrapper}>
          <div style={styles.testimonialHeader}>
            <span style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.15em", color: "#64748b", textTransform: "uppercase" }}>
              WHAT CANDIDATES SAY &nbsp;&nbsp;<span style={{ color: "#94a3b8" }}>0{activeTestimonial + 1} / 0{TESTIMONIALS.length}</span>
            </span>

            <div style={{ display: "flex", gap: "8px" }}>
              <button style={styles.arrowBtn} onClick={handlePrevTestimonial} aria-label="Previous Testimonial">
                ‹
              </button>
              <button style={styles.arrowBtn} onClick={handleNextTestimonial} aria-label="Next Testimonial">
                ›
              </button>
            </div>
          </div>

          {/* Testimonial Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
            {[TESTIMONIALS[activeTestimonial], TESTIMONIALS[(activeTestimonial + 1) % TESTIMONIALS.length]].map((item, idx) => (
              <div key={idx} style={styles.testimonialCard}>
                <div style={{ color: "#2dd4bf", fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px" }}>”</div>
                <p style={styles.quoteText}>{item.quote}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "16px" }}>
                  <img src={item.avatar} alt={item.author} style={styles.avatarImg} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#f8fafc" }}>{item.author}</div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", letterSpacing: "0.08em", fontWeight: 700 }}>{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Clean Auth Card (42% width) ────────────────────────── */}
      <div className="split-right">
        <div style={styles.rightContent}>
          {/* Logo Header */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={styles.logoBadge}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#0d9488" stroke="#0f766e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: "1.4rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>RESUMEAI</span>
            </div>

            <div style={styles.signInPill}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0d9488", display: "inline-block" }}></span>
              CANDIDATE SIGN-IN
            </div>

            <h2 style={styles.welcomeTitle}>
              Welcome <span className="serif-font" style={{ color: "#0d9488", fontStyle: "italic", fontWeight: 400 }}>back.</span>
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "4px" }}>
              Sign in to continue your career journey.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={styles.lightTabs}>
            <button
              style={{ ...styles.lightTab, ...(mode === "login" ? styles.lightTabActive : {}) }}
              onClick={() => { setMode("login"); setError(""); setForm({ fullName: "", email: "", password: "" }); }}
            >
              Sign In
            </button>
            <button
              style={{ ...styles.lightTab, ...(mode === "signup" ? styles.lightTabActive : {}) }}
              onClick={() => { setMode("signup"); setError(""); setForm({ fullName: "", email: "", password: "" }); }}
            >
              Register
            </button>
          </div>

          {/* Alert Message */}
          {error && (
            <div style={{
              ...styles.lightAlert,
              color: error.startsWith("✅") ? "#047857" : "#b91c1c",
              background: error.startsWith("✅") ? "#ecfdf5" : "#fef2f2",
              borderColor: error.startsWith("✅") ? "#a7f3d0" : "#fecaca",
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} autoComplete={unlocked ? "on" : "off"}>
            {mode === "signup" && (
              <div style={{ marginBottom: "16px" }}>
                <label className="label-split-light">Full Name</label>
                <input
                  className="input-split-light"
                  type="text"
                  placeholder="John Doe"
                  value={form.fullName}
                  onChange={set("fullName")}
                  required
                />
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label className="label-split-light">Email Address</label>
              <input
                className="input-split-light"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                onMouseEnter={unlockInputs}
                onFocus={unlockInputs}
                onClick={unlockInputs}
                required
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label className="label-split-light" style={{ marginBottom: 0 }}>Password</label>
                <span style={{ fontSize: "0.78rem", color: "#0d9488", fontWeight: 600, cursor: "pointer" }} onClick={() => navigate("/forgot-password")}>
                  Forgot password?
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  className="input-split-light"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={set("password")}
                  onMouseEnter={unlockInputs}
                  onFocus={unlockInputs}
                  onClick={unlockInputs}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: "#0d9488", width: 16, height: 16, cursor: "pointer" }}
              />
              <label htmlFor="remember" style={{ fontSize: "0.85rem", color: "#475569", cursor: "pointer", fontWeight: 500 }}>
                Remember me for 30 days
              </label>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={styles.darkSubmitBtn}
            >
              {loading ? "Authenticating…" : mode === "login" ? "Sign in →" : "Create Account →"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ margin: "20px 0", textAlign: "center", position: "relative" }}>
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "#e2e8f0" }} />
            <span style={{ position: "relative", padding: "0 12px", background: "#fbfdfd", color: "#94a3b8", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              or
            </span>
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            style={styles.googleBtnLight}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Continue with Google
          </button>

          {/* OTHER PORTALS Section */}
          <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid #f1f5f9" }}>
            <div style={{ textAlign: "center", fontSize: "0.72rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "12px" }}>
              OTHER PORTALS
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <div className="portal-card-btn" onClick={() => navigate("/recruiter")}>
                <span style={{ fontSize: "1.2rem" }}>🏢</span>
                <span>Recruiter Portal</span>
              </div>
              <div className="portal-card-btn" onClick={() => navigate("/admin-login")}>
                <span style={{ fontSize: "1.2rem" }}>🛡️</span>
                <span>Admin Portal</span>
              </div>
            </div>
          </div>

          <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#94a3b8", marginTop: "20px" }}>
            New to platform? Ask your administrator for access.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  leftTopBadge: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "32px",
  },
  leftTitle: {
    fontSize: "clamp(2.5rem, 4.5vw, 3.8rem)",
    fontWeight: 800,
    lineHeight: 1.1,
    color: "#ffffff",
    letterSpacing: "-0.02em",
    marginBottom: "20px",
  },
  leftSub: {
    color: "#94a3b8",
    fontSize: "1.05rem",
    lineHeight: 1.65,
    maxWidth: "520px",
    marginBottom: "28px",
  },
  connectedTag: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 16px",
    borderRadius: "99px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  testimonialsWrapper: {
    marginTop: "40px",
    paddingTop: "28px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  testimonialHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  arrowBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.04)",
    color: "#f8fafc",
    fontSize: "1.2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  testimonialCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    padding: "20px",
    backdropFilter: "blur(8px)",
  },
  quoteText: {
    color: "#cbd5e1",
    fontSize: "0.86rem",
    lineHeight: 1.55,
  },
  avatarImg: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid rgba(45,212,191,0.3)",
  },
  featureGridCard: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "14px",
    padding: "16px",
    backdropFilter: "blur(6px)",
  },

  /* Right Side Styles */
  rightContent: {
    width: "100%",
    maxWidth: "380px",
  },
  logoBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  signInPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 12px",
    borderRadius: "99px",
    background: "#f0fdfa",
    border: "1px solid #ccfbf1",
    color: "#0f766e",
    fontSize: "0.75rem",
    fontWeight: 800,
    letterSpacing: "0.08em",
    marginBottom: "12px",
  },
  welcomeTitle: {
    fontSize: "2.2rem",
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.02em",
  },
  lightTabs: {
    display: "flex",
    background: "#f1f5f9",
    borderRadius: "10px",
    padding: "4px",
    gap: "4px",
    marginBottom: "20px",
  },
  lightTab: {
    flex: 1,
    padding: "8px",
    borderRadius: "8px",
    border: "none",
    background: "transparent",
    color: "#64748b",
    fontWeight: 700,
    fontSize: "0.85rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  lightTabActive: {
    background: "#ffffff",
    color: "#0f172a",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  lightAlert: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid",
    fontSize: "0.82rem",
    fontWeight: 600,
    marginBottom: "16px",
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "0.9rem",
    opacity: 0.6,
  },
  darkSubmitBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    background: "#0f172a",
    color: "#ffffff",
    fontSize: "0.95rem",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
  },
  googleBtnLight: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    color: "#334155",
    fontSize: "0.9rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
  },
};
