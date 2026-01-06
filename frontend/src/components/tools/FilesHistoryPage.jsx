import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileCode, Clock, Play, Trash2, Calendar, FolderOpen, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const FilesHistoryPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('files');
    const [files, setFiles] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'files') {
                const data = await api.getCodeFiles();
                setFiles(data);
            } else {
                const data = await api.getExecutionHistory();
                setHistory(data);
            }
        } catch (error) {
            toast.error("Failed to load data");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenFile = (file) => {
        navigate('/tools/code-executor', {
            state: {
                fileId: file._id,
                initialCode: file.content,
                initialLanguage: file.language,
                filename: file.filename
            }
        });
    };

    return (
        <div className="flex flex-col h-full bg-[#18181b] text-gray-200 p-6 overflow-y-auto w-full font-sans">
            <div className="max-w-5xl mx-auto w-full">
                <header className="mb-8 pl-1 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 text-white">My Code Library</h1>
                        <p className="text-gray-400">Manage your saved scripts and view execution logs.</p>
                    </div>
                    <button
                        onClick={() => navigate('/tools/code-executor', { state: null })}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors border border-blue-500/50"
                    >
                        <FileCode size={16} /> New File
                    </button>
                </header>

                <div className="flex border-b border-white/10 mb-6">
                    <button
                        className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'files' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                        onClick={() => setActiveTab('files')}
                    >
                        Saved Files ({files.length})
                    </button>
                    <button
                        className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'history' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Execution History
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activeTab === 'files' && (
                            <>
                                {files.length === 0 ? (
                                    <div className="text-center py-12 bg-[#252525] rounded-xl border border-white/10 border-dashed">
                                        <FolderOpen size={48} className="mx-auto text-gray-600 mb-4" />
                                        <p className="text-gray-400">No saved files yet.</p>
                                        <Link to="/tools/code-executor" className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg inline-flex items-center gap-2 transition-colors">
                                            Create your first file
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {files.map(file => (
                                            <div key={file._id} onClick={() => handleOpenFile(file)} className="group cursor-pointer flex items-center justify-between p-4 bg-[#252525] rounded-xl border border-white/10 hover:border-blue-600/50 hover:shadow-lg transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-blue-900/20 rounded-lg text-blue-500">
                                                        <FileCode size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-lg text-gray-200 group-hover:text-blue-400 transition-colors">{file.filename}</h3>
                                                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                                            <span className="bg-[#18181b] px-2 py-0.5 rounded text-xs uppercase tracking-wide font-medium border border-white/10 text-gray-400">{file.language}</span>
                                                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(file.updatedAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-full">
                                                        <ArrowRight size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'history' && (
                            <div className="space-y-3">
                                {history.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">No execution history found.</div>
                                ) : (
                                    history.map((entry, idx) => (
                                        <div key={idx} className="p-4 bg-[#252525] rounded-xl border border-white/10">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${entry.status === 'success' || entry.status === 'Success' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    <span className="font-mono text-sm text-gray-400">{entry.languageId}</span>
                                                </div>
                                                <span className="text-xs text-gray-600">{new Date(entry.createdAt).toLocaleString()}</span>
                                            </div>
                                            <pre className="bg-[#18181b] p-3 rounded-lg text-xs font-mono overflow-x-auto max-h-32 text-gray-300 border border-white/10">
                                                {entry.codeSnapshot || "// Code not saved"}
                                            </pre>
                                            {entry.output && (
                                                <div className="mt-3 text-xs font-mono text-gray-500 border-t border-white/5 pt-2">
                                                    <span className="text-gray-600 block mb-1">Output:</span>
                                                    {entry.output.slice(0, 200)}{entry.output.length > 200 ? '...' : ''}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilesHistoryPage;
