const express          = require("express");
const router           = express.Router();
const multer           = require("multer");
const pdf              = require("pdf-parse");
const supabase         = require("../config/supabase");
const { analyzeResume } = require("../utils/atsEngine");
const { verifyToken }   = require("../middleware/authMiddleware");

// All user routes require authentication
router.use(verifyToken);

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

/* ─────────────────────────────────────────────
   GET /api/user/stats
   Dashboard summary: resume count, applications
   count, active job count.
───────────────────────────────────────────── */
router.get("/stats", async (req, res) => {
  try {
    const [
      { count: resumeCount },
      { count: applicationCount },
      { count: activeJobs },
    ] = await Promise.all([
      supabase.from("resumes").select("*", { count: "exact", head: true }).eq("user_id", req.user.id),
      supabase.from("applications").select("*", { count: "exact", head: true }).eq("user_id", req.user.id),
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("is_active", true),
    ]);

    res.json({ resumeCount, applicationCount, activeJobs });
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

    // Fetch recruiter profiles separately
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
   Single job detail.
───────────────────────────────────────────── */
router.get("/jobs/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ message: "Job not found" });

    const { data: recruiterProfile } = await supabase
      .from("profiles")
      .select("full_name, company")
      .eq("id", data.recruiter_id)
      .maybeSingle();

    res.json({
      _id:            data.id,
      title:          data.title,
      description:    data.description,
      company:        data.company,
      location:       data.location,
      salaryRange:    data.salary_range,
      skillsRequired: data.skills_required,
      isActive:       data.is_active,
      createdAt:      data.created_at,
      recruiterId: {
        fullName: recruiterProfile?.full_name || "",
        company:  recruiterProfile?.company || data.company,
      },
    });
  } catch (err) {
    console.error("[userRoutes] /jobs/:id error:", err.message);
    res.status(500).json({ message: "Failed to fetch job" });
  }
});

/* ─────────────────────────────────────────────
   POST /api/user/jobs/:id/apply
   Comprehensive Job Application endpoint.
   Supports direct PDF resume upload, existing resume
   selection, screening fields & cover note.
───────────────────────────────────────────── */
router.post("/jobs/:id/apply", upload.single("resumeFile"), async (req, res) => {
  try {
    const {
      resumeId,
      coverNote,
      resumeText,
      fullName,
      email,
      phone,
      location,
      experienceYears,
      noticePeriod,
      linkedinUrl,
      portfolioUrl
    } = req.body;

    // Prevent duplicate applications (also enforced by DB UNIQUE constraint)
    const { data: existing } = await supabase
      .from("applications")
      .select("id")
      .eq("job_id", req.params.id)
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    // Verify job exists and is active
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, is_active, skills_required")
      .eq("id", req.params.id)
      .single();

    if (jobError || !job || !job.is_active) {
      return res.status(404).json({ message: "Job not found or inactive" });
    }

    let finalResumeId = resumeId || null;
    let textToAnalyze = resumeText || "";
    let atsScore = 0;

    // Direct PDF Upload inside Apply Modal
    if (req.file) {
      const pdfData = await pdf(req.file.buffer);
      textToAnalyze = pdfData.text || "";

      const skillsStr = Array.isArray(job.skills_required) ? job.skills_required.join(" ") : "";
      const analysis = await analyzeResume(textToAnalyze, skillsStr);
      atsScore = analysis.atsScore || 0;

      // Save uploaded resume into database
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

    // Format structured candidate information into cover_note payload
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

    // Automatic Shortlisting: if skills match JD perfectly (ATS >= 70%), auto-shortlist!
    const autoStatus = atsScore >= 70 ? "shortlisted" : "applied";

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

    res.status(201).json({
      message: atsScore >= 70
        ? "Application submitted! High skill match — automatically shortlisted! ⭐"
        : "Application submitted successfully",
      application: {
        _id:       application.id,
        atsScore:  application.ats_score,
        status:    application.status,
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
   with job details joined.
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
      return {
        _id:       a.id,
        atsScore:  a.ats_score,
        status:    a.status,
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
