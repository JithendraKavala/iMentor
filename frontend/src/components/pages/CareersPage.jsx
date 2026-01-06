import React from 'react';
import PageLayout from '../layout/PageLayout';

const CareersPage = ({ onLoginClick }) => {
    return (
        <PageLayout onLoginClick={onLoginClick}>
            <div className="container mx-auto px-4 text-center max-w-2xl">
                <h1 className="text-4xl font-bold mb-6">Join Our Team</h1>
                <p className="text-xl text-slate-500 mb-12">
                    We're looking for passionate individuals to help us revolutionize education.
                </p>

                <div className="space-y-4 text-left">
                    {["Senior Full Stack Engineer", "AI Research Scientist", "Product Designer", "Developer Advocate"].map((job, i) => (
                        <div key={i} className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center hover:shadow-md transition-shadow">
                            <div>
                                <h3 className="font-bold text-lg">{job}</h3>
                                <p className="text-sm text-slate-500">Remote • United States</p>
                            </div>
                            <span className="text-indigo-600 font-medium text-sm">Apply &rarr;</span>
                        </div>
                    ))}
                </div>
            </div>
        </PageLayout>
    );
};

export default CareersPage;
