const express   = require("express");
const router    = express.Router();
const supabase  = require("../config/supabase");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// All admin routes require auth + admin role
router.use(verifyToken, isAdmin);

/* ─────────────────────────────────────────────
   GET /api/admin/stats
───────────────────────────────────────────── */
router.get("/stats", async (req, res) => {
  try {
    const [
      { count: totalUsers },
      { count: totalRecruiters },
      { count: pendingRecruiters },
      { count: totalJobs },
      { count: totalApplications },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "user"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "recruiter").eq("is_approved", true),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "recruiter").eq("is_approved", false),
      supabase.from("jobs").select("*", { count: "exact", head: true }),
      supabase.from("applications").select("*", { count: "exact", head: true }),
    ]);

    res.json({ totalUsers, totalRecruiters, pendingRecruiters, totalJobs, totalApplications });
  } catch (err) {
    console.error("[adminRoutes] /stats error:", err.message);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

/* ─────────────────────────────────────────────
   GET /api/admin/users
   Returns all job-seeker accounts.
   Emails are fetched from Supabase Auth.
───────────────────────────────────────────── */
router.get("/users", async (req, res) => {
  try {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone, created_at")
      .eq("role", "user")
      .order("created_at", { ascending: false });
    if (error) throw error;

    // Fetch emails from Supabase Auth admin API
    const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const emailMap = Object.fromEntries(
      (authData?.users || []).map(u => [u.id, u.email])
    );

    const users = profiles.map(p => ({
      _id:       p.id,
      fullName:  p.full_name,
      email:     emailMap[p.id] || "",
      phone:     p.phone,
      createdAt: p.created_at,
    }));

    res.json({ total: users.length, users });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* ─────────────────────────────────────────────
   GET /api/admin/recruiters
───────────────────────────────────────────── */
router.get("/recruiters", async (req, res) => {
  try {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, full_name, company, is_approved, created_at")
      .eq("role", "recruiter")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const emailMap = Object.fromEntries(
      (authData?.users || []).map(u => [u.id, u.email])
    );

    const recruiters = profiles.map(r => ({
      _id:        r.id,
      fullName:   r.full_name,
      email:      emailMap[r.id] || "",
      company:    r.company,
      isApproved: r.is_approved,
      createdAt:  r.created_at,
    }));

    res.json({ total: recruiters.length, recruiters });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch recruiters" });
  }
});

/* ─────────────────────────────────────────────
   PUT /api/admin/recruiters/:id/approve
───────────────────────────────────────────── */
router.put("/recruiters/:id/approve", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({ is_approved: true })
      .eq("id", req.params.id)
      .eq("role", "recruiter")
      .select("id, full_name, is_approved")
      .single();

    if (error || !data) return res.status(404).json({ message: "Recruiter not found" });

    res.json({
      message: "Recruiter approved successfully",
      recruiter: { _id: data.id, fullName: data.full_name, isApproved: data.is_approved },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to approve recruiter" });
  }
});

/* ─────────────────────────────────────────────
   PUT /api/admin/recruiters/:id/reject
───────────────────────────────────────────── */
router.put("/recruiters/:id/reject", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({ is_approved: false })
      .eq("id", req.params.id)
      .eq("role", "recruiter")
      .select("id, full_name, is_approved")
      .single();

    if (error || !data) return res.status(404).json({ message: "Recruiter not found" });

    res.json({
      message: "Recruiter access revoked",
      recruiter: { _id: data.id, fullName: data.full_name, isApproved: data.is_approved },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to revoke recruiter" });
  }
});

/* ─────────────────────────────────────────────
   DELETE /api/admin/users/:id
   Deletes from Supabase Auth — cascades to
   profiles via ON DELETE CASCADE.
───────────────────────────────────────────── */
router.delete("/users/:id", async (req, res) => {
  try {
    const { error } = await supabase.auth.admin.deleteUser(req.params.id);
    if (error) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

/* ─────────────────────────────────────────────
   GET /api/admin/jobs
   All jobs on the platform with recruiter info.
───────────────────────────────────────────── */
router.get("/jobs", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const recruiterIds = [...new Set(data.map(j => j.recruiter_id).filter(Boolean))];
    let recruiterMap = {};
    if (recruiterIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, company")
        .in("id", recruiterIds);
      (profs || []).forEach(p => {
        recruiterMap[p.id] = { fullName: p.full_name, company: p.company };
      });
    }

    const jobs = data.map(j => ({
      _id:         j.id,
      title:       j.title,
      company:     j.company,
      location:    j.location,
      isActive:    j.is_active,
      createdAt:   j.created_at,
      recruiterId: recruiterMap[j.recruiter_id] || { fullName: "", company: j.company },
    }));

    res.json({ total: jobs.length, jobs });
  } catch (err) {
    console.error("[adminRoutes] /jobs error:", err.message);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

module.exports = router;
