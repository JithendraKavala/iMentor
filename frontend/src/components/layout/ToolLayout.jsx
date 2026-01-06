import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAppState } from '../../contexts/AppStateContext';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ToolLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const { isLeftPanelOpen, handleNewChat } = useAppState();
    const navigate = useNavigate();
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false); // Dummy for now, or connect if needed

    // We can reuse the same sidebar logic
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-gray-100 font-sans">
            {/* Mobile TopNav (Optional, for consistency) */}
            <div className="md:hidden">
                <TopNav
                    user={user}
                    onLogout={handleLogout}
                    onNewChat={() => navigate('/')} // Redirect to home for new chat
                    onHistoryClick={() => { }}
                    isChatProcessing={false}
                />
            </div>

            <div className="flex flex-1 overflow-hidden h-full">
                {/* Desktop Sidebar */}
                <div className="hidden md:block h-full flex-shrink-0">
                    <Sidebar
                        authUser={user}
                        onLogout={handleLogout}
                        onSelectSession={(sid) => {
                            // If user clicks a chat in sidebar while in a tool, go back to chat
                            navigate('/');
                            // In a real app we might set the session ID globally here too
                        }}
                    />
                </div>

                {/* Mobile Drawer */}
                <AnimatePresence>
                    {isLeftPanelOpen && (
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: '0%' }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="absolute inset-y-0 left-0 z-50 w-72 md:hidden bg-surface-light dark:bg-gray-900 shadow-2xl"
                        >
                            <Sidebar
                                authUser={user}
                                onLogout={handleLogout}
                                onSelectSession={(sid) => { navigate('/'); }}
                            />
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col overflow-hidden relative w-full bg-background-light dark:bg-background-dark">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default ToolLayout;
