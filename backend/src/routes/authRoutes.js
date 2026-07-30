const express = require("express");
const router  = express.Router();
const {
  signup,
  login,
  seedAdmin,
  googleCallback,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} = require("../controllers/authController");

router.post("/signup",           signup);
router.post("/login",            login);
router.post("/google-callback",  googleCallback);
router.post("/forgot-password",  forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password",   resetPassword);

// Clears the httpOnly auth cookie — must be called from the frontend on logout
router.post("/logout", (_req, res) => {
  res.clearCookie("resumeai_token", {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    path:     "/",
  });
  res.json({ message: "Logged out successfully" });
});

// seed-admin is DISABLED after first use.
// To re-enable: uncomment the line below, create admin, then disable again.
// router.post("/seed-admin", seedAdmin);
router.post("/seed-admin", (_req, res) =>
  res.status(404).json({ message: "Not found" })
);

module.exports = router;