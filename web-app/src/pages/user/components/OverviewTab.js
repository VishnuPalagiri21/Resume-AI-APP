import React from "react";

export default function OverviewTab({
  stats, apps, resumes, firstName, todayDateStr, getScoreColor, setTab,
}) {
  return (
    <div className="stellar-center-col fade-up" style={{ width: "100%", maxWidth: "1250px" }}>
      {/* Greeting Card Banner */}
      <div className="stellar-greeting-card">
        <div className="stellar-greeting-date">
          <span>☀️</span> {todayDateStr}
        </div>
        <h2 className="stellar-greeting-title">
          Good afternoon, <span style={{ color: "#06b6d4" }}>{firstName.toUpperCase()}</span>
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "1.05rem", marginBottom: "22px" }}>
          Here is what's happening with your job search and ATS scans today.
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <span style={{ background: "rgba(139, 92, 246, 0.15)", padding: "6px 14px", borderRadius: "99px", fontSize: "0.82rem", fontWeight: 700, color: "#c4b5fd", border: "1px solid rgba(139, 92, 246, 0.3)" }}>
            📄 {stats.resumeCount || 0} Resumes Uploaded
          </span>
          <span style={{ background: "rgba(6, 182, 212, 0.15)", padding: "6px 14px", borderRadius: "99px", fontSize: "0.82rem", fontWeight: 700, color: "#06b6d4", border: "1px solid rgba(6, 182, 212, 0.3)" }}>
            🚀 {stats.applicationCount || 0} Jobs Applied
          </span>
          <span style={{ background: "rgba(16, 185, 129, 0.15)", padding: "6px 14px", borderRadius: "99px", fontSize: "0.82rem", fontWeight: 700, color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
            💼 {stats.activeJobs || 0} Active Job Listings
          </span>
          {stats.underReview > 0 && (
            <span style={{ background: "rgba(249,115,22,0.15)", padding: "6px 14px", borderRadius: "99px", fontSize: "0.82rem", fontWeight: 700, color: "#fb923c", border: "1px solid rgba(249,115,22,0.3)", cursor: "pointer" }} onClick={() => setTab("applications")}>
              🔎 {stats.underReview} Under Review
            </span>
          )}
          {stats.shortlisted > 0 && (
            <span style={{ background: "rgba(139,92,246,0.15)", padding: "6px 14px", borderRadius: "99px", fontSize: "0.82rem", fontWeight: 700, color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.3)", cursor: "pointer" }} onClick={() => setTab("applications")}>
              ⭐ {stats.shortlisted} Shortlisted
            </span>
          )}
          {stats.selected > 0 && (
            <span style={{ background: "rgba(16,185,129,0.15)", padding: "6px 14px", borderRadius: "99px", fontSize: "0.82rem", fontWeight: 700, color: "#34d399", border: "1px solid rgba(16,185,129,0.3)", cursor: "pointer" }} onClick={() => setTab("applications")}>
              🎉 {stats.selected} Selected
            </span>
          )}
        </div>
      </div>

      {/* 3 Stats Hero Cards */}
      <div className="stellar-practice-grid" style={{ marginBottom: "32px" }}>
        <div className="stellar-card" style={{ padding: "28px" }}>
          <div>
            <div className="stellar-card-icon" style={{ borderColor: "rgba(139, 92, 246, 0.3)", background: "rgba(139, 92, 246, 0.08)" }}>
              📄
            </div>
            <h4 className="stellar-card-title">Resumes Uploaded</h4>
            <p className="stellar-card-sub">
              Total resumes scanned & stored in your vault.
            </p>
            <div style={{ fontSize: "2.5rem", fontWeight: 900, fontFamily: "'Outfit',sans-serif", color: "#fff", marginBottom: "16px" }}>
              {stats.resumeCount || 0}
            </div>
          </div>
          <button className="stellar-action-btn" onClick={() => setTab("analyzer")}>
            <span>✦</span> New ATS Scan
          </button>
        </div>

        <div className="stellar-card" style={{ padding: "28px" }}>
          <div>
            <div className="stellar-card-icon" style={{ borderColor: "rgba(6, 182, 212, 0.3)", background: "rgba(6, 182, 212, 0.08)" }}>
              🚀
            </div>
            <h4 className="stellar-card-title">Jobs Applied</h4>
            <p className="stellar-card-sub">
              Applications tracked across target companies.
            </p>
            <div style={{ fontSize: "2.5rem", fontWeight: 900, fontFamily: "'Outfit',sans-serif", color: "#06b6d4", marginBottom: "16px" }}>
              {stats.applicationCount || 0}
            </div>
          </div>
          <button className="stellar-action-btn" onClick={() => setTab("applications")}>
            <span>✦</span> View Applications
          </button>
        </div>

        <div className="stellar-card" style={{ padding: "28px" }}>
          <div>
            <div className="stellar-card-icon" style={{ borderColor: "rgba(16, 185, 129, 0.3)", background: "rgba(16, 185, 129, 0.08)" }}>
              💼
            </div>
            <h4 className="stellar-card-title">Active Jobs</h4>
            <p className="stellar-card-sub">
              Open positions matching your skill profile.
            </p>
            <div style={{ fontSize: "2.5rem", fontWeight: 900, fontFamily: "'Outfit',sans-serif", color: "#34d399", marginBottom: "16px" }}>
              {stats.activeJobs || 0}
            </div>
          </div>
          <button className="stellar-action-btn" onClick={() => setTab("jobs")}>
            <span>✦</span> Browse Jobs
          </button>
        </div>
      </div>

      {/* 2 Side-by-Side Glass Cards: Recent Applications & Recent ATS Scans */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
        {/* Recent Applications Card */}
        <div className="stellar-card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "'Outfit',sans-serif", color: "#fff", margin: 0 }}>
              Recent Applications 📋
            </h3>
            <span className="badge badge-premium">{apps.length} Total</span>
          </div>

          {apps.slice(0, 4).length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "0.95rem" }}>No applications yet. Start applying to jobs!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {apps.slice(0, 4).map((a) => (
                <div
                  key={a._id}
                  style={{
                    padding: "16px 18px",
                    borderRadius: "14px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: "1.02rem" }}>{a.jobId?.title}</div>
                    <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "3px" }}>{a.jobId?.company}</div>
                  </div>
                  <span className="badge badge-premium">{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent ATS Scans Card */}
        <div className="stellar-card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "'Outfit',sans-serif", color: "#fff", margin: 0 }}>
              Recent ATS Scans 🎯
            </h3>
            <span className="badge badge-premium" style={{ background: "rgba(6, 182, 212, 0.15)", color: "#06b6d4" }}>
              {resumes.length} Scans
            </span>
          </div>

          {resumes.slice(0, 4).length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "0.95rem" }}>No resumes analyzed yet. Head to the Analyzer!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {resumes.slice(0, 4).map((r) => (
                <div
                  key={r._id}
                  style={{
                    padding: "16px 18px",
                    borderRadius: "14px",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div style={{ overflow: "hidden", paddingRight: "16px" }}>
                    <div style={{ fontWeight: 700, color: "#fff", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                      {r.fileName}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "3px" }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    <span style={{ fontSize: "1.25rem", fontWeight: 900, fontFamily: "'Outfit',sans-serif", color: getScoreColor(r.atsScore) }}>
                      {r.atsScore}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
