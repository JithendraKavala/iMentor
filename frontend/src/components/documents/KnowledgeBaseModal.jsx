import React, { useState } from 'react';
import Modal from '../core/Modal';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';
import { useAppState } from '../../contexts/AppStateContext';

const KnowledgeBaseModal = ({ isOpen, onClose }) => {
    const { toggleDocumentSelection, selectedDocuments } = useAppState();
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="My Knowledge Base"
            size="2xl"
        >
            <div className="space-y-6">
                <div className="bg-chat-surface-light dark:bg-chat-surface-dark p-4 rounded-xl border border-slate-100 dark:border-white/5">
                    <h3 className="text-sm font-semibold text-chat-text-light dark:text-chat-text-dark mb-3">Add New Source</h3>
                    <DocumentUpload onSourceAdded={() => setRefreshKey(prev => prev + 1)} />
                </div>

                <div className="pt-2">
                    <h3 className="text-sm font-semibold text-chat-text-light dark:text-chat-text-dark mb-3">Your Library</h3>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                        <DocumentList
                            key={refreshKey}
                            toggleDocumentSelection={toggleDocumentSelection}
                            selectedDocuments={selectedDocuments}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default KnowledgeBaseModal;
