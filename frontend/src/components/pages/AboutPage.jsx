import React from 'react';
import PageLayout from '../layout/PageLayout';
import { motion } from 'framer-motion';

const AboutPage = ({ onLoginClick }) => {
    return (
        <PageLayout onLoginClick={onLoginClick}>
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                        Empowering the <span className="text-indigo-600 dark:text-indigo-400">Next Generation</span> of Scholars
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        We believe that AI shouldn't just answer questions—it should teach you how to ask better ones.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                    <div>
                        <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                            iMentor was founded with a single goal: to bridge the gap between rigorous academic standards and the accessibility of artificial intelligence.
                        </p>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            We are building tools that help students, researchers, and lifelong learners navigate complex topics, structure their study plans, and achieve deep understanding faster than ever before.
                        </p>
                    </div>
                    <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl h-80 w-full flex items-center justify-center">
                        {/* Placeholder for About Image */}
                        <span className="text-slate-400">Mission Image Placeholder</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {[
                        { title: "Academic Rigor", desc: "We prioritize accuracy, citations, and depth over simple summaries." },
                        { title: "Personalized Learning", desc: "Every student learns differently. Our AI adapts to your style." },
                        { title: "Ethical AI", desc: "We promote tools that enhance critical thinking, not replace it." }
                    ].map((value, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400">{value.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="text-center bg-indigo-600 dark:bg-indigo-900 rounded-3xl p-12 text-white">
                    <h2 className="text-3xl font-bold mb-4">Join the Future of Education</h2>
                    <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
                        Whether you're a student, a professor, or a developer, there's a place for you in our community.
                    </p>
                    <button onClick={() => onLoginClick(false)} className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors">
                        Get Started Today
                    </button>
                </div>
            </div>
        </PageLayout>
    );
};

export default AboutPage;
