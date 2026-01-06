// frontend/src/data/solutionsData.js
import {
    GraduationCap,
    BookOpen,
    BrainCircuit,
    Code,
    FileQuestion,
    Headphones,
    Zap,
    Share2,
    CheckCircle2
} from 'lucide-react';

export const solutionsData = {
    'study-plans': {
        id: 'study-plans',
        title: "Personalized Study Plans",
        subtitle: "Curriculum Design Engine",
        icon: GraduationCap,
        shortDescription: "Describe your learning goals and get a custom, step-by-step curriculum with actionable modules.",
        heroImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=2070",
        deepDive: {
            heading: "Stop guessing what to learn next.",
            description: "iMentor's curriculum engine analyzes your goals and current knowledge level to build a structured path to mastery. It's not just a list of topics—it's a pedagogical strategy adapting to your pace.",
        },
        features: [
            {
                title: "Adaptive Pacing",
                description: "The schedule adjusts automatically based on your module completion speed and quiz performance."
            },
            {
                title: "Resource Aggregation",
                description: "Each module comes pre-loaded with high-quality readings, videos, and practice exercises."
            },
            {
                title: "Milestone Tracking",
                description: "Visual progress bars and achievement badges keep you motivated as you advance."
            }
        ]
    },
    'research-assistant': {
        id: 'research-assistant',
        title: "Advanced Research Assistant",
        subtitle: "Academic Search & Synthesis",
        icon: BookOpen,
        shortDescription: "Engage with academic papers, search the web for real-time information, and chat with your documents.",
        heroImage: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=2070",
        deepDive: {
            heading: "Your 24/7 Research Partner.",
            description: "Turn hours of literature review into minutes. Access millions of academic papers, filter by citation count, and have the AI summarize findings, methodologies, and limitations instantly.",
        },
        features: [
            {
                title: "Citation-Backed Answers",
                description: "Every claim is backed by a verifiable source link, eliminating hallucinations."
            },
            {
                title: "Multi-Document Chat",
                description: "Upload up to 50 PDFs and ask questions across your entire library simultaneously."
            },
            {
                title: "Smart Synthesis",
                description: "Generate literature review matrices comparing different papers automatically."
            }
        ]
    },
    'visual-analysis': {
        id: 'visual-analysis',
        title: "Deep Visualization",
        subtitle: "Knowledge Graph Engine",
        icon: BrainCircuit,
        shortDescription: "Visualize concepts as interactive knowledge graphs and mind maps to reveal hidden connections.",
        heroImage: "https://images.unsplash.com/photo-1558494949-ef2bb6db9836?auto=format&fit=crop&q=80&w=2070",
        deepDive: {
            heading: "See the connections others miss.",
            description: "Complex topics are rarely linear. Our Knowledge Graph engine parses unstructured text to visualize the relationships between entities, helping you build a mental model faster.",
        },
        features: [
            {
                title: "Interactive Graphs",
                description: "Click on any node to expand its definition and see related concepts in real-time."
            },
            {
                title: "Auto-Mindmapping",
                description: "Convert any lecture note or article into a hierarchical mind map with one click."
            },
            {
                title: "Concept Exports",
                description: "Export high-resolution images of your graphs for presentations or study guides."
            }
        ]
    },
    'code-executor': {
        id: 'code-executor',
        title: "Secure Code Executor",
        subtitle: "Sandboxed Development Environment",
        icon: Code,
        shortDescription: "Write, run, and test code in multiple languages with AI-powered debugging and explanations.",
        heroImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=2070",
        deepDive: {
            heading: "Learn by doing, safely.",
            description: "Execute Python, JavaScript, and C++ code directly in your browser. Stuck on a bug? The AI analyzes your stack trace and suggests specific fixes without just giving you the answer.",
        },
        features: [
            {
                title: "Live Execution",
                description: "Instant output for code snippets with support for standard libraries."
            },
            {
                title: "Test Case Generation",
                description: "Automatically generate unit tests to verify your algorithm's correctness."
            },
            {
                title: "Logic Explainers",
                description: "Highlight any code block to get a plain-English explanation of what it does."
            }
        ]
    },
    'quiz-generator': {
        id: 'quiz-generator',
        title: "AI Quiz Generator",
        subtitle: "Active Recall Automation",
        icon: FileQuestion,
        shortDescription: "Instantly generate multiple-choice quizzes from your documents to test comprehension.",
        heroImage: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80&w=2070",
        deepDive: {
            heading: "Master material through active recall.",
            description: "Passive reading is inefficient. iMentor transforms your passive notes into active assessments, identifying your weak spots before the exam does.",
        },
        features: [
            {
                title: "Difficulty Tuning",
                description: "Adjust from 'Easy' fact-checks to 'Hard' application questions."
            },
            {
                title: "Instant Grading",
                description: "Get immediate feedback with detailed explanations for every wrong answer."
            },
            {
                title: "Format Variety",
                description: "Supports Multiple Choice, True/False, and Fill-in-the-Blank formats."
            }
        ]
    },
    'content-creation': {
        id: 'content-creation',
        title: "Content Creation",
        subtitle: "Study Material Converter",
        icon: Headphones,
        shortDescription: "Transform study materials into audio podcasts or export detailed analysis docs.",
        heroImage: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=2070",
        deepDive: {
            heading: "Learn while you commute.",
            description: "Convert dense PDFs into engaging, conversational audio summaries. Perfect for reviewing material while walking, driving, or working out.",
        },
        features: [
            {
                title: "Text-to-Podcast",
                description: "Natural-sounding voices discuss your material in a two-host podcast format."
            },
            {
                title: "Slide Generation",
                description: "Export key points into a PowerPoint-ready outline automatically."
            },
            {
                title: "Summary Docs",
                description: "Download perfectly formatted Word docs of your session insights."
            }
        ]
    }
};
