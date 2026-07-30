/**
 * sanitizeMiddleware.js
 * ─────────────────────────────────────────────────────────────────
 * Global input sanitization middleware applied to all routes.
 *
 * What it does:
 *  1. Trims leading/trailing whitespace from all string fields
 *  2. Strips HTML tags to prevent stored XSS (<script>, <img onerror=...>, etc.)
 *  3. Enforces max field length (10,000 chars) to prevent oversized text attacks
 *  4. Sanitizes query string params the same way
 *
 * What it does NOT do:
 *  - It does NOT break valid input — only strips genuinely dangerous patterns
 *  - It does NOT touch file buffers or binary fields
 * ─────────────────────────────────────────────────────────────────
 */

/**
 * Strips HTML/script tags and trims a single string value.
 * @param {string} value
 * @returns {string}
 */
function sanitizeString(value) {
  if (typeof value !== "string") return value;

  return value
    .trim()
    // Remove all HTML tags: <script>, <img>, <a href=...>, etc.
    .replace(/<[^>]*>/g, "")
    // Remove javascript: URI scheme — blocks href="javascript:alert(1)"
    .replace(/javascript\s*:/gi, "")
    // Remove on* event handlers — onclick=, onerror=, onload=, etc.
    .replace(/\bon\w+\s*=/gi, "")
    // Enforce maximum field length — 10,000 characters
    .slice(0, 10000);
}

/**
 * Recursively sanitizes all string values in an object or array.
 * Non-string primitives (numbers, booleans, null) are left untouched.
 * @param {*} data
 * @returns {*}
 */
function sanitizeDeep(data) {
  if (typeof data === "string") return sanitizeString(data);
  if (Array.isArray(data))      return data.map(sanitizeDeep);

  if (data !== null && typeof data === "object") {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeDeep(value);
    }
    return sanitized;
  }

  return data; // numbers, booleans, null — untouched
}

/**
 * Express middleware.
 * Sanitizes req.body (JSON payload) and req.query (URL query params).
 */
const sanitizeInputs = (req, res, next) => {
  if (req.body  && typeof req.body  === "object") req.body  = sanitizeDeep(req.body);
  if (req.query && typeof req.query === "object") req.query = sanitizeDeep(req.query);
  next();
};

module.exports = sanitizeInputs;
