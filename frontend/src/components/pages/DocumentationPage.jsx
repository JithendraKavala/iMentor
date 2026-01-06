import React from 'react';
import PageLayout from '../layout/PageLayout';
import { Book, Code, Terminal, GraduationCap } from 'lucide-react';

const DocumentationPage = ({ onLoginClick }) => {
    return (
        <PageLayout onLoginClick={onLoginClick}>
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex flex-col md:flex-row gap-12">
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <div className="sticky top-24">
                            <h3 className="font-bold mb-4 uppercase text-xs tracking-wider text-slate-500">Getting Started</h3>
                            <ul className="space-y-2 mb-8 text-sm">
                                <li><span className="text-indigo-600 font-medium">Introduction</span></li>
                                <li><a href="#" className="text-slate-600 hover:text-indigo-600">Quick Start</a></li>
                                <li><a href="#" className="text-slate-600 hover:text-indigo-600">Installation</a></li>
                            </ul>
                            <h3 className="font-bold mb-4 uppercase text-xs tracking-wider text-slate-500">Core Concepts</h3>
                            <ul className="space-y-2 mb-8 text-sm">
                                <li><a href="#" className="text-slate-600 hover:text-indigo-600">Study Plans</a></li>
                                <li><a href="#" className="text-slate-600 hover:text-indigo-600">The Context Window</a></li>
                                <li><a href="#" className="text-slate-600 hover:text-indigo-600">Knowledge Graphs</a></li>
                            </ul>
                        </div>
                    </aside>

                    <div className="flex-grow prose dark:prose-invert max-w-none">
                        <h1>Documentation</h1>
                        <p className="lead">Everything you need to know to get the most out of iMentor.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 not-prose my-12">
                            <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500 transition-colors">
                                <GraduationCap className="mb-4 text-indigo-600 h-8 w-8" />
                                <h3 className="font-bold text-lg mb-2">Student Guide</h3>
                                <p className="text-sm text-slate-500">Learn how to generate curriculums and prepare for exams.</p>
                            </div>
                            <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500 transition-colors">
                                <Terminal className="mb-4 text-indigo-600 h-8 w-8" />
                                <h3 className="font-bold text-lg mb-2">Developer Tools</h3>
                                <p className="text-sm text-slate-500">Integrate the code executor and API into your workflow.</p>
                            </div>
                        </div>

                        <h2>Introduction</h2>
                        <p>iMentor is an AI-powered educational platform designed to provide personalized tutoring. Unlike generic chatbots, iMentor maintains a persistent memory of your learning goals (`currentGoals`) and adapts its explaining style (`learningStyle`) to you.</p>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default DocumentationPage;
