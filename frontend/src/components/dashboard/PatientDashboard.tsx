"use client";

import React from 'react';
import Link from 'next/link';
import {
    CheckCircle2,
    AlertCircle,
    TrendingDown,
    TrendingUp,
    Activity,
    ArrowRight,
    Pill,
    Smile,
    Move,
    Sparkles,
    Brain,
    Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PatientDashboardProps {
    lastCheckIn: any;
    insights: string[];
    averages: any;
    logs: any[];
}

export default function PatientDashboard({ lastCheckIn, insights, averages, logs }: PatientDashboardProps) {
    const isToday = lastCheckIn && (
        new Date(lastCheckIn.date).toDateString() === new Date().toDateString() ||
        new Date(lastCheckIn.created_at).toDateString() === new Date().toDateString()
    );

    const medicationAdherence = logs?.length > 0
        ? Math.round((logs.filter(l => l.medication_taken).length / logs.length) * 100)
        : 0;

    const moodScore = logs?.length > 0
        ? Math.round(logs.reduce((acc, log) => acc + (log.mood === 'Good' ? 10 : log.mood === 'Ok' ? 5 : 2), 0) / logs.length)
        : 0;

    const mobilityScore = averages?.stiffness ? (10 - parseFloat(averages.stiffness)).toFixed(1) : '0.0';

    const tremorValue = parseFloat(averages?.tremor || '0');
    const stiffnessValue = parseFloat(averages?.stiffness || '0');
    const sleepValue = parseFloat(averages?.sleep || '0');

    return (
        <div className="relative">
            {/* Animated background gradients */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-400/20 via-cyan-300/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/20 via-pink-300/20 to-rose-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="relative space-y-6">
                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Hero Status Card - Large */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-8 relative overflow-hidden group"
                    >
                        <div className={cn(
                            "relative h-full rounded-3xl p-8 backdrop-blur-xl border shadow-2xl transition-all duration-500",
                            isToday
                                ? "bg-gradient-to-br from-emerald-500/90 via-teal-500/90 to-cyan-500/90 border-emerald-300/50"
                                : "bg-gradient-to-br from-orange-500/90 via-amber-500/90 to-yellow-500/90 border-orange-300/50"
                        )}>
                            {/* Animated mesh gradient overlay */}
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl">
                                            {isToday ? <CheckCircle2 size={28} className="text-white" /> : <AlertCircle size={28} className="text-white" />}
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-white tracking-tight">
                                                {isToday ? "All Set for Today" : "Ready for Check-in?"}
                                            </h2>
                                            <p className="text-white/80 font-medium text-sm mt-1">
                                                {isToday ? "Your daily health metrics are captured" : "Complete your health assessment now"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Animated pulse indicator */}
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className={cn(
                                            "w-4 h-4 rounded-full",
                                            isToday ? "bg-white shadow-lg shadow-white/50" : "bg-white shadow-lg shadow-white/50"
                                        )}
                                    />
                                </div>

                                {!isToday && (
                                    <Link href="/dashboard/check-in">
                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full py-4 px-6 bg-white text-orange-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-2 group"
                                        >
                                            <span>Start Daily Check-in</span>
                                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </motion.button>
                                    </Link>
                                )}

                                {isToday && (
                                    <div className="flex items-center space-x-2 text-white/90 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20">
                                        <Sparkles size={18} />
                                        <span className="font-semibold text-sm">Last recorded: {new Date(lastCheckIn.created_at || lastCheckIn.date).toLocaleTimeString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Stats - 2 cards stacked */}
                    <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-6">
                        <CircularMetricCard
                            label="Check-ins"
                            value={logs?.length || 0}
                            maxValue={30}
                            icon={<Activity size={20} />}
                            color="from-teal-500 to-cyan-500"
                            delay={0.1}
                        />
                        <CircularMetricCard
                            label="Mood"
                            value={moodScore}
                            maxValue={10}
                            icon={<Smile size={20} />}
                            color="from-purple-500 to-pink-500"
                            delay={0.2}
                            suffix="/10"
                        />
                    </div>

                    {/* AI Insights - Horizontal scrollable */}
                    {insights && insights.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="lg:col-span-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-indigo-300/30 p-6 shadow-xl"
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                                    <Brain size={20} className="text-white" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900">AI Health Insights</h3>
                                <div className="flex-1" />
                                <Sparkles size={18} className="text-indigo-500 animate-pulse" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {insights.map((insight, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + index * 0.1 }}
                                        className="group p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/60 hover:border-indigo-300 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg group-hover:scale-110 transition-transform">
                                                <Zap size={16} className="text-indigo-600" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-700 leading-relaxed flex-1">{insight}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Core Health Metrics - Bento Style */}
                    <GlassMorphCard
                        className="lg:col-span-4"
                        delay={0.4}
                    >
                        <MetricDisplay
                            label="Tremor Intensity"
                            value={tremorValue}
                            maxValue={10}
                            color="bg-gradient-to-br from-teal-500 to-emerald-500"
                            icon={<Activity size={18} />}
                            trend={tremorValue < 5 ? 'down' : 'up'}
                        />
                    </GlassMorphCard>

                    <GlassMorphCard
                        className="lg:col-span-4"
                        delay={0.5}
                    >
                        <MetricDisplay
                            label="Muscle Rigidity"
                            value={stiffnessValue}
                            maxValue={10}
                            color="bg-gradient-to-br from-rose-500 to-pink-500"
                            icon={<Activity size={18} />}
                            trend={stiffnessValue < 5 ? 'down' : 'up'}
                        />
                    </GlassMorphCard>

                    <GlassMorphCard
                        className="lg:col-span-4"
                        delay={0.6}
                    >
                        <MetricDisplay
                            label="Sleep Quality"
                            value={sleepValue}
                            maxValue={12}
                            color="bg-gradient-to-br from-cyan-500 to-blue-500"
                            icon={<Activity size={18} />}
                            trend="up"
                            suffix="hrs"
                        />
                    </GlassMorphCard>

                    {/* Bottom Row - Medication and Mobility */}
                    <GlassMorphCard
                        className="lg:col-span-6"
                        delay={0.7}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                                    <Pill size={20} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-600">Medication Adherence</h4>
                                    <p className="text-3xl font-black text-gray-900 mt-1">{medicationAdherence}%</p>
                                </div>
                            </div>
                            <div className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1",
                                medicationAdherence > 80 ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                            )}>
                                {medicationAdherence > 80 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                <span>{medicationAdherence > 80 ? 'Excellent' : 'Needs Attention'}</span>
                            </div>
                        </div>
                        <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${medicationAdherence}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full relative"
                            >
                                <div className="absolute inset-0 bg-white/30 animate-pulse" />
                            </motion.div>
                        </div>
                    </GlassMorphCard>

                    <GlassMorphCard
                        className="lg:col-span-6"
                        delay={0.8}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
                                    <Move size={20} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-600">Daily Mobility</h4>
                                    <p className="text-3xl font-black text-gray-900 mt-1">{mobilityScore}</p>
                                </div>
                            </div>
                            <div className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 bg-amber-100 text-amber-700">
                                <TrendingUp size={14} />
                                <span>Active</span>
                            </div>
                        </div>
                        <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(parseFloat(mobilityScore) / 10) * 100}%` }}
                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full relative"
                            >
                                <div className="absolute inset-0 bg-white/30 animate-pulse" />
                            </motion.div>
                        </div>
                    </GlassMorphCard>
                </div>
            </div>
        </div>
    );
}

// Glassmorphic Card Component
function GlassMorphCard({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={cn(
                "relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 p-6",
                className
            )}
        >
            {children}
        </motion.div>
    );
}

// Circular Metric Card with radial progress
function CircularMetricCard({ label, value, maxValue, icon, color, delay, suffix = '' }: any) {
    const percentage = (value / maxValue) * 100;
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 group"
        >
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className={cn("p-2 bg-gradient-to-br rounded-xl text-white", color)}>
                        {icon}
                    </div>
                </div>

                {/* Circular Progress */}
                <div className="flex items-center justify-center mb-3">
                    <div className="relative w-24 h-24">
                        <svg className="transform -rotate-90 w-24 h-24">
                            <circle
                                cx="48"
                                cy="48"
                                r="45"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="none"
                                className="text-gray-200"
                            />
                            <motion.circle
                                cx="48"
                                cy="48"
                                r="45"
                                stroke="url(#gradient)"
                                strokeWidth="6"
                                fill="none"
                                strokeLinecap="round"
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset }}
                                transition={{ duration: 1.5, ease: "easeOut", delay: delay + 0.2 }}
                                strokeDasharray={circumference}
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" className={cn("stop-color", color.includes('teal') ? 'text-teal-500' : 'text-purple-500')} stopOpacity="1" />
                                    <stop offset="100%" className={cn("stop-color", color.includes('teal') ? 'text-cyan-500' : 'text-pink-500')} stopOpacity="1" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-black text-gray-900">{value}{suffix}</span>
                        </div>
                    </div>
                </div>

                <p className="text-center text-sm font-bold text-gray-600">{label}</p>
            </div>
        </motion.div>
    );
}

// Metric Display with horizontal bar
function MetricDisplay({ label, value, maxValue, color, icon, trend, suffix = '' }: any) {
    const percentage = (value / maxValue) * 100;
    const isGood = trend === 'down' && value < 5 || trend === 'up' && value > 5;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className={cn("p-2 rounded-xl text-white", color)}>
                        {icon}
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-600">{label}</h4>
                        <p className="text-3xl font-black text-gray-900 mt-1">{value.toFixed(1)}{suffix}</p>
                    </div>
                </div>
                <div className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1",
                    isGood ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                )}>
                    {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{isGood ? 'Good' : 'Monitor'}</span>
                </div>
            </div>

            <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={cn("h-full rounded-full relative", color)}
                    >
                        <div className="absolute inset-0 bg-white/30 animate-pulse" />
                    </motion.div>
                </div>
                <div className="flex justify-between text-xs font-medium text-gray-500">
                    <span>0</span>
                    <span>{maxValue}</span>
                </div>
            </div>
        </div>
    );
}
