// server/services/ragQueryService.js
const axios = require('axios');
const geminiService = require('./geminiService');

async function queryPythonRagService(
    query, documentContextNameToPass, criticalThinkingEnabled, clientFilter = null, k = 5, apiKey = null
) {
    // Stream 4: Multi-Query Expansion
    let expandedQueries = [query];
    if (apiKey) {
        try {
            const expansionPrompt = `You are a search query optimizer. Generate 3 diverse variations of the user's query to maximize retrieval coverage.
User Query: "${query}"
Output ONLY the 3 queries, separated by newlines. No numbering or prefixes.`;

            const expansionText = await geminiService.generateContentWithHistory(
                [], expansionPrompt, "You are a query expansion expert.", { apiKey }
            );

            const newQueries = expansionText.split('\n')
                .map(q => q.trim().replace(/^-\s*/, '').replace(/^\d+\.\s*/, ''))
                .filter(q => q.length > 0);

            if (newQueries.length > 0) {
                expandedQueries = [...new Set([query, ...newQueries])].slice(0, 4);
                console.log(`[ragQueryService] Expanded query into ${expandedQueries.length} variations:`, expandedQueries);
            }
        } catch (e) {
            console.warn(`[ragQueryService] Query expansion failed: ${e.message}. Using original query.`);
        }
    }

    const pythonServiceUrl = process.env.PYTHON_RAG_SERVICE_URL;
    if (!pythonServiceUrl) {
        console.error("PYTHON_RAG_SERVICE_URL is not set. RAG features disabled for this request.");
        return { references: [], toolOutput: "RAG service is not configured on the server." };
    }
    const searchUrl = `${pythonServiceUrl}/query`;
    console.log(`[ragQueryService] Querying Python RAG: Query="${query.substring(0, 50)}...", DocContext=${documentContextNameToPass}`);

    const payload = {
        query: query,
        queries: expandedQueries, // Stream 4: Send all queries
        k: k,
        user_id: "agent_user",
        use_kg_critical_thinking: !!criticalThinkingEnabled,
        documentContextName: documentContextNameToPass || null
    };
    if (clientFilter && typeof clientFilter === 'object' && Object.keys(clientFilter).length > 0) {
        payload.filter = clientFilter;
    }

    try {
        const response = await axios.post(searchUrl, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: process.env.PYTHON_RAG_TIMEOUT || 30000
        });

        const relevantDocs = response.data?.retrieved_documents_list || [];
        const references = relevantDocs.map((doc, index) => ({
            number: index + 1,
            source: doc.metadata?.file_name || doc.metadata?.original_name || 'Unknown Document',
            content_preview: (doc.page_content || "").substring(0, 100) + "...",
        }));
        
        const toolOutput = relevantDocs.length > 0
            ? response.data.formatted_context_snippet
            : "No relevant context was found in the specified documents for this query.";

        return { references, toolOutput };

    } catch (error) {
        let errorMsg = error.message;
        if (error.response?.data?.error) errorMsg = `Python Service Error: ${error.response.data.error}`;
        else if (error.code === 'ECONNABORTED') errorMsg = 'Python RAG service request timed out.';
        console.error(`[ragQueryService] Error calling Python RAG service at ${searchUrl}:`, errorMsg);
        throw new Error(errorMsg);
    }
}

module.exports = {
    queryPythonRagService,
};