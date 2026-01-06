import React from 'react';
import PageLayout from '../layout/PageLayout';
import { solutionsData } from '../../data/solutionsData';
import { ArrowRight } from 'lucide-react';

const FeaturesPage = ({ onLoginClick }) => {
    const features = Object.values(solutionsData);

    return (
        <PageLayout onLoginClick={onLoginClick}>
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Built for <span className="text-indigo-600 dark:text-indigo-400">Deep Work</span></h1>
                    <p className="text-xl text-slate-500">
                        Explore the toolkit designed to take you from undergraduate to PhD.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {features.map((feature) => (
                        <div key={feature.id} className="group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300">
                            <div className="h-48 bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center overflow-hidden">
                                {feature.heroImage ? (
                                    <img src={feature.heroImage} alt={feature.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <feature.icon size={64} className="text-slate-300 dark:text-slate-700" />
                                )}
                            </div>
                            <div className="p-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400`}>
                                        <feature.icon size={24} />
                                    </div>
                                    <h3 className="text-2xl font-bold">{feature.title}</h3>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-2">
                                    {feature.shortDescription}
                                </p>
                                <a href={`/solutions/${feature.id}`} className="inline-flex items-center font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                                    Learn more <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </PageLayout>
    );
};

export default FeaturesPage;
