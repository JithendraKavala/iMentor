// frontend/src/components/tools/CodeEditor.jsx
import React from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../../hooks/useTheme';
import { Loader2 } from 'lucide-react';

const CodeEditor = ({ code, setCode, language }) => {
    const { theme } = useTheme();

    const handleEditorChange = (value) => {
        setCode(value || '');
    };


    const getMonacoLanguage = (langName) => {
        if (!langName) return 'plaintext';
        const lower = langName.toLowerCase();
        if (lower.includes('python')) return 'python';
        if (lower.includes('java') && !lower.includes('script')) return 'java';
        if (lower.includes('javascript') || lower.includes('node')) return 'javascript';
        if (lower.includes('cpp') || lower.includes('c++')) return 'cpp';
        if (lower.includes('c') && !lower.includes('++') && !lower.includes('sharp')) return 'c';
        if (lower.includes('go')) return 'go';
        if (lower.includes('ruby')) return 'ruby';
        return 'plaintext';
    };

    return (
        <div className="h-full w-full border border-border-light dark:border-border-dark rounded-lg overflow-hidden shadow-inner">
            <Editor
                height="100%"
                language={getMonacoLanguage(language)}
                value={code}
                onChange={handleEditorChange}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                loading={<Loader2 className="animate-spin text-primary" />}
                options={{
                    fontSize: 14,
                    minimap: { enabled: true },
                    contextmenu: true,
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    automaticLayout: true,
                }}
            />
        </div>
    );
};

export default CodeEditor;