const express      = require("express");
const router       = express.Router();
const supabase     = require("../config/supabase");
const { verifyToken } = require("../middleware/authMiddleware");
const notificationRoutes = require("./notificationRoutes");

// Guard: recruiter role only
const isApprovedRecruiter = (req, res, next) => {
  if (req.user.role !== "recruiter")
    return res.status(403).json({ message: "Recruiter access only" });
  next();
};

router.use(verifyToken, isApprovedRecruiter);

// Helper: Extract or initialize status history audit trail from application
function getStatusHistory(app) {
  if (Array.isArray(app.status_history) && app.status_history.length > 0) {
    return app.status_history;
  }
  const m = app.cover_note ? app.cover_note.match(/\[STATUS_HISTORY: (.*?)\]/s) : null;
  if (m) {
    try {
      return JSON.parse(m[1]);
    } catch (e) {}
  }
  return [
    {
      status: "Applied",
      timestamp: app.created_at || new Date().toISOString(),
      updatedBy: "Candidate",
    },
  ];
}

// Helper: Append a transition to the audit trail
function appendStatusHistory(app, newStatus, updatedBy, reason = null) {
  const currentHistory = getStatusHistory(app);
  const prettyMap = {
    applied: "Applied",
    under_review: "Under Review",
    shortlisted: "Shortlisted",
    selected: "Selected",
    rejected: "Rejected",
  };
  const prettyStatus = prettyMap[newStatus] || newStatus;
  currentHistory.push({
    status: prettyStatus,
    timestamp: new Date().toISOString(),
    updatedBy: updatedBy || "Recruiter",
    reason: reason || null,
  });
  return currentHistory;
}

/* ─────────────────────────────────────────────
   GET /api/recruiter/stats
   Dynamic recruitment statistics matching database
───────────────────────────────────────────── */
router.get("/stats", async (req, res) => {
  try {
    const { data: myJobs } = await supabase
      .from("jobs")
      .select("id, is_active")
      .eq("recruiter_id", req.user.id);

    const jobIds = (myJobs || []).map(j => j.id);
    const safeIds = jobIds.length > 0 ? jobIds : ["00000000-0000-0000-0000-000000000000"];

    const openPositions   = (myJobs || []).filter(j => j.is_active !== false).length;
    const closedPositions = (myJobs || []).filter(j => j.is_active === false).length;

    const [
      { count: totalApplications },
      { count: underReview },
      { count: shortlisted },
      { count: selected },
      { count: rejected },
    ] = await Promise.all([
      supabase.from("applications").select("*", { count: "exact", head: true }).in("job_id", safeIds),
      supabase.from("applications").select("*", { count: "exact", head: true }).in("job_id", safeIds).eq("status", "under_review"),
      supabase.from("applications").select("*", { count: "exact", head: true }).in("job_id", safeIds).eq("status", "shortlisted"),
      supabase.from("applications").select("*", { count: "exact", head: true }).in("job_id", safeIds).eq("status", "selected"),
      supabase.from("applications").select("*", { count: "exact", head: true }).in("job_id", safeIds).eq("status", "rejected"),
    ]);

    res.json({
      totalJobs: (myJobs || []).length,
      totalApplications: totalApplications || 0,
      underReview: underReview || 0,
      shortlisted: (shortlisted || 0) + (selected || 0), // Include selected in shortlisted badge count
      selected: selected || 0,
      rejected: rejected || 0,
      openPositions,
      closedPositions,
    });
  } catch (err) {
    console.error("[recruiterRoutes] /stats error:", err.message);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

/* ─────────────────────────────────────────────
   GET /api/recruiter/applicants/all
   Returns all applicants across all recruiter jobs
   with search and filter options.
───────────────────────────────────────────── */
// Shared helper for fetching and filtering recruiter applicants
async function getRecruiterApplicantsHandler(req, res) {
  try {
    const { status, search, minScore, jobId } = req.query;

    const { data: myJobs } = await supabase
      .from("jobs")
      .select("id, title, company, location")
      .eq("recruiter_id", req.user.id);

    const jobIds = (myJobs || []).map(j => j.id);
    if (jobIds.length === 0) {
      return res.json({ total: 0, applicants: [] });
    }
    const jobMap = Object.fromEntries((myJobs || []).map(j => [j.id, j]));

    let targetIds = jobIds;
    if (jobId && jobIds.includes(jobId)) {
      targetIds = [jobId];
    }

    let query = supabase
      .from("applications")
      .select(`
        *,
        resumes:resume_id (file_name, ats_score, matched_skills, extracted_text)
      `)
      .in("job_id", targetIds)
      .order("updated_at", { ascending: false });

    if (status && status !== "all") {
      if (status === "shortlisted") {
        query = query.in("status", ["shortlisted", "selected"]);
      } else {
        query = query.eq("status", status);
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    const userIds = [...new Set((data || []).map(a => a.user_id).filter(Boolean))];
    let profileMap = {};
    if (userIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, phone, skills, experience_years")
        .in("id", userIds);

      const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const emailMap = Object.fromEntries((authData?.users || []).map(u => [u.id, u.email]));

      (profs || []).forEach(p => {
        profileMap[p.id] = {
          fullName: p.full_name,
          email:    emailMap[p.id] || "",
          phone:    p.phone || "",
          skills:   p.skills || [],
          experienceYears: p.experience_years || "",
        };
      });
    }

    let applicants = (data || []).map(a => {
      const m = a.cover_note ? a.cover_note.match(/\[REJECTION REASON: (.*?)\]/s) : null;
      const history = getStatusHistory(a);
      const userObj = profileMap[a.user_id] || { fullName: "Applicant", email: "", phone: "", skills: [] };

      return {
        _id:       a.id,
        atsScore:  a.ats_score,
        status:    a.status,
        statusHistory: history,
        rejectionReason: m ? m[1] : null,
        coverNote: a.cover_note,
        createdAt: a.created_at,
        updatedAt: a.updated_at || a.created_at,
        job:       jobMap[a.job_id] || null,
        userId:    userObj,
        resumeId:  a.resumes ? {
          fileName:      a.resumes.file_name,
          atsScore:      a.resumes.ats_score,
          matchedSkills: a.resumes.matched_skills,
          extractedText: a.resumes.extracted_text || "",
        } : null,
      };
    });

    // In-memory filter for minimum ATS score
    if (minScore) {
      const minNum = Number(minScore);
      if (!isNaN(minNum)) {
        applicants = applicants.filter(a => (a.atsScore || 0) >= minNum);
      }
    }

    // Advanced search across candidate name, email, phone, job title, skills, resume keywords
    if (search) {
      const q = search.toLowerCase();
      applicants = applicants.filter(a => {
        const nameMatch  = (a.userId?.fullName || "").toLowerCase().includes(q);
        const emailMatch = (a.userId?.email || "").toLowerCase().includes(q);
        const phoneMatch = (a.userId?.phone || "").toLowerCase().includes(q);
        const jobMatch   = (a.job?.title || "").toLowerCase().includes(q);
        const skillMatch = Array.isArray(a.userId?.skills) && a.userId.skills.some(s => s.toLowerCase().includes(q));
        const resSkillMatch = Array.isArray(a.resumeId?.matchedSkills) && a.resumeId.matchedSkills.some(s => s.toLowerCase().includes(q));
        const resTextMatch  = (a.resumeId?.extractedText || "").toLowerCase().includes(q);
        return nameMatch || emailMatch || phoneMatch || jobMatch || skillMatch || resSkillMatch || resTextMatch;
      });
    }

    return res.json({ total: applicants.length, applicants });
  } catch (err) {
    console.error("[recruiterRoutes] /applicants error:", err.message);
    return res.status(500).json({ message: "Failed to fetch applicants" });
  }
}

router.get("/applicants/all", getRecruiterApplicantsHandler);

router.get("/shortlisted", (req, res) => {
  req.query.status = "shortlisted";
  return getRecruiterApplicantsHandler(req, res);
});

router.get("/selected", (req, res) => {
  req.query.status = "selected";
  return getRecruiterApplicantsHandler(req, res);
});

router.get("/rejected", (req, res) => {
  req.query.status = "rejected";
  return getRecruiterApplicantsHandler(req, res);
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
───────────────────────────────────────────── */
router.get("/jobs/:id/applicants", (req, res) => {
  req.query.jobId = req.params.id;
  return getRecruiterApplicantsHandler(req, res);
});

/* ─────────────────────────────────────────────
   PUT /api/recruiter/applicants/:id/status
   Enterprise Status Workflow with Audit Trail
   & Automated Candidate Notifications
───────────────────────────────────────────── */
router.put("/applicants/:id/status", async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const allowed = ["applied", "under_review", "shortlisted", "selected", "rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${allowed.join(", ")}` });
    }

    // Ownership check
    const { data: ownership } = await supabase
      .from("applications")
      .select("id, user_id, status, cover_note, status_history, created_at, jobs!inner(title, company, recruiter_id)")
      .eq("id", req.params.id)
      .eq("jobs.recruiter_id", req.user.id)
      .maybeSingle();

    if (!ownership) {
      return res.status(403).json({ message: "Access denied: application not found or not yours" });
    }

    const { data: recruiterProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", req.user.id)
      .maybeSingle();
    const updaterName = recruiterProfile?.full_name || "Recruiter";

    // ── Build Updated Audit Trail ──
    const newHistory = appendStatusHistory(ownership, status, updaterName, rejectionReason);

    // ── Update Cover Note Metadata with JSON History & Rejection Reason ──
    let newCoverNote = ownership.cover_note || "";
    newCoverNote = newCoverNote
      .replace(/\n\n\[STATUS_HISTORY: .*?\]/s, "")
      .replace(/\n\n\[REJECTION REASON: .*?\]/s, "");

    if (status === "rejected" && rejectionReason) {
      newCoverNote += `\n\n[REJECTION REASON: ${rejectionReason}]`;
    }
    newCoverNote += `\n\n[STATUS_HISTORY: ${JSON.stringify(newHistory)}]`;

    // ── Update Database (trying status_history column if present) ──
    const updatePayload = {
      status,
      cover_note: newCoverNote,
      updated_at: new Date().toISOString(),
    };

    // Try setting status_history JSONB column
    const { data, error } = await supabase
      .from("applications")
      .update({ ...updatePayload, status_history: newHistory })
      .eq("id", req.params.id)
      .select("*")
      .maybeSingle();

    let savedApp = data;
    if (error && (error.code === "42703" || error.code === "PGRST204")) {
      // Column status_history doesn't exist yet, update without it
      const { data: fallbackData, error: fallbackErr } = await supabase
        .from("applications")
        .update(updatePayload)
        .eq("id", req.params.id)
        .select("*")
        .single();
      if (fallbackErr) throw fallbackErr;
      savedApp = fallbackData;
    } else if (error) {
      throw error;
    }

    // ── AUTOMATED CANDIDATE NOTIFICATION ──
    const jobTitle = ownership.jobs?.title || "your job application";
    const companyName = ownership.jobs?.company || "the company";
    let notifTitle = "Application Status Updated";
    let notifMsg = `Your application for ${jobTitle} at ${companyName} has been updated to ${status}.`;

    if (status === "under_review") {
      notifTitle = "Application Under Review 🔎";
      notifMsg = `Your application for ${jobTitle} at ${companyName} has moved to Under Review.`;
    } else if (status === "shortlisted") {
      notifTitle = "You have been Shortlisted! ⭐";
      notifMsg = `Congratulations! You have been shortlisted for ${jobTitle} at ${companyName}.`;
    } else if (status === "selected") {
      notifTitle = "You have been Selected! 🎉";
      notifMsg = `Congratulations! You have been selected for ${jobTitle} at ${companyName}. The hiring team will contact you soon.`;
    } else if (status === "rejected") {
      notifTitle = "Application Status Update";
      notifMsg = `Unfortunately your application for ${jobTitle} at ${companyName} was not selected.${rejectionReason ? ` Note: ${rejectionReason}` : ""}`;
    }

    await notificationRoutes.addStatusNotification(ownership.user_id, notifTitle, notifMsg, `/dashboard/user`);

    // Fetch applicant info
    const { data: applicantProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", ownership.user_id)
      .maybeSingle();

    const { data: authUserData } = await supabase.auth.admin.getUserById(ownership.user_id);

    const m = newCoverNote.match(/\[REJECTION REASON: (.*?)\]/s);
    const parsedReason = m ? m[1] : null;

    res.json({
      message: `Candidate status updated to ${status}`,
      application: {
        _id:    savedApp.id,
        status: savedApp.status,
        statusHistory: newHistory,
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