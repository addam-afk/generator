/**
 * This is your Vercel Serverless Function (api/shorten.js)
 * WARNING: This version contains hardcoded API keys.
 * This is NOT SAFE and is for testing only.
 */
export default async function handler(request, response) {
    
    // 1. Get the 'serviceName' that your HTML page sent
    const { serviceName } = request.body;

    if (!serviceName) {
        return response.status(400).json({ shortSlug: "Error: No service name given" });
    }

    // 2. --- WARNING: HARDCODED SECRETS ---
    // Replace these with your actual key and URL
    const AI_API_URL = "https://api.agentrouter.ai/v1/chat/completions";
    const AI_API_KEY = "sk-17No4iDhEm274pSxtSsTr9qM6Wz9w5ZUsDGzdXxUC4GBgjdg"; // <-- PASTE YOUR KEY HERE

    // 3. This is the prompt we send to the AI
    const prompt = `
        You are an expert slug generator. Your only job is to shorten a service name.
        - Make it 1-3 words.
        - Use all lowercase.
        - Use hyphens for spaces.
        - Do not include any other text, just the final slug.
        
        Example Input: "Home Purchase Loans (Conventional, FHA, VA)"
        Example Output: "home-purchase-loans"
        
        Example Input: "Licensed Mortgage Loan Advisor"
        Example Output: "mortgage-advisor"
        
        Here is the service name to shorten:
        ${serviceName}
    `;

    // 4. We use a 'try...catch' block to prevent crashes
    try {
        
        console.log("Attempting to fetch URL:", AI_API_URL);

        // 5. Call the AgentRouter AI API
        const aiResponse = await fetch(AI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${AI_API_KEY}`, 
            },
            body: JSON.stringify({
                "model": "anthropic/claude-3-haiku-20240307", 
                "messages": [{ "role": "user", "content": prompt }],
                "temperature": 0.2,
                "max_tokens": 20
            })
        });

        // 6. Check if the AI itself had an error (like a bad key)
        if (!aiResponse.ok) {
            const errorData = await aiResponse.json();
            console.error("AI API Error:", errorData);
            return response.status(500).json({ shortSlug: `AI Error: ${errorData.error.message}` });
        }

        // 7. Get the good data from the AI
        const aiData = await aiResponse.json();
        const shortSlug = aiData.choices[0].message.content;

        // 8. Send the final, clean slug back to your HTML page!
        const cleanSlug = shortSlug.trim().replace(/["']/g, '');
        response.status(200).json({ shortSlug: cleanSlug });

    } catch (error) {
        // 9. Catch any other network errors
        console.error("Vercel Function Error:", error.message);
        response.status(500).json({ shortSlug: `Server Error: ${error.message}` });
    }
}
