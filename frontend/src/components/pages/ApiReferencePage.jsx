import React from 'react';
import PageLayout from '../layout/PageLayout';

const ApiReferencePage = ({ onLoginClick }) => {
    return (
        <PageLayout onLoginClick={onLoginClick}>
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">API Reference</h1>
                    <p className="text-slate-500">Build your own tools on top of the iMentor educational engine.</p>
                </div>

                <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl">
                    <div className="bg-slate-800 px-6 py-4 flex items-center gap-2 border-b border-slate-700">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <span className="text-slate-400 text-xs font-mono ml-4">POST /api/v1/chat/completion</span>
                    </div>
                    <div className="p-6 overflow-x-auto">
                        <pre className="text-emerald-400 font-mono text-sm">
                            {`{
  "model": "gemini-pro",
  "messages": [
    {
      "role": "user",
      "content": "Explain quantum entanglement"
    }
  ],
  "context": {
    "depth": "undergraduate",
    "style": "visual"
  }
}`}
                        </pre>
                    </div>
                </div>

                <div className="mt-12 space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Endpoints</h2>
                        <div className="space-y-4">
                            {['GET /user/profile', 'POST /chat/start', 'GET /study-plans', 'POST /code/execute'].map(ep => (
                                <div key={ep} className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-sm flex items-center">
                                    <span className={`mr-4 px-2 py-1 rounded text-xs font-bold ${ep.startsWith('GET') ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                        {ep.split(' ')[0]}
                                    </span>
                                    <span>{ep.split(' ')[1]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default ApiReferencePage;
