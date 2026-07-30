const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeWithGemini(resumeText) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are an ATS resume analyzer.

Analyze this resume and return ONLY valid JSON:

{
  "atsScore": number (0-100),
  "skills": [list of skills],
  "missingSkills": [list],
  "suggestions": [improvements],
  "jobRole": "best matching job role"
}

Resume:
${resumeText}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Gemini sometimes wraps JSON in markdown, so clean it
  const cleaned = text.replace(/```json|```/g, "").trim();

  return JSON.parse(cleaned);
}

module.exports = analyzeWithGemini;