const Anthropic = require("@anthropic-ai/sdk");

const FALLBACK_API_KEY = process.env.ANTHROPIC_API_KEY;
const DEFAULT_MODEL = "claude-3-5-sonnet-20240620";

async function generateContentWithHistory(
  chatHistory,
  currentUserQuery,
  systemPromptText = null,
  options = {}
) {
  const apiKeyToUse = options.apiKey || FALLBACK_API_KEY;

  if (!apiKeyToUse) {
    console.error(
      "FATAL ERROR: Anthropic API key is not available. Ensure ANTHROPIC_API_KEY is set or user provides one."
    );
    throw new Error("Anthropic API key is missing. Please configure it.");
  }

  try {
    const anthropic = new Anthropic({ apiKey: apiKeyToUse });

    if (
      typeof currentUserQuery !== "string" ||
      currentUserQuery.trim() === ""
    ) {
      throw new Error("currentUserQuery must be a non-empty string.");
    }

    // Format messages for Anthropic
    // Anthropic expects: { role: 'user' | 'assistant', content: string | array }
    // System prompt is passed separately in create()
    const messages = [];

    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((msg) => {
        const role = msg.role === "model" ? "assistant" : msg.role;
        const content = Array.isArray(msg.parts)
          ? msg.parts.map((p) => p.text).join(" ")
          : msg.text || "";

        if (content) {
            messages.push({ role, content });
        }
      });
    }

    messages.push({ role: "user", content: currentUserQuery });

    const completion = await anthropic.messages.create({
      model: options.model || DEFAULT_MODEL,
      max_tokens: options.maxOutputTokens || 8192,
      temperature: options.temperature || 0.7,
      system: systemPromptText || undefined,
      messages: messages,
    });

    return completion.content[0]?.text || "";
  } catch (error) {
    console.error("Anthropic API Call Error:", error?.message || error);
    let clientMessage = "Failed to get response from Anthropic service.";

    if (error.status === 401) {
        clientMessage = "Invalid Anthropic API Key.";
    } else if (error.status === 429) {
        clientMessage = "Anthropic rate limit exceeded.";
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
