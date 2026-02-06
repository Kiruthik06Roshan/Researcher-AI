import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main() {
    try {
        const models = await genAI.listModels();
        console.log('Available models:');
        for (const model of models.models) {
            console.log(`- ${model.name} (${model.supportedGenerationMethods})`);
        }
    } catch (error) {
        console.error('Error listing models:', error);
    }
}

main();
