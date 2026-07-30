/**
 * SplitPane.js
 * Draggable resizable split pane. Persists ratio in localStorage.
 */
import React, { useState, useRef, useEffect, useCallback } from "react";

const STORAGE_KEY = "editor_split_ratio";
const DEFAULT_RATIO = 55; // percent for left panel
const MIN_RATIO = 25;
const MAX_RATIO = 75;

export default function SplitPane({ left, right }) {
  const [leftPct, setLeftPct] = useState(() => {
    const saved = parseFloat(localStorage.getItem(STORAGE_KEY));
    return isNaN(saved) ? DEFAULT_RATIO : saved;
  });
  const [dragging, setDragging] = useState(false);

  const containerRef = useRef(null);
  const startXRef    = useRef(0);
  const startRatioRef = useRef(leftPct);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
    startXRef.current    = e.clientX;
    startRatioRef.current = leftPct;
  }, [leftPct]);

  const onMouseMove = useCallback((e) => {
    if (!dragging || !containerRef.current) return;
    const containerWidth = containerRef.current.getBoundingClientRect().width;
    const deltaX = e.clientX - startXRef.current;
    const deltaRatio = (deltaX / containerWidth) * 100;
    const newRatio = Math.min(
      MAX_RATIO,
      Math.max(MIN_RATIO, startRatioRef.current + deltaRatio)
    );
    setLeftPct(newRatio);
  }, [dragging]);

  const onMouseUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    localStorage.setItem(STORAGE_KEY, leftPct.toFixed(1));
  }, [dragging, leftPct]);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, onMouseMove, onMouseUp]);

  return (
    <div
      ref={containerRef}
      style={{
        display:   "flex",
        flex:      1,
        overflow:  "hidden",
        userSelect: dragging ? "none" : "auto",
        cursor:    dragging ? "col-resize" : "auto",
      }}
    >
      {/* Left panel */}
      <div style={{
        width:    `${leftPct}%`,
        overflow: "hidden",
        display:  "flex",
        flexDirection: "column",
        minWidth: 0,
      }}>
        {left}
      </div>

      {/* Drag handle */}
      <div
        className="editor-drag-handle"
        onMouseDown={onMouseDown}
        title="Drag to resize"
        style={{
          width:          "6px",
          background:     dragging
            ? "rgba(139, 92, 246, 0.6)"
            : "rgba(255, 255, 255, 0.06)",
          cursor:         "col-resize",
          flexShrink:     0,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          transition:     "background 0.2s",
          position:       "relative",
          zIndex:         10,
        }}
        onMouseEnter={(e) => {
          if (!dragging) e.currentTarget.style.background = "rgba(139, 92, 246, 0.4)";
        }}
        onMouseLeave={(e) => {
          if (!dragging) e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
        }}
      >
        {/* Visual grip dots */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{
              width: "2px", height: "2px",
              borderRadius: "50%",
              background: dragging ? "#8b5cf6" : "rgba(255,255,255,0.3)",
            }} />
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex:     1,
        overflow: "hidden",
        display:  "flex",
        flexDirection: "column",
        minWidth: 0,
      }}>
        {right}
      </div>
    </div>
  );
}
