export class GeminiService {
  constructor() {
    this.baseUrl = "http://localhost:3001/api";
  }

  // No key validation needed on client
  async validateKey() {
    return true;
  }

  // MODE 1: Beginner Suggestions
  async getBeginnerSuggestions(data) {
    const response = await fetch(`${this.baseUrl}/beginner`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error("Backend Error");
    return await response.json();
  }

  // MODE 1: Project Roadmap (Elite Mentor)
  async getProjectRoadmap(data) {
    const response = await fetch(`${this.baseUrl}/beginner/roadmap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Roadmap Generation Failed: ${response.statusText}`);
    }
    return await response.json();
  }

  // MODE 2: Paper Analysis (Step 1)
  async analyzePaper(text, filename) {
    const response = await fetch(`${this.baseUrl}/paper/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, filename })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Paper Analysis Failed: ${response.statusText}`);
    }
    return await response.json();
  }

  // MODE 2: Synthesis (Step 2-5)
  async synthesizeResearch(analyses) {
    const response = await fetch(`${this.baseUrl}/paper/synthesize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analyses })
    });

    if (!response.ok) throw new Error("Synthesis Failed");
    return await response.json();
  }
}
