import React from "react";

export default function ApplicationsTab({
  apps, getBadgeStyle, getScoreColor, setTimelineModalApp, timelineModalApp,
}) {
  return (
    <div className="fade-up">
      <header style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "'Outfit',sans-serif", color: "#fff" }}>My Applications 📋</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Track the live status of your applications and view your complete hiring timeline.</p>
      </header>
      
      {apps.length === 0 ? <p style={{ color: "var(--text-muted)" }}>You haven't applied to any jobs yet.</p> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Job Title</th><th>Company</th><th>Match Score</th><th>Applied Date</th><th>Current Status</th><th>Audit Trail</th></tr></thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a._id}>
                  <td style={{ fontWeight: 700, color: "#fff" }}>{a.jobId?.title || "Job"}</td>
                  <td style={{ color: "var(--text-muted)" }}>{a.jobId?.company || "Company"}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontWeight: 800, color: getScoreColor(a.atsScore) }}>{a.atsScore}%</span>
                      <div className="ats-bar-bg" style={{ width: "60px", height: "4px", background: "rgba(255,255,255,0.1)" }}>
                        <div className="ats-bar-fill" style={{ width: `${a.atsScore}%`, background: getScoreColor(a.atsScore) }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span style={{
                      ...getBadgeStyle(a.status),
                      padding: "4px 12px", borderRadius: "99px", fontSize: "0.78rem", fontWeight: 700, display: "inline-block"
                    }}>
                      {a.status ? a.status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "Applied"}
                    </span>
                    {a.rejectionReason && a.status === "rejected" && (
                      <div style={{ fontSize: "0.72rem", color: "#f87171", marginTop: "4px" }}>
                        Reason: {a.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: "0.78rem", padding: "6px 12px", borderColor: "rgba(103,232,249,0.3)" }}
                      onClick={() => setTimelineModalApp(a)}
                    >
                      🕒 View Timeline
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Status Audit Trail Timeline Modal */}
      {timelineModalApp && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999, padding: "20px"
          }}
          onClick={() => setTimelineModalApp(null)}
        >
          <div
            className="glass"
            style={{ maxWidth: "540px", width: "100%", padding: "32px", borderRadius: "18px", position: "relative" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={{ position: "absolute", top: "18px", right: "18px", background: "none", border: "none", color: "#94a3b8", fontSize: "1.3rem", cursor: "pointer" }}
              onClick={() => setTimelineModalApp(null)}
            >
              ✕
            </button>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "4px", color: "#fff" }}>
              Live Application Timeline 🕒
            </h3>
            <p style={{ color: "#94a3b8", fontSize: "0.88rem", marginBottom: "24px" }}>
              Status audit trail for {timelineModalApp.jobId?.title} at {timelineModalApp.jobId?.company}.
            </p>

            {/* Progress Steps Graphic */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", position: "relative", padding: "0 10px" }}>
              <div style={{ position: "absolute", top: "14px", left: "24px", right: "24px", height: "3px", background: "rgba(255,255,255,0.1)", zIndex: 0 }} />
              {["Applied", "Under Review", "Shortlisted", "Selected"].map((step, idx) => {
                const statusList = (timelineModalApp.statusHistory || []).map(h => (h.status || "").toLowerCase());
                const stepSlug = step.toLowerCase().replace(" ", "_");
                const isReached = statusList.some(s => s.includes(stepSlug) || s === step.toLowerCase()) || (idx === 0);
                const isCurrent = (timelineModalApp.status || "").toLowerCase().replace("_", " ") === step.toLowerCase();
                return (
                  <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, width: "70px" }}>
                    <div
                      style={{
                        width: "30px", height: "30px", borderRadius: "50%",
                        background: isCurrent ? "#06b6d4" : isReached ? "#10b981" : "#1e293b",
                        border: isCurrent ? "3px solid #67e8f9" : "1px solid rgba(255,255,255,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.8rem"
                      }}
                    >
                      {isReached ? "✓" : idx + 1}
                    </div>
                    <span style={{ fontSize: "0.72rem", marginTop: "6px", color: isCurrent ? "#67e8f9" : isReached ? "#34d399" : "#94a3b8", textAlign: "center", fontWeight: isCurrent ? 700 : 500 }}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* History List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "260px", overflowY: "auto" }}>
              {(timelineModalApp.statusHistory || []).map((h, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "10px", background: "rgba(255,255,255,0.03)", borderRadius: "10px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#67e8f9", marginTop: "5px", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>{h.status}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.78rem", marginTop: "2px" }}>
                      {new Date(h.timestamp).toLocaleString()} · {h.updatedBy || "System"}
                    </div>
                    {h.reason && (
                      <div style={{ color: "#f87171", fontSize: "0.78rem", marginTop: "4px" }}>
                        Reason: {h.reason}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "24px", textAlign: "right" }}>
              <button className="btn btn-ghost" onClick={() => setTimelineModalApp(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
