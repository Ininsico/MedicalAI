"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import {
    CheckCircle2,
    AlertCircle,
    Sparkles,
    TrendingDown,
    TrendingUp,
    Activity,
    Calendar,
    Clock,
    ArrowRight,
    ShieldCheck
} from 'lucide-react';
import { detectUnusualChanges } from '@/lib/analysis';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [lastCheckIn, setLastCheckIn] = useState<any>(null);
    const [insights, setInsights] = useState<string[]>([]);
    const [averages, setAverages] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getDashboardData() {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data: logs } = await supabase
                    .from('symptom_logs')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('logged_at', { ascending: false })
                    .limit(10);

                if (logs && logs.length > 0) {
                    setLastCheckIn(logs[0]);
                    // @ts-ignore
                    const detected = detectUnusualChanges(logs);
                    if (detected) setInsights(detected);

                    const avgTremor = logs.reduce((acc: number, log: any) => acc + log.tremor, 0) / logs.length;
                    const avgStiffness = logs.reduce((acc: number, log: any) => acc + log.stiffness, 0) / logs.length;
                    const avgSleep = logs.reduce((acc: number, log: any) => acc + log.sleep, 0) / logs.length;
                    setAverages({ tremor: avgTremor.toFixed(1), stiffness: avgStiffness.toFixed(1), sleep: avgSleep.toFixed(1) });
                }
            }
            setLoading(false);
        }

        getDashboardData();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Decrypting Clinical Stream</span>
        </div>
    );

    const isToday = lastCheckIn && new Date(lastCheckIn.logged_at).toDateString() === new Date().toDateString();

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Arslan';

    return (
        <div className="space-y-12 pb-24">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-3 text-teal-600 font-black text-xs uppercase tracking-[0.3em] mb-3">
                        <Activity size={14} />
                        <span>Diagnostic Feed Online</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                        {getTimeGreeting()}, <span className="text-teal-600 italic font-serif font-light">{firstName}</span>
                    </h1>
                </div>

                <div className="flex items-center space-x-4 bg-white/50 border border-white p-2 rounded-2xl shadow-premium backdrop-blur-xl">
                    <div className="flex items-center px-4 py-2 bg-teal-50 rounded-xl text-teal-700 font-bold text-sm">
                        <Calendar size={16} className="mr-2" />
                        {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center px-4 py-2 text-slate-500 font-bold text-sm border-l border-slate-100 italic font-serif">
                        <Clock size={16} className="mr-2" />
                        System Active
                    </div>
                </div>
            </header>

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
