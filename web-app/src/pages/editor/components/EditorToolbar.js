/**
 * EditorToolbar.js
 * Top action bar for the editor view — save status, compile, snapshot, history, AI.
 */
import React from "react";

export default function EditorToolbar({
  title,
  onTitleChange,
  onTitleBlur,
  saving,
  isDirty,
  compiling,
  onCompile,
  onSaveSnapshot,
  onOpenHistory,
  onOpenAI,
  onBack,
  onToggleMinimap,
  showMinimap,
  onToggleAutoCompile,
  autoCompile,
}) {
  return (
    <div className="editor-toolbar">
      {/* Left: Back + Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
        <button
          id="editor-back-btn"
          className="btn btn-ghost editor-toolbar-btn"
          onClick={onBack}
          title="Back to documents"
        >
          ← Docs
        </button>

        <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)" }} />

        <input
          id="editor-title-input"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onBlur={onTitleBlur}
          placeholder="Resume title…"
          style={{
            background:  "transparent",
            border:      "none",
            color:       "#e2e8f0",
            fontSize:    "0.95rem",
            fontWeight:  700,
            outline:     "none",
            flex:        1,
            fontFamily:  "'Outfit', sans-serif",
            minWidth:    0,
            maxWidth:    "280px",
          }}
        />

        {/* Save status indicator */}
        <div className="editor-save-status">
          {saving ? (
            <span className="editor-save-saving">
              <span className="editor-spinner-sm" />
              Saving…
            </span>
          ) : isDirty ? (
            <span className="editor-save-dirty">● Unsaved</span>
          ) : (
            <span className="editor-save-ok">✓ Saved</span>
          )}
        </div>
      </div>

      {/* Right: Action buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {/* Minimap toggle */}
        <button
          id="editor-minimap-btn"
          className={`btn editor-toolbar-btn ${showMinimap ? "editor-toolbar-btn-active" : "btn-ghost"}`}
          onClick={() => onToggleMinimap()}
          title="Toggle minimap"
        >
          🗺
        </button>

        {/* Auto-compile toggle */}
        <button
          id="editor-autocompile-btn"
          className={`btn editor-toolbar-btn ${autoCompile ? "editor-toolbar-btn-active" : "btn-ghost"}`}
          onClick={() => onToggleAutoCompile()}
          title={autoCompile ? "Auto-compile ON (click to disable)" : "Auto-compile OFF (click to enable)"}
        >
          {autoCompile ? "⚡ Auto" : "⚡ Manual"}
        </button>

        <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)" }} />

        {/* Snapshot */}
        <button
          id="editor-snapshot-btn"
          className="btn btn-ghost editor-toolbar-btn"
          onClick={() => onSaveSnapshot()}
          title="Save named snapshot (Ctrl+Shift+S)"
        >
          📌 Snapshot
        </button>

        {/* History */}
        <button
          id="editor-history-btn"
          className="btn btn-ghost editor-toolbar-btn"
          onClick={() => onOpenHistory()}
          title="Version history"
        >
          🕐 History
        </button>

        <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)" }} />

        {/* AI Assistant */}
        <button
          id="editor-ai-btn"
          className="btn editor-toolbar-btn editor-toolbar-btn-ai"
          onClick={() => onOpenAI()}
          title="AI Assistant — ATS scoring & resume rewrite"
        >
          ✨ AI Assistant
        </button>

        {/* Compile */}
        <button
          id="editor-compile-btn"
          className={`btn editor-toolbar-btn editor-toolbar-btn-compile ${compiling ? "editor-toolbar-btn-compiling" : ""}`}
          onClick={() => onCompile()}
          disabled={compiling}
          title="Compile LaTeX → PDF (Ctrl+Enter)"
        >
          {compiling ? (
            <>
              <span className="editor-spinner-sm" />
              Compiling…
            </>
          ) : (
            "▶ Compile PDF"
          )}
        </button>
      </div>
    </div>
  );
}
