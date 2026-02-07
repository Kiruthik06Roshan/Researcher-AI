import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = (process.env.GEMINI_API_KEY || "").trim();
console.log("Testing Gemini 2.5 Flash with different configurations...\n");

const genAI = new GoogleGenerativeAI(API_KEY);

const configurations = [
    { model: "gemini-2.5-flash" },
    { model: "gemini-2.0-flash-exp" },
    { model: "gemini-exp-1206" },
    { model: "gemini-1.5-flash-latest" },
    { model: "gemini-1.5-flash" }
];

async function testConfigurations() {
    for (const config of configurations) {
        console.log(`\n=== Testing: ${config.model} ===`);
        try {
            const model = genAI.getGenerativeModel(config);
            const result = await model.generateContent("Respond with just: OK");
            const response = await result.response;
            const text = response.text();
            console.log(`✅ SUCCESS: ${config.model}`);
            console.log(`Response: ${text}`);
            console.log(`\n🎯 WORKING MODEL FOUND: ${config.model}`);
            process.exit(0);
        } catch (error) {
            console.log(`❌ FAILED: ${config.model}`);
            console.log(`Error: ${error.message.substring(0, 100)}...`);
        }
    }
    console.log("\n⚠️ All models failed. Check your API key and quota.");
    process.exit(1);
}

testConfigurations();
