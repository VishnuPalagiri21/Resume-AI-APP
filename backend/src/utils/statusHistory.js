/**
 * Shared Status History Utilities
 * 
 * Centralized helpers for extracting and building application
 * status audit trails. Used by both user and recruiter controllers
 * to eliminate code duplication.
 */

const STATUS_PRETTY_MAP = {
  applied: "Applied",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  selected: "Selected",
  rejected: "Rejected",
};

/**
 * Extract or initialize the status history audit trail from an application record.
 * Checks: 1) JSONB column, 2) embedded JSON in cover_note, 3) fallback from current status.
 */
function getStatusHistory(app) {
  // 1. Native JSONB column
  if (Array.isArray(app.status_history) && app.status_history.length > 0) {
    return app.status_history;
  }
  // 2. Embedded in cover_note metadata
  const m = app.cover_note ? app.cover_note.match(/\[STATUS_HISTORY: (.*?)\]/s) : null;
  if (m) {
    try {
      return JSON.parse(m[1]);
    } catch (e) {}
  }
  // 3. Fallback: create initial entry from current status
  return [
    {
      status: STATUS_PRETTY_MAP[app.status] || app.status || "Applied",
      timestamp: app.created_at || new Date().toISOString(),
      updatedBy: "Candidate",
    },
  ];
}

/**
 * Append a new status transition to the audit trail.
 * Returns the updated history array.
 */
function appendStatusHistory(app, newStatus, updatedBy, reason = null) {
  const currentHistory = getStatusHistory(app);
  const prettyStatus = STATUS_PRETTY_MAP[newStatus] || newStatus;
  currentHistory.push({
    status: prettyStatus,
    timestamp: new Date().toISOString(),
    updatedBy: updatedBy || "Recruiter",
    reason: reason || null,
  });
  return currentHistory;
}

module.exports = { getStatusHistory, appendStatusHistory, STATUS_PRETTY_MAP };
