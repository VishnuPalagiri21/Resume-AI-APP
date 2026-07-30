const express  = require("express");
const router   = express.Router();
const supabase = require("../config/supabase");
const { analyzeResume } = require("../utils/atsEngine");
const { verifyToken }   = require("../middleware/authMiddleware");

/* ─────────────────────────────────────────────
   POST /api/ats/score
   Scores a resume text (without PDF upload).
   Used by the LaTeX editor AI Assistant panel.
───────────────────────────────────────────── */
router.post("/score", verifyToken, async (req, res) => {
  try {
    const { fileName, extractedText, jobDescription } = req.body;

    if (!fileName || !extractedText)
      return res.status(400).json({ message: "fileName and extractedText are required" });

    const { matchedSkills, missingSkills, atsScore, suggestions } =
      await analyzeResume(extractedText, jobDescription || "");

    const { data, error } = await supabase
      .from("resumes")
      .insert({
        user_id:        req.user.id,
        file_name:      fileName,
        extracted_text: extractedText,
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
      atsScore:      data.ats_score,
      matchedSkills: data.matched_skills,
      missingSkills: data.missing_skills,
      suggestions:   data.suggestions,
      createdAt:     data.created_at,
    };

    res.status(200).json({ message: "ATS Analysis Completed", resume });
  } catch (err) {
    console.error("[atsRoutes] /score error:", err.message);
    res.status(500).json({ message: "ATS Scoring Failed" });
  }
});

module.exports = router;