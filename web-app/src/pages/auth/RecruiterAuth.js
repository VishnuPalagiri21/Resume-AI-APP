import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getRoleCredentials, saveRoleCredential, removeRoleCredential } from "../../utils/savedCredentials";

const RECRUITER_TESTIMONIALS = [
  {
    quote: "ResumeAI transformed our hiring pipeline. We screened over 200 applicants in hours instead of days with the AI match score.",
    author: "Sarah Jenkins",
    role: "HEAD OF TALENT ACQUISITION",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
  },
  {
    quote: "The AI skill match scores are remarkably accurate. We found 3 senior developers in our first week using recruiter search.",
    author: "David Chen",
    role: "VP OF ENGINEERING",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
  },
  {
    quote: "Candidate search and automated PDF parsing saved our HR team 15+ hours every week. Highly recommended for growth teams.",
    author: "Elena Rostova",
    role: "RECRUITMENT DIRECTOR",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80",
  },
];

export default function RecruiterAuth() {
  const [mode, setMode]               = useState("login");
  const [form, setForm]               = useState({ fullName: "", email: "", password: "", company: "" });
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [unlocked, setUnlocked]       = useState(false);
  const [rememberMe, setRememberMe]   = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const [savedAccounts, setSavedAccounts] = useState([]);
  const [showDropdown, setShowDropdown]   = useState(false);
  const [isEditable, setIsEditable]       = useState(false);
  const emailGroupRef = React.useRef(null);

  const { login, signup, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    setForm({ fullName: "", email: "", password: "", company: "" });
    setUnlocked(false);
    if (user && user.role === "recruiter") {
      navigate("/dashboard/recruiter", { replace: true });
    }
  }, [user, navigate]);

  // Load saved recruiter credentials for dropdown — fields start EMPTY.
  // Credentials are only filled when the user explicitly selects an account.
  React.useEffect(() => {
    setIsEditable(false);
    if (mode === "login") {
      const creds = getRoleCredentials("recruiter");
      setSavedAccounts(creds);
      // ✅ Do NOT auto-fill email/password here.
      // The dropdown will appear on email field focus; user must select explicitly.
    }
  }, [mode]);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (emailGroupRef.current && !emailGroupRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSelectSavedAccount = (acc) => {
    setForm((f) => ({ ...f, email: acc.email, password: acc.password }));
    setShowDropdown(false);
    unlockInputs();
  };

  const handleRemoveSavedAccount = (e, accEmail) => {
    e.stopPropagation();
    removeRoleCredential("recruiter", accEmail);
    const updated = savedAccounts.filter((a) => a.email.toLowerCase() !== accEmail.toLowerCase());
    setSavedAccounts(updated);
    if (form.email.toLowerCase() === accEmail.toLowerCase()) {
      setForm((f) => ({ ...f, email: "", password: "" }));
    }
  };

  const unlockInputs = () => {
    if (!unlocked) setUnlocked(true);
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await loginWithGoogle("recruiter");
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
        await login(form.email, form.password, "recruiter");
        if (rememberMe) {
          saveRoleCredential("recruiter", form.email, form.password);
        }
        navigate("/dashboard/recruiter");
      } else {
        await signup({ ...form, role: "recruiter" });
        setMode("login");
        setError("✅ Account created! Please log in.");
        setForm({ fullName: "", email: "", password: "", company: "" });
        setUnlocked(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevTestimonial = () => {
    setActiveTestimonial((prev) => (prev === 0 ? RECRUITER_TESTIMONIALS.length - 1 : prev - 1));
  };

  const handleNextTestimonial = () => {
    setActiveTestimonial((prev) => (prev === RECRUITER_TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="split-page page-enter">
      {/* ── LEFT PANEL: Dark Editorial & Recruiter Features (58% width) ─────────── */}
      <div className="split-left" style={{ backgroundColor: "#060b0d" }}>
        <div>
          {/* Header Badge */}
          <div style={styles.leftTopBadge}>
            <span style={{ fontWeight: 700, color: "#06b6d4", letterSpacing: "0.1em" }}>02</span>
            <span style={{ height: 1, width: 32, background: "rgba(255,255,255,0.2)", display: "inline-block" }}></span>
            <span style={{ textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>
              RECRUITER PORTAL
            </span>
          </div>

          {/* Editorial Headline */}
          <h1 style={styles.leftTitle}>
            Where top talent <br />
            meets <span className="serif-font" style={{ color: "#06b6d4", fontStyle: "italic", fontWeight: 400 }}>opportunity.</span>
          </h1>

          {/* Subtitle */}
          <p style={styles.leftSub}>
            A focused environment for enterprise recruiters, AI-driven candidate ranking, automated resume parsing, and instant skill density matching. Welcome back.
          </p>

          {/* Workspace Status Indicator */}
          <div style={styles.connectedTag}>
            <span className="ai-dot" style={{ background: "#06b6d4", marginRight: 8 }}></span>
            <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Connected to </span>
            <span style={{ color: "#06b6d4", fontSize: "0.85rem", fontWeight: 600 }}>recruiter workspace</span>
          </div>

          {/* Feature Highlights Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginTop: "24px" }}>
            <div style={styles.featureGridCard}>
              <div style={{ fontSize: "1.2rem", marginBottom: "6px" }}>🏢</div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#f8fafc", marginBottom: "4px" }}>Candidate Ranking</div>
              <div style={{ fontSize: "0.78rem", color: "#94a3b8", lineHeight: 1.4 }}>AI semantic analysis to score resumes against job posts.</div>
            </div>

            <div style={styles.featureGridCard}>
              <div style={{ fontSize: "1.2rem", marginBottom: "6px" }}>📄</div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#f8fafc", marginBottom: "4px" }}>Instant Resume Parser</div>
              <div style={{ fontSize: "0.78rem", color: "#94a3b8", lineHeight: 1.4 }}>Extract skills, experience & details from bulk PDF uploads.</div>
            </div>

            <div style={styles.featureGridCard}>
              <div style={{ fontSize: "1.2rem", marginBottom: "6px" }}>💬</div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#f8fafc", marginBottom: "4px" }}>Direct Match Outreach</div>
              <div style={{ fontSize: "0.78rem", color: "#94a3b8", lineHeight: 1.4 }}>Filter candidates by skill density and invite top talent directly.</div>
            </div>
          </div>
        </div>

        {/* Testimonials Slider */}
        <div style={styles.testimonialsWrapper}>
          <div style={styles.testimonialHeader}>
            <span style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.15em", color: "#64748b", textTransform: "uppercase" }}>
              WHAT RECRUITERS SAY &nbsp;&nbsp;<span style={{ color: "#94a3b8" }}>0{activeTestimonial + 1} / 0{RECRUITER_TESTIMONIALS.length}</span>
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
            {[RECRUITER_TESTIMONIALS[activeTestimonial], RECRUITER_TESTIMONIALS[(activeTestimonial + 1) % RECRUITER_TESTIMONIALS.length]].map((item, idx) => (
              <div key={idx} style={styles.testimonialCard}>
                <div style={{ color: "#06b6d4", fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px" }}>”</div>
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
                <path d="M19 21V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V21M19 21H5M19 21H21M5 21H3M9 7H11M13 7H15M9 11H11M13 11H15M9 15H11M13 15H15" stroke="#0891b2" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: "1.4rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>RESUMEAI</span>
            </div>

            <div style={styles.signInPill}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0891b2", display: "inline-block" }}></span>
              RECRUITER SIGN-IN
            </div>

            <h2 style={styles.welcomeTitle}>
              {mode === "login" ? (
                <>Welcome <span className="serif-font" style={{ color: "#0891b2", fontStyle: "italic", fontWeight: 400 }}>back.</span></>
              ) : (
                <>Create <span className="serif-font" style={{ color: "#0891b2", fontStyle: "italic", fontWeight: 400 }}>account.</span></>
              )}
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "4px" }}>
              {mode === "login" ? "Sign in to access your recruiter workspace." : "Create your recruiter account to start hiring top talent."}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={styles.lightTabs}>
            <button
              style={{ ...styles.lightTab, ...(mode === "login" ? styles.lightTabActive : {}) }}
              onClick={() => { setMode("login"); setError(""); setForm({ fullName: "", email: "", password: "", company: "" }); }}
            >
              Sign In
            </button>
            <button
              style={{ ...styles.lightTab, ...(mode === "signup" ? styles.lightTabActive : {}) }}
              onClick={() => { setMode("signup"); setError(""); setForm({ fullName: "", email: "", password: "", company: "" }); }}
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
          <form onSubmit={handleSubmit} autoComplete="off">
            {mode === "signup" && (
              <>
                <div style={{ marginBottom: "16px" }}>
                  <label className="label-split-light">Full Name</label>
                  <input
                    className="input-split-light"
                    type="text"
                    placeholder="Jane Smith"
                    value={form.fullName}
                    onChange={set("fullName")}
                    required
                  />
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label className="label-split-light">Company Name</label>
                  <input
                    className="input-split-light"
                    type="text"
                    placeholder="Acme Corp"
                    value={form.company}
                    onChange={set("company")}
                    required
                  />
                </div>
              </>
            )}

            <div style={{ marginBottom: "16px", position: "relative" }} ref={emailGroupRef}>
              <label className="label-split-light">Work Email</label>
              <input
                className="input-split-light"
                type="email"
                name="recruiter_login_email_no_autofill"
                autoComplete="off"
                readOnly={!isEditable}
                placeholder="hr@company.com"
                value={form.email}
                onChange={set("email")}
                onFocus={(e) => {
                  setIsEditable(true);
                  e.target.removeAttribute("readonly");
                  if (mode === "login" && savedAccounts.length > 0) setShowDropdown(true);
                }}
                onClick={(e) => {
                  setIsEditable(true);
                  e.target.removeAttribute("readonly");
                  if (mode === "login" && savedAccounts.length > 0) setShowDropdown(true);
                }}
                required
              />

              {/* Saved Recruiter Accounts Dropdown */}
              {mode === "login" && showDropdown && savedAccounts.length > 0 && (
                <div style={styles.recruiterDropdown}>
                  <div style={styles.recruiterDropdownHeader}>
                    <span>SAVED RECRUITER ACCOUNTS</span>
                  </div>
                  {savedAccounts.map((acc) => (
                    <div
                      key={acc.email}
                      style={styles.dropdownItem}
                      onClick={() => handleSelectSavedAccount(acc)}
                    >
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.85rem" }}>{acc.email}</span>
                        <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Saved recruiter login</span>
                      </div>
                      <button
                        type="button"
                        style={styles.removeBtn}
                        onClick={(e) => handleRemoveSavedAccount(e, acc.email)}
                        title="Remove saved account"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label className="label-split-light" style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password?role=recruiter" style={{ fontSize: "0.78rem", color: "#0891b2", fontWeight: 600, textDecoration: "none" }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  className="input-split-light"
                  type={showPassword ? "text" : "password"}
                  name="recruiter_login_password_no_autofill"
                  autoComplete="new-password"
                  readOnly={!isEditable}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={set("password")}
                  onFocus={(e) => {
                    setIsEditable(true);
                    e.target.removeAttribute("readonly");
                  }}
                  onClick={(e) => {
                    setIsEditable(true);
                    e.target.removeAttribute("readonly");
                  }}
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
                id="remember-recruiter"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: "#0891b2", width: 16, height: 16, cursor: "pointer" }}
              />
              <label htmlFor="remember-recruiter" style={{ fontSize: "0.85rem", color: "#475569", cursor: "pointer", fontWeight: 500 }}>
                Remember me for 30 days
              </label>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.darkSubmitBtn, background: "#0891b2" }}
            >
              {loading ? "Authenticating…" : mode === "login" ? "Sign in →" : "Register →"}
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
            Recruiter Google Sign In
          </button>

          {/* OTHER PORTALS Section */}
          <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid #f1f5f9" }}>
            <div style={{ textAlign: "center", fontSize: "0.72rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "12px" }}>
              OTHER PORTALS
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <div className="portal-card-btn" onClick={() => navigate("/")}>
                <span style={{ fontSize: "1.2rem" }}>⚡</span>
                <span>Candidate Portal</span>
              </div>
              <div className="portal-card-btn" onClick={() => navigate("/admin-login")}>
                <span style={{ fontSize: "1.2rem" }}>🛡️</span>
                <span>Admin Portal</span>
              </div>
            </div>
          </div>

          <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#94a3b8", marginTop: "20px" }}>
            Need enterprise access? Ask your administrator.
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
    border: "1px solid rgba(6,182,212,0.3)",
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
    background: "#ecfeff",
    border: "1px solid #cff4fc",
    color: "#0891b2",
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
    background: "#0891b2",
    color: "#ffffff",
    fontSize: "0.95rem",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(8, 145, 178, 0.2)",
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
  recruiterDropdown: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0, right: 0,
    backgroundColor: "#ffffff",
    border: "1px solid #0891b2",
    borderRadius: "10px",
    zIndex: 100,
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    overflow: "hidden",
  },
  recruiterDropdownHeader: {
    padding: "8px 12px",
    fontSize: "0.68rem",
    fontWeight: 800,
    letterSpacing: "0.8px",
    color: "#0891b2",
    borderBottom: "1px solid #e2e8f0",
    backgroundColor: "#ecfeff",
  },
  dropdownItem: {
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    borderBottom: "1px solid #f1f5f9",
    transition: "background 0.2s ease",
  },
  removeBtn: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    fontSize: "0.8rem",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "4px",
  },
};
