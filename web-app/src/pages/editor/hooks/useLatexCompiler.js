/**
 * useLatexCompiler.js
 * Custom hook — compile trigger, status, error parsing,
 * and Monaco error marker generation.
 */
import { useState, useCallback, useRef } from "react";
import API from "../../../api/axios";

// Parse pdflatex-style error output into structured markers
// pdflatex errors look like: "! LaTeX Error: ..." or "l.42 something"
export function parseLatexErrors(errorText = "") {
  if (!errorText) return [];

  const markers = [];
  const lines = errorText.split("\n");

  let currentError = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Error header: "! LaTeX Error: ..." or "! Undefined control sequence."
    if (line.startsWith("!")) {
      currentError = {
        message: line.replace(/^!\s*/, ""),
        lineNumber: 1, // default; will be updated below
        severity: "error",
      };
    }

    // Line reference: "l.42 \wrongcommand"
    if (currentError && /^l\.\d+/.test(line)) {
      const match = line.match(/^l\.(\d+)/);
      if (match) {
        currentError.lineNumber = parseInt(match[1], 10);
        markers.push({ ...currentError });
        currentError = null;
      }
    }

    // Warning patterns: "LaTeX Warning: ..."
    if (line.startsWith("LaTeX Warning:") || line.startsWith("Package Warning:")) {
      markers.push({
        message: line,
        lineNumber: 1,
        severity: "warning",
      });
    }
  }

  // If we had an error but never found a line number, add it at line 1
  if (currentError) markers.push(currentError);

  return markers;
}

export default function useLatexCompiler({ activeDoc, latexSource }) {
  const [compiling,    setCompiling]    = useState(false);
  const [pdfUrl,       setPdfUrl]       = useState(null);
  const [compileMsg,   setCompileMsg]   = useState({ text: "", type: "idle" }); // type: idle | success | error
  const [errorMarkers, setErrorMarkers] = useState([]); // for Monaco squiggles
  const abortRef = useRef(null);

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const compile = useCallback(async (sourceOverride) => {
    if (!activeDoc) return;

    setCompiling(true);
    setCompileMsg({ text: "", type: "idle" });
    setErrorMarkers([]);

    try {
      const sourceToCompile =
        typeof sourceOverride === "string" ? sourceOverride : latexSource;
      const { data } = await API.post(
        `/api/editor/documents/${activeDoc}/compile`,
        { latexSource: sourceToCompile }
      );

      const fullPdfUrl = `${API_BASE}${data.pdfUrl}?t=${Date.now()}`; // cache-bust
      setPdfUrl(fullPdfUrl);
      setCompileMsg({
        text: data.message?.includes("Cloud") 
          ? "✅ Compiled via Cloud TeX Engine"
          : "✅ Compiled successfully",
        type: "success",
      });

      // Clear any previous error markers on success
      setErrorMarkers([]);
    } catch (err) {
      const errData = err.response?.data;
      const rawLogObj = errData?.error || errData?.message || err?.message || "";
      const rawLog = typeof rawLogObj === "string" ? rawLogObj : JSON.stringify(rawLogObj);
      const parsed  = parseLatexErrors(rawLog);

      const textObj = errData?.message || err?.message || "Compilation failed. Check LaTeX syntax.";
      const textStr = typeof textObj === "string" ? textObj : JSON.stringify(textObj);

      setCompileMsg({
        text: textStr,
        type: "error",
        rawLog,
      });
      setErrorMarkers(parsed);
    } finally {
      setCompiling(false);
    }
  }, [activeDoc, latexSource, API_BASE]);

  const clearCompileMsg = useCallback(() => {
    setCompileMsg({ text: "", type: "idle" });
  }, []);

  const setPdfUrlExternal = useCallback((url) => {
    setPdfUrl(url);
  }, []);

  return {
    compiling,
    pdfUrl,
    setPdfUrl: setPdfUrlExternal,
    compileMsg,
    errorMarkers,
    compile,
    clearCompileMsg,
  };
}
