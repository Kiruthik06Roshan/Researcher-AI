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
// Sometimes \r or \n can sneak into the process.env if not careful
const API_KEY = (process.env.GEMINI_API_KEY || "").trim();
console.log("DEBUG: Key loaded (length):", API_KEY.length);

const genAI = new GoogleGenerativeAI(API_KEY);

// Verification: Try to use gemini-pro which we know works for this key
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Helper to remove Markdown formatting from JSON response
const cleanJson = (text) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
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

    const result = await model.generateContent(prompt);
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
      Analyze this research paper content:
      "${text.substring(0, 30000)}..." 

      Extract the following strictly:
      1. Research Problem
      2. Key Claims
      3. Implicit Assumptions (Hardware, Data, Environment)
      4. Limitations

      Output JSON:
      {
        "filename": "${filename}",
        "problem": "...",
        "claims": ["..."],
        "assumptions": ["..."],
        "limitations": ["..."]
      }
      RETURN ONLY JSON.
    `;

    const result = await model.generateContent(prompt);
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
      Here are analyses of ${analyses.length} papers:
      ${analysesText}

      Perform the following reasoning steps:
      1. Identify CONFLICTS between these papers.
      2. Identify COMMON ASSUMPTIONS they all share.
      3. Find a RESEARCH GAP based on these.
      4. Propose 3 Assumption-Breaking Research Directions.
      5. Select ONE direction and create a Roadmap.

      Output JSON:
      {
        "conflicts": ["Conflict 1..."],
        "common_assumptions": ["Assumption 1..."],
        "gap": "Description of the gap...",
        "directions": [
          { "title": "Direction 1", "value": "...", "difficulty": "Beginner/Medium/Hard" }
        ],
        "roadmap": {
          "title": "Selected Direction Title",
          "steps": ["Step 1", "Step 2", "Step 3"],
          "challenges": ["..."]
        }
      }
      RETURN ONLY JSON.
    `;

    const result = await model.generateContent(prompt);
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
