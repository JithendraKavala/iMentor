import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppState } from '../../contexts/AppStateContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    MessageSquare, Plus, Settings, LogOut, User,
    MoreHorizontal, ChevronRight, Sparkles, Library,
    Trash2, Cpu, FileText, Share2, Mic // Added Share2, Mic
} from 'lucide-react';
import LLMSelectionModal from './LLMSelectionModal';
import ProfileSettingsModal from '../profile/ProfileSettingsModal';
import Modal from '../core/Modal'; // Generic Modal
import SubjectList from '../documents/SubjectList';
import toast from 'react-hot-toast';

// Helper for date formatting
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days <= 7) return 'Previous 7 Days';
    if (days <= 30) return 'Previous 30 Days';
    return 'Older';
};

const GroupedHistory = ({ sessions, selectedSessionId, onSelect, onDelete }) => {
    if (!sessions?.length) return <div className="text-gray-500 text-sm p-4 text-center">No history yet.</div>;

    const grouped = sessions.reduce((acc, session) => {
        const group = formatDate(session.updatedAt);
        if (!acc[group]) acc[group] = [];
        acc[group].push(session);
        return acc;
    }, {});

    return Object.entries(grouped).map(([group, groupSessions]) => (
        <div key={group} className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-2">{group}</h3>
            <ul>
                {groupSessions.map(session => (
                    <li key={session.sessionId} className="relative group">
                        <button
                            onClick={() => onSelect(session.sessionId)}
                            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                                ${selectedSessionId === session.sessionId
                                    ? 'bg-gray-800 text-white'
                                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                                }`}
                        >
                            <MessageSquare size={16} className={selectedSessionId === session.sessionId ? 'text-indigo-400' : 'text-gray-500'} />
                            <div className="flex-1 truncate relative">
                                {session.preview || "New Chat"}
                                <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-900 to-transparent ${selectedSessionId === session.sessionId ? 'from-gray-800' : 'group-hover:from-gray-800/50'}`}></div>
                            </div>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(session.sessionId); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 shadow-sm rounded-md"
                            title="Delete Chat"
                        >
                            <Trash2 size={13} />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    ));
};

function Sidebar({ authUser, onLogout, onSelectSession }) {
    const {
        handleNewChat,
        currentSessionId,
        selectedLLM, switchLLM,
        systemPrompt, setSystemPrompt,
        selectedSubject, setSelectedSubject,
        setIsRightPanelOpen,
        setRightPanelMode
    } = useAppState();

    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // UI States
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLLMModalOpen, setIsLLMModalOpen] = useState(false);
    const [isCustomInstructionsOpen, setIsCustomInstructionsOpen] = useState(false);
    const [isSubjectsModalOpen, setIsSubjectsModalOpen] = useState(false);
    const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);

    const userMenuRef = useRef(null);

    // Fetch History
    const fetchHistory = useCallback(async () => {
        setIsLoadingHistory(true);
        try {
            const data = await api.getChatSessions();
            const sorted = (Array.isArray(data) ? data : []).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            setSessions(sorted);
        } catch (err) {
            console.error("Failed to load history", err);
        } finally {
            setIsLoadingHistory(false);
        }
    }, []);

    // Initial Load & Refresh when currentSessionId changes
    useEffect(() => {
        fetchHistory();
    }, [fetchHistory, currentSessionId]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDeleteSession = async (sessionId) => {
        if (!window.confirm("Delete this chat?")) return;
        try {
            await api.deleteChatSession(sessionId);
            setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
            if (currentSessionId === sessionId) {
                handleNewChat();
            }
            toast.success("Chat deleted");
        } catch (e) {
            toast.error("Failed to delete chat");
        }
    };

    return (
        <>
            <aside className="flex flex-col h-full bg-chat-sidebar-light dark:bg-chat-sidebar-dark text-chat-text-light dark:text-chat-text-dark border-r border-border-light dark:border-white/10 w-[260px] flex-shrink-0">
                <div className="p-3 pb-2 space-y-2">
                    <button
                        onClick={() => { handleNewChat(); }}
                        className="flex items-center justify-between w-full px-3 py-2.5 bg-gray-100/5 hover:bg-gray-100/10 border border-white/5 rounded-lg text-sm font-medium transition-colors group"
                    >
                        <span className="flex items-center gap-2 text-white">
                            <Plus size={16} /> New Chat
                        </span>
                        <MessageSquare size={14} className="text-gray-500 group-hover:text-white transition-colors" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar">
                    {isLoadingHistory ? (
                        <div className="p-4 text-xs text-center text-gray-500">Loading history...</div>
                    ) : (
                        <GroupedHistory
                            sessions={sessions}
                            selectedSessionId={currentSessionId}
                            onSelect={onSelectSession}
                            onDelete={handleDeleteSession}
                        />
                    )}
                </div>

                <div className="p-3 border-t border-white/10 relative" ref={userMenuRef}>
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-3 w-full p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold border border-white/10">
                            {authUser?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 text-left overflow-hidden">
                            <div className="text-sm font-medium truncate text-white">
                                {authUser?.username || 'User'}
                            </div>
                        </div>
                        <Settings size={16} className="text-gray-500" />
                    </button>

                    {isUserMenuOpen && (
                        <div className="absolute bottom-full left-3 right-3 mb-2 bg-chat-surface-light dark:bg-chat-surface-dark border border-white/10 shadow-2xl rounded-xl overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-bottom-2">
                            <div className="px-3 py-2 border-b border-white/5 text-xs text-gray-500 font-medium">
                                Preferences
                            </div>

                            <button onClick={() => setIsCustomInstructionsOpen(true)} className="w-full text-left px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2">
                                <FileText size={16} /> Custom Instructions
                            </button>

                            <button onClick={() => setIsSubjectsModalOpen(true)} className="w-full text-left px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2">
                                <Library size={16} /> Admin Subjects
                            </button>

                            <button onClick={() => setIsProfileSettingsOpen(true)} className="w-full text-left px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2">
                                <Settings size={16} /> Settings
                            </button>

                            <div className="h-px bg-white/10 my-1" />

                            <button onClick={onLogout} className="w-full text-left px-3 py-2.5 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2">
                                <LogOut size={16} /> Log out
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            <LLMSelectionModal
                isOpen={isLLMModalOpen}
                onClose={() => setIsLLMModalOpen(false)}
                currentLLM={selectedLLM}
                onSelectLLM={(llm) => { switchLLM(llm); setIsLLMModalOpen(false); }}
            />

            <ProfileSettingsModal
                isOpen={isProfileSettingsOpen}
                onClose={() => setIsProfileSettingsOpen(false)}
            />

            <Modal isOpen={isCustomInstructionsOpen} onClose={() => setIsCustomInstructionsOpen(false)} title="Custom Instructions" size="lg">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        How would you like iMentor to respond?
                    </p>
                    <textarea
                        className="w-full h-48 input-field text-sm font-mono"
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        placeholder="e.g. You are an expert physicist..."
                    />
                    <div className="flex justify-end">
                        <button onClick={() => setIsCustomInstructionsOpen(false)} className="btn-primary">Save</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isSubjectsModalOpen} onClose={() => setIsSubjectsModalOpen(false)} title="Subject Knowledge" size="xl">
                <SubjectList
                    onSelectSubject={(s) => { setSelectedSubject(s); setIsSubjectsModalOpen(false); }}
                    selectedSubject={selectedSubject}
                />
            </Modal>
        </>
    );
}

// Wrapper to handle props cleanly
export default function SidebarWrapper(props) {
    return <Sidebar {...props} />;
}
