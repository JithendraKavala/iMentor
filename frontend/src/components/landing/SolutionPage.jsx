// frontend/src/components/landing/SolutionPage.jsx
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { solutionsData } from '../../data/solutionsData';
import Footer from './Footer';
import LandingNav from './LandingNav';
import Button from '../core/Button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const SolutionPage = ({ onLoginClick }) => {
    const { id } = useParams();
    const data = solutionsData[id];

    // Scroll to top on load
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (!data) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-background-light dark:bg-slate-950 text-text-light dark:text-text-dark">
                <h1 className="text-3xl font-bold mb-4">Solution Not Found</h1>
                <Link to="/">
                    <Button>Return Home</Button>
                </Link>
            </div>
        );
    }

    const Icon = data.icon;

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-slate-950 text-slate-900 dark:text-white font-sans selection:bg-indigo-500/30">
            <LandingNav onLoginClick={onLoginClick} />

            <main className="flex-grow pt-24">
                {/* --- HERO SECTION --- */}
                <section className="relative overflow-hidden pb-16 lg:pb-24">
                    <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}></div>
                    </div>

                    <div className="container mx-auto px-6 h-full flex flex-col items-center justify-center text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-6 border border-indigo-100 dark:border-indigo-500/20"
                        >
                            <Icon size={16} />
                            {data.subtitle}
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-slate-900 dark:text-white max-w-4xl"
                        >
                            {data.title}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed"
                        >
                            {data.shortDescription}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex items-center gap-4"
                        >
                            <Button size="lg" onClick={() => onLoginClick(false)} rightIcon={<ArrowRight size={18} />}>
                                Start Learning Now
                            </Button>
                        </motion.div>
                    </div>
                </section>

                {/* --- DEEP DIVE SECTION --- */}
                <section className="py-20 bg-white dark:bg-slate-950/50">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7 }}
                                className="lg:w-1/2 relative min-h-[400px] w-full bg-slate-100 dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
                            >
                                <img
                                    src={data.heroImage}
                                    alt={data.title}
                                    className="absolute inset-0 w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                                <div className="absolute bottom-8 left-8 text-white max-w-md">
                                    <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold tracking-wider text-xs uppercase">
                                        Powered by AI
                                    </div>
                                    <p className="font-medium text-lg text-slate-200">
                                        "iMentor has completely transformed how I approach complex subjects. It's like having a professor on speed dial."
                                    </p>
                                </div>
                            </motion.div>

                            <div className="lg:w-1/2">
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="text-3xl md:text-4xl font-bold mb-6 text-slate-900 dark:text-white"
                                >
                                    {data.deepDive.heading}
                                </motion.h2>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 }}
                                    className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed"
                                >
                                    {data.deepDive.description}
                                </motion.p>

                                <div className="grid gap-6">
                                    {data.features.map((feature, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.2 + (idx * 0.1) }}
                                            className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                                        >
                                            <div className="mt-1 flex-shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                    <CheckCircle2 size={20} />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{feature.title}</h3>
                                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- CTA SECTION --- */}
                <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                    <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-indigo-500 to-purple-600 blur-3xl"></div>

                    <div className="container mx-auto px-6 text-center relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Ready to master this subject?</h2>
                        <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
                            Join thousands of students and researchers using iMentor to accelerate their learning journey.
                        </p>
                        <Button size="xl" variant="primary" onClick={() => onLoginClick(false)} className="bg-white text-indigo-600 hover:bg-indigo-50 border-none">
                            Get Started Free <ArrowRight size={20} className="ml-2" />
                        </Button>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default SolutionPage;
