// server/services/sessionAnalysisService.js
const geminiService = require('./geminiService');
const ollamaService = require('./ollamaService');
const User = require('../models/User');
const { decrypt } = require('../utils/crypto');


const SUMMARY_GAPS_PROMPT = `You are an expert educational analyst. Your task is to analyze the provided chat transcript and perform actions. Your entire output MUST be a single, valid JSON object with NO other text before or after it.

The JSON object MUST have keys:
1.  "summary": A string containing an updated, cumulative summary.
2.  "keyTopics": An array of strings listing 3-4 most important topics.
3.  "knowledgeGaps": An array of objects, each with "topic" (string) and "proficiencyScore" (0.0 to 1.0).
4.  "bloomScore": A number (0 to 100) representing the cognitive depth of the user's questions based on Bloom's Taxonomy.
    -   Remember/Understand (e.g., "What is X?"): 10-30 points.
    -   Apply/Analyze (e.g., "How does X work with Y?"): 40-70 points.
    -   Evaluate/Create (e.g., "Design a system for...", "Critique this..."): 80-100 points.

**CRITICAL INSTRUCTIONS FOR "knowledgeGaps":**
- A knowledge gap exists if the user **explicitly states confusion**.
- Assign low proficiencyScore (0.3-0.5) if confusion was stated.
- Only include topics where proficiency < 0.8.

Example Output:
{
  "summary": "...",
  "keyTopics": ["SoC", "SDLC"],
  "knowledgeGaps": [{ "topic": "SoC", "proficiencyScore": 0.4 }],
  "bloomScore": 45
}`;


// --- Stream 3: Quests/Bounties Prompt ---
const RECOMMENDATIONS_PROMPT = `You are a Gamified Learning Architect. Based on the topics, generate 3 "Quests" (Bounties) for the user to earn credits. Your entire output MUST be a single, valid JSON object with "recommendations" (array).

For each topic, create a CHALLENGE.
- Instead of "Read about X", say "Find 3 examples of X...".
- Assign a 'reward' (credits) based on difficulty (10-100).

Each recommendation object MUST have:
- "topic": The related topic.
- "actionType": 'quest'.
- "suggestion_text": The Quest description (e.g., "Find 3 real-world examples of AI in Healthcare and summarize them.").
- "reward": Number (e.g., 50).

Example Output:
{
  "recommendations": [
    {
      "topic": "AI Ethics",
      "actionType": "quest",
      "suggestion_text": "Identify 3 ethical biases in modern AI and explain how to mitigate them to earn 50 credits.",
      "reward": 50
    }
  ]
}`;



/**
 * STEP A: Gets the summary and knowledge gaps from a transcript.
 */
async function getSummaryAndGaps(transcript, existingSummary, llmProvider, ollamaModel, userApiKey, userOllamaUrl) {
    // Add keyTopics to the default response for safety.
    const defaultResponse = { summary: existingSummary || "", knowledgeGaps: [], keyTopics: [] };
    const userPrompt = `Existing Summary:\n"""\n${existingSummary || "None"}\n"""\n\nNew Messages:\n"""\n${transcript}\n"""\n\nPlease provide your analysis in the required JSON format.`;
    
    console.log(`[SessionAnalysisService] Requesting summary, gaps, and key topics using ${llmProvider}.`);
    
    try {
        const llmService = llmProvider === 'ollama' ? ollamaService : geminiService;
        const llmOptions = { apiKey: userApiKey, ollamaUrl: userOllamaUrl, model: ollamaModel, temperature: 0.2 };
        const responseText = await llmService.generateContentWithHistory([], userPrompt, SUMMARY_GAPS_PROMPT, llmOptions);

        // Find and parse the JSON block from the LLM's response.
        const jsonMatch = responseText.match(/```(json)?\s*([\s\S]+?)\s*```/);
        const jsonString = jsonMatch ? jsonMatch[2].trim() : responseText.trim();
        const result = JSON.parse(jsonString);

        // Safely extract each piece of data, providing fallbacks.
        const finalSummary = result.summary || existingSummary || "";
        const knowledgeGaps = (result.knowledgeGaps && Array.isArray(result.knowledgeGaps)) ? result.knowledgeGaps : [];
        const keyTopics = (result.keyTopics && Array.isArray(result.keyTopics)) ? result.keyTopics : [];
        const bloomScore = typeof result.bloomScore === 'number' ? result.bloomScore : 0;
        
        console.log(`[SessionAnalysisService] Analysis successful. Bloom Score: ${bloomScore}.`);
        
        // Return all pieces of data in the final object.
        return { summary: finalSummary, knowledgeGaps, keyTopics, bloomScore };
        
    } catch (error) {
        console.error(`[SessionAnalysisService] Error during summary/gap/topic analysis: ${error.message}`);
        return defaultResponse; // Return a safe default on any error.
    }
}

/**
 * STEP B: Gets recommendations based on knowledge gaps.
 */
async function generateRecommendations(knowledgeGaps, llmProvider, ollamaModel, userApiKey, userOllamaUrl) {
    if (!knowledgeGaps || knowledgeGaps.length === 0) {
        return []; // No gaps, no recommendations needed.
    }
    
    const userPrompt = `Knowledge Gaps Identified:\n${JSON.stringify(knowledgeGaps, null, 2)}\n\nPlease provide your recommendations in the required JSON format.`;
    console.log(`[SessionAnalysisService] Requesting recommendations for ${knowledgeGaps.length} knowledge gaps.`);

    try {
        const llmService = llmProvider === 'ollama' ? ollamaService : geminiService;
        const llmOptions = { apiKey: userApiKey, ollamaUrl: userOllamaUrl, model: ollamaModel, temperature: 0.5 };
        const responseText = await llmService.generateContentWithHistory([], userPrompt, RECOMMENDATIONS_PROMPT, llmOptions);

        const jsonMatch = responseText.match(/```(json)?\s*([\s\S]+?)\s*```/);
        const jsonString = jsonMatch ? jsonMatch[2].trim() : responseText.trim();
        const result = JSON.parse(jsonString);

        const recommendations = (result.recommendations && Array.isArray(result.recommendations)) ? result.recommendations.slice(0, 3) : [];
        console.log(`[SessionAnalysisService] Recommendation generation successful. Generated ${recommendations.length} recommendations.`);
        return recommendations;
    } catch (error) {
        console.error(`[SessionAnalysisService] Error during recommendation generation: ${error.message}`);
        return []; // Return empty array on error
    }
}

/**
 * Orchestrates the full analysis pipeline.
 * @returns {Promise<{summary: string, knowledgeGaps: Map<string, number>, recommendations: Array<Object>}>}
 */
async function analyzeAndRecommend(messagesToSummarize, existingSummary, llmProvider, ollamaModel, userApiKey, userOllamaUrl) {
    const defaultResponse = { summary: existingSummary || "", knowledgeGaps: new Map(), recommendations: [], bloomScore: 0 };
    if (!messagesToSummarize || messagesToSummarize.length < 2) {
        return defaultResponse;
    }
    
    const transcript = messagesToSummarize.map(msg => `${msg.role === 'model' ? 'Tutor' : 'Student'}: ${msg.parts?.[0]?.text || ''}`).join('\n---\n');

    // Step A: Get Summary, Gaps, Key Topics, and Bloom Score
    const { summary, knowledgeGaps, keyTopics, bloomScore } = await getSummaryAndGaps(transcript, existingSummary, llmProvider, ollamaModel, userApiKey, userOllamaUrl);

    // Step B: Generate Quests (Recommendations)
    const recommendations = await generateRecommendations(keyTopics, llmProvider, ollamaModel, userApiKey, userOllamaUrl);
    
    const knowledgeGapsMap = new Map();
    if (knowledgeGaps) {
        knowledgeGaps.forEach(item => {
            if (typeof item.topic === 'string' && typeof item.proficiencyScore === 'number') {
                knowledgeGapsMap.set(item.topic, item.proficiencyScore);
            }
        });
    }

    return { summary, knowledgeGaps: knowledgeGapsMap, recommendations, keyTopics, bloomScore };
}


module.exports = { analyzeAndRecommend }; 