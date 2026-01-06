import React from 'react';
import PageLayout from '../layout/PageLayout';
import { Check } from 'lucide-react';
import Button from '../core/Button';

const PricingPage = ({ onLoginClick }) => {
    const plans = [
        {
            name: "Free",
            price: "$0",
            desc: "Essential tools for every student.",
            features: ["50 AI queries/day", "Basic Study Plans", "Standard Response Speed", "Community Support"],
            cta: "Get Started",
            highlight: false
        },
        {
            name: "Pro",
            price: "$12",
            period: "/month",
            desc: "For serious researchers and students.",
            features: ["Unlimited AI queries", "Advanced Research Assistant", "File Upload & Analysis", "Priority Support", "GPT-4 Access"],
            cta: "Transform Your Study",
            highlight: true
        },
        {
            name: "Institution",
            price: "Custom",
            desc: "For universities and research labs.",
            features: ["SSO Integration", "Admin Dashboard", "Custom Knowledge Base", "Curriculum Mapping", "Dedicated Account Manager"],
            cta: "Contact Sales",
            highlight: false
        }
    ];

    return (
        <PageLayout onLoginClick={onLoginClick}>
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400">
                        Invest in your education with the world's most advanced AI tutor.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <div key={index} className={`rounded-2xl p-8 border ${plan.highlight ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 ring-1 ring-indigo-500 shadow-xl' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'} flex flex-col`}>
                            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                            <div className="flex items-baseline mb-4">
                                <span className="text-4xl font-extrabold">{plan.price}</span>
                                {plan.period && <span className="text-slate-500 ml-1">{plan.period}</span>}
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 mb-8">{plan.desc}</p>

                            <ul className="space-y-4 mb-8 flex-grow">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Check className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" size={18} />
                                        <span className="text-sm text-slate-600 dark:text-slate-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                variant={plan.highlight ? 'primary' : 'outline'}
                                fullWidth
                                onClick={() => onLoginClick(false)}
                            >
                                {plan.cta}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </PageLayout>
    );
};

export default PricingPage;
