import React from "react";

export default function ProfileView({ user, onLogout }) {
  const roleLabel = (user?.role || "user").toUpperCase();

  return (
    <div style={{ padding: "10px", maxWidth: "1000px", margin: "0 auto", width: "100%" }} className="fade-up">
      {/* Header Title */}
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
          My Profile <span style={{ fontSize: "1.5rem" }}>👤</span>
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: "4px 0 0 0" }}>
          Account details & session controls
        </p>
      </div>

      {/* Profile Card Centered */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
        <div style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2.2rem",
          color: "#fff",
          marginBottom: "12px",
          boxShadow: "0 8px 24px rgba(139, 92, 246, 0.4)",
          border: "2px solid rgba(255, 255, 255, 0.2)"
        }}>
          👤
        </div>
        <h3 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", margin: "0 0 4px 0" }}>
          {user?.fullName || "User Account"}
        </h3>
        <div style={{ color: "#94a3b8", fontSize: "0.95rem", marginBottom: "12px" }}>
          {user?.email}
        </div>
        <div style={{
          background: "rgba(139, 92, 246, 0.15)",
          border: "1px solid rgba(139, 92, 246, 0.3)",
          color: "#a78bfa",
          padding: "4px 16px",
          borderRadius: "99px",
          fontSize: "0.82rem",
          fontWeight: 700,
          letterSpacing: "0.05em"
        }}>
          Role: {roleLabel}
        </div>
      </div>

      {/* Account Information Section */}
      <div style={{
        background: "#1e293b",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "28px"
      }}>
        <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff", margin: "0 0 20px 0" }}>
          Account Information
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <span style={{ color: "#94a3b8", fontSize: "0.92rem", fontWeight: 500 }}>Full Name:</span>
            <span style={{ color: "#f8fafc", fontSize: "0.95rem", fontWeight: 700 }}>{user?.fullName || "N/A"}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <span style={{ color: "#94a3b8", fontSize: "0.92rem", fontWeight: 500 }}>Email:</span>
            <span style={{ color: "#f8fafc", fontSize: "0.95rem", fontWeight: 700 }}>{user?.email || "N/A"}</span>
          </div>

          {user?.company && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <span style={{ color: "#94a3b8", fontSize: "0.92rem", fontWeight: 500 }}>Company Name:</span>
              <span style={{ color: "#38bdf8", fontSize: "0.95rem", fontWeight: 700 }}>{user.company}</span>
            </div>
          )}

          {user?.phone && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <span style={{ color: "#94a3b8", fontSize: "0.92rem", fontWeight: 500 }}>Phone Number:</span>
              <span style={{ color: "#f8fafc", fontSize: "0.95rem", fontWeight: 700 }}>{user.phone}</span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#94a3b8", fontSize: "0.92rem", fontWeight: 500 }}>System Role:</span>
            <span style={{ color: "#a78bfa", fontSize: "0.95rem", fontWeight: 700 }}>{roleLabel}</span>
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
      <button
        onClick={onLogout}
        style={{
          width: "100%",
          padding: "16px",
          backgroundColor: "#ef4444",
          color: "#ffffff",
          border: "none",
          borderRadius: "14px",
          fontSize: "1.05rem",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 6px 20px rgba(239, 68, 68, 0.3)",
          transition: "transform 0.15s ease, background 0.15s ease",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
      >
        Sign Out of Session
      </button>
    </div>
  );
}
