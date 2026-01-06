// frontend/src/components/tools/TestCaseManager.jsx
import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import Button from '../core/Button.jsx';
import IconButton from '../core/IconButton.jsx';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

const TestCaseManager = ({ testCases, setTestCases, code, language }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const addTestCase = () => {
        const lastTestCase = testCases[testCases.length - 1];
        if (testCases.length > 0 && lastTestCase.input.trim() === '' && lastTestCase.expectedOutput.trim() === '') {
            toast.error('Please fill out the empty test case first.');
            return;
        }
        setTestCases([...testCases, { input: '', expectedOutput: '' }]);
    };

    const removeTestCase = (index) => {
        const newTestCases = testCases.filter((_, i) => i !== index);
        setTestCases(newTestCases);
    };

    const updateTestCase = (index, field, value) => {
        const newTestCases = [...testCases];
        newTestCases[index][field] = value;
        setTestCases(newTestCases);
    };

    const handleGenerateCases = async () => {
        if (!code.trim()) {
            toast.error("Code editor is empty.");
            return;
        }
        setIsGenerating(true);
        const toastId = toast.loading("Generating test cases...");
        try {
            const response = await api.generateTestCases({ code, language });
            if (response.testCases && Array.isArray(response.testCases) && response.testCases.length > 0) {
                setTestCases(response.testCases);
                toast.success('Generated test cases successfully!', { id: toastId });
            } else {
                toast.error("Could not generate cases. Try adding more code logic.", { id: toastId });
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to generate test cases.";
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-4 bg-[#1e1e1e] h-full flex flex-col font-sans">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">Test Cases</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={addTestCase}
                        className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors"
                        title="Add New Case"
                    >
                        <Plus size={16} />
                    </button>
                    <button
                        onClick={handleGenerateCases}
                        disabled={!code.trim() || isGenerating}
                        className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 border border-blue-400/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Sparkles size={10} />
                        {isGenerating ? 'Generating...' : 'Auto-Generate'}
                    </button>
                </div>
            </div>

            <div className="flex-grow space-y-3 overflow-y-auto custom-scrollbar pr-1">
                {testCases.map((tc, index) => (
                    <div key={index} className="flex flex-col gap-2 p-3 bg-[#252525] rounded-lg border border-white/5 hover:border-white/10 transition-colors group">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Case #{index + 1}</span>
                            <button
                                onClick={() => removeTestCase(index)}
                                className="text-gray-600 hover:text-red-400 transition-colors"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-medium text-gray-400 mb-1">Input</label>
                                <textarea
                                    value={tc.input}
                                    onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded p-2 text-xs font-mono text-gray-300 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 placeholder-gray-700 resize-none transition-all"
                                    rows="3"
                                    placeholder="Input..."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-medium text-gray-400 mb-1">Expected Output</label>
                                <textarea
                                    value={tc.expectedOutput}
                                    onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded p-2 text-xs font-mono text-gray-300 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 placeholder-gray-700 resize-none transition-all"
                                    rows="3"
                                    placeholder="Expected..."
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {testCases.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-center border mr-2 border-dashed border-white/10 rounded-lg">
                        <AlertCircle className="text-gray-600 mb-2" size={24} />
                        <p className="text-sm text-gray-400">No test cases yet.</p>
                        <p className="text-xs text-gray-600 mt-1">Add one manually or generate with AI.</p>
                        <button
                            onClick={addTestCase}
                            className="mt-3 px-3 py-1.5 bg-[#252525] hover:bg-[#333] text-gray-300 text-xs rounded border border-white/10 transition-colors"
                        >
                            Add Test Case
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestCaseManager;