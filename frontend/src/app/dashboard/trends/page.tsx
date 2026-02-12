"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
    TrendingUp,
    Activity,
    ArrowLeft,
    Calendar,
    Heart,
    Moon,
    Pill,
    Zap,
    Target,
    Award
} from 'lucide-react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

function TrendsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const patientId = searchParams.get('u');
    const [range, setRange] = useState(30);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [role, setRole] = useState<'patient' | 'caregiver'>('patient');
    const [patientInfo, setPatientInfo] = useState<any>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) return;
                const user = JSON.parse(userStr);
                setRole(user.role);

                let logs = [];
                if (user.role === 'caregiver') {
                    let targetId = patientId;
                    if (!targetId) {
                        const dashboard = await api.caregiver.getDashboard();
                        if (dashboard?.assignments?.length > 0) {
                            targetId = dashboard.assignments[0].patient.id;
                        }
                    }
                    if (targetId) {
                        const res = await api.caregiver.getPatientLogs(targetId);
                        logs = res.logs || [];
                        setPatientInfo(res.patient);
                    }
                } else {
                    logs = await api.patient.getLogs(user.id);
                }

                if (logs) {
                    let processedData: any[] = [];
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    if (range === 7) {
                        // 7 days: From Monday of current week to today
                        const monday = new Date(today);
                        const dayOfWeek = monday.getDay();
                        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days, else go to Monday
                        monday.setDate(monday.getDate() + diff);

                        // Filter logs from Monday to today
                        const weekLogs = logs.filter((log: any) => {
                            const logDate = new Date(log.date);
                            logDate.setHours(0, 0, 0, 0);
                            return logDate >= monday && logDate <= today;
                        }).reverse();

                        processedData = weekLogs.map((log: any) => {
                            let moodVal = 5;
                            const mood = log.mood?.toLowerCase();
                            switch (mood) {
                                case 'excellent': moodVal = 10; break;
                                case 'good': moodVal = 8; break;
                                case 'neutral': moodVal = 5; break;
                                case 'poor': moodVal = 3; break;
                                case 'bad': moodVal = 1; break;
                            }
                            return {
                                date: new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
                                tremor: log.tremor_severity || 0,
                                stiffness: log.stiffness_severity || 0,
                                sleep: log.sleep_hours || 0,
                                mood: moodVal,
                                medication: log.medication_taken ? 10 : 0
                            };
                        });
                    } else if (range === 30) {
                        // 30 days: From 1st of current month to today
                        const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

                        const monthLogs = logs.filter((log: any) => {
                            const logDate = new Date(log.date);
                            logDate.setHours(0, 0, 0, 0);
                            return logDate >= firstOfMonth && logDate <= today;
                        }).reverse();

                        processedData = monthLogs.map((log: any) => {
                            let moodVal = 5;
                            const mood = log.mood?.toLowerCase();
                            switch (mood) {
                                case 'excellent': moodVal = 10; break;
                                case 'good': moodVal = 8; break;
                                case 'neutral': moodVal = 5; break;
                                case 'poor': moodVal = 3; break;
                                case 'bad': moodVal = 1; break;
                            }
                            return {
                                date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                                tremor: log.tremor_severity || 0,
                                stiffness: log.stiffness_severity || 0,
                                sleep: log.sleep_hours || 0,
                                mood: moodVal,
                                medication: log.medication_taken ? 10 : 0
                            };
                        });
                    } else if (range === 90) {
                        // 90 days: Monthly averages for last 3 months
                        const threeMonthsAgo = new Date(today);
                        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                        threeMonthsAgo.setDate(1);

                        const last3MonthsLogs = logs.filter((log: any) => {
                            const logDate = new Date(log.date);
                            logDate.setHours(0, 0, 0, 0);
                            return logDate >= threeMonthsAgo && logDate <= today;
                        });

                        // Group by month
                        const monthlyData: any = {};
                        last3MonthsLogs.forEach((log: any) => {
                            const logDate = new Date(log.date);
                            const monthKey = logDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });

                            if (!monthlyData[monthKey]) {
                                monthlyData[monthKey] = {
                                    tremor: [],
                                    stiffness: [],
                                    sleep: [],
                                    mood: [],
                                    medication: []
                                };
                            }

                            let moodVal = 5;
                            const mood = log.mood?.toLowerCase();
                            switch (mood) {
                                case 'excellent': moodVal = 10; break;
                                case 'good': moodVal = 8; break;
                                case 'neutral': moodVal = 5; break;
                                case 'poor': moodVal = 3; break;
                                case 'bad': moodVal = 1; break;
                            }

                            monthlyData[monthKey].tremor.push(log.tremor_severity || 0);
                            monthlyData[monthKey].stiffness.push(log.stiffness_severity || 0);
                            monthlyData[monthKey].sleep.push(log.sleep_hours || 0);
                            monthlyData[monthKey].mood.push(moodVal);
                            monthlyData[monthKey].medication.push(log.medication_taken ? 10 : 0);
                        });

                        // Calculate averages for each month
                        processedData = Object.keys(monthlyData).map(monthKey => {
                            const data = monthlyData[monthKey];
                            return {
                                date: monthKey,
                                tremor: Math.round((data.tremor.reduce((a: number, b: number) => a + b, 0) / data.tremor.length) * 10) / 10,
                                stiffness: Math.round((data.stiffness.reduce((a: number, b: number) => a + b, 0) / data.stiffness.length) * 10) / 10,
                                sleep: Math.round((data.sleep.reduce((a: number, b: number) => a + b, 0) / data.sleep.length) * 10) / 10,
                                mood: Math.round((data.mood.reduce((a: number, b: number) => a + b, 0) / data.mood.length) * 10) / 10,
                                medication: Math.round((data.medication.reduce((a: number, b: number) => a + b, 0) / data.medication.length) * 10) / 10
                            };
                        });
                    }

                    setData(processedData);
                }
            } catch (error) {
                console.error("Failed to fetch trends:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [range, patientId]);

    // Calculate statistics
    const stats = {
        avgTremor: data.length > 0 ? (data.reduce((sum, d) => sum + d.tremor, 0) / data.length).toFixed(1) : '0',
        avgStiffness: data.length > 0 ? (data.reduce((sum, d) => sum + d.stiffness, 0) / data.length).toFixed(1) : '0',
        avgSleep: data.length > 0 ? (data.reduce((sum, d) => sum + d.sleep, 0) / data.length).toFixed(1) : '0',
        avgMood: data.length > 0 ? (data.reduce((sum, d) => sum + d.mood, 0) / data.length).toFixed(1) : '0',
        adherence: data.length > 0 ? Math.round((data.filter(d => d.medication > 0).length / data.length) * 100) : 0,
        stability: data.length > 0 ? Math.round((data.filter(d => d.tremor < 6 && d.stiffness < 6).length / data.length) * 100) : 0
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20 pb-12">
            {/* Professional Header */}
            <div className="bg-white border-b border-slate-200/60 sticky top-0 z-50 backdrop-blur-lg bg-white/80">
                <div className="max-w-[1600px] mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="p-2.5 hover:bg-slate-100 rounded-xl transition-all group"
                            >
                                <ArrowLeft size={22} className="text-slate-600 group-hover:text-teal-600 transition-colors" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Health Analytics</h1>
                                {patientInfo && <p className="text-sm text-slate-500 mt-0.5">{patientInfo.full_name}</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1.5 border border-slate-200/60">
                                {[7, 30, 90].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setRange(r)}
                                        className={cn(
                                            "px-5 py-2 rounded-lg text-sm font-semibold transition-all",
                                            range === r
                                                ? "bg-white text-teal-600 shadow-sm"
                                                : "text-slate-600 hover:text-slate-900"
                                        )}
                                    >
                                        {r} Days
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-[70vh]">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-sm text-slate-500 font-medium">Loading analytics...</p>
                    </div>
                </div>
            ) : (
                <div className="max-w-[1600px] mx-auto px-8 py-8">
                    {/* Stats Overview Cards */}
                    <div className="grid grid-cols-6 gap-4 mb-8">
                        <StatCard icon={Activity} label="Avg Tremor" value={stats.avgTremor} unit="/10" color="teal" />
                        <StatCard icon={Zap} label="Avg Rigidity" value={stats.avgStiffness} unit="/10" color="cyan" />
                        <StatCard icon={Moon} label="Avg Sleep" value={stats.avgSleep} unit="hrs" color="blue" />
                        <StatCard icon={Heart} label="Avg Mood" value={stats.avgMood} unit="/10" color="rose" />
                        <StatCard icon={Pill} label="Adherence" value={stats.adherence} unit="%" color="emerald" />
                        <StatCard icon={Target} label="Stability" value={stats.stability} unit="%" color="violet" />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-3 gap-6">
                        {/* Left Column - Main Chart (2/3 width) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8"
                        >
                            <div className="mb-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Symptom Timeline</h2>
                                        <p className="text-sm text-slate-500 mt-1">Multi-metric trend analysis</p>
                                    </div>
                                    <div className="p-3 bg-teal-50 rounded-xl">
                                        <TrendingUp size={24} className="text-teal-600" />
                                    </div>
                                </div>
                            </div>

                            {data.length > 0 ? (
                                <div className="h-[420px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={data}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                                axisLine={{ stroke: '#e2e8f0' }}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                domain={[0, 10]}
                                                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                                axisLine={{ stroke: '#e2e8f0' }}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                    fontSize: '13px',
                                                    fontWeight: 600
                                                }}
                                            />
                                            <Legend
                                                wrapperStyle={{ fontSize: '13px', fontWeight: 600 }}
                                                iconType="circle"
                                            />
                                            <Line type="monotone" dataKey="tremor" name="Tremor" stroke="#14b8a6" strokeWidth={3} dot={{ fill: '#14b8a6', r: 5 }} activeDot={{ r: 7 }} />
                                            <Line type="monotone" dataKey="stiffness" name="Rigidity" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 5 }} activeDot={{ r: 7 }} />
                                            <Line type="monotone" dataKey="sleep" name="Sleep" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} activeDot={{ r: 7 }} />
                                            <Line type="monotone" dataKey="mood" name="Mood" stroke="#f43f5e" strokeWidth={3} dot={{ fill: '#f43f5e', r: 5 }} activeDot={{ r: 7 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[420px] flex items-center justify-center">
                                    <div className="text-center">
                                        <Calendar size={56} className="text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 font-semibold">No data available</p>
                                        <p className="text-sm text-slate-400 mt-2">Complete daily check-ins to see trends</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Right Column - Secondary Charts */}
                        <div className="space-y-6">
                            {/* Medication Adherence Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2.5 bg-teal-50 rounded-xl">
                                        <Pill size={20} className="text-teal-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">Medication</h3>
                                        <p className="text-xs text-slate-500">Adherence Rate</p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="text-5xl font-black text-teal-600">{stats.adherence}%</div>
                                    <p className="text-sm text-slate-500 mt-2">
                                        {data.filter(d => d.medication > 0).length} of {data.length} days
                                    </p>
                                </div>

                                <div className="h-[140px] mt-6">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.slice(-7)}>
                                            <Bar dataKey="medication" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* Stability Index Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 text-white"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                                        <Award size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold">Stability Index</h3>
                                        <p className="text-xs text-white/80">Clinical Range</p>
                                    </div>
                                </div>

                                <div className="my-6">
                                    <div className="text-5xl font-black">{stats.stability}%</div>
                                    <p className="text-sm text-white/90 mt-2">
                                        Within normal thresholds
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-white rounded-full transition-all duration-1000"
                                            style={{ width: `${stats.stability}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-bold">{stats.stability}%</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-6 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8"
                    >
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-900">Detailed History</h2>
                            <p className="text-sm text-slate-500 mt-1">Complete log of all check-ins</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="pb-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                        <th className="pb-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Tremor</th>
                                        <th className="pb-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Rigidity</th>
                                        <th className="pb-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Sleep</th>
                                        <th className="pb-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Mood</th>
                                        <th className="pb-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Medication</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.slice().reverse().map((log, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 text-sm font-semibold text-slate-900">{log.date}</td>
                                            <td className="py-4 text-center">
                                                <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-sm font-semibold">
                                                    {log.tremor}
                                                </span>
                                            </td>
                                            <td className="py-4 text-center">
                                                <span className="inline-block px-3 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-sm font-semibold">
                                                    {log.stiffness}
                                                </span>
                                            </td>
                                            <td className="py-4 text-center text-sm font-medium text-slate-700">{log.sleep}h</td>
                                            <td className="py-4 text-center text-sm font-medium text-slate-700">{log.mood}/10</td>
                                            <td className="py-4 text-center">
                                                <div className={cn(
                                                    "w-3 h-3 rounded-full mx-auto",
                                                    log.medication > 0 ? "bg-teal-500 ring-4 ring-teal-100" : "bg-slate-300"
                                                )} />
                                            </td>
                                        </tr>
                                    ))}
                                    {data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-16 text-center text-slate-400 text-sm">
                                                No check-in data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon: Icon, label, value, unit, color }: any) {
    const colorMap: any = {
        teal: { bg: 'bg-teal-50', text: 'text-teal-600', ring: 'ring-teal-100' },
        cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', ring: 'ring-cyan-100' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
        violet: { bg: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-100' },
    };

    const colors = colorMap[color] || colorMap.teal;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5 hover:shadow-md transition-all"
        >
            <div className={cn("p-2.5 rounded-xl w-fit mb-3", colors.bg)}>
                <Icon size={20} className={colors.text} />
            </div>
            <div className="flex items-baseline gap-1">
                <span className={cn("text-3xl font-black", colors.text)}>{value}</span>
                <span className="text-sm font-semibold text-slate-400">{unit}</span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1.5">{label}</p>
        </motion.div>
    );
}

export default function TrendsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
                <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <TrendsContent />
        </Suspense>
    );
}
