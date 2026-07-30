/**
 * latexLanguage.js
 * Monaco Editor — LaTeX language definition.
 * Uses valid Monarch grammar (ordered regex rules, no invalid cases keys).
 * Registers tokenizer, autocomplete snippets, hover docs, and custom theme.
 */

// ── LANGUAGE ID ───────────────────────────────────────────────────────────
export const LATEX_LANGUAGE_ID = "latex";

// ── TOKENIZER (valid Monarch grammar) ─────────────────────────────────────
// IMPORTANT: Monarch cases keys MUST be @ruleName lookups or exact strings.
// Regex strings as keys are NOT supported — use ordered regex rules instead.
export const latexTokensProvider = {
  defaultToken: "text",
  tokenPostfix: ".latex",

  tokenizer: {
    root: [
      // ── Comments ─────────────────────────────────────────────────────
      [/%.*$/, "comment"],

      // ── Math: display $$...$$ (must come before inline $ rule) ───────
      [/\$\$/, { token: "string.math.display", next: "@mathDisplay" }],

      // ── Math: inline $...$ ─────────────────────────────────────────
      [/\$/, { token: "string.math", next: "@mathInline" }],

      // ── Control sequences: \begin \end ─────────────────────────────
      [/\\(begin|end)\b/, "keyword.control"],

      // ── Structural commands ─────────────────────────────────────────
      [/\\(documentclass|usepackage|input|include)\b/, "keyword.preamble"],

      // ── Section commands ────────────────────────────────────────────
      [/\\(part|chapter|section|subsection|subsubsection|paragraph|subparagraph)\*?/, "keyword.section"],

      // ── Text formatting ──────────────────────────────────────────────
      [/\\(textbf|textit|texttt|textrm|textsc|textsl|textup|emph|underline|uline)\b/, "keyword.formatting"],

      // ── Font size ────────────────────────────────────────────────────
      [/\\(tiny|scriptsize|footnotesize|small|normalsize|large|Large|LARGE|huge|Huge)\b/, "keyword.size"],

      // ── Definition commands ──────────────────────────────────────────
      [/\\(newcommand|renewcommand|providecommand|def|let|newenvironment|renewenvironment)\b/, "keyword.define"],

      // ── Reference commands ───────────────────────────────────────────
      [/\\(label|ref|pageref|cite|bibitem|bibliography|bibliographystyle|href|url)\b/, "keyword.reference"],

      // ── List commands ────────────────────────────────────────────────
      [/\\item\b/, "keyword.list"],

      // ── Math commands ────────────────────────────────────────────────
      [/\\(frac|dfrac|tfrac|sqrt|sum|int|oint|prod|lim|infty|partial|nabla|Delta|Sigma|alpha|beta|gamma|delta|epsilon|theta|lambda|mu|pi|sigma|tau|phi|omega)\b/, "keyword.math"],

      // ── Spacing / layout ────────────────────────────────────────────
      [/\\(hfill|vfill|hspace|vspace|noindent|indent|newline|linebreak|pagebreak|newpage|clearpage|hrule|hline|cline)\b/, "keyword.spacing"],

      // ── Environment helpers ──────────────────────────────────────────
      [/\\(centering|raggedright|raggedleft|flushright|flushleft)\b/, "keyword.align"],

      // ── Page style ───────────────────────────────────────────────────
      [/\\(pagestyle|thispagestyle|pagenumbering|setcounter|addtocounter)\b/, "keyword.page"],

      // ── Any other \command ───────────────────────────────────────────
      [/\\[a-zA-Z@*]+/, "keyword"],

      // ── Backslash-backslash (line break) ────────────────────────────
      [/\\\\/, "keyword.linebreak"],

      // ── Braces ───────────────────────────────────────────────────────
      [/[{}]/, "delimiter.curly"],
      [/[\[\]]/, "delimiter.square"],
      [/[()]/, "delimiter.paren"],

      // ── Special LaTeX chars ───────────────────────────────────────────
      [/[&~^_]/, "keyword.special"],

      // ── Numbers ──────────────────────────────────────────────────────
      [/\d+(\.\d+)?/, "number"],

      // ── Strings ──────────────────────────────────────────────────────
      [/"[^"]*"/, "string"],
      [/'[^']*'/, "string"],
    ],

    // ── Display math $$...$$ ───────────────────────────────────────────
    mathDisplay: [
      [/\$\$/, { token: "string.math.display", next: "@pop" }],
      [/[^$]+/, "string.math.display"],
      [/\$/, "string.math.display"],
    ],

    // ── Inline math $...$ ──────────────────────────────────────────────
    mathInline: [
      [/\$/, { token: "string.math", next: "@pop" }],
      [/[^$\\]+/, "string.math"],
      [/\\[a-zA-Z]+/, "keyword.math"],
      [/[\\]/, "string.math"],
    ],
  },
};

// ── CUSTOM DARK THEME ──────────────────────────────────────────────────────
export const LATEX_THEME_NAME = "latex-dark";

export const latexTheme = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment",               foreground: "5c6370", fontStyle: "italic" },
    { token: "keyword",               foreground: "c4b5fd" },
    { token: "keyword.control",       foreground: "f472b6", fontStyle: "bold" },
    { token: "keyword.section",       foreground: "60a5fa", fontStyle: "bold" },
    { token: "keyword.formatting",    foreground: "a78bfa" },
    { token: "keyword.size",          foreground: "818cf8" },
    { token: "keyword.define",        foreground: "f59e0b" },
    { token: "keyword.reference",     foreground: "34d399" },
    { token: "keyword.preamble",      foreground: "818cf8", fontStyle: "bold" },
    { token: "keyword.math",          foreground: "fb923c" },
    { token: "keyword.list",          foreground: "e2e8f0", fontStyle: "bold" },
    { token: "keyword.spacing",       foreground: "94a3b8" },
    { token: "keyword.align",         foreground: "7dd3fc" },
    { token: "keyword.page",          foreground: "6b7280" },
    { token: "keyword.special",       foreground: "f87171" },
    { token: "keyword.linebreak",     foreground: "6b7280" },
    { token: "string.math",           foreground: "fbbf24" },
    { token: "string.math.display",   foreground: "fcd34d", fontStyle: "bold" },
    { token: "string",                foreground: "86efac" },
    { token: "number",                foreground: "67e8f9" },
    { token: "delimiter.curly",       foreground: "e2e8f0" },
    { token: "delimiter.square",      foreground: "a5b4fc" },
    { token: "delimiter.paren",       foreground: "94a3b8" },
    { token: "text",                  foreground: "e2e8f0" },
  ],
  colors: {
    "editor.background":                "#0d0d1a",
    "editor.foreground":                "#e2e8f0",
    "editor.lineHighlightBackground":   "#1a1a2e",
    "editor.selectionBackground":       "#3730a355",
    "editor.inactiveSelectionBackground": "#3730a322",
    "editorLineNumber.foreground":      "#3d3d5c",
    "editorLineNumber.activeForeground":"#8b5cf6",
    "editorCursor.foreground":          "#8b5cf6",
    "editorIndentGuide.background1":    "#1e1e38",
    "editorIndentGuide.activeBackground1": "#3730a3",
    "editorBracketMatch.background":    "#8b5cf622",
    "editorBracketMatch.border":        "#8b5cf6",
    "editor.findMatchBackground":       "#7c3aed44",
    "editor.findMatchHighlightBackground": "#7c3aed22",
    "editorSuggestWidget.background":   "#0f0f23",
    "editorSuggestWidget.border":       "#2d2d5c",
    "editorSuggestWidget.selectedBackground": "#1e1e3f",
    "editorWidget.background":          "#0f0f23",
    "editorWidget.border":              "#2d2d5c",
    "scrollbarSlider.background":       "#ffffff18",
    "scrollbarSlider.hoverBackground":  "#ffffff28",
    "scrollbarSlider.activeBackground": "#8b5cf644",
  },
};

// ── AUTOCOMPLETE SNIPPETS ──────────────────────────────────────────────────
export function getLatexCompletionItems(monaco, range) {
  const K = monaco.languages.CompletionItemKind;
  const R = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;

  const snippets = [
    // ── Document structure ──────────────────────────────────────────
    {
      label: "\\documentclass",
      kind: K.Keyword,
      insertText: "documentclass[${1:11pt,a4paper}]{${2:article}}",
      insertTextRules: R,
      documentation: "Set the document class",
      detail: "Document Class",
    },
    {
      label: "\\usepackage",
      kind: K.Keyword,
      insertText: "usepackage{${1:package}}",
      insertTextRules: R,
      documentation: "Import a LaTeX package",
      detail: "Package Import",
    },
    {
      label: "\\begin{document}",
      kind: K.Snippet,
      insertText: "begin{document}\n\t$0\n\\end{document}",
      insertTextRules: R,
      documentation: "Document environment wrapper",
      detail: "Environment",
    },

    // ── Resume sections ─────────────────────────────────────────────
    {
      label: "\\section*",
      kind: K.Snippet,
      insertText: "section*{${1:Section Title}}",
      insertTextRules: R,
      documentation: "Unnumbered section (standard for resumes)",
      detail: "Resume Section",
    },
    {
      label: "\\subsection*",
      kind: K.Snippet,
      insertText: "subsection*{${1:Subsection}}",
      insertTextRules: R,
      documentation: "Unnumbered subsection",
      detail: "Resume Subsection",
    },

    // ── Environments ────────────────────────────────────────────────
    {
      label: "\\begin{itemize}",
      kind: K.Snippet,
      insertText: "begin{itemize}[leftmargin=*,nosep]\n\t\\item ${1:First item}\n\t\\item ${2:Second item}\n\\end{itemize}",
      insertTextRules: R,
      documentation: "Bullet list (ATS-friendly with enumitem)",
      detail: "Environment",
    },
    {
      label: "\\begin{enumerate}",
      kind: K.Snippet,
      insertText: "begin{enumerate}\n\t\\item ${1:First}\n\t\\item ${2:Second}\n\\end{enumerate}",
      insertTextRules: R,
      documentation: "Numbered list",
      detail: "Environment",
    },
    {
      label: "\\begin{center}",
      kind: K.Snippet,
      insertText: "begin{center}\n\t$0\n\\end{center}",
      insertTextRules: R,
      documentation: "Centered content",
      detail: "Environment",
    },
    {
      label: "\\begin{tabular}",
      kind: K.Snippet,
      insertText: "begin{tabular}{${1:ll}}\n\t${2:Col1} & ${3:Col2} \\\\\\\\\n\\end{tabular}",
      insertTextRules: R,
      documentation: "Table environment",
      detail: "Environment",
    },
    {
      label: "\\begin{minipage}",
      kind: K.Snippet,
      insertText: "begin{minipage}{${1:0.5\\textwidth}}\n\t$0\n\\end{minipage}",
      insertTextRules: R,
      documentation: "Minipage for multi-column layouts",
      detail: "Environment",
    },
    {
      label: "\\begin{multicols}",
      kind: K.Snippet,
      insertText: "begin{multicols}{${1:2}}\n\t$0\n\\end{multicols}",
      insertTextRules: R,
      documentation: "Multi-column layout (requires multicol package)",
      detail: "Environment",
    },

    // ── Text formatting ─────────────────────────────────────────────
    {
      label: "\\textbf",
      kind: K.Function,
      insertText: "textbf{${1:bold text}}",
      insertTextRules: R,
      documentation: "Bold text",
      detail: "Formatting",
    },
    {
      label: "\\textit",
      kind: K.Function,
      insertText: "textit{${1:italic text}}",
      insertTextRules: R,
      documentation: "Italic text",
      detail: "Formatting",
    },
    {
      label: "\\emph",
      kind: K.Function,
      insertText: "emph{${1:emphasized}}",
      insertTextRules: R,
      documentation: "Emphasized text",
      detail: "Formatting",
    },
    {
      label: "\\underline",
      kind: K.Function,
      insertText: "underline{${1:text}}",
      insertTextRules: R,
      documentation: "Underlined text",
      detail: "Formatting",
    },
    {
      label: "\\texttt",
      kind: K.Function,
      insertText: "texttt{${1:monospace}}",
      insertTextRules: R,
      documentation: "Typewriter (monospace) font",
      detail: "Formatting",
    },
    {
      label: "\\textsc",
      kind: K.Function,
      insertText: "textsc{${1:small caps}}",
      insertTextRules: R,
      documentation: "Small capitals",
      detail: "Formatting",
    },
    {
      label: "\\LARGE",
      kind: K.Keyword,
      insertText: "{\\LARGE ${1:large text}}",
      insertTextRules: R,
      documentation: "Very large font — good for name headers",
      detail: "Font Size",
    },
    {
      label: "\\Large",
      kind: K.Keyword,
      insertText: "{\\Large ${1:large text}}",
      insertTextRules: R,
      documentation: "Large font size",
      detail: "Font Size",
    },
    {
      label: "\\small",
      kind: K.Keyword,
      insertText: "{\\small ${1:text}}",
      insertTextRules: R,
      documentation: "Small font size",
      detail: "Font Size",
    },

    // ── Spacing & layout ────────────────────────────────────────────
    {
      label: "\\hfill",
      kind: K.Keyword,
      insertText: "hfill",
      documentation: "Push content to right margin",
      detail: "Spacing",
    },
    {
      label: "\\vspace",
      kind: K.Function,
      insertText: "vspace{${1:6pt}}",
      insertTextRules: R,
      documentation: "Vertical space",
      detail: "Spacing",
    },
    {
      label: "\\hspace",
      kind: K.Function,
      insertText: "hspace{${1:12pt}}",
      insertTextRules: R,
      documentation: "Horizontal space",
      detail: "Spacing",
    },
    {
      label: "\\hrule",
      kind: K.Keyword,
      insertText: "hrule",
      documentation: "Full-width horizontal rule",
      detail: "Decoration",
    },
    {
      label: "\\noindent",
      kind: K.Keyword,
      insertText: "noindent",
      documentation: "Remove paragraph indentation",
      detail: "Spacing",
    },
    {
      label: "\\\\ line break",
      kind: K.Keyword,
      insertText: "\\\\[${1:4pt}]",
      insertTextRules: R,
      documentation: "Line break with optional spacing",
      detail: "Line Break",
    },

    // ── Common packages ─────────────────────────────────────────────
    {
      label: "geometry package",
      kind: K.Module,
      insertText: "usepackage[margin=${1:1in}]{geometry}",
      insertTextRules: R,
      documentation: "Set page margins",
      detail: "Package",
    },
    {
      label: "hyperref package",
      kind: K.Module,
      insertText: "usepackage[hidelinks]{hyperref}",
      insertTextRules: R,
      documentation: "Hyperlinks without colored boxes",
      detail: "Package",
    },
    {
      label: "enumitem package",
      kind: K.Module,
      insertText: "usepackage{enumitem}",
      documentation: "Control list spacing",
      detail: "Package",
    },
    {
      label: "fontenc package",
      kind: K.Module,
      insertText: "usepackage[T1]{fontenc}",
      documentation: "Font encoding for better PDF output",
      detail: "Package",
    },
    {
      label: "xcolor package",
      kind: K.Module,
      insertText: "usepackage{xcolor}",
      documentation: "Color support",
      detail: "Package",
    },

    // ── Resume snippets ─────────────────────────────────────────────
    {
      label: "resume-header",
      kind: K.Snippet,
      insertText: [
        "begin{center}",
        "\t{\\LARGE \\textbf{${1:Your Name}}} \\\\[4pt]",
        "\t{\\small ${2:email@example.com} $\\cdot$ ${3:+1 (555) 000-0000} $\\cdot$",
        "\t\\href{${4:https://linkedin.com/in/you}}{LinkedIn} $\\cdot$",
        "\t\\href{${5:https://github.com/you}}{GitHub}}",
        "\\end{center}",
      ].join("\n"),
      insertTextRules: R,
      documentation: "Resume header with name and contact info",
      detail: "Resume Snippet",
    },
    {
      label: "resume-experience",
      kind: K.Snippet,
      insertText: [
        "section*{Experience}",
        "\\textbf{${1:Job Title}} --- \\textit{${2:Company}} \\hfill ${3:Jan 2023} -- ${4:Present} \\\\",
        "\\begin{itemize}[leftmargin=*,nosep]",
        "\t\\item ${5:Achieved X resulting in Y improvement by Z\\%}",
        "\t\\item ${6:Led team of N engineers on project}",
        "\\end{itemize}",
      ].join("\n"),
      insertTextRules: R,
      documentation: "Experience entry with bullet points",
      detail: "Resume Snippet",
    },
    {
      label: "resume-education",
      kind: K.Snippet,
      insertText: [
        "section*{Education}",
        "\\textbf{${1:B.Tech Computer Science}} --- ${2:University} \\hfill ${3:2019} -- ${4:2023} \\\\",
        "GPA: ${5:3.8/4.0}",
      ].join("\n"),
      insertTextRules: R,
      documentation: "Education section entry",
      detail: "Resume Snippet",
    },
    {
      label: "resume-skills",
      kind: K.Snippet,
      insertText: [
        "section*{Technical Skills}",
        "\\textbf{Languages:} ${1:Python, JavaScript, Java} \\\\",
        "\\textbf{Frameworks:} ${2:React, Node.js, FastAPI} \\\\",
        "\\textbf{Tools:} ${3:Git, Docker, AWS, PostgreSQL}",
      ].join("\n"),
      insertTextRules: R,
      documentation: "Skills section with categories",
      detail: "Resume Snippet",
    },
    {
      label: "resume-project",
      kind: K.Snippet,
      insertText: [
        "textbf{${1:Project Name}} | \\textit{${2:Tech Stack}} \\hfill \\href{${3:https://github.com/}}{GitHub} \\\\",
        "\\begin{itemize}[leftmargin=*,nosep]",
        "\t\\item ${4:Built X that solved Y for Z users}",
        "\\end{itemize}",
      ].join("\n"),
      insertTextRules: R,
      documentation: "Project entry with tech stack and link",
      detail: "Resume Snippet",
    },

    // ── Common commands ─────────────────────────────────────────────
    {
      label: "\\href",
      kind: K.Function,
      insertText: "href{${1:https://example.com}}{${2:Link Text}}",
      insertTextRules: R,
      documentation: "Hyperlink (requires hyperref)",
      detail: "Link",
    },
    {
      label: "\\item",
      kind: K.Keyword,
      insertText: "item ${1:bullet point}",
      insertTextRules: R,
      documentation: "List item",
      detail: "List",
    },
    {
      label: "\\cdot",
      kind: K.Keyword,
      insertText: "cdot",
      documentation: "Middle dot separator",
      detail: "Symbol",
    },
    {
      label: "\\pagestyle{empty}",
      kind: K.Keyword,
      insertText: "pagestyle{empty}",
      documentation: "Remove page numbers",
      detail: "Page Style",
    },
    {
      label: "\\definecolor",
      kind: K.Function,
      insertText: "definecolor{${1:accentcolor}}{RGB}{${2:30,64,175}}",
      insertTextRules: R,
      documentation: "Define a custom color (requires xcolor)",
      detail: "Color",
    },
    {
      label: "\\textcolor",
      kind: K.Function,
      insertText: "textcolor{${1:accentcolor}}{${2:text}}",
      insertTextRules: R,
      documentation: "Colored text (requires xcolor)",
      detail: "Color",
    },
  ];

  // All completions trigger after backslash — strip leading \\ from insertText
  return snippets.map((s) => ({
    ...s,
    range,
    insertText: s.insertText.startsWith("\\")
      ? s.insertText.slice(1)
      : s.insertText,
  }));
}

// ── HOVER DOCUMENTATION ────────────────────────────────────────────────────
const HOVER_DOCS = {
  "\\begin":           "Starts a LaTeX environment. Must be paired with \\\\end{name}.",
  "\\end":             "Closes a LaTeX environment. Must match \\\\begin{name}.",
  "\\section":         "Numbered section heading.",
  "\\section*":        "Unnumbered section heading — standard for resumes.",
  "\\subsection":      "Numbered subsection.",
  "\\subsection*":     "Unnumbered subsection.",
  "\\textbf":          "Renders text in **bold** weight.",
  "\\textit":          "Renders text in *italic* style.",
  "\\emph":            "Emphasized text — toggles italic.",
  "\\texttt":          "Typewriter (monospace) font.",
  "\\textsc":          "Small capitals font.",
  "\\hfill":           "Elastic horizontal fill — pushes content to the right margin.",
  "\\hrule":           "Full-width horizontal rule (divider line).",
  "\\vspace":          "Vertical space. Example: \\\\vspace{6pt}",
  "\\hspace":          "Horizontal space. Example: \\\\hspace{12pt}",
  "\\noindent":        "Suppress paragraph indentation.",
  "\\item":            "List item inside itemize, enumerate, or description.",
  "\\href":            "Hyperlink: \\\\href{URL}{display text}. Requires hyperref.",
  "\\cdot":            "Centered dot (·) — common contact separator.",
  "\\usepackage":      "Import a LaTeX package. Example: \\\\usepackage[margin=1in]{geometry}",
  "\\documentclass":   "Set document type. Example: \\\\documentclass[11pt,a4paper]{article}",
  "\\newcommand":      "Define a custom command.",
  "\\pagestyle":       "Set page style. \\\\pagestyle{empty} removes page numbers.",
  "\\definecolor":     "Define a color (requires xcolor). Example: \\\\definecolor{mycolor}{RGB}{30,64,175}",
  "\\textcolor":       "Color text (requires xcolor). Example: \\\\textcolor{mycolor}{text}",
  "\\frac":            "Fraction: \\\\frac{numerator}{denominator}",
};

export function getLatexHoverProvider() {
  return {
    provideHover(model, position) {
      const lineContent = model.getLineContent(position.lineNumber);
      const col = position.column - 1; // 0-indexed

      // Walk backwards to find the start of a \command
      let start = col;
      while (start > 0 && lineContent[start - 1] !== "\\") start--;
      if (start === 0 && lineContent[0] !== "\\") return null;

      const backslashPos = start - 1;
      if (backslashPos < 0 || lineContent[backslashPos] !== "\\") return null;

      // Walk forwards to find end of command
      let end = col;
      while (end < lineContent.length && /[a-zA-Z*]/.test(lineContent[end])) end++;

      const command = "\\" + lineContent.slice(start, end);
      const doc = HOVER_DOCS[command];
      if (!doc) return null;

      return {
        contents: [
          { value: `**${command}**` },
          { value: doc },
        ],
      };
    },
  };
}

// ── REGISTER EVERYTHING WITH MONACO ───────────────────────────────────────
export function registerLatexLanguage(monaco) {
  try {
    // Check if already registered
    const langs = monaco.languages.getLanguages ? monaco.languages.getLanguages() : [];
    const alreadyRegistered = langs.some((l) => l.id === LATEX_LANGUAGE_ID);

    if (!alreadyRegistered) {
      monaco.languages.register({ id: LATEX_LANGUAGE_ID });
    }

    // Always (re)set the tokenizer and providers — safe to call multiple times
    monaco.languages.setMonarchTokensProvider(LATEX_LANGUAGE_ID, latexTokensProvider);

    monaco.languages.registerCompletionItemProvider(LATEX_LANGUAGE_ID, {
      triggerCharacters: ["\\"],
      provideCompletionItems(model, position) {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber:   position.lineNumber,
          startColumn:     word.startColumn,
          endColumn:       word.endColumn,
        };
        return { suggestions: getLatexCompletionItems(monaco, range) };
      },
    });

    monaco.languages.registerHoverProvider(LATEX_LANGUAGE_ID, getLatexHoverProvider());

    monaco.editor.defineTheme(LATEX_THEME_NAME, latexTheme);

  } catch (err) {
    // Gracefully degrade — log but don't crash the app
    console.warn("[latexLanguage] Registration error (non-fatal):", err?.message || err);
  }
}
