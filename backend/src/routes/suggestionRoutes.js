const express = require("express");
const router = express.Router();
const { analyzeResume } = require("../utils/atsEngine");


// AI SUGGESTION ROUTE  (public — no auth needed, suggestions are stateless)

router.post("/generate", async (req, res) => {

  try {

    const { missingSkills } = req.body;

    if (!Array.isArray(missingSkills)) {
      return res.status(400).json({ message: "missingSkills must be an array" });
    }

    // FIX: re-use the suggestion logic from the shared atsEngine instead of
    // duplicating the switch-case block here.
    // We fabricate a minimal analyzeResume call by passing an empty resume text
    // and a JD built from the missing skills, then return the suggestions.
    const jd = missingSkills.join(" ");
    const { suggestions } = await analyzeResume("", jd);

    res.status(200).json({
      message: "AI Suggestions Generated",
      suggestions,
    });

  } catch (error) {

    console.error("[suggestionRoutes] /generate error:", error.message);
    res.status(500).json({ message: "Suggestion Generation Failed" });

  }

});

module.exports = router;