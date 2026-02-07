import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = (process.env.GEMINI_API_KEY || "").trim();
const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    try {
        console.log("Checking API Key length:", API_KEY.length);
        // There isn't a direct listModels in the standard SDK easily accessible without an authenticated client
        // but we can try to initialize the model the user wants.
        const modelName = "gemini-2.5-flash";
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, are you there?");
        const response = await result.response;
        console.log("Response:", response.text());
        console.log(`SUCCESS: ${modelName} is available.`);
    } catch (error) {
        console.error("ERROR:", error.message);
        if (error.message.includes("404") || error.message.includes("not found")) {
            console.log("Suggestion: gemini-2.5-flash might not be the correct name or not available yet.");
        }
    }
}

listModels();
