import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function ResetPassword() {
  const [searchParams]                = useSearchParams();
  // Read the short-lived JWT reset token issued by the OTP verification step
  const token                         = searchParams.get("token") || "";
  const email                         = searchParams.get("email") || "";

  const [password, setPassword]       = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [showPassword, setShow]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [successModal, setSuccessModal] = useState(false);

  const navigate                      = useNavigate();

  // Password Rules validation checklist
  const checks = {
    length:   password.length >= 8,
    upper:    /[A-Z]/.test(password),
    lower:    /[a-z]/.test(password),
    num:      /[0-9]/.test(password),
    special:  /[@$!%*?&^#~_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    match:    password.length > 0 && password === confirmPassword,
  };

  const allValid = Object.values(checks).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!allValid) {
      setError("Please satisfy all password strength requirements below.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/auth/reset-password`, {
        token,
        password,
      });

      if (res.data.success) {
        setSuccessModal(true);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Your token may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.orb} />

      {/* ── SUCCESS MODAL / SCREEN ── */}
      {successModal ? (
        <div style={styles.card} className="glass fade-up">
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>🎉</div>
            <h2 style={{ ...styles.title, color: "#34d399" }}>
              Password Reset Successfully!
            </h2>
            <p style={{ ...styles.sub, marginTop: "12px", marginBottom: "28px" }}>
              Your account password has been updated securely. All previous reset tokens and verification codes have been invalidated.
            </p>
            <button
              onClick={() => navigate(searchParams.get("role") === "recruiter" ? "/recruiter" : "/")}
              className="btn btn-user"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "14px",
                fontSize: "1rem",
                fontWeight: 600,
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Return to Login →
            </button>
          </div>
        </div>
      ) : (
        /* ── RESET FORM ── */
        <div style={styles.card} className="glass fade-up">
          <div style={styles.iconWrapper}>
            <span style={styles.icon}>🛡️</span>
          </div>

          <h1 style={styles.title}>Create New Password</h1>
          <p style={styles.sub}>
            Enter a strong new password for <br />
            <strong style={{ color: "#a78bfa" }}>{email || "your account"}</strong>
          </p>

          {error && (
            <div style={{ ...styles.alert, color: "#f87171", borderColor: "rgba(248,113,113,0.3)", backgroundColor: "rgba(248,113,113,0.08)" }}>
              ⚠️ {error}
            </div>
          )}

          <form style={styles.form} onSubmit={handleSubmit}>
            {/* New Password */}
            <div className="form-group">
              <label className="form-label" style={{ color: "#cbd5e1" }}>
                New Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="form-input user"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 40px 12px 14px",
                    borderRadius: "8px",
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    color: "#fff",
                    fontSize: "0.95rem",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShow(!showPassword)}
                  style={styles.eyeButton}
                  title="Toggle password visibility"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" style={{ color: "#cbd5e1" }}>
                Confirm New Password
              </label>
              <input
                className="form-input user"
                type={showPassword ? "text" : "password"}
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirm(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  color: "#fff",
                  fontSize: "0.95rem",
                }}
              />
            </div>

            {/* Live Password Strength Indicator Checklist */}
            <div style={styles.checklist}>
              <div style={styles.checkTitle}>Security Requirements:</div>
              <div style={styles.checkGrid}>
                <div style={checks.length ? styles.checkItemValid : styles.checkItem}>
                  {checks.length ? "✓" : "○"} Minimum 8 characters
                </div>
                <div style={checks.upper ? styles.checkItemValid : styles.checkItem}>
                  {checks.upper ? "✓" : "○"} One uppercase letter (A-Z)
                </div>
                <div style={checks.lower ? styles.checkItemValid : styles.checkItem}>
                  {checks.lower ? "✓" : "○"} One lowercase letter (a-z)
                </div>
                <div style={checks.num ? styles.checkItemValid : styles.checkItem}>
                  {checks.num ? "✓" : "○"} One number (0-9)
                </div>
                <div style={checks.special ? styles.checkItemValid : styles.checkItem}>
                  {checks.special ? "✓" : "○"} One special character (@$!%*?&)
                </div>
                <div style={checks.match ? styles.checkItemValid : styles.checkItem}>
                  {checks.match ? "✓" : "○"} Passwords match
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-user"
              style={{
                width: "100%",
                justifyContent: "center",
                marginTop: "12px",
                padding: "13px",
                fontSize: "0.95rem",
                fontWeight: 600,
                background: allValid
                  ? "linear-gradient(135deg, #7c3aed, #6d28d9)"
                  : "rgba(100, 116, 139, 0.3)",
                color: allValid ? "#fff" : "#94a3b8",
                border: "none",
                borderRadius: "8px",
                cursor: allValid && !loading ? "pointer" : "not-allowed",
                boxShadow: allValid ? "0 4px 14px rgba(124, 58, 237, 0.35)" : "none",
              }}
              disabled={!allValid || loading}
            >
              {loading ? "Updating Password..." : "Reset Password 🔐"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "8px" }}>
            <Link
              to="/auth/user"
              style={{
                color: "#64748b",
                fontSize: "0.82rem",
                textDecoration: "none",
              }}
            >
              ← Cancel & Return to Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#060b0d",
  },
  orb: {
    position: "absolute",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background: "radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 70%)",
    top: "-200px",
    left: "-200px",
    pointerEvents: "none",
  },
  card: {
    width: "100%",
    maxWidth: "460px",
    padding: "44px 38px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    background: "rgba(15, 23, 42, 0.85)",
    borderRadius: "16px",
    border: "1px solid rgba(124, 58, 237, 0.3)",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
  },
  iconWrapper: {
    display: "flex",
    justifyContent: "center",
  },
  icon: {
    fontSize: "2.6rem",
    background: "rgba(124, 58, 237, 0.15)",
    padding: "12px 18px",
    borderRadius: "16px",
    border: "1px solid rgba(124, 58, 237, 0.3)",
  },
  title: {
    textAlign: "center",
    fontSize: "1.65rem",
    fontWeight: 800,
    color: "#f8fafc",
    margin: 0,
    fontFamily: "'Outfit', sans-serif",
  },
  sub: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "0.88rem",
    lineHeight: 1.5,
    margin: 0,
  },
  alert: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid",
    fontSize: "0.88rem",
    fontWeight: 500,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  eyeButton: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1.1rem",
    color: "#94a3b8",
  },
  checklist: {
    background: "rgba(30, 41, 59, 0.5)",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    borderRadius: "10px",
    padding: "14px",
    marginTop: "4px",
  },
  checkTitle: {
    fontSize: "0.78rem",
    color: "#94a3b8",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "10px",
  },
  checkGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "6px",
  },
  checkItem: {
    fontSize: "0.83rem",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  checkItemValid: {
    fontSize: "0.83rem",
    color: "#34d399",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
};
