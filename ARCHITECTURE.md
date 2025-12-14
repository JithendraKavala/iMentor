# iMentor AI Architecture

This document describes the high-level architecture of the iMentor AI system.

## Overview

iMentor AI is a full-stack educational platform that leverages a microservices-like architecture (within a monorepo) to provide intelligent tutoring, research assistance, and content generation. It combines a React frontend, a Node.js backend, and specialized Python services for advanced AI capabilities.

## Integrated Architecture Diagram (C4 Component)

This diagram visualizes the complete system, showing how the high-level containers (Frontend, Database, etc.) interact with the internal components of the Agent Ecosystem.

```mermaid
C4Component
    title Integrated Architecture Diagram for iMentor AI System

    Person(user, "User", "Student, Professional, or Researcher using the platform")

    System_Ext(gemini, "Google Gemini API", "External LLM service for advanced reasoning and generation.")
    System_Ext(ollama, "Ollama", "Local LLM inference engine.")

    System_Boundary(c1, "iMentor AI System") {

        Container(frontend, "Frontend Application", "React, Vite", "Provides the web interface for users to interact with the AI agents and tools.")

        ContainerDb(database, "Database", "MongoDB", "Stores user data, chat history, documents, and vector embeddings.")

        Container(ml_service, "ML Inference Service", "Python, FastAPI", "Handles specialized ML tasks, multi-model routing, and query classification.")

        Container_Boundary(backend_api, "Backend API (Node.js)") {
            Component(api_server, "API Server", "Express.js", "Handles REST API requests, auth, and routing.")
            Component(doc_processor, "Document Processor", "Service", "The Information Alchemist: Extracts text, chunks documents, and manages vector embeddings.")
            Component(mcp_handler, "MCP WebSocket Handler", "Service", "Manages real-time communication between Frontend and Python Agents.")
        }

        Container_Boundary(mcp_controller, "MCP Agent Controller (Python Process)") {
            Component(orchestrator, "Workflow Coordinator", "AgentOrchestrator", "The Master Orchestrator: Decomposes complex tasks and routes them.")

            Component(research_agent, "Research Analyst", "ResearchAssistantAgent", "The Knowledge Hunter: Deep web search & verification.")
            Component(content_agent, "Content Creator", "CreativeAgent", "The Digital Artisan: Content generation.")
            Component(learning_agent, "Learning Assistant", "AcademicAssistantAgent", "The Personalized Tutor: Study planning & tracking.")

            Component(project_agent, "Project Manager", "ProjectManagementAgent", "GitHub & Project mgmt.")
            Component(career_agent, "Career Advisor", "CareerDevelopmentAgent", "Job search & networking.")
            Component(engineering_agent, "Engineering Tools", "EngineeringToolsAgent", "CAD & Simulation analysis.")
        }
    }

    Rel(user, frontend, "Uses", "HTTPS")

    Rel(frontend, api_server, "API Calls", "JSON/HTTPS")
    Rel(frontend, mcp_handler, "Real-time Chat", "WebSocket")

    Rel(api_server, database, "Reads/Writes", "MongoDB Protocol")
    Rel(api_server, doc_processor, "Invokes")
    Rel(doc_processor, database, "Stores Embeddings")

    Rel(api_server, ml_service, "Delegates ML tasks", "HTTP")
    Rel(ml_service, ollama, "Routes queries", "HTTP")

    Rel(mcp_handler, orchestrator, "Sends requests", "StdIO/Pipe")

    Rel(orchestrator, research_agent, "Delegates")
    Rel(orchestrator, content_agent, "Delegates")
    Rel(orchestrator, learning_agent, "Delegates")
    Rel(orchestrator, project_agent, "Delegates")
    Rel(orchestrator, career_agent, "Delegates")
    Rel(orchestrator, engineering_agent, "Delegates")

    Rel(research_agent, gemini, "Uses for reasoning", "HTTPS")
    Rel(content_agent, gemini, "Uses for generation", "HTTPS")

    UpdateRelStyle(user, frontend, $textColor="blue", $lineColor="blue")
    UpdateRelStyle(frontend, api_server, $textColor="blue", $lineColor="blue")
```

## Component Details

### 1. Frontend Application
- **Tech Stack**: React, Vite, Tailwind CSS, Axios.
- **Role**: Serves as the user interface. It handles user input, displays chat interfaces, renders rich content (Markdown, Charts), and manages state.
- **Communication**: Communicates with the Backend via RESTful APIs and WebSockets (for real-time agent feedback).

### 2. Backend API
- **Tech Stack**: Node.js, Express.js, Mongoose.
- **Role**: The central orchestrator.
  - **API Server**: Handles standard REST endpoints, authentication, and file uploads.
  - **Document Processor**: A specialized service ("The Information Alchemist") that handles file uploads, content extraction (PDF, DOCX), and vector embeddings.
  - **MCP WebSocket Handler**: Manages the bi-directional communication channel for the AI agents.

### 3. MCP Agent Controller
- **Tech Stack**: Python.
- **Role**: Implements the logic for the "Agentic" system. Runs as a child process spawned by the Node.js backend.
- **Agents**:
  - **Workflow Coordinator**: (`AgentOrchestrator`) The "Master Orchestrator" that analyzes queries and routes them to the correct agent or creates a multi-step workflow.
  - **Research Analyst**: (`ResearchAssistantAgent`) "The Knowledge Hunter". Specialized in web search (DuckDuckGo), fact-checking, and citation management.
  - **Content Creator**: (`CreativeAgent`) "The Digital Artisan". Specialized in writing, storytelling, and content generation.
  - **Learning Assistant**: (`AcademicAssistantAgent`) "The Personalized Tutor". Manages study schedules, grades, and assignments.
  - **Project Manager**: (`ProjectManagementAgent`) Handles GitHub integration and project tracking.
  - **Career Advisor**: (`CareerDevelopmentAgent`) Helps with job applications and interviews.
  - **Engineering Tools**: (`EngineeringToolsAgent`) Manages CAD files and technical reports.

### 4. ML Inference Service
- **Tech Stack**: Python, FastAPI.
- **Role**: Provides specialized machine learning capabilities.
  - **Query Classification**: Determines the intent of user queries.
  - **Model Routing**: Decides which LLM to use.
  - **Embeddings**: Generates vector embeddings for documents.

### 5. Database
- **Tech Stack**: MongoDB.
- **Role**: Persistent storage for user data, chat history, and vector embeddings.
