import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getRoleCredentials, saveRoleCredential, removeRoleCredential } from "../../utils/savedCredentials";

export default function UserAuth() {
  const [mode, setMode]               = useState("login"); // "login" | "signup"
  const [form, setForm]               = useState({ fullName: "", email: "", password: "" });
  const [rememberMe, setRememberMe]   = useState(true);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const [savedAccounts, setSavedAccounts] = useState([]);
  const [showDropdown, setShowDropdown]   = useState(false);
  const [isEditable, setIsEditable]       = useState(false);

  const { login, signup } = useAuth();
  const navigate          = useNavigate();
  const emailGroupRef     = useRef(null);

  // Load saved candidate credentials for dropdown — fields start EMPTY.
  // Credentials are only filled when the user explicitly selects an account.
  useEffect(() => {
    setIsEditable(false);
    if (mode === "login") {
      const creds = getRoleCredentials("candidate");
      setSavedAccounts(creds);
      // ✅ Do NOT auto-fill email/password here.
      // The dropdown will appear on email field focus; user must select explicitly.
    }
  }, [mode]);

  // Click outside listener for saved accounts dropdown
  useEffect(() => {
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
  };

  const handleRemoveSavedAccount = (e, accEmail) => {
    e.stopPropagation();
    removeRoleCredential("candidate", accEmail);
    const updated = savedAccounts.filter((a) => a.email.toLowerCase() !== accEmail.toLowerCase());
    setSavedAccounts(updated);
    if (form.email.toLowerCase() === accEmail.toLowerCase()) {
      setForm((f) => ({ ...f, email: "", password: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
        if (rememberMe) {
          saveRoleCredential("candidate", form.email, form.password);
        }
        navigate("/dashboard/user");
      } else {
        await signup({ ...form, role: "user" });
        setMode("login");
        setError("✅ Account created! Please log in.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.orb} />
      <div style={styles.card} className="glass fade-up">
        <div style={styles.logo}>👤</div>
        <h1 style={styles.title}>Job Seeker {mode === "login" ? "Login" : "Sign Up"}</h1>
        <p style={styles.sub}>
          {mode === "login" ? "Welcome back! Sign in to your candidate account." : "Create your free account and start your journey."}
        </p>

        {error && <div style={{ ...styles.alert, color: error.startsWith("✅") ? "#34d399" : "#f87171", borderColor: error.startsWith("✅") ? "#34d39940" : "#f8717140" }}>{error}</div>}

        <form style={styles.form} onSubmit={handleSubmit} autoComplete="off">
          {mode === "signup" && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input user" placeholder="John Doe" value={form.fullName} onChange={set("fullName")} required />
            </div>
          )}

          <div className="form-group" style={{ position: "relative" }} ref={emailGroupRef}>
            <label className="form-label">Email</label>
            <input
              className="form-input user"
              type="email"
              name="candidate_login_email_no_autofill"
              autoComplete="off"
              readOnly={!isEditable}
              placeholder="you@example.com"
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

            {/* Saved Candidate Accounts Dropdown */}
            {mode === "login" && showDropdown && savedAccounts.length > 0 && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownHeader}>
                  <span>SAVED CANDIDATE ACCOUNTS</span>
                </div>
                {savedAccounts.map((acc) => (
                  <div
                    key={acc.email}
                    style={styles.dropdownItem}
                    onClick={() => handleSelectSavedAccount(acc)}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 600, color: "#f3f4f6", fontSize: "0.85rem" }}>{acc.email}</span>
                      <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>Saved candidate login</span>
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

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label">Password</label>
              {mode === "login" && (
                <Link to="/forgot-password?role=user" style={{ fontSize: "0.8rem", color: "#a78bfa", textDecoration: "none", fontWeight: 500 }}>
                  Forgot Password?
                </Link>
              )}
            </div>
            <input
              className="form-input user"
              type="password"
              name="candidate_login_password_no_autofill"
              autoComplete="new-password"
              readOnly={!isEditable}
              placeholder="••••••••"
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
          </div>

          {mode === "login" && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "-4px" }}>
              <input
                type="checkbox"
                id="rememberMeCandidate"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: "#7c3aed", width: "16px", height: "16px", cursor: "pointer" }}
              />
              <label htmlFor="rememberMeCandidate" style={{ fontSize: "0.82rem", color: "#9ca3af", cursor: "pointer", userSelect: "none" }}>
                Remember Candidate Login
              </label>
            </div>
          )}

          <button type="submit" className="btn btn-user" style={{ width: "100%", justifyContent: "center", marginTop: "8px" }} disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p style={styles.toggle}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <span style={styles.link} onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>
            {mode === "login" ? "Sign Up" : "Log In"}
          </span>
        </p>
        <Link to="/" style={styles.back}>← Back to Home</Link>
      </div>
    </div>
  );
}

const C = "#7c3aed";
const styles = {
  page:  { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" },
  orb:   { position: "absolute", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 70%)", top: "-200px", left: "-200px", pointerEvents: "none" },
  card:  { width: "100%", maxWidth: "440px", padding: "48px 40px", display: "flex", flexDirection: "column", gap: "20px", border: "1px solid rgba(124,58,237,0.3)" },
  logo:  { fontSize: "2.5rem", textAlign: "center" },
  title: { textAlign: "center", fontSize: "1.6rem", fontWeight: 800, fontFamily: "'Outfit',sans-serif" },
  sub:   { textAlign: "center", color: "#7070a0", fontSize: "0.88rem" },
  alert: { padding: "10px 14px", borderRadius: "8px", border: "1px solid", fontSize: "0.87rem", background: "rgba(255,255,255,0.03)" },
  form:  { display: "flex", flexDirection: "column", gap: "16px" },
  toggle:{ textAlign: "center", fontSize: "0.85rem", color: "#7070a0" },
  link:  { color: C, cursor: "pointer", fontWeight: 600 },
  back:  { textAlign: "center", fontSize: "0.82rem", color: "#50507a", textDecoration: "none" },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0, right: 0,
    backgroundColor: "#0d1117",
    border: "1px solid rgba(124,58,237,0.4)",
    borderRadius: "12px",
    zIndex: 100,
    boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
    overflow: "hidden",
  },
  dropdownHeader: {
    padding: "8px 12px",
    fontSize: "0.68rem",
    fontWeight: 800,
    letterSpacing: "0.8px",
    color: "#a78bfa",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    backgroundColor: "rgba(124,58,237,0.1)",
  },
  dropdownItem: {
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    transition: "background 0.2s ease",
  },
  removeBtn: {
    background: "transparent",
    border: "none",
    color: "#6b7280",
    fontSize: "0.8rem",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "4px",
  },
};
