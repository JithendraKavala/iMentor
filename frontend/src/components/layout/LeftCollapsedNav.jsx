// frontend/src/components/layout/LeftCollapsedNav.jsx
import React from 'react';
import { useAppState } from '../../contexts/AppStateContext.jsx';
import { MessageSquare, Database, GraduationCap, Settings, BookOpen } from 'lucide-react';
import IconButton from '../core/IconButton.jsx';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function IconBar({ isChatProcessing, onNewChat }) {
    const { setIsLeftPanelOpen } = useAppState();
    const navigate = useNavigate();

    // Define the items for the icon bar
    const navItems = [
        {
            id: 'chat',
            label: 'New Chat',
            icon: MessageSquare,
            action: () => onNewChat()
        },
        {
            id: 'knowledge',
            label: 'Knowledge Base',
            icon: Database,
            action: () => navigate('/tools/knowledge-graph') // Placeholder route
        },
        {
            id: 'subjects',
            label: 'Subjects',
            icon: BookOpen,
            action: () => navigate('/study-plan')
        },
        {
            id: 'admin',
            label: 'Admin Settings',
            icon: Settings,
            action: () => navigate('/admin/dashboard')
        }
    ];

    return (
        <motion.aside
            key="left-collapsed-nav"
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '0%', opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed left-0 top-16 bottom-0 z-30 w-16 
                       bg-surface-light dark:bg-surface-dark 
                       border-r border-border-light dark:border-border-dark 
                       shadow-sm flex flex-col items-center py-4 space-y-6 custom-scrollbar
                       ${isChatProcessing ? 'processing-overlay' : ''}`}
        >
            {navItems.map(item => (
                <IconButton
                    key={item.id}
                    icon={item.icon}
                    onClick={item.action}
                    title={item.label}
                    ariaLabel={item.label}
                    variant="ghost"
                    size="lg"
                    className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                    disabled={isChatProcessing}
                />
            ))}
        </motion.aside>
    );
}
export default IconBar;