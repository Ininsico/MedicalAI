"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
    LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const SYMPTOMS = [
    { id: 'tremor', label: 'Tremor / Shaking', icon: <Waves size={24} />, description: 'Resting or active tremors' },
    { id: 'stiffness', label: 'Muscle Rigidity', icon: <Activity size={24} />, description: 'Muscle tension or stiffness' },
    { id: 'balance', label: 'Walking & Stability', icon: <Wind size={24} />, description: 'Balance while moving' },
    { id: 'sleep', label: 'Neural Rest', icon: <Moon size={24} />, description: 'Depth and quality of sleep' },
    { id: 'mood', label: 'Cognitive State', icon: <Heart size={24} />, description: 'Emotional regulation' },
];

const SIDE_EFFECTS = ['Dizziness', 'Nausea', 'Fatigue', 'Dyskinesia', 'Confusion'];

export default function CheckInPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [alreadyDone, setAlreadyDone] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        tremor: 5,
        stiffness: 5,
        balance: 5,
        sleep: 5,
        mood: 5,
        medication: 'Yes',
        sideEffects: [] as string[],
        notes: ''
    });

    useEffect(() => {
        async function fetchLastEntry() {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) return;
                const user = JSON.parse(userStr);

                const logs = await api.patient.getLogs(user.id);

                if (logs && logs.length > 0) {
                    const last = logs[0];
                    const isToday = (
                        new Date(last.date).toDateString() === new Date().toDateString() ||
                        new Date(last.created_at).toDateString() === new Date().toDateString()
                    );

                    if (isToday) {
                        setAlreadyDone(true);
                        return; // Don't prefill if already done, we'll show done screen
                    }

                    setFormData(prev => ({
                        ...prev,
                        tremor: last.tremor_severity || 5,
                        stiffness: last.stiffness_severity || 5,
                        balance: 5, // Not in backend yet
                        sleep: last.sleep_hours || 5,
                        mood: last.mood === 'excellent' ? 10 : last.mood === 'good' ? 8 : last.mood === 'neutral' ? 5 : last.mood === 'poor' ? 3 : 1,
                        medication: last.medication_taken ? 'Yes' : 'Missed',
                        sideEffects: last.symptoms || [],
                        notes: last.notes || ''
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent duplicate submissions
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

            // Map numeric mood to enum
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
                medication_notes: formData.medication === 'Partially' ? 'Taken partially' : undefined,
                symptoms: formData.sideEffects,
                activity_level: 'moderate', // Default
                notes: formData.notes
            };

            await api.patient.createLog(user.id, payload);

            setSuccess(true);
            setTimeout(() => router.push('/dashboard'), 2000);
        } catch (err: any) {
            console.error("Submission failed:", err);

            // Check if it's a "duplicate log" error from backend
            const errorMsg = err.response?.data?.error || err.message || '';
            if (errorMsg.toLowerCase().includes('already exists')) {
                setAlreadyDone(true);
                return;
            }

            alert("Error submitting data: " + (err.message || 'Unknown error'));
            setLoading(false);
            setSubmitting(false);
        }
    };

    if (success || alreadyDone) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center px-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                        "p-10 rounded-full mb-10 shadow-2xl transition-all",
                        success ? "bg-emerald-100 shadow-emerald-500/20" : "bg-teal-100 shadow-teal-500/20"
                    )}
                >
                    {success ? (
                        <CheckCircle2 size={100} className="text-emerald-600" />
                    ) : (
                        <ShieldCheck size={100} className="text-teal-600" />
                    )}
                </motion.div>
                <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter">
                    {success ? "Transmission Successful" : "Daily Baseline Secured"}
                </h2>
                <p className="text-slate-500 font-medium text-xl max-w-md mx-auto leading-relaxed">
                    {success
                        ? "Your clinical data packets have been synchronized for today's analysis period."
                        : "System indicates today's physiological calibration is already complete. Analysis engine is processing your data."}
                </p>
                {!success && (
                    <Button
                        onClick={() => router.push('/dashboard')}
                        className="mt-12 px-12 py-6 rounded-2xl"
                    >
                        Return to Command Center <ArrowRight size={20} className="ml-3" />
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pt-10 pb-32">
            <header className="mb-16 flex justify-between items-start">
                <div className="flex-1" />
                <div className="flex-[2] text-center">
                    <div className="inline-flex items-center space-x-2 bg-white/50 border border-white px-4 py-2 rounded-full mb-6">
                        <span className="text-xs font-black tracking-widest uppercase text-slate-500">60-Second Rapid Calibration</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Daily Check-In</h1>
                    <p className="text-slate-500 font-medium max-w-lg mx-auto italic font-serif text-lg">
                        Record your physiological state. This information is non-diagnostic.
                    </p>
                </div>
                <div className="flex-1 flex justify-end">
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            window.location.href = '/login';
                        }}
                        className="p-4 bg-white/50 border border-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl shadow-premium backdrop-blur-xl transition-all group"
                        title="End Session"
                    >
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                    </button>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-12">
                {/* Physical Symptoms Section */}
                <section className="space-y-8">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest border-l-4 border-teal-500 pl-4">Physical Metrics</h3>
                    <div className="grid grid-cols-1 gap-6">
                        {SYMPTOMS.map((symptom) => (
                            <Card key={symptom.id} className="p-8 border-white/50" hover={false}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="flex items-center space-x-6 min-w-[250px]">
                                        <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 shadow-inner">
                                            {symptom.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 uppercase tracking-tight">{symptom.label}</h4>
                                            <p className="text-xs text-slate-400 font-medium">{symptom.description}</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            <span>Minimal</span>
                                            <span className="text-teal-600 text-lg">{formData[symptom.id as keyof typeof formData] as number} / 10</span>
                                            <span>Maximal</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="10"
                                            step="1"
                                            value={formData[symptom.id as keyof typeof formData] as number}
                                            onChange={(e) => handleSliderChange(symptom.id, parseInt(e.target.value))}
                                            className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-teal-600 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Medication Section */}
                <section className="space-y-8 pt-12">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest border-l-4 border-teal-500 pl-4 text-rose-500 border-rose-500">Medication & Side Effects</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="p-8 border-white/50" hover={false}>
                            <div className="flex items-center space-x-4 mb-8">
                                <Pill className="text-teal-600" />
                                <h4 className="font-black text-slate-900 uppercase tracking-tight">Adherence Today</h4>
                            </div>
                            <div className="flex flex-col space-y-3">
                                {['Yes', 'Missed', 'Partially'].map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, medication: option }))}
                                        className={cn(
                                            "py-4 px-6 rounded-2xl border-2 font-bold text-sm transition-all text-left",
                                            formData.medication === option
                                                ? "border-teal-600 bg-teal-50 text-teal-700 shadow-lg shadow-teal-600/10"
                                                : "border-slate-50 bg-white text-slate-500 hover:border-slate-200"
                                        )}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-8 border-white/50" hover={false}>
                            <div className="flex items-center space-x-4 mb-8">
                                <AlertCircle className="text-rose-500" />
                                <h4 className="font-black text-slate-900 uppercase tracking-tight">Side Effects</h4>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {SIDE_EFFECTS.map((effect) => (
                                    <button
                                        key={effect}
                                        type="button"
                                        onClick={() => toggleSideEffect(effect)}
                                        className={cn(
                                            "py-3 px-5 rounded-full border-2 font-bold text-xs transition-all",
                                            formData.sideEffects.includes(effect)
                                                ? "border-rose-500 bg-rose-50 text-rose-700"
                                                : "border-slate-50 bg-white text-slate-400 hover:border-slate-200"
                                        )}
                                    >
                                        {effect}
                                    </button>
                                ))}
                            </div>
                        </Card>
                    </div>
                </section>

                {/* Submission */}
                <div className="pt-16 flex flex-col items-center space-y-8">
                    <Button
                        type="submit"
                        size="lg"
                        className="px-24 py-8 text-2xl rounded-[32px] shadow-glow"
                        isLoading={loading}
                        variant="dark"
                        disabled={submitting || loading}
                    >
                        Synchronize Data Packet <CheckCircle2 size={32} className="ml-4" />
                    </Button>
                    <div className="flex items-center space-x-3 opacity-30">
                        <Stethoscope size={14} className="text-slate-500" />
                        <span className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase italic font-serif">
                            Secure Transmission to Neuro-Hub v4.2
                        </span>
                    </div>
                </div>
            </form>
        </div>
    );
}
