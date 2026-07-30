/**
 * AiAssistantDrawer.js
 * AI slide-in panel with two tabs: ATS Score and AI Resume Rewrite.
 */
import React, { useState } from "react";
import API from "../../../api/axios";

const TABS = ["Score", "Rewrite"];

export default function AiAssistantDrawer({
  activeDoc,
  title,
  latexSource,
  onClose,
  onRewriteApply,   // callback(newLatexSource) — injects AI-generated LaTeX into editor
  onCompile,        // trigger compile after rewrite
}) {
  const [activeTab, setActiveTab] = useState("Score");

  // ── ATS Score state ──────────────────────────────────────────────────
  const [jobDesc,     setJobDesc]     = useState("");
  const [scoring,     setScoring]     = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [scoreError,  setScoreError]  = useState(null);

  // ── AI Rewrite state ─────────────────────────────────────────────────
  const [rewriteJD,      setRewriteJD]      = useState("");
  const [rewriting,      setRewriting]      = useState(false);
  const [rewritePreview, setRewritePreview] = useState(null);
  const [rewriteError,   setRewriteError]   = useState(null);
  const [applied,        setApplied]        = useState(false);

  // ── Score handler ────────────────────────────────────────────────────
  const handleScore = async () => {
    if (!latexSource.trim()) {
      setScoreError("Please write some LaTeX content before scoring.");
      return;
    }
    setScoring(true);
    setScoreResult(null);
    setScoreError(null);
    try {
      const { data } = await API.post("/api/ats/score", {
        fileName:      title || "Untitled Resume",
        extractedText: latexSource,
        jobDescription: jobDesc,
      });
      setScoreResult(data.resume);
    } catch (err) {
      setScoreError(err.response?.data?.message || "ATS scoring failed. Try again.");
    } finally {
      setScoring(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Work";
  };

  // ── Rewrite handler ──────────────────────────────────────────────────
  const handleRewrite = async () => {
    if (!latexSource.trim()) {
      setRewriteError("No LaTeX source to rewrite. Write some content first.");
      return;
    }
    setRewriting(true);
    setRewritePreview(null);
    setRewriteError(null);
    setApplied(false);
    try {
      const { data } = await API.post("/api/editor/generate", {
        resumeText:     latexSource,
        jobDescription: rewriteJD,
        title:          title,
      });
      setRewritePreview(data.document?.latexSource || "");
    } catch (err) {
      setRewriteError(err.response?.data?.message || "AI rewrite failed. Try again.");
    } finally {
      setRewriting(false);
    }
  };

  const handleApplyRewrite = () => {
    if (!rewritePreview) return;
    onRewriteApply(rewritePreview);
    setApplied(true);
    setTimeout(() => {
      onClose();
      if (onCompile) onCompile();
    }, 800);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="editor-drawer-backdrop" onClick={onClose} />

      {/* Drawer */}
      <div className="editor-drawer editor-drawer-right" style={{ width: "420px" }}>
        {/* Header */}
        <div className="editor-drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{
              background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "1.3rem",
            }}>✨</span>
            <h2 style={{
              fontSize:   "1rem",
              fontWeight: 700,
              fontFamily: "'Outfit', sans-serif",
              margin:     0,
            }}>
              AI Assistant
            </h2>
          </div>
          <button
            id="ai-drawer-close"
            className="btn btn-ghost editor-toolbar-btn"
            style={{ padding: "4px 10px" }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="editor-ai-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              id={`ai-tab-${tab.toLowerCase()}`}
              className={`editor-ai-tab ${activeTab === tab ? "editor-ai-tab-active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "Score" ? "📊 ATS Score" : "🤖 AI Rewrite"}
            </button>
          ))}
        </div>

        {/* ── Score Tab ─────────────────────────────────────────────── */}
        {activeTab === "Score" && (
          <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontSize: "0.8rem", color: "#5c5c8a", lineHeight: 1.5 }}>
              Score your current resume against a job description using AI-powered ATS analysis.
            </p>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: "0.75rem" }}>
                Job Description (optional)
              </label>
              <textarea
                id="ai-score-jd-input"
                className="form-input"
                placeholder="Paste the job description for a targeted analysis…"
                rows={5}
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                style={{ background: "rgba(0,0,0,0.2)", fontSize: "0.82rem", resize: "vertical" }}
              />
            </div>

            <button
              id="ai-score-btn"
              className="btn btn-primary"
              style={{ width: "100%", padding: "12px" }}
              onClick={handleScore}
              disabled={scoring}
            >
              {scoring ? (
                <><span className="editor-spinner-sm" /> Analyzing with AI…</>
              ) : (
                "📊 Score My Resume"
              )}
            </button>

            {scoreError && (
              <div className="editor-error-banner">{scoreError}</div>
            )}

            {scoreResult && (
              <div className="fade-up">
                {/* Score circle */}
                <div style={{
                  display:        "flex",
                  alignItems:     "center",
                  gap:            "20px",
                  padding:        "20px",
                  background:     "rgba(0,0,0,0.2)",
                  borderRadius:   "14px",
                  border:         `1px solid ${getScoreColor(scoreResult.atsScore)}33`,
                  marginBottom:   "16px",
                }}>
                  <div style={{
                    width:       "72px",
                    height:      "72px",
                    borderRadius: "50%",
                    border:      `3px solid ${getScoreColor(scoreResult.atsScore)}`,
                    display:     "flex",
                    flexDirection: "column",
                    alignItems:  "center",
                    justifyContent: "center",
                    flexShrink:  0,
                    boxShadow:   `0 0 20px ${getScoreColor(scoreResult.atsScore)}33`,
                  }}>
                    <span style={{
                      fontSize:   "1.4rem",
                      fontWeight: 800,
                      fontFamily: "'Outfit', sans-serif",
                      color:      getScoreColor(scoreResult.atsScore),
                    }}>
                      {scoreResult.atsScore}
                    </span>
                    <span style={{ fontSize: "0.6rem", color: "#5c5c8a" }}>%</span>
                  </div>
                  <div>
                    <div style={{
                      fontWeight: 700,
                      fontSize:   "1rem",
                      color:      getScoreColor(scoreResult.atsScore),
                      fontFamily: "'Outfit', sans-serif",
                    }}>
                      {getScoreLabel(scoreResult.atsScore)}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#5c5c8a", marginTop: "4px" }}>
                      ATS Compatibility Score
                    </div>
                  </div>
                </div>

                {/* Missing skills */}
                {scoreResult.missingSkills?.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{
                      fontSize: "0.7rem", fontWeight: 800, color: "#5c5c8a",
                      textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px",
                    }}>
                      Missing Skills
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {scoreResult.missingSkills.map((s) => (
                        <span key={s} style={{
                          background: "rgba(239,68,68,0.08)",
                          color:      "#f87171",
                          padding:    "3px 8px",
                          borderRadius: "6px",
                          fontSize:   "0.72rem",
                          border:     "1px solid rgba(239,68,68,0.2)",
                          fontWeight: 600,
                        }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched skills */}
                {scoreResult.matchedSkills?.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{
                      fontSize: "0.7rem", fontWeight: 800, color: "#5c5c8a",
                      textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px",
                    }}>
                      Matched Skills
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {scoreResult.matchedSkills.map((s) => (
                        <span key={s} style={{
                          background: "rgba(16,185,129,0.08)",
                          color:      "#34d399",
                          padding:    "3px 8px",
                          borderRadius: "6px",
                          fontSize:   "0.72rem",
                          border:     "1px solid rgba(16,185,129,0.2)",
                          fontWeight: 600,
                        }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {scoreResult.suggestions?.length > 0 && (
                  <div>
                    <div style={{
                      fontSize: "0.7rem", fontWeight: 800, color: "#5c5c8a",
                      textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px",
                    }}>
                      Actionable Improvements
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {scoreResult.suggestions.map((s, i) => (
                        <div key={i} style={{
                          background:  "rgba(255,255,255,0.02)",
                          padding:     "12px",
                          borderRadius: "8px",
                          fontSize:    "0.8rem",
                          borderLeft:  "2px solid #8b5cf6",
                          lineHeight:  1.6,
                          color:       "#c4c4e0",
                        }}>
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Rewrite Tab ───────────────────────────────────────────── */}
        {activeTab === "Rewrite" && (
          <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{
              background: "rgba(139,92,246,0.06)",
              border:     "1px solid rgba(139,92,246,0.15)",
              borderRadius: "10px",
              padding:    "12px 14px",
              fontSize:   "0.78rem",
              color:      "#9ca3af",
              lineHeight: 1.6,
            }}>
              🤖 AI will fully rewrite your LaTeX resume optimized for the job description.
              Your original work is preserved in version history.
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: "0.75rem" }}>
                Target Job Description
              </label>
              <textarea
                id="ai-rewrite-jd-input"
                className="form-input"
                placeholder="Paste job description here for targeted optimization… (optional but recommended)"
                rows={6}
                value={rewriteJD}
                onChange={(e) => setRewriteJD(e.target.value)}
                style={{ background: "rgba(0,0,0,0.2)", fontSize: "0.82rem", resize: "vertical" }}
              />
            </div>

            <button
              id="ai-rewrite-btn"
              className="btn btn-primary"
              style={{ width: "100%", padding: "12px" }}
              onClick={handleRewrite}
              disabled={rewriting}
            >
              {rewriting ? (
                <><span className="editor-spinner-sm" /> Rewriting with Gemini AI…</>
              ) : (
                "🤖 Generate Optimized Resume"
              )}
            </button>

            {rewriteError && (
              <div className="editor-error-banner">{rewriteError}</div>
            )}

            {rewritePreview && !applied && (
              <div className="fade-up">
                <div style={{
                  background:   "rgba(0,0,0,0.3)",
                  border:       "1px solid rgba(139,92,246,0.2)",
                  borderRadius: "10px",
                  padding:      "12px",
                  marginBottom: "12px",
                  maxHeight:    "200px",
                  overflowY:    "auto",
                }}>
                  <div style={{
                    fontSize:   "0.68rem",
                    color:      "#5c5c8a",
                    marginBottom: "8px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}>
                    Preview (first 800 chars)
                  </div>
                  <pre style={{
                    fontSize:   "0.72rem",
                    color:      "#a78bfa",
                    whiteSpace: "pre-wrap",
                    wordBreak:  "break-all",
                    margin:     0,
                    fontFamily: "monospace",
                    lineHeight: 1.5,
                  }}>
                    {rewritePreview.slice(0, 800)}{rewritePreview.length > 800 && "…"}
                  </pre>
                </div>

                <button
                  id="ai-apply-rewrite-btn"
                  className="btn"
                  style={{
                    width:      "100%",
                    padding:    "12px",
                    background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.15))",
                    border:     "1px solid rgba(139,92,246,0.3)",
                    color:      "#c4b5fd",
                    fontWeight: 700,
                  }}
                  onClick={handleApplyRewrite}
                >
                  ✓ Apply to Editor & Compile
                </button>
              </div>
            )}

            {applied && (
              <div style={{
                textAlign:   "center",
                padding:     "20px",
                color:       "#34d399",
                fontSize:    "0.88rem",
                fontWeight:  600,
              }}>
                ✅ Applied! Compiling your new resume…
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
