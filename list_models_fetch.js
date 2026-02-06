import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function listModels() {
    try {
        const response = await fetch(URL);
        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(text);
            return;
        }
        const data = await response.json();
        console.log("Available Models:");
        data.models.forEach(model => {
            if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes("generateContent")) {
                console.log(`- ${model.name}`);
            }
        });
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

listModels();
