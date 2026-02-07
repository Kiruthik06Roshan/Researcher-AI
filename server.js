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

// Helper to remove Markdown formatting and extract JSON from response
const cleanJson = (text) => {
  // Remove markdown code blocks
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();

  // Try to find JSON object or array
  // Look for the first { or [ and the last } or ]
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  const lastBrace = cleaned.lastIndexOf('}');
  const lastBracket = cleaned.lastIndexOf(']');

  // Determine if it's an object or array
  let start = -1;
  let end = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    // It's an object
    start = firstBrace;
    end = lastBrace + 1;
  } else if (firstBracket !== -1) {
    // It's an array
    start = firstBracket;
    end = lastBracket + 1;
  }

  if (start !== -1 && end !== -1) {
    return cleaned.substring(start, end);
  }

  return cleaned;
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

// Route: Beginner Mode - Project Roadmap (Elite Mentor)
app.post('/api/beginner/roadmap', async (req, res) => {
  try {
    const { project, interest, dataType, level } = req.body;

    // CRITICAL GATING: Project must be provided
    if (!project || project.trim() === '') {
      return res.status(400).json({ error: "Project selection is required for roadmap generation" });
    }

    console.log(`DEBUG: Roadmap API Call - Project: ${project}, Level: ${level}`);

    const prompt = `
      You are an ELITE MENTOR guiding a ${level} beginner through their research journey.
      
      The user has selected this project: "${project}"
      Their interest area: ${interest}
      Data type: ${dataType}
      Skill level: ${level}

      CRITICAL RULES:
      - You are a MENTOR, NOT a reviewer or evaluator
      - Use beginner-friendly but elite-quality guidance
      - Focus on understanding and execution, NOT evaluation
      - NEVER use words like: methodology, evaluation, evidence, novelty, experiments, metrics, paper sections, research gaps
      - Use mentor phrases like: "At this stage, focus on...", "A strong beginner should understand...", "An important mistake to avoid is..."

      YOUR TASK:
      Generate a comprehensive 6-PHASE ROADMAP for this project.

      PHASE 1: Project Understanding
      - Explain the project clearly and intuitively
      - Explain why it matters in the real world
      - Define what success looks like
      - Build the correct mental model

      PHASE 2: Core Concepts Mastery
      - Identify essential concepts the user MUST understand
      - Explain how these concepts connect to the project
      - Emphasize understanding over memorization

      PHASE 3: Data & Resources Understanding
      - Explain what type of data is commonly used
      - How beginners typically access or create such data
      - Explain what "good enough" data means at this stage

      PHASE 4: First Practical Build
      - Guide the user to build a small, simple version
      - Emphasize learning-by-doing
      - Warn clearly against overengineering

      PHASE 5: Reflection & Improvement
      - Teach the user how to reflect on their work
      - Highlight common beginner mistakes
      - Suggest meaningful and achievable improvements

      PHASE 6: Growth Path Forward
      - Explain how the project can evolve
      - Suggest skills to learn next
      - Connect this project to future advanced work

      OUTPUT JSON FORMAT:
      {
        "overview": "Brief 2-3 sentence overview of the project journey",
        "phases": [
          {
            "title": "Phase 1: Project Understanding",
            "objective": "Clear objective of this phase",
            "whatToDo": "Detailed explanation of what to learn and do",
            "mentorGuidance": "Practical mentoring guidance - what to focus on, what to avoid",
            "outcome": "How the user knows they completed this phase"
          },
          ... (6 phases total)
        ]
      }

      TONE: Calm, confident mentor. Encouraging and supportive.
      LANGUAGE: Clear and beginner-friendly but not shallow.
      
      RETURN ONLY JSON.
    `;

    const result = await generateWithRetry(model, prompt);
    const response = await result.response;
    const text = response.text();
    const json = JSON.parse(cleanJson(text));
    res.json(json);

  } catch (error) {
    console.error("Roadmap Generation Error:", error.message);
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
          "author_claims": [
            { 
              "claim": "...", 
              "evidence": "Evidence: Methodology section, Table 2 showing accuracy metrics"
            }
          ],
          "cited_claims": [
            { 
              "claim": "...", 
              "evidence": "Evidence: Introduction, citing Smith et al. (2020) on baseline performance"
            }
          ],
          "analytical_observations": [
            { 
              "claim": "...", 
              "evidence": "Evidence: Inferred from comparative analysis in Discussion section"
            }
          ]
        },
        "method_analysis": {
          "description": "...",
          "novelty": "...",
          "experiments": "..."
        },
        "limitations": [
          { 
            "cause": "Evaluation limited to static timetabling scenarios with fixed course enrollments",
            "impact": "Method effectiveness in institutions with dynamic course reallocation and real-time enrollment changes remains unvalidated",
            "evidence": "Evidence: Methodology section, experimental setup constraints"
          }
        ],
        "gaps": ["Optional list of gaps if explicitly found"],
        "summary": "Brief 2-3 sentence summary of the paper."
      }

      --------------------------------------------------
      STEP 6: LIMITATION PRECISION ENFORCEMENT
      --------------------------------------------------
      When stating limitations, you must avoid abstract or high-level phrasing.

      Every limitation MUST follow this structure:
      - Context: What specific setting, assumption, or scope in the paper causes this limitation?
      - Constraint: What exactly is restricted or simplified?
      - Consequence: What kind of real-world, theoretical, or research applicability is affected?

      ❌ Forbidden limitation phrasing:
      - "may not generalize well"
      - "scalability could be an issue"
      - "performance depends on constraints"

      ✅ Required limitation phrasing:
      - Tie the limitation to a concrete design choice, dataset, evaluation setup, or assumption
      - Use domain-specific language drawn from the paper
      - Make the limitation falsifiable or testable

      If a limitation cannot be grounded in the paper's logic or scope,
      explicitly state: "No paper-specific limitation is identifiable for this aspect."

      --------------------------------------------------
      STEP 7: EVIDENCE ANCHORING FOR CLAIMS
      --------------------------------------------------
      For EVERY Author Claim and Analytical Observation, attach an evidence anchor.

      Each anchor must specify at least ONE of the following:
      - Section name (e.g., Introduction, Methodology, Discussion)
      - Experimental component (e.g., fitness function design, constraint model)
      - Citation behavior (e.g., synthesized from multiple referenced studies)

      Format example for claims array:
      "author_claims": [
        {
          "claim": "The proposed method achieves 95% accuracy",
          "evidence": "Derived from Results section, Table 3"
        }
      ]

      If the claim is inferential rather than explicit, label it clearly as:
      "Inferred from [section/component]"

      Claims without evidence anchors are NOT allowed.

      --------------------------------------------------
      STEP 8: CONFIDENCE CALIBRATION & ACADEMIC CAUTION
      --------------------------------------------------
      You must modulate confidence based on the strength of evidence.

      Use the following language rules:

      Use STRONG phrasing only when:
      - Experimental validation is present
      - Results are explicitly reported

      Use CAUTIOUS phrasing when:
      - The paper is a review or survey
      - The claim is analytical or interpretive

      Cautious phrasing includes:
      - "The authors argue..."
      - "The paper suggests..."
      - "The review indicates..."
      - "The analysis highlights..."

      ❌ Forbidden overconfident verbs unless justified:
      - demonstrates
      - proves
      - establishes definitively

      If certainty level is mixed, prefer cautious phrasing by default.

      --------------------------------------------------
      STEP 9: FINAL SELF-CHECK (MANDATORY)
      --------------------------------------------------
      Before producing final output, internally verify:
      1. No limitation is abstract or generic
      2. Every claim has an evidence anchor
      3. Confidence level matches paper type and evidence strength

      If any condition fails, revise the output until all are satisfied.

      --------------------------------------------------
      STEP 10: EXPLICIT EVIDENCE ANCHORING (ELITE MODE)
      --------------------------------------------------
      For EVERY claim, observation, or limitation, you MUST attach an explicit evidence line.

      Each evidence line must start with:
      "Evidence:"

      The evidence must reference at least ONE of the following:
      - Section name (e.g., Introduction, Methodology, Discussion)
      - Structural component (e.g., constraint modeling, fitness function design, evaluation setup)
      - Review behavior (e.g., comparative synthesis of cited studies)

      Examples:
      - Evidence: Discussion section, based on comparative analysis of optimization methods.
      - Evidence: Methodology section, derived from the fixed constraint modeling approach.
      - Evidence: Review synthesis across multiple cited GA-based studies.

      Claims or limitations WITHOUT an explicit "Evidence:" line are NOT allowed.

      --------------------------------------------------
      STEP 11: LIMITATION SHARPENING RULE
      --------------------------------------------------
      When stating a limitation, you MUST avoid vague nouns and abstract phrases.

      ❌ Forbidden phrases:
      - broader contexts
      - real-world scenarios
      - general environments
      - wider applications

      ✅ Required behavior:
      - Replace abstract nouns with concrete institutional, technical, or operational entities.
      - Specify *who*, *where*, or *under what condition* the limitation applies.

      Each limitation MUST:
      - Name a concrete setting (e.g., large public universities, dynamic scheduling systems)
      - Specify the operational change that causes failure or restriction

      Examples:
      ❌ "This limits applicability in broader contexts."
      ✅ "This limits applicability in institutions with dynamic course reallocation and real-time enrollment changes."

      If a limitation cannot be sharpened without speculation, explicitly state:
      "Limitation scope cannot be further specified without additional empirical data."

      --------------------------------------------------
      STEP 12: FINAL MICRO-QUALITY CHECK
      --------------------------------------------------
      Before finalizing output, verify internally:
      1. Every claim has an explicit "Evidence:" line
      2. No limitation contains abstract or vague nouns
      3. All limitations reference concrete conditions or entities

      If any check fails, revise until all conditions are satisfied.

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
