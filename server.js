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
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  const lastBrace = cleaned.lastIndexOf('}');
  const lastBracket = cleaned.lastIndexOf(']');

  // Determine if it's an object or array
  let start = -1;
  let end = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    start = firstBrace;
    end = lastBrace + 1;
  } else if (firstBracket !== -1) {
    start = firstBracket;
    end = lastBracket + 1;
  }

  if (start !== -1 && end !== -1) {
    // Extract ONLY the JSON object, nothing before or after
    cleaned = cleaned.substring(start, end).trim();
  }

  // Double-check: ensure no trailing content after the JSON
  // Find the actual end of the JSON object by counting braces
  let braceCount = 0;
  let actualEnd = -1;
  let inStr = false;
  let escNext = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];

    if (escNext) {
      escNext = false;
      continue;
    }

    if (char === '\\') {
      escNext = true;
      continue;
    }

    if (char === '"') {
      inStr = !inStr;
      continue;
    }

    if (!inStr) {
      if (char === '{') braceCount++;
      if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          actualEnd = i + 1;
          break; // Found the end of the JSON object
        }
      }
    }
  }

  if (actualEnd !== -1 && actualEnd < cleaned.length) {
    cleaned = cleaned.substring(0, actualEnd);
  }

  // Try parsing first - if it works, return as-is
  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch (e) {
    // Parsing failed - apply fixes
  }

  // Strategy: Parse character by character, tracking string state
  let result = '';
  let inString = false;
  let escapeNext = false;
  let currentKey = '';
  let afterColon = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const nextChar = i < cleaned.length - 1 ? cleaned[i + 1] : '';

    // Handle escape sequences
    if (escapeNext) {
      result += char;
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      result += char;
      escapeNext = true;
      continue;
    }

    // Handle quotes
    if (char === '"') {
      inString = !inString;
      result += char;

      // Track if we just closed a key (before colon)
      if (!inString && nextChar === ':') {
        afterColon = false;
      } else if (!inString && afterColon) {
        afterColon = false;
      }

      continue;
    }

    // Track colons (to know if we're in a value)
    if (!inString && char === ':') {
      afterColon = true;
      result += char;
      continue;
    }

    // Inside a string - handle special characters
    if (inString) {
      // Escape control characters
      if (char === '\n') {
        result += '\\n';
      } else if (char === '\r') {
        result += '\\r';
      } else if (char === '\t') {
        result += '\\t';
      } else {
        result += char;
      }
    } else {
      result += char;
    }
  }

  // Final validation attempt
  try {
    JSON.parse(result);
    return result;
  } catch (e2) {
    // Last resort: try to fix common patterns
    // Replace unescaped quotes in the middle of strings (but not at boundaries)
    // This is a heuristic approach for edge cases
    console.error("JSON cleaning failed, attempting last-resort fixes...");
    console.error("Error:", e2.message);
    return result;
  }
};

// Helper for rate limits & model fallbacks
const generateWithRetry = async (currentModel, prompt, retries = 5) => {
  const modelName = "gemini-2.5-flash";

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`[Attempt ${attempt + 1}/${retries + 1}] Generate with ${modelName}...`);
      const activeModel = genAI.getGenerativeModel({ model: modelName });
      return await activeModel.generateContent(prompt);
    } catch (error) {
      console.warn(`Attempt ${attempt + 1} failed: ${error.message}`);

      const isRateLimit = error.message.includes("429") || error.message.includes("quota") || error.message.includes("retry");

      if (attempt === retries) {
        console.error("Max retries reached. Failing.");
        throw error;
      }

      if (isRateLimit) {
        // Parse retry delay from error message if available, else exponential backoff
        // Default base backoff: 2s, 4s, 8s, 16s, 32s...
        let waitTime = Math.pow(2, attempt) * 2000;

        // Add some jitter
        waitTime += Math.random() * 1000;

        console.log(`Rate limit hit. Waiting ${(waitTime / 1000).toFixed(2)}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // If it's not a rate limit error (e.g., 400, 500), maybe we shouldn't retry instantly or at all?
      // For now, let's treat other errors with a short delay and retry, or throw if it's a 400 Bad Request.
      if (error.message.includes("400")) {
        throw error;
      }

      console.log(`Error occurred. Retrying in 2s...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
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

      ADDITIONAL REQUIREMENT:
      - Generate a list of exactly 30 distinct, real or highly realistic research paper titles relevant to this project content.
      - These should cover foundational theories, similar implementations, and advanced extensions.
      
      CRITICAL: For each phase, generate a UNIQUE and SPECIFIC imagePrompt that visually represents THAT SPECIFIC PHASE's content.
      - DO NOT use generic placeholders like "[Phase Topic]"
      - Each imagePrompt must be DISTINCT from the others.
      - Each imagePrompt should describe a concrete, visual scene related to what the user will be doing in that phase.
      - Examples: 
        - "A developer writing Python code on a laptop with data visualizations on screen, cyberpunk style"
        - "A person analyzing colorful data charts and graphs on multiple monitors, futuristic lab"
        - "Hands building a simple web interface prototype with wireframes, blueprint style"
        - "A digital brain neural network structure glowing, 3d render"

      OUTPUT JSON FORMAT:
      {
        "researchPapers": [
            "Title of Research Paper 1",
            "Title of Research Paper 2",
            ... (30 papers total)
        ],
        "overview": "Brief 2-3 sentence overview of the project journey",
        "phases": [
          {
            "title": "Phase 1: Project Understanding",
            "imagePrompt": "Specific visual description for THIS phase (e.g., 'A person studying data charts and graphs on a laptop, modern workspace, soft lighting, digital art')",
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

    // LOGGING TO DEBUG MISSING PAPERS
    console.log("DEBUG: Roadmap AI Response JSON Keys:", Object.keys(json));
    if (json.researchPapers) {
      console.log("DEBUG: Research Papers Count:", json.researchPapers.length);
    } else {
      console.error("DEBUG: Research Papers MISSING in response!");
      // Fallback if needed, though prompt fix should help
      json.researchPapers = [];
    }

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

// Route: Paper Summarization (Elite Explanation System)
app.post('/api/paper/summarize', async (req, res) => {
  try {
    const { text, filename } = req.body;

    const prompt = `
      You are an ELITE PAPER EXPLANATION SYSTEM (COMPACT MODE).
      Your role is to EXPLAIN research papers with CLARITY and PRECISION.
      Your goal is UNDERSTANDING, not LENGTH.

      Paper Content:
      "${text.substring(0, 30000)}..."

      --------------------------------------------------
      CORE IDENTITY
      --------------------------------------------------
      You EXPLAIN everything. You do NOT JUDGE anything.

      This is:
      - Deep explanation through PRECISION, not verbosity
      - Clear intuition over lengthy theory
      - Decision logic over derivation

      This is NOT:
      - Beginner guidance
      - Research evaluation
      - Verbose academic writing

      --------------------------------------------------
      CRITICAL LANGUAGE RULES
      --------------------------------------------------
      ALLOWED TERMS:
      - methodology, formulation, model, equation, framework, novelty
      - "The paper explains...", "The authors discuss...", "The paper introduces..."
      - "This formula is used to represent...", "Intuitively, this means..."

      STRICTLY FORBIDDEN:
      - evaluation, limitation, weakness, strength, gap, future work critique
      - "better", "stronger", "robust", "efficient", "significant", "optimal"
      - "This improves...", "This is more effective...", "This performs better..."

      ACCEPTABLE PHRASING:
      - "The paper reports..."
      - "The results show..."
      - "The figure illustrates..."
      - "The authors introduce..."
      - "When this value increases, the model tends to..."

      --------------------------------------------------
      METHODOLOGY EXPLANATION RULE (COMPACT & MANDATORY)
      --------------------------------------------------
      For EACH major methodology step, explain in 2–3 sentences:

      1. WHAT the step does
      2. WHY it exists in the method
      3. WHAT idea it represents

      Do NOT elaborate beyond this unless strictly necessary.

      Example:
      "The genetic algorithm searches for optimal timetable configurations. This is necessary because exhaustive search is computationally intractable. The approach mimics natural evolution, iteratively improving solutions through selection and mutation."

      --------------------------------------------------
      MATHEMATICAL FORMULATION RULE (COMPACT & ELITE)
      --------------------------------------------------
      When a formula appears, explain it in THIS order:

      1. PURPOSE (1 sentence)
         - What decision or relationship this formula encodes

      2. VARIABLES (brief, 1-2 sentences)
         - Explain only important variables in plain language

      3. DECISION INTUITION (1-2 sentences)
         - What the model is encouraged to prefer or avoid

      OPTIONAL (only if it improves understanding):
      - Mention behavior when a key variable increases/decreases

      STRICT CONSTRAINTS:
      - If explanation exceeds 4–5 sentences → COMPRESS IT
      - Do NOT derive formulas
      - Do NOT prove correctness
      - Do NOT explain algebra step-by-step
      - Do NOT add theoretical background unless required

      Example:
      "This fitness function quantifies how good a timetable is. f(x) combines weighted penalties: w1 for hard constraints (room conflicts) and w2 for soft constraints (preferences). Higher penalties make solutions less desirable, guiding the search toward better configurations."

      --------------------------------------------------
      VISUAL EXPLANATION RULE (COMPACT)
      --------------------------------------------------
      For graphs or charts:
      - State what is being compared (1 sentence)
      - State the main visible trend (1 sentence)
      - Do NOT interpret performance or quality

      Example:
      "This chart compares algorithm runtime across different problem sizes. The reader should notice that runtime increases exponentially as problem size grows."

      --------------------------------------------------
      QUALITY CHECK (MANDATORY)
      --------------------------------------------------
      After EACH section, internally verify:
      "Did this explanation help understanding, or just add words?"

      If it added words → SHORTEN IT.

      --------------------------------------------------
      YOUR TASK
      --------------------------------------------------
      Generate a comprehensive 9-section explanation.
      Depth comes from PRECISION, not LENGTH.

      SECTION 1: Conceptual Orientation
      - What this paper is about at a high level (2-3 sentences)
      - Where it fits conceptually (1 sentence)
      - What the paper is trying to achieve (1 sentence)

      SECTION 2: Problem Definition & Motivation
      - Clearly explain the problem being addressed (2-3 sentences)
      - Why this problem exists and why solving it matters (1-2 sentences)

      SECTION 3: Methodology Explained Step-by-Step
      - Break the method into clear stages or components
      - For EACH step: WHAT it does, WHY it's necessary, WHAT intuition it represents (2-3 sentences per step)
      - Use technical precision but maintain clarity
      - NO critique, ONLY explanation

      SECTION 4: Mathematical Formulation (If Present)
      - For EACH important formula, follow the COMPACT sequence:
        1. Purpose (1 sentence)
        2. Variables (1-2 sentences)
        3. Decision intuition (1-2 sentences)
      - If explanation exceeds 4-5 sentences → COMPRESS
      - If no mathematical formulation exists, state: "No mathematical formulation presented in this paper."

      SECTION 5: What Is Novel in This Work
      - Clearly state what the authors introduce that is new (2-3 sentences)
      - Describe novelty factually, not evaluatively
      - Focus on WHAT is new, not WHETHER it is good

      SECTION 6: Results & Observations Explained
      - Explain what results the authors report (2-3 sentences)
      - Describe trends or patterns descriptively
      - NO performance judgment or comparison language

      SECTION 7: Visual Interpretation
      - If the paper contains graphs, charts, or tables:
        • State what is being compared (1 sentence)
        • State the main visible trend (1 sentence)
      - If no visual data is present, state: "No visual data or figures discussed in this paper."

      SECTION 8: End-to-End Understanding Summary
      - Tie everything together (2-3 sentences)
      - Explain how problem → method → results connect
      - Help reader see the big picture

      SECTION 9: Key Takeaways for the Reader
      - Provide 4-6 bullet points
      - Each bullet should be ONE clear, concise sentence
      - Focus on comprehension, not evaluation

      --------------------------------------------------
      OUTPUT JSON FORMAT
      --------------------------------------------------
      CRITICAL JSON FORMATTING RULES:
      - All string values MUST have properly escaped quotes (use \\" for quotes inside strings)
      - All newlines MUST be escaped as \\n
      - All tabs MUST be escaped as \\t
      - Do NOT use literal line breaks inside JSON string values
      - Ensure all JSON is valid and parseable

      {
        "filename": "${filename}",
        "conceptualOrientation": "High-level explanation of what this paper is about...",
        "problemDefinition": "Clear explanation of the problem and why it matters...",
        "methodology": "Step-by-step explanation with WHAT/WHY/INTUITION for each step...",
        "mathematicalFormulation": "Formulas with 6-step decoding sequence, or 'No mathematical formulation presented'...",
        "novelty": "Factual description of what is new in this work...",
        "results": "Descriptive explanation of what results show...",
        "visualInterpretation": "Structured explanation of graphs/charts with axes and trends, or 'No visual data'...",
        "endToEndSummary": "Complete synthesis tying problem-method-results together...",
        "keyTakeaways": [
          "Takeaway 1",
          "Takeaway 2",
          "Takeaway 3",
          "Takeaway 4"
        ]
      }

      --------------------------------------------------
      TONE & FOCUS
      --------------------------------------------------
      Tone: Clear, confident, instructor-like, technically precise but readable
      Style: Expert instructor teaching at a whiteboard
      Focus: Deep explanation and comprehension, NOT evaluation or judgment

      RETURN ONLY JSON.
    `;

    const result = await generateWithRetry(model, prompt);
    const response = await result.response;
    const rawText = response.text();

    try {
      const cleanedText = cleanJson(rawText);
      const json = JSON.parse(cleanedText);
      res.json(json);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError.message);
      console.error("Raw AI Response (first 500 chars):", rawText.substring(0, 500));
      console.error("Cleaned JSON (first 500 chars):", cleanJson(rawText).substring(0, 500));
      throw new Error("Failed to parse AI response as JSON: " + parseError.message);
    }

  } catch (error) {
    console.error("Paper Explanation Error:", error.message);
    res.status(500).json({ error: "AI Service Error: " + error.message });
  }
});

// Endpoint: Paper Formatting (Journal Style)
app.post('/api/paper/format', async (req, res) => {
  try {
    const { text, journalStyle } = req.body;

    if (!text || text.length < 50) {
      return res.status(400).json({ error: "Paper text is too short or missing." });
    }

    if (!journalStyle) {
      return res.status(400).json({ error: "Journal style is required." });
    }

    console.log(`Analyzing for formatting: ${journalStyle}`);

    // Updated Prompt: HTML Generation for Better Formatting Control
    const prompt = `
      You are an expert academic typesetter and editor. Your task is to format the provided research paper text into a semantic HTML document that visually implies the style of the target journal.

      Target Journal Style: "${journalStyle}"
      
      Instructions:
      1. **CONTENT PRESERVATION**: You must PRESERVE the original text content exactly. Do NOT summarize, rewrite, or simplify the scientific content. Only fix obvious typos or broken line breaks.
      2. **Structure**: Identify the Title, Authors (if present), Abstract, Keywords, Headings, Subheadings, Body Text, Lists, and References.
      3. **HTML Output**: Generate a full HTML snippet (without \`<html>\` or \`<body>\` tags, just the inner content div) suitable for rendering.
      4. **Styling (CRITICAL)**:
         - Use INLINE CSS or a \`<style>\` block to strictly enforce the visual look of ${journalStyle}.
         - If ${journalStyle} uses a two-column layout (like IEEE/ACM), wrap the body content in a div with \`column-count: 2; column-gap: 20px; text-align: justify;\`.
         - Ensure the Title and Abstract span across the full width (do not put them inside the columns).
         - Use correct fonts (e.g., Times New Roman for IEEE, Arial/Helvetica for others if applicable).
         - Format Reference list appropriately.
      
      Input Text:
      """
      ${text.substring(0, 35000)}
      """

      Return ONLY the HTML string. Do not use markdown code blocks.
    `;

    const result = await generateWithRetry(model, prompt);
    const response = await result.response;
    let htmlContent = response.text();

    // Cleanup potential markdown fences if the model ignores the instruction
    htmlContent = htmlContent.replace(/```html/g, '').replace(/```/g, '');

    res.json({ htmlContent });

  } catch (error) {
    console.error("Formatting Error:", error.message);
    res.status(500).json({ error: "AI Service Error: " + error.message });
  }
});

// Route: Core Navigator Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    console.log(`DEBUG: Chat Request - "${message}"`);

    // Basic prompt construction
    let prompt = "You are Core Navigator, an AI assistant for the Ideaora research platform.\n";
    prompt += "Help users with navigation, features, and general research questions.\n";
    prompt += "Keep answers concise, helpful, and friendly.\n\n";

    if (history && history.length > 0) {
      prompt += "History:\n" + history.map(msg => `${msg.role}: ${msg.content}`).join("\n") + "\n\n";
    }

    prompt += `User: ${message}\nAssistant:`;

    const result = await generateWithRetry(model, prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error("Chat Error:", error.message);
    res.status(500).json({ error: "AI Service Error: " + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Research Logic Server running on http://localhost:${PORT}`);
});
