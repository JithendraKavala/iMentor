# System Architecture

```mermaid
graph TD
    %% Define Styles
    classDef frontend fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:black;
    classDef backend fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:black;
    classDef python fill:#FFF3E0,stroke:#EF6C00,stroke-width:2px,color:black;
    classDef db fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px,color:black;
    classDef external fill:#FFEBEE,stroke:#C62828,stroke-width:2px,color:black;
    classDef monitor fill:#E0F2F1,stroke:#00695C,stroke-width:2px,color:black;
    classDef agent fill:#FFF9C4,stroke:#FBC02D,stroke-width:2px,color:black,stroke-dasharray: 5 5;

    %% User Interaction
    User((User)) -->|HTTP/HTTPS| Frontend[Frontend (React.js)]:::frontend

    %% Frontend
    subgraph Client_Layer [Client Layer]
        Frontend
        Frontend -->|API Requests| API_Gateway
    end

    %% Backend Server
    subgraph Application_Layer [Application Layer]
        API_Gateway[Node.js Server]:::backend
        RAG_Service[Python RAG Service]:::python

        API_Gateway -->|REST API| RAG_Service
        API_Gateway <-->|Auth/Session| Redis
        API_Gateway -->|User Data| MongoDB
        API_Gateway -->|Knowledge Graph| Neo4j

        RAG_Service -->|Embeddings| Qdrant
        RAG_Service -->|Graph Data| Neo4j
        RAG_Service -->|Uploads| S3

        %% Orchestration
        LLM_Router(LLM Router):::backend
        ToT_Orchestrator(ToT Orchestrator):::backend
        API_Gateway --- LLM_Router
        API_Gateway --- ToT_Orchestrator
    end

    %% Logical Agent Layer (Mapped to Services)
    subgraph Logical_Agents [Logical Agent Layer]
        Coordinator[⚙️ Coordinator]:::agent
        ResearchAnalyst[🔬 Research Analyst]:::agent
        DocProcessor[📄 Document Processor]:::agent
        ContentCreator[📝 Content Creator]:::agent
        LearningAssistant[🎓 Learning Assistant]:::agent

        %% Mappings
        Coordinator -.->|Implemented via| LLM_Router
        Coordinator -.->|Implemented via| ToT_Orchestrator
        ResearchAnalyst -.->|Implemented via| RAG_Service
        DocProcessor -.->|Implemented via| RAG_Service
        ContentCreator -.->|Implemented via| RAG_Service
        LearningAssistant -.->|Implemented via| API_Gateway
    end

    %% Data Layer
    subgraph Data_Layer [Data & Storage Layer]
        MongoDB[(MongoDB)]:::db
        Redis[(Redis)]:::db
        Qdrant[(Qdrant Vector DB)]:::db
        Neo4j[(Neo4j Graph DB)]:::db
    end

    %% External Services
    subgraph External_Services [External Services]
        Gemini[Gemini API]:::external
        Ollama[Ollama (Local LLM)]:::external
        S3[AWS S3]:::external
        Sentry[Sentry (Error Tracking)]:::external
    end

    API_Gateway -->|Inference| Gemini
    API_Gateway -->|Inference| Ollama
    RAG_Service -->|Inference| Ollama
    API_Gateway -.->|Errors| Sentry
    RAG_Service -.->|Errors| Sentry

    %% Observability Stack
    subgraph Observability_Stack [Observability Layer]
        Prometheus[Prometheus]:::monitor
        Grafana[Grafana]:::monitor
        Elasticsearch[Elasticsearch]:::monitor
        Kibana[Kibana]:::monitor
        Filebeat[Filebeat]:::monitor
    end

    API_Gateway -.->|Metrics| Prometheus
    Prometheus --> Grafana

    API_Gateway -.->|Logs| Filebeat
    RAG_Service -.->|Logs| Filebeat
    Filebeat --> Elasticsearch
    Elasticsearch --> Kibana

    %% Port Mapping Note
    note[Ports: Frontend:2173, Node:2000, Python:2001, Redis:2005, Neo4j:2004, Qdrant:2003, Prometheus:2008, Grafana:2009]:::monitor
```
