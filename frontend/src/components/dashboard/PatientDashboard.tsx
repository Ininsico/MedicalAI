import React from 'react';
import Link from 'next/link';
import {
    CheckCircle2,
    AlertCircle,
    TrendingDown,
    TrendingUp,
    Activity,
    ArrowRight,
    ShieldCheck,
    Pill,
    Smile,
    Move
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

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

    // Calculate extra metrics
    const medicationAdherence = logs?.length > 0
        ? Math.round((logs.filter(l => l.medication_taken).length / logs.length) * 100)
        : 0;

    // Simple mood mapping: "Good" -> 10, "Ok" -> 5, "Bad" -> 2 (Mock logic for demo)
    const moodScore = logs?.length > 0
        ? Math.round(logs.reduce((acc, log) => acc + (log.mood === 'Good' ? 10 : log.mood === 'Ok' ? 5 : 2), 0) / logs.length)
        : 0;

    // Mobility mock (inverse of stiffness)
    const mobilityScore = averages?.stiffness ? (10 - parseFloat(averages.stiffness)).toFixed(1) : '0.0';

    return (
        <div className="space-y-12">
            {/* Primary Actions / Insights */}
            <div className="grid grid-cols-1 gap-8">
                {/* Status Card */}
                <Card className="relative overflow-hidden" variant={isToday ? 'white' : 'glass'}>
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

                {/* AI Insights Section */}
                {insights && insights.length > 0 && (
                    <div className="space-y-4">
                        {insights.map((insight, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-indigo-50 border border-indigo-100 p-6 rounded-[24px] flex items-start space-x-4"
                            >
                                <div className="p-3 bg-white text-indigo-600 rounded-xl shadow-sm">
                                    <Activity size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-indigo-900 uppercase tracking-wider mb-1">Pattern Analysis</h4>
                                    <p className="text-indigo-700/80 font-medium text-sm leading-relaxed">
                                        {insight}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Analytics Graph Section */}
            <Card className="p-8 border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Comprehensive Clinical Analytics</h3>
                        <p className="text-slate-500 font-medium">Multi-factor visualization of neutral, physical, and emotional indicators.</p>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <span className="w-3 h-3 rounded-full bg-teal-500 mr-2" /> Tremor
                        </div>
                        <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <span className="w-3 h-3 rounded-full bg-rose-500 mr-2" /> Stiffness
                        </div>
                        <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <span className="w-3 h-3 rounded-full bg-cyan-500 mr-2" /> Sleep
                        </div>
                        <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2" /> Mood
                        </div>
                        <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <span className="w-3 h-3 rounded-full bg-amber-500 mr-2" /> Mobility
                        </div>
                    </div>
                </div>

                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={logs ? [...logs].reverse().map(log => {
                                // Process Mood
                                let moodVal = 5;
                                const m = log.mood?.toLowerCase();
                                if (m === 'excellent' || m === 'good') moodVal = 9;
                                else if (m === 'neutral' || m === 'ok') moodVal = 5;
                                else if (m === 'poor' || m === 'bad') moodVal = 2;

                                // Process Mobility (Activity Level)
                                let mobVal = 5;
                                const a = log.activity_level?.toLowerCase();
                                if (a === 'high' || a === 'very active') mobVal = 9;
                                else if (a === 'moderate') mobVal = 6;
                                else if (a === 'low' || a === 'sedentary') mobVal = 3;

                                return {
                                    ...log,
                                    mood_score: moodVal,
                                    mobility_score: mobVal,
                                    medication_score: log.medication_taken ? 8 : 1, // Visual height for binary
                                    sleep_hours: Number(log.sleep_hours) || 0
                                };
                            }) : []}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorTremor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorStiffness" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorMobility" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                domain={[0, 12]}
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
                            />
                            <Area type="monotone" dataKey="tremor_severity" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorTremor)" name="Tremor" />
                            <Area type="monotone" dataKey="stiffness_severity" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorStiffness)" name="Stiffness" />
                            <Area type="monotone" dataKey="sleep_hours" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorSleep)" name="Sleep (Hrs)" />
                            <Area type="monotone" dataKey="mood_score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" name="Mood" />
                            <Area type="monotone" dataKey="mobility_score" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorMobility)" name="Mobility" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Averages Section */}
            <div>
                <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tighter">Diagnostic Indicators <span className="text-slate-400 font-serif font-light text-xl italic">(7-Day Aggregate)</span></h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <DiagnosticCard
                        label="Tremor Intensity"
                        value={averages?.tremor || '0.0'}
                        trend="down"
                        color="teal"
                        icon={<Activity size={20} className="text-teal-600" />}
                    />
                    <DiagnosticCard
                        label="Muscle Rigidity"
                        value={averages?.stiffness || '0.0'}
                        trend="up"
                        color="rose"
                        icon={<Activity size={20} className="text-rose-600" />}
                    />
                    <DiagnosticCard
                        label="Neural Rest (Sleep)"
                        value={averages?.sleep || '0.0'}
                        trend="up"
                        color="cyan"
                        icon={<Activity size={20} className="text-cyan-600" />}
                    />
                    <DiagnosticCard
                        label="Medication Adherence"
                        value={`${medicationAdherence}%`}
                        trend={medicationAdherence > 80 ? "up" : "down"}
                        color="emerald"
                        icon={<Pill size={20} className="text-emerald-600" />}
                        isPercent
                    />
                    <DiagnosticCard
                        label="Mood Index"
                        value={`${moodScore}/10`}
                        trend={moodScore > 5 ? "up" : "down"}
                        color="indigo"
                        icon={<Smile size={20} className="text-indigo-600" />}
                        isPercent={false}
                    />
                    <DiagnosticCard
                        label="Daily Mobility"
                        value={`${mobilityScore}`}
                        trend="up"
                        color="amber"
                        icon={<Move size={20} className="text-amber-600" />}
                    />
                </div>
            </div>
        </div>
    );
}

function DiagnosticCard({ label, value, trend, color, icon, isPercent = false }: any) {
    const isPositive = (color === 'emerald' || color === 'teal' || color === 'indigo' || color === 'amber' || color === 'cyan') ? trend === 'up' : trend === 'down';

    // Parse value for progress bar (handling % and /10 strings)
    let progressVal = 0;
    if (typeof value === 'string' && value.includes('%')) {
        progressVal = parseFloat(value); // 0-100
    } else if (typeof value === 'string' && value.includes('/')) {
        progressVal = (parseFloat(value.split('/')[0]) / 10) * 100;
    } else {
        progressVal = (parseFloat(value) / 10) * 100;
    }

    return (
        <Card className="border border-slate-50/50">
            <div className="flex justify-between items-start mb-6">
                <span className="p-3 bg-slate-50 rounded-xl">
                    {icon}
                </span>
                <div className={cn(
                    "flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                )}>
                    {trend === 'up' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                    {trend === 'up' ? '+2.4%' : '-1.2%'}
                </div>
            </div>

            <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
                <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-black text-slate-900">{value}</span>
                    {!isPercent && !value.toString().includes('/') && <span className="text-slate-300 font-bold text-lg">/ 10</span>}
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-50">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progressVal, 100)}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={cn("h-full rounded-full",
                            color === 'teal' ? "bg-teal-500" :
                                color === 'rose' ? "bg-rose-500" :
                                    color === 'cyan' ? "bg-cyan-500" :
                                        color === 'emerald' ? "bg-emerald-500" :
                                            color === 'indigo' ? "bg-indigo-500" :
                                                "bg-amber-500"
                        )}
                    />
                </div>
            </div>
        </Card>
    );
}
