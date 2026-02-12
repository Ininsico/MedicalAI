"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import {
    CheckCircle2,
    Activity,
    Waves,
    Wind,
    Moon,
    Heart,
    AlertCircle,
    Stethoscope,
    Pill,
    ShieldCheck,
    ArrowRight,
    ArrowLeft,
    Sparkles,
    Brain,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const SYMPTOMS = [
    { id: 'tremor', label: 'Tremor', icon: <Waves size={24} />, description: 'Shaking intensity' },
    { id: 'stiffness', label: 'Rigidity', icon: <Activity size={24} />, description: 'Muscle tension' },
    { id: 'balance', label: 'Balance', icon: <Wind size={24} />, description: 'Stability level' },
    { id: 'sleep', label: 'Sleep', icon: <Moon size={24} />, description: 'Hours slept' },
    { id: 'mood', label: 'Mood', icon: <Heart size={24} />, description: 'Overall feeling' },
];

const SIDE_EFFECTS = ['Dizziness', 'Nausea', 'Fatigue', 'Dyskinesia', 'Confusion'];

export default function CheckInPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [alreadyDone, setAlreadyDone] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        tremor: 5,
        stiffness: 5,
        balance: 5,
        sleep: 7,
        mood: 7,
        medication: 'Yes',
        sideEffects: [] as string[],
    });

    const [role, setRole] = useState<'patient' | 'caregiver'>('patient');

    useEffect(() => {
        async function fetchLastEntry() {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) return;
                const user = JSON.parse(userStr);
                setRole(user.role);

                if (user.role === 'caregiver') return;

                const logs = await api.patient.getLogs(user.id);

                if (logs && logs.length > 0) {
                    const last = logs[0];
                    const isToday = (
                        new Date(last.date).toDateString() === new Date().toDateString() ||
                        new Date(last.created_at).toDateString() === new Date().toDateString()
                    );

                    if (isToday) {
                        setAlreadyDone(true);
                        return;
                    }

                    setFormData(prev => ({
                        ...prev,
                        tremor: last.tremor_severity || 5,
                        stiffness: last.stiffness_severity || 5,
                        sleep: last.sleep_hours || 7,
                        mood: last.mood === 'excellent' ? 10 : last.mood === 'good' ? 8 : last.mood === 'neutral' ? 5 : 3,
                        medication: last.medication_taken ? 'Yes' : 'Missed',
                        sideEffects: last.symptoms || [],
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch history:", error);
            }
        }
        fetchLastEntry();
    }, []);

    const handleSliderChange = (id: string, value: number) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const toggleSideEffect = (effect: string) => {
        setFormData(prev => ({
            ...prev,
            sideEffects: prev.sideEffects.includes(effect)
                ? prev.sideEffects.filter(e => e !== effect)
                : [...prev.sideEffects, effect]
        }));
    };

    const handleSubmit = async () => {
        if (submitting || loading) return;

        setSubmitting(true);
        setLoading(true);

        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                alert("Authentication error. Please log in again.");
                router.push('/login');
                return;
            }
            const user = JSON.parse(userStr);

            const mapMood = (val: number) => {
                if (val >= 9) return 'excellent';
                if (val >= 7) return 'good';
                if (val >= 4) return 'neutral';
                if (val >= 2) return 'poor';
                return 'bad';
            };

            const payload = {
                date: new Date().toISOString().split('T')[0],
                mood: mapMood(formData.mood),
                tremor_severity: formData.tremor,
                stiffness_severity: formData.stiffness,
                sleep_hours: formData.sleep,
                medication_taken: formData.medication === 'Yes' || formData.medication === 'Partially',
                symptoms: formData.sideEffects,
                activity_level: 'moderate',
                notes: ''
            };

            await api.patient.createLog(user.id, payload);
            setSuccess(true);
            setTimeout(() => router.push('/dashboard'), 2500);
        } catch (err: any) {
            console.error("Submission failed:", err);
            const errorMsg = err.response?.data?.error || err.message || '';
            if (errorMsg.toLowerCase().includes('already exists')) {
                setAlreadyDone(true);
                return;
            }
            alert("Error: " + (err.message || 'Unknown error'));
            setLoading(false);
            setSubmitting(false);
        }
    };

    if (role === 'caregiver') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center px-6 max-w-lg"
                >
                    <div className="p-12 rounded-3xl mb-6 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/50">
                        <Stethoscope size={48} className="text-teal-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">Caregiver Access</h2>
                        <p className="text-slate-600 text-sm mb-6">This assessment is only available for patients.</p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                        >
                            <ArrowLeft size={18} className="inline mr-2" />
                            Back to Dashboard
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (success || alreadyDone) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center px-6 max-w-lg"
                >
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-teal-500/20 blur-3xl rounded-full" />
                        <div className="relative p-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 shadow-2xl shadow-teal-600/30 mx-auto w-fit">
                            {success ? <CheckCircle2 size={64} className="text-white" /> : <ShieldCheck size={64} className="text-white" />}
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-3">
                        {success ? "All Done!" : "Already Completed"}
                    </h2>
                    <p className="text-slate-600 mb-6">
                        {success ? "Your check-in has been recorded successfully." : "You've completed today's check-in."}
                    </p>
                    {!success && (
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-8 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                        >
                            View Dashboard
                        </button>
                    )}
                </motion.div>
            </div>
        );
    }

    const totalSteps = 3;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex items-center justify-center p-6">
            {/* Decorations */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl" />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl" />

            <div className="relative w-full max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors mb-6"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-teal-200/50 mb-4">
                        <Sparkles size={12} className="text-teal-600" />
                        <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Step {currentStep + 1} of {totalSteps}</span>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Daily Check-In</h1>

                    {/* Progress Bar */}
                    <div className="max-w-md mx-auto mt-6">
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-teal-500 to-teal-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 md:p-12 min-h-[500px] flex flex-col">
                    <AnimatePresence mode="wait">
                        {/* Step 0: Physical Symptoms (Grid Layout) */}
                        {currentStep === 0 && (
                            <motion.div
                                key="step0"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="flex-1 flex flex-col"
                            >
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2">How are you feeling?</h2>
                                    <p className="text-slate-500">Rate your physical symptoms today</p>
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    {SYMPTOMS.map((symptom) => (
                                        <div key={symptom.id} className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200/50">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2.5 bg-teal-100 rounded-xl text-teal-600">
                                                    {symptom.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-slate-900">{symptom.label}</h3>
                                                    <p className="text-xs text-slate-500">{symptom.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-3xl font-bold text-teal-600">{formData[symptom.id as keyof typeof formData] as number}</div>
                                                    <div className="text-xs text-slate-400">/10</div>
                                                </div>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="10"
                                                value={formData[symptom.id as keyof typeof formData] as number}
                                                onChange={(e) => handleSliderChange(symptom.id, parseInt(e.target.value))}
                                                className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer slider-teal"
                                                style={{
                                                    background: `linear-gradient(to right, rgb(20 184 166) 0%, rgb(20 184 166) ${(formData[symptom.id as keyof typeof formData] as number) * 10}%, rgb(226 232 240) ${(formData[symptom.id as keyof typeof formData] as number) * 10}%, rgb(226 232 240) 100%)`
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 1: Medication */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="flex-1 flex flex-col justify-center"
                            >
                                <div className="text-center mb-12">
                                    <div className="p-6 bg-teal-100 rounded-full w-fit mx-auto mb-6">
                                        <Pill size={48} className="text-teal-600" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Medication Status</h2>
                                    <p className="text-slate-500">Did you take your medication today?</p>
                                </div>

                                <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                                    {['Yes', 'Partially', 'Missed'].map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, medication: option }))}
                                            className={cn(
                                                "group py-8 px-6 rounded-2xl border-2 font-bold transition-all",
                                                formData.medication === option
                                                    ? "border-teal-600 bg-teal-50 shadow-lg shadow-teal-600/20 scale-105"
                                                    : "border-slate-200 bg-white hover:border-teal-300 hover:scale-102"
                                            )}
                                        >
                                            <div className={cn(
                                                "text-5xl mb-3",
                                                formData.medication === option ? "text-teal-600" : "text-slate-400"
                                            )}>
                                                {option === 'Yes' ? '✓' : option === 'Partially' ? '½' : '×'}
                                            </div>
                                            <div className={cn(
                                                "text-lg",
                                                formData.medication === option ? "text-teal-700" : "text-slate-600"
                                            )}>
                                                {option}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Side Effects */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="flex-1 flex flex-col justify-center"
                            >
                                <div className="text-center mb-12">
                                    <div className="p-6 bg-teal-100 rounded-full w-fit mx-auto mb-6">
                                        <AlertCircle size={48} className="text-teal-600" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Any Side Effects?</h2>
                                    <p className="text-slate-500">Select any symptoms you're experiencing</p>
                                </div>

                                <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
                                    {SIDE_EFFECTS.map((effect) => (
                                        <button
                                            key={effect}
                                            type="button"
                                            onClick={() => toggleSideEffect(effect)}
                                            className={cn(
                                                "py-4 px-8 rounded-2xl border-2 font-semibold text-lg transition-all",
                                                formData.sideEffects.includes(effect)
                                                    ? "border-teal-600 bg-teal-50 text-teal-700 scale-105 shadow-lg shadow-teal-600/20"
                                                    : "border-slate-200 bg-white text-slate-600 hover:border-teal-300"
                                            )}
                                        >
                                            {effect}
                                        </button>
                                    ))}
                                </div>

                                <div className="text-center mt-8 text-sm text-slate-400">
                                    {formData.sideEffects.length === 0 ? "No side effects selected" : `${formData.sideEffects.length} selected`}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-200/50">
                        <button
                            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                            disabled={currentStep === 0}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all",
                                currentStep === 0
                                    ? "opacity-0 pointer-events-none"
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            )}
                        >
                            <ChevronLeft size={20} />
                            Back
                        </button>

                        <div className="flex gap-2">
                            {[0, 1, 2].map((step) => (
                                <div
                                    key={step}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all",
                                        step === currentStep ? "bg-teal-600 w-8" : "bg-slate-300"
                                    )}
                                />
                            ))}
                        </div>

                        {currentStep < totalSteps - 1 ? (
                            <button
                                onClick={() => setCurrentStep(currentStep + 1)}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-teal-600/30 transition-all"
                            >
                                Next
                                <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-teal-600/30 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Submitting...' : 'Complete'}
                                <CheckCircle2 size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
