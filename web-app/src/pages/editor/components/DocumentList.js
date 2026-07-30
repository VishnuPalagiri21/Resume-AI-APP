/**
 * DocumentList.js
 * Professional, enterprise-grade LaTeX Resume Editor Workspace.
 * Preserves all existing business logic, props, templates, and functional features.
 */
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const TEMPLATES = [
  {
    key:         "modern",
    label:       "Modern",
    icon:        "🎨",
    description: "Clean, balanced layout with section dividers. Great all-around choice.",
    badge:       "Most Popular",
    badgeColor:  "#8b5cf6",
  },
  {
    key:         "minimal",
    label:       "Minimal",
    icon:        "✦",
    description: "Ultra-compact single-page. Every word counts.",
    badge:       null,
    badgeColor:  null,
  },
  {
    key:         "executive",
    label:       "Executive",
    icon:        "💼",
    description: "Senior / management style with two-column header and achievement focus.",
    badge:       "Leadership",
    badgeColor:  "#f59e0b",
  },
  {
    key:         "ats_compact",
    label:       "ATS Compact",
    icon:        "🤖",
    description: "Maximum keyword density, plain formatting for ATS scanners.",
    badge:       "ATS Optimized",
    badgeColor:  "#10b981",
  },
  {
    key:         "developer",
    label:       "Developer",
    icon:        "⚡",
    description: "Technical resume with skills matrix, projects, and GitHub links.",
    badge:       "For Engineers",
    badgeColor:  "#06b6d4",
  },
];

export default function DocumentList({ docs = [], onOpen, onNew, onDelete, loading, error }) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState([]);

  const handleDelete = async (e, docId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this resume? This cannot be undone.")) return;
    setDeleting(docId);
    await onDelete(docId);
    setDeleting(null);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedDocs(filteredDocs.map((d) => d._id));
    } else {
      setSelectedDocs([]);
    }
  };

  const handleSelectDoc = (e, docId) => {
    e.stopPropagation();
    setSelectedDocs((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleDownloadPdf = (e, doc) => {
    e.stopPropagation();
    if (doc.compiledPdfUrl) {
      const fullUrl = doc.compiledPdfUrl.startsWith("http")
        ? doc.compiledPdfUrl
        : `http://localhost:5000${doc.compiledPdfUrl}`;
      window.open(fullUrl, "_blank");
    } else {
      onOpen(doc);
    }
  };

  const filteredDocs = useMemo(() => {
    return docs.filter((d) => {
      return (
        d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.template?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [docs, searchQuery]);

  return (
    <div className="overleaf-workspace">
      {/* ── TOP NAV / BRAND BAR ─────────────────────────────────────────── */}
      <header className="overleaf-topbar">
        <div
          className="overleaf-brand-group"
          onClick={() => navigate("/dashboard/user")}
          title="Back to Dashboard"
        >
          <div className="overleaf-logo-icon" style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}>
            ✦
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "#ffffff", letterSpacing: "-0.02em" }}>
              ResumeAI <span style={{ color: "#10b981", fontWeight: 700 }}>Editor</span>
            </div>
            <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.04em" }}>
              LaTeX Resume Workspace
            </div>
          </div>
        </div>

        <nav className="overleaf-nav-links">
          <button className="overleaf-nav-link" onClick={() => navigate("/dashboard/user")}>
            ← Dashboard
          </button>
          <button className="overleaf-nav-link" onClick={() => setShowTemplateModal(true)}>
            Templates
          </button>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button
            className="btn"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.82rem",
              padding: "8px 18px",
              borderRadius: "99px",
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => setShowTemplateModal(true)}
          >
            + New Resume
          </button>
        </div>
      </header>

      {/* ── MAIN WORKSPACE LAYOUT (Sidebar + Table View) ────────────────── */}
      <div className="overleaf-layout">
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="overleaf-sidebar">
          <div>
            <button
              id="new-project-btn"
              className="overleaf-new-btn"
              onClick={() => setShowTemplateModal(true)}
            >
              <span style={{ fontSize: "1.2rem", fontWeight: 800 }}>+</span>
              <span>New Resume</span>
            </button>
          </div>

          <nav className="overleaf-sidebar-nav">
            <div className="overleaf-sidebar-item overleaf-sidebar-item-active">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span>📁</span>
                <span>All Resumes</span>
              </div>
              <span className="overleaf-sidebar-badge">{docs.length}</span>
            </div>
          </nav>

          {/* Quick ATS Callout Card */}
          <div
            style={{
              marginTop: "auto",
              padding: "16px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: "12px", lineHeight: 1.4 }}>
              Need ATS keyword scoring & AI resume optimization?
            </p>
            <button
              className="btn btn-ghost"
              style={{
                width: "100%",
                fontSize: "0.78rem",
                padding: "8px",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#e2e8f0",
              }}
              onClick={() => navigate("/dashboard/user")}
            >
              ← Back to Dashboard
            </button>
          </div>
        </aside>

        {/* MAIN RESUMES WORKSPACE */}
        <main className="overleaf-main">
          {/* Section Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  margin: 0,
                  color: "#ffffff",
                  letterSpacing: "-0.02em",
                }}
              >
                All Resumes
              </h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                className="btn btn-ghost"
                style={{ fontSize: "0.82rem", padding: "8px 14px" }}
                onClick={() => setShowTemplateModal(true)}
              >
                + Template Picker
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "10px",
                padding: "12px 16px",
                color: "#f87171",
                fontSize: "0.88rem",
                marginBottom: "24px",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Search bar */}
          <div className="overleaf-search-wrapper">
            <span className="overleaf-search-icon">🔍</span>
            <input
              type="text"
              className="overleaf-search-input"
              placeholder="Search resumes by title or template..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Enterprise Resumes Table Card */}
          <div className="overleaf-table-card">
            <table className="overleaf-table">
              <thead>
                <tr>
                  <th className="overleaf-th" style={{ width: "42px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        filteredDocs.length > 0 &&
                        selectedDocs.length === filteredDocs.length
                      }
                      style={{ cursor: "pointer", accentColor: "#10b981" }}
                    />
                  </th>
                  <th className="overleaf-th">Title</th>
                  <th className="overleaf-th" style={{ width: "160px" }}>
                    Owner
                  </th>
                  <th className="overleaf-th" style={{ width: "220px" }}>
                    Last modified ↓
                  </th>
                  <th
                    className="overleaf-th"
                    style={{ width: "140px", textAlign: "right" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "48px", textAlign: "center" }}>
                      <div className="editor-spinner" style={{ margin: "0 auto 12px auto" }} />
                      <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                        Loading resumes…
                      </div>
                    </td>
                  </tr>
                ) : filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "72px 24px", textAlign: "center" }}>
                      <div style={{ fontSize: "2.8rem", marginBottom: "12px" }}>📄</div>
                      <h3
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          color: "#ffffff",
                          marginBottom: "8px",
                        }}
                      >
                        No resumes found
                      </h3>
                      <p
                        style={{
                          color: "#94a3b8",
                          fontSize: "0.9rem",
                          marginBottom: "20px",
                        }}
                      >
                        {searchQuery
                          ? `No results matching "${searchQuery}"`
                          : "Create your first professional LaTeX resume from an ATS-ready template."}
                      </p>
                      <button
                        className="overleaf-new-btn"
                        style={{ display: "inline-flex", width: "auto", padding: "10px 24px" }}
                        onClick={() => setShowTemplateModal(true)}
                      >
                        + New Resume
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => {
                    const isChecked = selectedDocs.includes(doc._id);
                    const formattedDate = new Date(doc.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });

                    return (
                      <tr
                        key={doc._id}
                        className="overleaf-tr"
                        onClick={() => onOpen(doc)}
                        style={{
                          background: isChecked
                            ? "rgba(16, 185, 129, 0.08)"
                            : undefined,
                        }}
                      >
                        <td
                          className="overleaf-td"
                          style={{ textAlign: "center" }}
                          onClick={(e) => handleSelectDoc(e, doc._id)}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            style={{ cursor: "pointer", accentColor: "#10b981" }}
                          />
                        </td>

                        <td className="overleaf-td">
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <span style={{ fontSize: "1.3rem" }}>📄</span>
                            <div>
                              <div
                                style={{
                                  fontWeight: 700,
                                  color: "#f8fafc",
                                  fontSize: "0.95rem",
                                  marginBottom: "3px",
                                }}
                              >
                                {doc.title || "Untitled Resume"}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "0.7rem",
                                    fontWeight: 600,
                                    padding: "2px 8px",
                                    borderRadius: "99px",
                                    background: "rgba(16, 185, 129, 0.12)",
                                    color: "#34d399",
                                    border: "1px solid rgba(16, 185, 129, 0.25)",
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {doc.template?.replace("_", " ") || "LaTeX Resume"}
                                </span>
                                {doc.compiledPdfUrl && (
                                  <span
                                    style={{
                                      fontSize: "0.68rem",
                                      fontWeight: 700,
                                      color: "#38bdf8",
                                      background: "rgba(56, 189, 248, 0.12)",
                                      padding: "1px 6px",
                                      borderRadius: "4px",
                                    }}
                                  >
                                    ✓ COMPILED PDF
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="overleaf-td">
                          <span style={{ color: "#cbd5e1", fontWeight: 500 }}>You</span>
                        </td>

                        <td className="overleaf-td">
                          <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                            {formattedDate}
                          </span>
                        </td>

                        <td
                          className="overleaf-td"
                          style={{ textAlign: "right" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="overleaf-action-group">
                            {/* Open in Editor */}
                            <button
                              className="overleaf-action-btn"
                              onClick={() => onOpen(doc)}
                              title="Edit LaTeX resume"
                            >
                              📝
                            </button>

                            {/* Download / Open PDF */}
                            <button
                              className="overleaf-action-btn"
                              onClick={(e) => handleDownloadPdf(e, doc)}
                              title="View / Download PDF"
                            >
                              ⬇
                            </button>

                            {/* Delete doc */}
                            <button
                              className="overleaf-action-btn overleaf-action-btn-danger"
                              onClick={(e) => handleDelete(e, doc._id)}
                              disabled={deleting === doc._id}
                              title="Delete resume"
                            >
                              {deleting === doc._id ? "…" : "🗑"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          <div
            style={{
              marginTop: "16px",
              textAlign: "center",
              fontSize: "0.82rem",
              color: "#64748b",
            }}
          >
            Showing {filteredDocs.length} of {docs.length} resume(s).
          </div>
        </main>
      </div>

      {/* ── CREATE NEW RESUME TEMPLATE MODAL ────────────────────────────── */}
      {showTemplateModal && (
        <div className="overleaf-modal-backdrop" onClick={() => setShowTemplateModal(false)}>
          <div className="overleaf-modal" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "28px",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    margin: 0,
                    color: "#ffffff",
                  }}
                >
                  Select a LaTeX Resume Template
                </h2>
                <p style={{ color: "#94a3b8", fontSize: "0.88rem", marginTop: "4px" }}>
                  Every template is pre-configured with industry-standard LaTeX formatting and ATS keywords.
                </p>
              </div>
              <button
                className="btn btn-ghost"
                style={{ fontSize: "1.2rem", padding: "4px 12px" }}
                onClick={() => setShowTemplateModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="editor-template-grid">
              {TEMPLATES.map((t) => (
                <button
                  key={t.key}
                  id={`template-btn-${t.key}`}
                  className="editor-template-card"
                  onClick={() => {
                    setShowTemplateModal(false);
                    onNew(t.key);
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{t.icon}</div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "6px",
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#e2e8f0" }}>
                      {t.label}
                    </span>
                    {t.badge && (
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "99px",
                          background: `${t.badgeColor}22`,
                          color: t.badgeColor,
                          border: `1px solid ${t.badgeColor}44`,
                          textTransform: "uppercase",
                        }}
                      >
                        {t.badge}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.5, margin: 0 }}>
                    {t.description}
                  </p>
                </button>
              ))}
            </div>

            <div
              style={{
                marginTop: "24px",
                padding: "16px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontSize: "0.88rem", color: "#cbd5e1" }}>
                Want to start from scratch?
              </div>
              <button
                className="btn btn-ghost"
                style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: 700 }}
                onClick={() => {
                  setShowTemplateModal(false);
                  onNew("modern");
                }}
              >
                Start Blank Resume →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
