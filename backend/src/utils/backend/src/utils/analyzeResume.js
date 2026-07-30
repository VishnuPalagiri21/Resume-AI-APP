const pdf = require("pdf-parse");

function extractSkills(text) {
  const skillsDB = [
    "Python",
    "Java",
    "JavaScript",
    "SQL",
    "React",
    "Node",
    "AI",
    "Machine Learning",
    "Deep Learning",
    "LangChain",
    "FastAPI",
  ];

  const found = skillsDB.filter((skill) =>
    text.toLowerCase().includes(skill.toLowerCase())
  );

  const missing = skillsDB.filter((skill) => !found.includes(skill));

  return { found, missing };
}

function calculateATSScore(foundSkills) {
  const maxSkills = 10;
  return Math.min(100, Math.round((foundSkills.length / maxSkills) * 100));
}

async function analyzeResume(fileBuffer) {
  const data = await pdf(fileBuffer);
  const text = data.text;

  const { found, missing } = extractSkills(text);
  const score = calculateATSScore(found);

  return {
    extractedText: text.slice(0, 500), // preview only
    matchedSkills: found,
    missingSkills: missing.slice(0, 5),
    atsScore: score,
    suggestions:
      missing.length > 0
        ? [`Improve knowledge in ${missing[0]}`]
        : ["Great profile"],
  };
}

module.exports = analyzeResume;