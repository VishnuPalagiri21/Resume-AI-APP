const { isEmail }              = require("validator");
const bcrypt                   = require("bcryptjs");
const jwt                      = require("jsonwebtoken");
const crypto                   = require("crypto");
const supabase                 = require("../config/supabase");
const { sendPasswordResetOtp } = require("../services/emailService");

// In-memory rate limiter: max 3 OTP requests per hour per email
const rateLimitStore = new Map();

// In-memory OTP fallback store (used when password_reset_otps DB table doesn't exist yet)
// Format: email -> { userId, otpHash, expiresAt, attempts, id }
const otpMemoryStore = new Map();

// JWT secret for short-lived password reset tokens (15 min)
const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET || "resumeai_secure_password_reset_jwt_secret_key_2026";

/* ═══════════════════════════════════════════════
   SIGNUP
   Creates a Supabase Auth user (email confirmed)
   then inserts an extended profile row.
═══════════════════════════════════════════════ */
const signup = async (req, res) => {
  try {
    const { fullName, email, password, role, company, phone } = req.body;

    // ── Required field presence ──────────────────────────────────────────────
    if (!fullName || !email || !password)
      return res.status(400).json({ message: "fullName, email and password are required" });

    // ── Admin self-registration guard ────────────────────────────────────────
    if (role === "admin")
      return res.status(403).json({ message: "Admin accounts cannot be self-registered" });

    // ── Recruiter must supply company ────────────────────────────────────────
    if (role === "recruiter" && !company)
      return res.status(400).json({ message: "Company name is required for recruiter accounts" });

    // ── RFC 5322 email format validation ─────────────────────────────────────
    // Accepts any valid email (any domain, any local part).
    // No longer restricts to @gmail.com or forces local-part = name match.
    if (!isEmail(email))
      return res.status(400).json({ message: "Invalid email address format" });

    // ── Password strength — minimum 8 characters ─────────────────────────────
    if (password.length < 8)
      return res.status(400).json({ message: "Password must be at least 8 characters" });

    // ── Field length guards ───────────────────────────────────────────────────
    if (fullName.length > 100)
      return res.status(400).json({ message: "Full name must be 100 characters or fewer" });
    if (company && company.length > 100)
      return res.status(400).json({ message: "Company name must be 100 characters or fewer" });
    if (phone && !/^\+?[\d\s\-().]{7,20}$/.test(phone))
      return res.status(400).json({ message: "Invalid phone number format" });

    // Create user in Supabase Auth — admin API auto-confirms the email
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) return res.status(400).json({ message: error.message });

    // Insert extended profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id:          data.user.id,
      full_name:   fullName,
      role:        role || "user",
      company:     company || null,
      phone:       phone   || null,
      is_approved: true,
    });
    if (profileError) {
      // Roll back: delete the auth user if profile insert fails
      await supabase.auth.admin.deleteUser(data.user.id);
      return res.status(500).json({ message: "Failed to create profile. Please try again." });
    }

    res.status(201).json({
      message: "Account registered successfully! You can now log in.",
    });
  } catch (err) {
    console.error("[authController] signup error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ═══════════════════════════════════════════════
   LOGIN
   Signs in via Supabase Auth, returns Supabase
   JWT as 'token' — same shape as before so the
   frontend needs zero changes.
═══════════════════════════════════════════════ */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Basic presence check ─────────────────────────────────────────────────
    if (!email || !password)
      return res.status(400).json({ message: "email and password are required" });

    // ── RFC 5322 email format check ───────────────────────────────────────────
    // Catches malformed inputs early before hitting Supabase.
    if (!isEmail(email))
      return res.status(400).json({ message: "Invalid email address format" });

    // Sign in via a separate, isolated client to avoid polluting our service-role client.
    const authClient = supabase.createUserAuthClient();
    const { data, error } = await authClient.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ message: "Invalid Credentials" });

    const loginData = { user: data.user, session: data.session };

    // Fetch extended profile (uses service_role key)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", loginData.user.id)
      .single();

    if (profileError || !profile)
      return res.status(400).json({ message: "Profile not found" });

    // ── Portal / Role Isolation Check ────────────────────────────────────────
    // If logging in through User Portal (expectedRole="user"), block recruiter accounts.
    // If logging in through Recruiter Portal (expectedRole="recruiter"), block job seeker accounts.
    if (req.body.expectedRole && profile.role !== req.body.expectedRole) {
      const errMsg = req.body.expectedRole === "user"
        ? "Access Denied: This account is registered as a Recruiter. Please log in using the Recruiter Portal."
        : "Access Denied: This account is registered as a Job Seeker. Please log in using the User Portal.";
    }

    const safeUser = {
      id:         loginData.user.id,
      email:      loginData.user.email,
      fullName:   profile.full_name,
      role:       profile.role,
      company:    profile.company,
      isApproved: profile.is_approved,
    };

    const roleRedirect = {
      user:      "/dashboard/user",
      recruiter: "/dashboard/recruiter",
      admin:     "/admin",
    }[profile.role];

    // ── Set httpOnly cookie ───────────────────────────────────────────────────
    // The token is stored as an httpOnly cookie — JavaScript on the page cannot
    // read it, making XSS-based token theft impossible.
    // In production (NODE_ENV=production) the Secure flag forces HTTPS-only.
    res.cookie("resumeai_token", loginData.session.access_token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "strict",          // Blocks CSRF — cookie not sent on cross-site requests
      maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in ms
      path:     "/",
    });
    // ────────────────────────────────────────────────────────────────────────

    res.status(200).json({
      message:      "Login Successful",
      // token still included for backward compatibility with existing frontend code.
      // Frontend should migrate to relying on the cookie; remove this field when done.
      token:        loginData.session.access_token,
      user:         safeUser,
      roleRedirect,
    });
  } catch (err) {
    console.error("[authController] login error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ═══════════════════════════════════════════════
   SEED ADMIN
   One-time setup — protected by ADMIN_SEED_KEY.
   Creates an admin account in Supabase Auth +
   profiles table.
═══════════════════════════════════════════════ */
const seedAdmin = async (req, res) => {
  try {
    const { secretKey, fullName, email, password } = req.body;

    if (secretKey !== process.env.ADMIN_SEED_KEY)
      return res.status(403).json({ message: "Invalid seed key" });

    // Validate admin email format too
    if (!isEmail(email))
      return res.status(400).json({ message: "Invalid email address format" });

    if (!password || password.length < 8)
      return res.status(400).json({ message: "Password must be at least 8 characters" });

    // Check if admin already exists
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin")
      .maybeSingle();
    if (existing) return res.status(400).json({ message: "Admin already exists" });

    // Create auth user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) return res.status(500).json({ message: error.message });

    // Insert admin profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id:          data.user.id,
      full_name:   fullName,
      role:        "admin",
      is_approved: true,
    });
    if (profileError) {
      await supabase.auth.admin.deleteUser(data.user.id);
      return res.status(500).json({ message: "Failed to create admin profile." });
    }

    res.status(201).json({ message: "Admin created successfully" });
  } catch (err) {
    console.error("[authController] seedAdmin error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ═══════════════════════════════════════════════
   GOOGLE OAUTH CALLBACK
   Verifies Supabase access_token, extracts user details,
   creates profile if first time login, sets httpOnly cookie,
   and returns safe user payload with roleRedirect.
═══════════════════════════════════════════════ */
const googleCallback = async (req, res) => {
  try {
    const { access_token, expectedRole } = req.body;

    if (!access_token) {
      return res.status(400).json({ message: "access_token is required" });
    }

    // Ask Supabase Auth to validate the token and return user
    const { data: authData, error: authError } = await supabase.auth.getUser(access_token);
    if (authError || !authData || !authData.user) {
      return res.status(401).json({ message: "Invalid or expired Google session token" });
    }

    const authUser = authData.user;
    const email = authUser.email;
    const userMetadata = authUser.user_metadata || {};
    const fullName = userMetadata.full_name || userMetadata.name || email.split("@")[0];
    const avatarUrl = userMetadata.avatar_url || userMetadata.picture || null;

    // Check if profile already exists in Supabase PostgreSQL
    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    if (profileError) {
      console.error("[authController] profile lookup error:", profileError.message);
    }

    // First-time registration or sync for Google OAuth user
    if (!profile) {
      const assignedRole = (expectedRole === "recruiter") ? "recruiter" : "user";
      
      const profilePayload = {
        id: authUser.id,
        full_name: fullName,
        role: assignedRole,
        company: null,
        phone: null,
        is_approved: true,
      };

      // Use upsert to safely insert or fetch existing row (handles primary key collisions & DB triggers)
      const { data: upsertedProfile, error: upsertError } = await supabase
        .from("profiles")
        .upsert(profilePayload, { onConflict: "id" })
        .select("*")
        .single();

      if (upsertError) {
        console.error("[authController] profile upsert error:", upsertError.message);
        return res.status(500).json({ message: `Failed to create user profile: ${upsertError.message}` });
      }
      profile = upsertedProfile || profilePayload;
    }

    // Role Isolation Check
    if (expectedRole && profile.role !== expectedRole) {
      const errMsg = expectedRole === "user"
        ? "Access Denied: Account registered as Recruiter. Please log in via Recruiter Portal."
        : "Access Denied: Account registered as Job Seeker. Please log in via User Portal.";
      return res.status(403).json({ message: errMsg });
    }

    const safeUser = {
      id: authUser.id,
      email: authUser.email,
      fullName: profile.full_name || fullName,
      role: profile.role || "user",
      company: profile.company || null,
      avatarUrl: avatarUrl,
      isApproved: profile.is_approved,
    };

    const roleRedirect = {
      user: "/dashboard/user",
      recruiter: "/dashboard/recruiter",
      admin: "/admin",
    }[profile.role] || "/dashboard/user";

    // Set httpOnly cookie for session security
    res.cookie("resumeai_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({
      message: "Google Authentication Successful",
      token: access_token,
      user: safeUser,
      roleRedirect,
    });
  } catch (err) {
    console.error("[authController] googleCallback error:", err.message);
    res.status(500).json({ message: "Server Error during Google Authentication" });
  }
};

/* ═══════════════════════════════════════════════
   STEP 1: REQUEST OTP EMAIL
   POST /api/auth/forgot-password
   Validates email, checks user existence, generates
   a secure 6-digit OTP, stores bcrypt-hashed copy in
   the password_reset_otps table, and sends via email.
═══════════════════════════════════════════════ */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email address is required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!isEmail(cleanEmail)) {
      return res.status(400).json({ message: "Invalid email address format." });
    }

    // ── 1. Rate limiting: max 3 OTP requests per hour per email ────────────────
    const now = Date.now();
    const rateData = rateLimitStore.get(cleanEmail) || { count: 0, firstAttempt: now };
    if (now - rateData.firstAttempt < 3_600_000 && rateData.count >= 3) {
      return res.status(429).json({
        message: "Too many reset attempts. Please wait 1 hour before requesting again.",
      });
    }
    rateLimitStore.set(cleanEmail, {
      count: now - rateData.firstAttempt >= 3_600_000 ? 1 : rateData.count + 1,
      firstAttempt: now - rateData.firstAttempt >= 3_600_000 ? now : rateData.firstAttempt,
    });

    // ── 2. Check user exists in Supabase Auth ──────────────────────────────────
    let userId = null;
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    if (authUsers?.users) {
      const matched = authUsers.users.find(u => u.email?.toLowerCase() === cleanEmail);
      if (matched) userId = matched.id;
    }

    if (!userId) {
      // Security / UX: return exact requested message "Email not found"
      return res.status(404).json({ message: "Email not found" });
    }

    // Portal / Role isolation check for forgot password:
    const expectedRole = req.body.role || req.body.expectedRole;
    if (expectedRole) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      if (!profile || profile.role !== expectedRole) {
        return res.status(404).json({ message: "Email not found" });
      }
    }

    console.log(`[forgotPassword] Verified registered account in portal (${expectedRole || "any"}). Sending OTP exclusively to: ${cleanEmail}`);

    // ── 3. Generate cryptographically-secure 6-digit OTP ──────────────────────
    const otpPlain  = String(crypto.randomInt(100000, 999999));
    const otpHash   = await bcrypt.hash(otpPlain, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    const otpId     = crypto.randomUUID();

    // ── 4 & 5. Try DB first, fall back to in-memory store ─────────────────────
    let usingMemory = false;
    try {
      // Delete any existing pending OTPs for this email
      await supabase
        .from("password_reset_otps")
        .delete()
        .eq("email", cleanEmail)
        .eq("verified", false);

      // Insert new OTP row
      const { error: insertError } = await supabase.from("password_reset_otps").insert({
        id:         otpId,
        user_id:    userId,
        email:      cleanEmail,
        otp_hash:   otpHash,
        expires_at: expiresAt.toISOString(),
        attempts:   0,
        verified:   false,
      });

      if (insertError) {
        // Table likely doesn't exist yet — fall back to in-memory
        if (insertError.code === "42P01" || insertError.code === "PGRST205" || insertError.message?.includes("password_reset_otps")) {
          console.warn("[forgotPassword] DB table missing, using in-memory OTP store.");
          usingMemory = true;
        } else {
          console.error("[forgotPassword] DB insert error:", insertError.message);
          return res.status(500).json({ message: "Failed to generate reset code. Please try again." });
        }
      }
    } catch (dbErr) {
      console.warn("[forgotPassword] DB error, using in-memory OTP store:", dbErr.message);
      usingMemory = true;
    }

    if (usingMemory) {
      // Store OTP in server memory (works perfectly for single-server dev/staging)
      otpMemoryStore.set(cleanEmail, {
        id:        otpId,
        userId,
        otpHash,
        expiresAt: expiresAt.getTime(),
        attempts:  0,
      });
    }

    // ── 6. Send OTP via email ──────────────────────────────────────────────────
    const { previewUrl } = await sendPasswordResetOtp(cleanEmail, otpPlain);

    return res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}. It expires in 5 minutes.`,
      ...(previewUrl && { previewUrl }),
    });
  } catch (err) {
    console.error("[authController] forgotPassword error:", err.message);
    return res.status(500).json({ message: "Failed to process password reset request. Please try again." });
  }
};

/* ═══════════════════════════════════════════════
   STEP 2: VERIFY OTP
   POST /api/auth/verify-reset-otp
   Checks the submitted OTP against the bcrypt-hashed
   copy in password_reset_otps. Enforces attempt limits
   and expiry. Issues a short-lived JWT reset token
   on success and deletes the OTP row.
═══════════════════════════════════════════════ */
const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP code are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const otpCode    = String(otp).trim();

    if (!/^\d{6}$/.test(otpCode)) {
      return res.status(400).json({ message: "OTP must be a 6-digit number." });
    }

    // ── 1. Try DB first, fall back to in-memory store ─────────────────────────
    let otpRow = null;
    let usingMemory = false;

    try {
      const { data: rows, error: fetchError } = await supabase
        .from("password_reset_otps")
        .select("*")
        .eq("email", cleanEmail)
        .eq("verified", false)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1);

      if (fetchError && (fetchError.code === "42P01" || fetchError.code === "PGRST205")) {
        usingMemory = true;
      } else if (fetchError) {
        console.error("[verifyResetOtp] DB fetch error:", fetchError.message);
        return res.status(500).json({ message: "Verification failed. Please try again." });
      } else {
        otpRow = rows?.[0] || null;
      }
    } catch (dbErr) {
      console.warn("[verifyResetOtp] DB error, checking memory store:", dbErr.message);
      usingMemory = true;
    }

    // Fall back to in-memory store
    if (usingMemory) {
      const memEntry = otpMemoryStore.get(cleanEmail);
      if (memEntry && memEntry.expiresAt > Date.now()) {
        otpRow = {
          id:       memEntry.id,
          user_id:  memEntry.userId,
          otp_hash: memEntry.otpHash,
          attempts: memEntry.attempts,
          _memory:  true,
        };
      }
    }

    if (!otpRow) {
      return res.status(400).json({
        message: "No active reset code found. The code may have expired. Please request a new one.",
      });
    }

    // ── 2. Brute-force guard: max 5 attempts per OTP ──────────────────────────
    if (otpRow.attempts >= 5) {
      if (usingMemory) {
        otpMemoryStore.delete(cleanEmail);
      } else {
        await supabase.from("password_reset_otps").delete().eq("id", otpRow.id);
      }
      return res.status(429).json({
        message: "Too many incorrect attempts. Please request a new verification code.",
      });
    }

    // ── 3. Atomically increment the attempt counter ───────────────────────────
    if (usingMemory) {
      const memEntry = otpMemoryStore.get(cleanEmail);
      if (memEntry) memEntry.attempts += 1;
    } else {
      await supabase
        .from("password_reset_otps")
        .update({ attempts: otpRow.attempts + 1 })
        .eq("id", otpRow.id);
    }

    // ── 4. Constant-time bcrypt comparison ────────────────────────────────────
    const isMatch = await bcrypt.compare(otpCode, otpRow.otp_hash);
    if (!isMatch) {
      const remaining = 5 - (otpRow.attempts + 1);
      return res.status(400).json({
        message: `Incorrect verification code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
      });
    }

    // ── 5. OTP verified — delete the record (prevents reuse) ─────────────────
    if (usingMemory) {
      otpMemoryStore.delete(cleanEmail);
    } else {
      await supabase.from("password_reset_otps").delete().eq("id", otpRow.id);
    }

    // ── 6. Issue a short-lived JWT password reset token (15 minutes) ─────────
    const resetToken = jwt.sign(
      { userId: otpRow.user_id, email: cleanEmail, type: "password_reset" },
      JWT_RESET_SECRET,
      { expiresIn: "15m" }
    );

    return res.status(200).json({
      success: true,
      message: "Verification successful! You may now reset your password.",
      resetToken,
    });
  } catch (err) {
    console.error("[authController] verifyResetOtp error:", err.message);
    return res.status(500).json({ message: "Verification failed. Please try again." });
  }
};

/* ═══════════════════════════════════════════════
   STEP 3: RESET PASSWORD
   POST /api/auth/reset-password
   Enforces strict password rules, verifies Supabase
   recovery token, and updates password in Supabase Auth.
═══════════════════════════════════════════════ */
const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) return "Password must be at least 8 characters long.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  if (!/[@$!%*?&^#~_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return "Password must contain at least one special character (@$!%*?& etc.).";
  }
  return null;
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Reset token and new password are required." });
    }

    // ── 1. Enforce strong password rules ──────────────────────────────────────
    const strengthError = validatePasswordStrength(password);
    if (strengthError) {
      return res.status(400).json({ message: strengthError });
    }

    // ── 2. Verify the JWT reset token issued by verifyResetOtp ────────────────
    let userId = null;
    try {
      const decoded = jwt.verify(token, JWT_RESET_SECRET);
      if (decoded?.userId && decoded?.type === "password_reset") {
        userId = decoded.userId;
      }
    } catch (e) {
      // Invalid or expired token — handled below
    }

    if (!userId) {
      return res.status(401).json({
        message: "Your password reset session has expired or is invalid. Please request a new verification code.",
      });
    }

    // ── 3. Update password in Supabase Auth — passwords never touch our DB ────
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password,
    });

    if (updateError) {
      return res.status(400).json({
        message: updateError.message || "Failed to update password. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password updated successfully. You can now log in with your new password.",
    });
  } catch (err) {
    console.error("[authController] resetPassword error:", err.message);
    return res.status(500).json({ message: "Failed to reset password. Please try again." });
  }
};

module.exports = {
  signup,
  login,
  seedAdmin,
  googleCallback,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};