import fetch from 'node-fetch';

const BASE_URL = 'http://127.0.0.1:3001/api';

async function testFormatting() {
    console.log("Testing Paper Formatting API...");

    const dummyPaper = `
    Title: Deep Learning in Agriculture
    Abstract: We used AI to count apples. It worked well.
    Intro: Farming is hard. AI is cool.
    Methods: We took pictures of trees. We trained a CNN.
    Results: Acc was 90%.
    Conclusion: Good job.
    `;

    const payload = {
        text: dummyPaper,
        journalStyle: "IEEE (Institute of Electrical and Electronics Engineers)"
    };

    try {
        console.log("Sending request to /api/paper/format...");
        const response = await fetch(`${BASE_URL}/paper/format`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Server Error (${response.status}): ${err}`);
        }

        const data = await response.json();
        console.log("\n--- Formatted Result (Preview) ---");
        console.log(data.formattedText.substring(0, 500) + "...");
        console.log("\n--- SUCCESS ---");

    } catch (error) {
        console.error("Test Failed:", error.message);
        console.log("Make sure the server is running on port 3001 (npm run dev)");
    }
}

testFormatting();
