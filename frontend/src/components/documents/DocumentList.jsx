

// frontend/src/components/documents/DocumentList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api.js'; // Mocked for V1
import toast from 'react-hot-toast';
import { FileText, Edit3, Trash2, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import IconButton from '../core/IconButton.jsx'; // Make sure IconButton is imported
import { useAuth } from '../../hooks/useAuth.jsx';

// selectedDocuments is an array of strings (names/IDs) from AppStateContext
function DocumentList({ toggleDocumentSelection, selectedDocuments }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getKnowledgeSources(); // Returns array of sources
      setFiles(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Failed to fetch knowledge sources:", err);
      // specific check for 404/files not found?
      setError("Failed to load knowledge base.");
      toast.error("Could not load knowledge base.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDelete = async (source) => {
    if (!window.confirm(`Are you sure you want to delete "${source.name || source.content}"?`)) return;
    const toastId = toast.loading(`Deleting...`);
    try {
      await api.deleteKnowledgeSource(source.id);
      toast.success(`Deleted.`, { id: toastId });
      fetchFiles();
      fetchFiles();
      // If deleted file was selected, remove it from selection
      if (selectedDocuments.includes(source.name || source.content)) {
        toggleDocumentSelection(source.name || source.content);
      }
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`, { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 text-chat-text-muted-light dark:text-chat-text-muted-dark">
        <Loader2 size={20} className="animate-spin mr-2" /> Loading documents...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 rounded-md text-sm flex items-center gap-2">
        <AlertTriangle size={18} /> {error}
        <button onClick={fetchFiles} className="ml-auto text-xs underline hover:text-red-400">Retry</button>
      </div>
    );
  }

  if (files.length === 0) {
    return <p className="text-center text-xs text-chat-text-muted-light dark:text-chat-text-muted-dark p-4">No documents uploaded.</p>;
  }

  return (
    <div className="space-y-1.5 text-xs custom-scrollbar pr-1">
      {files.map(source => {
        const displayName = source.name || source.content; // Use name for files, content (url) for URLs
        const uniqueId = source.id; // Assuming ID exists
        const isSelected = selectedDocuments.includes(displayName);

        return (
          <div
            key={uniqueId}
            onClick={() => toggleDocumentSelection(displayName)}
            className={`p-2.5 bg-chat-surface-light dark:bg-chat-surface-dark border rounded-md flex items-center justify-between hover:shadow-md transition-all duration-150 cursor-pointer
                        ${isSelected
                ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 shadow-lg border-indigo-500 dark:border-indigo-400'
                : 'border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30'}`}
            title={isSelected ? "Deselect" : "Select"}
          >
            <div className="flex items-center gap-2 truncate">
              {isSelected ? (
                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
              ) : (
                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-green-500 bg-green-500/10' : 'border-slate-300 dark:border-slate-600'}`}>
                  {/* Empty box or check */}
                </div>
              )}
              <span className={`truncate ${isSelected ? 'font-semibold text-indigo-500 dark:text-indigo-400' : 'text-chat-text-light dark:text-chat-text-dark'}`}>
                {displayName}
              </span>
            </div>
            <div className="flex-shrink-0 flex items-center gap-0.5">
              <IconButton
                icon={Trash2}
                size="sm"
                variant="ghost"
                title="Delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(source);
                }}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}


export default DocumentList;