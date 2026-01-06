// frontend/src/components/learning/StudyPlanPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppState } from '../../contexts/AppStateContext.jsx';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Plus, Loader2, AlertTriangle, CheckCircle, Lock, Circle, GraduationCap, FileText, Globe, Code, BookMarked, ChevronLeft, Sparkles, Trash2, ChevronDown, ChevronUp, Library } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Button from '../core/Button';
import Modal from '../core/Modal.jsx';
import IconButton from '../core/IconButton.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap = {
    direct_answer: GraduationCap,
    document_review: FileText,
    web_search: Globe,
    academic_search: BookMarked,
    code_executor: Code,
};

const ModuleItem = ({ module, pathId, onModuleUpdate, isNextUp, handleNewChat, onLocalModuleUpdate }) => {
    const navigate = useNavigate();
    const [isUpdating, setIsUpdating] = useState(false);
    const { setInitialPromptForNewSession, setInitialActivityForNewSession } = useAppState();

    const handleStatusToggle = async () => {
        setIsUpdating(true);
        const newStatus = module.status === 'completed' ? 'not_started' : 'completed';

        // Optimistic UI Update
        onLocalModuleUpdate(module.moduleId, newStatus);

        try {
            await api.updateModuleStatus(pathId, module.moduleId, newStatus);
            toast.success(`Module '${module.title}' marked as ${newStatus}.`);
            // No full refetch needed, UI is already updated
        } catch (error) {
            toast.error(`Failed to update module: ${error.message}`);
            // Revert UI on error
            onLocalModuleUpdate(module.moduleId, module.status);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleStartModule = () => {
        const { activity } = module;

        if (activity.type === 'code_executor') {
            navigate('/tools/code-executor');
            return;
        }

        setInitialPromptForNewSession(activity.suggestedPrompt);
        setInitialActivityForNewSession(activity);

        handleNewChat(
            (newSessionId) => {
                if (activity.type === 'direct_answer' || activity.type === 'web_search' || activity.type === 'academic_search' || activity.type === 'document_review') {
                    navigate('/');
                }
            },
            true, true
        );
    };

    const ActivityIcon = iconMap[module.activity.type] || GraduationCap;
    const isLocked = module.status === 'locked';
    const isCompleted = module.status === 'completed';

    return (
        <div className={`flex items-start gap-4 p-4 border-l-4 ${isCompleted ? 'border-green-500 bg-green-500/5' : isNextUp ? 'border-primary' : 'border-transparent'}`}>
            <div className="flex-shrink-0 mt-1">
                {isUpdating ? (
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                ) : (
                    <button onClick={handleStatusToggle} disabled={isLocked} className="disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLocked ? <Lock className="w-6 h-6 text-text-muted-light dark:text-text-muted-dark" /> :
                            isCompleted ? <CheckCircle className="w-6 h-6 text-green-500" /> :
                                <Circle className="w-6 h-6 text-text-muted-light dark:text-text-muted-dark hover:text-primary" />}
                    </button>
                )}
            </div>
            <div className="flex-grow">
                <h4 className={`font-semibold ${isCompleted ? 'line-through text-text-muted-light dark:text-text-muted-dark' : 'text-text-light dark:text-text-dark'}`}>
                    {module.title}
                </h4>
                <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-1 italic">"{module.objective}"</p>
                <div className="flex items-center gap-2 text-xs mt-2 text-text-muted-light dark:text-text-muted-dark">
                    <ActivityIcon size={14} />
                    <span>Activity: {module.activity.resourceName ? `${module.activity.type} (${module.activity.resourceName})` : module.activity.type}</span>
                </div>
            </div>
            {isNextUp && !isCompleted && (
                <div className="flex-shrink-0 self-center">
                    <Button size="sm" onClick={handleStartModule}>Start Module</Button>
                </div>
            )}
        </div>
    );
};

const CreatePlan = ({ onPlanCreated }) => {
    const [goal, setGoal] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [questionnaire, setQuestionnaire] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();
    const formRef = useRef(null);

    const handleInitialGenerate = useCallback(async (e) => {
        if (e) e.preventDefault();
        const currentGoal = goal.trim();
        if (!currentGoal) {
            toast.error("Please enter a learning goal.");
            return;
        }
        setIsLoading(true);
        try {
            const response = await api.generateLearningPath(currentGoal);
            if (response.isQuestionnaire) {
                setQuestionnaire(response.questions);
                setAnswers(new Array(response.questions.length).fill(''));
                setCurrentStep(0);
            } else {
                toast.success("New study plan created successfully!");
                resetForm();
                onPlanCreated();
            }
        } catch (error) {
            toast.error(`Failed to start plan generation: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [goal, onPlanCreated]);

    useEffect(() => {
        const locationState = location.state;
        if (locationState?.prefilledGoal) {
            const prefilledGoal = locationState.prefilledGoal;
            setGoal(prefilledGoal);

            setTimeout(() => {
                if (formRef.current) {
                    formRef.current.requestSubmit();
                }
            }, 100);

            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    const handleAnswerChange = (index, value) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const handleFinalSubmit = async (e) => {
        if (e) e.preventDefault();
        setIsLoading(true);
        const context = {
            clarificationAnswers: questionnaire.map((q, i) => ({ question: q.questionText, answer: answers[i] }))
        };
        try {
            await api.generateLearningPath(goal.trim(), context);
            toast.success("Your personalized study plan has been created!");
            resetForm();
            onPlanCreated();
        } catch (error) {
            toast.error(`Failed to create personalized plan: ${error.message}`);
            resetForm();
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setGoal(''); setQuestionnaire(null); setCurrentStep(0); setAnswers([]);
    };

    const renderContent = () => {
        if (isLoading) { return (<motion.div key="loading-spinner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-12 text-center"> <Loader2 className="w-12 h-12 animate-spin text-primary" /> <p className="mt-4 text-lg font-semibold text-text-light dark:text-text-dark">We're doing magic, please wait...</p> <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Generating your personalized study plan.</p> </motion.div>); }
        if (questionnaire) {
            const question = questionnaire[currentStep];
            return (<motion.div key={`question-step-${currentStep}`} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="space-y-4"> <p className="text-sm text-text-muted-light dark:text-text-muted-dark">Step {currentStep + 1} of {questionnaire.length}</p> <h3 className="text-lg font-semibold my-2 text-text-light dark:text-text-dark">{question.questionText}</h3> {question.type === 'multiple_choice' ? (<div className="space-y-2 mt-4">{question.options.map(option => (<label key={option} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${answers[currentStep] === option ? 'border-primary bg-primary/10' : 'border-border-light dark:border-border-dark'}`}> <input type="radio" name={`q-${currentStep}`} value={option} checked={answers[currentStep] === option} onChange={() => handleAnswerChange(currentStep, option)} className="form-radio" /> <span className="ml-3">{option}</span> </label>))}</div>) : (<input type="text" value={answers[currentStep]} onChange={(e) => handleAnswerChange(currentStep, e.target.value)} className="input-field mt-4" placeholder="Type your answer here..." />)} <div className="flex justify-between items-center mt-6"> <Button variant="secondary" onClick={() => currentStep > 0 ? setCurrentStep(s => s - 1) : resetForm()} disabled={isLoading}>{currentStep > 0 ? 'Back' : 'Cancel'}</Button> {currentStep < questionnaire.length - 1 ? (<Button onClick={() => setCurrentStep(s => s + 1)} disabled={!answers[currentStep] || isLoading}>Next</Button>) : (<Button onClick={handleFinalSubmit} isLoading={isLoading} disabled={!answers[currentStep] || isLoading}>Generate My Plan</Button>)} </div> </motion.div>);
        }
        return (<motion.div key="initial-goal-input" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="space-y-6"> <h2 className="text-lg font-semibold text-center mb-4 text-text-light dark:text-text-dark">What is your learning goal?</h2> <textarea value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g., 'Master Python for data science'..." className="input-field w-full min-h-[80px] custom-scrollbar resize-y" disabled={isLoading} /> <Button type="submit" isLoading={isLoading} leftIcon={<Sparkles size={16} />} className="w-full">Generate Plan</Button> </motion.div>);
    };

    return (
        <form ref={formRef} id="create-plan-form" onSubmit={handleInitialGenerate} className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
                {renderContent()}
            </AnimatePresence>
        </form>
    );
};

const StudyPlanPage = ({ handleNewChat }) => {
    const [learningPaths, setLearningPaths] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStudyPlan, setSelectedStudyPlan] = useState(null);
    const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [planToDelete, setPlanToDelete] = useState(null);

    const handleDeletePlan = async () => {
        if (!planToDelete) return;
        const toastId = toast.loading(`Deleting plan "${planToDelete.title}"...`);
        try {
            await api.deleteLearningPath(planToDelete._id);
            toast.success(`Plan "${planToDelete.title}" deleted!`, { id: toastId });
            if (selectedStudyPlan && selectedStudyPlan._id === planToDelete._id) {
                setSelectedStudyPlan(null);
            }
            fetchPaths();
        } catch (error) {
            toast.error(`Failed to delete plan: ${error.message}`, { id: toastId });
        } finally {
            setShowDeleteConfirmModal(false);
            setPlanToDelete(null);
        }
    };

    const fetchPaths = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const paths = await api.getLearningPaths();
            setLearningPaths(paths);
        } catch (err) {
            setError(err.message || 'Failed to fetch learning paths.');
            toast.error(err.message || 'Failed to fetch learning paths.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchPaths(); }, [fetchPaths]);

    // Handle "New Study Plan" navigation from Sidebar
    const location = useLocation();
    useEffect(() => {
        if (location.state?.openCreateModal) {
            setShowCreatePlanModal(true);
            // Clear state so it doesn't reopen on refresh (optional but good practice, though challenging with react-router replacement inside effect)
            // Actually, we can just consume it. The navigate(..., { replace: true, state: {} }) might be cleaner but let's just open it.
            window.history.replaceState({}, document.title)
        }
    }, [location]);

    const handleLocalModuleUpdate = useCallback((moduleId, newStatus) => {
        setSelectedStudyPlan(currentPlan => {
            if (!currentPlan) return null;
            const newModules = currentPlan.modules.map(m =>
                m.moduleId === moduleId ? { ...m, status: newStatus } : m
            );
            if (newStatus === 'completed') {
                const moduleIndex = newModules.findIndex(m => m.moduleId === moduleId);
                if (moduleIndex !== -1 && moduleIndex + 1 < newModules.length && newModules[moduleIndex + 1].status === 'locked') {
                    newModules[moduleIndex + 1].status = 'not_started';
                }
            }
            const updatedPlan = { ...currentPlan, modules: newModules };

            // ALSO update the main list view state (learningPaths)
            setLearningPaths(currentPaths =>
                currentPaths.map(path =>
                    path._id === updatedPlan._id ? updatedPlan : path
                )
            );

            return updatedPlan;
        });
    }, []);

    const renderStudyPlanDetails = (plan) => {
        const nextUpModule = plan.modules.find(m => m.status === 'not_started' || m.status === 'in_progress');
        return (
            <motion.div key={plan._id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="card-base p-6 bg-chat-surface-light dark:bg-chat-surface-dark border-border-light dark:border-white/10">
                <h2 className="text-xl font-bold mb-4 text-text-light dark:text-text-dark">{plan.title}</h2>
                <div className="divide-y divide-border-light dark:divide-border-dark">
                    {plan.modules.map(module => (
                        <ModuleItem
                            key={module.moduleId}
                            module={module}
                            pathId={plan._id}
                            onModuleUpdate={fetchPaths}
                            onLocalModuleUpdate={handleLocalModuleUpdate}
                            isNextUp={nextUpModule?.moduleId === module.moduleId}
                            handleNewChat={handleNewChat}
                        />
                    ))}
                </div>
            </motion.div>
        );
    };

    const StudyPlanDashboard = () => {
        const totalPlans = learningPaths.length;
        const totalCompleted = learningPaths.reduce((acc, path) => acc + path.modules.filter(m => m.status === 'completed').length, 0);

        return (
            <div className="space-y-8">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 shadow-2xl">
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h2 className="text-3xl font-extrabold text-white mb-2">Keep Learning! 🚀</h2>
                            <p className="text-indigo-100 max-w-lg text-lg">
                                You have {totalPlans} active learning path{totalPlans !== 1 && 's'}. Continue your journey or explore something new today.
                            </p>
                            <div className="mt-6 flex gap-4">
                                <Button onClick={() => setShowCreatePlanModal(true)} className="bg-white text-indigo-600 hover:bg-indigo-50 border-none font-bold shadow-lg flex items-center gap-2">
                                    <Sparkles size={18} /> <span>CREATE NEW PLAN</span>
                                </Button>
                            </div>
                        </div>
                        <div className="hidden md:block opacity-90">
                            <GraduationCap size={120} className="text-white/20 absolute -right-4 -bottom-4 rotate-12" />
                            <BookMarked size={80} className="text-white" />
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div>
                    <h3 className="text-xl font-bold mb-6 text-text-light dark:text-text-dark flex items-center gap-2">
                        <Library size={20} className="text-primary" /> Your Learning Paths
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* New Plan Card (Always visible) */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowCreatePlanModal(true)}
                            className="group cursor-pointer flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-border-light dark:border-white/10 hover:border-primary dark:hover:border-primary bg-chat-surface-light/50 dark:bg-chat-surface-dark/50 hover:bg-chat-surface-light dark:hover:bg-chat-surface-dark transition-all duration-300 h-full min-h-[200px]"
                        >
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Plus size={32} className="text-primary" />
                            </div>
                            <h3 className="text-lg font-bold text-text-light dark:text-text-dark">Create New Plan</h3>
                            <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-2 text-center">Start a new personalized learning journey</p>
                        </motion.div>

                        {/* Existing Plans */}
                        <AnimatePresence>
                            {learningPaths.map(path => {
                                const isCompleted = path.modules.every(m => m.status === 'completed');
                                const hasStarted = !isCompleted && path.modules.some(m => m.status !== 'not_started' && m.status !== 'locked');
                                const completedModules = path.modules.filter(m => m.status === 'completed').length;
                                const totalModules = path.modules.length;
                                const progress = Math.round((completedModules / totalModules) * 100) || 0;

                                let statusText = 'Not Yet Started', statusClasses = 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
                                if (isCompleted) { statusText = 'Completed'; statusClasses = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'; }
                                else if (hasStarted) { statusText = 'Ongoing'; statusClasses = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'; }

                                return (
                                    <motion.div key={path._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                        className="card-base overflow-hidden p-0 relative bg-chat-surface-light dark:bg-chat-surface-dark border-border-light dark:border-white/10 flex flex-col h-full hover:shadow-xl transition-shadow duration-300"
                                    >
                                        <div onClick={() => setSelectedStudyPlan(path)} className="flex-1 p-6 cursor-pointer flex flex-col relative z-0">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-2 rounded-lg ${hasStarted ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                                    <GraduationCap size={24} className={hasStarted ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'} />
                                                </div>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider ${statusClasses}`}>
                                                    {statusText}
                                                </span>
                                            </div>

                                            <h2 className="text-xl font-bold text-text-light dark:text-text-dark mb-2 line-clamp-2" title={path.title}>{path.title}</h2>

                                            <div className="mt-auto pt-4">
                                                <div className="flex justify-between items-center text-xs text-text-muted-light dark:text-text-muted-dark mb-1">
                                                    <span>{completedModules}/{totalModules} Modules</span>
                                                    <span>{progress}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-6 py-3 bg-gray-50 dark:bg-white/5 border-t border-border-light dark:border-white/10 flex justify-end">
                                            <IconButton icon={Trash2} onClick={(e) => { e.stopPropagation(); setPlanToDelete(path); setShowDeleteConfirmModal(true); }} title="Delete Study Plan" size="sm" variant="ghost" className="text-red-500 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-chat-bg-light dark:bg-chat-bg-dark text-chat-text-light dark:text-chat-text-dark font-sans">
            <header className="flex-shrink-0 bg-chat-surface-light dark:bg-chat-surface-dark border-b border-border-light dark:border-white/10 h-16 flex items-center justify-center px-6 z-10">
                <h1 className="text-3xl font-extrabold text-primary dark:text-primary-light">My Study Plans</h1>
            </header>
            <div className="flex-shrink-0 bg-chat-surface-light dark:bg-chat-surface-dark border-b border-border-light dark:border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between">
                {selectedStudyPlan ? (
                    <button onClick={() => setSelectedStudyPlan(null)} className="text-text-muted-light dark:text-text-muted-dark hover:text-primary dark:hover:text-primary-light flex items-center gap-1.5 font-medium text-sm">
                        <ChevronLeft size={18} /> Back to All Plans
                    </button>
                ) : (
                    <div />
                )}
                <button onClick={() => setShowCreatePlanModal(true)} className="md:hidden animated-border-button">
                    <span>Generate New Plan ✨</span>
                </button>
            </div>
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar">
                <div className="max-w-4xl mx-auto">
                    {isLoading && (<div className="text-center p-8"> <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" /> <p className="mt-2 text-text-muted-light dark:text-text-muted-dark">Loading your plans...</p> </div>)}
                    {error && !isLoading && (<div className="p-4 bg-red-500/10 text-red-500 rounded-md text-center"> <AlertTriangle className="w-6 h-6 mx-auto mb-2" /> <p>{error}</p> <Button onClick={fetchPaths} size="sm" variant="outline" className="mt-4">Retry</Button> </div>)}
                    <AnimatePresence mode="wait">
                        {selectedStudyPlan ? (
                            <motion.div key="study-plan-details-view" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                                {renderStudyPlanDetails(selectedStudyPlan)}
                            </motion.div>
                        ) : (
                            <motion.div key="study-plan-dashboard-view" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.3 }}>
                                {!isLoading && !error && (
                                    <StudyPlanDashboard />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
            <Modal isOpen={showCreatePlanModal} onClose={() => setShowCreatePlanModal(false)} title="Generate New Study Plan" size="lg">
                <CreatePlan onPlanCreated={() => { fetchPaths(); setShowCreatePlanModal(false); }} />
            </Modal>
            <Modal
                isOpen={showDeleteConfirmModal}
                onClose={() => setShowDeleteConfirmModal(false)}
                title="Confirm Deletion"
                size="sm"
                footerContent={
                    <>
                        <Button variant="secondary" onClick={() => setShowDeleteConfirmModal(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDeletePlan}>Delete</Button>
                    </>
                } a
            >
                <p className="text-center text-text-light dark:text-text-dark text-lg py-4">
                    Are you sure you want to delete the study plan "{planToDelete?.title}"?
                    This action cannot be undone.
                </p>
            </Modal>
        </div>
    );
};
export default StudyPlanPage;