import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = (process.env.GEMINI_API_KEY || "").trim();
console.log("Testing gemini-2.5-flash availability...\n");

const genAI = new GoogleGenerativeAI(API_KEY);

async function testModel() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Say 'Hello' in one word");
        const response = await result.response;
        const text = response.text();
        console.log("✅ SUCCESS: gemini-2.5-flash is available!");
        console.log("Response:", text);
        process.exit(0);
    } catch (error) {
        console.log("❌ FAILED: gemini-2.5-flash is NOT available");
        console.log("Error message:", error.message);
        console.log("\nFull error details:");
        console.log(error);
        process.exit(1);
    }
}

testModel();
