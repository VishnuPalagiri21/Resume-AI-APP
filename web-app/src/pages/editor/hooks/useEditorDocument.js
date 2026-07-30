/**
 * useEditorDocument.js
 * Custom hook — all document CRUD, auto-save state, and URL sync logic.
 * Keeps EditorPage.js clean by exporting a single hook.
 */
import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../../../api/axios";

const AUTO_SAVE_DELAY_MS = 3000; // 3 s debounce

export default function useEditorDocument() {
  const [docs,       setDocs]       = useState([]);
  const [activeDoc,  setActiveDoc]  = useState(null); // document id string
  const [docMeta,    setDocMeta]    = useState(null); // full document object
  const [latexSource, setLatexSource] = useState("");
  const [title,      setTitle]      = useState("");
  const [saving,     setSaving]     = useState(false);
  const [isDirty,    setIsDirty]    = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [error,      setError]      = useState(null);

  const saveTimerRef    = useRef(null);
  const latexSourceRef  = useRef(""); // always up-to-date for timer callbacks
  const titleRef        = useRef("");

  const [searchParams, setSearchParams] = useSearchParams();

  // Keep refs in sync
  useEffect(() => { latexSourceRef.current = latexSource; }, [latexSource]);
  useEffect(() => { titleRef.current = title; }, [title]);

  // ── Open document ────────────────────────────────────────────────────────
  const openDoc = useCallback((doc) => {
    setActiveDoc(doc._id);
    setDocMeta(doc);
    setLatexSource(doc.latexSource || "");
    setTitle(doc.title || "Untitled Resume");
    setIsDirty(false);
    setSearchParams({ docId: doc._id });
  }, [setSearchParams]);

  // ── Load all docs ────────────────────────────────────────────────────────
  const loadDocs = useCallback(async () => {
    setLoadingDocs(true);
    setError(null);
    try {
      const { data } = await API.get("/api/editor/documents");
      const documents = data.documents || [];
      setDocs(documents);

      // Auto-open if docId is in the URL
      const docId = searchParams.get("docId");
      if (docId) {
        const target = documents.find((d) => d._id === docId);
        if (target) openDoc(target);
      }
    } catch (err) {
      setError("Failed to load documents. Please refresh.");
      console.error("[useEditorDocument] loadDocs:", err.message);
    } finally {
      setLoadingDocs(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally omit searchParams/openDoc to run only on mount

  useEffect(() => { loadDocs(); }, [loadDocs]);

  // ── Create new document ──────────────────────────────────────────────────
  const newDoc = useCallback(async (template = "modern") => {
    try {
      const { data } = await API.post("/api/editor/documents", {
        title: "Untitled Resume",
        template,
      });
      setDocs((prev) => [data.document, ...prev]);
      openDoc(data.document);
    } catch (err) {
      setError("Failed to create document.");
      console.error("[useEditorDocument] newDoc:", err.message);
    }
  }, [openDoc]);

  // ── Close / go back to list ──────────────────────────────────────────────
  const closeDoc = useCallback(() => {
    clearTimeout(saveTimerRef.current);
    setActiveDoc(null);
    setDocMeta(null);
    setLatexSource("");
    setTitle("");
    setIsDirty(false);
    setSearchParams({});
  }, [setSearchParams]);

  // ── Save (explicit) ──────────────────────────────────────────────────────
  const saveDoc = useCallback(async (sourceOverride, titleOverride) => {
    if (!activeDoc) return;
    const source = typeof sourceOverride === "string" ? sourceOverride : latexSourceRef.current;
    const t      = typeof titleOverride  === "string" ? titleOverride  : titleRef.current;

    setSaving(true);
    try {
      const { data } = await API.put(`/api/editor/documents/${activeDoc}`, {
        latexSource: source,
        title: t,
      });
      setDocMeta(data.document);
      setIsDirty(false);

      // Update the doc in the list too
      setDocs((prev) =>
        prev.map((d) => (d._id === activeDoc ? data.document : d))
      );
    } catch (err) {
      console.error("[useEditorDocument] saveDoc:", err.message);
    } finally {
      setSaving(false);
    }
  }, [activeDoc]);

  // ── Delete document ──────────────────────────────────────────────────────
  const deleteDoc = useCallback(async (docId) => {
    try {
      await API.delete(`/api/editor/documents/${docId}`);
      setDocs((prev) => prev.filter((d) => d._id !== docId));
      if (activeDoc === docId) closeDoc();
    } catch (err) {
      setError("Failed to delete document.");
      console.error("[useEditorDocument] deleteDoc:", err.message);
    }
  }, [activeDoc, closeDoc]);

  // ── Handle editor change (debounced auto-save) ───────────────────────────
  const handleEditorChange = useCallback((value) => {
    setLatexSource(value || "");
    setIsDirty(true);

    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveDoc(value, titleRef.current);
    }, AUTO_SAVE_DELAY_MS);
  }, [saveDoc]);

  // ── Handle title change ──────────────────────────────────────────────────
  const handleTitleChange = useCallback((newTitle) => {
    setTitle(newTitle);
    setIsDirty(true);
  }, []);

  const handleTitleBlur = useCallback(() => {
    clearTimeout(saveTimerRef.current);
    saveDoc(latexSourceRef.current, titleRef.current);
  }, [saveDoc]);

  // ── Cleanup timer on unmount ─────────────────────────────────────────────
  useEffect(() => {
    return () => clearTimeout(saveTimerRef.current);
  }, []);

  return {
    // State
    docs,
    activeDoc,
    docMeta,
    latexSource,
    title,
    saving,
    isDirty,
    loadingDocs,
    error,

    // Actions
    openDoc,
    closeDoc,
    newDoc,
    saveDoc,
    deleteDoc,
    handleEditorChange,
    handleTitleChange,
    handleTitleBlur,
    setLatexSource, // exposed so AI rewrite can inject new source
    setTitle,
  };
}
