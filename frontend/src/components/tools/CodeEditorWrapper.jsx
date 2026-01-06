// frontend/src/components/tools/CodeEditorWrapper.jsx
import React, { useState } from 'react';
import { Play, Copy, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import IconButton from '../core/IconButton';
import CodeEditor from './CodeEditor';
import toast from 'react-hot-toast';
import { copyToClipboard } from '../../utils/helpers';

const CodeEditorWrapper = ({ code, setCode, language, setLanguage, onExecute, isExecuting, availableLanguages = [] }) => {

    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const success = await copyToClipboard(code);
        if (success) {
            toast.success("Code copied to clipboard!");
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        } else {
            toast.error("Failed to copy code.");
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] border-none rounded-none overflow-hidden">
            <header className="flex items-center justify-between p-2 bg-[#1e1e1e] border-b border-white/5 flex-shrink-0">
                <div className="relative">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="appearance-none bg-[#252525] text-gray-300 text-xs py-1.5 pl-3 pr-8 rounded-md border border-white/10 hover:border-white/20 focus:border-blue-600 outline-none transition-colors cursor-pointer"
                    >
                        {availableLanguages.length > 0 ? (
                            availableLanguages.map(lang => (
                                <option key={lang.id} value={lang.name}>{lang.name}</option>
                            ))
                        ) : (
                            <>
                                <option value="python">Python</option>
                                <option value="javascript">JavaScript</option>
                                <option value="java">Java</option>
                                <option value="c">C</option>
                                <option value="cpp">C++</option>
                            </>
                        )}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                </div>
                <div className="flex items-center gap-2">
                    <IconButton
                        icon={() => (
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.span
                                    key={copied ? 'check' : 'copy'}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-400" />}
                                </motion.span>
                            </AnimatePresence>
                        )}
                        size="sm"
                        onClick={handleCopy}
                        title="Copy Code"
                        className="hover:bg-white/10 text-gray-400 hover:text-white"
                    />
                    <button
                        onClick={onExecute}
                        disabled={isExecuting}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-md transition-colors shadow-sm"
                    >
                        {isExecuting ? (
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Play size={14} fill="currentColor" />
                        )}
                        Run
                    </button>
                </div>
            </header>
            <div className="flex-grow overflow-hidden relative bg-[#1e1e1e]">
                <CodeEditor code={code} setCode={setCode} language={language} theme="vs-dark" />
            </div>
        </div>
    );
};

export default CodeEditorWrapper;