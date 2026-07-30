const express  = require("express");
const router   = express.Router();
const supabase = require("../config/supabase");
const { verifyToken } = require("../middleware/authMiddleware");

/* ─────────────────────────────────────────────
   GET /api/dashboard/resumes
   Returns the logged-in user's ATS-analyzed
   resumes for the Overview tab on the dashboard.
   Includes only fields needed by the UI.
───────────────────────────────────────────── */
router.get("/resumes", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("resumes")
      .select("id, file_name, ats_score, created_at")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const resumes = data.map(r => ({
      _id:       r.id,
      fileName:  r.file_name,
      atsScore:  r.ats_score,
      createdAt: r.created_at,
    }));

    res.status(200).json({ totalResumes: resumes.length, resumes });
  } catch (err) {
    console.error("[dashboardRoutes] /resumes error:", err.message);
    res.status(500).json({ message: "Failed to Fetch Resumes" });
  }
});

module.exports = router;