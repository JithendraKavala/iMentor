import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronUp, Mic, Download, Share2, FileText, List, Map, Check, X, ArrowRight, BrainCircuit } from 'lucide-react';
import MindmapViewer from '../analysis/MindmapViewer.jsx';
import { motion, AnimatePresence } from 'framer-motion';

// Specialized sub-components for each tool type

const QuizRenderer = ({ data, onAction }) => {
    // Determine if data is wrapped { faqs: [...] } or just [...]
    // The new prompt schema returns array of objects with id, question, options, correctAnswer.
    // We treat "faqs" as "questions" now.
    const questions = Array.isArray(data) ? data : (data.faqs || []);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [results, setResults] = useState([]); // Array of { questionId, isCorrect, userAnswer }
    const [showSummary, setShowSummary] = useState(false);

    if (!questions || questions.length === 0) return null;

    const currentQuestion = questions[currentIndex];

    // Safety check for old FAQ format vs new MCQ format
    const isMCQ = currentQuestion.options && Array.isArray(currentQuestion.options);

    const handleOptionClick = (option) => {
        if (isAnswered) return;
        setSelectedOption(option);
        setIsAnswered(true);

        const isCorrect = option === currentQuestion.correctAnswer;
        setResults(prev => [...prev, {
            id: currentQuestion.id || currentIndex,
            question: currentQuestion.question,
            isCorrect: isCorrect,
            userAnswer: option,
            correctAnswer: currentQuestion.correctAnswer
        }]);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowSummary(true);
        }
    };

    const handleAnalyze = () => {
        if (!onAction) return;

        // Format results for the AI
        let analysisRequest = "Analyze my quiz results:\n";
        results.forEach((r, idx) => {
            analysisRequest += `Q${idx + 1}: ${r.question}\nMy Answer: ${r.userAnswer} (${r.isCorrect ? 'Correct' : 'Incorrect'})\nCorrect Answer: ${r.correctAnswer}\n\n`;
        });
        analysisRequest += "Please explain my mistakes and provide a summary of my understanding.";

        onAction(analysisRequest);
    };

    if (showSummary) {
        const score = results.filter(r => r.isCorrect).length;
        return (
            <div className="bg-white/50 dark:bg-black/20 p-6 rounded-xl border border-slate-100 dark:border-white/5 text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
                    <BrainCircuit size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Quiz Completed!</h3>
                <p className="text-slate-600 dark:text-slate-300">
                    You scored <span className="font-bold text-indigo-500 text-lg">{score}</span> out of <span className="font-bold">{questions.length}</span>
                </p>

                <div className="pt-4">
                    <button
                        onClick={handleAnalyze}
                        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                        <BrainCircuit size={18} />
                        Analyze My Results with AI
                    </button>
                    <p className="text-xs text-slate-500 mt-2">Get personalized feedback and explanations for your answers.</p>
                </div>
            </div>
        );
    }

    if (!isMCQ) {
        // Fallback for old FAQ format
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-black/5 dark:border-white/5">
                    <FileText size={16} className="text-amber-500" />
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Generated FAQs</h3>
                </div>
                {questions.map((faq, idx) => (
                    <div key={idx} className="bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                        <h4 className="font-medium text-slate-900 dark:text-white mb-2 flex gap-2">
                            <span className="text-amber-500 font-bold">Q{idx + 1}:</span> {faq.question}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-300 text-sm pl-8 border-l-2 border-slate-200 dark:border-white/10 ml-1">
                            {faq.answer}
                        </p>
                    </div>
                ))}
            </div>
        );
    }

    // MCQ Render
    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Progress Header */}
            <div className="flex items-center justify-between mb-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span>Question {currentIndex + 1} / {questions.length}</span>
                <span>Test Your Knowledge</span>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm"
                >
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 leading-relaxed">
                        {currentQuestion.question}
                    </h3>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option, idx) => {
                            let stateStyles = "border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-white/5";
                            let icon = <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs opacity-50">{String.fromCharCode(65 + idx)}</span>;

                            if (isAnswered) {
                                if (option === currentQuestion.correctAnswer) {
                                    stateStyles = "border-green-500 bg-green-50/50 dark:bg-green-900/20 text-green-700 dark:text-green-300 pointer-events-none";
                                    icon = <Check size={18} className="text-green-500" />;
                                } else if (option === selectedOption) {
                                    stateStyles = "border-red-500 bg-red-50/50 dark:bg-red-900/20 text-red-700 dark:text-red-300 pointer-events-none";
                                    icon = <X size={18} className="text-red-500" />;
                                } else {
                                    stateStyles = "opacity-50 border-transparent pointer-events-none";
                                }
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionClick(option)}
                                    disabled={isAnswered}
                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 ${stateStyles}`}
                                >
                                    <div className="flex-shrink-0">
                                        {icon}
                                    </div>
                                    <span className="font-medium text-sm">{option}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Feedback & Next Action */}
                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between min-h-[50px]">
                        <div className="flex-1">
                            {isAnswered && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    <div className="text-sm">
                                        {selectedOption === currentQuestion.correctAnswer ? (
                                            <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1"><Check size={14} /> Correct!</span>
                                        ) : (
                                            <span className="text-red-500 dark:text-red-400 font-semibold flex items-center gap-1"><X size={14} /> Incorrect</span>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={!isAnswered}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${isAnswered
                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 shadow-md"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                                }`}
                        >
                            {currentIndex === questions.length - 1 ? "Finish" : "Next"} <ArrowRight size={14} />
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

const TopicsRenderer = ({ data }) => {
    if (!data || !data.topics || !Array.isArray(data.topics)) return null;
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-black/5 dark:border-white/5">
                <List size={16} className="text-indigo-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Key Topics Extracted</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.topics.map((topic, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-500/10">
                        <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                        <div>
                            <span className="font-medium text-slate-800 dark:text-indigo-100 block">{topic.name || topic.topic}</span>
                            {topic.description && (
                                <span className="text-xs text-slate-500 dark:text-indigo-200/70 mt-1 block leading-relaxed">{topic.description}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Helper to recursive build mermaid mindmap string
const generateMermaidMindmap = (node, depth = 0) => {
    const indent = '  '.repeat(depth + 1);
    let label = node.label || node.topic || node.name || 'Node';
    // Escape special characters for Mermaid
    label = label.replace(/"/g, '').replace(/\(/g, '').replace(/\)/g, '');

    let mermaid = `${indent}${label}\n`;

    if (node.children && Array.isArray(node.children)) {
        node.children.forEach(child => {
            mermaid += generateMermaidMindmap(child, depth + 1);
        });
    }
    return mermaid;
};

const MindMapRenderer = ({ data }) => {
    // Determine the root node. In the raw Object case, the 'data' IS the root.
    // If it was wrapped like { root: ... }, we use data.root.
    const rootNode = data.root || data;

    const mermaidCode = useMemo(() => {
        if (!rootNode) return '';
        return `mindmap\n  root((${rootNode.label || rootNode.topic || 'Main Topic'}))\n${(rootNode.children || []).map(child => generateMermaidMindmap(child, 1)).join('')
            }`;
    }, [rootNode]);

    if (!rootNode) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-black/5 dark:border-white/5">
                <Map size={16} className="text-purple-500" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Mind Map Structure</h3>
            </div>
            <div className="h-96 w-full bg-white dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden">
                <MindmapViewer mermaidCode={mermaidCode} />
            </div>
        </div>
    );
};


const ToolOutputRenderer = ({ content, onAction }) => {
    const [parsedData, setParsedData] = useState(null);

    // Attempt to parse JSON content on mount/update
    useEffect(() => {
        if (typeof content !== 'string') {
            setParsedData(content); // Already an object?
            return;
        }
        try {
            // Check if it looks like JSON before parsing to avoid unnecessary errors
            const trimmed = content.trim();
            // Allow Arrays [ ... ] or Objects { ... }
            if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
                const data = JSON.parse(trimmed);
                setParsedData(data);
            } else {
                setParsedData(null); // Not JSON, render as text
            }
        } catch (e) {
            console.warn("ToolOutputRenderer: Failed to parse JSON content", e);
            setParsedData(null); // Fallback to text rendering
        }
    }, [content]);

    if (!parsedData) return null; // Let the parent render plain text if not valid tool JSON

    // Determine type based on properties or structure
    // 1. Quiz/FAQ (Array of objects with question/options OR Wrapped { faqs: ... })
    // We now look for 'options' to identify the Quiz format, or fallback to 'answer' for old FAQ.
    if (Array.isArray(parsedData) && parsedData.length > 0) {
        if (parsedData[0].question && (parsedData[0].options || parsedData[0].answer)) {
            return <QuizRenderer data={parsedData} onAction={onAction} />;
        }
    }
    if (parsedData.faqs) return <QuizRenderer data={parsedData} onAction={onAction} />;

    // 2. Topics (Array of objects with topic/name/description OR Wrapped { topics: ... })
    if (Array.isArray(parsedData) && parsedData.length > 0 && (parsedData[0].topic || parsedData[0].name)) {
        return <TopicsRenderer data={{ topics: parsedData }} />;
    }
    if (parsedData.topics) return <TopicsRenderer data={parsedData} />;

    // 3. Mindmap (Object with children/id/label OR Wrapped { root: ... })
    // If it has children array, it's likely a mindmap node.
    if ((parsedData.children && Array.isArray(parsedData.children)) || parsedData.id === 'root' || parsedData.root) {
        return <MindMapRenderer data={parsedData} />;
    }

    // Podcast usually returns distinct action or URL, typically handled separately by 'action' payload.

    return null; // Unknown JSON structure, fallback to text
};

export default ToolOutputRenderer;
