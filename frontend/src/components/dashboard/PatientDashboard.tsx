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
    Circle
} from 'lucide-react';
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

    const medicationAdherence = logs?.length > 0
        ? Math.round((logs.filter(l => l.medication_taken).length / logs.length) * 100)
        : 0;

    const moodScore = logs?.length > 0
        ? Math.round(logs.reduce((acc, log) => acc + (log.mood === 'Good' ? 10 : log.mood === 'Ok' ? 5 : 2), 0) / logs.length)
        : 0;

    const mobilityScore = averages?.stiffness ? (10 - parseFloat(averages.stiffness)).toFixed(1) : '0.0';

    return (
        <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-[#181818] border border-gray-800 rounded-lg p-6">
                <h3 className="text-base font-semibold text-white mb-4">Today's Status</h3>

                {isToday ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg">
                        <div className="flex items-center text-emerald-400 font-medium text-sm mb-2">
                            <CheckCircle2 size={18} className="mr-2" />
                            Check-in Complete
                        </div>
                        <p className="text-gray-400 text-sm">Your health data has been recorded for today.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-lg">
                            <div className="flex items-center text-orange-400 font-medium text-sm mb-2">
                                <AlertCircle size={18} className="mr-2" />
                                Check-in Pending
                            </div>
                            <p className="text-gray-400 text-sm">Please complete your daily health check-in.</p>
                        </div>
                        <Link href="/dashboard/check-in">
                            <button className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center">
                                Start Check-in <ArrowRight size={18} className="ml-2" />
                            </button>
                        </Link>
                    </div>
                )}
            </div>

            {/* AI Insights */}
            {insights && insights.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-base font-semibold text-white">AI Insights</h3>
                    {insights.map((insight, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-[#181818] border border-cyan-500/20 p-4 rounded-lg flex items-start space-x-3"
                        >
                            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg shrink-0">
                                <Activity size={18} />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-white mb-1">Pattern Detected</h4>
                                <p className="text-gray-400 text-sm">{insight}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    label="Total Check-ins"
                    value={logs?.length || 0}
                    icon={<Activity size={18} />}
                    color="teal"
                />
                <StatCard
                    label="Medication Adherence"
                    value={`${medicationAdherence}%`}
                    icon={<Pill size={18} />}
                    color="emerald"
                />
                <StatCard
                    label="Mood Score"
                    value={`${moodScore}/10`}
                    icon={<Smile size={18} />}
                    color="indigo"
                />
            </div>

            {/* Analytics Graph */}
            <div className="bg-[#181818] border border-gray-800 rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <div>
                        <h3 className="text-base font-semibold text-white mb-1">Health Analytics</h3>
                        <p className="text-sm text-gray-500">Track your health metrics over time</p>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                        <LegendItem color="bg-teal-500" label="Tremor" />
                        <LegendItem color="bg-rose-500" label="Stiffness" />
                        <LegendItem color="bg-cyan-500" label="Sleep" />
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={logs ? [...logs].reverse().map(log => ({
                                ...log,
                                sleep_hours: Number(log.sleep_hours) || 0
                            })) : []}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorTremor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorStiffness" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                domain={[0, 12]}
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: '#9ca3af', marginBottom: '0.5rem' }}
                            />
                            <Area type="monotone" dataKey="tremor_severity" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorTremor)" name="Tremor" />
                            <Area type="monotone" dataKey="stiffness_severity" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorStiffness)" name="Stiffness" />
                            <Area type="monotone" dataKey="sleep_hours" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorSleep)" name="Sleep (Hrs)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Metrics Grid */}
            <div>
                <h3 className="text-base font-semibold text-white mb-4">Health Metrics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <MetricCard
                        label="Tremor Intensity"
                        value={averages?.tremor || '0.0'}
                        trend="down"
                        color="teal"
                        icon={<Activity size={18} />}
                    />
                    <MetricCard
                        label="Muscle Rigidity"
                        value={averages?.stiffness || '0.0'}
                        trend="up"
                        color="rose"
                        icon={<Activity size={18} />}
                    />
                    <MetricCard
                        label="Sleep Hours"
                        value={averages?.sleep || '0.0'}
                        trend="up"
                        color="cyan"
                        icon={<Activity size={18} />}
                    />
                    <MetricCard
                        label="Medication Adherence"
                        value={`${medicationAdherence}%`}
                        trend={medicationAdherence > 80 ? "up" : "down"}
                        color="emerald"
                        icon={<Pill size={18} />}
                        isPercent
                    />
                    <MetricCard
                        label="Mood Index"
                        value={`${moodScore}/10`}
                        trend={moodScore > 5 ? "up" : "down"}
                        color="indigo"
                        icon={<Smile size={18} />}
                    />
                    <MetricCard
                        label="Daily Mobility"
                        value={`${mobilityScore}`}
                        trend="up"
                        color="amber"
                        icon={<Move size={18} />}
                    />
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }: { label: string, value: any, icon: React.ReactNode, color: string }) {
    const colorClasses: any = {
        teal: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
        emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
        indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
    };

    const colors = colorClasses[color];

    return (
        <div className="bg-[#181818] border border-gray-800 rounded-lg p-4">
            <div className={cn("p-2 rounded-lg inline-flex mb-3", colors.bg, colors.text)}>
                {icon}
            </div>
            <div className="space-y-1">
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
            </div>
        </div>
    );
}

function LegendItem({ color, label }: { color: string, label: string }) {
    return (
        <div className="flex items-center space-x-2">
            <div className={cn("w-3 h-3 rounded-full", color)} />
            <span className="text-xs text-gray-400">{label}</span>
        </div>
    );
}

function MetricCard({ label, value, trend, color, icon, isPercent = false }: any) {
    const isPositive = (color === 'emerald' || color === 'teal' || color === 'indigo' || color === 'amber' || color === 'cyan') ? trend === 'up' : trend === 'down';

    let progressVal = 0;
    if (typeof value === 'string' && value.includes('%')) {
        progressVal = parseFloat(value);
    } else if (typeof value === 'string' && value.includes('/')) {
        progressVal = (parseFloat(value.split('/')[0]) / 10) * 100;
    } else {
        progressVal = (parseFloat(value) / 10) * 100;
    }

    const colorClasses: any = {
        teal: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20', progress: 'bg-teal-500' },
        rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', progress: 'bg-rose-500' },
        cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', progress: 'bg-cyan-500' },
        emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', progress: 'bg-emerald-500' },
        indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', progress: 'bg-indigo-500' },
        amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', progress: 'bg-amber-500' }
    };

    const colors = colorClasses[color];

    return (
        <div className="bg-[#181818] border border-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2 rounded-lg", colors.bg, colors.text)}>
                    {icon}
                </div>
                <div className={cn(
                    "flex items-center px-2 py-1 rounded-md text-xs font-medium",
                    isPositive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                )}>
                    {trend === 'up' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                    {trend === 'up' ? '+2.4%' : '-1.2%'}
                </div>
            </div>

            <div className="space-y-1 mb-4">
                <span className="text-xs text-gray-500">{label}</span>
                <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-white">{value}</span>
                    {!isPercent && !value.toString().includes('/') && <span className="text-gray-600 text-sm">/ 10</span>}
                </div>
            </div>

            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progressVal, 100)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={cn("h-full rounded-full", colors.progress)}
                />
            </div>
        </div>
    );
}
