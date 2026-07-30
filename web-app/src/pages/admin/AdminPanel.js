import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import ProfileView from "../../components/ProfileView";

const NAV = [
  { id: "overview",   icon: "📊", label: "Overview" },
  { id: "recruiters", icon: "🏢", label: "Recruiters" },
  { id: "users",      icon: "👥", label: "Users" },
  { id: "jobs",       icon: "💼", label: "All Jobs" },
  { id: "profile",    icon: "👤", label: "My Profile" },
];

export default function AdminPanel() {
  const { user, logout }      = useAuth();
  const navigate              = useNavigate();
  const [tab, setTab]         = useState("overview");
  const [stats, setStats]     = useState({});
  const [recruiters, setRecruiters] = useState([]);
  const [users, setUsers]     = useState([]);
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [s, r, u, j] = await Promise.all([
        API.get("/api/admin/stats"),
        API.get("/api/admin/recruiters"),
        API.get("/api/admin/users"),
        API.get("/api/admin/jobs"),
      ]);
      setStats(s.data);
      setRecruiters(r.data.recruiters || []);
      setUsers(u.data.users || []);
      setJobs(j.data.jobs || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approveRecruiter = async (id) => {
    await API.put(`/api/admin/recruiters/${id}/approve`);
    setRecruiters((prev) => prev.map((r) => r._id === id ? { ...r, isApproved: true } : r));
  };

  const revokeRecruiter = async (id) => {
    await API.put(`/api/admin/recruiters/${id}/reject`);
    setRecruiters((prev) => prev.map((r) => r._id === id ? { ...r, isApproved: false } : r));
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    await API.delete(`/api/admin/users/${id}`);
    setUsers((prev) => prev.filter((u) => u._id !== id));
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar" style={{ borderColor: "rgba(220,38,38,0.2)" }}>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, fontFamily: "'Outfit',sans-serif" }}>⚡ ResumeAI</div>
          <div style={{ fontSize: "0.78rem", color: "#7070a0", marginTop: "4px" }}>Admin Control Panel</div>
        </div>
        <div style={{ flex: 1 }}>
          {NAV.map((n) => (
            <button key={n.id} className={`nav-item ${tab === n.id ? "active" : ""}`}
              style={tab === n.id ? { color: "#fca5a5", background: "rgba(220,38,38,0.12)" } : {}}
              onClick={() => setTab(n.id)}>
              {n.icon} {n.label}
            </button>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px", cursor: "pointer" }} onClick={() => setTab("profile")}>
          <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{user?.fullName}</div>
          <div style={{ fontSize: "0.72rem", color: "#dc2626", marginBottom: "12px", fontWeight: 600 }}>ADMIN</div>
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", fontSize: "0.82rem" }} onClick={(e) => { e.stopPropagation(); logout(); navigate("/"); }}>Sign Out</button>
        </div>
      </aside>

      <main className="main-content">
        {loading ? <p style={{ color: "#7070a0" }}>Loading…</p> : (
          <>
            {tab === "overview" && (
              <div className="fade-up">
                <h2 style={styles.pageTitle}>Platform Overview 📊</h2>
                <div style={styles.statsGrid}>
                  {[
                    { label: "Total Users",       value: stats.totalUsers         || 0, color: "#c4b5fd" },
                    { label: "Active Recruiters", value: stats.totalRecruiters    || 0, color: "#67e8f9" },
                    { label: "Pending Approval",  value: stats.pendingRecruiters  || 0, color: "#fbbf24" },
                    { label: "Total Jobs",        value: stats.totalJobs          || 0, color: "#6ee7b7" },
                    { label: "Applications",      value: stats.totalApplications  || 0, color: "#fca5a5" },
                  ].map((s) => (
                    <div key={s.label} className="glass stat-card" style={{ borderColor: "rgba(220,38,38,0.15)" }}>
                      <div className="stat-label">{s.label}</div>
                      <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                {stats.pendingRecruiters > 0 && (
                  <div style={{ marginTop: "24px", padding: "16px 20px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "12px" }}>
                    ⚠️ <strong style={{ color: "#fbbf24" }}>{stats.pendingRecruiters} recruiter(s)</strong> are awaiting approval.
                    <button className="btn btn-ghost" style={{ marginLeft: "16px", fontSize: "0.82rem", padding: "6px 14px" }} onClick={() => setTab("recruiters")}>Review →</button>
                  </div>
                )}
              </div>
            )}

            {tab === "recruiters" && (
              <div className="fade-up">
                <h2 style={styles.pageTitle}>Recruiter Management 🏢</h2>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Name</th><th>Company</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {recruiters.map((r) => (
                        <tr key={r._id}>
                          <td style={{ fontWeight: 600 }}>{r.fullName}</td>
                          <td style={{ color: "#7070a0" }}>{r.company || "—"}</td>
                          <td style={{ color: "#7070a0", fontSize: "0.85rem" }}>{r.email}</td>
                          <td><span className={`badge ${r.isApproved ? "badge-approved" : "badge-pending"}`}>{r.isApproved ? "Approved" : "Pending"}</span></td>
                          <td style={{ display: "flex", gap: "8px" }}>
                            {!r.isApproved
                              ? <button className="btn btn-success" style={{ fontSize: "0.75rem", padding: "5px 12px" }} onClick={() => approveRecruiter(r._id)}>✓ Approve</button>
                              : <button className="btn btn-danger"  style={{ fontSize: "0.75rem", padding: "5px 12px" }} onClick={() => revokeRecruiter(r._id)}>✗ Revoke</button>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "users" && (
              <div className="fade-up">
                <h2 style={styles.pageTitle}>User Management 👥</h2>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Actions</th></tr></thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id}>
                          <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                          <td style={{ color: "#7070a0", fontSize: "0.85rem" }}>{u.email}</td>
                          <td style={{ color: "#7070a0", fontSize: "0.82rem" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button className="btn btn-danger" style={{ fontSize: "0.75rem", padding: "5px 12px" }} onClick={() => deleteUser(u._id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "jobs" && (
              <div className="fade-up">
                <h2 style={styles.pageTitle}>All Platform Jobs 💼</h2>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Title</th><th>Company</th><th>Recruiter</th><th>Status</th><th>Posted</th></tr></thead>
                    <tbody>
                      {jobs.map((j) => (
                        <tr key={j._id}>
                          <td style={{ fontWeight: 600 }}>{j.title}</td>
                          <td style={{ color: "#7070a0" }}>{j.company}</td>
                          <td style={{ color: "#7070a0", fontSize: "0.85rem" }}>{j.recruiterId?.fullName}</td>
                          <td><span className={`badge ${j.isActive ? "badge-approved" : "badge-rejected"}`}>{j.isActive ? "Active" : "Closed"}</span></td>
                          <td style={{ color: "#7070a0", fontSize: "0.82rem" }}>{new Date(j.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "16px" },
};
