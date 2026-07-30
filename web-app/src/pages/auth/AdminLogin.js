import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const [form, setForm]               = useState({ email: "", password: "" });
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [unlocked, setUnlocked]       = useState(false);
  const [rememberMe, setRememberMe]   = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const { login, user } = useAuth();
  const navigate        = useNavigate();

  React.useEffect(() => {
    setForm({ email: "", password: "" });
    setUnlocked(false);
    if (user && user.role === "admin") {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const unlockInputs = () => {
    if (!unlocked) setUnlocked(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(form.email, form.password, "admin");
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-page page-enter">
      {/* ── LEFT PANEL: Dark Editorial & Admin Security Telemetry (58% width) ───── */}
      <div className="split-left" style={{ backgroundColor: "#090514" }}>
        <div>
          {/* Header Badge */}
          <div style={styles.leftTopBadge}>
            <span style={{ fontWeight: 700, color: "#a855f7", letterSpacing: "0.1em" }}>03</span>
            <span style={{ height: 1, width: 32, background: "rgba(255,255,255,0.2)", display: "inline-block" }}></span>
            <span style={{ textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700 }}>
              SYSTEM ADMIN PORTAL
            </span>
          </div>

          {/* Editorial Headline */}
          <h1 style={styles.leftTitle}>
            Where platform control <br />
            meets <span className="serif-font" style={{ color: "#c084fc", fontStyle: "italic", fontWeight: 400 }}>security.</span>
          </h1>

          {/* Subtitle */}
          <p style={styles.leftSub}>
            A secure environment for system administrators, user account approvals, platform telemetry monitoring, and role permission governance. Restricted access.
          </p>

          {/* Workspace Status Indicator */}
          <div style={styles.connectedTag}>
            <span className="ai-dot" style={{ background: "#a855f7", marginRight: 8 }}></span>
            <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Connected to </span>
            <span style={{ color: "#c084fc", fontSize: "0.85rem", fontWeight: 600 }}>admin control plane</span>
          </div>

          {/* Feature Highlights Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginTop: "24px" }}>
            <div style={styles.featureGridCard}>
              <div style={{ fontSize: "1.2rem", marginBottom: "6px" }}>🛡️</div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#f8fafc", marginBottom: "4px" }}>Governance & Access</div>
              <div style={{ fontSize: "0.78rem", color: "#94a3b8", lineHeight: 1.4 }}>Manage role permissions and approve recruiter accounts.</div>
            </div>

            <div style={styles.featureGridCard}>
              <div style={{ fontSize: "1.2rem", marginBottom: "6px" }}>📊</div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#f8fafc", marginBottom: "4px" }}>Platform Telemetry</div>
              <div style={{ fontSize: "0.78rem", color: "#94a3b8", lineHeight: 1.4 }}>Real-time system health metrics, logs & usage analytics.</div>
            </div>

            <div style={styles.featureGridCard}>
              <div style={{ fontSize: "1.2rem", marginBottom: "6px" }}>🔒</div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#f8fafc", marginBottom: "4px" }}>Enterprise Security</div>
              <div style={{ fontSize: "0.78rem", color: "#94a3b8", lineHeight: 1.4 }}>Encrypted tokens, rate limiting & automated monitoring.</div>
            </div>
          </div>
        </div>

        {/* Telemetry Highlights */}
        <div style={styles.testimonialsWrapper}>
          <div style={styles.testimonialHeader}>
            <span style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.15em", color: "#a855f7", textTransform: "uppercase" }}>
              SYSTEM STATUS & GOVERNANCE
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            <div style={styles.testimonialCard}>
              <div style={{ color: "#a855f7", fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>UPTIME & HEALTH</div>
              <p style={styles.quoteText}>System operating at 99.99% uptime with zero unauthorized access events recorded across all security nodes.</p>
              <div style={{ marginTop: "12px", fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>Platform Security Team</div>
            </div>

            <div style={styles.testimonialCard}>
              <div style={{ color: "#a855f7", fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>ACCESS GOVERNANCE</div>
              <p style={styles.quoteText}>Strict Role-Based Access Control (RBAC) enforced for Candidate, Recruiter, and Admin operations.</p>
              <div style={{ marginTop: "12px", fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>Audit Governance</div>
            </div>
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
                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" fill="#7c3aed" stroke="#6d28d9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: "1.4rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>RESUMEAI</span>
            </div>

            <div style={styles.signInPill}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c3aed", display: "inline-block" }}></span>
              ADMIN PORTAL
            </div>

            <h2 style={styles.welcomeTitle}>
              Welcome <span className="serif-font" style={{ color: "#7c3aed", fontStyle: "italic", fontWeight: 400 }}>back.</span>
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "4px" }}>
              Restricted access — authorized personnel only.
            </p>
          </div>

          {/* Alert Message */}
          {error && (
            <div style={styles.lightAlert}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} autoComplete={unlocked ? "on" : "off"}>
            <div style={{ marginBottom: "16px" }}>
              <label className="label-split-light">Admin Email</label>
              <input
                className="input-split-light"
                type="email"
                placeholder="admin@resumeai.com"
                value={form.email}
                onChange={set("email")}
                onMouseEnter={unlockInputs}
                onFocus={unlockInputs}
                onClick={unlockInputs}
                required
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label className="label-split-light">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="input-split-light"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
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
                id="remember-admin"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: "#7c3aed", width: 16, height: 16, cursor: "pointer" }}
              />
              <label htmlFor="remember-admin" style={{ fontSize: "0.85rem", color: "#475569", cursor: "pointer", fontWeight: 500 }}>
                Remember session for 30 days
              </label>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.darkSubmitBtn, background: "#7c3aed" }}
            >
              {loading ? "Authenticating…" : "Access Admin Panel →"}
            </button>
          </form>

          {/* OTHER PORTALS Section */}
          <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #f1f5f9" }}>
            <div style={{ textAlign: "center", fontSize: "0.72rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "12px" }}>
              OTHER PORTALS
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <div className="portal-card-btn" onClick={() => navigate("/")}>
                <span style={{ fontSize: "1.2rem" }}>⚡</span>
                <span>Candidate Portal</span>
              </div>
              <div className="portal-card-btn" onClick={() => navigate("/recruiter")}>
                <span style={{ fontSize: "1.2rem" }}>🏢</span>
                <span>Recruiter Portal</span>
              </div>
            </div>
          </div>

          <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#94a3b8", marginTop: "24px" }}>
            Need admin provisioning? Contact system governance.
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
    background: "#f3e8ff",
    border: "1px solid #e9d5ff",
    color: "#7c3aed",
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
  lightAlert: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#b91c1c",
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
    background: "#7c3aed",
    color: "#ffffff",
    fontSize: "0.95rem",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(124, 58, 237, 0.2)",
  },
};
