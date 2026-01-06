// frontend/src/components/landing/HeroSection.jsx
import React from 'react';
import Button from '../core/Button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const HeroSection = ({ onLoginClick }) => {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-background-light dark:bg-slate-950 isolate">
            {/* Background Effects */}
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="mb-8 flex justify-center">
                        <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-slate-600 dark:text-slate-400 ring-1 ring-slate-900/10 dark:ring-slate-100/10 hover:ring-slate-900/20 dark:hover:ring-slate-100/20 transition-all bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                            Announcing our new Research Engine. <a href="#" className="font-semibold text-indigo-600 dark:text-indigo-400"><span className="absolute inset-0" aria-hidden="true"></span>Read more <span aria-hidden="true">&rarr;</span></a>
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-8 max-w-[900px] mx-auto leading-[1.1]">
                        Your Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">AI Mentor</span> for Higher Education
                    </h1>

                    <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Go beyond simple answers. Generate structured study plans, analyze research papers, practice coding, and get personalized feedback—all in one workspace.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            size="xl"
                            onClick={() => onLoginClick(false)}
                            className="w-full sm:w-auto px-8 py-4 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-shadow"
                            rightIcon={<ArrowRight size={20} />}
                        >
                            Start Learning for Free
                        </Button>
                        <a href="#features" className="w-full sm:w-auto">
                            <Button size="xl" variant="outline" className="w-full sm:w-auto px-8 py-4 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                                View Capabilities
                            </Button>
                        </a>
                    </div>
                </motion.div>

                {/* Social Proof Strip */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="mt-20 pt-10 border-t border-slate-200/60 dark:border-slate-800/60"
                >
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-widest">Trusted by students from</p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholder Logos - Text for now, can be replaced by SVGs */}
                        {['Stanford', 'MIT', 'Harvard', 'Oxford', 'Cambridge'].map((uni) => (
                            <span key={uni} className="text-xl md:text-2xl font-serif font-bold text-slate-400 dark:text-slate-600">{uni}</span>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background-light dark:from-slate-950 to-transparent pointer-events-none"></div>
        </section>
    );
};

export default HeroSection;