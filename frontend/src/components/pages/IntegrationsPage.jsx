import React from 'react';
import PageLayout from '../layout/PageLayout';
import { Database, FileText, Slack, Github, Globe, Trello } from 'lucide-react';

const IntegrationsPage = ({ onLoginClick }) => {
    const integrations = [
        { name: "Google Scholar", icon: Globe, desc: "Directly import citations and papers." },
        { name: "Notion", icon: FileText, desc: "Export study plans to your workspace." },
        { name: "GitHub", icon: Github, desc: "Sync code snippets and repositories." },
        { name: "Slack", icon: Slack, desc: "Get study reminders and alerts." },
        { name: "JIVAT Database", icon: Database, desc: "Connect to university research archives." },
        { name: "Canvas / LMS", icon: Trello, desc: "Sync assignments and deadlines." },
    ];

    return (
        <PageLayout onLoginClick={onLoginClick}>
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl font-bold mb-4">Connect Your Workflow</h1>
                    <p className="text-xl text-slate-500">iMentor plays nicely with the tools you already use.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {integrations.map((item, i) => (
                        <div key={i} className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-colors group">
                            <item.icon className="h-10 w-10 text-slate-400 group-hover:text-indigo-500 mb-4 transition-colors" />
                            <h3 className="text-lg font-bold mb-2">{item.name}</h3>
                            <p className="text-slate-500 text-sm">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </PageLayout>
    );
};

export default IntegrationsPage;
