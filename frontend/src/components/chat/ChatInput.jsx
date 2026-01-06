// frontend/src/components/chat/ChatInput.jsx
import { useAppState } from '../../contexts/AppStateContext.jsx';
import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api.js';
import { Send, Mic, Plus, Brain, Zap, Globe, BookMarked, Sparkles, Library } from 'lucide-react';
import { useWebSpeech } from '../../hooks/useWebSpeech';
import Button from '../core/Button.jsx';
import IconButton from '../core/IconButton.jsx';
import KnowledgeBaseModal from '../documents/KnowledgeBaseModal.jsx';
import toast from 'react-hot-toast';
import blueBrain from "./../../assets/blueBrain.svg";
import { motion, AnimatePresence } from 'framer-motion';

function ChatInput({
    onSendMessage,
    isLoading,
    useWebSearch,
    setUseWebSearch,
    useAcademicSearch,
    setUseAcademicSearch,
    useKnowledgeBase, // NEW
    setUseKnowledgeBase, // NEW
    activeTool, // NEW
    setActiveTool = () => { }, // Default noop
    criticalThinkingEnabled,
    setCriticalThinkingEnabled,
    initialPrompt,
    setInitialPromptForNewSession,
    openCoachModalWithData,
    setCoachModalOpen
}) {
    const [inputValue, setInputValue] = useState('');
    const { transcript, listening, isSpeechSupported, startListening, stopListening, resetTranscript } = useWebSpeech(); // Keep existing hooks

    // Tool Definitions
    const TOOL_OPTIONS = [
        { id: 'quiz', label: 'Quiz Generator', icon: Sparkles, color: 'text-amber-500' },
        { id: 'faq', label: 'FAQ Generator', icon: BookMarked, color: 'text-teal-500' },
        { id: 'topics', label: 'Key Topic Extractor', icon: Brain, color: 'text-indigo-500' },
        { id: 'mindmap', label: 'Mind Map Extractor', icon: Zap, color: 'text-purple-500' },
        { id: 'podcast', label: 'HD Podcast Generator', icon: Mic, color: 'text-rose-500' }
    ];

    // NEW: Access Right Panel controls (still needed for other tools?)
    // User wants KB as popup, so we use local state or global modal state.
    const [isKbModalOpen, setIsKbModalOpen] = useState(false);

    // We might still need global `setRightPanelMode` if we use it for other things, keeping for now.
    const { setRightPanelMode, setIsRightPanelOpen, rightPanelMode } = useAppState();

    const textareaRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const [isCoaching, setIsCoaching] = useState(false);

    // Check if activeTool is passed as prop or needs to be pulled from context.
    // Based on params list, it's passed as props? 
    // Yes: onSendMessage, ..., activeTool, setActiveTool are in the function signature now.

    const handleRequestPromptCoaching = async () => {
        const trimmedInput = inputValue.trim();

        if (!trimmedInput) return;

        if (trimmedInput.length < 3) {
            toast("Prompt is too short for coaching. Please provide a bit more detail.", {
                icon: '❤️',
                style: { background: '#FBBF24', color: '#ffffff' },
            });
            return;
        }

        if (isCoaching) return;

        setIsCoaching(true);

        const promise = api.analyzePrompt(trimmedInput);

        toast.promise(
            promise,
            {
                loading: 'Asking the coach for advice...',
                success: 'Suggestion received!',
                error: (err) => err.message || "The Prompt Coach is unavailable.",
            }
        );

        try {
            const response = await promise;
            openCoachModalWithData({
                original: trimmedInput,
                improved: response.improvedPrompt,
                explanation: response.explanation
            });
            setCoachModalOpen(true);
        } catch (error) {
            // toast.promise already handled displaying the error.
            console.error("Error requesting prompt coaching:", error.message);
        } finally {
            setIsCoaching(false);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();

        const pastedText = e.clipboardData.getData('text/plain');

        const trimmedText = pastedText.trim();

        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const newValue = inputValue.substring(0, start) + trimmedText + inputValue.substring(end);
        setInputValue(newValue);

        setTimeout(() => {
            const newCursorPosition = start + trimmedText.length;
            textarea.selectionStart = newCursorPosition;
            textarea.selectionEnd = newCursorPosition;
        }, 0);
    };

    useEffect(() => {
        if (initialPrompt) {
            console.log("[ChatInput] Received initial prompt via props:", initialPrompt);
            setInputValue(initialPrompt); // Set the text in the input box
            setInitialPromptForNewSession(null); // Clear the global state immediately
        }
    }, [initialPrompt, setInitialPromptForNewSession]);

    useEffect(() => {
        if (transcript) {
            setInputValue(prev => prev + (prev ? " " : "") + transcript);
            resetTranscript();
        }
    }, [transcript, resetTranscript]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
        }
    }, [inputValue]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim() && !isLoading) {
            onSendMessage(inputValue.trim(), { activeTool });
            setInputValue('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleWebSearchToggle = () => {
        const newWebSearchState = !useWebSearch;
        setUseWebSearch(newWebSearchState);
        if (newWebSearchState) setUseAcademicSearch(false);
        toast(newWebSearchState ? "Web Search enabled." : "Web Search disabled.", { icon: newWebSearchState ? "🌐" : "📄" });
        setIsMenuOpen(false);
    };

    const handleAcademicSearchToggle = () => {
        const newState = !useAcademicSearch;
        setUseAcademicSearch(newState);
        if (newState) { setUseWebSearch(false); setUseKnowledgeBase(false); }
        toast(newState ? "Academic Search enabled." : "Academic Search disabled.", { icon: newState ? "🎓" : "📄" });
        setIsMenuOpen(false);
    };

    const handleKnowledgeBaseToggle = () => {
        const newState = !useKnowledgeBase;
        setUseKnowledgeBase(newState);
        if (newState) { setUseWebSearch(false); setUseAcademicSearch(false); }
        toast(newState ? "Knowledge Base enabled." : "Knowledge Base disabled.", { icon: newState ? "🧠" : "📄" });
        setIsMenuOpen(false);
    };

    const icon = criticalThinkingEnabled ? () => <img src={blueBrain} alt="Blue Brain" className="w-5 h-5" /> : Brain;

    return (
        <div className="w-full max-w-3xl mx-auto px-4 pb-6">
            <div className="relative group rounded-3xl bg-chat-surface-light dark:bg-chat-surface-dark shadow-xl ring-1 ring-black/5 dark:ring-white/10 transition-shadow hover:shadow-2xl">

                {/* Top Actions: Search toggles */}
                <div className="absolute -top-10 left-0 flex items-center gap-2">
                    <AnimatePresence>
                        {activeTool && activeTool !== 'none' && (
                            <motion.span
                                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border ${activeTool === 'faq' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-100 dark:border-amber-800' :
                                    activeTool === 'topics' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800' :
                                        activeTool === 'mindmap' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-100 dark:border-purple-800' :
                                            'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 border-rose-100 dark:border-rose-800' // podcast
                                    }`}
                            >
                                {(() => {
                                    const t = TOOL_OPTIONS.find(opt => opt.id === activeTool);
                                    const Icon = t?.icon || Zap;
                                    return <><Icon size={12} /> {t?.label}</>;
                                })()}
                            </motion.span>
                        )}
                        {useWebSearch && (
                            <motion.span
                                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                                className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-medium flex items-center gap-1.5 border border-blue-100 dark:border-blue-800"
                            >
                                <Globe size={12} /> Web Search On
                            </motion.span>
                        )}
                        {useAcademicSearch && (
                            <motion.span
                                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                                className="px-3 py-1 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 text-xs font-medium flex items-center gap-1.5 border border-purple-100 dark:border-purple-800"
                            >
                                <BookMarked size={12} /> Scholar Search On
                            </motion.span>
                        )}
                        {useKnowledgeBase && (
                            <motion.span
                                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                                className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-medium flex items-center gap-1.5 border border-amber-100 dark:border-amber-800"
                            >
                                <Library size={12} /> Knowledge Base On
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col p-2">
                    <textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        placeholder={isLoading ? "Thinking..." : "Ask anything..."}
                        className="w-full bg-transparent border-0 focus:ring-0 outline-none ring-0 p-3 text-base text-chat-text-light dark:text-chat-text-dark placeholder:text-chat-text-muted-light dark:placeholder:text-chat-text-muted-dark resize-none min-h-[56px] max-h-48 custom-scrollbar"
                        rows="1"
                        disabled={isLoading}
                    />

                    <div className="flex items-center justify-between px-2 pb-1 mt-1">
                        <div className="flex items-center gap-1">
                            <div className="relative" ref={menuRef}>
                                <IconButton
                                    icon={Plus}
                                    title="Options"
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                                />
                                <AnimatePresence>
                                    {isMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            className="absolute bottom-full left-0 mb-3 w-56 bg-chat-surface-light dark:bg-chat-surface-dark rounded-xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-700 p-1.5 z-20 overflow-hidden"
                                        >
                                            <button
                                                onClick={handleWebSearchToggle}
                                                type="button"
                                                className={`w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${useWebSearch
                                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                                    }`}
                                            >
                                                <Globe size={16} />
                                                {useWebSearch ? 'Disable Web Search' : 'Web Search'}
                                            </button>

                                            <button
                                                onClick={handleAcademicSearchToggle}
                                                type="button"
                                                className={`w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${useAcademicSearch
                                                    ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                                    }`}
                                            >
                                                <BookMarked size={16} />
                                                {useAcademicSearch ? 'Disable Academic' : 'Academic Search'}
                                            </button>

                                            <div className="my-1 border-t border-slate-100 dark:border-slate-700/50" />

                                            <p className="px-3 py-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                                AI Tools
                                            </p>

                                            {TOOL_OPTIONS.map((tool) => (
                                                <button
                                                    key={tool.id}
                                                    onClick={() => {
                                                        const newState = activeTool === tool.id ? 'none' : tool.id;
                                                        setActiveTool(newState);
                                                        setIsMenuOpen(false);
                                                        toast(newState !== 'none' ? `${tool.label} active` : `${tool.label} deactivated`, { icon: newState !== 'none' ? '🛠️' : '⚪' });
                                                    }}
                                                    type="button"
                                                    className={`w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${activeTool === tool.id
                                                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                                        }`}
                                                >
                                                    <tool.icon size={16} className={activeTool === tool.id ? '' : tool.color} />
                                                    {tool.label}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <IconButton
                                icon={Library}
                                title="My Knowledge Base"
                                onClick={() => setIsKbModalOpen(true)}
                                variant="ghost"
                                size="sm"
                                className={`transition-colors ${isKbModalOpen ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-slate-400 hover:text-amber-500'}`}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <IconButton
                                icon={Sparkles}
                                onClick={handleRequestPromptCoaching}
                                title="Improve Prompt"
                                variant="ghost"
                                size="sm"
                                className="text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                isLoading={isCoaching}
                                disabled={isLoading || isCoaching || !inputValue.trim()}
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                className={`rounded-xl transition-all ${(!isLoading && inputValue.trim()) ? 'bg-chat-action-DEFAULT text-white hover:bg-chat-action-dark' : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'}`}
                                disabled={isLoading || !inputValue.trim()}
                                isLoading={isLoading && !!inputValue.trim()}
                                title="Send"
                            >
                                <Send size={18} />
                            </Button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="mt-2 text-center text-xs text-chat-text-muted-light dark:text-chat-text-muted-dark">
                iMentor can make mistakes. Consider checking important information.
            </div>

            <KnowledgeBaseModal isOpen={isKbModalOpen} onClose={() => setIsKbModalOpen(false)} />
        </div>
    );
}
export default ChatInput;