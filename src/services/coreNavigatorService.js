
export class CoreNavigatorService {
    constructor() {
        this.baseUrl = "http://localhost:3001/api";
    }

    async fetchCoreNavigatorResponse(message, history) {
        try {
            const response = await fetch(`${this.baseUrl}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, history })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Chat Request Failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error("Core Navigator Service Error:", error);
            throw error;
        }
    }
}
