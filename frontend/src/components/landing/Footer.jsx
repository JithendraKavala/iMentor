// frontend/src/components/landing/Footer.jsx
import React from 'react';
import { Server, Twitter, Github, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const productLinks = [
        { name: 'Features', path: '/features' },
        { name: 'Integrations', path: '/integrations' },
        { name: 'Pricing', path: '/pricing' },
        { name: 'Changelog', path: '/changelog' },
    ];

    const resourcesLinks = [
        { name: 'Documentation', path: '/docs' },
        { name: 'API Reference', path: '/api' },
        { name: 'Community', path: '/community' },
        { name: 'Blog', path: '/blog' },
    ];

    const companyLinks = [
        { name: 'About', path: '/about' },
        { name: 'Careers', path: '/careers' },
        { name: 'Legal', path: '/legal' },
        { name: 'Privacy', path: '/privacy' },
    ];

    return (
        <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-16 pb-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                            <Server className="text-indigo-600 dark:text-indigo-400" />
                            <span>iMentor</span>
                        </Link>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
                            Orchestrating AI to accelerate your academic journey. Built for rigorous research and deep learning.
                        </p>
                        <div className="flex items-center space-x-4 pt-2">
                            <a href="#" className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Github size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-6">Product</h4>
                        <ul className="space-y-3">
                            {productLinks.map((item) => (
                                <li key={item.name}><Link to={item.path} className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{item.name}</Link></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-6">Resources</h4>
                        <ul className="space-y-3">
                            {resourcesLinks.map((item) => (
                                <li key={item.name}><Link to={item.path} className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{item.name}</Link></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-6">Company</h4>
                        <ul className="space-y-3">
                            {companyLinks.map((item) => (
                                <li key={item.name}><Link to={item.path} className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{item.name}</Link></li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        © {new Date().getFullYear()} iMentor Inc. All Rights Reserved.
                    </p>
                    <div className="flex space-x-6 text-sm text-slate-500 dark:text-slate-400">
                        <Link to="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;