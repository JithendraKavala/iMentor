// frontend/src/components/landing/FeaturesSection.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { solutionsData } from '../../data/solutionsData';

const FeatureCard = ({ id, title, shortDescription, icon: Icon, index }) => {
    // Bento Grid Logic: First item spans 2 cols on medium screens, some others span different sizes
    const isLarge = index === 0; // First item is large

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`group relative overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 transition-all hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 ${isLarge ? 'md:col-span-2 md:row-span-2' : ''}`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-indigo-500/5 dark:to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 flex flex-col h-full">
                <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={24} />
                </div>

                <h3 className={`font-bold text-slate-900 dark:text-white mb-3 ${isLarge ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
                    {title}
                </h3>

                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6 flex-grow">
                    {shortDescription}
                </p>

                <Link to={`/solutions/${id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                    Learn more <ArrowUpRight size={16} />
                </Link>
            </div>
        </motion.div>
    );
};

const FeaturesSection = () => {
    const features = Object.values(solutionsData);

    return (
        <section id="features" className="py-24 bg-white dark:bg-slate-950">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16 max-w-3xl">
                    <h2 className="text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase text-sm mb-3">Capabilities</h2>
                    <h3 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                        Everything you need to <br className="hidden md:block" /> excel in your studies.
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
                    {features.map((feature, index) => (
                        <FeatureCard key={feature.id} {...feature} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;