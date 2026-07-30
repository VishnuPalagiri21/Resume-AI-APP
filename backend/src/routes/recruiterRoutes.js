const express      = require("express");
const router       = express.Router();
const supabase     = require("../config/supabase");
const { verifyToken } = require("../middleware/authMiddleware");

// Guard: recruiter role only
const isApprovedRecruiter = (req, res, next) => {
  if (req.user.role !== "recruiter")
    return res.status(403).json({ message: "Recruiter access only" });
  next();
};

router.use(verifyToken, isApprovedRecruiter);

/* ─────────────────────────────────────────────
   GET /api/recruiter/stats
───────────────────────────────────────────── */
router.get("/stats", async (req, res) => {
  try {
    const { data: myJobs } = await supabase
      .from("jobs")
      .select("id")
      .eq("recruiter_id", req.user.id);

    const jobIds = (myJobs || []).map(j => j.id);

    // Use a placeholder that never matches if the recruiter has no jobs
    const safeIds = jobIds.length > 0 ? jobIds : ["00000000-0000-0000-0000-000000000000"];

    const [{ count: totalApplications }, { count: shortlisted }] = await Promise.all([
      supabase.from("applications").select("*", { count: "exact", head: true }).in("job_id", safeIds),
      supabase.from("applications").select("*", { count: "exact", head: true }).in("job_id", safeIds).eq("status", "shortlisted"),
    ]);

    res.json({ totalJobs: myJobs.length, totalApplications, shortlisted });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

/* ─────────────────────────────────────────────
   GET /api/recruiter/shortlisted
   Returns all shortlisted candidates across all jobs
───────────────────────────────────────────── */
router.get("/shortlisted", async (req, res) => {
  try {
    const { data: myJobs } = await supabase
      .from("jobs")
      .select("id, title, company, location")
      .eq("recruiter_id", req.user.id);

    const jobIds = (myJobs || []).map(j => j.id);
    if (jobIds.length === 0) {
      return res.json({ total: 0, shortlisted: [] });
    }
    const jobMap = Object.fromEntries((myJobs || []).map(j => [j.id, j]));

    const { data, error } = await supabase
      .from("applications")
      .select(`
        *,
        resumes:resume_id (file_name, ats_score, matched_skills)
      `)
      .in("job_id", jobIds)
      .eq("status", "shortlisted")
      .order("updated_at", { ascending: false });

    if (error) throw error;

    const userIds = [...new Set(data.map(a => a.user_id).filter(Boolean))];
    let profileMap = {};
    if (userIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", userIds);

      const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const emailMap = Object.fromEntries((authData?.users || []).map(u => [u.id, u.email]));

      (profs || []).forEach(p => {
        profileMap[p.id] = {
          fullName: p.full_name,
          email:    emailMap[p.id] || "",
          phone:    p.phone || "",
        };
      });
    }

    const shortlisted = data.map(a => {
      const m = a.cover_note ? a.cover_note.match(/\[REJECTION REASON: (.*?)\]/s) : null;
      return {
        _id:       a.id,
        atsScore:  a.ats_score,
        status:    a.status,
        rejectionReason: m ? m[1] : null,
        coverNote: a.cover_note,
        createdAt: a.created_at,
        updatedAt: a.updated_at || a.created_at,
        job:       jobMap[a.job_id] || null,
        userId:    profileMap[a.user_id] || null,
        resumeId:  a.resumes ? {
          fileName:      a.resumes.file_name,
          atsScore:      a.resumes.ats_score,
          matchedSkills: a.resumes.matched_skills,
        } : null,
      };
    });

    res.json({ total: shortlisted.length, shortlisted });
  } catch (err) {
    console.error("[recruiterRoutes] /shortlisted error:", err.message);
    res.status(500).json({ message: "Failed to fetch shortlisted candidates" });
  }
});

/* ─────────────────────────────────────────────
   GET /api/recruiter/jobs
───────────────────────────────────────────── */
router.get("/jobs", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("recruiter_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const jobs = data.map(j => ({
      _id:            j.id,
      title:          j.title,
      description:    j.description,
      company:        j.company,
      location:       j.location,
      salaryRange:    j.salary_range,
      skillsRequired: j.skills_required,
      isActive:       j.is_active,
      createdAt:      j.created_at,
    }));

    res.json({ totalJobs: jobs.length, jobs });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

/* ─────────────────────────────────────────────
   POST /api/recruiter/jobs
───────────────────────────────────────────── */
router.post("/jobs", async (req, res) => {
  try {
    const { title, description, location, salaryRange, skillsRequired } = req.body;
    if (!title || !description)
      return res.status(400).json({ message: "title and description are required" });

    // Fetch company from profile
    const { data: profile } = await supabase
      .from("profiles").select("company").eq("id", req.user.id).single();

    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        title,
        description,
        location:        location || "Remote",
        salary_range:    salaryRange || null,
        skills_required: Array.isArray(skillsRequired) ? skillsRequired : [],
        company:         profile?.company || "Unknown Company",
        recruiter_id:    req.user.id,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "Job posted successfully",
      job: {
        _id:            job.id,
        title:          job.title,
        description:    job.description,
        company:        job.company,
        location:       job.location,
        salaryRange:    job.salary_range,
        skillsRequired: job.skills_required,
        isActive:       job.is_active,
        createdAt:      job.created_at,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to post job" });
  }
});

/* ─────────────────────────────────────────────
   PUT /api/recruiter/jobs/:id
───────────────────────────────────────────── */
router.put("/jobs/:id", async (req, res) => {
  try {
    const { title, description, location, salaryRange, skillsRequired, isActive } = req.body;

    const updatePayload = {
      updated_at: new Date().toISOString(),
    };
    if (title           !== undefined) updatePayload.title           = title;
    if (description     !== undefined) updatePayload.description     = description;
    if (location        !== undefined) updatePayload.location        = location;
    if (salaryRange     !== undefined) updatePayload.salary_range    = salaryRange;
    if (skillsRequired  !== undefined) updatePayload.skills_required = skillsRequired;
    if (isActive        !== undefined) updatePayload.is_active       = isActive;

    const { data: job, error } = await supabase
      .from("jobs")
      .update(updatePayload)
      .eq("id", req.params.id)
      .eq("recruiter_id", req.user.id)
      .select()
      .single();

    if (error || !job) return res.status(404).json({ message: "Job not found" });

    res.json({
      message: "Job updated",
      job: {
        _id: job.id, title: job.title, location: job.location,
        salaryRange: job.salary_range, skillsRequired: job.skills_required,
        isActive: job.is_active,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update job" });
  }
});

/* ─────────────────────────────────────────────
   DELETE /api/recruiter/jobs/:id
───────────────────────────────────────────── */
router.delete("/jobs/:id", async (req, res) => {
  try {
    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", req.params.id)
      .eq("recruiter_id", req.user.id);

    if (error) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete job" });
  }
});

/* ─────────────────────────────────────────────
   GET /api/recruiter/jobs/:id/applicants
   Returns applicants sorted by ATS score desc.
───────────────────────────────────────────── */
router.get("/jobs/:id/applicants", async (req, res) => {
  try {
    // Verify this job belongs to the recruiter
    const { data: job } = await supabase
      .from("jobs").select("id")
      .eq("id", req.params.id)
      .eq("recruiter_id", req.user.id)
      .maybeSingle();

    if (!job) return res.status(404).json({ message: "Job not found" });

    const { data, error } = await supabase
      .from("applications")
      .select(`
        *,
        resumes:resume_id (file_name, ats_score, matched_skills)
      `)
      .eq("job_id", req.params.id)
      .order("ats_score", { ascending: false });

    if (error) throw error;

    // Fetch user profiles & emails separately to avoid PGRST200 schema error
    const userIds = [...new Set(data.map(a => a.user_id).filter(Boolean))];
    let profileMap = {};
    if (userIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", userIds);

      const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const emailMap = Object.fromEntries((authData?.users || []).map(u => [u.id, u.email]));

      (profs || []).forEach(p => {
        profileMap[p.id] = {
          fullName: p.full_name,
          email:    emailMap[p.id] || "",
          phone:    p.phone || "",
        };
      });
    }

    const applicants = data.map(a => {
      const m = a.cover_note ? a.cover_note.match(/\[REJECTION REASON: (.*?)\]/s) : null;
      return {
        _id:       a.id,
        atsScore:  a.ats_score,
        status:    a.status,
        rejectionReason: m ? m[1] : null,
        coverNote: a.cover_note,
        createdAt: a.created_at,
        userId:    profileMap[a.user_id] || null,
        resumeId:  a.resumes ? {
          fileName:      a.resumes.file_name,
          atsScore:      a.resumes.ats_score,
          matchedSkills: a.resumes.matched_skills,
        } : null,
      };
    });

    res.json({ total: applicants.length, applicants });
  } catch (err) {
    console.error("[recruiterRoutes] /jobs/:id/applicants error:", err.message);
    res.status(500).json({ message: "Failed to fetch applicants" });
  }
});

/* ─────────────────────────────────────────────
   PUT /api/recruiter/applicants/:id/status
   Update application status.
───────────────────────────────────────────── */
router.put("/applicants/:id/status", async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!["applied", "shortlisted", "selected", "rejected"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    // ── Ownership check ────────────────────────────────────────────────────
    const { data: ownership } = await supabase
      .from("applications")
      .select("id, jobs!inner(recruiter_id)")
      .eq("id", req.params.id)
      .eq("jobs.recruiter_id", req.user.id)
      .maybeSingle();

    if (!ownership)
      return res.status(403).json({ message: "Access denied: application not found or not yours" });
    // ──────────────────────────────────────────────────────────────────────

    const { data: existingApp } = await supabase
      .from("applications")
      .select("cover_note")
      .eq("id", req.params.id)
      .maybeSingle();

    let newCoverNote = existingApp?.cover_note || "";
    newCoverNote = newCoverNote.replace(/\n\n\[REJECTION REASON: .*?\]/s, "");
    if (status === "rejected" && rejectionReason) {
      newCoverNote += `\n\n[REJECTION REASON: ${rejectionReason}]`;
    }

    const { data, error } = await supabase
      .from("applications")
      .update({ status, cover_note: newCoverNote, updated_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .select("*")
      .single();

    if (error || !data) return res.status(404).json({ message: "Application not found" });

    // Fetch applicant profile & email separately
    const { data: applicantProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", data.user_id)
      .maybeSingle();

    const { data: authUserData } = await supabase.auth.admin.getUserById(data.user_id);

    const m = newCoverNote.match(/\[REJECTION REASON: (.*?)\]/s);
    const parsedReason = m ? m[1] : null;

    res.json({
      message: `Candidate ${status}`,
      application: {
        _id:    data.id,
        status: data.status,
        rejectionReason: parsedReason,
        userId: {
          fullName: applicantProfile?.full_name || "",
          email:    authUserData?.user?.email || "",
        },
      },
    });
  } catch (err) {
    console.error("[recruiterRoutes] /applicants/status error:", err.message);
    res.status(500).json({ message: "Failed to update status" });
  }
});

module.exports = router;