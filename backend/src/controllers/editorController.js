/**
 * Editor Controller
 * 
 * Handles LaTeX resume editor business logic: document CRUD,
 * template management, LaTeX compilation (local + cloud fallback),
 * AI resume generation, version snapshots, and public sharing.
 */
const path         = require("path");
const fs           = require("fs");
const https        = require("https");
const { execFile } = require("child_process");
const supabase     = require("../config/supabase");
const { generateLatexResume } = require("../utils/atsEngine");

/* ─────────────────────────────────────────────
   Cloud TeX Compiler Fallback Helper
───────────────────────────────────────────── */
function compileOnlineLatex(source) {
  return new Promise((resolve, reject) => {
    let cleanSource = source || "";

    // Auto-fix common LaTeX syntax errors
    cleanSource = cleanSource.replace(/10\.5pt/g, "11pt");

    // Auto-complete document environment if missing
    if (!cleanSource.includes("\\begin{document}")) {
      cleanSource += "\n\\begin{document}\n\\section*{Resume}\n\\end{document}";
    } else if (!cleanSource.includes("\\end{document}")) {
      cleanSource += "\n\\end{document}";
    }

    const encoded = encodeURIComponent(cleanSource);
    const url = `https://latexonline.cc/compile?text=${encoded}`;
    
    const req = https.get(url, (res) => {
      const chunks = [];
      res.on("data", chunk => chunks.push(chunk));
      res.on("end", () => {
        const body = Buffer.concat(chunks);
        if (res.statusCode !== 200) {
          const errLines = body.toString("utf8").split("\n").filter(l => l.includes("error:") || l.includes("Error"));
          const errorMsg = errLines.length > 0 ? errLines.slice(0, 3).join(" | ") : `HTTP ${res.statusCode} Compilation Error`;
          return reject(new Error(errorMsg));
        }
        resolve(body);
      });
      res.on("error", err => reject(err));
    });

    req.on("error", err => reject(err));
    req.setTimeout(25000, () => {
      req.destroy();
      reject(new Error("Cloud compilation timed out after 25 seconds"));
    });
  });
}

/* ─────────────────────────────────────────────
   Utility: format a resume_documents row
───────────────────────────────────────────── */
function formatDoc(d) {
  return {
    _id:            d.id,
    userId:         d.user_id,
    title:          d.title,
    latexSource:    d.latex_source,
    compiledPdfUrl: d.compiled_pdf_url,
    template:       d.template,
    isPublic:       d.is_public,
    shareToken:     d.share_token,
    tags:           d.tags,
    createdAt:      d.created_at,
    updatedAt:      d.updated_at,
  };
}

/* ─────────────────────────────────────────────
   GET /api/editor/templates
───────────────────────────────────────────── */
function getTemplatesHandler(req, res) {
  res.json({
    templates: [
      { key: "modern",     label: "Modern",      description: "Clean, balanced layout with section dividers.",            icon: "🎨", badge: "Most Popular" },
      { key: "minimal",    label: "Minimal",     description: "Ultra-compact single-page. Every word counts.",           icon: "✦", badge: null },
      { key: "executive",  label: "Executive",   description: "Senior/management style with achievement focus.",         icon: "💼", badge: "Leadership" },
      { key: "ats_compact",label: "ATS Compact", description: "Maximum keyword density for ATS scanners.",              icon: "🤖", badge: "ATS Optimized" },
      { key: "developer",  label: "Developer",   description: "Technical resume with skills matrix and projects.",      icon: "⚡", badge: "For Engineers" },
    ],
  });
}

/* ─────────────────────────────────────────────
   GET /api/editor/documents
───────────────────────────────────────────── */
async function getDocuments(req, res) {
  try {
    const { data, error } = await supabase
      .from("resume_documents")
      .select("*")
      .eq("user_id", req.user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    res.json({ documents: data.map(formatDoc) });
  } catch (err) {
    console.error("[editorController] GET /documents error:", err.message);
    res.status(500).json({ message: "Failed to fetch documents" });
  }
}

/* ─────────────────────────────────────────────
   POST /api/editor/documents
───────────────────────────────────────────── */
async function createDocument(req, res) {
  try {
    const { title, template } = req.body;
    const { data, error } = await supabase
      .from("resume_documents")
      .insert({
        user_id:      req.user.id,
        title:        title || "Untitled Resume",
        template:     template || "modern",
        latex_source: getTemplate(template || "modern"),
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ document: formatDoc(data) });
  } catch (err) {
    console.error("[editorController] POST /documents error:", err.message);
    res.status(500).json({ message: "Failed to create document" });
  }
}

/* ─────────────────────────────────────────────
   POST /api/editor/generate
───────────────────────────────────────────── */
async function generateLatex(req, res) {
  try {
    const { resumeText, jobDescription, title } = req.body;
    if (!resumeText) return res.status(400).json({ message: "resumeText is required" });

    const latexSource = await generateLatexResume(resumeText, jobDescription || "");

    const { data, error } = await supabase
      .from("resume_documents")
      .insert({
        user_id:      req.user.id,
        title:        title || "AI Tailored Resume",
        template:     "ai_tailored",
        latex_source: latexSource,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ document: formatDoc(data) });
  } catch (err) {
    console.error("[editorController] /generate error:", err.message);
    res.status(500).json({ message: "Failed to generate LaTeX resume" });
  }
}

/* ─────────────────────────────────────────────
   GET /api/editor/documents/:id
───────────────────────────────────────────── */
async function getDocument(req, res) {
  try {
    const { data, error } = await supabase
      .from("resume_documents")
      .select("*")
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .single();

    if (error || !data) return res.status(404).json({ message: "Document not found" });
    res.json({ document: formatDoc(data) });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch document" });
  }
}

/* ─────────────────────────────────────────────
   PUT /api/editor/documents/:id
───────────────────────────────────────────── */
async function updateDocument(req, res) {
  try {
    const { title, latexSource, tags } = req.body;
    const updates = { updated_at: new Date().toISOString() };

    if (title       !== undefined) updates.title        = title;
    if (latexSource !== undefined) updates.latex_source = latexSource;
    if (tags        !== undefined) updates.tags         = tags;

    const { data, error } = await supabase
      .from("resume_documents")
      .update(updates)
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .select()
      .single();

    if (error || !data) return res.status(404).json({ message: "Document not found" });
    res.json({ document: formatDoc(data) });
  } catch (err) {
    res.status(500).json({ message: "Failed to update document" });
  }
}

/* ─────────────────────────────────────────────
   DELETE /api/editor/documents/:id
───────────────────────────────────────────── */
async function deleteDocument(req, res) {
  try {
    const { error } = await supabase
      .from("resume_documents")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.user.id);

    if (error) throw error;
    res.json({ message: "Document deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete document" });
  }
}

/* ─────────────────────────────────────────────
   POST /api/editor/documents/:id/compile
───────────────────────────────────────────── */
async function compileDocument(req, res) {
  try {
    const { data: doc, error } = await supabase
      .from("resume_documents")
      .select("*")
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .single();

    if (error || !doc) return res.status(404).json({ message: "Document not found" });

    const source  = req.body.latexSource || doc.latex_source;
    const tmpDir  = path.join(__dirname, "../../uploads/tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const texFile = path.join(tmpDir, `${doc.id}.tex`);
    const pdfFile = path.join(tmpDir, `${doc.id}.pdf`);
    fs.writeFileSync(texFile, source, "utf8");

    // Attempt 1: Local pdflatex binary
    execFile(
      "pdflatex",
      ["-interaction=nonstopmode", "-output-directory", tmpDir, texFile],
      { timeout: 30000 },
      async (err, stdout, stderr) => {
        if (!err && fs.existsSync(pdfFile)) {
          const pdfUrl = `/uploads/tmp/${doc.id}.pdf`;
          await supabase
            .from("resume_documents")
            .update({ compiled_pdf_url: pdfUrl, updated_at: new Date().toISOString() })
            .eq("id", doc.id);
          return res.json({ message: "Compiled successfully", pdfUrl });
        }

        try {
          console.log("[editorController] Local pdflatex binary unavailable or failed. Using Cloud TeX Engine fallback...");
          const pdfBuffer = await compileOnlineLatex(source);
          fs.writeFileSync(pdfFile, pdfBuffer);

          const pdfUrl = `/uploads/tmp/${doc.id}.pdf`;
          await supabase
            .from("resume_documents")
            .update({ compiled_pdf_url: pdfUrl, updated_at: new Date().toISOString() })
            .eq("id", doc.id);

          return res.json({ message: "Compiled successfully via Cloud TeX Engine", pdfUrl });
        } catch (cloudErr) {
          const errorText = typeof cloudErr.message === "string" ? cloudErr.message : (typeof stderr === "string" ? stderr : "LaTeX compilation error");
          return res.status(422).json({
            message: errorText || "LaTeX compilation failed. Check LaTeX syntax.",
            error: errorText,
          });
        }
      }
    );
  } catch (err) {
    console.error("[editorController] compile error:", err.message);
    res.status(500).json({ message: "Compilation error" });
  }
}

/* ─────────────────────────────────────────────
   POST /api/editor/documents/:id/versions
───────────────────────────────────────────── */
async function saveVersion(req, res) {
  try {
    const { data: doc } = await supabase
      .from("resume_documents")
      .select("id, latex_source, compiled_pdf_url")
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .single();

    if (!doc) return res.status(404).json({ message: "Document not found" });

    const { data: version, error } = await supabase
      .from("resume_versions")
      .insert({
        document_id:  doc.id,
        user_id:      req.user.id,
        latex_source: doc.latex_source,
        pdf_url:      doc.compiled_pdf_url || null,
        label:        req.body.label || `Snapshot ${new Date().toLocaleDateString()}`,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "Version saved",
      version: {
        _id:         version.id,
        label:       version.label,
        latexSource: version.latex_source,
        pdfUrl:      version.pdf_url,
        createdAt:   version.created_at,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to save version" });
  }
}

/* ─────────────────────────────────────────────
   GET /api/editor/documents/:id/versions
───────────────────────────────────────────── */
async function getVersions(req, res) {
  try {
    const { data, error } = await supabase
      .from("resume_versions")
      .select("*")
      .eq("document_id", req.params.id)
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const versions = data.map(v => ({
      _id:         v.id,
      label:       v.label,
      latexSource: v.latex_source,
      pdfUrl:      v.pdf_url,
      createdAt:   v.created_at,
    }));

    res.json({ count: versions.length, versions });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch versions" });
  }
}

/* ─────────────────────────────────────────────
   GET /api/editor/share/:token  (public — no auth)
───────────────────────────────────────────── */
async function getSharedDocument(req, res) {
  try {
    const { data, error } = await supabase
      .from("resume_documents")
      .select("title, compiled_pdf_url")
      .eq("share_token", req.params.token)
      .eq("is_public", true)
      .single();

    if (error || !data)
      return res.status(404).json({ message: "Shared document not found" });

    res.json({ title: data.title, compiledPdfUrl: data.compiled_pdf_url });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch shared document" });
  }
}

/* ─────────────────────────────────────────────
   PUT /api/editor/documents/:id/share
───────────────────────────────────────────── */
async function updateSharing(req, res) {
  try {
    const { isPublic } = req.body;
    const { data, error } = await supabase
      .from("resume_documents")
      .update({ is_public: isPublic, updated_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .select("is_public, share_token")
      .single();

    if (error || !data) return res.status(404).json({ message: "Document not found" });

    res.json({
      message:   isPublic ? "Document is now public" : "Document is now private",
      shareLink: isPublic ? `/api/editor/share/${data.share_token}` : null,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update sharing" });
  }
}

/* ─────────────────────────────────────────────
   LaTeX Templates
───────────────────────────────────────────── */
function getTemplate(name) {
  const templates = {

    // ── Modern ──────────────────────────────────
    modern: `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=0.9in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\usepackage[T1]{fontenc}
\\usepackage{enumitem}
\\setlength{\\parskip}{0pt}
\\pagestyle{empty}
\\begin{document}

\\begin{center}
  {\\LARGE \\textbf{Your Name}} \\\\[6pt]
  {\\small your.email@example.com $\\cdot$ +1 (555) 000-0000 $\\cdot$
  \\href{https://linkedin.com/in/yourprofile}{LinkedIn} $\\cdot$
  \\href{https://github.com/yourusername}{GitHub}}
\\end{center}

\\vspace{-4pt}\\hrule\\vspace{8pt}

\\section*{Experience}
\\textbf{Software Engineer} --- \\textit{Company Name} \\hfill Jan 2023 -- Present \\\\
\\begin{itemize}[leftmargin=*,nosep]
  \\item Architected feature X that improved system performance by 40\\%, reducing latency by 200ms
  \\item Led a cross-functional team of 5 engineers to deliver project Y on schedule
  \\item Reduced deployment time by 60\\% by implementing CI/CD pipeline with GitHub Actions
\\end{itemize}

\\vspace{6pt}
\\textbf{Junior Developer} --- \\textit{Previous Company} \\hfill Jun 2021 -- Dec 2022 \\\\
\\begin{itemize}[leftmargin=*,nosep]
  \\item Developed RESTful APIs serving 10,000+ daily active users
  \\item Optimized database queries resulting in 35\\% reduction in load times
\\end{itemize}

\\section*{Education}
\\textbf{B.Tech Computer Science} --- University Name \\hfill 2019 -- 2023 \\\\
GPA: 3.8/4.0 \\quad Relevant Coursework: Data Structures, Algorithms, Machine Learning

\\section*{Technical Skills}
\\textbf{Languages:} JavaScript, Python, Java, TypeScript \\\\
\\textbf{Frameworks:} React, Node.js, Express, FastAPI \\\\
\\textbf{Tools:} Git, Docker, AWS, PostgreSQL, Redis

\\section*{Projects}
\\textbf{Project Name} | \\textit{React, Node.js, PostgreSQL} \\hfill \\href{https://github.com/}{GitHub}\\\\
\\begin{itemize}[leftmargin=*,nosep]
  \\item Built full-stack web application serving 500+ users with 99.9\\% uptime
\\end{itemize}

\\end{document}`,

    // ── Minimal ──────────────────────────────────
    minimal: `\\documentclass[10pt]{article}
\\usepackage[margin=0.6in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\pagestyle{empty}
\\begin{document}
{\\large \\textbf{Your Name}} \\hfill \\href{mailto:your@email.com}{your@email.com} | +1 (555) 000-0000
\\vspace{2pt}\\hrule\\vspace{6pt}
\\textbf{Skills:} JavaScript, Python, React, Node.js, SQL, Git \\\\
\\textbf{Experience:} Software Engineer, Company (Jan 2023--Present): Built X, improved Y by Z\\%. \\\\
\\textbf{Education:} B.S. Computer Science, University (2023)
\\end{document}`,

    // ── Executive ─────────────────────────────────
    executive: `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\usepackage[T1]{fontenc}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\definecolor{accentblue}{RGB}{30,64,175}
\\pagestyle{empty}
\\begin{document}

\\begin{center}
  {\\Huge \\textbf{Your Full Name}} \\\\[6pt]
  {\\large \\textit{Senior Engineering Leader}} \\\\[4pt]
  {\\small \\textcolor{accentblue}{your.email@example.com} $\\cdot$ +1 (555) 000-0000 $\\cdot$ City, State} \\\\
  {\\small \\href{https://linkedin.com/in/you}{linkedin.com/in/you} $\\cdot$ \\href{https://yoursite.com}{yoursite.com}}
\\end{center}

\\vspace{-4pt}\\noindent\\rule{\\linewidth}{0.6pt}\\vspace{8pt}

\\section*{Executive Summary}
Visionary technology leader with 10+ years building high-performance engineering teams and delivering
mission-critical products. Track record of scaling organizations from startup to enterprise, driving
revenue growth, and building cultures of technical excellence.

\\section*{Professional Experience}
\\textbf{VP of Engineering} $\\cdot$ \\textit{Tech Company, Inc.} \\hfill 2020 -- Present \\\\
\\begin{itemize}[leftmargin=*,nosep]
  \\item Grew engineering org from 12 to 85 engineers across 6 product teams
  \\item Delivered \\$12M product roadmap on time and 8\\% under budget
  \\item Reduced system downtime by 94\\% through SRE practices and chaos engineering
  \\item Instituted quarterly OKRs improving team velocity by 40\\%
\\end{itemize}

\\vspace{6pt}
\\textbf{Senior Engineering Manager} $\\cdot$ \\textit{Previous Corp} \\hfill 2017 -- 2020 \\\\
\\begin{itemize}[leftmargin=*,nosep]
  \\item Managed 3 cross-functional teams of 25 engineers and 4 product managers
  \\item Spearheaded migration to microservices reducing deployment time by 70\\%
\\end{itemize}

\\section*{Education}
\\textbf{M.S. Computer Science} --- Stanford University \\hfill 2013 \\\\
\\textbf{B.S. Electrical Engineering} --- MIT \\hfill 2011

\\section*{Core Competencies}
Engineering Leadership $\\cdot$ P\\&L Ownership $\\cdot$ Organizational Scaling $\\cdot$ System Architecture \\\\
Agile / OKRs $\\cdot$ Talent Acquisition $\\cdot$ Strategic Planning $\\cdot$ Cloud Infrastructure

\\end{document}`,

    // ── ATS Compact ───────────────────────────────
    ats_compact: `\\documentclass[10pt,a4paper]{article}
\\usepackage[margin=0.65in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\setlist[itemize]{leftmargin=*,nosep,topsep=2pt}
\\pagestyle{empty}
\\begin{document}

\\begin{center}
{\\LARGE \\textbf{YOUR NAME}} \\\\
\\vspace{2pt}
your@email.com $\\cdot$ +1 (555) 000-0000 $\\cdot$ LinkedIn: linkedin.com/in/you $\\cdot$ GitHub: github.com/you
\\end{center}
\\vspace{-2pt}\\hrule\\vspace{4pt}

\\noindent\\textbf{SUMMARY} \\\\
Software Engineer with 4 years of experience in JavaScript, Python, React, Node.js, AWS, Docker, and PostgreSQL.
Strong background in REST API development, CI/CD pipelines, microservices, and Agile methodologies.

\\vspace{4pt}
\\noindent\\textbf{TECHNICAL SKILLS} \\\\
Languages: JavaScript, TypeScript, Python, Java, SQL, Bash \\\\
Frameworks: React, Node.js, Express, Django, FastAPI, Spring Boot \\\\
Cloud \\& DevOps: AWS (EC2, S3, Lambda), Docker, Kubernetes, Jenkins, GitHub Actions \\\\
Databases: PostgreSQL, MySQL, MongoDB, Redis \\\\
Tools: Git, Jira, Figma, Postman

\\vspace{4pt}
\\noindent\\textbf{PROFESSIONAL EXPERIENCE}

\\textbf{Software Engineer II} --- Company Name \\hfill January 2022 -- Present
\\begin{itemize}
  \\item Developed React and Node.js full-stack features increasing user retention by 25\\%
  \\item Designed PostgreSQL schemas and REST APIs handling 1M+ daily requests
  \\item Deployed microservices on AWS using Docker and Kubernetes, achieving 99.95\\% uptime
  \\item Implemented CI/CD pipeline reducing release cycle from 2 weeks to 2 days
\\end{itemize}

\\vspace{2pt}
\\textbf{Software Engineer I} --- Previous Company \\hfill June 2020 -- December 2021
\\begin{itemize}
  \\item Built RESTful APIs with Django and FastAPI for mobile and web clients
  \\item Optimized slow SQL queries improving performance by 60\\%
\\end{itemize}

\\vspace{4pt}
\\noindent\\textbf{EDUCATION} \\\\
\\textbf{Bachelor of Technology, Computer Science} --- University Name \\hfill 2016 -- 2020

\\vspace{4pt}
\\noindent\\textbf{PROJECTS} \\\\
\\textbf{Open Source Tool} (GitHub: 1.2k stars): Python CLI for automated code review; 500+ weekly downloads.

\\vspace{4pt}
\\noindent\\textbf{CERTIFICATIONS} \\\\
AWS Certified Solutions Architect (2023) $\\cdot$ Google Cloud Professional Data Engineer (2022)

\\end{document}`,

    // ── Developer ─────────────────────────────────
    developer: `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=0.8in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\usepackage[T1]{fontenc}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\definecolor{codegray}{RGB}{100,100,120}
\\definecolor{accentgreen}{RGB}{0,150,100}
\\pagestyle{empty}
\\begin{document}

\\begin{center}
  {\\LARGE \\textbf{Your Name}} \\\\[4pt]
  {\\textcolor{codegray}{\\small
    your@email.com $\\cdot$ +1 (555) 000-0000 $\\cdot$
    \\href{https://github.com/you}{\\textcolor{accentgreen}{github.com/you}} $\\cdot$
    \\href{https://yourportfolio.com}{\\textcolor{accentgreen}{portfolio.com}}
  }}
\\end{center}

\\hrule\\vspace{6pt}

\\section*{Technical Skills}
\\begin{tabular}{ll}
  \\textbf{Languages}   & JavaScript/TypeScript, Python, Go, Rust, SQL \\\\
  \\textbf{Frontend}    & React, Next.js, Vue, Tailwind CSS, WebAssembly \\\\
  \\textbf{Backend}     & Node.js, FastAPI, GraphQL, gRPC, WebSockets \\\\
  \\textbf{DevOps}      & Docker, Kubernetes, AWS, Terraform, GitHub Actions \\\\
  \\textbf{Databases}   & PostgreSQL, MongoDB, Redis, Elasticsearch \\\\
  \\textbf{AI/ML}       & PyTorch, LangChain, OpenAI API, Hugging Face \\\\
\\end{tabular}

\\section*{Experience}
\\textbf{Senior Software Engineer} $\\cdot$ \\textit{Tech Startup} \\hfill Jan 2023 -- Present \\\\
\\textit{Stack: React $\\cdot$ Node.js $\\cdot$ PostgreSQL $\\cdot$ AWS $\\cdot$ Docker}
\\begin{itemize}[leftmargin=*,nosep]
  \\item Built real-time collaboration feature using WebSockets and Redis Pub/Sub for 50k+ users
  \\item Designed and implemented GraphQL API reducing frontend data-fetching complexity by 60\\%
  \\item Open-sourced internal tooling library (2.1k GitHub stars, 300+ weekly downloads)
  \\item Mentored 4 junior engineers; established team coding standards and PR review guidelines
\\end{itemize}

\\vspace{6pt}
\\textbf{Software Engineer} $\\cdot$ \\textit{Product Company} \\hfill Jul 2021 -- Dec 2022 \\\\
\\textit{Stack: Vue.js $\\cdot$ Python $\\cdot$ FastAPI $\\cdot$ MongoDB}
\\begin{itemize}[leftmargin=*,nosep]
  \\item Developed ML-powered recommendation engine improving CTR by 18\\%
  \\item Reduced API response time from 800ms to 120ms via caching and query optimization
\\end{itemize}

\\section*{Open Source \\& Projects}
\\textbf{\\href{https://github.com/you/project}{Awesome CLI Tool}} | \\textit{Go, Docker} \\hfill \\textcolor{accentgreen}{⭐ 1.8k stars}
\\begin{itemize}[leftmargin=*,nosep]
  \\item Developer productivity tool automating boilerplate generation; 2,000+ downloads/month
\\end{itemize}

\\textbf{\\href{https://github.com/you/ml-project}{ML Experiments}} | \\textit{Python, PyTorch, HuggingFace}
\\begin{itemize}[leftmargin=*,nosep]
  \\item Fine-tuned LLaMA 2 for domain-specific Q\\&A; published findings on arXiv
\\end{itemize}

\\section*{Education}
\\textbf{B.Tech Computer Science} --- University Name \\hfill 2017 -- 2021

\\section*{Certifications \\& Achievements}
AWS Solutions Architect $\\cdot$ Kubernetes CKA $\\cdot$ Google Cloud Professional $\\cdot$ HackerRank 5-Star (Problem Solving)

\\end{document}`,

  };
  return templates[name] || templates.modern;
}

module.exports = {
  getTemplatesHandler, getDocuments, createDocument, generateLatex,
  getDocument, updateDocument, deleteDocument, compileDocument,
  saveVersion, getVersions, getSharedDocument, updateSharing,
};
