import dotenv from 'dotenv';
dotenv.config();

const key = process.env.GEMINI_API_KEY || "";
console.log(`Checking key: ...${key.slice(-5)}`);

if (!key) {
    console.error("No API Key found in .env");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

console.log(`Querying: ${url.replace(key, 'HIDDEN_KEY')}`);

try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
        console.error("API Error:", data.error.message);
        console.error("Details:", JSON.stringify(data.error, null, 2));
    } else if (data.models) {
        console.log("\n--- Available Gemini Models ---");
        const models = data.models
            .filter(m => m.name.includes("gemini"))
            .map(m => m.name.replace("models/", ""));

        console.log(models.join("\n"));

        const hasFlash2 = models.some(m => m.includes("gemini-2.0-flash"));
        console.log("\nAccess to Gemini 2.0 Flash:", hasFlash2 ? "YES" : "NO");
    } else {
        console.log("Unexpected response format:", data);
    }
} catch (error) {
    console.error("Network Error:", error.message);
}
