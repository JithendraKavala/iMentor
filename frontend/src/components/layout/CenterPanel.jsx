// frontend/src/components/layout/CenterPanel.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ChatHistory from '../chat/ChatHistory';
import ChatInput from '../chat/ChatInput';
import PromptCoachModal from '../chat/PromptCoachModal.jsx';
import api from '../../services/api';
import { useAuth as useRegularAuth } from '../../hooks/useAuth';
import { useAppState } from '../../contexts/AppStateContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { BookMarked, Code, Sparkles, ChevronRight, Flame, FileQuestion, ShieldCheck, Cpu } from 'lucide-react';
import LLMSelectionModal from './LLMSelectionModal'; // Import Modal



function CenterPanel({ messages, setMessages, currentSessionId, onChatProcessingChange, initialPromptForNewSession, setInitialPromptForNewSession, initialActivityForNewSession, setInitialActivityForNewSession }) {
    const { token: regularUserToken } = useRegularAuth();
    // Destructure LLM state
    const { setSelectedSubject, systemPrompt, selectedDocuments, selectedSubject, selectedLLM, switchLLM } = useAppState();
    const navigate = useNavigate();
    const location = useLocation();

    const [useWebSearch, setUseWebSearch] = useState(false);
    const [useAcademicSearch, setUseAcademicSearch] = useState(false);
    const [useKnowledgeBase, setUseKnowledgeBase] = useState(false);
    const [activeTool, setActiveTool] = useState('none'); // NEW
    const [criticalThinkingEnabled, setCriticalThinkingEnabled] = useState(false);
    const [isActuallySendingAPI, setIsActuallySendingAPI] = useState(false);
    const abortControllerRef = useRef(null);
    const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
    const [coachData, setCoachData] = useState(null);

    // New: LLM Selector Modal State
    const [isLLMModalOpen, setIsLLMModalOpen] = useState(false);
    // Import LLMSelectionModal if not already available in parent? 
    // Wait, Sidebar had it. CenterPanel needs to import it if we want to use the same modal.
    // Or I can just make a dropdown. The previous sidebar implementation used `LLMSelectionModal`.
    // I should import `LLMSelectionModal` here too.
    // I'll add the import in a subsequent edit or assume it needs to be added.
    // For this step I'll adding the state and the UI. I will need to add the import.

    const handleStreamingSendMessage = useCallback(async (inputText, placeholderId, options) => {
        const payload = {
            query: inputText.trim(),
            sessionId: currentSessionId,
            useWebSearch: options.useWebSearch,
            useAcademicSearch: options.useAcademicSearch,
            systemPrompt,
            criticalThinkingEnabled: options.criticalThinkingEnabled,
            documentContextName: options.documentContextName, // Keep legacy for subject
            tool: options.activeTool, // NEW
            contextFiles: options.contextFiles // NEW: Array of selected files
        };

        // --- THIS IS THE FIX ---
        // Construct the full, correct API URL using the environment variable.
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/chat/message`;

        const response = await fetch(apiUrl, {
            // --- END OF FIX ---
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${regularUserToken}` },
            body: JSON.stringify(payload),
            signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Server error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let finalBotMessageObject = null;
        let accumulatedThinking = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n\n').filter(line => line.startsWith('data: '));

            for (const line of lines) {
                const jsonString = line.replace('data: ', '');
                try {
                    const eventData = JSON.parse(jsonString);
                    if (eventData.type === 'thought') {
                        accumulatedThinking += eventData.content;
                        setMessages(prev => prev.map(msg => msg.id === placeholderId ? { ...msg, thinking: accumulatedThinking, _accumulatedContent: accumulatedThinking } : msg));
                    } else if (eventData.type === 'final_answer') {
                        finalBotMessageObject = eventData.content;
                    } else if (eventData.type === 'error') {
                        throw new Error(eventData.content);
                    }
                } catch (e) {
                    console.error("Error parsing SSE chunk:", jsonString, e);
                }
            }
        }

        if (finalBotMessageObject) {
            // --- THIS IS THE FIX ---
            // Create a new, correctly structured message object for the frontend state.
            // This aligns the streaming response with the format used by chat history loading.
            const finalMessage = {
                ...finalBotMessageObject, // Copy all properties like thinking, references, etc.
                id: finalBotMessageObject.id || placeholderId,
                sender: 'bot', // Ensure sender is set
                text: finalBotMessageObject.finalAnswer, // Map 'finalAnswer' to the 'text' property
                isStreaming: false // Explicitly mark streaming as complete
            };

            // Now, update the state with the correctly formatted final message.
            setMessages(prev => [
                ...prev.filter(msg => msg.id !== placeholderId),
                finalMessage
            ]);
            // --- END OF FIX ---

            if (finalBotMessageObject.action && finalBotMessageObject.action.type === 'DOWNLOAD_DOCUMENT') {
                toast.promise(
                    api.generateDocumentFromTopic(finalBotMessageObject.action.payload),
                    {
                        loading: `Generating your ${finalBotMessageObject.action.payload.docType.toUpperCase()}...`,
                        success: (data) => `Successfully downloaded '${data.filename}'!`,
                        error: (err) => `Download failed: ${err.message}`,
                    }
                );
            }
        }
    }, [currentSessionId, systemPrompt, regularUserToken, setMessages]);

    const handleStandardSendMessage = useCallback(async (inputText, placeholderId, options) => {
        try {
            const response = await api.sendMessage({
                query: inputText.trim(),
                history: messages.slice(0, -2),
                sessionId: currentSessionId,
                useWebSearch: options.useWebSearch,
                useAcademicSearch: options.useAcademicSearch,
                systemPrompt,
                criticalThinkingEnabled: options.criticalThinkingEnabled,
                documentContextName: options.documentContextName,
                tool: options.activeTool,
                contextFiles: options.contextFiles
            });

            if (response && response.reply) {
                // Update messages: Remove placeholder (if any) and add the real reply
                setMessages(prev => {
                    // If we had a placeholder, filter it out. 
                    // Note: In standard mode, we might just append. 
                    // But if usage pattern implies a placeholder was added before calling this, we should remove it.
                    const clean = prev.filter(m => m.id !== placeholderId);
                    return [...clean, { ...response.reply, id: response.reply.id || Date.now().toString() }];
                });

                if (response.reply.action && response.reply.action.type === 'DOWNLOAD_DOCUMENT') {
                    toast.promise(
                        api.generateDocumentFromTopic(response.reply.action.payload),
                        {
                            loading: `Generating your ${response.reply.action.payload.docType.toUpperCase()}...`,
                            success: (data) => `Successfully downloaded '${data.filename}'!`,
                            error: (err) => `Download failed: ${err.message}`,
                        }
                    );
                }
            } else {
                throw new Error("Invalid response from AI service.");
            }
        } catch (error) {
            console.error("Standard Message Failed:", error);
            setMessages(prev => prev.filter(m => m.id !== placeholderId)); // Remove placeholder on error
            toast.error(error.message || "Failed to send message.");
        }
    }, [messages, currentSessionId, systemPrompt, setMessages]);


    const handleSendMessage = useCallback(async (inputText, options = {}) => {
        if (!inputText.trim() || !regularUserToken || !currentSessionId || isActuallySendingAPI) return;

        const effectiveUseWebSearch = options.useWebSearch ?? useWebSearch;
        const effectiveUseAcademicSearch = options.useAcademicSearch ?? useAcademicSearch;
        const effectiveCriticalThinking = options.criticalThinkingEnabled ?? criticalThinkingEnabled;

        // Context Logic: Use Knowledge Base toggle
        // If options.documentContextName is explicit (from suggestion), use it.
        // Else if useKnowledgeBase is ON, use selectedDocuments (array) or selectedSubject.
        let effectiveDocumentContext = options.documentContextName;
        let effectiveContextFiles = [];

        if (options.useKnowledgeBase ?? useKnowledgeBase) {
            if (selectedSubject) {
                effectiveDocumentContext = selectedSubject;
            } else if (selectedDocuments && selectedDocuments.length > 0) {
                effectiveContextFiles = selectedDocuments;
            }
        }

        abortControllerRef.current = new AbortController();

        const userMessage = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: inputText.trim(),
            timestamp: new Date().toISOString(),
        };

        const streamingPlaceholderId = `bot-streaming-${Date.now()}`;
        const placeholderMessage = {
            id: streamingPlaceholderId,
            sender: 'bot',
            text: '',
            thinking: effectiveCriticalThinking ? '' : null,
            isStreaming: true,
            timestamp: new Date().toISOString(),
            _accumulatedContent: ''
        };

        setMessages(prev => [...prev, userMessage, placeholderMessage]);
        onChatProcessingChange(true);
        setIsActuallySendingAPI(true);

        try {
            const handlerOptions = {
                useWebSearch: effectiveUseWebSearch,
                useAcademicSearch: effectiveUseAcademicSearch,
                criticalThinkingEnabled: effectiveCriticalThinking,
                documentContextName: effectiveDocumentContext,
                activeTool: options.activeTool, // Pass tool
                contextFiles: effectiveContextFiles // Pass files
            };

            if (effectiveCriticalThinking) {
                await handleStreamingSendMessage(inputText, streamingPlaceholderId, handlerOptions);
            } else {
                await handleStandardSendMessage(inputText, streamingPlaceholderId, handlerOptions);
            }
        } catch (error) {
            console.error("Error in handleSendMessage:", error);

            const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred.";

            setMessages(prev => prev.map(msg =>
                msg.id === streamingPlaceholderId
                    ? { ...msg, isStreaming: false, text: `Error: ${error.message}` }
                    : msg
            ));
            toast.error(errorMessage);
        } finally {
            setIsActuallySendingAPI(false);
            onChatProcessingChange(false);
            setUseWebSearch(false);
            setUseAcademicSearch(false);
        }
    }, [
        regularUserToken, currentSessionId, isActuallySendingAPI, useWebSearch,
        useAcademicSearch, criticalThinkingEnabled, selectedSubject,
        selectedDocuments, setMessages, onChatProcessingChange,
        handleStreamingSendMessage, handleStandardSendMessage, systemPrompt
    ]);


    // Recommendations effect removed






    return (
        <div className="flex flex-col h-full bg-chat-bg-light dark:bg-chat-bg-dark rounded-lg shadow-inner relative overflow-hidden">

            {/* Top Right Model Selector */}
            <div className="absolute top-4 right-6 z-10">
                <button
                    onClick={() => setIsLLMModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 transition-all shadow-sm"
                >
                    <Cpu size={14} className="text-indigo-500 dark:text-indigo-400" />
                    <span>{selectedLLM.toUpperCase()}</span>
                    <ChevronRight size={14} className="opacity-50" />
                </button>
            </div>

            {/* Main Content Area - Constrained Width */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center w-full">
                <div className="w-full max-w-4xl flex-1 flex flex-col">
                    {messages.length === 0 && !isActuallySendingAPI && currentSessionId ? (
                        <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 animate-fadeIn">
                            {/* ... Empty State Content ... */}
                            <div className="w-full max-w-2xl mx-auto text-center space-y-8">
                                <div className="flex justify-center mb-6">
                                    <div className="p-4 bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10">
                                        <Sparkles size={32} className="text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                        How can I help you learn today?
                                    </h1>
                                    <p className="text-lg text-slate-600 dark:text-slate-400">
                                        I'm your AI tutor. Ask me to explain concepts, quiz you, or review your work.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-4">
                                    {[
                                        { icon: BookMarked, label: "Explain a topic", prompt: "Explain quantum entanglement in simple terms." },
                                        { icon: FileQuestion, label: "Generate a quiz", prompt: "Create a 5-question quiz about European History." },
                                        { icon: Code, label: "Review code", prompt: "Review this Python code for security vulnerabilities." },
                                        { icon: ShieldCheck, label: "Check essay", prompt: "Analyze my essay for logical fallacies." }
                                    ].map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSendMessage(suggestion.prompt, { activeTool })} // Pass activeTool
                                            className="p-4 bg-chat-surface-light dark:bg-chat-surface-dark hover:bg-chat-hover-light dark:hover:bg-chat-hover-dark border border-slate-200 dark:border-white/5 rounded-xl transition-all shadow-sm hover:shadow-md group flex items-start gap-4"
                                        >
                                            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-indigo-500 dark:text-indigo-400 transition-colors">
                                                <suggestion.icon size={20} />
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-white text-sm">{suggestion.label}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{suggestion.prompt}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <ChatHistory messages={messages} onCueClick={handleSendMessage} />
                    )}
                </div>
            </div>

            <div className="w-full max-w-4xl mx-auto w-full">
                <ChatInput
                    onSendMessage={handleSendMessage}
                    isLoading={isActuallySendingAPI}
                    useWebSearch={useWebSearch}
                    setUseWebSearch={setUseWebSearch}
                    useAcademicSearch={useAcademicSearch}
                    setUseAcademicSearch={setUseAcademicSearch}
                    criticalThinkingEnabled={criticalThinkingEnabled}
                    setCriticalThinkingEnabled={setCriticalThinkingEnabled}
                    useKnowledgeBase={useKnowledgeBase}
                    setUseKnowledgeBase={setUseKnowledgeBase}
                    initialPrompt={initialPromptForNewSession}
                    setInitialPromptForNewSession={setInitialPromptForNewSession}
                    openCoachModalWithData={setCoachData}
                    setCoachModalOpen={setIsCoachModalOpen}
                    activeTool={activeTool}
                    setActiveTool={setActiveTool}
                />
            </div>

            <PromptCoachModal
                isOpen={isCoachModalOpen}
                onClose={() => setIsCoachModalOpen(false)}
                onApply={(improvedPrompt) => {
                    setInitialPromptForNewSession(improvedPrompt);
                }}
                data={coachData}
            />

            <LLMSelectionModal
                isOpen={isLLMModalOpen}
                onClose={() => setIsLLMModalOpen(false)}
                currentLLM={selectedLLM}
                onSelectLLM={(llm) => { switchLLM(llm); setIsLLMModalOpen(false); }}
            />
        </div>
    );
}

export default CenterPanel;