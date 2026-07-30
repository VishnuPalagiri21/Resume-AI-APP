/**
 * Email Service for ResumeAI
 * Sends password reset OTP verification codes via SMTP/Nodemailer
 * Automatically generates a free Ethereal Email test inbox if SMTP is unconfigured,
 * providing a clickable web preview URL to inspect the actual sent email!
 */
const nodemailer = require("nodemailer");
const { Resend } = require("resend");

// 1. Create Resend client if API key is set in .env (Recommended)
let resendClient = null;
if (process.env.RESEND_API_KEY) {
  resendClient = new Resend(process.env.RESEND_API_KEY);
}

// 2. Create Nodemailer transporter if SMTP environment variables are set (Legacy / Custom SMTP fallback)
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === "true", // true for port 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send password reset verification code email
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit verification code
 * @returns {Promise<{success: boolean, previewUrl?: string, devOtp: string}>}
 */
async function sendPasswordResetOtp(email, otp) {
  const subject = "ResumeAI — Password Reset Verification Code";

  const plainText = `
Hello,

We received a request to reset your ResumeAI account password.

Your 6-digit verification code is:

  ${otp}

This code expires in 5 minutes. Do not share it with anyone.

If you did not request this, please ignore this email.

ResumeAI Team
  `.trim();

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background-color: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #60a5fa; margin: 0; font-size: 24px; font-weight: 700;">ResumeAI</h2>
        <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Password Reset Verification</p>
      </div>
      
      <div style="background-color: #1e293b; padding: 24px; border-radius: 8px; border: 1px solid #334155; margin-bottom: 24px;">
        <h3 style="color: #f8fafc; margin-top: 0; font-size: 18px;">Your One-Time Verification Code</h3>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          Use the code below to reset your password. Enter it on the verification page.
        </p>
        
        <div style="background-color: #0f172a; border: 2px dashed #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
          <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0; letter-spacing: 1px; text-transform: uppercase;">Verification Code</p>
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #38bdf8; font-family: monospace;">${otp}</span>
        </div>

        <p style="color: #94a3b8; font-size: 13px; margin: 0; text-align: center;">
          ⏳ <strong>This code expires in 5 minutes.</strong> For your security, never share this code with anyone.
        </p>
      </div>

      <div style="text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 16px;">
        <p style="margin: 4px 0;">If you did not request a password reset, you can safely ignore this email.</p>
        <p style="margin: 4px 0;">&copy; ${new Date().getFullYear()} ResumeAI Team</p>
      </div>
    </div>
  `;

  // Always log OTP to console in development
  const appUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  console.log("==========================================================");
  console.log(`📧 [EmailService] Password Reset OTP for: ${email}`);
  console.log(`🔐 Verification Code: ${otp}`);
  console.log(`🔗 Verify at: ${appUrl}/verify-otp?email=${encodeURIComponent(email)}`);
  console.log(`⏰ Expires in: 5 minutes`);
  console.log("==========================================================");

  // 1. [RECOMMENDED] If Resend API Key is configured in .env, send via Resend!
  if (resendClient) {
    try {
      // Send OTP verification email directly to the requested user's email address
      const targetEmail = email;
      const displaySubject = subject;

      const { data, error } = await resendClient.emails.send({
        from: fromEmail,
        to: targetEmail,
        subject: displaySubject,
        text: plainText,
        html: htmlBody,
      });

      if (error) {
        console.warn("⚠️ [EmailService] Resend API notice:", error.message || error);
        console.warn("   ℹ️ Falling back to Nodemailer / Ethereal Email preview...");
      } else {
        console.log(`✅ [EmailService] Real OTP email successfully sent via Resend to ${targetEmail} (ID: ${data?.id})`);
        return { success: true };
      }
    } catch (err) {
      console.error("❌ [EmailService] Failed to send real email via Resend:", err.message);
      // Fall through to other providers if Resend fails
    }
  }

  // 2. If real SMTP is configured in .env, send via real SMTP
  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"ResumeAI Team" <no-reply@resumeai.app>`,
        to: email,
        subject,
        text: plainText,
        html: htmlBody,
      });
      console.log(`✅ [EmailService] Real OTP email successfully sent via SMTP to ${email}`);
      return { success: true, devOtp: otp };
    } catch (err) {
      console.error("❌ [EmailService] Failed to send real email via SMTP:", err.message);
      // Fall through to Ethereal test account if SMTP fails
    }
  }

  // 3. If neither Resend nor SMTP is configured in .env (or if they failed), use Ethereal Email test account!
  try {
    console.log("⚡ [EmailService] Using Nodemailer Ethereal test account to generate web email preview...");
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await testTransporter.sendMail({
      from: `"ResumeAI Test Mailer" <test@ethereal.email>`,
      to: email,
      subject,
      text: plainText,
      html: htmlBody,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("==========================================================");
      console.log(`📨 [ETHEREAL EMAIL PREVIEW URL] Click below to view real email:`);
      console.log(`👉 ${previewUrl}`);
      console.log("==========================================================");
      return { success: true, previewUrl, devOtp: otp };
    }
  } catch (err) {
    console.error("⚠️ [EmailService] Ethereal test mailer error:", err.message);
  }

  return { success: true, devOtp: otp };
}

module.exports = {
  sendPasswordResetOtp,
};
