// server/services/llmRouterService.js
const LLMConfiguration = require('../models/LLMConfiguration');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let referenceEmbeddings = null;

const ROUTING_CATEGORIES = {
    technical: "Calculate, solve, derive, equation, theorem, math, physics, science, proof, algorithm, data structure, complexity",
    code: "Write code, debug, python, javascript, function, class, api, error, react, nodejs, sql, database",
    creative: "Write a story, poem, imagine, creative, fantasy, character, plot, narrative, fiction",
    multilingual: "Translate, spanish, french, german, japanese, language, interpret"
};

async function getEmbedding(text) {
    if (!GEMINI_API_KEY) return null;
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (e) {
        console.error("Embedding Error:", e.message);
        return null;
    }
}

function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function initializeReferenceEmbeddings() {
    if (referenceEmbeddings) return;
    referenceEmbeddings = {};
    console.log("[LLMRouter] Initializing semantic routing reference embeddings...");
    for (const [category, text] of Object.entries(ROUTING_CATEGORIES)) {
        const emb = await getEmbedding(text);
        if (emb) referenceEmbeddings[category] = emb;
    }
    console.log("[LLMRouter] Reference embeddings initialized.");
}

/**
 * Intelligently selects the best LLM for a given query and context.
 * @param {string} query - The user's query text.
 * @param {object} context - An object containing context like userId, subject, etc.
 * @returns {Promise<{chosenModel: object, logic: string}>} An object with the selected model's configuration and the reasoning for the choice.
 */
async function selectLLM(query, context) {
  const { subject, user } = context;
  const preferredProvider = user?.preferredLlmProvider || 'gemini';
  const lowerQuery = query.toLowerCase();
  console.log(`[LLMRouter] Selecting LLM for query. User preference: ${preferredProvider}`);

  const baseFilter = { provider: preferredProvider };

  // PRIORITY 1: Subject-Specific Fine-Tuned Model (for P2.8)
  // If the user has selected a subject in the UI (e.g., "Physics"), we look for a model specifically fine-tuned for it.
   if (subject) {
        // Fine-tuned models are a separate provider type
        const fineTunedModel = await LLMConfiguration.findOne({ provider: 'fine-tuned', subjectFocus: subject });
        if (fineTunedModel) {
            console.log(`[LLMRouter] Decision: Found specialized fine-tuned model '${fineTunedModel.modelId}' for subject '${subject}'.`);
            return { chosenModel: fineTunedModel, logic: 'subject_match_finetuned' };
        }
    }

  // PRIORITY 2: Semantic Routing (Embedding-based)
  // Replaces previous heuristic keyword matching
  try {
      if (!referenceEmbeddings) {
          await initializeReferenceEmbeddings();
      }

      const queryEmbedding = await getEmbedding(query);
      if (queryEmbedding && referenceEmbeddings && Object.keys(referenceEmbeddings).length > 0) {
          let bestCategory = null;
          let maxScore = -1;

          for (const [category, refEmb] of Object.entries(referenceEmbeddings)) {
              const score = cosineSimilarity(queryEmbedding, refEmb);
              if (score > maxScore) {
                  maxScore = score;
                  bestCategory = category;
              }
          }

          // Use a reasonable threshold to avoid forcing a category on vague queries
          if (maxScore > 0.55 && bestCategory) {
              console.log(`[LLMRouter] Semantic Classification: '${bestCategory}' (Score: ${maxScore.toFixed(2)})`);
              const specializedModel = await LLMConfiguration.findOne({ ...baseFilter, strengths: bestCategory });
              if (specializedModel) {
                  console.log(`[LLMRouter] Decision: Semantic match for '${bestCategory}'. Using model '${specializedModel.modelId}'.`);
                  return { chosenModel: specializedModel, logic: `semantic_${bestCategory}_${preferredProvider}` };
              }
          }
      }
  } catch (err) {
      console.warn("[LLMRouter] Semantic routing failed, falling back to default.", err.message);
  }
  
  // PRIORITY 3: Fallback to the designated default model
  const defaultModelInProvider = await LLMConfiguration.findOne({ ...baseFilter, isDefault: true });
    if (defaultModelInProvider) {
        console.log(`[LLMRouter] Decision: No specific heuristic met. Using default model '${defaultModelInProvider.modelId}' for provider '${preferredProvider}'.`);
        return { chosenModel: defaultModelInProvider, logic: `default_provider_fallback_${preferredProvider}` };
    }

    // PRIORITY 4: If no default is set for the provider, find ANY model from that provider
    const anyModelInProvider = await LLMConfiguration.findOne(baseFilter);
    if (anyModelInProvider) {
         console.warn(`[LLMRouter] No default model found for provider '${preferredProvider}'. Falling back to first available model: '${anyModelInProvider.modelId}'`);
         return { chosenModel: anyModelInProvider, logic: `any_provider_fallback_${preferredProvider}` };
    }

    // NEW: Hardcoded fallback for known providers if DB is empty (Stream 1, TODO 1 support)
    if (['groq', 'anthropic'].includes(preferredProvider)) {
         const fallbackModelId = preferredProvider === 'groq' ? 'llama3-70b-8192' : 'claude-3-5-sonnet-20240620';
         console.warn(`[LLMRouter] No configuration found in DB for '${preferredProvider}'. Using hardcoded default: '${fallbackModelId}'`);
         return { chosenModel: { modelId: fallbackModelId, provider: preferredProvider }, logic: `hardcoded_fallback_${preferredProvider}` };
    }

  // ABSOLUTE FALLBACK: If no models for the preferred provider exist, use the absolute system default
    const absoluteDefault = await LLMConfiguration.findOne({ isDefault: true });
    if (absoluteDefault) {
        console.error(`[LLMRouter] CRITICAL: No models found for user's preferred provider '${preferredProvider}'. Falling back to absolute system default '${absoluteDefault.modelId}'.`);
        return { chosenModel: absoluteDefault, logic: 'absolute_system_default_fallback' };
    }

    // Hardcoded fallback if DB is completely misconfigured
    console.error("[LLMRouter] CRITICAL: No models found for preferred provider AND no system default! Using hardcoded default.");
    return {
        chosenModel: { modelId: 'gemini-1.5-flash-latest', provider: 'gemini' },
        logic: 'absolute_hardcoded_fallback'
    };
}

module.exports = { selectLLM };