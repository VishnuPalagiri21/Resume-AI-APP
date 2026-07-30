const supabase = require("../config/supabase");

/* ─────────────────────────────────────────────
   VERIFY TOKEN
   Validates the Supabase JWT from the
   Authorization header, then attaches the
   user's id, email, role, and isApproved
   to req.user for downstream route handlers.
───────────────────────────────────────────── */
const verifyToken = async (req, res, next) => {
  try {
    const headerToken =
      req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null;
    const cookieToken = req.cookies?.resumeai_token || null;

    // Try header token first (freshest from client localStorage), fallback to cookie
    const tokensToTry = [headerToken, cookieToken].filter(Boolean);

    if (tokensToTry.length === 0) {
      return res.status(401).json({ message: "No token provided" });
    }

    let user = null;
    for (const token of tokensToTry) {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data && data.user) {
        user = data.user;
        break;
      }
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid Token" });
    }


    // Load role + approval from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, is_approved, full_name, company")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ message: "User profile not found" });
    }

    req.user = {
      id:         user.id,
      email:      user.email,
      role:       profile.role,
      isApproved: profile.is_approved,
    };

    next();
  } catch (err) {
    console.error("[authMiddleware] verifyToken error:", err.message);
    return res.status(401).json({ message: "Invalid Token" });
  }
};

/* ─────────────────────────────────────────────
   ADMIN ONLY
   Must run after verifyToken.
───────────────────────────────────────────── */
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied. Admin Only." });
  }
  next();
};

module.exports = { verifyToken, isAdmin };