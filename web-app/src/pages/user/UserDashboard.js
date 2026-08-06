import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import ProfileView from "../../components/ProfileView";

// ── Tab Components ──────────────────────────────────────
import OverviewTab from "./components/OverviewTab";
import AnalyzerTab from "./components/AnalyzerTab";
import JobsTab from "./components/JobsTab";
import ApplicationsTab from "./components/ApplicationsTab";
import ApplyModal from "./components/ApplyModal";

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
  const [timelineModalApp, setTimelineModalApp] = useState(null);
  const [notifications, setNotifications]     = useState([]);
  const [showNotifs, setShowNotifs]           = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [s, j, a, r, n] = await Promise.all([
        API.get("/api/user/stats"),
        API.get("/api/user/jobs"),
        API.get("/api/user/applications"),
        API.get("/api/dashboard/resumes"),
        API.get("/api/notifications/my").catch(() => ({ data: { notifications: [] } })),
      ]);
      setStats(s.data);
      setJobs(j.data.jobs || []);
      setApps(a.data.applications || []);
      setResumes(r.data.resumes || []);
      setNotifications(n.data?.notifications || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const markNotificationRead = async (notifId) => {
    try {
      await API.put(`/api/notifications/my/${notifId}/read`);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
      setStats(prev => ({ ...prev, unreadNotifications: Math.max(0, (prev.unreadNotifications || 1) - 1) }));
    } catch (e) {}
  };

  const getBadgeStyle = (st) => {
    switch ((st || "").toLowerCase()) {
      case "applied":
        return { background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" };
      case "under_review":
        return { background: "rgba(249,115,22,0.15)", color: "#fb923c", border: "1px solid rgba(249,115,22,0.3)" };
      case "shortlisted":
        return { background: "rgba(139,92,246,0.15)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.3)" };
      case "selected":
        return { background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" };
      case "rejected":
        return { background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" };
      default:
        return { background: "rgba(255,255,255,0.1)", color: "#94a3b8" };
    }
  };

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

          <div className="stellar-profile-badge" style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginRight: "8px" }}>
              <span style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", padding: "6px 12px", borderRadius: "99px", fontSize: "0.78rem", fontWeight: 800, border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                🔥 {stats.streakDays || 5} Day Streak
              </span>
              <button
                className="stellar-notif-btn"
                title="Notifications"
                onClick={() => setShowNotifs(!showNotifs)}
                style={{ position: "relative", cursor: "pointer", background: showNotifs ? "rgba(8,145,178,0.25)" : "transparent" }}
              >
                <span>🔔</span>
                {(stats.unreadNotifications > 0 || notifications.some(n => !n.isRead)) && (
                  <span style={{ position: "absolute", top: "-2px", right: "-2px", width: "10px", height: "10px", background: "#ef4444", borderRadius: "50%", border: "2px solid #0f172a" }} />
                )}
              </button>
            </div>
            <div className="stellar-avatar-circle" onClick={() => setTab("profile")} title="Click to view Profile" style={{ cursor: "pointer" }}>
              {initials}
            </div>

            {/* Notification Center Popover */}
            {showNotifs && (
              <div
                className="glass"
                style={{
                  position: "absolute", top: "54px", right: 0, width: "340px", maxHeight: "420px",
                  overflowY: "auto", padding: "16px", borderRadius: "14px", zIndex: 100,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)", border: "1px solid rgba(8,145,178,0.3)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>Notifications 🔔</h4>
                  <button style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "0.8rem" }} onClick={() => setShowNotifs(false)}>✕</button>
                </div>
                {notifications.length === 0 ? (
                  <p style={{ fontSize: "0.82rem", color: "#94a3b8", textAlign: "center", padding: "20px 0" }}>No notifications yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {notifications.map((n, i) => (
                      <div
                        key={n.id || i}
                        style={{
                          padding: "10px", borderRadius: "8px",
                          background: n.isRead ? "rgba(255,255,255,0.03)" : "rgba(8,145,178,0.15)",
                          borderLeft: n.isRead ? "3px solid transparent" : "3px solid #06b6d4",
                          cursor: "pointer"
                        }}
                        onClick={() => { markNotificationRead(n.id); if (n.link) navigate(n.link); }}
                      >
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginBottom: "2px" }}>{n.title}</div>
                        <div style={{ fontSize: "0.78rem", color: "#94a3b8", lineHeight: 1.4 }}>{n.message}</div>
                        <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "4px" }}>{new Date(n.createdAt || Date.now()).toLocaleTimeString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
              {tab === "overview" && (
                <OverviewTab
                  stats={stats} apps={apps} resumes={resumes}
                  firstName={firstName} todayDateStr={todayDateStr}
                  getScoreColor={getScoreColor} setTab={setTab}
                />
              )}

              {tab === "analyzer" && (
                <AnalyzerTab
                  file={file} setFile={setFile}
                  jobDescription={jobDescription} setJobDescription={setJobDescription}
                  analyzing={analyzing} analysisResult={analysisResult}
                  handleAnalyze={handleAnalyze} getScoreColor={getScoreColor}
                />
              )}

              {tab === "jobs" && (
                <JobsTab
                  jobs={jobs} apps={apps} loadData={loadData}
                  handleOpenApply={handleOpenApply}
                />
              )}

              {tab === "applications" && (
                <ApplicationsTab
                  apps={apps} getBadgeStyle={getBadgeStyle}
                  getScoreColor={getScoreColor}
                  setTimelineModalApp={setTimelineModalApp}
                  timelineModalApp={timelineModalApp}
                />
              )}

              {tab === "profile" && (
                <ProfileView user={user} onLogout={handleLogout} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        selectedJob={selectedJob} setSelectedJob={setSelectedJob}
        resumeSource={resumeSource} setResumeSource={setResumeSource}
        uploadFile={uploadFile} setUploadFile={setUploadFile}
        applyResumeId={applyResumeId} setApplyResumeId={setApplyResumeId}
        applicantName={applicantName} setApplicantName={setApplicantName}
        applicantEmail={applicantEmail} setApplicantEmail={setApplicantEmail}
        applicantPhone={applicantPhone} setApplicantPhone={setApplicantPhone}
        applicantLocation={applicantLocation} setApplicantLocation={setApplicantLocation}
        experienceYears={experienceYears} setExperienceYears={setExperienceYears}
        noticePeriod={noticePeriod} setNoticePeriod={setNoticePeriod}
        linkedinUrl={linkedinUrl} setLinkedinUrl={setLinkedinUrl}
        portfolioUrl={portfolioUrl} setPortfolioUrl={setPortfolioUrl}
        coverNote={coverNote} setCoverNote={setCoverNote}
        submittingApply={submittingApply} applyMsg={applyMsg}
        handleConfirmApply={handleConfirmApply} resumes={resumes}
      />
    </div>
  );
}
