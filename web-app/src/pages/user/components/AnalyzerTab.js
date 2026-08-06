import React from "react";

export default function AnalyzerTab({
  file, setFile, jobDescription, setJobDescription, analyzing, analysisResult,
  handleAnalyze, getScoreColor,
}) {
  return (
    <div className="fade-up">
      <header style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "'Outfit',sans-serif", color: "#fff", marginBottom: "8px" }}>ATS Resume Analyzer 🎯</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: "800px", lineHeight: 1.6 }}>
          Upload your resume and a target job description. Our Gemini AI model will dissect your experience, extract missing keywords, and provide a strict, highly accurate ATS match score along with actionable feedback.
        </p>
      </header>

      <div className="ats-grid-layout">
        
        {/* Upload Panel (Left Column) */}
        <div className="glass" style={{ padding: "32px", display: "flex", flexDirection: "column", height: "100%" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "24px", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "var(--brand-primary)" }}>1.</span> Input Data
          </h3>
          <form onSubmit={handleAnalyze} style={{ display: "flex", flexDirection: "column", gap: "24px", flex: 1, justifyContent: "space-between" }}>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ marginBottom: "12px", display: "block" }}>Upload Resume (PDF)</label>
              <div style={{ position: "relative", border: "2px dashed rgba(255,255,255,0.15)", borderRadius: "var(--radius-md)", padding: "32px", textAlign: "center", background: "rgba(0,0,0,0.2)", transition: "all 0.3s ease", cursor: "pointer" }}
                   onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--brand-primary)"}
                   onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"}>
                <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} required style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} />
                <div style={{ fontSize: "2rem", marginBottom: "12px" }}>📄</div>
                <div style={{ fontWeight: 600, color: "#fff", marginBottom: "4px" }}>{file ? file.name : "Click or drag PDF here"}</div>
                {!file && <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Supports standard PDF formats</div>}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Target Job Description</label>
              <textarea 
                className="form-input" 
                placeholder="Paste the job requirements and responsibilities here. The AI will strictly evaluate your resume against these requirements..." 
                rows={8} 
                value={jobDescription} 
                onChange={(e) => setJobDescription(e.target.value)} 
                style={{ resize: "vertical", background: "rgba(0,0,0,0.3)" }} 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "18px", fontSize: "1.05rem" }} disabled={analyzing}>
              {analyzing ? (
                <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="floating" style={{ display: "inline-block" }}>🧠</span> Analyzing via Gemini AI...
                </span>
              ) : "Scan & Analyze Resume 🚀"}
            </button>
          </form>
        </div>

        {/* Results Panel (Right Column) */}
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {analysisResult ? (
            <div className="glass fade-up" style={{ padding: "40px", border: `1px solid ${getScoreColor(analysisResult.atsScore)}40`, height: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
                <div>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", marginBottom: "4px" }}>AI Analysis Report</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Analyzed securely via Gemini</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 700 }}>Match Score</div>
                  <div style={{ fontSize: "3rem", fontWeight: 900, fontFamily: "'Outfit',sans-serif", color: getScoreColor(analysisResult.atsScore), lineHeight: 1.1 }}>
                    {analysisResult.atsScore}%
                  </div>
                </div>
              </div>

              <div className="ats-bar-bg" style={{ height: "8px", marginBottom: "40px", background: "rgba(255,255,255,0.05)" }}>
                <div className="ats-bar-fill" style={{ width: `${analysisResult.atsScore}%`, background: getScoreColor(analysisResult.atsScore) }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
                <div className="glass-panel" style={{ padding: "20px" }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#10b981" }}>✓</span> Matched Skills
                  </h4>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {analysisResult.matchedSkills?.length ? analysisResult.matchedSkills.map(s => (
                      <span key={s} style={{ background: "rgba(16,185,129,0.1)", color: "#34d399", padding: "4px 12px", borderRadius: "6px", fontSize: "0.85rem", border: "1px solid rgba(16,185,129,0.2)", fontWeight: 600 }}>{s}</span>
                    )) : <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No exact matches found.</span>}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: "20px" }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#ef4444" }}>✗</span> Missing Skills
                  </h4>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {analysisResult.missingSkills?.length ? analysisResult.missingSkills.map(s => (
                      <span key={s} style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", padding: "4px 12px", borderRadius: "6px", fontSize: "0.85rem", border: "1px solid rgba(239,68,68,0.2)", fontWeight: 600 }}>{s}</span>
                    )) : <span style={{ color: "#10b981", fontSize: "0.9rem", fontWeight: 600 }}>You have all required skills!</span>}
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "var(--brand-secondary)" }}>💡</span> AI Recommendations
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                  {analysisResult.suggestions?.map((s, i) => (
                    <div key={i} className="glass-panel" style={{ padding: "16px", borderLeft: "3px solid var(--brand-secondary)", fontSize: "0.95rem", lineHeight: 1.6, color: "var(--text)" }}>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass" style={{ padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "520px", background: "rgba(255,255,255,0.01)" }}>
              <div className="floating" style={{ width: "80px", height: "80px", borderRadius: "20px", background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", marginBottom: "24px", color: "var(--brand-primary)" }}>
                ⚡
              </div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", marginBottom: "12px" }}>Awaiting Input</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "1rem", maxWidth: "300px", lineHeight: 1.6 }}>
                Upload your resume to unlock a detailed AI audit of your professional profile.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
