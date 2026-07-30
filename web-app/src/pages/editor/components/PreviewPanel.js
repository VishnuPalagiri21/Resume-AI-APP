/**
 * PreviewPanel.js
 * PDF preview pane — iframe, empty state, compile-in-progress overlay,
 * error state with log excerpt, and download button.
 */
import React from "react";

export default function PreviewPanel({ pdfUrl, compiling, compileMsg, title }) {
  const hasError   = compileMsg?.type === "error";
  const hasSuccess = compileMsg?.type === "success" && pdfUrl;

  return (
    <div className="editor-preview-panel">
      {/* Panel header */}
      <div className="editor-preview-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.75rem", color: "#5c5c8a" }}>PDF PREVIEW</span>
          {hasSuccess && (
            <span style={{
              background: "rgba(16,185,129,0.15)",
              color: "#34d399",
              fontSize: "0.68rem",
              padding: "2px 8px",
              borderRadius: "99px",
              border: "1px solid rgba(16,185,129,0.3)",
              fontWeight: 700,
            }}>
              COMPILED
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {pdfUrl && (
            <>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#a78bfa", fontSize: "0.75rem", textDecoration: "none" }}
              >
                ↗ Open
              </a>
              <a
                href={pdfUrl}
                download={`${title || "resume"}.pdf`}
                style={{ color: "#c4b5fd", fontSize: "0.75rem", textDecoration: "none" }}
              >
                ⬇ Download
              </a>
            </>
          )}
        </div>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* PDF iframe */}
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            title="PDF Preview"
            style={{
              position:   "absolute",
              inset:      0,
              width:      "100%",
              height:     "100%",
              border:     "none",
              background: "#fff",
              opacity:    compiling ? 0.4 : 1,
              transition: "opacity 0.3s",
            }}
          />
        )}

        {/* Compile overlay */}
        {compiling && (
          <div className="editor-preview-overlay">
            <div className="editor-compile-spinner" />
            <p style={{ color: "#8b8bc0", fontSize: "0.85rem", marginTop: "12px" }}>
              Compiling LaTeX…
            </p>
          </div>
        )}

        {/* Error state */}
        {hasError && !compiling && (
          <div className="editor-preview-error">
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>⚠️</div>
            <h3 style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#f87171",
              marginBottom: "8px",
              fontFamily: "'Outfit', sans-serif",
            }}>
              Compilation Failed
            </h3>
            <p style={{ fontSize: "0.82rem", color: "#9ca3af", marginBottom: "16px", lineHeight: 1.5 }}>
              {compileMsg.text}
            </p>
            {compileMsg.rawLog && (
              <details style={{ width: "100%", textAlign: "left" }}>
                <summary style={{
                  fontSize: "0.75rem",
                  color: "#7070a0",
                  cursor: "pointer",
                  marginBottom: "8px",
                }}>
                  Show LaTeX log
                </summary>
                <pre style={{
                  background:   "rgba(0,0,0,0.4)",
                  border:       "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "8px",
                  padding:      "12px",
                  fontSize:     "0.72rem",
                  color:        "#fca5a5",
                  overflowY:    "auto",
                  maxHeight:    "200px",
                  whiteSpace:   "pre-wrap",
                  wordBreak:    "break-all",
                }}>
                  {compileMsg.rawLog}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Empty state — no PDF compiled yet */}
        {!pdfUrl && !compiling && !hasError && (
          <div className="editor-preview-empty">
            <div className="editor-preview-empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <p className="editor-preview-empty-title">No preview yet</p>
            <p className="editor-preview-empty-hint">
              Click <kbd>▶ Compile PDF</kbd> or press{" "}
              <kbd style={{ fontFamily: "monospace" }}>Ctrl+Enter</kbd>{" "}
              to render your resume.
            </p>
            <div style={{
              marginTop: "16px",
              fontSize: "0.72rem",
              color: "#3d3d60",
              maxWidth: "240px",
              lineHeight: 1.6,
              textAlign: "center",
            }}>
              Powered by pdflatex with automatic cloud fallback.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
