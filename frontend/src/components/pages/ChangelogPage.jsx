import React from 'react';
import PageLayout from '../layout/PageLayout';

const ChangelogPage = ({ onLoginClick }) => {
    const changes = [
        {
            version: "v2.1.0",
            date: "October 16, 2025",
            changes: ["Added visual Knowledge Graph explorer", "Improved 'Socratic Mode' prompting", "Dark mode UI refresh"]
        },
        {
            version: "v2.0.5",
            date: "September 30, 2025",
            changes: ["Launched new Solution Pages", "Integrated Gemini 1.5 Pro", "Fixed mobile responsiveness on dashboard"]
        },
        {
            version: "v1.9.0",
            date: "August 15, 2025",
            changes: ["Initial Code Executor release", "Added LaTeX support for math rendering", "Study Plan export to PDF"]
        }
    ];

    return (
        <PageLayout onLoginClick={onLoginClick}>
            <div className="container mx-auto px-4 max-w-3xl">
                <h1 className="text-4xl font-bold mb-12 text-center">Changelog</h1>

                <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 md:ml-6 space-y-12">
                    {changes.map((release, i) => (
                        <div key={i} className="relative pl-8 md:pl-12">
                            <span className="absolute -left-1.5 md:-left-2 top-2 w-3 h-3 md:w-4 md:h-4 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-950"></span>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                                <h2 className="text-2xl font-bold">{release.version}</h2>
                                <span className="text-sm text-slate-500">{release.date}</span>
                            </div>

                            <ul className="list-disc list-outside ml-4 space-y-2 text-slate-600 dark:text-slate-400">
                                {release.changes.map((change, j) => (
                                    <li key={j}>{change}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </PageLayout>
    );
};

export default ChangelogPage;
