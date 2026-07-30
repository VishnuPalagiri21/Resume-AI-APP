/**
 * EditorPage.js  (v2 — thin orchestrator)
 * Composes all editor sub-components and hooks.
 * State lives in useEditorDocument + useLatexCompiler.
 */
import React, { useState, useCallback, useRef, useEffect } from "react";
import MonacoLatexEditor     from "./components/MonacoLatexEditor";
import EditorToolbar         from "./components/EditorToolbar";
import PreviewPanel          from "./components/PreviewPanel";
import SplitPane             from "./components/SplitPane";
import DocumentList          from "./components/DocumentList";
import VersionHistoryDrawer  from "./components/VersionHistoryDrawer";
import AiAssistantDrawer     from "./components/AiAssistantDrawer";
import useEditorDocument     from "./hooks/useEditorDocument";
import useLatexCompiler      from "./hooks/useLatexCompiler";
import API                   from "../../api/axios";

export default function EditorPage() {
  // ── Custom hooks ─────────────────────────────────────────────────────
  const {
    docs, activeDoc, docMeta, latexSource, title,
    saving, isDirty, loadingDocs, error,
    openDoc, closeDoc, newDoc, saveDoc, deleteDoc,
    handleEditorChange, handleTitleChange, handleTitleBlur,
    setLatexSource,
  } = useEditorDocument();

  const {
    compiling, pdfUrl, setPdfUrl, compileMsg, errorMarkers, compile,
  } = useLatexCompiler({ activeDoc, latexSource });

  // ── Local UI state ───────────────────────────────────────────────────
  const [showHistory,    setShowHistory]    = useState(false);
  const [showAI,         setShowAI]         = useState(false);
  const [showMinimap,    setShowMinimap]    = useState(false);
  const [autoCompile,    setAutoCompile]    = useState(false);

  // Auto-compile: trigger compile a few seconds after every save
  const autoCompileTimer = useRef(null);
  useEffect(() => {
    if (!autoCompile || !activeDoc) return;
    clearTimeout(autoCompileTimer.current);
    autoCompileTimer.current = setTimeout(() => compile(), 4000);
    return () => clearTimeout(autoCompileTimer.current);
  }, [latexSource, autoCompile, activeDoc, compile]);

  // ── Snapshot (named version) ─────────────────────────────────────────
  const handleSaveSnapshot = useCallback(async () => {
    if (!activeDoc) return;
    const label = window.prompt("Name this snapshot (e.g., 'Before Interview'):");
    if (!label) return;
    try {
      await API.post(`/api/editor/documents/${activeDoc}/versions`, { label });
    } catch (err) {
      console.error("[EditorPage] snapshot error:", err.message);
    }
  }, [activeDoc]);

  // ── Restore version ──────────────────────────────────────────────────
  const handleRestoreVersion = useCallback((restoredSource) => {
    setLatexSource(restoredSource);
    saveDoc(restoredSource, title);
  }, [setLatexSource, saveDoc, title]);

  // ── AI rewrite apply ─────────────────────────────────────────────────
  const handleRewriteApply = useCallback((newSource) => {
    setLatexSource(newSource);
    saveDoc(newSource, title);
  }, [setLatexSource, saveDoc, title]);

  // ── When a doc is first opened, restore its pdfUrl if it exists ──────
  useEffect(() => {
    if (docMeta?.compiledPdfUrl) {
      const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
      setPdfUrl(`${API_BASE}${docMeta.compiledPdfUrl}`);
    } else {
      setPdfUrl(null);
    }
  }, [docMeta, setPdfUrl]);

  // ── Document list screen ─────────────────────────────────────────────
  if (!activeDoc) {
    return (
      <DocumentList
        docs={docs}
        loading={loadingDocs}
        error={error}
        onOpen={openDoc}
        onNew={newDoc}
        onDelete={deleteDoc}
      />
    );
  }

  // ── Editor screen ────────────────────────────────────────────────────
  return (
    <div style={{
      height:        "100vh",
      display:       "flex",
      flexDirection: "column",
      overflow:      "hidden",
      background:    "#0d0d1a",
    }}>
      {/* Toolbar */}
      <EditorToolbar
        title={title}
        onTitleChange={handleTitleChange}
        onTitleBlur={handleTitleBlur}
        saving={saving}
        isDirty={isDirty}
        compiling={compiling}
        onCompile={compile}
        onSaveSnapshot={handleSaveSnapshot}
        onOpenHistory={() => setShowHistory(true)}
        onOpenAI={() => setShowAI(true)}
        onBack={closeDoc}
        showMinimap={showMinimap}
        onToggleMinimap={() => setShowMinimap((v) => !v)}
        autoCompile={autoCompile}
        onToggleAutoCompile={() => setAutoCompile((v) => !v)}
      />

      {/* Compile message banner */}
      {compileMsg?.text && (
        <div style={{
          padding:     "8px 20px",
          fontSize:    "0.82rem",
          background:  compileMsg.type === "success"
            ? "rgba(16,185,129,0.08)"
            : "rgba(239,68,68,0.08)",
          color:       compileMsg.type === "success" ? "#34d399" : "#f87171",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display:     "flex",
          alignItems:  "center",
          gap:         "8px",
        }}>
          {compileMsg.text}
        </div>
      )}

      {/* Split pane: Editor ↔ Preview */}
      <SplitPane
        left={
          <MonacoLatexEditor
            value={latexSource}
            onChange={handleEditorChange}
            errorMarkers={errorMarkers}
            onCompile={compile}
            onSave={() => saveDoc()}
            minimap={showMinimap}
          />
        }
        right={
          <PreviewPanel
            pdfUrl={pdfUrl}
            compiling={compiling}
            compileMsg={compileMsg}
            title={title}
          />
        }
      />

      {/* Version history drawer */}
      {showHistory && (
        <VersionHistoryDrawer
          activeDoc={activeDoc}
          onRestore={handleRestoreVersion}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* AI assistant drawer */}
      {showAI && (
        <AiAssistantDrawer
          activeDoc={activeDoc}
          title={title}
          latexSource={latexSource}
          onClose={() => setShowAI(false)}
          onRewriteApply={handleRewriteApply}
          onCompile={compile}
        />
      )}
    </div>
  );
}
