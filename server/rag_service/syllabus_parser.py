import logging
import json
import re
import google.generativeai as genai
import config

logger = logging.getLogger(__name__)

SYLLABUS_PARSING_PROMPT = """
You are an expert curriculum designer and data architect. Your task is to analyze the provided syllabus text and extract a structured hierarchical representation of the learning units, topics, and sub-topics.

**INSTRUCTIONS:**
1.  **Analyze Structure**: Identify the hierarchy. Usually, there are "Units" or "Modules" (top level), which contain "Topics" (mid level), which contain "Sub-topics" (granular).
2.  **Extract Graph Data**: Generate a Knowledge Graph JSON representing this hierarchy.
3.  **Strict Edge Types**:
    -   Use `BELONGS_TO` for hierarchical relationships (e.g., Topic belongs to Unit).
    -   Use `REQUIRES` if a topic explicitly lists prerequisites.
    -   Node Types: "Unit", "Topic", "SubTopic".
4.  **Format**: Return a JSON object with "nodes" and "edges".
    -   **Nodes**: `{"id": "Unique Name", "type": "Unit"|"Topic"|"SubTopic", "label": "Full Name", "description": "Short description from text"}`
    -   **Edges**: `{"from": "ChildID", "to": "ParentID", "relationship": "BELONGS_TO"}` or `{"from": "DependentTopicID", "to": "PrerequisiteTopicID", "relationship": "REQUIRES"}`

**SYLLABUS TEXT:**
{text}

**FINAL JSON (start with {{):**
"""

def parse_syllabus_to_graph(text):
    """
    Parses syllabus text into a knowledge graph structure using LLM.
    Returns: Dict with 'nodes' and 'edges' or None on failure.
    """
    if not config.GEMINI_API_KEY:
        logger.error("GEMINI_API_KEY not set. Cannot parse syllabus.")
        return None

    # Ensure configuration (safe to call multiple times)
    genai.configure(api_key=config.GEMINI_API_KEY)

    # Use a model suitable for large context if possible, or truncate
    model_name = config.GEMINI_MODEL_NAME or "gemini-1.5-flash"
    model = genai.GenerativeModel(model_name)

    # Truncate to avoid context limits if necessary, though 1.5 flash has large context
    truncated_text = text[:50000]
    prompt = SYLLABUS_PARSING_PROMPT.format(text=truncated_text)

    try:
        logger.info(f"Parsing syllabus with model {model_name}...")
        response = model.generate_content(prompt)
        text_resp = response.text

        # Extract JSON
        json_match = re.search(r'\{.*\}', text_resp, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
            graph_data = json.loads(json_str)
            if "nodes" in graph_data and "edges" in graph_data:
                logger.info(f"Syllabus parsed: {len(graph_data['nodes'])} nodes, {len(graph_data['edges'])} edges.")
                return graph_data
            else:
                logger.error("Syllabus parsing returned JSON but missing nodes/edges.")
                return None
        else:
            logger.error("No JSON found in syllabus parsing response.")
            return None
    except Exception as e:
        logger.error(f"Error parsing syllabus: {e}")
        return None
