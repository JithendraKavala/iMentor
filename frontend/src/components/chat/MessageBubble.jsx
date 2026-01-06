import React, { useEffect, useRef, useState, useCallback, memo, useMemo } from 'react';
import { marked } from 'marked';
import Prism from 'prismjs';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Link as LinkIcon, Zap, Server, Volume2, StopCircle, ServerCrash, Copy, Check, Lightbulb, ThumbsUp, ThumbsDown, ShieldCheck, GitFork, FlaskConical } from 'lucide-react';
import ThinkingDropdown from './ThinkingDropdown.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import { useTextToSpeech } from '../../hooks/useTextToSpeech.js';
import IconButton from '../core/IconButton.jsx';
import { renderMathInHtml } from '../../utils/markdownUtils';
import { getPlainTextFromMarkdown, copyToClipboard } from '../../utils/helpers.js';
import DOMPurify from 'dompurify';
import { useTypingEffect } from '../../hooks/useTypingEffect.js';
import api from '../../services/api.js';
import ToolOutputRenderer from './ToolOutputRenderer.jsx'; // Import the renderer

marked.setOptions({ breaks: true, gfm: true });

const createMarkup = (markdownText) => {
    if (!markdownText) return { __html: '' };

    let processedText = markdownText.trim();

    if (processedText.startsWith('```markdown') && processedText.endsWith('```')) {
        processedText = processedText.substring('```markdown'.length, processedText.length - 3).trim();
    } else if (processedText.startsWith('```') && processedText.endsWith('```')) {
        const firstNewLine = processedText.indexOf('\n');
        if (firstNewLine !== -1) {
            processedText = processedText.substring(firstNewLine + 1, processedText.length - 3).trim();
        }
    }

    let rawHtml = marked.parse(processedText);
    rawHtml = renderMathInHtml(rawHtml);
    const cleanHtml = DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true, mathMl: true, svg: true } });
    return { __html: cleanHtml };
};

const escapeHtml = (unsafe) => {
    if (typeof unsafe !== 'string') return '';
    return unsafe.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, `"`).replace(/'/g, "'");
};

const AnimatedThinking = ({ content }) => {
    const [completedTyping, setCompletedTyping] = useState('');
    const [currentTyping, setCurrentTyping] = useState('');
    const [isWaiting, setIsWaiting] = useState(true);
    const lastContentRef = useRef('');

    useEffect(() => {
        if (content && content.length > lastContentRef.current.length) {
            const newChunk = content.substring(lastContentRef.current.length);
            setCurrentTyping(newChunk);
            setIsWaiting(false);
            lastContentRef.current = content;
        }
    }, [content]);

    const onTypingComplete = useCallback(() => {
        setCompletedTyping(prev => prev + currentTyping);
        setCurrentTyping('');
        setIsWaiting(true);
    }, [currentTyping]);

    const animatedChunk = useTypingEffect(currentTyping, 4, onTypingComplete);
    const combinedText = completedTyping + animatedChunk;

    return (
        <div className="prose prose-xs dark:prose-invert max-w-none text-text-muted-light dark:text-text-muted-dark">
            <div dangerouslySetInnerHTML={createMarkup(combinedText)} />
            {isWaiting && <span className="animate-pulse"> Thinking...</span>}
        </div>
    );
};

const CodeBlockWithCopyButton = ({ children, codeText, key }) => {
    const [copied, setCopied] = useState(false);
    const codeRef = useRef(null);

    useEffect(() => {
        if (codeRef.current) {
            Prism.highlightAllUnder(codeRef.current);
        }
    }, [children, copied]);

    const handleCopyCode = async () => {
        const success = await copyToClipboard(codeText);
        if (success) {
            setCopied(true);
            toast.success('Code copied!');
            setTimeout(() => setCopied(false), 1500);
        } else {
            toast.error('Failed to copy code.');
        }
    };

    return (
        <div className="relative group/code" ref={codeRef} key={key}>
            <div dangerouslySetInnerHTML={{ __html: children }} />
            <button
                onClick={handleCopyCode}
                title={copied ? 'Copied!' : 'Copy code'}
                disabled={copied}
                className="absolute top-1 right-1 p-1.5 rounded-md cursor-pointer text-text-muted-dark bg-gray-700/80 backdrop-blur-sm transition-opacity duration-200 opacity-0 group-hover/code:opacity-100"
            >
                <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                        key={copied ? 'check' : 'copy'}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                    >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </motion.span>
                </AnimatePresence>
            </button>
        </div>
    );
};

const parseAndRenderMarkdown = (markdownText, messageId) => {
    if (!markdownText) return [];

    let htmlString = createMarkup(markdownText).__html;

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const resultNodes = [];
    let currentHtmlBuffer = '';

    const flushHtmlBuffer = () => {
        if (currentHtmlBuffer) {
            resultNodes.push(
                <div key={`html-${messageId}-${resultNodes.length}-${Math.random().toString(36).substring(2, 9)}`}
                    dangerouslySetInnerHTML={{ __html: currentHtmlBuffer }} />
            );
            currentHtmlBuffer = '';
        }
    };

    const traverse = (node) => {
        if (!node) return;

        if (node.nodeName === 'PRE') {
            flushHtmlBuffer();

            const codeElement = node.querySelector('code');
            const codeText = codeElement ? codeElement.textContent : '';
            const preOuterHtml = node.outerHTML;

            resultNodes.push(
                <CodeBlockWithCopyButton
                    key={`code-${messageId}-${resultNodes.length}-${Math.random().toString(36).substring(2, 9)}`}
                    codeText={codeText}
                >
                    {preOuterHtml}
                </CodeBlockWithCopyButton>
            );
            return;
        }

        if (node.nodeType === Node.TEXT_NODE) {
            currentHtmlBuffer += node.nodeValue;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            currentHtmlBuffer += node.outerHTML;
            return;
        }

        Array.from(node.childNodes).forEach(traverse);
    };

    Array.from(doc.body.children).forEach(traverse);

    flushHtmlBuffer();

    return resultNodes;
};

const CriticalThinkingCue = ({ icon: Icon, label, text, color, onClick }) => {
    const colorClasses = {
        sky: {
            bg: "bg-primary/5 dark:bg-primary/10",
            text: "text-text-light dark:text-text-dark",
            hoverBg: "hover:bg-primary/10 dark:hover:bg-primary/20",
            iconText: "text-primary dark:text-primary-light",
        },
        amber: {
            bg: "bg-primary/5 dark:bg-primary/10",
            text: "text-text-light dark:text-text-dark",
            hoverBg: "hover:bg-primary/10 dark:hover:bg-primary/20",
            iconText: "text-primary dark:text-primary-light",
        },
        emerald: {
            bg: "bg-primary/5 dark:bg-primary/10",
            text: "text-text-light dark:text-text-dark",
            hoverBg: "hover:bg-primary/10 dark:hover:bg-primary/20",
            iconText: "text-primary dark:text-primary-light",
        }
    };
    const styles = colorClasses[color] || colorClasses.sky;

    return (
        <motion.button
            variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
            }}
            onClick={onClick}
            className={`w-full text-left p-2.5 rounded-lg transition-colors duration-200 ${styles.bg} ${styles.hoverBg}`}
        >
            <div className="flex items-center gap-2 mb-1">
                <Icon size={16} className={styles.iconText} />
                <span className={`text-xs font-bold ${styles.text}`}>{label}</span>
            </div>
            <p className={`text-xs ${styles.text}`}>{text}</p>
        </motion.button>
    );
};




function MessageBubble({ sender, text, thinking, references, timestamp, sourcePipeline, isStreaming, criticalThinkingCues, onCueClick, messageId, logId }) {
    const isUser = sender === 'user';
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [feedbackSent, setFeedbackSent] = useState(null);
    const contentRef = useRef(null);
    const { speak, cancel, isSpeaking } = useTextToSpeech();

    const [isCopied, setIsCopied] = useState(false);

    // Check if text is likely JSON tool output (Array or Object)
    const [isToolOutput, cleanedContent] = useMemo(() => {
        if (!text || typeof text !== 'string') return [false, ''];
        let trimmed = text.trim();

        // Strip markdown code blocks if present
        if (trimmed.startsWith('```')) {
            const firstNewLine = trimmed.indexOf('\n');
            if (firstNewLine !== -1) {
                trimmed = trimmed.substring(firstNewLine + 1).trim();
            }
            if (trimmed.endsWith('```')) {
                trimmed = trimmed.substring(0, trimmed.length - 3).trim();
            }
        }

        // Remove "json" language identifier if it was left over or handled by above
        if (trimmed.startsWith('json')) {
            trimmed = trimmed.substring(4).trim();
        }

        // Check for JSON start/end brackets
        const isJson = (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
            (trimmed.startsWith('[') && trimmed.endsWith(']'));

        // Check for likely tool properties to avoid false positives (e.g. code blocks)
        // We look for keys like "question", "answer", "topic", "children", "id"
        // But also, if it's a bare array of objects, might be tricky. 
        // Let's rely on basic JSON + reasonable length/content heuristics or known keys.
        const hasToolKeys = trimmed.includes('"question"') ||
            trimmed.includes('"topic"') ||
            trimmed.includes('"root"') ||
            trimmed.includes('"children"') ||
            trimmed.includes('"id"') ||
            trimmed.includes('"description"') ||
            trimmed.includes('"options"') ||
            trimmed.includes('"correctAnswer"');

        return [isJson && hasToolKeys, trimmed];
    }, [text]);

    const mainContent = text || '';


    const thinkingContent = thinking;
    const showThinkingDropdown = !isUser && thinkingContent !== null;

    useEffect(() => {
        if (contentRef.current && !isStreaming) {
            const timer = setTimeout(() => {
                Prism.highlightAllUnder(contentRef.current);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isStreaming, mainContent]);

    const handleFeedback = async (feedbackType) => {
        if (feedbackSent) return; // Prevent multiple submissions
        setFeedbackSent(feedbackType);
        try {
            await api.submitFeedback(logId, feedbackType);
            toast.success('Thanks for your feedback!');
        } catch (error) {
            toast.error('Could not submit feedback.');
            setFeedbackSent(null); // Allow user to try again
        }
    };

    const handleCopy = async () => {
        if (isCopied) return;
        const plainTextToCopy = getPlainTextFromMarkdown(mainContent);
        const success = await copyToClipboard(plainTextToCopy);

        if (success) {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 1500);
            toast.success('Message copied!');
        } else {
            toast.error('Failed to copy message.');
        }
    };

    const formatTimestamp = (ts) => {
        if (!ts) return '';
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getPipelineIcon = () => {
        if (!sourcePipeline) return null;
        const lower = sourcePipeline.toLowerCase();
        if (lower.includes('ollama')) return <Zap size={12} className="text-green-400" title="Ollama" />;
        if (lower.includes('gemini')) return <Server size={12} className="text-blue-400" title="Gemini" />;
        if (lower.includes('rag')) return <Zap size={12} className="text-purple-400" title="RAG" />;
        if (lower.includes('error')) return <ServerCrash size={12} className="text-red-400" title="Error" />;
        return null;
    };

    return (
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full group`}>
            <div className={`message-bubble-wrapper max-w-[85%] md:max-w-[75%] ${isStreaming ? 'w-full' : ''}`}>
                {showThinkingDropdown && (
                    <div className="mb-1.5">
                        <ThinkingDropdown
                            isOpen={isDropdownOpen}
                            setIsOpen={setIsDropdownOpen}
                            isStreaming={isStreaming}
                        >
                            {isStreaming
                                ? <AnimatedThinking content={thinkingContent} />
                                : <div className="prose prose-xs dark:prose-invert max-w-none text-text-muted-light dark:text-text-muted-dark" dangerouslySetInnerHTML={createMarkup(thinkingContent)} />
                            }
                        </ThinkingDropdown>
                    </div>
                )}

                {isStreaming ? (
                    <TypingIndicator />
                ) : (
                    <div className={`message-bubble relative group/bubble ${isUser
                        ? 'bg-chat-bubble-user-light dark:bg-chat-bubble-user-dark text-chat-text-light dark:text-chat-text-dark rounded-2xl rounded-tr-sm px-5 py-3.5 shadow-sm'
                        : 'bg-transparent text-chat-text-light dark:text-chat-text-dark pl-0'
                        }`}>
                        {!isUser && (
                            <div className="absolute -left-10 top-0 hidden md:flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                <Zap size={16} fill="currentColor" />
                            </div>
                        )}

                        <div ref={contentRef} className={`prose prose-sm dark:prose-invert max-w-none message-content leading-7 ${isUser ? '' : 'prose-headings:font-semibold prose-headings:text-chat-text-light dark:prose-headings:text-chat-text-dark prose-p:text-chat-text-light dark:prose-p:text-chat-text-dark prose-pre:bg-chat-sidebar-dark dark:prose-pre:bg-chat-sidebar-light prose-pre:border prose-pre:border-chat-sidebar-dark dark:prose-pre:border-chat-sidebar-light'}`}>
                            {isToolOutput ? (
                                <ToolOutputRenderer content={cleanedContent} onAction={onCueClick} />
                            ) : (
                                parseAndRenderMarkdown(mainContent, messageId)
                            )}
                        </div>

                        <div className={`flex items-center gap-2 mt-2 text-[10px] text-slate-400 dark:text-slate-500 opacity-0 group-hover/bubble:opacity-100 transition-opacity ${isUser ? 'justify-end' : 'justify-start'}`}>

                            {!isUser && getPipelineIcon() && (
                                <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                                    {getPipelineIcon()} <span className="uppercase tracking-wider">Pipeline</span>
                                </span>
                            )}

                            <span>{formatTimestamp(timestamp)}</span>

                            <div className="flex items-center gap-1 ml-2">
                                <button onClick={handleCopy} title="Copy" className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                    {isCopied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                </button>

                                {!isUser && (
                                    <>
                                        <button onClick={() => isSpeaking ? cancel() : speak({ text: mainContent })} title="Read Aloud" className={`p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors ${isSpeaking ? 'text-indigo-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                                            {isSpeaking ? <StopCircle size={12} /> : <Volume2 size={12} />}
                                        </button>
                                        <div className="w-px h-3 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                                        <button onClick={() => handleFeedback('positive')} disabled={!!feedbackSent} className={`p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors ${feedbackSent === 'positive' ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-500'}`}>
                                            <ThumbsUp size={12} />
                                        </button>
                                        <button onClick={() => handleFeedback('negative')} disabled={!!feedbackSent} className={`p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors ${feedbackSent === 'negative' ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}>
                                            <ThumbsDown size={12} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {!isStreaming && !isUser && references && references.length > 0 && (
                <div className="message-metadata-container max-w-[85%] md:max-w-[75%] mt-1.5 pl-2">
                    <details className="group/details text-xs">
                        <summary className="flex items-center justify-between gap-1 cursor-pointer text-text-muted-light dark:text-text-muted-dark hover:text-primary dark:hover:text-primary-light transition-colors">
                            <span className="flex items-center gap-1">
                                <LinkIcon size={14} /> References
                            </span>
                            <ChevronDown size={14} className="transition-transform group-open/details:rotate-180" />
                        </summary>
                        <ul className="mt-1 pl-1 space-y-0.5 text-[0.7rem]">
                            {references.map((ref, index) => (
                                <li
                                    key={index}
                                    className="text-text-muted-light dark:text-text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors truncate"
                                    title={`Preview: ${escapeHtml(ref.content_preview || '')}\nSource: ${escapeHtml(ref.source || '')}`}
                                >
                                    <span className="font-semibold text-accent">[{ref.number}]</span> {escapeHtml(ref.source)}
                                </li>
                            ))}
                        </ul>
                    </details>
                </div>
            )}

            {!isStreaming && !isUser && criticalThinkingCues && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: {
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                    className="max-w-[85%] md:max-w-[75%] w-full mt-2 pl-2"
                >
                    <div className="border-t border-dashed border-border-light dark:border-border-dark pt-2">
                        <h4 className="text-xs font-semibold text-text-muted-light dark:text-text-muted-dark flex items-center gap-1.5 mb-2">
                            <Lightbulb size={14} />
                            Critical Thinking Prompts
                        </h4>
                        <div className="space-y-2">
                            {criticalThinkingCues.verificationPrompt && (
                                <CriticalThinkingCue
                                    onClick={() => onCueClick(criticalThinkingCues.verificationPrompt)}
                                    icon={ShieldCheck}
                                    label="Verify & Validate"
                                    text={criticalThinkingCues.verificationPrompt}
                                    color="sky"
                                />
                            )}
                            {criticalThinkingCues.alternativePrompt && (
                                <CriticalThinkingCue
                                    onClick={() => onCueClick(criticalThinkingCues.alternativePrompt)}
                                    icon={GitFork}
                                    label="Consider Alternatives"
                                    text={criticalThinkingCues.alternativePrompt}
                                    color="amber"
                                />
                            )}
                            {criticalThinkingCues.applicationPrompt && (
                                <CriticalThinkingCue
                                    onClick={() => onCueClick(criticalThinkingCues.applicationPrompt)}
                                    icon={FlaskConical}
                                    label="Apply Your Knowledge"
                                    text={criticalThinkingCues.applicationPrompt}
                                    color="emerald"
                                />
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default memo(MessageBubble);