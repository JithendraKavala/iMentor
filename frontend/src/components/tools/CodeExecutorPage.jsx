// frontend/src/components/tools/CodeExecutorPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Save, FilePlus, ChevronLeft } from 'lucide-react';
import CodeEditorWrapper from './CodeEditorWrapper';
import TestCaseManager from './TestCaseManager';
import OutputDisplay from './OutputDisplay';
import AIAssistantBot from './AIAssistantBot';
import Modal from '../core/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CodeExecutorPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [languages, setLanguages] = useState([]);
    const [language, setLanguage] = useState('python');
    const [languageId, setLanguageId] = useState(71); // Default to Python (71)

    const [code, setCode] = useState('');
    const [testCases, setTestCases] = useState([
        { input: '', expectedOutput: '' }
    ]);

    const [fileId, setFileId] = useState(null);
    const [filename, setFilename] = useState('');
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    const [pendingExecution, setPendingExecution] = useState(false);

    const [results, setResults] = useState([]);
    const [compilationError, setCompilationError] = useState(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionId, setExecutionId] = useState(0);

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const langs = await api.getLanguages();
                const sorted = langs.sort((a, b) => a.name.localeCompare(b.name));
                setLanguages(sorted);

                if (!location.state) {
                    const py = sorted.find(l => l.name.toLowerCase().includes('python'));
                    if (py) {
                        setLanguageId(py.id);
                        setLanguage(py.name);
                    } else if (sorted.length > 0) {
                        setLanguage(sorted[0].name);
                        setLanguageId(sorted[0].id);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch languages:", err);
            }
        };
        fetchLanguages();
    }, []);

    useEffect(() => {
        if (location.state) {
            const { fileId: fid, initialCode, initialLanguage, filename: fname } = location.state;
            if (fid) setFileId(fid);
            if (fname) setFilename(fname);
            if (initialCode) setCode(initialCode);
            if (initialLanguage) {
                setLanguage(initialLanguage);
            }
        } else {
            resetState();
        }
    }, [location.state]);

    // Safety fallback: Update ID if language name changes and we have the list
    useEffect(() => {
        if (languages.length > 0 && language) {
            const match = languages.find(l => l.name === language) ||
                languages.find(l => l.name.toLowerCase() === language.toLowerCase()) ||
                languages.find(l => l.name.toLowerCase().includes(language.toLowerCase()));

            if (match) {
                setLanguageId(match.id);
            }
        }
    }, [language, languages]);


    const resetState = () => {
        setFileId(null);
        setFilename('');
        setCode('');
        setResults([]);
        setCompilationError(null);
    };

    const handleNewFile = () => {
        if (code.trim() !== '' && !window.confirm("Are you sure? Unsaved changes will be lost.")) {
            return;
        }
        navigate('/tools/code-executor', { replace: true, state: null });
        resetState();
    };

    const handleLanguageChange = (newLanguageName) => {
        setLanguage(newLanguageName);
        // Instant ID lookup
        const match = languages.find(l => l.name === newLanguageName);
        if (match) {
            setLanguageId(match.id);
        }
    };

    const performSave = async (nameToSave) => {
        // Resolve ID on demand
        let activeLangId = languageId;
        if (!activeLangId && languages.length > 0) {
            const match = languages.find(l => l.name === language) || languages.find(l => l.name.toLowerCase().includes(language.toLowerCase()));
            if (match) activeLangId = match.id;
        }

        if (!activeLangId) {
            toast.error("Language not recognized. Using default (71).");
            activeLangId = 71; // Forced fallback
        }

        const toastId = toast.loading('Saving file...');
        try {
            const payload = {
                filename: nameToSave || filename,
                language,
                languageId: activeLangId,
                content: code
            };
            if (fileId) payload._id = fileId;

            const savedFile = await api.createCodeFile(payload);

            setFileId(savedFile._id);
            setFilename(savedFile.filename);

            toast.success('File saved successfully', { id: toastId });
            return savedFile;
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to save file", { id: toastId });
            throw error;
        }
    };

    const handleSaveFromModal = async (nameToSave) => {
        try {
            const savedFile = await performSave(nameToSave);
            setIsSaveModalOpen(false);

            if (pendingExecution) {
                setPendingExecution(false);
                performExecution(savedFile._id);
            }
        } catch (e) { }
    };

    const onSaveClick = () => {
        if (fileId) {
            performSave();
        } else {
            setIsSaveModalOpen(true);
        }
    };

    const performExecution = async (currentFileId) => {
        let activeLangId = languageId;
        if (!activeLangId && languages.length > 0) {
            const match = languages.find(l => l.name === language) || languages.find(l => l.name.toLowerCase().includes(language.toLowerCase()));
            if (match) activeLangId = match.id;
        }

        if (!activeLangId) {
            // If still no ID, try to just assume standard ones (Python=71, JS=63)
            if (language.toLowerCase().includes('python')) activeLangId = 71;
            else if (language.toLowerCase().includes('javascript')) activeLangId = 63;
            else {
                toast.error("Please select a language first.");
                return;
            }
        }

        setExecutionId(prevId => prevId + 1);
        setIsExecuting(true);
        setResults([]);
        setCompilationError(null);
        const toastId = toast.loading('Executing code...');

        try {
            const response = await api.executeCode({
                language,
                languageId: activeLangId,
                code,
                testCases,
                fileId: currentFileId
            });

            if (response.compilationError) {
                setCompilationError(response.compilationError);
                toast.error("Code failed to compile.", { id: toastId });
            } else {
                setResults(response.results);
                const failures = response.results.filter(r => r.status !== 'pass').length;
                if (failures > 0) {
                    toast.error(`${failures} test case(s) failed or had errors.`, { id: toastId });
                } else {
                    toast.success('All test cases passed!', { id: toastId });
                }
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || "An unknown error occurred.";
            setCompilationError(errorMessage);
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsExecuting(false);
        }
    };

    const handleExecuteClick = async () => {
        if (fileId) {
            try {
                await performSave();
                performExecution(fileId);
            } catch (e) { }
        } else {
            setPendingExecution(true);
            setIsSaveModalOpen(true);
            toast("Please save your file before running.", { icon: "💾" });
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#18181b] text-white font-sans relative">
            {/* Header: Dark Gray (zinc-900) */}
            <header className="flex-shrink-0 bg-[#18181b] border-b border-white/10 h-14 flex items-center justify-between px-4 z-10 w-full">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/tools/files')} className="text-gray-400 hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-semibold text-gray-100">{filename || 'Untitled Script'}</h1>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{language || 'Select Language'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleNewFile}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <FilePlus size={14} /> New
                    </button>
                    <button
                        onClick={onSaveClick}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition-colors"
                    >
                        <Save size={14} /> Save
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-hidden">
                <PanelGroup direction="horizontal">
                    <Panel defaultSize={65} minSize={30}>
                        <PanelGroup direction="vertical">
                            <Panel defaultSize={60} minSize={20}>
                                <div className="h-full bg-[#1e1e1e]">
                                    <CodeEditorWrapper
                                        code={code} setCode={setCode}
                                        language={language}
                                        setLanguage={handleLanguageChange}
                                        availableLanguages={languages}
                                        onExecute={handleExecuteClick} isExecuting={isExecuting}
                                    />
                                </div>
                            </Panel>
                            {/* Resize Handles: Darkest Gray */}
                            <PanelResizeHandle className="h-2 bg-[#121212] hover:bg-blue-600/50 transition-colors" />
                            <Panel defaultSize={40} minSize={20}>
                                <div className="h-full bg-[#1e1e1e] border-t border-white/5">
                                    <OutputDisplay
                                        key={executionId}
                                        results={results}
                                        compilationError={compilationError}
                                        code={code}
                                        language={language}
                                    />
                                </div>
                            </Panel>
                        </PanelGroup>
                    </Panel>
                    <PanelResizeHandle className="w-2 bg-[#121212] hover:bg-blue-600/50 transition-colors" />
                    <Panel defaultSize={35} minSize={25}>
                        <div className="h-full bg-[#1e1e1e] border-l border-white/5">
                            <TestCaseManager
                                testCases={testCases}
                                setTestCases={setTestCases}
                                code={code}
                                language={language}
                            />
                        </div>
                    </Panel>
                </PanelGroup>
            </div>

            <AIAssistantBot code={code} language={language} />

            <SaveFileNameModal
                isOpen={isSaveModalOpen}
                onClose={() => {
                    setIsSaveModalOpen(false);
                    setPendingExecution(false);
                }}
                onSave={handleSaveFromModal}
            />
        </div>
    );
};

const SaveFileNameModal = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(name);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Save File" size="sm">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Filename</label>
                    <input
                        autoFocus
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-[#252525] border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-blue-600 outline-none placeholder-gray-600"
                        placeholder="e.g. my_algorithm.py"
                        required
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">Save & Run</button>
                </div>
            </form>
        </Modal>
    );
};

export default CodeExecutorPage;