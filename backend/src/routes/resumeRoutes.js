const express  = require("express");
const router   = express.Router();
const multer   = require("multer");
const pdf      = require("pdf-parse");
const supabase = require("../config/supabase");
const { analyzeResume } = require("../utils/atsEngine");
const { verifyToken }   = require("../middleware/authMiddleware");

// Memory storage — files never touch disk.
// Enforces 5 MB limit and PDF-only MIME type.
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
   GET /api/resumes/resumes
   Returns all analyzed resumes for the
   logged-in user, newest first.
───────────────────────────────────────────── */
router.get("/resumes", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const resumes = data.map(r => ({
      _id:           r.id,
      fileName:      r.file_name,
      extractedText: r.extracted_text,
      atsScore:      r.ats_score,
      matchedSkills: r.matched_skills,
      missingSkills: r.missing_skills,
      suggestions:   r.suggestions,
      createdAt:     r.created_at,
    }));

    res.json({ totalResumes: resumes.length, resumes });
  } catch (err) {
    console.error("[resumeRoutes] GET error:", err.message);
    res.status(500).json({ message: "Failed to fetch resumes" });
  }
});

/* ─────────────────────────────────────────────
   POST /api/resumes/resumes
   Upload a PDF → extract text → run Gemini AI
   analysis → save result to Supabase.
───────────────────────────────────────────── */
router.post("/resumes", verifyToken, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file?.buffer)
      return res.status(400).json({ message: "No file uploaded" });

    // Extract text from PDF buffer
    const pdfData = await pdf(req.file.buffer);
    const text = pdfData.text;

    const { jobDescription } = req.body;

    // Run AI analysis (Gemini or fallback keyword engine)
    const { matchedSkills, missingSkills, atsScore, suggestions } =
      await analyzeResume(text, jobDescription || "");

    const { data, error } = await supabase
      .from("resumes")
      .insert({
        user_id:        req.user.id,
        file_name:      req.file.originalname,
        extracted_text: text.slice(0, 15000),
        ats_score:      atsScore,
        matched_skills: matchedSkills,
        missing_skills: missingSkills,
        suggestions,
      })
      .select()
      .single();

    if (error) throw error;

    const resume = {
      _id:           data.id,
      fileName:      data.file_name,
      extractedText: data.extracted_text,
      atsScore:      data.ats_score,
      matchedSkills: data.matched_skills,
      missingSkills: data.missing_skills,
      suggestions:   data.suggestions,
      createdAt:     data.created_at,
    };

    res.json({ message: "AI analysis successful", resume });
  } catch (err) {
    console.error("[resumeRoutes] POST error:", err.message);
    res.status(500).json({ message: "Failed to process resume" });
  }
});

module.exports = router;