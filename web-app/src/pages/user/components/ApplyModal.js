import React from "react";

export default function ApplyModal({
  selectedJob, setSelectedJob,
  resumeSource, setResumeSource,
  uploadFile, setUploadFile,
  applyResumeId, setApplyResumeId,
  applicantName, setApplicantName,
  applicantEmail, setApplicantEmail,
  applicantPhone, setApplicantPhone,
  applicantLocation, setApplicantLocation,
  experienceYears, setExperienceYears,
  noticePeriod, setNoticePeriod,
  linkedinUrl, setLinkedinUrl,
  portfolioUrl, setPortfolioUrl,
  coverNote, setCoverNote,
  submittingApply, applyMsg,
  handleConfirmApply, resumes,
}) {
  if (!selectedJob) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div className="glass fade-up" style={{ width: "100%", maxWidth: "680px", maxHeight: "90vh", overflowY: "auto", padding: "32px", border: "1px solid rgba(139, 92, 246, 0.35)", borderRadius: "24px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)" }}>
        
        {/* Modal Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px" }}>
          <div>
            <span className="badge badge-premium" style={{ marginBottom: "8px" }}>JOB APPLICATION</span>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff" }}>{selectedJob.title}</h3>
            <div style={{ color: "var(--brand-secondary)", fontWeight: 600, fontSize: "0.95rem", marginTop: "4px" }}>
              🏢 {selectedJob.company} • 📍 {selectedJob.location} {selectedJob.salaryRange && `• 💰 ${selectedJob.salaryRange}`}
            </div>
          </div>
          <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: "1.2rem", borderRadius: "99px" }} onClick={() => setSelectedJob(null)}>✕</button>
        </div>

        {/* Notification alert */}
        {applyMsg && (
          <div style={{ padding: "14px 18px", borderRadius: "12px", marginBottom: "24px", fontSize: "0.95rem", fontWeight: 600, background: applyMsg.startsWith("✅") ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", color: applyMsg.startsWith("✅") ? "#34d399" : "#f87171", border: `1px solid ${applyMsg.startsWith("✅") ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}` }}>
            {applyMsg}
          </div>
        )}

        <form onSubmit={handleConfirmApply} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* 1. RESUME ATTACHMENT SECTION */}
          <div className="glass-panel" style={{ padding: "20px" }}>
            <label className="form-label" style={{ marginBottom: "12px", display: "block", fontSize: "0.95rem", color: "#fff", fontWeight: 700 }}>
              📄 Resume Attachment (Required)
            </label>

            {/* Source Tabs */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              <button
                type="button"
                className={`btn ${resumeSource === "upload" ? "btn-primary" : "btn-ghost"}`}
                style={{ flex: 1, padding: "10px", fontSize: "0.85rem" }}
                onClick={() => setResumeSource("upload")}
              >
                📤 Upload New Resume PDF
              </button>
              <button
                type="button"
                className={`btn ${resumeSource === "existing" ? "btn-primary" : "btn-ghost"}`}
                style={{ flex: 1, padding: "10px", fontSize: "0.85rem" }}
                onClick={() => setResumeSource("existing")}
              >
                ⚡ Select Analyzed Resume
              </button>
            </div>

            {resumeSource === "upload" ? (
              <div>
                <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", border: "2px dashed rgba(139, 92, 246, 0.4)", borderRadius: "12px", background: "rgba(139, 92, 246, 0.05)", cursor: "pointer", transition: "all 0.2s" }}>
                  <span style={{ fontSize: "2rem", marginBottom: "8px" }}>📄</span>
                  <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
                    {uploadFile ? uploadFile.name : "Click or Drag PDF Resume Here"}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {uploadFile ? `${(uploadFile.size / 1024).toFixed(1)} KB • PDF Document` : "Supports PDF files up to 5MB • AI will auto-calculate ATS score"}
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    style={{ display: "none" }}
                    onChange={(e) => setUploadFile(e.target.files[0] || null)}
                  />
                </label>
              </div>
            ) : (
              <div>
                {resumes.length === 0 ? (
                  <div style={{ padding: "14px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.15)", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    No analyzed resumes found. Select <strong>Upload New Resume PDF</strong> above to upload your resume directly.
                  </div>
                ) : (
                  <select className="form-input" value={applyResumeId} onChange={(e) => setApplyResumeId(e.target.value)} style={{ width: "100%" }}>
                    {resumes.map(r => (
                      <option key={r._id} value={r._id} style={{ background: "#0f172a", color: "#fff" }}>
                        {r.fileName || "Resume"} (ATS Score: {r.atsScore}%)
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          {/* 2. CANDIDATE PERSONAL DETAILS GRID */}
          <div>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
              👤 Applicant Details
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={applicantName} onChange={(e) => setApplicantName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" value={applicantEmail} onChange={(e) => setApplicantEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" placeholder="+1 (555) 000-0000" value={applicantPhone} onChange={(e) => setApplicantPhone(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Current Location</label>
                <input className="form-input" placeholder="City, Country" value={applicantLocation} onChange={(e) => setApplicantLocation(e.target.value)} />
              </div>
            </div>
          </div>

          {/* 3. SCREENING & EXPERIENCE QUESTIONS */}
          <div>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
              💼 Experience & Screening
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Total Experience</label>
                <select className="form-input" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)}>
                  <option value="Fresh Graduate / <1 Yr" style={{ background: "#0f172a" }}>Fresh Graduate / &lt;1 Yr</option>
                  <option value="1–3 Years" style={{ background: "#0f172a" }}>1–3 Years</option>
                  <option value="3–5 Years" style={{ background: "#0f172a" }}>3–5 Years</option>
                  <option value="5+ Years" style={{ background: "#0f172a" }}>5+ Years</option>
                  <option value="10+ Years" style={{ background: "#0f172a" }}>10+ Years</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notice Period / Availability</label>
                <select className="form-input" value={noticePeriod} onChange={(e) => setNoticePeriod(e.target.value)}>
                  <option value="Immediate" style={{ background: "#0f172a" }}>Immediate</option>
                  <option value="15 Days" style={{ background: "#0f172a" }}>15 Days</option>
                  <option value="30 Days" style={{ background: "#0f172a" }}>30 Days</option>
                  <option value="60 Days" style={{ background: "#0f172a" }}>60 Days</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">LinkedIn Profile URL</label>
                <input className="form-input" placeholder="https://linkedin.com/in/username" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Portfolio / GitHub URL</label>
                <input className="form-input" placeholder="https://github.com/username" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} />
              </div>
            </div>
          </div>

          {/* 4. COVER NOTE & PITCH */}
          <div>
            <label className="form-label" style={{ marginBottom: "8px", display: "block" }}>Cover Note / Pitch (Optional)</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Introduce yourself or highlight why your skills match this role..."
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              style={{ width: "100%", resize: "vertical" }}
            />
          </div>

          {/* Submit Buttons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "8px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setSelectedJob(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: "14px", fontSize: "1rem" }} disabled={submittingApply}>
              {submittingApply ? "Calculating ATS & Submitting..." : "Submit Job Application 🚀"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
