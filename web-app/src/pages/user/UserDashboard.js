import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import ProfileView from "../../components/ProfileView";

const NAV_GROUPS = [
  {
    category: "MAIN NAVIGATION",
    items: [
      { id: "overview",     icon: "📊", label: "Dashboard" },
      { id: "analyzer",     icon: "🎯", label: "ATS Analyzer" },
      { id: "jobs",         icon: "💼", label: "Browse Jobs" },
      { id: "applications", icon: "📋", label: "Applications" },
      { id: "editor",       icon: "✏️", label: "Resume Editor" },
      { id: "profile",      icon: "👤", label: "My Profile" },
    ],
  },
];

export default function UserDashboard() {
  const { user, logout }     = useAuth();
  const navigate             = useNavigate();
  const [tab, setTab]        = useState("overview");
  
  const [stats, setStats]    = useState({});
  const [jobs, setJobs]      = useState([]);
  const [apps, setApps]      = useState([]);
  const [resumes, setResumes]= useState([]);
  const [loading, setLoading]= useState(true);

  // Analyzer Form State
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Comprehensive Apply Modal State
  const [selectedJob, setSelectedJob]         = useState(null);
  const [resumeSource, setResumeSource]       = useState("upload"); // "upload" or "existing"
  const [uploadFile, setUploadFile]           = useState(null);
  const [applyResumeId, setApplyResumeId]     = useState("");
  
  // Screening & Applicant Details State
  const [applicantName, setApplicantName]     = useState("");
  const [applicantEmail, setApplicantEmail]   = useState("");
  const [applicantPhone, setApplicantPhone]   = useState("");
  const [applicantLocation, setApplicantLocation] = useState("");
  const [experienceYears, setExperienceYears] = useState("1–3 Years");
  const [noticePeriod, setNoticePeriod]       = useState("Immediate");
  const [linkedinUrl, setLinkedinUrl]         = useState("");
  const [portfolioUrl, setPortfolioUrl]       = useState("");
  const [coverNote, setCoverNote]             = useState("");

  const [submittingApply, setSubmittingApply] = useState(false);
  const [applyMsg, setApplyMsg]               = useState("");

  const loadData = useCallback(async () => {
    try {
      const [s, j, a, r] = await Promise.all([
        API.get("/api/user/stats"),
        API.get("/api/user/jobs"),
        API.get("/api/user/applications"),
        API.get("/api/dashboard/resumes"),
      ]);
      setStats(s.data);
      setJobs(j.data.jobs || []);
      setApps(a.data.applications || []);
      setResumes(r.data.resumes || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  // Re-fetch fresh data whenever tab changes
  useEffect(() => { loadData(); }, [tab, loadData]);

  const handleOpenApply = (job) => {
    setSelectedJob(job);
    setResumeSource(resumes.length > 0 ? "existing" : "upload");
    setUploadFile(null);
    setApplyResumeId(resumes[0]?._id || "");
    setApplicantName(user?.fullName || "");
    setApplicantEmail(user?.email || "");
    setApplicantPhone(user?.phone || "");
    setApplicantLocation("");
    setExperienceYears("1–3 Years");
    setNoticePeriod("Immediate");
    setLinkedinUrl("");
    setPortfolioUrl("");
    setCoverNote("");
    setApplyMsg("");
  };

  const handleConfirmApply = async (e) => {
    e.preventDefault();
    setSubmittingApply(true);
    setApplyMsg("");

    try {
      let res;
      if (resumeSource === "upload") {
        if (!uploadFile) {
          setApplyMsg("❌ Please select a PDF resume file to upload");
          setSubmittingApply(false);
          return;
        }
        const formData = new FormData();
        formData.append("resumeFile", uploadFile);
        formData.append("fullName", applicantName);
        formData.append("email", applicantEmail);
        formData.append("phone", applicantPhone);
        formData.append("location", applicantLocation);
        formData.append("experienceYears", experienceYears);
        formData.append("noticePeriod", noticePeriod);
        formData.append("linkedinUrl", linkedinUrl);
        formData.append("portfolioUrl", portfolioUrl);
        formData.append("coverNote", coverNote);

        res = await API.post(`/api/user/jobs/${selectedJob._id}/apply`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await API.post(`/api/user/jobs/${selectedJob._id}/apply`, {
          resumeId: applyResumeId || null,
          fullName: applicantName,
          email: applicantEmail,
          phone: applicantPhone,
          location: applicantLocation,
          experienceYears,
          noticePeriod,
          linkedinUrl,
          portfolioUrl,
          coverNote,
        });
      }

      const scoreText = res.data.application?.atsScore ? ` (ATS Match: ${res.data.application.atsScore}%)` : "";
      setApplyMsg(`✅ Application submitted successfully!${scoreText}`);
      await loadData();
      setTimeout(() => {
        setSelectedJob(null);
        setTab("applications");
      }, 1400);
    } catch (err) {
      setApplyMsg("❌ " + (err.response?.data?.message || "Failed to submit application"));
    } finally {
      setSubmittingApply(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a resume PDF");
    setAnalyzing(true);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append("resume", file);
    if (jobDescription) {
      formData.append("jobDescription", jobDescription);
    }

    try {
      const res = await API.post("/api/resumes/resumes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnalysisResult(res.data.resume);
      loadData(); // refresh list
    } catch (err) {
      alert("Analysis failed: " + (err.response?.data?.message || err.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981"; // Green
    if (score >= 50) return "#f59e0b"; // Yellow
    return "#ef4444"; // Red
  };

  const handleAutoTailor = async () => {
    if (!analysisResult?.extractedText) return;
    try {
      const title = `Tailored ${analysisResult.fileName || "Resume"}`;
      setAnalyzing(true);
      const res = await API.post("/api/editor/auto-tailor", {
        resumeText: analysisResult.extractedText,
        jobDescription: jobDescription,
        title: title,
      });
      // Redirect to the editor with the new document loaded
      navigate(`/editor?docId=${res.data.document._id}`);
    } catch (err) {
      alert("Failed to auto-tailor: " + (err.response?.data?.message || err.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const todayDateStr = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
  const firstName = user?.fullName?.split(" ")[0] || "SEEKER";
  const initials = (user?.fullName || "PV").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="stellar-dashboard-layout">
      <div className="noise-overlay" />

      {/* Left Sidebar */}
      <aside className="stellar-sidebar">
        <div>
          <div className="stellar-brand-logo">
            <div className="stellar-brand-icon">⚡</div>
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: 900, fontFamily: "'Outfit',sans-serif", color: "#fff", letterSpacing: "-0.03em" }}>
                ResumeAI
              </div>
              <div style={{ fontSize: "0.72rem", color: "#06b6d4", fontWeight: 800, letterSpacing: "0.08em" }}>
                CAREER SUITE
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "calc(100vh - 180px)", overflowY: "auto", paddingRight: "4px" }}>
            {NAV_GROUPS.map((grp) => (
              <div key={grp.category}>
                <div className="stellar-nav-section-label">{grp.category}</div>
                {grp.items.map((n) => (
                  <button
                    key={n.id}
                    className={`stellar-nav-btn ${tab === n.id ? "active" : ""}`}
                    onClick={() => n.id === "editor" ? navigate("/editor") : setTab(n.id)}
                  >
                    <span style={{ fontSize: "1.15rem" }}>{n.icon}</span>
                    <span>{n.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Profile Card Bottom */}
        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "16px", marginTop: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div
              style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden", cursor: "pointer" }}
              onClick={() => setTab("profile")}
              title="View Profile"
            >
              <div className="stellar-avatar-circle">{initials}</div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#fff", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                  {user?.fullName || "Palagiri Seeker"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                  {user?.email || "seeker@resumeai.dev"}
                </div>
              </div>
            </div>
          </div>
          <button
            className="btn btn-ghost"
            style={{ width: "100%", padding: "10px", fontSize: "0.85rem", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px" }}
            onClick={handleLogout}
          >
            Sign Out →
          </button>
        </div>
      </aside>

      {/* Main Column Wrapper */}
      <div className="stellar-main-wrapper">
        {/* Sticky Topbar */}
        <header className="stellar-topbar">
          <div>
            <h1 className="stellar-topbar-title">
              {tab === "overview" && "Dashboard"}
              {tab === "analyzer" && "ATS Resume Analyzer"}
              {tab === "jobs" && "Browse Jobs & Internships"}
              {tab === "applications" && "My Applications"}
              {tab === "profile" && "My Profile"}
            </h1>
            <div style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>
              AI-Powered Resume & Job Search Command Center
            </div>
          </div>

          <div className="stellar-profile-badge">
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginRight: "8px" }}>
              <span style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", padding: "6px 12px", borderRadius: "99px", fontSize: "0.78rem", fontWeight: 800, border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                🔥 {stats.streakDays || 5} Day Streak
              </span>
              <button className="stellar-notif-btn" title="Notifications">
                <span>🔔</span>
              </button>
            </div>
            <div className="stellar-avatar-circle" onClick={() => setTab("profile")} title="Click to view Profile" style={{ cursor: "pointer" }}>
              {initials}
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="stellar-content-area">
          {loading ? (
            <div style={{ display: "flex", height: "400px", width: "100%", alignItems: "center", justifyContent: "center", color: "#06b6d4", fontSize: "1.3rem", fontWeight: 700 }}>
              ⚡ Launching AI Dashboard...
            </div>
          ) : (
            <>
              {/* OVERVIEW TAB */}
              {tab === "overview" && (
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
                    </div>
                  </div>

                  {/* 3 Stats Hero Cards (Designed like the reference interior cards) */}
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
              )}

            {/* ATS ANALYZER TAB */}
            {tab === "analyzer" && (
              <div className="fade-up">
                <header style={{ marginBottom: "32px" }}>
                  <h1 style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "'Outfit',sans-serif", color: "#fff", marginBottom: "8px" }}>ATS Resume Analyzer 🎯</h1>
                  <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: "800px", lineHeight: 1.6 }}>
                    Upload your resume and a target job description. Our Gemini AI model will dissect your experience, extract missing keywords, and provide a strict, highly accurate ATS match score along with actionable feedback.
                  </p>
                </header>

                <div className="ats-grid-layout">
                  
                  {/* Upload Panel (Left Column) */}
                  <div className="glass" style={{ padding: "32px", display: "flex", flexDirection: "column", height: "100%" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "24px", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "var(--brand-primary)" }}>1.</span> Input Data
                    </h3>
                    <form onSubmit={handleAnalyze} style={{ display: "flex", flexDirection: "column", gap: "24px", flex: 1, justifyContent: "space-between" }}>
                      
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ marginBottom: "12px", display: "block" }}>Upload Resume (PDF)</label>
                        <div style={{ position: "relative", border: "2px dashed rgba(255,255,255,0.15)", borderRadius: "var(--radius-md)", padding: "32px", textAlign: "center", background: "rgba(0,0,0,0.2)", transition: "all 0.3s ease", cursor: "pointer" }}
                             onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--brand-primary)"}
                             onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"}>
                          <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} required style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} />
                          <div style={{ fontSize: "2rem", marginBottom: "12px" }}>📄</div>
                          <div style={{ fontWeight: 600, color: "#fff", marginBottom: "4px" }}>{file ? file.name : "Click or drag PDF here"}</div>
                          {!file && <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Supports standard PDF formats</div>}
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Target Job Description</label>
                        <textarea 
                          className="form-input" 
                          placeholder="Paste the job requirements and responsibilities here. The AI will strictly evaluate your resume against these requirements..." 
                          rows={8} 
                          value={jobDescription} 
                          onChange={(e) => setJobDescription(e.target.value)} 
                          style={{ resize: "vertical", background: "rgba(0,0,0,0.3)" }} 
                        />
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "18px", fontSize: "1.05rem" }} disabled={analyzing}>
                        {analyzing ? (
                          <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span className="floating" style={{ display: "inline-block" }}>🧠</span> Analyzing via Gemini AI...
                          </span>
                        ) : "Scan & Analyze Resume 🚀"}
                      </button>
                    </form>
                  </div>

                  {/* Results Panel (Right Column - Fills Empty Space) */}
                  <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    {analysisResult ? (
                      <div className="glass fade-up" style={{ padding: "40px", border: `1px solid ${getScoreColor(analysisResult.atsScore)}40`, height: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
                          <div>
                            <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", marginBottom: "4px" }}>AI Analysis Report</h3>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Analyzed securely via Gemini</p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 700 }}>Match Score</div>
                            <div style={{ fontSize: "3rem", fontWeight: 900, fontFamily: "'Outfit',sans-serif", color: getScoreColor(analysisResult.atsScore), lineHeight: 1.1 }}>
                              {analysisResult.atsScore}%
                            </div>
                          </div>
                        </div>

                        <div className="ats-bar-bg" style={{ height: "8px", marginBottom: "40px", background: "rgba(255,255,255,0.05)" }}>
                          <div className="ats-bar-fill" style={{ width: `${analysisResult.atsScore}%`, background: getScoreColor(analysisResult.atsScore) }} />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
                          <div className="glass-panel" style={{ padding: "20px" }}>
                            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ color: "#10b981" }}>✓</span> Matched Skills
                            </h4>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              {analysisResult.matchedSkills?.length ? analysisResult.matchedSkills.map(s => (
                                <span key={s} style={{ background: "rgba(16,185,129,0.1)", color: "#34d399", padding: "4px 12px", borderRadius: "6px", fontSize: "0.85rem", border: "1px solid rgba(16,185,129,0.2)", fontWeight: 600 }}>{s}</span>
                              )) : <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No exact matches found.</span>}
                            </div>
                          </div>

                          <div className="glass-panel" style={{ padding: "20px" }}>
                            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ color: "#ef4444" }}>✗</span> Missing Skills
                            </h4>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              {analysisResult.missingSkills?.length ? analysisResult.missingSkills.map(s => (
                                <span key={s} style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", padding: "4px 12px", borderRadius: "6px", fontSize: "0.85rem", border: "1px solid rgba(239,68,68,0.2)", fontWeight: 600 }}>{s}</span>
                              )) : <span style={{ color: "#10b981", fontSize: "0.9rem", fontWeight: 600 }}>You have all required skills!</span>}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ color: "var(--brand-secondary)" }}>💡</span> AI Recommendations
                          </h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                            {analysisResult.suggestions?.map((s, i) => (
                              <div key={i} className="glass-panel" style={{ padding: "16px", borderLeft: "3px solid var(--brand-secondary)", fontSize: "0.95rem", lineHeight: 1.6, color: "var(--text)" }}>
                                {s}
                              </div>
                            ))}
                          </div>
                          <button className="btn btn-primary" style={{ width: "100%", padding: "16px", fontSize: "1.05rem", background: "linear-gradient(135deg, #f59e0b, #ef4444)" }} onClick={handleAutoTailor} disabled={analyzing}>
                            {analyzing ? "Generating LaTeX..." : "✨ Auto-Tailor to LaTeX Resume"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="glass" style={{ padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "520px", background: "rgba(255,255,255,0.01)" }}>
                        <div className="floating" style={{ width: "80px", height: "80px", borderRadius: "20px", background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", marginBottom: "24px", color: "var(--brand-primary)" }}>
                          ⚡
                        </div>
                        <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", marginBottom: "12px" }}>Awaiting Input</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "1rem", maxWidth: "300px", lineHeight: 1.6 }}>
                          Upload your resume to unlock a detailed AI audit of your professional profile.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* JOBS TAB */}
            {tab === "jobs" && (
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
            )}

            {/* APPLICATIONS TAB */}
            {tab === "applications" && (
              <div className="fade-up">
                <header style={{ marginBottom: "40px" }}>
                  <h2 style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "'Outfit',sans-serif", color: "#fff" }}>My Applications 📋</h2>
                </header>
                
                {apps.length === 0 ? <p style={{ color: "var(--text-muted)" }}>You haven't applied to any jobs yet.</p> : (
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Job Title</th><th>Company</th><th>Match Score</th><th>Status</th><th>Applied</th></tr></thead>
                      <tbody>
                        {apps.map((a) => (
                          <tr key={a._id}>
                            <td style={{ fontWeight: 700, color: "#fff" }}>{a.jobId?.title}</td>
                            <td style={{ color: "var(--text-muted)" }}>{a.jobId?.company}</td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <span style={{ fontWeight: 800, color: getScoreColor(a.atsScore) }}>{a.atsScore}%</span>
                                <div className="ats-bar-bg" style={{ width: "60px", height: "4px", background: "rgba(255,255,255,0.1)" }}>
                                  <div className="ats-bar-fill" style={{ width: `${a.atsScore}%`, background: getScoreColor(a.atsScore) }} />
                                </div>
                              </div>
                            </td>
                            <td><span className="badge badge-premium">{a.status}</span></td>
                            <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* PROFILE TAB */}
            {tab === "profile" && (
              <ProfileView user={user} onLogout={handleLogout} />
            )}
          </>
        )}
      </main>
      </div>

      {/* ENTERPRISE-GRADE APPLY MODAL */}
      {selectedJob && (
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
      )}
    </div>
  );
}
