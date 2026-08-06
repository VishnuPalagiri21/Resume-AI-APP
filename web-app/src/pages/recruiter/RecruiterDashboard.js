import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import ProfileView from "../../components/ProfileView";

const NAV = [
  { id: "overview",    icon: "📊", label: "Overview" },
  { id: "jobs",        icon: "💼", label: "My Jobs" },
  { id: "applicants",  icon: "👥", label: "Applications" },
  { id: "shortlisted", icon: "⭐", label: "Shortlisted" },
  { id: "selected",    icon: "🎉", label: "Selected" },
  { id: "rejected",    icon: "✗",  label: "Rejected" },
  { id: "post",        icon: "➕", label: "Post a Job" },
  { id: "profile",     icon: "👤", label: "My Profile" },
];

export default function RecruiterDashboard() {
  const { user, logout }     = useAuth();
  const navigate             = useNavigate();
  const [tab, setTab]        = useState("overview");
  const [stats, setStats]    = useState({});
  const [jobs, setJobs]      = useState([]);
  const [applicants, setApplicants]   = useState([]);
  const [shortlisted, setShortlisted] = useState([]);
  const [selected, setSelected]       = useState([]);
  const [rejected, setRejected]       = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form, setForm]      = useState({ title: "", description: "", location: "", salaryRange: "", skillsRequired: "" });
  const [loading, setLoading]= useState(true);
  const [posting, setPosting]= useState(false);
  const [msg, setMsg]        = useState("");
  const [timelineModalApp, setTimelineModalApp] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [s, j] = await Promise.all([
        API.get("/api/recruiter/stats"),
        API.get("/api/recruiter/jobs"),
      ]);
      setStats(s.data);
      setJobs(j.data.jobs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const loadAllApplicants = async (customJobId = null, filterStatus = "all", q = "") => {
    try {
      const jId = customJobId !== null ? customJobId : selectedJobId;
      const res = await API.get("/api/recruiter/applicants/all", {
        params: {
          jobId: jId || undefined,
          status: filterStatus !== "all" ? filterStatus : undefined,
          search: q || undefined,
        },
      });
      setApplicants(res.data.applicants || []);
    } catch (e) {
      console.error("Failed to load applicants:", e);
    }
  };

  const loadShortlisted = async () => {
    try {
      const { data } = await API.get("/api/recruiter/shortlisted");
      setShortlisted(data.applicants || data.shortlisted || []);
    } catch (e) {
      console.error("Failed to load shortlisted:", e);
    }
  };

  const loadSelected = async () => {
    try {
      const { data } = await API.get("/api/recruiter/selected");
      setSelected(data.applicants || data.selected || []);
    } catch (e) {
      console.error("Failed to load selected:", e);
    }
  };

  const loadRejected = async () => {
    try {
      const { data } = await API.get("/api/recruiter/rejected");
      setRejected(data.applicants || data.rejected || []);
    } catch (e) {
      console.error("Failed to load rejected:", e);
    }
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    if (newTab === "applicants") {
      loadAllApplicants(selectedJobId, statusFilter, searchQuery);
    } else if (newTab === "shortlisted") {
      loadShortlisted();
    } else if (newTab === "selected") {
      loadSelected();
    } else if (newTab === "rejected") {
      loadRejected();
    }
  };

  const handleJobClickApplicants = (jobId) => {
    setSelectedJobId(jobId);
    setTab("applicants");
    loadAllApplicants(jobId, statusFilter, searchQuery);
  };

  const updateStatus = async (appId, newStatus, rejectionReason = null) => {
    try {
      await API.put(`/api/recruiter/applicants/${appId}/status`, { status: newStatus, rejectionReason });
      // Update local state arrays
      setApplicants((prev) => prev.map((a) => a._id === appId ? { ...a, status: newStatus, rejectionReason } : a));
      if (newStatus === "shortlisted" || newStatus === "selected") {
        loadShortlisted();
      } else {
        setShortlisted((prev) => prev.filter((a) => a._id !== appId));
      }
      if (newStatus === "selected") {
        loadSelected();
      } else {
        setSelected((prev) => prev.filter((a) => a._id !== appId));
      }
      if (newStatus === "rejected") {
        loadRejected();
      } else {
        setRejected((prev) => prev.filter((a) => a._id !== appId));
      }
      loadData();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update status");
    }
  };

  const handleRejectPrompt = async (appId) => {
    const reason = window.prompt(
      "Enter reason for rejection (this will be shown to the candidate):",
      "Does not meet role requirements at this time."
    );
    if (reason === null) return;
    await updateStatus(appId, "rejected", reason || "Does not meet role requirements at this time.");
  };

  const handlePost = async (e) => {
    e.preventDefault(); setPosting(true); setMsg("");
    try {
      await API.post("/api/recruiter/jobs", {
        ...form,
        skillsRequired: form.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setMsg("✅ Job posted successfully!");
      setForm({ title: "", description: "", location: "", salaryRange: "", skillsRequired: "" });
      loadData();
    } catch (err) {
      setMsg("❌ Failed to post job.");
    } finally { setPosting(false); }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Badge colors matching enterprise system
  const getBadgeStyle = (st) => {
    switch (st) {
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

  const getStatusLabel = (st) => {
    switch (st) {
      case "applied": return "Applied";
      case "under_review": return "Under Review";
      case "shortlisted": return "Shortlisted";
      case "selected": return "Selected";
      case "rejected": return "Rejected";
      default: return st;
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar" style={{ borderColor: "rgba(8,145,178,0.2)" }}>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, fontFamily: "'Outfit',sans-serif" }}>⚡ ResumeAI</div>
          <div style={{ fontSize: "0.78rem", color: "#7070a0", marginTop: "4px" }}>Recruiter Portal</div>
        </div>
        <div style={{ flex: 1 }}>
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`nav-item ${tab === n.id ? "active" : ""}`}
              style={tab === n.id ? { color: "#67e8f9", background: "rgba(8,145,178,0.12)" } : {}}
              onClick={() => handleTabChange(n.id)}
            >
              {n.icon} {n.label}
            </button>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px", cursor: "pointer" }} onClick={() => setTab("profile")}>
          <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{user?.fullName}</div>
          <div style={{ fontSize: "0.75rem", color: "#50507a", marginBottom: "12px" }}>{user?.company}</div>
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", fontSize: "0.82rem" }} onClick={(e) => { e.stopPropagation(); logout(); navigate("/"); }}>Sign Out</button>
        </div>
      </aside>

      <main className="main-content">
        {loading ? <p style={{ color: "#7070a0" }}>Loading…</p> : (
          <>
            {/* OVERVIEW TAB */}
            {tab === "overview" && (
              <div className="fade-up">
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "8px" }}>Recruiter Dashboard 🏢</h2>
                <p style={{ color: "#94a3b8", fontSize: "0.92rem", marginBottom: "24px" }}>
                  Real-time analytics across your candidate shortlisting and recruitment lifecycle.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px", marginBottom: "40px" }}>
                  {[
                    { label: "Posted Jobs",        value: stats.totalJobs || 0,         color: "#67e8f9", onClick: () => handleTabChange("jobs") },
                    { label: "Total Applications", value: stats.totalApplications || 0, color: "#93c5fd", onClick: () => handleTabChange("applicants") },
                    { label: "Under Review",       value: stats.underReview || 0,       color: "#fb923c", onClick: () => { setStatusFilter("under_review"); handleTabChange("applicants"); } },
                    { label: "Shortlisted",        value: stats.shortlisted || 0,       color: "#c4b5fd", onClick: () => handleTabChange("shortlisted") },
                    { label: "Selected",           value: stats.selected || 0,          color: "#34d399", onClick: () => handleTabChange("selected") },
                    { label: "Rejected",           value: stats.rejected || 0,          color: "#f87171", onClick: () => handleTabChange("rejected") },
                    { label: "Open Positions",     value: stats.openPositions || 0,     color: "#6ee7b7", onClick: () => handleTabChange("jobs") },
                    { label: "Closed Positions",   value: stats.closedPositions || 0,   color: "#94a3b8", onClick: () => handleTabChange("jobs") },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="glass stat-card"
                      style={{ borderColor: "rgba(8,145,178,0.2)", cursor: "pointer", transition: "transform 0.2s" }}
                      onClick={s.onClick}
                    >
                      <div className="stat-label">{s.label}</div>
                      <div className="stat-value" style={{ color: s.color, fontSize: "1.8rem", fontWeight: "800" }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MY JOBS TAB */}
            {tab === "jobs" && (
              <div className="fade-up">
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "16px" }}>My Job Postings 💼</h2>
                {jobs.length === 0 ? <p style={{ color: "#7070a0" }}>No jobs posted yet. Use "Post a Job" to start.</p> :
                  jobs.map((j) => (
                    <div key={j._id} className="glass" style={{ padding: "20px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{j.title}</div>
                        <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "2px" }}>{j.location} · {j.salaryRange || "Salary not listed"}</div>
                        <div style={{ marginTop: "8px", display: "flex", gap: "6px" }}>
                          {j.skillsRequired?.slice(0, 4).map((s) => (
                            <span key={s} style={{ background: "rgba(8,145,178,0.15)", color: "#67e8f9", padding: "2px 10px", borderRadius: "99px", fontSize: "0.72rem" }}>{s}</span>
                          ))}
                        </div>
                      </div>
                      <button className="btn btn-recruiter" style={{ fontSize: "0.85rem" }} onClick={() => handleJobClickApplicants(j._id)}>View Applicants →</button>
                    </div>
                  ))
                }
              </div>
            )}

            {/* APPLICATIONS MANAGEMENT TAB */}
            {tab === "applicants" && (
              <div className="fade-up">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Applications Management 👥</h2>
                    <p style={{ color: "#94a3b8", fontSize: "0.88rem" }}>Search, filter, and transition candidate statuses across your recruitment pipeline.</p>
                  </div>
                  {selectedJobId && (
                    <button className="btn btn-ghost" style={{ fontSize: "0.82rem" }} onClick={() => { setSelectedJobId(""); loadAllApplicants(null, statusFilter, searchQuery); }}>
                      ← View All Jobs
                    </button>
                  )}
                </div>

                {/* Search and Status Filters */}
                <div className="glass" style={{ padding: "16px", marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search by name, email, phone, skills, or resume keywords..."
                    style={{ flex: "1 1 280px", background: "rgba(15,23,42,0.6)" }}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      loadAllApplicants(selectedJobId, statusFilter, e.target.value);
                    }}
                  />
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {["all", "applied", "under_review", "shortlisted", "selected", "rejected"].map((st) => (
                      <button
                        key={st}
                        className={`btn ${statusFilter === st ? "btn-recruiter" : "btn-ghost"}`}
                        style={{ fontSize: "0.78rem", padding: "6px 12px", textTransform: "capitalize" }}
                        onClick={() => {
                          setStatusFilter(st);
                          loadAllApplicants(selectedJobId, st, searchQuery);
                        }}
                      >
                        {st === "all" ? "All" : getStatusLabel(st)}
                      </button>
                    ))}
                  </div>
                </div>

                {applicants.length === 0 ? <p style={{ color: "#7070a0" }}>No applicants match your criteria.</p> : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Candidate</th>
                          <th>Job Applied</th>
                          <th>ATS Match</th>
                          <th>Applied Date</th>
                          <th>Status</th>
                          <th>Change Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applicants.map((a) => (
                          <tr key={a._id}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #06b6d4, #8b5cf6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.95rem" }}>
                                  {(a.userId?.fullName || "A")[0].toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, color: "#fff" }}>{a.userId?.fullName || "Candidate"}</div>
                                  <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{a.userId?.email}</div>
                                  {a.userId?.phone && <div style={{ color: "#64748b", fontSize: "0.75rem" }}>📞 {a.userId.phone}</div>}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, color: "#67e8f9" }}>{a.job?.title || "Role"}</div>
                              <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{a.job?.location || "Remote"}</div>
                            </td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div className="ats-bar-bg" style={{ width: "60px" }}>
                                  <div className="ats-bar-fill" style={{ width: `${a.atsScore}%`, background: a.atsScore > 70 ? "#10b981" : a.atsScore > 40 ? "#f59e0b" : "#ef4444" }} />
                                </div>
                                <span style={{ fontWeight: 700 }}>{a.atsScore}%</span>
                              </div>
                            </td>
                            <td style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
                              {new Date(a.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              <span style={{ ...getBadgeStyle(a.status), padding: "4px 10px", borderRadius: "99px", fontSize: "0.75rem", fontWeight: "600", display: "inline-block" }}>
                                {getStatusLabel(a.status)}
                              </span>
                              {a.rejectionReason && a.status === "rejected" && (
                                <div style={{ fontSize: "0.72rem", color: "#f87171", marginTop: "4px" }}>
                                  Reason: {a.rejectionReason}
                                </div>
                              )}
                            </td>
                            <td>
                              <select
                                className="form-input"
                                style={{ padding: "6px 10px", fontSize: "0.78rem", background: "#0f172a", color: "#fff", border: "1px solid rgba(8,145,178,0.4)", borderRadius: "8px" }}
                                value={a.status}
                                onChange={(e) => {
                                  if (e.target.value === "rejected") {
                                    handleRejectPrompt(a._id);
                                  } else {
                                    updateStatus(a._id, e.target.value);
                                  }
                                }}
                              >
                                <option value="applied">Applied</option>
                                <option value="under_review">Under Review</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="selected">Selected</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                <button
                                  className="btn btn-ghost"
                                  style={{ fontSize: "0.72rem", padding: "4px 8px", borderColor: "rgba(103,232,249,0.3)" }}
                                  onClick={() => setTimelineModalApp(a)}
                                >
                                  🕒 Timeline
                                </button>
                                {a.userId?.email && (
                                  <a
                                    href={`mailto:${a.userId.email}?subject=${encodeURIComponent(`Update regarding ${a.job?.title || "your application"}`)}`}
                                    className="btn btn-ghost"
                                    style={{ fontSize: "0.72rem", padding: "4px 8px" }}
                                  >
                                    📧 Email
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SHORTLISTED CANDIDATES TAB */}
            {tab === "shortlisted" && (
              <div className="fade-up">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Shortlisted Candidates ⭐</h2>
                    <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                      Curated top talent across all active jobs (includes Shortlisted & Selected status).
                    </p>
                  </div>
                </div>

                {shortlisted.length === 0 ? (
                  <div className="glass" style={{ padding: "48px 32px", textAlign: "center", borderRadius: "20px" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⭐</div>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "8px" }}>No Shortlisted Candidates Yet</h3>
                    <p style={{ color: "#94a3b8", fontSize: "0.95rem", marginBottom: "24px" }}>
                      Candidates moved to "Shortlisted" or "Selected" will automatically appear here.
                    </p>
                    <button className="btn btn-recruiter" onClick={() => handleTabChange("applicants")}>Browse Applications →</button>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Candidate</th>
                          <th>Job Role</th>
                          <th>ATS Match</th>
                          <th>Top Skills</th>
                          <th>Current Status</th>
                          <th>Quick Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shortlisted.map((a) => (
                          <tr key={a._id}>
                            <td>
                              <div style={{ fontWeight: 700, color: "#fff" }}>{a.userId?.fullName || "Candidate"}</div>
                              <div style={{ color: "#94a3b8", fontSize: "0.82rem" }}>{a.userId?.email}</div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, color: "#67e8f9" }}>{a.job?.title || "Job Posting"}</div>
                              <div style={{ color: "#94a3b8", fontSize: "0.82rem" }}>📍 {a.job?.location || "Remote"}</div>
                            </td>
                            <td>
                              <span style={{ fontWeight: 800, color: a.atsScore > 70 ? "#10b981" : "#f59e0b" }}>{a.atsScore}%</span>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", maxWidth: "220px" }}>
                                {a.resumeId?.matchedSkills?.slice(0, 3).map((s) => (
                                  <span key={s} style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", padding: "2px 8px", borderRadius: "99px", fontSize: "0.75rem" }}>{s}</span>
                                )) || "—"}
                              </div>
                            </td>
                            <td>
                              <span style={{ ...getBadgeStyle(a.status), padding: "4px 10px", borderRadius: "99px", fontSize: "0.75rem", fontWeight: "600" }}>
                                {getStatusLabel(a.status)}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                                {a.status !== "selected" && (
                                  <button
                                    className="btn"
                                    style={{ fontSize: "0.75rem", padding: "5px 10px", background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" }}
                                    onClick={() => updateStatus(a._id, "selected")}
                                  >
                                    🎉 Select
                                  </button>
                                )}
                                {a.userId?.email && (
                                  <a
                                    href={`mailto:${a.userId.email}?subject=${encodeURIComponent(`Interview Invitation: ${a.job?.title || "Role"}`)}`}
                                    className="btn btn-ghost"
                                    style={{ fontSize: "0.75rem", padding: "5px 10px" }}
                                  >
                                    📅 Schedule
                                  </a>
                                )}
                                <button
                                  className="btn btn-danger"
                                  style={{ fontSize: "0.75rem", padding: "5px 10px" }}
                                  onClick={() => handleRejectPrompt(a._id)}
                                >
                                  ✗ Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SELECTED CANDIDATES TAB */}
            {tab === "selected" && (
              <div className="fade-up">
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "8px" }}>Selected Candidates 🎉</h2>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "20px" }}>
                  Candidates who have successfully completed the interview process and been selected for hire.
                </p>

                {selected.length === 0 ? (
                  <div className="glass" style={{ padding: "48px 32px", textAlign: "center", borderRadius: "20px" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🎉</div>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "8px" }}>No Selected Candidates Yet</h3>
                    <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
                      When you click "Select" on an applicant, they will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Candidate</th>
                          <th>Role Selected For</th>
                          <th>ATS Score</th>
                          <th>Applied Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.map((a) => (
                          <tr key={a._id}>
                            <td>
                              <div style={{ fontWeight: 700, color: "#fff" }}>{a.userId?.fullName || "Candidate"}</div>
                              <div style={{ color: "#94a3b8", fontSize: "0.82rem" }}>{a.userId?.email}</div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, color: "#34d399" }}>{a.job?.title || "Job Role"}</div>
                              <div style={{ color: "#94a3b8", fontSize: "0.82rem" }}>{a.job?.company}</div>
                            </td>
                            <td>
                              <span style={{ fontWeight: 800, color: "#34d399" }}>{a.atsScore}%</span>
                            </td>
                            <td style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                              {new Date(a.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              {a.userId?.email && (
                                <a
                                  href={`mailto:${a.userId.email}?subject=${encodeURIComponent(`Offer Letter details: ${a.job?.title}`)}`}
                                  className="btn btn-recruiter"
                                  style={{ fontSize: "0.78rem", padding: "6px 14px" }}
                                >
                                  📧 Send Offer Email
                                </a>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* REJECTED CANDIDATES TAB */}
            {tab === "rejected" && (
              <div className="fade-up">
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "8px" }}>Rejected Candidates ✗</h2>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "20px" }}>
                  Audit log of applications that were not selected, with recorded rejection reasons.
                </p>

                {rejected.length === 0 ? (
                  <div className="glass" style={{ padding: "48px 32px", textAlign: "center", borderRadius: "20px" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "16px" }}>✗</div>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "8px" }}>No Rejected Candidates</h3>
                    <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
                      Any rejected applications will be listed here.
                    </p>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Candidate</th>
                          <th>Job Role</th>
                          <th>Applied Date</th>
                          <th>Rejection Reason</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rejected.map((a) => (
                          <tr key={a._id}>
                            <td>
                              <div style={{ fontWeight: 700, color: "#fff" }}>{a.userId?.fullName || "Candidate"}</div>
                              <div style={{ color: "#94a3b8", fontSize: "0.82rem" }}>{a.userId?.email}</div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, color: "#94a3b8" }}>{a.job?.title || "Role"}</div>
                            </td>
                            <td style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                              {new Date(a.createdAt).toLocaleDateString()}
                            </td>
                            <td style={{ color: "#f87171", fontSize: "0.85rem" }}>
                              {a.rejectionReason || "Does not meet role requirements."}
                            </td>
                            <td>
                              <button
                                className="btn btn-ghost"
                                style={{ fontSize: "0.75rem", padding: "5px 10px" }}
                                onClick={() => updateStatus(a._id, "under_review")}
                                title="Restore candidate to Under Review"
                              >
                                ↩ Reconsider
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* POST A JOB TAB */}
            {tab === "post" && (
              <div className="fade-up" style={{ maxWidth: "600px" }}>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "16px" }}>Post a New Job ➕</h2>
                {msg && <div style={{ padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", background: msg.startsWith("✅") ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: msg.startsWith("✅") ? "#34d399" : "#f87171", border: "1px solid", borderColor: msg.startsWith("✅") ? "#34d39940" : "#f8717140" }}>{msg}</div>}
                <form className="glass" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "18px" }} onSubmit={handlePost}>
                  {[
                    { key: "title",         label: "Job Title",               placeholder: "e.g. Senior React Developer" },
                    { key: "location",      label: "Location",                placeholder: "e.g. Remote / Bangalore" },
                    { key: "salaryRange",   label: "Salary Range (optional)", placeholder: "e.g. ₹10L – ₹18L" },
                    { key: "skillsRequired",label: "Required Skills (comma-separated)", placeholder: "React, Node.js, MongoDB" },
                  ].map(({ key, label, placeholder }) => (
                    <div className="form-group" key={key}>
                      <label className="form-label">{label}</label>
                      <input className="form-input recruiter" placeholder={placeholder} value={form[key]} onChange={set(key)} required={key === "title"} />
                    </div>
                  ))}
                  <div className="form-group">
                    <label className="form-label">Job Description</label>
                    <textarea className="form-input recruiter" placeholder="Describe the role, responsibilities, and requirements…" rows={5} value={form.description} onChange={set("description")} required style={{ resize: "vertical" }} />
                  </div>
                  <button type="submit" className="btn btn-recruiter" style={{ justifyContent: "center" }} disabled={posting}>
                    {posting ? "Posting…" : "Post Job →"}
                  </button>
                </form>
              </div>
            )}

            {/* PROFILE TAB */}
            {tab === "profile" && (
              <ProfileView user={user} onLogout={() => { logout(); navigate("/"); }} />
            )}
          </>
        )}

        {/* Audit Trail Timeline Modal */}
        {timelineModalApp && (
          <div
            style={{
              position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
              background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 9999, padding: "20px"
            }}
            onClick={() => setTimelineModalApp(null)}
          >
            <div
              className="glass"
              style={{ maxWidth: "500px", width: "100%", padding: "28px", borderRadius: "16px", position: "relative" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "#94a3b8", fontSize: "1.2rem", cursor: "pointer" }}
                onClick={() => setTimelineModalApp(null)}
              >
                ✕
              </button>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "4px" }}>
                Status Audit Trail 🕒
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "20px" }}>
                Complete timeline of status transitions for {timelineModalApp.userId?.fullName || "Candidate"}.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {(timelineModalApp.statusHistory || []).map((h, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#67e8f9", marginTop: "4px", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>{h.status}</div>
                      <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>
                        {new Date(h.timestamp).toLocaleString()} · Updated by {h.updatedBy || "System"}
                      </div>
                      {h.reason && (
                        <div style={{ color: "#f87171", fontSize: "0.78rem", marginTop: "4px" }}>
                          Note: {h.reason}
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
      </main>
    </div>
  );
}
