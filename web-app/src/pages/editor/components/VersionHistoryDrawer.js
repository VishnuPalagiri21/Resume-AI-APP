/**
 * VersionHistoryDrawer.js
 * Slide-in drawer showing all named snapshots with restore functionality.
 */
import React, { useState, useEffect, useCallback } from "react";
import API from "../../../api/axios";

export default function VersionHistoryDrawer({ activeDoc, onRestore, onClose }) {
  const [versions, setVersions]   = useState([]);
  const [loading,  setLoading]    = useState(false);
  const [restoring, setRestoring] = useState(null);

  const loadVersions = useCallback(async () => {
    if (!activeDoc) return;
    setLoading(true);
    try {
      const { data } = await API.get(`/api/editor/documents/${activeDoc}/versions`);
      setVersions(data.versions || []);
    } catch (err) {
      console.error("[VersionHistoryDrawer] load error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [activeDoc]);

  useEffect(() => { loadVersions(); }, [loadVersions]);

  const handleRestore = (version) => {
    setRestoring(version._id);
    onRestore(version.latexSource);
    setTimeout(() => { setRestoring(null); onClose(); }, 400);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="editor-drawer-backdrop"
        onClick={onClose}
        aria-label="Close version history"
      />

      {/* Drawer */}
      <div className="editor-drawer editor-drawer-right">
        {/* Header */}
        <div className="editor-drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.1rem" }}>🕐</span>
            <h2 style={{
              fontSize:   "1rem",
              fontWeight: 700,
              fontFamily: "'Outfit', sans-serif",
              margin:     0,
            }}>
              Version History
            </h2>
          </div>
          <button
            id="version-drawer-close"
            className="btn btn-ghost editor-toolbar-btn"
            style={{ padding: "4px 10px" }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: "0.78rem", color: "#5c5c8a", marginBottom: "20px", lineHeight: 1.5 }}>
          Click any snapshot to restore it in the editor. Current work will be replaced.
        </p>

        {/* Refresh button */}
        <button
          className="btn btn-ghost editor-toolbar-btn"
          style={{ width: "100%", marginBottom: "16px", fontSize: "0.8rem" }}
          onClick={loadVersions}
          disabled={loading}
        >
          {loading ? "Loading…" : "⟳ Refresh"}
        </button>

        {/* Version list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {loading && versions.length === 0 ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="editor-doc-card-skeleton" style={{ height: "64px", borderRadius: "10px" }} />
            ))
          ) : versions.length === 0 ? (
            <div style={{
              textAlign:   "center",
              padding:     "40px 20px",
              color:       "#4040608",
              borderRadius: "12px",
              border:      "1px dashed rgba(255,255,255,0.08)",
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>📌</div>
              <p style={{ fontSize: "0.82rem", color: "#5c5c8a" }}>
                No snapshots yet. Click{" "}
                <strong style={{ color: "#a78bfa" }}>📌 Snapshot</strong>{" "}
                in the toolbar to save one.
              </p>
            </div>
          ) : (
            versions.map((v) => (
              <div
                key={v._id}
                className="glass editor-version-card"
                onClick={() => handleRestore(v)}
                style={{
                  cursor:       "pointer",
                  opacity:      restoring === v._id ? 0.5 : 1,
                  transition:   "opacity 0.3s",
                  borderRadius: "10px",
                  padding:      "14px 16px",
                }}
              >
                <div style={{
                  display:       "flex",
                  justifyContent: "space-between",
                  alignItems:    "flex-start",
                  gap:           "8px",
                }}>
                  <div>
                    <div style={{
                      fontWeight: 600,
                      fontSize:   "0.88rem",
                      color:      "#e2e8f0",
                      marginBottom: "4px",
                    }}>
                      {v.label}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#5c5c8a" }}>
                      {new Date(v.createdAt).toLocaleString("en-US", {
                        month: "short", day: "numeric",
                        hour:  "2-digit", minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div style={{
                    fontSize:   "0.72rem",
                    color:      "#7c7ca0",
                    background: "rgba(139,92,246,0.08)",
                    padding:    "3px 8px",
                    borderRadius: "6px",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}>
                    {restoring === v._id ? "Restoring…" : "↩ Restore"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
