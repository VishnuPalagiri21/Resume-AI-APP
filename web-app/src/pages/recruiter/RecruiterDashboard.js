import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import ProfileView from "../../components/ProfileView";

const NAV = [
  { id: "overview",    icon: "📊", label: "Overview" },
  { id: "jobs",        icon: "💼", label: "My Jobs" },
  { id: "post",        icon: "➕", label: "Post a Job" },
  { id: "shortlisted", icon: "⭐", label: "Shortlisted" },
  { id: "profile",     icon: "👤", label: "My Profile" },
];

export default function RecruiterDashboard() {
  const { user, logout }     = useAuth();
  const navigate             = useNavigate();
  const [tab, setTab]        = useState("overview");
  const [stats, setStats]    = useState({});
  const [jobs, setJobs]      = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [shortlisted, setShortlisted] = useState([]);
  const [form, setForm]      = useState({ title: "", description: "", location: "", salaryRange: "", skillsRequired: "" });
  const [loading, setLoading]= useState(true);
  const [posting, setPosting]= useState(false);
  const [msg, setMsg]        = useState("");

  const loadData = useCallback(async () => {
    try {
      const [s, j] = await Promise.all([
        API.get("/api/recruiter/stats"),
        API.get("/api/recruiter/jobs"),
      ]);
      setStats(s.data); setJobs(j.data.jobs || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const loadApplicants = async (jobId) => {
    const { data } = await API.get(`/api/recruiter/jobs/${jobId}/applicants`);
    setApplicants(data.applicants || []);
    setTab("applicants");
  };

  const updateStatus = async (appId, status, rejectionReason = null) => {
    await API.put(`/api/recruiter/applicants/${appId}/status`, { status, rejectionReason });
    setApplicants((prev) => prev.map((a) => a._id === appId ? { ...a, status, rejectionReason } : a));
    loadData();
  };

  const handleReject = async (appId) => {
    const reason = window.prompt(
      "Enter reason for rejection (this will be shown to the candidate):",
      "Does not meet role requirements at this time."
    );
    if (reason === null) return;
    await updateStatus(appId, "rejected", reason || "Does not meet role requirements at this time.");
  };

  const loadShortlisted = async () => {
    try {
      const { data } = await API.get("/api/recruiter/shortlisted");
      setShortlisted(data.shortlisted || []);
      setTab("shortlisted");
    } catch (e) {
      console.error("Failed to load shortlisted:", e);
    }
  };

  const removeFromShortlist = async (appId) => {
    await API.put(`/api/recruiter/applicants/${appId}/status`, { status: "applied" });
    setShortlisted((prev) => prev.filter((a) => a._id !== appId));
    loadData();
  };

  const handleRejectShortlisted = async (appId) => {
    const reason = window.prompt(
      "Enter reason for rejection (this will be shown to the candidate):",
      "Does not meet role requirements at this time."
    );
    if (reason === null) return;
    await API.put(`/api/recruiter/applicants/${appId}/status`, {
      status: "rejected",
      rejectionReason: reason || "Does not meet role requirements at this time.",
    });
    setShortlisted((prev) => prev.filter((a) => a._id !== appId));
    loadData();
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

  const styles = {
    pageTitle: { fontSize: "1.5rem", fontWeight: 700, marginBottom: "24px" },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }
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
            <button key={n.id} className={`nav-item ${tab === n.id ? "active" : ""}`}
              style={tab === n.id ? { color: "#67e8f9", background: "rgba(8,145,178,0.12)" } : {}}
              onClick={() => {
                if (n.id === "shortlisted") loadShortlisted();
                else setTab(n.id);
              }}>
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
            {tab === "overview" && (
              <div className="fade-up">
                <h2 style={styles.pageTitle}>Recruiter Dashboard 🏢</h2>
                <div style={styles.statsGrid}>
                  {[
                    { label: "Jobs Posted",        value: stats.totalJobs         || 0, color: "#67e8f9", onClick: () => setTab("jobs") },
                    { label: "Total Applicants",   value: stats.totalApplications || 0, color: "#c4b5fd", onClick: () => setTab("jobs") },
                    { label: "Shortlisted",        value: stats.shortlisted       || 0, color: "#6ee7b7", onClick: () => loadShortlisted() },
                  ].map((s) => (
                    <div key={s.label} className="glass stat-card" style={{ borderColor: "rgba(8,145,178,0.15)", cursor: "pointer", transition: "transform 0.2s" }} onClick={s.onClick}>
                      <div className="stat-label">{s.label}</div>
                      <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "jobs" && (
              <div className="fade-up">
                <h2 style={styles.pageTitle}>My Job Postings 💼</h2>
                {jobs.length === 0 ? <p style={{ color: "#7070a0" }}>No jobs posted yet. Use "Post a Job" to start.</p> :
                  jobs.map((j) => (
                    <div key={j._id} className="glass" style={{ padding: "20px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{j.title}</div>
                        <div style={{ color: "#7070a0", fontSize: "0.82rem" }}>{j.location} · {j.salaryRange || "Salary not listed"}</div>
                        <div style={{ marginTop: "6px", display: "flex", gap: "6px" }}>
                          {j.skillsRequired?.slice(0, 4).map((s) => (
                            <span key={s} style={{ background: "rgba(8,145,178,0.15)", color: "#67e8f9", padding: "2px 10px", borderRadius: "99px", fontSize: "0.72rem" }}>{s}</span>
                          ))}
                        </div>
                      </div>
                      <button className="btn btn-recruiter" style={{ fontSize: "0.82rem" }} onClick={() => loadApplicants(j._id)}>View Applicants</button>
                    </div>
                  ))
                }
              </div>
            )}

            {tab === "applicants" && (
              <div className="fade-up">
                <button className="btn btn-ghost" style={{ marginBottom: "20px", fontSize: "0.82rem" }} onClick={() => setTab("jobs")}>← Back to Jobs</button>
                <h2 style={styles.pageTitle}>Applicants</h2>
                {applicants.length === 0 ? <p style={{ color: "#7070a0" }}>No applicants yet.</p> : (
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Candidate</th><th>Email</th><th>ATS Score</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {applicants.map((a) => (
                          <tr key={a._id}>
                            <td style={{ fontWeight: 600 }}>{a.userId?.fullName}</td>
                            <td style={{ color: "#7070a0", fontSize: "0.85rem" }}>{a.userId?.email}</td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div className="ats-bar-bg" style={{ width: "70px" }}>
                                  <div className="ats-bar-fill" style={{ width: `${a.atsScore}%`, background: a.atsScore > 70 ? "#10b981" : a.atsScore > 40 ? "#f59e0b" : "#ef4444" }} />
                                </div>
                                <span style={{ fontSize: "0.82rem" }}>{a.atsScore}%</span>
                              </div>
                            </td>
                            <td>
                              <span className={`badge badge-${a.status}`}>{a.status}</span>
                              {a.rejectionReason && a.status === "rejected" && (
                                <div style={{ fontSize: "0.75rem", color: "#f87171", marginTop: "4px" }}>
                                  Reason: {a.rejectionReason}
                                </div>
                              )}
                            </td>
                            <td style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                              <button className="btn btn-success" style={{ fontSize: "0.75rem", padding: "5px 10px" }} onClick={() => updateStatus(a._id, "shortlisted")}>✓ Shortlist</button>
                              <button className="btn" style={{ fontSize: "0.75rem", padding: "5px 10px", background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" }} onClick={() => updateStatus(a._id, "selected")}>🎉 Select</button>
                              <button className="btn btn-danger" style={{ fontSize: "0.75rem", padding: "5px 10px" }} onClick={() => handleReject(a._id)}>✗ Reject</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {tab === "post" && (
              <div className="fade-up" style={{ maxWidth: "600px" }}>
                <h2 style={styles.pageTitle}>Post a New Job ➕</h2>
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

            {tab === "shortlisted" && (
              <div className="fade-up">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h2 style={styles.pageTitle}>Shortlisted Candidates ⭐</h2>
                    <p style={{ color: "#7070a0", fontSize: "0.9rem", marginTop: "-14px" }}>
                      Curated top talent across all your active job postings.
                    </p>
                  </div>
                  <button className="btn btn-ghost" style={{ fontSize: "0.82rem" }} onClick={() => setTab("jobs")}>
                    💼 View All Jobs
                  </button>
                </div>

                {shortlisted.length === 0 ? (
                  <div className="glass" style={{ padding: "48px 32px", textAlign: "center", borderRadius: "20px", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⭐</div>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "8px", color: "#fff" }}>No Shortlisted Candidates Yet</h3>
                    <p style={{ color: "#7070a0", fontSize: "0.95rem", marginBottom: "24px", maxWidth: "480px", margin: "0 auto 24px" }}>
                      Review applicants under "My Jobs" and click "✓ Shortlist" on candidates who stand out. They will appear right here for easy outreach.
                    </p>
                    <button className="btn btn-recruiter" onClick={() => setTab("jobs")}>Browse My Jobs →</button>
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
                          <th>Contact</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shortlisted.map((a) => (
                          <tr key={a._id}>
                            <td>
                              <div style={{ fontWeight: 700, color: "#fff" }}>{a.userId?.fullName || "Candidate"}</div>
                              <div style={{ color: "#7070a0", fontSize: "0.82rem" }}>{a.userId?.email}</div>
                              {a.userId?.phone && <div style={{ color: "#7070a0", fontSize: "0.78rem" }}>📞 {a.userId.phone}</div>}
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, color: "#67e8f9" }}>{a.job?.title || "Job Posting"}</div>
                              <div style={{ color: "#7070a0", fontSize: "0.82rem" }}>📍 {a.job?.location || "Remote"}</div>
                            </td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ fontWeight: 800, color: a.atsScore > 70 ? "#10b981" : "#f59e0b" }}>{a.atsScore}%</span>
                                <div className="ats-bar-bg" style={{ width: "65px", height: "5px" }}>
                                  <div className="ats-bar-fill" style={{ width: `${a.atsScore}%`, background: a.atsScore > 70 ? "#10b981" : "#f59e0b" }} />
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", maxWidth: "240px" }}>
                                {a.resumeId?.matchedSkills?.slice(0, 3).map((s) => (
                                  <span key={s} style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", padding: "3px 10px", borderRadius: "99px", fontSize: "0.75rem", border: "1px solid rgba(16,185,129,0.3)" }}>{s}</span>
                                )) || <span style={{ color: "#7070a0", fontSize: "0.8rem" }}>No skills parsed</span>}
                              </div>
                            </td>
                            <td>
                              {a.userId?.email ? (
                                <a
                                  href={`mailto:${a.userId.email}?subject=${encodeURIComponent(`Interview Invitation: ${a.job?.title || "Role"} at ResumeAI`)}`}
                                  className="btn btn-ghost"
                                  style={{ fontSize: "0.78rem", padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: "6px", color: "#67e8f9", borderColor: "rgba(103,232,249,0.3)" }}
                                >
                                  📧 Email Candidate
                                </a>
                              ) : (
                                <span style={{ color: "#7070a0", fontSize: "0.8rem" }}>No Email</span>
                              )}
                            </td>
                            <td style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                              <button
                                className="btn"
                                style={{ fontSize: "0.75rem", padding: "6px 10px", background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" }}
                                onClick={() => updateStatus(a._id, "selected")}
                              >
                                🎉 Select
                              </button>
                              <button
                                className="btn btn-danger"
                                style={{ fontSize: "0.75rem", padding: "6px 10px" }}
                                onClick={() => handleRejectShortlisted(a._id)}
                                title="Reject candidate with a custom reason"
                              >
                                ✗ Reject
                              </button>
                              <button
                                className="btn btn-ghost"
                                style={{ fontSize: "0.75rem", padding: "6px 10px", color: "#94a3b8" }}
                                onClick={() => removeFromShortlist(a._id)}
                                title="Remove from shortlist and return to applied status"
                              >
                                Remove
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

            {tab === "profile" && (
              <ProfileView user={user} onLogout={() => { logout(); navigate("/"); }} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

const styles = {
  pageTitle: { fontSize: "1.6rem", fontWeight: 800, fontFamily: "'Outfit',sans-serif", marginBottom: "24px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "16px" },
};
