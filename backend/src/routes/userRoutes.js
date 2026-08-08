const express          = require("express");
const router           = express.Router();
const multer           = require("multer");
const pdf              = require("pdf-parse");
const supabase         = require("../config/supabase");
const { analyzeResume } = require("../utils/atsEngine");
const { verifyToken }   = require("../middleware/authMiddleware");
const notificationRoutes = require("./notificationRoutes");

// All user routes require authentication + user role
const isUser = (req, res, next) => {
  if (req.user.role !== "user")
    return res.status(403).json({ message: "Job seeker access only" });
  next();
};
router.use(verifyToken, isUser);

// Memory storage for direct PDF resume uploads inside Apply Modal
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const mimetype = (file.mimetype || "").toLowerCase();
    const originalname = (file.originalname || "").toLowerCase();
    const isPdf =
      mimetype.includes("pdf") ||
      mimetype.includes("octet-stream") ||
      mimetype === "" ||
      originalname.endsWith(".pdf");

    if (!isPdf) {
      return cb(new Error("Only PDF files are accepted"), false);
    }
    cb(null, true);
  },
});

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
  const prettyMap = {
    applied: "Applied",
    under_review: "Under Review",
    shortlisted: "Shortlisted",
    selected: "Selected",
    rejected: "Rejected",
  };
  return [
    {
      status: prettyMap[app.status] || app.status || "Applied",
      timestamp: app.created_at || new Date().toISOString(),
      updatedBy: "Candidate",
    },
  ];
}

/* ─────────────────────────────────────────────
   GET /api/user/stats
   Dashboard summary: resume count, applications
   count, application lifecycle breakdown, active jobs, unread notifications.
───────────────────────────────────────────── */
router.get("/stats", async (req, res) => {
  try {
    const [
      { count: resumeCount },
      { count: applicationCount },
      { count: activeJobs },
      { count: underReview },
      { count: shortlisted },
      { count: selected },
      { count: rejected },
    ] = await Promise.all([
      supabase.from("resumes").select("*", { count: "exact", head: true }).eq("user_id", req.user.id),
      supabase.from("applications").select("*", { count: "exact", head: true }).eq("user_id", req.user.id),
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("applications").select("*", { count: "exact", head: true }).eq("user_id", req.user.id).eq("status", "under_review"),
      supabase.from("applications").select("*", { count: "exact", head: true }).eq("user_id", req.user.id).eq("status", "shortlisted"),
      supabase.from("applications").select("*", { count: "exact", head: true }).eq("user_id", req.user.id).eq("status", "selected"),
      supabase.from("applications").select("*", { count: "exact", head: true }).eq("user_id", req.user.id).eq("status", "rejected"),
    ]);

    let unreadNotifications = 0;
    try {
      const { data: notifs, error: notifErr } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", req.user.id)
        .eq("is_read", false);
      if (!notifErr && notifs) {
        unreadNotifications = notifs.length;
      }
    } catch (e) {}

    res.json({
      resumeCount: resumeCount || 0,
      applicationCount: applicationCount || 0,
      activeJobs: activeJobs || 0,
      underReview: underReview || 0,
      shortlisted: shortlisted || 0,
      selected: selected || 0,
      rejected: rejected || 0,
      unreadNotifications,
    });
  } catch (err) {
    console.error("[userRoutes] /stats error:", err.message);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

/* ─────────────────────────────────────────────
   GET /api/user/jobs
   Browse all active jobs. Supports ?search and
   ?skill query params.
───────────────────────────────────────────── */
router.get("/jobs", async (req, res) => {
  try {
    const { search, skill } = req.query;

    let query = supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (search) query = query.ilike("title", `%${search}%`);
    if (skill)  query = query.contains("skills_required", [skill]);

    const { data, error } = await query;
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
      _id:            j.id,
      title:          j.title,
      description:    j.description,
      company:        j.company,
      location:       j.location,
      salaryRange:    j.salary_range,
      skillsRequired: j.skills_required,
      isActive:       j.is_active,
      createdAt:      j.created_at,
      recruiterId:    recruiterMap[j.recruiter_id] || { fullName: "", company: j.company },
    }));

    res.json({ totalJobs: jobs.length, jobs });
  } catch (err) {
    console.error("[userRoutes] /jobs error:", err.message);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

/* ─────────────────────────────────────────────
   GET /api/user/jobs/:id
───────────────────────────────────────────── */
router.get("/jobs/:id", async (req, res) => {
  try {
    const { data: job, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error || !job) return res.status(404).json({ message: "Job not found" });

    let recruiterInfo = { fullName: "", company: job.company };
    if (job.recruiter_id) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name, company")
        .eq("id", job.recruiter_id)
        .single();
      if (prof) recruiterInfo = { fullName: prof.full_name, company: prof.company };
    }

    res.json({
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
        recruiterId:    recruiterInfo,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch job" });
  }
});

/* ─────────────────────────────────────────────
   POST /api/user/jobs/:id/apply
   Submit application. Supports direct PDF upload
   OR existing resumeId. Includes automatic shortlisting
   & status history initialization.
───────────────────────────────────────────── */
router.post("/jobs/:id/apply", upload.single("resume"), async (req, res) => {
  try {
    const {
      resumeId,
      coverNote,
      fullName,
      email,
      phone,
      location,
      experienceYears,
      noticePeriod,
      linkedinUrl,
      portfolioUrl,
    } = req.body;

    const { data: job } = await supabase
      .from("jobs")
      .select("id, skills_required, title, company, recruiter_id")
      .eq("id", req.params.id)
      .single();

    if (!job) return res.status(404).json({ message: "Job not found" });

    // Prevent duplicate applications
    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("job_id", req.params.id)
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({
        message: "You have already applied to this job. Check your Applications tab for status.",
      });
    }

    let atsScore = 0;
    let finalResumeId = resumeId || null;
    let textToAnalyze = "";

    // Direct PDF Upload inside Apply Modal
    if (req.file) {
      const pdfData = await pdf(req.file.buffer);
      textToAnalyze = pdfData.text || "";

      const skillsStr = Array.isArray(job.skills_required) ? job.skills_required.join(" ") : "";
      const analysis = await analyzeResume(textToAnalyze, skillsStr);
      atsScore = analysis.atsScore || 0;

      const { data: newResume } = await supabase
        .from("resumes")
        .insert({
          user_id:        req.user.id,
          file_name:      req.file.originalname,
          extracted_text: textToAnalyze,
          ats_score:      atsScore,
          matched_skills: analysis.matchedSkills || [],
          missing_skills: analysis.missingSkills || [],
          suggestions:    analysis.suggestions || [],
        })
        .select()
        .single();

      if (newResume) finalResumeId = newResume.id;
    } else if (resumeId) {
      const { data: resumeObj } = await supabase
        .from("resumes")
        .select("extracted_text, ats_score")
        .eq("id", resumeId)
        .single();

      if (resumeObj) {
        textToAnalyze = textToAnalyze || resumeObj.extracted_text || "";
        atsScore = resumeObj.ats_score || 0;
      }
    }

    if (textToAnalyze && atsScore === 0) {
      const skillsStr = Array.isArray(job.skills_required) ? job.skills_required.join(" ") : "";
      const result = await analyzeResume(textToAnalyze, skillsStr);
      atsScore = result.atsScore || 0;
    }

    let fullNote = "";
    if (fullName || email || phone || location || experienceYears || noticePeriod || linkedinUrl || portfolioUrl) {
      fullNote += `--- APPLICANT INFORMATION ---\n`;
      if (fullName) fullNote += `Full Name: ${fullName}\n`;
      if (email) fullNote += `Email: ${email}\n`;
      if (phone) fullNote += `Phone: ${phone}\n`;
      if (location) fullNote += `Location: ${location}\n`;
      if (experienceYears) fullNote += `Total Experience: ${experienceYears}\n`;
      if (noticePeriod) fullNote += `Notice Period / Availability: ${noticePeriod}\n`;
      if (linkedinUrl) fullNote += `LinkedIn: ${linkedinUrl}\n`;
      if (portfolioUrl) fullNote += `Portfolio / GitHub: ${portfolioUrl}\n`;
      fullNote += `\n--- COVER NOTE ---\n`;
    }
    fullNote += coverNote || "No cover note provided.";

    const autoStatus = atsScore >= 70 ? "shortlisted" : "applied";
    const initialHistory = [
      {
        status: autoStatus === "shortlisted" ? "Shortlisted" : "Applied",
        timestamp: new Date().toISOString(),
        updatedBy: autoStatus === "shortlisted" ? "AI ATS Engine" : "Candidate",
      },
    ];
    fullNote += `\n\n[STATUS_HISTORY: ${JSON.stringify(initialHistory)}]`;

    const { data: application, error } = await supabase
      .from("applications")
      .insert({
        job_id:     req.params.id,
        user_id:    req.user.id,
        resume_id:  finalResumeId,
        ats_score:  atsScore,
        cover_note: fullNote,
        status:     autoStatus,
      })
      .select()
      .single();

    if (error) throw error;

    // Send confirmation notification
    await notificationRoutes.addStatusNotification(
      req.user.id,
      autoStatus === "shortlisted" ? "Application Submitted & Shortlisted! ⭐" : "Application Submitted ✅",
      `Your application for ${job.title} at ${job.company} was received successfully.`,
      `/dashboard/user`
    );

    res.status(201).json({
      message: atsScore >= 70
        ? "Application submitted! High skill match — automatically shortlisted! ⭐"
        : "Application submitted successfully",
      application: {
        _id:       application.id,
        atsScore:  application.ats_score,
        status:    application.status,
        statusHistory: initialHistory,
        createdAt: application.created_at,
      },
    });
  } catch (err) {
    console.error("[userRoutes] /apply error:", err.message);
    res.status(500).json({ message: "Failed to apply" });
  }
});

/* ─────────────────────────────────────────────
   GET /api/user/applications
   All applications by the logged-in user,
   with job details & live Status Timeline audit trail
───────────────────────────────────────────── */
router.get("/applications", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("applications")
      .select("*, jobs:job_id (title, company, location, salary_range)")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const applications = data.map(a => {
      const m = a.cover_note ? a.cover_note.match(/\[REJECTION REASON: (.*?)\]/s) : null;
      const history = getStatusHistory(a);

      return {
        _id:       a.id,
        atsScore:  a.ats_score,
        status:    a.status,
        statusHistory: history,
        rejectionReason: m ? m[1] : null,
        coverNote: a.cover_note,
        createdAt: a.created_at,
        jobId: a.jobs ? {
          title:       a.jobs.title,
          company:     a.jobs.company,
          location:    a.jobs.location,
          salaryRange: a.jobs.salary_range,
        } : null,
      };
    });

    res.json({ totalApplications: applications.length, applications });
  } catch (err) {
    console.error("[userRoutes] /applications error:", err.message);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
});

module.exports = router;
