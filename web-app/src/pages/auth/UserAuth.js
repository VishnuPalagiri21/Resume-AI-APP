import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function UserAuth() {
  const [mode, setMode]       = useState("login"); // "login" | "signup"
  const [form, setForm]       = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const { login, signup }     = useAuth();
  const navigate              = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
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
          {mode === "login" ? "Welcome back! Sign in to your account." : "Create your free account and start your journey."}
        </p>

        {error && <div style={{ ...styles.alert, color: error.startsWith("✅") ? "#34d399" : "#f87171", borderColor: error.startsWith("✅") ? "#34d39940" : "#f8717140" }}>{error}</div>}

        <form style={styles.form} onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input user" placeholder="John Doe" value={form.fullName} onChange={set("fullName")} required />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input user" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
          </div>
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label">Password</label>
              {mode === "login" && (
                <Link to="/forgot-password" style={{ fontSize: "0.8rem", color: "#a78bfa", textDecoration: "none", fontWeight: 500 }}>
                  Forgot Password?
                </Link>
              )}
            </div>
            <input className="form-input user" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} required />
          </div>
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
};
