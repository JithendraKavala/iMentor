const Groq = require("groq-sdk");

const FALLBACK_API_KEY = process.env.GROQ_API_KEY;
const DEFAULT_MODEL = "llama3-70b-8192"; // Example default model for Groq

async function generateContentWithHistory(
  chatHistory,
  currentUserQuery,
  systemPromptText = null,
  options = {}
) {
  const apiKeyToUse = options.apiKey || FALLBACK_API_KEY;

  if (!apiKeyToUse) {
    console.error(
      "FATAL ERROR: Groq API key is not available. Ensure GROQ_API_KEY is set or user provides one."
    );
    throw new Error("Groq API key is missing. Please configure it.");
  }

  try {
    const groq = new Groq({ apiKey: apiKeyToUse });

    if (
      typeof currentUserQuery !== "string" ||
      currentUserQuery.trim() === ""
    ) {
      throw new Error("currentUserQuery must be a non-empty string.");
    }

    // Format messages for Groq (OpenAI-compatible format)
    const messages = [];

    if (systemPromptText) {
      messages.push({ role: "system", content: systemPromptText });
    }

    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((msg) => {
        // Map 'model' role to 'assistant'
        const role = msg.role === "model" ? "assistant" : msg.role;
        // Extract text content
        const content = Array.isArray(msg.parts)
          ? msg.parts.map((p) => p.text).join(" ")
          : msg.text || "";

        if (content) {
            messages.push({ role, content });
        }
      });
    }

    messages.push({ role: "user", content: currentUserQuery });

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: options.model || DEFAULT_MODEL,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxOutputTokens || 8192,
    });

    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq API Call Error:", error?.message || error);
    let clientMessage = "Failed to get response from Groq service.";

    if (error.status === 401) {
        clientMessage = "Invalid Groq API Key.";
    } else if (error.status === 429) {
        clientMessage = "Groq rate limit exceeded.";
    }

    const enhancedError = new Error(clientMessage);
    enhancedError.status = error.status || 500;
    enhancedError.originalError = error;
    throw enhancedError;
  }
}

module.exports = {
  generateContentWithHistory,
};
