// frontend/src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth as useRegularAuth } from './hooks/useAuth.jsx';
import { useAppState } from './contexts/AppStateContext.jsx';
import AuthModal from './components/auth/AuthModal.jsx';
import TopNav from './components/layout/TopNav.jsx';
import LeftPanel from './components/layout/LeftPanel.jsx';
import CenterPanel from './components/layout/CenterPanel.jsx';
import RightPanel from './components/layout/RightPanel.jsx';
import Sidebar from './components/layout/Sidebar.jsx';

import ChatHistoryModal from './components/chat/ChatHistoryModal.jsx';
import AdminDashboardPage from './components/admin/AdminDashboardPage.jsx';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute.jsx';
import CodeExecutorPage from './components/tools/CodeExecutorPage.jsx';
import FilesHistoryPage from './components/tools/FilesHistoryPage.jsx';
import ToolLayout from './components/layout/ToolLayout.jsx';
import StudyPlanPage from './components/learning/StudyPlanPage.jsx';
import QuizGeneratorPage from './components/tools/QuizGeneratorPage.jsx';
import api from './services/api.js';
import toast from 'react-hot-toast';
import { GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './components/core/Button.jsx';
import AcademicIntegrityPage from './components/tools/AcademicIntegrityPage.jsx';
import LandingPage from './components/landing/LandingPage.jsx';
import OnboardingFlow from './components/onboarding/OnboardingFlow.jsx';
import AnalyticsDashboardPage from './components/admin/AnalyticsDashboardPage.jsx';
import SolutionPage from './components/landing/SolutionPage.jsx';
import PrivacyPolicy from './components/pages/PrivacyPolicy.jsx';
import TermsOfService from './components/pages/TermsOfService.jsx';
import AboutPage from './components/pages/AboutPage.jsx';
import PricingPage from './components/pages/PricingPage.jsx';
import BlogPage from './components/pages/BlogPage.jsx';
import IntegrationsPage from './components/pages/IntegrationsPage.jsx';
import ChangelogPage from './components/pages/ChangelogPage.jsx';
import CareersPage from './components/pages/CareersPage.jsx';
import CommunityPage from './components/pages/CommunityPage.jsx';
import DocumentationPage from './components/pages/DocumentationPage.jsx';
import ApiReferencePage from './components/pages/ApiReferencePage.jsx';
import FeaturesPage from './components/pages/FeaturesPage.jsx';


function SessionLoadingModal() {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]">
            <motion.div
                key="session-loading-modal"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl p-8 w-full max-w-md text-center"
            >
                <div className="flex justify-center items-center mb-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-primary"></div>
                </div>
                <h2 className="text-xl font-bold text-text-light dark:text-text-dark mb-2">Finalizing Session...</h2>
                <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                    Summarizing key points and identifying topics for your future recommendations.
                </p>
            </motion.div>
        </div>
    );
}

function MainAppLayout({
    orchestratorStatus,
    handleNewChat,
    isSessionLoading,
    messages,
    setMessages
}) {
    const { user: regularUser, logout: regularUserLogout } = useRegularAuth();
    const {
        currentSessionId,
        isLeftPanelOpen,
        isRightPanelOpen,
        setSessionId: setGlobalSessionId,
        initialPromptForNewSession,
        setInitialPromptForNewSession,
        initialActivityForNewSession,
        setInitialActivityForNewSession
    } = useAppState();
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isChatProcessing, setIsChatProcessing] = useState(false);

    const handleChatProcessingStatusChange = (isLoading) => {
        setIsChatProcessing(isLoading);
    };

    const handleRegularUserLogout = () => {
        regularUserLogout();
        setGlobalSessionId(null);
    };

    const handleSelectSessionFromHistory = (sessionId) => {
        if (sessionId && sessionId !== currentSessionId) {
            setGlobalSessionId(sessionId);
            toast.success(`Loading session...`);
        }
        setIsHistoryModalOpen(false);
    };

    return (
        <>
            <AnimatePresence>
                {isSessionLoading && <SessionLoadingModal />}
            </AnimatePresence>

            <div className="md:hidden">
                <TopNav
                    user={regularUser}
                    onLogout={handleRegularUserLogout}
                    onNewChat={handleNewChat}
                    onHistoryClick={() => setIsHistoryModalOpen(true)}
                    orchestratorStatus={orchestratorStatus}
                    isChatProcessing={isChatProcessing}
                />
            </div>

            <div className="flex flex-1 overflow-hidden h-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-gray-100">
                {/* Desktop Sidebar */}
                <div className="hidden md:block h-full">
                    <Sidebar
                        authUser={regularUser}
                        onLogout={handleRegularUserLogout}
                        onSelectSession={handleSelectSessionFromHistory}
                    />
                </div>

                {/* Mobile Drawer (reusing LeftPanel for mobile if needed, or just Sidebar in drawer) */}
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
                                authUser={regularUser}
                                onLogout={handleRegularUserLogout}
                                onSelectSession={(id) => { handleSelectSessionFromHistory(id); /* Close drawer on mobile selection */ }}
                            />
                        </motion.aside>
                    )}
                </AnimatePresence>

                <main className="flex-1 flex flex-col overflow-hidden relative w-full">
                    {/* Mobile Menu Trigger (if TopNav is hidden or we want a refined look) */}
                    {/* We used TopNav for mobile, so we are good. */}

                    <CenterPanel
                        messages={messages}
                        setMessages={setMessages}
                        currentSessionId={currentSessionId}
                        onChatProcessingChange={handleChatProcessingStatusChange}
                        initialPromptForNewSession={initialPromptForNewSession}
                        setInitialPromptForNewSession={setInitialPromptForNewSession}
                        initialActivityForNewSession={initialActivityForNewSession}
                        setInitialActivityForNewSession={setInitialActivityForNewSession}
                    />
                </main>

                <AnimatePresence mode="wait">
                    {/* Right Panel - Contextual Only */}
                    {isRightPanelOpen && (
                        <motion.aside
                            key="right-panel-main"
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 320, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="hidden lg:flex lg:flex-col bg-surface-light dark:bg-surface-dark border-l border-border-light dark:border-border-dark overflow-y-auto shadow-lg flex-shrink-0 custom-scrollbar"
                        >
                            <RightPanel isChatProcessing={isChatProcessing} />
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>
            <ChatHistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} onSelectSession={handleSelectSessionFromHistory} />
        </>
    );
}

function App() {
    const { token: regularUserToken, user: regularUser, loading: regularUserAuthLoading, setUser: setRegularUserInAuthContext } = useRegularAuth();
    const {
        theme,
        setSessionId: setGlobalSessionId,
        currentSessionId,
        isAdminSessionActive,
        setIsAdminSessionActive,
    } = useAppState();
    const navigate = useNavigate();
    const location = useLocation();
    const [appInitializing, setAppInitializing] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [orchestratorStatus, setOrchestratorStatus] = useState({ status: "loading", message: "Connecting..." });
    const [isSessionLoading, setIsSessionLoading] = useState(false);
    const [appStateMessages, setAppStateMessages] = useState([]);
    const [isCreatingSession, setIsCreatingSession] = useState(false);
    const [isLoginViewInModal, setIsLoginViewInModal] = useState(true);
    const [isAwaitingOnboarding, setIsAwaitingOnboarding] = useState(false);

    const handleNewChat = useCallback(async (callback, forceNewChat = false, skipSessionAnalysis = false) => {

        const actualCallback = typeof callback === 'function' ? callback : null;
        const messages = appStateMessages;

        if (!forceNewChat && messages.length === 0 && currentSessionId) {
            toast('This is already a new chat!', { icon: '✨' });
            if (actualCallback) currentSessionId(currentSessionId);
            return;
        }

        setIsSessionLoading(true);
        try {
            const data = await api.startNewSession(currentSessionId, skipSessionAnalysis);
            if (data && data.newSessionId) {
                setGlobalSessionId(data.newSessionId);
                if (data.studyPlanSuggestion) {
                    const { topic, reason } = data.studyPlanSuggestion;
                    toast.custom((t) => (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-surface-light dark:bg-surface-dark shadow-lg rounded-lg p-4 w-96 border border-border-light dark:border-border-dark"
                        >
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5"><GraduationCap className="h-6 w-6 text-primary" /></div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-semibold text-text-light dark:text-text-dark">Personalized Study Plan Suggestion</p>
                                    <p className="mt-1 text-sm text-text-muted-light dark:text-text-muted-dark">{reason}</p>
                                    <div className="mt-4 flex gap-2">
                                        <Button size="sm" onClick={() => { navigate('/study-plan', { state: { prefilledGoal: topic } }); toast.dismiss(t.id); }}>
                                            Create Plan for "{topic}"
                                        </Button>
                                        <Button size="sm" variant="secondary" onClick={() => toast.dismiss(t.id)}>Dismiss</Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ), { id: `study-plan-toast-${topic}`, duration: Infinity });
                }
                if (actualCallback) {
                    if (!skipSessionAnalysis) {
                        toast.success("New chat started!");
                    }
                    actualCallback(data.newSessionId);
                } else if (!skipSessionAnalysis) {
                    // If no callback, but it's a user-initiated new chat, still show the toast.
                    toast.success("New chat started!");
                }
            } else {
                toast.error(data.message || "Could not start new chat session.");
                if (actualCallback) actualCallback(null);
            }
        } catch (error) {
            toast.error(`Failed to start new chat: ${error.message}`);
            if (actualCallback) actualCallback(null);
        } finally {
            setIsSessionLoading(false);
        }
    }, [currentSessionId, setGlobalSessionId, navigate, appStateMessages]);

    const fetchChatHistory = useCallback(async (sid) => {
        if (!sid || !regularUserToken) {
            setAppStateMessages([]);
            return;
        }
        try {
            const sessionData = await api.getChatHistory(sid);
            setAppStateMessages(Array.isArray(sessionData.messages) ? sessionData.messages : []);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.warn("Stale session ID found. It will be replaced.");
                localStorage.removeItem('aiTutorSessionId');
                setGlobalSessionId(null);
            } else {
                toast.error(`History load failed: ${error.message}`);
            }
        }
    }, [regularUserToken, setGlobalSessionId]);

    useEffect(() => {
        if (currentSessionId && regularUserToken) {
            fetchChatHistory(currentSessionId);
        } else if (!regularUserToken) {
            setAppStateMessages([]);
        }
    }, [currentSessionId, regularUserToken, fetchChatHistory]);

    useEffect(() => { document.documentElement.className = theme; }, [theme]);
    useEffect(() => { api.getOrchestratorStatus().then(setOrchestratorStatus); }, []);

    useEffect(() => {
        const handleAuthAndSession = async () => {
            if (isAdminSessionActive) {
                setAppInitializing(false); setShowAuthModal(false);
                if (!location.pathname.startsWith('/admin')) navigate('/admin/dashboard', { replace: true });
                return;
            }
            if (regularUserAuthLoading) {
                setAppInitializing(true); return;
            }
            setAppInitializing(false);

            if (regularUserToken && regularUser) {
                if (regularUser.hasCompletedOnboarding === false) {
                    setIsAwaitingOnboarding(true);
                    return;
                }
                if (isAwaitingOnboarding) setIsAwaitingOnboarding(false);

                setShowAuthModal(false);
                document.body.classList.remove('landing-page-body');

                if (location.pathname.startsWith('/admin')) navigate('/', { replace: true });

                const shouldCreateSession = !currentSessionId && !location.pathname.startsWith('/tools') && !location.pathname.startsWith('/study-plan');
                if (shouldCreateSession && !isCreatingSession) {
                    setIsCreatingSession(true);
                    await handleNewChat(() => { }, true, true);
                    setIsCreatingSession(false);
                }
            } else {
                document.body.classList.add('landing-page-body');
            }
        };
        handleAuthAndSession();
    }, [
        regularUserAuthLoading, regularUserToken, regularUser, isAdminSessionActive,
        currentSessionId, navigate, location.pathname, handleNewChat, isCreatingSession, isAwaitingOnboarding
    ]);

    const handleAuthSuccess = (authData) => {
        setShowAuthModal(false);
        // --- THIS IS THE FIX (Part 1): Centralize state logic here ---
        if (authData?.isAdminLogin) {
            setIsAdminSessionActive(true);
            // The main useEffect will now handle the navigation
        } else if (authData?.token) {
            setGlobalSessionId(null);
            if (authData.email && authData._id) {
                const userForContext = {
                    id: authData._id,
                    email: authData.email,
                    username: authData.username,
                    hasCompletedOnboarding: authData.hasCompletedOnboarding
                };
                setRegularUserInAuthContext(userForContext);
                // The main useEffect will handle onboarding check
            }
        }
    };

    const handleOnboardingComplete = () => {
        if (regularUser) {
            setRegularUserInAuthContext({ ...regularUser, hasCompletedOnboarding: true });
        }
        setIsAwaitingOnboarding(false);
    };

    const openAuthModal = (isLogin = true) => {
        setIsLoginViewInModal(isLogin);
        setShowAuthModal(true);
    };

    if (appInitializing) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden font-sans">
            <AnimatePresence>
                {showAuthModal && (
                    <AuthModal
                        isOpen={showAuthModal}
                        onClose={handleAuthSuccess}
                        initialViewIsLogin={isLoginViewInModal}
                    />
                )}
                {isAwaitingOnboarding &&
                    <OnboardingFlow onComplete={handleOnboardingComplete} />
                }
            </AnimatePresence>
            {/* Public Pages shared across states (or accessible when logged out) */}
            <Routes>
                {/* Admin Routes */}
                {isAdminSessionActive ? (
                    <>
                        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboardPage /></AdminProtectedRoute>} />
                        <Route path="/admin/analytics" element={<AdminProtectedRoute><AnalyticsDashboardPage /></AdminProtectedRoute>} />
                        {/* Allow Admins to see public pages? Maybe not strictly necessary but good practice */}
                        <Route path="/privacy" element={<PrivacyPolicy onLoginClick={openAuthModal} />} />
                        <Route path="/terms" element={<TermsOfService onLoginClick={openAuthModal} />} />
                        <Route path="/*" element={<Navigate to="/admin/dashboard" replace />} />
                    </>
                ) : regularUserToken && regularUser ? (
                    /* Authenticated User Routes */
                    <>
                        <Route path="/tools/code-executor" element={<ToolLayout><CodeExecutorPage /></ToolLayout>} />
                        <Route path="/tools/files" element={<ToolLayout><FilesHistoryPage /></ToolLayout>} />
                        <Route path="/study-plan" element={<ToolLayout><StudyPlanPage handleNewChat={handleNewChat} /></ToolLayout>} />
                        <Route path="/tools/quiz-generator" element={<QuizGeneratorPage />} />
                        <Route path="/tools/integrity-checker" element={<ToolLayout><AcademicIntegrityPage /></ToolLayout>} />

                        {/* Public Footer Pages (Authenticated Users) */}
                        <Route path="/data/privacy" element={<PrivacyPolicy onLoginClick={openAuthModal} />} /> {/* Legacy mapping if any */}
                        <Route path="/privacy" element={<PrivacyPolicy onLoginClick={openAuthModal} />} />
                        <Route path="/terms" element={<TermsOfService onLoginClick={openAuthModal} />} />
                        <Route path="/legal" element={<TermsOfService onLoginClick={openAuthModal} />} />
                        <Route path="/about" element={<AboutPage onLoginClick={openAuthModal} />} />
                        <Route path="/pricing" element={<PricingPage onLoginClick={openAuthModal} />} />
                        <Route path="/blog" element={<BlogPage onLoginClick={openAuthModal} />} />
                        <Route path="/integrations" element={<IntegrationsPage onLoginClick={openAuthModal} />} />
                        <Route path="/changelog" element={<ChangelogPage onLoginClick={openAuthModal} />} />
                        <Route path="/careers" element={<CareersPage onLoginClick={openAuthModal} />} />
                        <Route path="/community" element={<CommunityPage onLoginClick={openAuthModal} />} />
                        <Route path="/docs" element={<DocumentationPage onLoginClick={openAuthModal} />} />
                        <Route path="/documentation" element={<DocumentationPage onLoginClick={openAuthModal} />} />
                        <Route path="/api" element={<ApiReferencePage onLoginClick={openAuthModal} />} />
                        <Route path="/api-reference" element={<ApiReferencePage onLoginClick={openAuthModal} />} />
                        <Route path="/features" element={<FeaturesPage onLoginClick={openAuthModal} />} />
                        <Route path="/solutions/:id" element={<SolutionPage onLoginClick={openAuthModal} />} />

                        <Route path="/admin/dashboard" element={<Navigate to="/" replace />} />
                        <Route path="/*" element={
                            <MainAppLayout
                                orchestratorStatus={orchestratorStatus}
                                handleNewChat={handleNewChat}
                                isSessionLoading={isSessionLoading}
                                messages={appStateMessages}
                                setMessages={setAppStateMessages}
                            />
                        } />
                    </>
                ) : (
                    /* Unauthenticated Routes */
                    <>
                        <Route path="/solutions/:id" element={<SolutionPage onLoginClick={openAuthModal} />} />
                        <Route path="/privacy" element={<PrivacyPolicy onLoginClick={openAuthModal} />} />
                        <Route path="/terms" element={<TermsOfService onLoginClick={openAuthModal} />} />
                        <Route path="/legal" element={<TermsOfService onLoginClick={openAuthModal} />} />
                        <Route path="/about" element={<AboutPage onLoginClick={openAuthModal} />} />
                        <Route path="/pricing" element={<PricingPage onLoginClick={openAuthModal} />} />
                        <Route path="/blog" element={<BlogPage onLoginClick={openAuthModal} />} />
                        <Route path="/integrations" element={<IntegrationsPage onLoginClick={openAuthModal} />} />
                        <Route path="/changelog" element={<ChangelogPage onLoginClick={openAuthModal} />} />
                        <Route path="/careers" element={<CareersPage onLoginClick={openAuthModal} />} />
                        <Route path="/community" element={<CommunityPage onLoginClick={openAuthModal} />} />
                        <Route path="/docs" element={<DocumentationPage onLoginClick={openAuthModal} />} />
                        <Route path="/documentation" element={<DocumentationPage onLoginClick={openAuthModal} />} />
                        <Route path="/api" element={<ApiReferencePage onLoginClick={openAuthModal} />} />
                        <Route path="/api-reference" element={<ApiReferencePage onLoginClick={openAuthModal} />} />
                        <Route path="/features" element={<FeaturesPage onLoginClick={openAuthModal} />} />
                        <Route path="/*" element={<LandingPage onLoginClick={openAuthModal} />} />
                    </>
                )}
            </Routes>
        </div>
    );
}

function AppWrapper() {
    return (
        <Router>
            <App />
        </Router>
    );
}

export default AppWrapper;