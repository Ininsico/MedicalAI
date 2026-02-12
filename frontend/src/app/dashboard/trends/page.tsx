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
                        const monday = new Date(today);
                        const dayOfWeek = monday.getDay();
                        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                        monday.setDate(monday.getDate() + diff);

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
                                date: new Date(log.date).toLocaleDateString(),
                                dateLabel: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
                                tremor: log.tremor_severity || 0,
                                stiffness: log.stiffness_severity || 0,
                                sleep: log.sleep_hours || 0,
                                mood: moodVal,
                                medication: log.medication_taken ? 10 : 0
                            };
                        });
                    } else if (range === 30) {
                        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                        const monthLogs = logs.filter((log: any) => {
                            const logDate = new Date(log.date);
                            return logDate >= firstDay && logDate <= today;
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
                                date: new Date(log.date).toLocaleDateString(),
                                dateLabel: new Date(log.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
                                tremor: log.tremor_severity || 0,
                                stiffness: log.stiffness_severity || 0,
                                sleep: log.sleep_hours || 0,
                                mood: moodVal,
                                medication: log.medication_taken ? 10 : 0
                            };
                        });
                    } else {
                        // 90 Days - Monthly Averages
                        const threeMonthsAgo = new Date(today);
                        threeMonthsAgo.setMonth(today.getMonth() - 2);
                        threeMonthsAgo.setDate(1);

                        const validLogs = logs.filter((log: any) => new Date(log.date) >= threeMonthsAgo);

                        // Group by month
                        const monthlyData: any = {};
                        validLogs.forEach((log: any) => {
                            const d = new Date(log.date);
                            const key = `${d.getFullYear()}-${d.getMonth()}`;
                            if (!monthlyData[key]) {
                                monthlyData[key] = {
                                    count: 0,
                                    tremor: 0,
                                    stiffness: 0,
                                    sleep: 0,
                                    mood: 0,
                                    medication: 0,
                                    label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
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

                            monthlyData[key].count++;
                            monthlyData[key].tremor += (log.tremor_severity || 0);
                            monthlyData[key].stiffness += (log.stiffness_severity || 0);
                            monthlyData[key].sleep += (log.sleep_hours || 0);
                            monthlyData[key].mood += moodVal;
                            monthlyData[key].medication += (log.medication_taken ? 1 : 0);
                        });

                        processedData = Object.values(monthlyData).map((m: any) => ({
                            date: m.label,
                            dateLabel: m.label,
                            tremor: parseFloat((m.tremor / m.count).toFixed(1)),
                            stiffness: parseFloat((m.stiffness / m.count).toFixed(1)),
                            sleep: parseFloat((m.sleep / m.count).toFixed(1)),
                            mood: parseFloat((m.mood / m.count).toFixed(1)),
                            medication: Math.round((m.medication / m.count) * 10) // Scale to 10 for chart
                        }));
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
            <div className="bg-white border-b border-slate-200/60 sticky top-0 z-20 backdrop-blur-lg bg-white/80">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="p-2.5 hover:bg-slate-100 rounded-xl transition-all group shrink-0"
                            >
                                <ArrowLeft size={22} className="text-slate-600 group-hover:text-teal-600 transition-colors" />
                            </button>

                            <div className="flex-1">
                                <div className="flex items-center space-x-2 text-teal-600 font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-1">
                                    <TrendingUp size={14} />
                                    <span>Analysis Module</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Health Trends</h1>
                            </div>
                        </div>

                        <div className="flex bg-slate-100 p-1 rounded-xl self-stretch sm:self-auto overflow-x-auto">
                            {[7, 30, 90].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRange(r)}
                                    className={cn(
                                        "flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 whitespace-nowrap",
                                        range === r
                                            ? "bg-white text-teal-700 shadow-sm"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                    )}
                                >
                                    {r === 7 ? 'Week' : r === 30 ? 'Month' : 'Quarter'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-sm text-slate-500 font-medium">Loading analytics...</p>
                    </div>
                </div>
            ) : (
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 sm:space-y-8">

                    {/* Stats Overview Grid - Responsive 2 cols mobile, 3 tablet, 6 desktop */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                        <StatCard icon={Activity} label="Avg Tremor" value={stats.avgTremor} unit="/10" color="teal" />
                        <StatCard icon={Zap} label="Avg Rigidity" value={stats.avgStiffness} unit="/10" color="cyan" />
                        <StatCard icon={Moon} label="Avg Sleep" value={stats.avgSleep} unit="hrs" color="blue" />
                        <StatCard icon={Heart} label="Avg Mood" value={stats.avgMood} unit="/10" color="rose" />
                        <StatCard icon={Pill} label="Adherence" value={stats.adherence} unit="%" color="emerald" />
                        <StatCard icon={Target} label="Stability" value={stats.stability} unit="%" color="violet" />
                    </div>

                    {/* Main Content Grid - Responsive Stacking */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Main Chart Section (2/3 width on desktop) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 sm:p-6 lg:p-8"
                        >
                            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Symptom Timeline</h2>
                                    <p className="text-sm text-slate-500 mt-1">Multi-metric trend analysis</p>
                                </div>
                                <div className="p-2 sm:p-3 bg-teal-50 rounded-xl self-start sm:self-auto">
                                    <TrendingUp size={20} className="text-teal-600 sm:hidden" />
                                    <TrendingUp size={24} className="text-teal-600 hidden sm:block" />
                                </div>
                            </div>

                            <div className="h-[300px] sm:h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                        <XAxis
                                            dataKey="dateLabel"
                                            stroke="#94a3b8"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            stroke="#94a3b8"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            domain={[0, 10]}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.1)'
                                            }}
                                            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        <Line type="monotone" dataKey="tremor" stroke="#14b8a6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="Tremor" />
                                        <Line type="monotone" dataKey="stiffness" stroke="#06b6d4" strokeWidth={3} dot={false} name="Rigidity" />
                                        <Line type="monotone" dataKey="sleep" stroke="#3b82f6" strokeWidth={3} dot={false} name="Sleep (Avg)" />
                                        <Line type="monotone" dataKey="mood" stroke="#f43f5e" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Mood" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Right Column (1/3 width on desktop) */}
                        <div className="space-y-6">

                            {/* Medication Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 sm:p-6"
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
                                <div className="h-[140px] mt-6">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.slice(-7)}>
                                            <Bar dataKey="medication" fill="#14b8a6" radius={[4, 4, 0, 0]} />
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
                                    <p className="text-sm text-white/90 mt-2">Within normal thresholds</p>
                                </div>
                                <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white rounded-full" style={{ width: `${stats.stability}%` }} />
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 sm:p-8 overflow-hidden"
                    >
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Detailed History</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="pb-4 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                                        <th className="pb-4 text-center text-xs font-semibold text-slate-500 uppercase">Tremor</th>
                                        <th className="pb-4 text-center text-xs font-semibold text-slate-500 uppercase">Rigidity</th>
                                        <th className="pb-4 text-center text-xs font-semibold text-slate-500 uppercase">Sleep</th>
                                        <th className="pb-4 text-center text-xs font-semibold text-slate-500 uppercase">Mood</th>
                                        <th className="pb-4 text-center text-xs font-semibold text-slate-500 uppercase">Medication</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.slice().reverse().map((log, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 text-sm font-semibold text-slate-900">{log.date}</td>
                                            <td className="py-4 text-center"><span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-sm font-semibold">{log.tremor}</span></td>
                                            <td className="py-4 text-center"><span className="px-3 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-sm font-semibold">{log.stiffness}</span></td>
                                            <td className="py-4 text-center text-sm font-medium text-slate-700">{log.sleep}h</td>
                                            <td className="py-4 text-center text-sm font-medium text-slate-700">{log.mood}/10</td>
                                            <td className="py-4 text-center"><div className={cn("w-3 h-3 rounded-full mx-auto", log.medication > 0 ? "bg-teal-500 ring-4 ring-teal-100" : "bg-slate-300")} /></td>
                                        </tr>
                                    ))}
                                    {data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-16 text-center text-slate-400 text-sm">No check-in data available</td>
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
        teal: { bg: 'bg-teal-50', text: 'text-teal-600' },
        cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-600' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
        violet: { bg: 'bg-violet-50', text: 'text-violet-600' },
    };
    const colors = colorMap[color] || colorMap.teal;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -2 }}
            className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 sm:p-5 hover:shadow-md transition-all"
        >
            <div className={cn("p-2 sm:p-2.5 rounded-xl w-fit mb-2 sm:mb-3", colors.bg)}>
                <Icon size={18} className={colors.text} />
            </div>
            <div className="flex items-baseline gap-1">
                <span className={cn("text-2xl sm:text-3xl font-black", colors.text)}>{value}</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-400">{unit}</span>
            </div>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-1">{label}</p>
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
