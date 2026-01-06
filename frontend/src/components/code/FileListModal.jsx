import React, { useState, useEffect } from 'react';
import Modal from '../core/Modal';
import { FileCode, Clock, Play } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function FileListModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('files'); // 'files' or 'history'
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && activeTab === 'files') {
            loadFiles();
        }
    }, [isOpen, activeTab]);

    const loadFiles = async () => {
        setLoading(true);
        try {
            const data = await api.getCodeFiles();
            setFiles(data);
        } catch (error) {
            toast.error("Failed to load files");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="My Code & History" size="xl">
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'files' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('files')}
                >
                    Saved Files
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'history' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('history')}
                >
                    Execution History
                </button>
            </div>

            <div className="min-h-[300px]">
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : activeTab === 'files' ? (
                    <div className="space-y-2">
                        {files.length === 0 && <p className="text-center text-gray-500 py-8">No saved files yet.</p>}
                        {files.map(file => (
                            <div key={file._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <div className="flex items-center gap-3">
                                    <FileCode size={18} className="text-blue-500" />
                                    <div>
                                        <div className="font-medium text-sm">{file.filename}</div>
                                        <div className="text-xs text-gray-500">{file.language} • Updated {new Date(file.updatedAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <button className="btn-ghost text-xs">Open</button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        History view coming soon...
                    </div>
                )}
            </div>
        </Modal>
    );
}
