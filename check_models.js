import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    if (!API_KEY) {
        console.error("Error: GEMINI_API_KEY is missing in .env");
        return;
    }

    try {
        console.log("Fetching available models...");
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("\nAvailable Models:");
            data.models.forEach(m => {
                // Filter for Gemini models for cleaner output
                if (m.name.includes('gemini')) {
                    console.log(`- ${m.name.replace('models/', '')}`);
                    console.log(`  Methods: ${m.supportedGenerationMethods.join(', ')}`);
                }
            });
        } else if (data.error) {
            console.error("API Error:", data.error.message);
        } else {
            console.log("No models found or unexpected format.");
        }
    } catch (e) {
        console.error("Error listing models:", e);
    }
}

listModels();
