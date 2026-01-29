"use client";

import React from 'react';
import Link from 'next/link';
import {
    CheckCircle2,
    AlertCircle,
    Sparkles,
    TrendingDown,
    TrendingUp,
    Activity,
    ArrowRight,
    ShieldCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PatientDashboardProps {
    lastCheckIn: any;
    insights: string[];
    averages: any;
}

export default function PatientDashboard({ lastCheckIn, insights, averages }: PatientDashboardProps) {
    const isToday = lastCheckIn && (
        new Date(lastCheckIn.date).toDateString() === new Date().toDateString() ||
        new Date(lastCheckIn.created_at).toDateString() === new Date().toDateString()
    );

    return (
        <div className="space-y-12">
            {/* Primary Actions / Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Status Card */}
                <Card className="lg:col-span-1 relative overflow-hidden" variant={isToday ? 'white' : 'glass'}>
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <ShieldCheck size={120} />
                    </div>
                    <CardHeader>
                        <CardTitle>Health Telemetry</CardTitle>
                    </CardHeader>
                    <div className="space-y-6 relative z-10">
                        {isToday ? (
                            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[24px]">
                                <div className="flex items-center text-emerald-700 font-black text-sm uppercase tracking-wider mb-2">
                                    <CheckCircle2 size={18} className="mr-2" /> Unified Check-in Done
                                </div>
                                <p className="text-emerald-600/80 font-medium">Data packets synchronized for today's analysis period.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-orange-50 border border-orange-100 p-6 rounded-[24px]">
                                    <div className="flex items-center text-orange-700 font-black text-sm uppercase tracking-wider mb-2">
                                        <AlertCircle size={18} className="mr-2" /> Data Gap Detected
                                    </div>
                                    <p className="text-orange-600/80 font-medium text-sm leading-relaxed">System requires today's clinical inputs to maintain predictive accuracy.</p>
                                </div>
                                <Link href="/dashboard/check-in">
                                    <Button className="w-full py-6 text-xl rounded-[24px]">
                                        Initialize Check-in <ArrowRight size={20} className="ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </Card>

                {/* AI Insight Card */}
                <Card className="lg:col-span-2 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden" hover={false}>
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-teal-500 opacity-20 blur-[100px] rounded-full" />
                    <div className="absolute bottom-[-20%] left-0 w-48 h-48 bg-cyan-500 opacity-10 blur-[80px] rounded-full" />

                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                                <Sparkles size={18} className="text-teal-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400">Analysis Engine v4.0</span>
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time Stream AI</span>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-3xl font-black tracking-tight leading-none mb-4">Neural Activity Insight</h2>
                            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
                                {insights.length > 0
                                    ? insights[0]
                                    : lastCheckIn
                                        ? "Bio-metrics currently stabilization. Your physiological baseline is showing high resilience this cycle."
                                        : "Awaiting initial data stream to commence pattern recognition protocols."}
                            </p>
                        </div>

                        <div className="mt-8 flex gap-4 pt-8 border-t border-white/5">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-slate-500 mb-1">Confidence Score</span>
                                <div className="flex items-center space-x-1">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="w-4 h-1 bg-teal-500 rounded-full" />)}
                                    <div className="w-4 h-1 bg-white/20 rounded-full" />
                                </div>
                            </div>
                            <div className="flex flex-col border-l border-white/5 pl-4">
                                <span className="text-[10px] font-black uppercase text-slate-500 mb-1">Status</span>
                                <span className="text-xs font-bold text-teal-400 uppercase">Monitoring Active</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Averages Section */}
            <div>
                <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tighter">Diagnostic Indicators <span className="text-slate-400 font-serif font-light text-xl italic">(7-Day Aggregate)</span></h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <DiagnosticCard label="Tremor Intensity" value={averages?.tremor || '0.0'} trend="down" color="teal" />
                    <DiagnosticCard label="Muscle Rigidity" value={averages?.stiffness || '0.0'} trend="up" color="rose" />
                    <DiagnosticCard label="Neural Rest (Sleep)" value={averages?.sleep || '0.0'} trend="up" color="cyan" />
                </div>
            </div>
        </div>
    );
}

function DiagnosticCard({ label, value, trend, color }: { label: string, value: string, trend: 'up' | 'down', color: 'teal' | 'rose' | 'cyan' }) {
    const isPositive = (color === 'teal' || color === 'rose') ? trend === 'down' : trend === 'up';

    return (
        <Card className="border border-slate-50/50">
            <div className="flex justify-between items-start mb-6">
                <span className="p-3 bg-slate-50 rounded-xl">
                    <Activity size={20} className={cn(
                        color === 'teal' ? "text-teal-600" : color === 'rose' ? "text-rose-600" : "text-cyan-600"
                    )} />
                </span>
                <div className={cn(
                    "flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                )}>
                    {trend === 'up' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                    {trend === 'up' ? '+12.4%' : '-8.2%'}
                </div>
            </div>

            <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
                <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-black text-slate-900">{value}</span>
                    <span className="text-slate-300 font-bold text-lg">/ 10</span>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-50">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(parseFloat(value) / 10) * 100}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={cn("h-full rounded-full",
                            color === 'teal' ? "bg-teal-500" : color === 'rose' ? "bg-rose-500" : "bg-cyan-500"
                        )}
                    />
                </div>
            </div>
        </Card>
    );
}
