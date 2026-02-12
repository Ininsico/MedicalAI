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
    Users
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
        <div className="relative min-h-screen">
            {/* Subtle premium background - teal tones only */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-teal-50/30 -z-10" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl -z-10" />

            <div className="relative space-y-6">
                {/* Premium Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

                    {/* Compact Status Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="col-span-1 lg:col-span-7"
                    >
                        <div className={cn(
                            "relative overflow-hidden rounded-2xl border transition-all duration-500 group",
                            isToday
                                ? "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-teal-100/50"
                                : "bg-gradient-to-br from-white to-teal-50/30 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-teal-200/50"
                        )}>
                            <div className="absolute inset-0 opacity-[0.02]" style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                            }} />

                            <div className="relative p-5 sm:p-6">
                                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1 w-full">
                                        <div className={cn(
                                            "p-3 rounded-xl shrink-0 shadow-lg",
                                            isToday
                                                ? "bg-gradient-to-br from-teal-500 to-teal-600"
                                                : "bg-white border border-teal-200/50"
                                        )}>
                                            {isToday
                                                ? <CheckCircle2 size={24} className="text-white" />
                                                : <AlertCircle size={24} className="text-teal-600" />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                                                    {isToday ? "Check-in Complete" : "Daily Check-in"}
                                                </h3>
                                                {isToday && (
                                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-teal-50 border border-teal-200/50 rounded-full">
                                                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                                                        <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider">Active</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed">
                                                {isToday
                                                    ? `Last recorded at ${new Date(lastCheckIn.created_at || lastCheckIn.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                                    : "Monitor your health by completing your daily assessment"
                                                }
                                            </p>

                                            <Link href="/dashboard/check-in" className="block sm:inline-block w-full sm:w-auto">
                                                <motion.button
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.99 }}
                                                    className="mt-4 w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-teal-600/25 hover:shadow-xl hover:shadow-teal-600/30 transition-all duration-300 flex items-center justify-center gap-2 group"
                                                >
                                                    <span>{isToday ? "Edit Assessment" : "Start Assessment"}</span>
                                                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                                </motion.button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Stats Grid */}
                    <div className="col-span-1 lg:col-span-5 grid grid-cols-2 gap-4 sm:gap-6">
                        <PremiumMetricCard
                            label="Weekly Check-ins"
                            value={logs?.length || 0}
                            maxValue={7}
                            delay={0.1}
                        />
                        <PremiumMetricCard
                            label="Avg. Mood"
                            value={moodScore}
                            maxValue={10}
                            delay={0.15}
                            suffix="/10"
                        />
                    </div>

                    {/* Caregiver Quick Link */}
                    <Link href="/dashboard/caregivers/manage" className="col-span-1 lg:col-span-12 block group">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/50 shadow-sm hover:shadow-md transition-all p-4 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-teal-50 rounded-xl text-teal-600">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Caregiver Access</h3>
                                    <p className="text-sm text-gray-500">Invite family or friends to monitor your health</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 font-semibold rounded-lg group-hover:bg-teal-100 transition-colors">
                                <span>Manage</span>
                                <ArrowRight size={16} />
                            </div>
                        </motion.div>
                    </Link>

                    {/* AI Insights - Professional Design */}
                    {insights && insights.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="col-span-1 lg:col-span-12"
                        >
                            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 sm:p-6">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="p-2.5 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg shadow-teal-600/25">
                                        <Brain size={20} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-slate-900">AI-Powered Insights</h3>
                                        <p className="text-xs text-slate-500">Personalized health pattern analysis</p>
                                    </div>
                                    <Sparkles size={16} className="text-teal-500" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {insights.map((insight, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 + index * 0.05 }}
                                            className="group p-4 bg-slate-50/50 hover:bg-teal-50/50 rounded-xl border border-slate-200/50 hover:border-teal-200/50 transition-all duration-300"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="p-1.5 bg-teal-100 rounded-lg mt-0.5 shrink-0">
                                                    <Activity size={14} className="text-teal-600" />
                                                </div>
                                                <p className="text-sm text-slate-700 leading-relaxed flex-1">{insight}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Core Health Metrics - Premium Cards */}
                    <PremiumCard className="col-span-1 lg:col-span-4" delay={0.25}>
                        <MetricDisplay
                            label="Tremor Intensity"
                            value={tremorValue}
                            maxValue={10}
                            icon={<Activity size={18} />}
                            trend={tremorValue < 5 ? 'down' : 'up'}
                        />
                    </PremiumCard>

                    <PremiumCard className="col-span-1 lg:col-span-4" delay={0.3}>
                        <MetricDisplay
                            label="Muscle Rigidity"
                            value={stiffnessValue}
                            maxValue={10}
                            icon={<Activity size={18} />}
                            trend={stiffnessValue < 5 ? 'down' : 'up'}
                        />
                    </PremiumCard>

                    <PremiumCard className="col-span-1 lg:col-span-4" delay={0.35}>
                        <MetricDisplay
                            label="Sleep Quality"
                            value={sleepValue}
                            maxValue={12}
                            icon={<Activity size={18} />}
                            trend="up"
                            suffix=" hrs"
                        />
                    </PremiumCard>

                    {/* Bottom Row - Full Width Metrics */}
                    <PremiumCard className="col-span-1 lg:col-span-6" delay={0.4}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg shadow-teal-600/25">
                                    <Pill size={20} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Medication Adherence</h4>
                                    <p className="text-2xl font-bold text-slate-900 mt-0.5">{medicationAdherence}%</p>
                                </div>
                            </div>
                            <div className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-semibold border",
                                medicationAdherence > 80
                                    ? "bg-teal-50 text-teal-700 border-teal-200/50"
                                    : "bg-slate-100 text-slate-600 border-slate-200/50"
                            )}>
                                {medicationAdherence > 80 ? 'Excellent' : 'Monitor'}
                            </div>
                        </div>
                        <ProgressBar value={medicationAdherence} />
                    </PremiumCard>

                    <PremiumCard className="col-span-1 lg:col-span-6" delay={0.45}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg shadow-teal-600/25">
                                    <Move size={20} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Daily Mobility</h4>
                                    <p className="text-2xl font-bold text-slate-900 mt-0.5">{mobilityScore}<span className="text-lg text-slate-400">/10</span></p>
                                </div>
                            </div>
                            <div className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/50">
                                Active
                            </div>
                        </div>
                        <ProgressBar value={(parseFloat(mobilityScore) / 10) * 100} />
                    </PremiumCard>
                </div>
            </div>
        </div>
    );
}

// Premium Card Component
function PremiumCard({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className={cn(
                "relative overflow-hidden rounded-2xl bg-white border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 p-6",
                className
            )}
        >
            {/* Subtle texture overlay */}
            <div className="absolute inset-0 opacity-[0.015]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
            }} />
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}

// Premium Metric Card
function PremiumMetricCard({ label, value, maxValue, delay, suffix = '' }: any) {
    const percentage = (value / maxValue) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 p-5"
        >
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-teal-50 rounded-lg">
                        <Activity size={18} className="text-teal-600" />
                    </div>
                    <div className="text-xs font-semibold text-slate-400">
                        {Math.round(percentage)}%
                    </div>
                </div>

                <div className="mb-3">
                    <div className="text-3xl font-bold text-slate-900 mb-1">{value}{suffix}</div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
                </div>

                {/* Mini progress indicator */}
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: delay + 0.2 }}
                        className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
                    />
                </div>
            </div>
        </motion.div>
    );
}

// Metric Display Component
function MetricDisplay({ label, value, maxValue, icon, trend, suffix = '' }: any) {
    const percentage = (value / maxValue) * 100;
    const isGood = (trend === 'down' && value < 5) || (trend === 'up' && value > 5);

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg shadow-teal-600/25">
                        {React.cloneElement(icon, { className: "text-white" })}
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</h4>
                        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value.toFixed(1)}{suffix}</p>
                    </div>
                </div>
                <div className={cn(
                    "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border",
                    isGood
                        ? "bg-teal-50 text-teal-700 border-teal-200/50"
                        : "bg-slate-100 text-slate-600 border-slate-200/50"
                )}>
                    {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{isGood ? 'Good' : 'Monitor'}</span>
                </div>
            </div>

            <div className="space-y-2">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
                    />
                </div>
                <div className="flex justify-between text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    <span>Min: 0</span>
                    <span>Max: {maxValue}</span>
                </div>
            </div>
        </div>
    );
}

// Progress Bar Component
function ProgressBar({ value }: { value: number }) {
    return (
        <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(value, 100)}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full relative"
            >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    style={{
                        animation: 'shimmer 2s infinite',
                        backgroundSize: '200% 100%'
                    }} />
            </motion.div>
        </div>
    );
}
