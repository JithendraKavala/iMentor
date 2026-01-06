import React from 'react';
import PageLayout from '../layout/PageLayout';
import { MessageSquare, Users, Globe } from 'lucide-react';

const CommunityPage = ({ onLoginClick }) => {
    return (
        <PageLayout onLoginClick={onLoginClick}>
            <div className="container mx-auto px-4 text-center max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">Join the Community</h1>
                <p className="text-xl text-slate-500 mb-16">Connect with thousands of students and researchers using AI to push the boundaries of knowledge.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="p-8 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-500/30">
                        <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-90" />
                        <h3 className="text-xl font-bold mb-2">Discord Server</h3>
                        <p className="text-indigo-100 mb-6">Chat live with other students and get help from our team.</p>
                        <button className="px-6 py-2 bg-white text-indigo-600 rounded-lg font-bold hover:bg-opacity-90">Join Discord</button>
                    </div>
                    <div className="p-8 bg-slate-900 dark:bg-slate-800 rounded-3xl text-white">
                        <Users className="mx-auto h-12 w-12 mb-4 text-slate-400" />
                        <h3 className="text-xl font-bold mb-2">Student Hub</h3>
                        <p className="text-slate-400 mb-6">Share study plans and prompts in our forums.</p>
                        <button className="px-6 py-2 border border-slate-600 rounded-lg font-bold hover:bg-slate-800">Browse Forums</button>
                    </div>
                    <div className="p-8 bg-slate-100 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
                        <Globe className="mx-auto h-12 w-12 mb-4 text-indigo-600" />
                        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Global Events</h3>
                        <p className="text-slate-500 mb-6">Hackathons and study jams happening near you.</p>
                        <button className="px-6 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm rounded-lg font-bold">Find Events</button>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default CommunityPage;
