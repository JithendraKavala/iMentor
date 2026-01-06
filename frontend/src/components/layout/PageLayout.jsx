import React from 'react';
import LandingNav from '../landing/LandingNav';
import Footer from '../landing/Footer';
import { motion } from 'framer-motion';

const PageLayout = ({ children, onLoginClick }) => {
    return (
        <div className="h-screen overflow-y-auto scroll-smooth bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-white">
            <LandingNav onLoginClick={onLoginClick} />
            <main className="flex-grow pt-24 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {children}
                </motion.div>
            </main>
            <Footer />
        </div>
    );
};

export default PageLayout;
