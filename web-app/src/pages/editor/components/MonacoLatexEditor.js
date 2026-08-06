/**
 * MonacoLatexEditor.js
 * The core editor component — Monaco configured for LaTeX with full
 * syntax highlighting, autocomplete, error squiggles, and keyboard shortcuts.
 */
import React, { useRef, useCallback, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { registerLatexLanguage, LATEX_LANGUAGE_ID, LATEX_THEME_NAME } from "../config/latexLanguage";

export default function MonacoLatexEditor({
  value,
  onChange,
  errorMarkers = [],
  readOnly = false,
  minimap = false,
  onCompile,
  onSave,
}) {
  const monacoRef = useRef(null);
  const editorRef  = useRef(null);
  const langRegistered = useRef(false);
  const monaco = useMonaco();

  // ── Register language once when Monaco instance is ready ─────────────
  useEffect(() => {
    if (!monaco || langRegistered.current) return;
    registerLatexLanguage(monaco);
    langRegistered.current = true;
  }, [monaco]);

  // ── Apply error markers to the editor model ───────────────────────────
  useEffect(() => {
    if (!monaco || !editorRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    const lineCount = model.getLineCount() || 1;
    const monacoMarkers = (errorMarkers || []).map((marker) => {
      const lineNum = Math.max(1, Math.min(parseInt(marker.lineNumber, 10) || 1, lineCount));
      const maxCol = Math.max(1, model.getLineMaxColumn(lineNum) || 100);
      return {
        severity:
          marker.severity === "warning"
            ? monaco.MarkerSeverity.Warning
            : monaco.MarkerSeverity.Error,
        message: String(marker.message || "LaTeX Error"),
        startLineNumber: lineNum,
        endLineNumber: lineNum,
        startColumn: 1,
        endColumn: maxCol,
      };
    });

    monaco.editor.setModelMarkers(model, "latex-compiler", monacoMarkers);
  }, [monaco, errorMarkers]);

  // ── Register keyboard shortcuts after editor mounts ───────────────────
  const handleEditorMount = useCallback((editor, monacoInstance) => {
    editorRef.current  = editor;
    monacoRef.current  = monacoInstance;

    // Register language if not already done (e.g., before useMonaco fired)
    if (!langRegistered.current) {
      registerLatexLanguage(monacoInstance);
      langRegistered.current = true;
    }

    // Apply custom theme
    try { monacoInstance.editor.setTheme(LATEX_THEME_NAME); } catch (_) {}

    // Ctrl+S → Save
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS,
      () => { if (onSave) onSave(); }
    );

    // Ctrl+Enter → Compile
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter,
      () => { if (onCompile) onCompile(); }
    );

    // Ctrl+Shift+F → Find
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.KeyF,
      () => { try { editor.getAction("actions.find").run(); } catch (_) {} }
    );
  }, [onSave, onCompile]);

  // ── Editor options ────────────────────────────────────────────────────
  const editorOptions = {
    language:             LATEX_LANGUAGE_ID,
    theme:                LATEX_THEME_NAME,
    fontSize:             14,
    fontFamily:           "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
    fontLigatures:        true,
    lineNumbers:          "on",
    lineNumbersMinChars:  3,
    wordWrap:             "on",
    wrappingIndent:       "indent",
    minimap:              { enabled: !!minimap },
    scrollBeyondLastLine: false,
    renderWhitespace:     "selection",
    autoClosingBrackets:  "always",
    autoClosingQuotes:    "always",
    matchBrackets:        "always",
    bracketPairColorization: { enabled: true },
    suggest: {
      insertMode:     "replace",
      showKeywords:   true,
      showSnippets:   true,
    },
    quickSuggestions: {
      other:   true,
      comments: false,
      strings:  false,
    },
    quickSuggestionsDelay: 50,
    tabSize:              2,
    insertSpaces:         true,
    renderLineHighlight:  "gutter",
    cursorBlinking:       "smooth",
    cursorSmoothCaretAnimation: "on",
    smoothScrolling:      true,
    padding:              { top: 20, bottom: 20 },
    scrollbar: {
      verticalScrollbarSize:   8,
      horizontalScrollbarSize: 8,
      useShadows:              false,
    },
    overviewRulerBorder:   false,
    hideCursorInOverviewRuler: true,
    folding:              true,
    foldingStrategy:      "indentation",
    showFoldingControls:  "mouseover",
    readOnly,
    largeFileOptimizations: true,
  };

  return (
    <Editor
      height="100%"
      language={LATEX_LANGUAGE_ID}
      theme={LATEX_THEME_NAME}
      value={value}
      onChange={onChange}
      onMount={handleEditorMount}
      options={editorOptions}
      loading={
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          background: "#0d0d1a",
          color: "#5c5c8a",
          gap: "12px",
          fontSize: "0.9rem",
        }}>
          <div className="editor-spinner" />
          Loading editor…
        </div>
      }
    />
  );
}
