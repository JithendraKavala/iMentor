import React from 'react';
import Button from '../core/Button';
import { motion } from 'framer-motion';

const CtaSection = ({ onLoginClick }) => {
    return (
        <section className="py-24 bg-slate-50 dark:bg-transparent overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative lg:col-span-2 bg-slate-900 rounded-3xl p-8 sm:p-16 overflow-hidden shadow-2xl shadow-indigo-500/10"
                >
                    <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,transparent,white_50%)]"></div>
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-30"></div>
                    <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-30"></div>

                    <div className="relative text-center max-w-2xl mx-auto space-y-8">
                        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                            Ready to accelerate your <span className="text-indigo-400">learning speed?</span>
                        </h2>
                        <p className="text-lg text-slate-300 leading-relaxed">
                            Join the community of students and researchers who have already generated over 100,000 flashcards and mind maps.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => onLoginClick(false)}
                                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                            >
                                Start Learning &rarr;
                            </button>
                            <button
                                onClick={() => onLoginClick(true)}
                                className="w-full sm:w-auto px-8 py-4 bg-transparent border border-slate-700 text-white rounded-xl font-bold hover:bg-white/5 transition-colors"
                            >
                                View Demo
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CtaSection;