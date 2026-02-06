import dotenv from 'dotenv';
dotenv.config(); // Load .env file

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Init AI with robust key check
const API_KEY = (process.env.GEMINI_API_KEY || "").trim();
console.log("DEBUG: Key loaded (length):", API_KEY.length);

const genAI = new GoogleGenerativeAI(API_KEY);

// List of fallback models (Strict Mode: User Request)
const MODELS = [
  "gemini-2.5-flash"
];
console.log("DEBUG: Strict Mode - Loaded Models:", MODELS);

// Init default model
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Helper to remove Markdown formatting from JSON response
const cleanJson = (text) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

// Helper for rate limits & model fallbacks
const generateWithRetry = async (currentModel, prompt, retries = 5) => {
  let modelToUse = currentModel;

  // Strategy: Try the current model. If it fails with 404 or 429, switch to next fallback.
  let queue = [modelToUse.model];
  for (const m of MODELS) {
    if (!queue.includes(m)) queue.push(m);
  }

  for (const modelName of queue) {
    console.log(`Trying model: ${modelName}...`);
    const activeModel = genAI.getGenerativeModel({ model: modelName });

    try {
      return await activeModel.generateContent(prompt);
    } catch (error) {
      console.warn(`Model ${modelName} failed: ${error.message}`);

      const isRateLimit = error.message.includes("429") || error.message.includes("quota") || error.message.includes("retry");
      const isNotFound = error.message.includes("404") || error.message.includes("not found");

      if (isRateLimit || isNotFound) {
        console.log(`Switching to next model due to failure...`);
        continue;
      }

      console.log("Unknown error, trying next model just in case...");
      continue;
    }
  }

  throw new Error("All models failed after fallback attempts.");
};

// Route: Beginner Mode
app.post('/api/beginner', async (req, res) => {
  try {
    const { interest, type, level } = req.body;
    console.log(`DEBUG: API Call - ${level}, ${interest}, ${type}`);

    const prompt = `
      You are an expert Research Mentor.
      The user is a ${level} looking for research in ${interest} focusing on ${type}.
      
      Task:
      1. Suggest 3 specific research domains fitting these criteria.
      2. For each domain guide:
         - What problems are solved?
         - Required skills?
         - Is it beginner friendly?
      3. Suggest 2 concrete entry-level project directions per domain.

      Output JSON format:
      {
        "domains": [
          {
            "name": "Domain Name",
            "description": "...",
            "friendly": true,
            "skills": ["Skill 1", "Skill 2"],
            "directions": ["Direction 1", "Direction 2"]
          }
        ]
      }
      RETURN ONLY JSON.
    `;

    const result = await generateWithRetry(model, prompt);
    const response = await result.response;
    const text = response.text();
    const json = JSON.parse(cleanJson(text));
    res.json(json);

  } catch (error) {
    console.error("Beginner Mode Error:", error.message);
    res.status(500).json({ error: "AI Service Error: " + error.message });
  }
});

// Route: Paper Analysis (Step 1)
app.post('/api/paper/analyze', async (req, res) => {
  try {
    const { text, filename } = req.body;

    const prompt = `
      You are an academic research analyst operating at PhD-reviewer level.
      Your task is to analyze a given research paper STRICTLY according to its paper type.
      
      Paper Content:
      "${text.substring(0, 30000)}..."

      Follow this pipeline EXACTLY:

      STEP 1: PAPER TYPE IDENTIFICATION
      Classify into ONE:
      1. Original Research / Experimental Paper
      2. Review / Survey Paper
      3. Conceptual / Framework Paper
      Justify using title, structure, experiments, citation density.

      STEP 2: CLAIM EXTRACTION WITH EPISTEMIC OWNERSHIP
      Extract claims into 3 categories:
      A. Author Claims (Authors' own conclusions/arguments)
      B. Cited Claims (Findings of other researchers, explicitly attributed)
      C. Analytical Observations (High-level insights/comparisons)

      STEP 3: METHOD & CONTRIBUTION ANALYSIS
      IF Original Research: Identify method, novelty, experiments.
      IF Review/Survey: Identify compared techniques, taxonomies, gaps. State "No new algorithm proposed".

      STEP 4: LIMITATION EXTRACTION
      List ONLY explicit or logically implied limitations. Include cause, impact, and evidence.

      STEP 5: JSON OUTPUT FORMAT
      Return strictly this JSON structure:
      {
        "filename": "${filename}",
        "type": "Original Research | Review | Conceptual",
        "type_justification": "...",
        "claims": {
          "author_claims": ["..."],
          "cited_claims": ["..."],
          "analytical_observations": ["..."]
        },
        "method_analysis": {
          "description": "...",
          "novelty": "...",
          "experiments": "..."
        },
        "limitations": [
          { "cause": "...", "impact": "...", "evidence": "..." }
        ],
        "gaps": ["Optional list of gaps if explicitly found"],
        "summary": "Brief 2-3 sentence summary of the paper."
      }
      RETURN ONLY JSON.
    `;

    const result = await generateWithRetry(model, prompt);
    const response = await result.response;
    const json = JSON.parse(cleanJson(response.text()));
    res.json(json);

  } catch (error) {
    console.error("Analysis Error:", error.message);
    res.status(500).json({ error: "AI Service Error: " + error.message });
  }
});

// Route: Paper Synthesis (Step 2)
app.post('/api/paper/synthesize', async (req, res) => {
  try {
    const { analyses } = req.body;
    const analysesText = JSON.stringify(analyses, null, 2);

    const prompt = `
      You are a Senior Research Scientist.
      Here are analyses of ${analyses.length} research papers.
      Each analysis contains:
      - Paper Type (Original vs Review)
      - Claims (Author vs Cited)
      - Limitations (Explicit vs Implied)
      
      Paper Analyses:
      ${analysesText}

      Perform the following reasoning steps:
      1. CROSS-CHECK CLAIMS: Compare "Author Claims" across papers. DO NOT attribute "Cited Claims" to the current paper.
      2. IDENTIFY CONFLICTS: Find contradictions between author claims or methodology trade-offs (e.g., Paper A claims accuracy > speed, Paper B claims speed > accuracy).
      3. SYNTHESIZE LIMITATIONS: Group the "limitations" found in each paper.
      4. FIND THE GAP: Based on the SHARED limitations or CONFLICTS, identify a research gap (a problem none have typically solved).
      5. PROPOSE DIRECTIONS: Suggest 3 specific research directions that address this gap.
      6. ROADMAP: Select ONE direction and create a high-level plan.

      Output JSON:
      {
        "conflicts": ["Conflict Description 1..."],
        "common_assumptions": ["Assumption 1...", "Assumption 2..."],
        "common_limitations": ["Limitation 1...", "Limitation 2..."],
        "gap": "Precise description of the identified research gap.",
        "directions": [
          { "title": "Direction 1", "value": "Why this is valuable...", "difficulty": "Beginner/Medium/Hard" }
        ],
        "roadmap": {
          "title": "Selected Direction Title",
          "steps": ["Step 1", "Step 2", "Step 3"],
          "challenges": ["..."]
        }
      }
      RETURN ONLY JSON.
    `;

    const result = await generateWithRetry(model, prompt);
    const response = await result.response;
    const json = JSON.parse(cleanJson(response.text()));
    res.json(json);

  } catch (error) {
    console.error("Synthesis Error:", error.message);
    res.status(500).json({ error: "AI Service Error: " + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Research Logic Server running on http://localhost:${PORT}`);
});
