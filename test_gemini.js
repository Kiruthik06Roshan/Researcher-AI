import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = (process.env.GEMINI_API_KEY || "").trim();
console.log("API Key length:", API_KEY.length);

const genAI = new GoogleGenerativeAI(API_KEY);

// Test different model name formats
const modelNames = [
    "gemini-2.5-flash",
    "models/gemini-2.5-flash",
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
];

async function testModels() {
    for (const modelName of modelNames) {
        console.log(`\n=== Testing: ${modelName} ===`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say hello in one word");
            const response = await result.response;
            const text = response.text();
            console.log(`✅ SUCCESS: ${modelName}`);
            console.log(`Response: ${text}`);
            break; // Stop after first success
        } catch (error) {
            console.log(`❌ FAILED: ${modelName}`);
            console.log(`Error: ${error.message}`);
        }
    }
}

testModels();
