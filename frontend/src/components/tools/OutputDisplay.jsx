// frontend/src/components/tools/OutputDisplay.jsx
import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import Button from '../core/Button';
import IconButton from '../core/IconButton';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const createMarkup = (markdownText) => {
    if (!markdownText) return { __html: '' };
    const rawHtml = marked.parse(markdownText);
    const cleanHtml = DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
    return { __html: cleanHtml };
};

const CopyablePre = ({ content }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(content).then(() => {
            setCopied(true);
            toast.success('Copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="relative group">
            <pre className="bg-[#111] border border-white/10 p-2 rounded whitespace-pre-wrap font-mono text-gray-300 text-xs">{content || '(empty)'}</pre>
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <IconButton
                    icon={copied ? Check : Copy}
                    onClick={handleCopy}
                    title={copied ? 'Copied!' : 'Copy'}
                    size="sm"
                    className={`${copied ? 'text-green-500' : 'text-gray-400'} hover:bg-white/10`}
                />
            </div>
        </div>
    );
};


const OutputDisplay = ({ results, compilationError, code, language }) => {
    const [explanation, setExplanation] = useState(null);
    const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
    const [explanationFor, setExplanationFor] = useState(null); // 'compilation' or test case index

    const handleExplainError = async (errorContext, errorMessage) => {
        setIsLoadingExplanation(true);
        setExplanation(null);
        setExplanationFor(errorContext);
        try {
            const response = await api.explainError({ code, language, errorMessage });
            setExplanation(response.explanation);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to get explanation.");
        } finally {
            setIsLoadingExplanation(false);
        }
    };

    if (compilationError) {
        return (
            <div className="p-4 bg-[#1e1e1e] text-red-400 h-full flex flex-col font-sans">
                <div className="flex justify-between items-center mb-2 flex-shrink-0">
                    <h3 className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wide text-red-500"><AlertTriangle size={16} /> Compilation Error</h3>
                    {!explanation && (
                        <Button size="sm" variant="ghost" className="!text-xs text-red-400 hover:bg-red-900/20" leftIcon={<Sparkles size={12} />} onClick={() => handleExplainError('compilation', compilationError)} isLoading={isLoadingExplanation && explanationFor === 'compilation'}>
                            Explain Error
                        </Button>
                    )}
                </div>
                <div className="flex-grow overflow-auto custom-scrollbar">
                    <CopyablePre content={compilationError} />
                </div>
                {isLoadingExplanation && explanationFor === 'compilation' && (
                    <div className="mt-2 p-3 text-sm text-center text-gray-400"><Loader2 className="animate-spin inline mr-2" size={14} />AI is explaining the error...</div>
                )}
                {explanation && explanationFor === 'compilation' && (
                    <div className="mt-2 p-3 bg-indigo-900/10 rounded-md border border-indigo-500/20 flex-shrink-0">
                        <h5 className="font-bold text-xs mb-1 text-indigo-400 flex items-center gap-1.5"><Sparkles size={12} /> AI Explanation</h5>
                        <div className="prose prose-sm prose-invert max-w-none text-gray-300 text-xs" dangerouslySetInnerHTML={createMarkup(explanation)} />
                    </div>
                )}
            </div>
        );
    }

    if (!results || results.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500 bg-[#1e1e1e] h-full flex flex-col items-center justify-center font-sans">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <Sparkles className="text-gray-600" size={20} />
                </div>
                <p className="text-sm">Run the code to see output.</p>
            </div>
        );
    }

    const getStatusIcon = (status) => {
        if (status === 'pass') return <CheckCircle className="text-green-500" size={16} />;
        if (status === 'fail') return <XCircle className="text-yellow-500" size={16} />;
        return <AlertTriangle className="text-red-500" size={16} />;
    };

    const score = results.filter(r => r.status === 'pass').length;

    return (
        <div className="p-4 bg-[#1e1e1e] h-full flex flex-col font-sans">
            <h3 className="text-sm font-semibold mb-4 flex-shrink-0 flex justify-between items-center text-gray-200 uppercase tracking-wide">
                <span>Execution Results</span>
                <span className={`text-xs font-bold px-2 py-1 rounded border ${score === results.length ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                    {score} / {results.length} Passed
                </span>
            </h3>
            <div className="flex-grow space-y-3 overflow-y-auto custom-scrollbar pr-1">
                {results.map((res, index) => (
                    <div key={index} className="p-3 bg-[#252525] rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-sm flex items-center gap-2 text-gray-300">
                                {getStatusIcon(res.status)}
                                Test Case #{index + 1}
                            </h4>
                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${res.status === 'pass' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {res.status}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-3 text-xs">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <strong className="block mb-1 text-gray-500">Input</strong>
                                    <div className="bg-[#1a1a1a] p-2 rounded border border-white/5 text-gray-300 font-mono text-[11px] truncate">
                                        {res.input || <span className="text-gray-600 italic">None</span>}
                                    </div>
                                </div>
                                <div>
                                    <strong className="block mb-1 text-gray-500">Expected</strong>
                                    <div className="bg-[#1a1a1a] p-2 rounded border border-white/5 text-gray-300 font-mono text-[11px] truncate">
                                        {res.expected || <span className="text-gray-600 italic">None</span>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <strong className="block mb-1 text-gray-500">Actual Output</strong>
                                <div className={`relative group p-2 rounded border border-white/5 font-mono text-[11px] whitespace-pre-wrap ${res.status === 'pass' ? 'bg-green-900/10 text-green-100' : 'bg-red-900/10 text-red-100'}`}>
                                    {res.output || <span className="text-gray-500 italic">(empty)</span>}
                                </div>
                            </div>

                            {res.error && (
                                <div className="mt-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <strong className="text-red-400">Error Details</strong>
                                        {explanationFor !== index && (
                                            <button className="text-[10px] flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors" onClick={() => handleExplainError(index, res.error)}>
                                                <Sparkles size={10} /> Explain
                                            </button>
                                        )}
                                    </div>
                                    <div className="bg-red-950/30 border border-red-500/20 p-2 rounded text-red-300 font-mono text-[10px] whitespace-pre-wrap">
                                        {res.error}
                                    </div>
                                </div>
                            )}
                            {isLoadingExplanation && explanationFor === index && (
                                <div className="p-2 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2" size={12} />Analyzing error...</div>
                            )}
                            {explanation && explanationFor === index && (
                                <div className="p-2 bg-indigo-900/10 rounded border border-indigo-500/20">
                                    <h5 className="font-bold mb-1 text-indigo-400 flex items-center gap-1"><Sparkles size={10} /> Analysis</h5>
                                    <div className="prose prose-invert max-w-none text-gray-300 text-[11px]" dangerouslySetInnerHTML={createMarkup(explanation)} />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OutputDisplay;