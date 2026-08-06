import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function ForgotPassword() {
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [isEditable, setIsEditable] = useState(false);
  const [searchParams]          = useSearchParams();
  const role                    = searchParams.get("role") || "user";
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");

    const exactEmail = email.trim();
    if (!exactEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/auth/forgot-password`, {
        email: exactEmail,
        role,
      });

      if (res.data.success) {
        // Navigate automatically to OTP verification page — OTP is sent via SMTP only
        const params = new URLSearchParams({
          email: exactEmail,
          role,
        });
        if (res.data.previewUrl) params.set("previewUrl", res.data.previewUrl);
        navigate(`/verify-otp?${params.toString()}`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Email not found"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.orb} />
      <div style={styles.card} className="glass fade-up">
        <div style={styles.iconWrapper}>
          <span style={styles.icon}>🔐</span>
        </div>

        <h1 style={styles.title}>Reset your password</h1>
        <p style={styles.sub}>
          Enter your registered email address and we&rsquo;ll send a verification OTP to reset your password.
        </p>

        {error && (
          <div style={{ ...styles.alert, color: "#f87171", borderColor: "rgba(248,113,113,0.3)", backgroundColor: "rgba(248,113,113,0.08)" }}>
            ⚠️ {error}
          </div>
        )}

        <div style={styles.form}>
          <div className="form-group">
            <label className="form-label" style={{ color: "#cbd5e1" }}>
              Email Address
            </label>
            <input
              className="form-input user"
              type="email"
              name="forgot_password_exact_email_no_autofill"
              id="forgot_password_exact_email_no_autofill"
              autoComplete="off"
              spellCheck="false"
              autoCorrect="off"
              autoCapitalize="none"
              readOnly={!isEditable}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsEditable(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit(e);
              }}
              required
              autoFocus
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

          <button
            type="button"
            onClick={handleSubmit}
            className="btn btn-user"
            style={{
              width: "100%",
              justifyContent: "center",
              marginTop: "8px",
              padding: "13px",
              fontSize: "0.95rem",
              fontWeight: 600,
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(124, 58, 237, 0.35)",
            }}
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Link
            to={role === "recruiter" ? "/recruiter" : "/"}
            style={{
              color: "#94a3b8",
              fontSize: "0.85rem",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            {role === "recruiter" ? "← Back to Recruiter Login" : "← Back to Candidate Login"}
          </Link>
        </div>
      </div>
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
    maxWidth: "440px",
    padding: "48px 40px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    background: "rgba(15, 23, 42, 0.8)",
    borderRadius: "16px",
    border: "1px solid rgba(124, 58, 237, 0.3)",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
  },
  iconWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "4px",
  },
  icon: {
    fontSize: "2.8rem",
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
    gap: "18px",
  },
};
