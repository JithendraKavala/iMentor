// frontend/src/components/landing/LandingNav.jsx
import React, { useState } from 'react';
import { Server, Menu, X } from 'lucide-react';
import Button from '../core/Button';
import { motion, AnimatePresence } from 'framer-motion';

const LandingNav = ({ onLoginClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navItems = [
        { name: "Features", href: "/#features" },
        { name: "How it Works", href: "/#how-it-works" },
        { name: "For Students", href: "/#audience" },
        { name: "Pricing", href: "/pricing" },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 transition-all duration-300 supports-[backdrop-filter]:bg-white/60">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    <a href="/" className="flex items-center gap-2 group">
                        <div className="p-1.5 bg-slate-900 dark:bg-white rounded-lg group-hover:scale-105 transition-transform">
                            <Server className="w-5 h-5 text-white dark:text-slate-900" strokeWidth={2.5} />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">iMentor</span>
                    </a>

                    <div className="hidden md:flex items-center space-x-8">
                        {navItems.map(item => (
                            <a key={item.name} href={item.href} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                {item.name}
                            </a>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center space-x-3">
                        <button
                            onClick={() => onLoginClick(true)}
                            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Log in
                        </button>
                        <button
                            onClick={() => onLoginClick(false)}
                            className="text-sm font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm hover:shadow-md"
                        >
                            Get Started
                        </button>
                    </div>

                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600 dark:text-slate-300 p-2">
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden"
                    >
                        <div className="px-4 py-4 space-y-3">
                            {navItems.map(item => (
                                <a key={item.name} href={item.href} onClick={() => setIsMenuOpen(false)} className="block text-base font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white py-2">
                                    {item.name}
                                </a>
                            ))}
                            <div className="pt-4 space-y-3 border-t border-slate-100 dark:border-slate-800">
                                <button onClick={() => { onLoginClick(true); setIsMenuOpen(false); }} className="w-full text-center text-sm font-medium text-slate-600 dark:text-slate-300 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900">
                                    Log in
                                </button>
                                <button onClick={() => { onLoginClick(false); setIsMenuOpen(false); }} className="w-full text-center text-sm font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 py-2.5 rounded-lg hover:bg-slate-800 shadow-sm">
                                    Get Started
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default LandingNav;