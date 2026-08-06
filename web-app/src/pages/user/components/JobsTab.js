import React from "react";

export default function JobsTab({ jobs, apps, loadData, handleOpenApply }) {
  return (
    <div className="fade-up">
      <header style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "'Outfit',sans-serif", color: "#fff" }}>Browse Jobs 💼</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "4px" }}>Explore open positions posted by recruiters and apply directly with your ATS resume.</p>
        </div>
        <button className="btn btn-ghost" style={{ padding: "8px 16px" }} onClick={() => loadData()}>
          🔄 Refresh Jobs
        </button>
      </header>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
        {jobs.length === 0 ? (
          <div className="glass" style={{ padding: "40px", gridColumn: "1 / -1", textAlign: "center", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "1.1rem", marginBottom: "8px" }}>No active jobs posted at the moment.</p>
            <p style={{ fontSize: "0.85rem" }}>Jobs posted by recruiters will appear here instantly.</p>
          </div>
        ) : (
          jobs.map((j) => {
            const isApplied = apps.some(a => a.jobId?.title === j.title || a.job_id === j._id);
            return (
              <div key={j._id} className="glass" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "#fff", marginBottom: "4px" }}>{j.title}</div>
                  <div style={{ color: "var(--brand-secondary)", fontSize: "0.9rem", fontWeight: 600, marginBottom: "12px" }}>{j.company}</div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "16px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>📍 {j.location}</span>
                    {j.salaryRange && <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>💰 {j.salaryRange}</span>}
                  </div>

                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "16px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {j.description}
                  </p>

                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "24px" }}>
                    {j.skillsRequired?.slice(0, 4).map((s) => (
                      <span key={s} style={{ background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", border: "1px solid rgba(255,255,255,0.1)" }}>{s}</span>
                    ))}
                    {j.skillsRequired?.length > 4 && <span style={{ padding: "4px", fontSize: "0.75rem", color: "var(--text-muted)" }}>+{j.skillsRequired.length - 4} more</span>}
                  </div>
                </div>

                {isApplied ? (
                  <button className="btn" disabled style={{ width: "100%", padding: "12px", background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)", cursor: "default" }}>
                    ✓ Applied
                  </button>
                ) : (
                  <button className="btn btn-primary" style={{ width: "100%", padding: "12px" }} onClick={() => handleOpenApply(j)}>
                    Apply Now 🚀
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
