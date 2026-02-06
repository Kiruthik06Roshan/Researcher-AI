import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function listModels() {
    try {
        const response = await fetch(URL);
        const data = await response.json();
        const names = data.models
            .filter(m => m.supportedGenerationMethods.includes("generateContent"))
            .map(m => m.name);
        fs.writeFileSync('models.json', JSON.stringify(names, null, 2));
        console.log("Written to models.json");
    } catch (error) {
        console.error('Error:', error);
    }
}

listModels();
