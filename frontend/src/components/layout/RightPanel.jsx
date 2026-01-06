// frontend/src/components/layout/RightPanel.jsx
import React, { useState } from 'react';
import { useAppState } from '../../contexts/AppStateContext';
import AnalysisToolRunner from '../analysis/AnalysisToolRunner.jsx';
import PodcastGenerator from '../analysis/PodcastGenerator.jsx';
import KnowledgeGraphViewer from '../analysis/KnowledgeGraphViewer.jsx';
import RealtimeKgPanel from '../analysis/RealtimeKgPanel.jsx';
import DocumentUpload from '../documents/DocumentUpload.jsx'; // NEW
import DocumentList from '../documents/DocumentList.jsx';     // NEW
import api from '../../services/api.js';
import { PanelRightClose, ChevronDown, ChevronUp, Telescope, Radio, BrainCircuit, Share2, Book, Library } from 'lucide-react'; // Added Book, Library
import IconButton from '../core/IconButton.jsx';
import Modal from '../core/Modal.jsx';
import Button from '../core/Button.jsx';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

function RightPanel({ isChatProcessing }) {
    const { setIsRightPanelOpen, selectedDocumentForAnalysis, selectedSubject, rightPanelMode, setRightPanelMode, selectDocumentForAnalysis } = useAppState();
    const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(true);

    // --- Knowledge Base State ---
    const [kbRefreshKey, setKbRefreshKey] = useState(0);

    // --- THIS IS THE NEW STATE FOR THE LIVE KG MODAL ---
    const [isLiveKgModalOpen, setIsLiveKgModalOpen] = useState(false);


    const currentSelectedDocFilename = selectedDocumentForAnalysis || selectedSubject || null;
    const isTargetAdminSubject = !!(selectedSubject && currentSelectedDocFilename && selectedSubject === currentSelectedDocFilename);

    // Auto-manage visibility based on selection AND mode
    React.useEffect(() => {
        if (currentSelectedDocFilename || rightPanelMode === 'knowledge_base') {
            setIsRightPanelOpen(true);
        } else {
            setIsRightPanelOpen(false);
        }
    }, [currentSelectedDocFilename, rightPanelMode, setIsRightPanelOpen]);

    if (!currentSelectedDocFilename && rightPanelMode !== 'knowledge_base') return null;

    const isKbMode = rightPanelMode === 'knowledge_base';

    return (
        <>
            <div className={`flex flex-col h-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-l border-slate-200/50 dark:border-slate-800/50 text-slate-900 dark:text-white ${isChatProcessing ? 'processing-overlay' : ''}`}>
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/50">
                    <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        {isKbMode ? <><Library size={16} /> My Knowledge Base</> : 'Toolkit'}
                    </h2>
                    <IconButton
                        icon={PanelRightClose}
                        onClick={() => {
                            setIsRightPanelOpen(false);
                            if (isKbMode) setRightPanelMode(null); // Reset mode on close
                        }}
                        title="Close Panel"
                        variant="ghost" size="sm"
                        className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                    />
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar p-4 space-y-6">

                    {/* --- KNOWLEDGE BASE MODE --- */}
                    {isKbMode && (
                        <div className="animate-fadeIn space-y-6">
                            <DocumentUpload onSourceAdded={() => setKbRefreshKey(prev => prev + 1)} />
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Your Sources</h3>
                                <DocumentList key={kbRefreshKey} onSelectDocument={selectDocumentForAnalysis} selectedDocument={selectedDocumentForAnalysis} />
                            </div>
                        </div>
                    )}

                    {/* --- TOOLKIT MODE (Existing) --- */}
                    {!isKbMode && (
                        <>
                            {/* Live Map Card */}
                            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-800/50 border border-indigo-100 dark:border-slate-700/50 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                        <Share2 size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Mind Map</h3>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Visualize concept connections in real-time.</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setIsLiveKgModalOpen(true)}
                                    size="sm"
                                    fullWidth
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none border-none"
                                >
                                    Open Map
                                </Button>
                            </div>

                            {/* Tools Section */}
                            {currentSelectedDocFilename && (
                                <div className="space-y-4">
                                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                                        <button onClick={() => setIsAnalyzerOpen(!isAnalyzerOpen)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200"><Telescope size={16} className="text-indigo-500" /> Document Tools</span>
                                            {isAnalyzerOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                        </button>
                                        <AnimatePresence>
                                            {isAnalyzerOpen && (
                                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="border-t border-slate-100 dark:border-slate-800">
                                                    <div className="p-2 space-y-2 bg-slate-50/50 dark:bg-black/20">
                                                        <AnalysisToolRunner toolType="faq" title="Generate FAQs" iconName="HelpCircle" selectedDocumentFilename={currentSelectedDocFilename} isTargetAdminDoc={isTargetAdminSubject} />
                                                        <AnalysisToolRunner toolType="topics" title="Extract Topics" iconName="Tags" selectedDocumentFilename={currentSelectedDocFilename} isTargetAdminDoc={isTargetAdminSubject} />
                                                        <AnalysisToolRunner toolType="mindmap" title="Create Mind Map" iconName="GitFork" selectedDocumentFilename={currentSelectedDocFilename} isTargetAdminDoc={isTargetAdminSubject} />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                                        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                                            <Radio size={16} className="text-rose-500" /> Freeflow
                                        </div>
                                        <PodcastGenerator selectedDocumentFilename={currentSelectedDocFilename} />
                                    </div>
                                </div>
                            )}
                        </>
                    )} {/* End of Toolkit Mode */}
                </div>
            </div>

            {/* --- MODAL FOR THE LIVE KG --- */}
            <Modal isOpen={isLiveKgModalOpen} onClose={() => setIsLiveKgModalOpen(false)} title="Live Concept Map" size="5xl">
                <div className="h-[75vh] bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <RealtimeKgPanel />
                </div>
            </Modal>
        </>
    );
}
export default RightPanel; 