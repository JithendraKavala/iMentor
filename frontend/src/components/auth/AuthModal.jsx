// frontend/src/components/auth/AuthModal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useAppState } from '../../contexts/AppStateContext.jsx';
import LLMSelection from './LLMSelection.jsx';
import OtpInputComponent from './OtpInput.jsx';
import toast from 'react-hot-toast';
import { LogIn, UserPlus, X, KeyRound, AtSign, AlertCircle, HardDrive, CheckSquare, Square, User, School, Hash, Award, Wrench, Calendar, Lightbulb, Goal, ChevronDown } from 'lucide-react';
import Button from '../core/Button.jsx';
import IconButton from '../core/IconButton.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api.js';

const yearOptions = {
    "Bachelor's": ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    "Master's": ["1st Year", "2nd Year"],
    "PhD": ["Coursework", "Research Phase", "Writing Phase"],
    "Diploma": ["1st Year", "2nd Year", "3rd Year"]
};

const getYearOptions = (degree) => {
    return yearOptions[degree] || ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduated"];
};

function AuthModal({ isOpen, onClose, initialViewIsLogin }) {
    const { login, signup } = useAuth();
    const { switchLLM: setGlobalLLM, selectedLLM } = useAppState();

    const [isLoginView, setIsLoginView] = useState(initialViewIsLogin);
    const [step, setStep] = useState(1);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [otp, setOtp] = useState('');

    const [formData, setFormData] = useState({
        email: '', password: '', localSelectedLLM: 'gemini',
        apiKey: '', ollamaUrl: '', requestKeyFromAdmin: false,
        name: '', college: '', universityNumber: '',
        degreeType: "Bachelor's", branch: 'Computer Science', year: '1st Year',
        learningStyle: 'Reading/Writing', currentGoals: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    useEffect(() => {
        if (isOpen) {
            setError(''); setStep(1); setIsOtpSent(false); setIsSendingOtp(false);
            setOtp(''); setIsLoginView(initialViewIsLogin);
            setFormData({
                email: '', password: '', localSelectedLLM: selectedLLM || 'gemini',
                apiKey: '', ollamaUrl: '', requestKeyFromAdmin: false,
                name: '', college: '', universityNumber: '',
                degreeType: "Bachelor's", branch: 'Computer Science', year: '1st Year',
                learningStyle: 'Reading/Writing', currentGoals: ''
            });
        }
    }, [isOpen, selectedLLM, initialViewIsLogin]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: type === 'checkbox' ? checked : value };
            if (name === 'degreeType') {
                newState.year = getYearOptions(value)[0];
            }
            return newState;
        });
    };

    const handleSendOtp = async () => {
        setError('');
        if (!emailRegex.test(formData.email)) return setError("Please enter a valid email address.");
        if (formData.password.length < 6) return setError("Password must be at least 6 characters long.");

        setIsSendingOtp(true);
        const toastId = toast.loading('Sending verification code...');
        try {
            const response = await api.sendOtp(formData.email, formData.password);
            toast.success(response.message, { id: toastId });
            setIsOtpSent(true);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            toast.error(err.response?.data?.message || err.message, { id: toastId });
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleNext = () => {
        setError('');
        if (isOtpSent && otp.length !== 6) return setError("Please enter the 6-digit verification code.");
        if (step === 2 && (!formData.name.trim() || !formData.college.trim() || !formData.universityNumber.trim())) {
            return setError("Please fill out all academic profile fields.");
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => { setError(''); setStep(prev => prev - 1); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (isLoginView) {
            const toastId = toast.loading('Logging in...');
            try {
                const { email, password } = formData;
                if (!emailRegex.test(email)) throw new Error("Please enter a valid email address.");
                const authDataResponse = await login({ email, password });
                if (authDataResponse.isAdminLogin) toast.success("Admin login successful!", { id: toastId });
                else toast.success(authDataResponse.message || 'Welcome back!', { id: toastId });
                onClose(authDataResponse);
            } catch (err) {
                const errorMessage = err.response?.data?.message || err.message;
                setError(errorMessage);
                toast.error(errorMessage, { id: toastId });
            } finally { setLoading(false); }
        } else {
            const toastId = toast.loading('Creating your account...');
            if (formData.localSelectedLLM === 'gemini' && !formData.apiKey.trim() && !formData.requestKeyFromAdmin) {
                setLoading(false); toast.dismiss(toastId);
                return setError("Gemini API Key is required, or request one from the admin.");
            }
            if (formData.localSelectedLLM === 'ollama' && !formData.ollamaUrl.trim()) {
                setLoading(false); toast.dismiss(toastId);
                return setError("Ollama URL is required.");
            }

            try {
                const finalSignupData = { ...formData, otp };
                const authDataResponse = await signup(finalSignupData);
                setGlobalLLM(formData.localSelectedLLM);
                toast.success(authDataResponse.message || 'Account created successfully!', { id: toastId });
                onClose(authDataResponse);
            } catch (err) {
                const errorMessage = err.response?.data?.message || err.message;
                setError(errorMessage);
                toast.error(errorMessage, { id: toastId });
            } finally { setLoading(false); }
        }
    };

    const inputWrapperClass = "relative";
    const inputIconClass = "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500";
    const inputFieldStyledClass = "w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100";

    const renderStep1 = () => (
        <div className="space-y-4">
            <div className={inputWrapperClass}>
                <AtSign className={inputIconClass} />
                <input type="email" name="email" className={inputFieldStyledClass} placeholder="Email Address" value={formData.email} onChange={handleChange} required disabled={loading || isOtpSent || isSendingOtp} />
            </div>
            <div className={inputWrapperClass}>
                <KeyRound className={inputIconClass} />
                <input type="password" name="password" className={inputFieldStyledClass} placeholder="Password (min. 6 characters)" value={formData.password} onChange={handleChange} required minLength="6" disabled={loading || isOtpSent || isSendingOtp} />
            </div>

            <AnimatePresence>
                {isOtpSent && (
                    <motion.div key="otp-input" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4 text-center">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Check your email for verification code</label>
                        <OtpInputComponent otp={otp} setOtp={setOtp} onComplete={handleNext} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-center mb-6">
                <p className="text-sm text-indigo-900 dark:text-indigo-200 font-medium">Create your Academic Profile</p>
                <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">This helps us personalize your learning experience.</p>
            </div>

            <div className={inputWrapperClass}>
                <User className={inputIconClass} />
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className={inputFieldStyledClass} required />
            </div>
            <div className={inputWrapperClass}>
                <School className={inputIconClass} />
                <input type="text" name="college" value={formData.college} onChange={handleChange} placeholder="College / Institution" className={inputFieldStyledClass} required />
            </div>
            <div className={inputWrapperClass}>
                <Hash className={inputIconClass} />
                <input type="text" name="universityNumber" value={formData.universityNumber} onChange={handleChange} placeholder="University Number" className={inputFieldStyledClass} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={inputWrapperClass}>
                    <Award className={inputIconClass} />
                    <select name="degreeType" value={formData.degreeType} onChange={handleChange} className={`${inputFieldStyledClass} appearance-none cursor-pointer`} required>
                        <option>Bachelor's</option><option>Master's</option><option>PhD</option><option>Diploma</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                </div>
                <div className={inputWrapperClass}>
                    <Calendar className={inputIconClass} />
                    <select name="year" value={formData.year} onChange={handleChange} className={`${inputFieldStyledClass} appearance-none cursor-pointer`} required>
                        {getYearOptions(formData.degreeType).map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                </div>
            </div>
            <div className={inputWrapperClass}>
                <Wrench className={inputIconClass} />
                <select name="branch" value={formData.branch} onChange={handleChange} className={`${inputFieldStyledClass} appearance-none cursor-pointer`} required>
                    <option>Computer Science</option><option>Mechanical</option><option>Electrical</option><option>Civil</option><option>Electronics</option><option>Other</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-5">
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Learning Style</label>
                <div className={inputWrapperClass}>
                    <Lightbulb className={inputIconClass} />
                    <select name="learningStyle" value={formData.learningStyle} onChange={handleChange} className={`${inputFieldStyledClass} appearance-none cursor-pointer`} required>
                        <option>Reading/Writing (detailed text)</option>
                        <option>Visual (diagrams, mind maps)</option>
                        <option>Auditory (podcasts, explanations)</option>
                        <option>Kinesthetic (hands-on examples, code)</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                </div>
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Current Goals (Optional)</label>
                <div className={inputWrapperClass}>
                    <Goal className={`${inputIconClass} top-6`} />
                    <textarea name="currentGoals" value={formData.currentGoals} onChange={handleChange} placeholder="e.g., 'Prepare for my AI exam', 'Understand thermodynamics basics'" className={`${inputFieldStyledClass} !h-24 resize-none`} maxLength="500"></textarea>
                </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <LLMSelection selectedLLM={formData.localSelectedLLM} onLlmChange={(llm) => handleChange({ target: { name: 'localSelectedLLM', value: llm } })} disabled={loading} />
            </div>
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => onClose(null)}
            />

            <motion.div
                key="auth-modal-content"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-900/20 dark:shadow-black/50 w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800"
            >
                <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500`} />

                <div className="p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{isLoginView ? 'Welcome Back' : 'Create Account'}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {isLoginView ? 'Enter your credentials to continue.' : `Step ${step} of 3 • Basic Information`}
                            </p>
                        </div>
                        <IconButton icon={X} onClick={() => onClose(null)} variant="ghost" size="sm" title="Close" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                    </div>

                    {!isLoginView && (
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 mb-8 overflow-hidden">
                            <motion.div
                                className="bg-indigo-600 h-full rounded-full"
                                initial={{ width: '0%' }}
                                animate={{ width: `${(step / 3) * 100}%` }}
                                transition={{ ease: "easeInOut", duration: 0.5 }}
                            />
                        </div>
                    )}

                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-300 rounded-xl text-sm flex items-start gap-3">
                            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLoginView ? 'login' : `step${step}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="min-h-[220px]"
                            >
                                {isLoginView ? (
                                    <div className="space-y-4">
                                        <div className={inputWrapperClass}>
                                            <AtSign className={inputIconClass} />
                                            <input type="email" name="email" className={inputFieldStyledClass} placeholder="Email Address" value={formData.email} onChange={handleChange} required disabled={loading} />
                                        </div>
                                        <div className={inputWrapperClass}>
                                            <KeyRound className={inputIconClass} />
                                            <input type="password" name="password" className={inputFieldStyledClass} placeholder="Password" value={formData.password} onChange={handleChange} required disabled={loading} />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {step === 1 && renderStep1()}
                                        {step === 2 && renderStep2()}
                                        {step === 3 && renderStep3()}
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {!isLoginView && step === 3 && (
                            <div className="space-y-4 pt-4 animate-fadeIn border-t border-slate-100 dark:border-slate-800 mt-4">
                                <div style={{ display: formData.localSelectedLLM === 'gemini' ? 'block' : 'none' }}>
                                    <motion.div key="gemini-input" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <div className="flex items-center mb-3">
                                            <button type="button" onClick={() => handleChange({ target: { name: 'requestKeyFromAdmin', type: 'checkbox', checked: !formData.requestKeyFromAdmin } })} className="flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" disabled={loading}>
                                                {formData.requestKeyFromAdmin ? <CheckSquare size={16} className="text-indigo-600 mr-2" /> : <Square size={16} className="mr-2" />}
                                                Request API Key from Admin
                                            </button>
                                        </div>
                                        <AnimatePresence>
                                            {!formData.requestKeyFromAdmin && (
                                                <motion.div key="api-key-field" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                                    <label htmlFor="api-key-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Gemini API Key <span className="text-rose-500">*</span></label>
                                                    <div className={inputWrapperClass}>
                                                        <KeyRound className={inputIconClass} />
                                                        <input type="password" name="apiKey" id="api-key-input" className={inputFieldStyledClass} placeholder="Enter your Gemini API Key" value={formData.apiKey} onChange={handleChange} required={!formData.requestKeyFromAdmin && formData.localSelectedLLM === 'gemini'} disabled={loading} />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </div>
                                <div style={{ display: formData.localSelectedLLM === 'ollama' ? 'block' : 'none' }}>
                                    <motion.div key="ollama-input" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <label htmlFor="ollama-url-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Ollama URL <span className="text-rose-500">*</span></label>
                                        <div className={inputWrapperClass}>
                                            <HardDrive className={inputIconClass} />
                                            <input type="text" name="ollamaUrl" id="ollama-url-input" className={inputFieldStyledClass} placeholder="e.g., http://localhost:11434" value={formData.ollamaUrl} onChange={handleChange} required={formData.localSelectedLLM === 'ollama'} disabled={loading} />
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        )}

                        <div className="pt-6 flex items-center gap-3">
                            {!isLoginView && step > 1 && (
                                <Button type="button" variant="ghost" onClick={handleBack} disabled={loading}> Back </Button>
                            )}
                            <div className="flex-grow">
                                {isLoginView ? (
                                    <Button type="submit" fullWidth isLoading={loading} leftIcon={<LogIn size={18} />} className="font-semibold shadow-lg shadow-indigo-500/20">Sign in</Button>
                                ) : step < 3 ? (
                                    !isOtpSent ? (
                                        <Button type="button" fullWidth onClick={handleSendOtp} isLoading={isSendingOtp} disabled={loading}>Send Verification Code</Button>
                                    ) : (
                                        <Button type="button" fullWidth onClick={handleNext} disabled={loading || otp.length !== 6}>Verify & Continue</Button>
                                    )
                                ) : (
                                    <Button type="submit" fullWidth isLoading={loading} leftIcon={<UserPlus size={18} />} className="font-semibold shadow-lg shadow-indigo-500/20">Create Account</Button>
                                )}
                            </div>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                        <button onClick={() => { setIsLoginView(!isLoginView); setError(''); setStep(1); setIsOtpSent(false); setOtp(''); }} className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors" disabled={loading}>
                            {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
export default AuthModal;