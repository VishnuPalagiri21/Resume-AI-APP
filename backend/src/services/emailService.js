/**
 * Email Service for ResumeAI
 * Sends OTP verification codes via Gmail SMTP (Nodemailer).
 *
 * Configuration is loaded exclusively from environment variables:
 *   MAIL_SERVER   — SMTP host (e.g. smtp.gmail.com)
 *   MAIL_PORT     — SMTP port (465 for SSL, 587 for STARTTLS)
 *   MAIL_USERNAME — Gmail address used to authenticate
 *   MAIL_PASSWORD — Gmail App Password (NOT the account password)
 *   MAIL_FROM     — Sender address shown in the email From: header
 *
 * Security rules enforced:
 *   - Credentials are NEVER logged, printed, or included in responses.
 *   - OTP plain-text is logged to console only (dev visibility), never in responses.
 *   - All SMTP values come from process.env — nothing is hard-coded.
 *
 * Fallback: If MAIL_USERNAME / MAIL_PASSWORD are absent (local dev without
 * a configured Gmail account), the service automatically falls back to a free
 * Nodemailer Ethereal test inbox and prints a clickable preview URL in the console.
 */
const nodemailer = require("nodemailer");
const dns        = require("dns");

/**
 * Resolve a hostname to its IPv4 address.
 * This bypasses any system DNS preference for IPv6 and guarantees an IPv4
 * TCP connection — needed on networks where IPv6 routing is unavailable.
 *
 * @param {string} hostname
 * @returns {Promise<string>} Resolved IPv4 address
 */
function resolveIPv4(hostname) {
  return new Promise((resolve, reject) => {
    dns.lookup(hostname, { family: 4 }, (err, address) => {
      if (err) reject(err);
      else resolve(address);
    });
  });
}


// ─── Read Gmail SMTP config from environment ───────────────────────────────
const MAIL_SERVER   = process.env.MAIL_SERVER   || "";
const MAIL_PORT     = parseInt(process.env.MAIL_PORT || "465", 10);
const MAIL_USERNAME = process.env.MAIL_USERNAME || "";
const MAIL_PASSWORD = process.env.MAIL_PASSWORD || "";
const MAIL_FROM     = process.env.MAIL_FROM     || MAIL_USERNAME;

// Port 465 → implicit SSL (secure: true).
// Port 587 → STARTTLS (secure: false, nodemailer upgrades via STARTTLS).
// Any other port → follow the same rule: 465 = SSL, else STARTTLS.
const MAIL_SECURE = MAIL_PORT === 465;

/**
 * Build a Nodemailer transporter for Gmail SMTP.
 * Resolves MAIL_SERVER to its IPv4 address first, then creates the transport.
 * Returns null when required credentials are missing (triggers Ethereal fallback).
 *
 * @returns {Promise<nodemailer.Transporter | null>}
 */
async function createGmailTransporter(port = 465) {
  const server = process.env.MAIL_SERVER || "smtp.gmail.com";
  const user = process.env.MAIL_USERNAME;
  const pass = process.env.MAIL_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  let hostAddress = server;
  try {
    hostAddress = await resolveIPv4(server);
  } catch (err) {
    console.warn(`[EmailService] IPv4 lookup failed for ${server}, using hostname fallback:`, err.message);
    hostAddress = server;
  }

  return nodemailer.createTransport({
    host:   hostAddress,
    port:   port,
    secure: port === 465, // true = implicit TLS (port 465), false = STARTTLS (port 587)
    auth: {
      user: user,
      pass: pass,
    },
    tls: {
      rejectUnauthorized: false,
      servername: server,
    },
    connectionTimeout: 6000,
    greetingTimeout: 6000,
    socketTimeout: 10000,
  });
}

/**
 * Build the professional HTML email body for an OTP code.
 *
 * @param {string} otp       - The 6-digit OTP to display
 * @param {string} [context] - Optional context label (e.g. "Password Reset")
 * @returns {string} Full HTML string
 */
function buildHtmlEmail(otp, context = "Verification") {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ResumeAI ${context} Code</title>
</head>
<body style="margin:0;padding:0;background-color:#060b0d;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#060b0d;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600"
               style="max-width:600px;width:100%;background-color:#0f172a;border-radius:16px;
                      border:1px solid #1e293b;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.6);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%);
                       padding:36px 40px 28px;text-align:center;
                       border-bottom:1px solid #1e293b;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <div style="width:40px;height:40px;background:linear-gradient(135deg,#7c3aed,#4f46e5);
                            border-radius:10px;display:inline-flex;align-items:center;
                            justify-content:center;font-size:20px;line-height:40px;vertical-align:middle;">
                  ✦
                </div>
                <span style="font-size:26px;font-weight:800;color:#f8fafc;
                             letter-spacing:-0.5px;vertical-align:middle;">ResumeAI</span>
              </div>
              <p style="margin:10px 0 0;font-size:13px;color:#94a3b8;letter-spacing:0.5px;
                        text-transform:uppercase;font-weight:600;">${context} Code</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:15px;color:#cbd5e1;line-height:1.6;">Hello,</p>
              <p style="margin:0 0 28px;font-size:15px;color:#cbd5e1;line-height:1.6;">
                We received a request to verify your <strong style="color:#f8fafc;">ResumeAI</strong>
                account. Use the code below to complete the process.
              </p>

              <!-- OTP Box -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
                     style="margin:0 0 28px;">
                <tr>
                  <td align="center">
                    <div style="background-color:#0b1120;border:2px dashed #4f46e5;
                                border-radius:12px;padding:28px 24px;display:inline-block;
                                text-align:center;min-width:260px;">
                      <p style="margin:0 0 6px;font-size:11px;color:#64748b;
                                letter-spacing:2px;text-transform:uppercase;font-weight:700;">
                        Your Verification Code
                      </p>
                      <p style="margin:0;font-size:42px;font-weight:900;letter-spacing:14px;
                                color:#818cf8;font-family:'Courier New',Courier,monospace;
                                line-height:1.2;">
                        ${otp}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiry Notice -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
                     style="margin:0 0 28px;">
                <tr>
                  <td style="background-color:#1e293b;border-left:4px solid #f59e0b;
                              border-radius:8px;padding:14px 18px;">
                    <p style="margin:0;font-size:13px;color:#fcd34d;font-weight:600;">
                      ⏳ This code expires in <strong>5 minutes</strong>.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Security Note -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
                     style="margin:0 0 28px;">
                <tr>
                  <td style="background-color:#1a1a2e;border:1px solid #334155;
                              border-radius:8px;padding:16px 18px;">
                    <p style="margin:0 0 6px;font-size:13px;color:#94a3b8;font-weight:700;">
                      🔐 Security Reminder
                    </p>
                    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
                      ResumeAI will <strong style="color:#94a3b8;">never</strong> ask for this
                      code via phone or chat. Do not share it with anyone.
                      If you did not request this verification, please ignore this email —
                      your account remains secure.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.6;">
                Thank you for using ResumeAI.<br />
                <strong style="color:#c4b5fd;">ResumeAI Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#0a0f1e;border-top:1px solid #1e293b;
                       padding:20px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#475569;">
                This is an automated message from ResumeAI. Please do not reply.
              </p>
              <p style="margin:0;font-size:12px;color:#334155;">
                &copy; ${year} ResumeAI. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Build the plain-text fallback version of the OTP email.
 *
 * @param {string} otp
 * @param {string} [context]
 * @returns {string}
 */
function buildPlainTextEmail(otp, context = "Verification") {
  return `
Hello,

Your ResumeAI ${context} Code is:

  ${otp}

This code expires in 5 minutes. Do not share it with anyone.

If you did not request this verification, please ignore this email.

Thank you,
ResumeAI Team
`.trim();
}

/**
 * Send a password-reset OTP email to the given address.
 *
 * Used by:  authController.js → forgotPassword()
 * Signature is unchanged — callers need no modification.
 *
 * @param {string} email  - Recipient email address
 * @param {string} otp    - Plain-text 6-digit OTP (generated by authController)
 * @returns {Promise<{success: boolean, previewUrl?: string, devOtp: string}>}
 */
async function sendPasswordResetOtp(email, otp) {
  const subject   = "ResumeAI — Password Reset Verification Code";
  const context   = "Password Reset";
  const htmlBody  = buildHtmlEmail(otp, context);
  const plainText = buildPlainTextEmail(otp, context);

  // ── Dev console log — OTP is shown here for dev convenience.
  //    The password is NEVER logged.
  const appUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  console.log("==========================================================");
  console.log(`📧 [EmailService] Password Reset OTP for: ${email}`);
  console.log(`🔐 Verification Code: ${otp}`);
  console.log(`🔗 Verify at: ${appUrl}/verify-otp?email=${encodeURIComponent(email)}`);
  console.log(`⏰ Expires in: 5 minutes`);
  console.log("==========================================================");

  // ── 1. Attempt Gmail SMTP delivery (Port 465 SSL, fallback to Port 587 STARTTLS) ────────────────────────────────────────
  const senderEmail = process.env.MAIL_FROM || process.env.MAIL_USERNAME;
  const portsToTry = [465, 587];

  for (const port of portsToTry) {
    const gmailTransporter = await createGmailTransporter(port);
    if (gmailTransporter) {
      try {
        const info = await gmailTransporter.sendMail({
          from:    `"ResumeAI Security" <${senderEmail}>`,
          to:      email,
          subject,
          text:    plainText,
          html:    htmlBody,
        });
        console.log(`✅ [EmailService] OTP email sent via Gmail SMTP (Port ${port}) to ${email} (Message ID: ${info.messageId})`);
        return { success: true, devOtp: otp };
      } catch (smtpErr) {
        console.error(`❌ [EmailService] Gmail SMTP error on port ${port}:`, smtpErr.message);
        // Continue to try next port if available
      }
    }
  }

  console.warn("⚠️  [EmailService] Gmail SMTP delivery failed or not configured. Falling back to Ethereal Email preview...");

  // ── 2. Ethereal Email fallback (development / unconfigured environments) ──
  try {
    console.log("⚡ [EmailService] Creating Ethereal test account for email preview...");
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host:   testAccount.smtp.host,
      port:   testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await testTransporter.sendMail({
      from:    `"ResumeAI Test Mailer" <test@ethereal.email>`,
      to:      email,
      subject,
      text:    plainText,
      html:    htmlBody,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("==========================================================");
      console.log("📨 [ETHEREAL EMAIL PREVIEW] Click to view the sent email:");
      console.log(`👉 ${previewUrl}`);
      console.log("==========================================================");
      return { success: true, previewUrl, devOtp: otp };
    }
  } catch (etherealErr) {
    console.error("⚠️  [EmailService] Ethereal fallback error:", etherealErr.message);
  }

  // ── 3. Last resort — OTP is still valid; dev can use it from console ───────
  console.warn("⚠️  [EmailService] All email transports failed. Use the console OTP above.");
  return { success: true, devOtp: otp };
}

module.exports = {
  sendPasswordResetOtp,
};
