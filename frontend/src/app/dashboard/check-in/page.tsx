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
    { id: 'tremor', label: 'Tremor', icon: <Waves size={20} />, description: 'Shaking' },
    { id: 'stiffness', label: 'Rigidity', icon: <Activity size={20} />, description: 'Tension' },
    { id: 'balance', label: 'Balance', icon: <Wind size={20} />, description: 'Stability' },
    { id: 'sleep', label: 'Sleep', icon: <Moon size={20} />, description: 'Hours' },
    { id: 'mood', label: 'Mood', icon: <Heart size={20} />, description: 'Feeling' },
];

const SIDE_EFFECTS = ['Dizziness', 'Nausea', 'Fatigue', 'Dyskinesia', 'Confusion'];

export default function CheckInPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [existingLogId, setExistingLogId] = useState<string | null>(null);
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
                    // Normalize dates for comparison to handle timezone shifts
                    const today = new Date().toISOString().split('T')[0];
                    const existingLog = logs.find((l: any) => l.date === today);

                    if (existingLog) {
                        // Load existing data for editing
                        setIsEditing(true);
                        setExistingLogId(existingLog.id);
                        setFormData({
                            tremor: existingLog.tremor_severity || 5,
                            stiffness: existingLog.stiffness_severity || 5,
                            balance: 5,
                            sleep: existingLog.sleep_hours || 7,
                            mood: existingLog.mood === 'excellent' ? 10 : existingLog.mood === 'good' ? 8 : existingLog.mood === 'neutral' ? 5 : 3,
                            medication: existingLog.medication_taken ? 'Yes' : 'Missed',
                            sideEffects: existingLog.symptoms || [],
                        });
                    }
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

            if (isEditing && existingLogId) {
                // Update existing log
                await api.patient.updateLog(user.id, existingLogId, payload);
            } else {
                // Double check if entry exists to avoid 400 error
                const logs = await api.patient.getLogs(user.id);
                const today = new Date().toISOString().split('T')[0];
                const existing = logs.find((l: any) => l.date === today);

                if (existing) {
                    await api.patient.updateLog(user.id, existing.id, payload);
                } else {
                    await api.patient.createLog(user.id, payload);
                }
            }

            setSuccess(true);
            setTimeout(() => router.push('/dashboard'), 2500);
        } catch (err: any) {
            alert("Error: " + (err.message || 'Unknown error'));
            setLoading(false);
            setSubmitting(false);
        }
    };

    if (role === 'caregiver') {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/30 overflow-hidden">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center px-6 max-w-md">
                    <div className="p-10 rounded-3xl bg-white shadow-xl border border-slate-200/50">
                        <Stethoscope size={40} className="text-teal-600 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Caregiver Access</h2>
                        <p className="text-sm text-slate-600 mb-6">Assessment is for patients only.</p>
                        <button onClick={() => router.push('/dashboard')} className="w-full px-6 py-2.5 bg-gradient-to-r from-teal-600 to-teal-500 text-white text-sm font-semibold rounded-xl">
                            Back to Dashboard
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/30 overflow-hidden">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center px-6">
                    <div className="p-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 shadow-2xl shadow-teal-600/30 mx-auto w-fit mb-6">
                        {success ? <CheckCircle2 size={56} className="text-white" /> : <ShieldCheck size={56} className="text-white" />}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Complete!</h2>
                    <p className="text-slate-600 mb-6 text-sm">{isEditing ? "Changes saved successfully!" : "Check-in recorded successfully!"}</p>
                </motion.div>
            </div>
        );
    }

    const totalSteps = 3;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex items-center justify-center p-4">
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-5xl flex flex-col max-h-[90vh] sm:h-auto">
                {/* Compact Header */}
                <div className="text-center mb-4 flex-shrink-0">
                    <button onClick={() => router.push('/dashboard')} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-teal-600 mb-2 transition-colors">
                        <ArrowLeft size={14} /> Back
                    </button>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-teal-200/50 mb-2 shadow-sm">
                        <Sparkles size={10} className="text-teal-600" />
                        <span className="text-[10px] font-semibold text-teal-700 uppercase">{isEditing ? "Editing" : "Step"} {currentStep + 1}/{totalSteps}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Daily Check-In</h1>
                    <div className="max-w-md mx-auto w-full px-4">
                        <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-gradient-to-r from-teal-500 to-teal-400" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                        </div>
                    </div>
                </div>

                {/* Main Card - Compact */}
                <div className="relative rounded-2xl bg-white border border-slate-200/50 shadow-lg flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        <AnimatePresence mode="wait">
                            {/* Step 0 */}
                            {currentStep === 0 && (
                                <motion.div key="step0" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="h-full flex flex-col">
                                    <div className="mb-4">
                                        <h2 className="text-lg font-bold text-slate-900">Physical Symptoms</h2>
                                        <p className="text-xs text-slate-500">Rate each from 0-10</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {SYMPTOMS.map((symptom) => (
                                            <div key={symptom.id} className="bg-slate-50/50 rounded-xl p-3 border border-slate-200/50 hover:border-teal-200 transition-colors">
                                                <div className="flex items-start gap-2 mb-2">
                                                    <div className="p-1.5 bg-teal-100 rounded-lg text-teal-600 flex-shrink-0">
                                                        {symptom.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-xs text-slate-900 leading-tight">{symptom.label}</h3>
                                                        <p className="text-[9px] text-slate-500">{symptom.description}</p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <div className="text-xl font-bold text-teal-600 leading-none">{formData[symptom.id as keyof typeof formData] as number}</div>
                                                        <div className="text-[9px] text-slate-400">/10</div>
                                                    </div>
                                                </div>
                                                <input
                                                    type="range" min="0" max="10"
                                                    value={formData[symptom.id as keyof typeof formData] as number}
                                                    onChange={(e) => handleSliderChange(symptom.id, parseInt(e.target.value))}
                                                    className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer slider-teal"
                                                    style={{ background: `linear-gradient(to right, rgb(20 184 166) 0%, rgb(20 184 166) ${(formData[symptom.id as keyof typeof formData] as number) * 10}%, rgb(226 232 240) ${(formData[symptom.id as keyof typeof formData] as number) * 10}%, rgb(226 232 240) 100%)` }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 1 */}
                            {currentStep === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="h-full flex flex-col justify-center py-6">
                                    <div className="text-center mb-6">
                                        <div className="p-4 bg-teal-100 rounded-full w-fit mx-auto mb-3">
                                            <Pill size={32} className="text-teal-600" />
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-900 mb-1">Medication</h2>
                                        <p className="text-xs text-slate-500">Did you take it today?</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto w-full">
                                        {['Yes', 'Partially', 'Missed'].map((option) => (
                                            <button key={option} type="button" onClick={() => setFormData(p => ({ ...p, medication: option }))}
                                                className={cn("py-5 px-4 rounded-xl border-2 font-bold transition-all",
                                                    formData.medication === option ? "border-teal-600 bg-teal-50 shadow-lg shadow-teal-600/20 scale-[1.02]" : "border-slate-200 bg-white hover:border-teal-300")}>
                                                <div className={cn("text-3xl mb-1", formData.medication === option ? "text-teal-600" : "text-slate-400")}>
                                                    {option === 'Yes' ? '✓' : option === 'Partially' ? '½' : '×'}
                                                </div>
                                                <div className={cn("text-sm", formData.medication === option ? "text-teal-700" : "text-slate-600")}>{option}</div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2 */}
                            {currentStep === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="h-full flex flex-col justify-center py-6">
                                    <div className="text-center mb-6">
                                        <div className="p-4 bg-teal-100 rounded-full w-fit mx-auto mb-3">
                                            <AlertCircle size={32} className="text-teal-600" />
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-900 mb-1">Side Effects</h2>
                                        <p className="text-xs text-slate-500">Select any you're experiencing</p>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                                        {SIDE_EFFECTS.map((effect) => (
                                            <button key={effect} type="button" onClick={() => toggleSideEffect(effect)}
                                                className={cn("py-2.5 px-5 rounded-xl border-2 font-semibold text-sm transition-all",
                                                    formData.sideEffects.includes(effect) ? "border-teal-600 bg-teal-50 text-teal-700 scale-105" : "border-slate-200 bg-white text-slate-600 hover:border-teal-300")}>
                                                {effect}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="text-center mt-4 text-[10px] text-slate-400">
                                        {formData.sideEffects.length === 0 ? "None selected" : `${formData.sideEffects.length} selected`}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Navigation */}
                    <div className="p-4 bg-slate-50 border-t border-slate-200/50 flex items-center justify-between shrink-0">
                        <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}
                            className={cn("flex items-center gap-1 px-4 py-2 rounded-lg font-semibold text-xs transition-opacity", currentStep === 0 ? "opacity-0 pointer-events-none" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50")}>
                            <ChevronLeft size={16} /> Back
                        </button>
                        <div className="flex gap-1.5">
                            {[0, 1, 2].map((step) => (
                                <div key={step} className={cn("w-1.5 h-1.5 rounded-full transition-all duration-300", step === currentStep ? "bg-teal-600 w-6" : "bg-slate-300")} />
                            ))}
                        </div>
                        {currentStep < totalSteps - 1 ? (
                            <button onClick={() => setCurrentStep(currentStep + 1)} className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-semibold text-xs rounded-lg shadow-lg shadow-teal-500/20 transition-all">
                                Next <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-1 px-6 py-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-semibold text-xs rounded-lg shadow-lg shadow-teal-500/20 disabled:opacity-50 transition-all">
                                {loading ? (isEditing ? 'Updating...' : 'Submitting...') : (isEditing ? 'Update Check-In' : 'Complete')} <CheckCircle2 size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
