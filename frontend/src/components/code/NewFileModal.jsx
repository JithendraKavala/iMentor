import React, { useState } from 'react';
import Modal from '../core/Modal';
import { FileCode, Save } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function NewFileModal({ isOpen, onClose, onFileCreated }) {
    const [filename, setFilename] = useState('');
    const [language, setLanguage] = useState('python');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!filename.trim()) return toast.error("Filename is required");

        setIsLoading(true);
        try {
            // Default language ID mapping (we can fetch this dynamically later or now)
            // For now, hardcode common ones or rely on backend to handle via name if supported
            // The backend expects languageId. Let's start with a simple mapping or fetch.
            // For MVP UI, let's just send the name and let the backend/frontend logic align later or 
            // use a hardcoded map for now to strictly follow the schema.
            // But wait, the backend `POST /files` requires `languageId`.
            // Ideally we should use the fetched languages.
            // For this skeleton, I'll just put a placeholder ID or fetch languages.

            // Actually, let's keep it simple: create a blank file UI first.
            const newFile = await api.createCodeFile({
                filename,
                language,
                languageId: language === 'python' ? 71 : 63, // Temp hardcode: Py 71, JS 63
                content: ''
            });

            toast.success("File created!");
            if (onFileCreated) onFileCreated(newFile);
            onClose();
            setFilename('');
        } catch (error) {
            toast.error("Failed to create file");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Code File" size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filename</label>
                    <input
                        type="text"
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        placeholder="e.g. script.py"
                        className="input-field w-full"
                        autoFocus
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="input-field w-full"
                    >
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                    </select>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                    <button type="submit" disabled={isLoading} className="btn-primary flex items-center gap-2">
                        {isLoading ? 'Creating...' : <><Save size={16} /> Create</>}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
