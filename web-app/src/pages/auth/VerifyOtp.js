import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function VerifyOtp() {
  const [searchParams]          = useSearchParams();
  const emailParam              = searchParams.get("email") || "";
  const previewUrl              = searchParams.get("previewUrl") || "";
  const devOtp                  = searchParams.get("devOtp") || "";
  const codeParam               = searchParams.get("code") || "";

  const initialOtp = /^\d{6}$/.test(codeParam) ? codeParam.split("") : Array(6).fill("");
  const [otp, setOtp]           = useState(initialOtp);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState(0);

  const fillOtp = (codeString) => {
    if (/^\d{6}$/.test(codeString)) {
      setOtp(codeString.split(""));
    }
  };

  const inputRefs               = useRef([]);
  const navigate                = useNavigate();

  // 10-minute countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // Allow single character entry
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, 6).split("");
    const newOtp = [...otp];
    digits.forEach((digit, idx) => {
      if (idx < 6) newOtp[idx] = digit;
    });
    setOtp(newOtp);
    const focusIdx = Math.min(digits.length, 5);
    inputRefs.current[focusIdx].focus();
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(`${API_BASE}/api/auth/forgot-password`, {
        email: emailParam,
        role:  searchParams.get("role") || "user",
      });
      if (res.data.success) {
        setSuccess("New verification code sent to your email.");
        setTimeLeft(300);
        setResendCooldown(30);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to resend verification code."
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Please enter the full 6-digit verification code.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/auth/verify-reset-otp`, {
        email: emailParam,
        otp: otpCode,
      });

      if (res.data.success && res.data.resetToken) {
        setSuccess("Code verified! Proceeding to reset password...");
        setTimeout(() => {
          navigate(
            `/reset-password?token=${encodeURIComponent(
              res.data.resetToken
            )}&email=${encodeURIComponent(emailParam)}&role=${encodeURIComponent(
              searchParams.get("role") || "user"
            )}`
          );
        }, 1200);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid verification code. Please check and try again."
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
          <span style={styles.icon}>✉️</span>
        </div>

        <h1 style={styles.title}>Verify Your Email</h1>
        <p style={styles.sub}>
          We've sent a 6-digit verification code to <br />
          <strong style={{ color: "#38bdf8" }}>{emailParam || "your email"}</strong>
        </p>

        <div style={styles.timerBadge}>
          <span style={{ fontSize: "1.1rem" }}>⏳</span>
          <span>Code expires in: <strong>{formatTime(timeLeft)}</strong></span>
        </div>

        {/* Ethereal Web Preview Button (When real SMTP is not set up in .env) */}
        {previewUrl && (
          <div style={{ textAlign: "center", margin: "4px 0" }}>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                padding: "10px 16px",
                background: "linear-gradient(135deg, #0284c7, #0369a1)",
                color: "#ffffff",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(2, 132, 199, 0.35)",
              }}
            >
              📨 Open Sent Email Preview Inbox ↗
            </a>
          </div>
        )}




        {error && (
          <div style={{ ...styles.alert, color: "#f87171", borderColor: "rgba(248,113,113,0.3)", backgroundColor: "rgba(248,113,113,0.08)" }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{ ...styles.alert, color: "#34d399", borderColor: "rgba(52,211,153,0.3)", backgroundColor: "rgba(52,211,153,0.08)" }}>
            ✅ {success}
          </div>
        )}

        <form style={styles.form} onSubmit={handleSubmit}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "10px",
              margin: "12px 0",
            }}
            onPaste={handlePaste}
          >
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                style={styles.otpBox}
                required
              />
            ))}
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
            disabled={loading || timeLeft <= 0}
          >
            {loading ? "Verifying..." : "Verify & Continue →"}
          </button>
        </form>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", fontSize: "0.86rem" }}>
          <span style={{ color: "#94a3b8" }}>Didn't receive the code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            style={{
              background: "none",
              border: "none",
              color: resendCooldown > 0 ? "#64748b" : "#38bdf8",
              cursor: resendCooldown > 0 ? "default" : "pointer",
              fontWeight: 600,
              padding: 0,
            }}
          >
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Resend Code 🔄"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: "8px" }}>
          <Link
            to={`/forgot-password?role=${searchParams.get("role") || "user"}`}
            style={{
              color: "#64748b",
              fontSize: "0.82rem",
              textDecoration: "none",
            }}
          >
            ← Change email address
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
    background: "radial-gradient(circle,rgba(56,189,248,0.18) 0%,transparent 70%)",
    top: "-200px",
    right: "-200px",
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
    border: "1px solid rgba(56, 189, 248, 0.25)",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
  },
  iconWrapper: {
    display: "flex",
    justifyContent: "center",
  },
  icon: {
    fontSize: "2.6rem",
    background: "rgba(56, 189, 248, 0.12)",
    padding: "12px 18px",
    borderRadius: "16px",
    border: "1px solid rgba(56, 189, 248, 0.3)",
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
  timerBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 16px",
    borderRadius: "20px",
    background: "rgba(56, 189, 248, 0.08)",
    border: "1px solid rgba(56, 189, 248, 0.2)",
    color: "#e2e8f0",
    fontSize: "0.88rem",
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
  otpBox: {
    width: "48px",
    height: "56px",
    textAlign: "center",
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#fff",
    background: "rgba(30, 41, 59, 0.7)",
    border: "1px solid rgba(148, 163, 184, 0.25)",
    borderRadius: "10px",
    outline: "none",
    transition: "all 0.2s ease",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
  },
};
