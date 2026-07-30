import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function ForgotPassword() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/auth/forgot-password`, {
        email: email.trim(),
      });

      if (res.data.success) {
        // Navigate to OTP verification page — OTP is sent via email only
        const params = new URLSearchParams({ email: email.trim() });
        if (res.data.previewUrl) params.set("previewUrl", res.data.previewUrl);
        navigate(`/verify-otp?${params.toString()}`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send verification code. Please check your email address."
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

        <h1 style={styles.title}>Forgot Password?</h1>
        <p style={styles.sub}>
          Enter your registered email address and we&rsquo;ll send a
          <strong style={{ color: "#a78bfa" }}> 6-digit verification code</strong> to reset your password.
        </p>

        {error && (
          <div style={{ ...styles.alert, color: "#f87171", borderColor: "rgba(248,113,113,0.3)", backgroundColor: "rgba(248,113,113,0.08)" }}>
            ⚠️ {error}
          </div>
        )}

        <form style={styles.form} onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ color: "#cbd5e1" }}>
              Registered Email Address
            </label>
            <input
              className="form-input user"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            type="submit"
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
            {loading ? "Sending Verification Code..." : "Send Verification Code 🚀"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Link
            to="/auth/user"
            style={{
              color: "#94a3b8",
              fontSize: "0.85rem",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            ← Back to Login
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
