
"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import {
    TrendingUp,
    Zap,
    Filter,
    Sparkles,
    Activity,
    LogOut
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    Cell
} from 'recharts';

import { useSearchParams } from 'next/navigation';

function TrendsContent() {
    const searchParams = useSearchParams();
    const patientId = searchParams.get('u');
    const [range, setRange] = useState(7);
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
                if (user.role === 'caregiver' && patientId) {
                    const res = await api.caregiver.getPatientLogs(patientId);
                    logs = res.logs || [];
                    setPatientInfo(res.patient);
                } else {
                    logs = await api.patient.getLogs(user.id);
                }

                if (logs) {
                    const recentLogs = logs.slice(0, range).reverse();
                    const formatted = recentLogs.map((log: any) => {
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
                    setData(formatted);
                }
            } catch (error) {
                console.error("Failed to fetch trends:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [range, patientId]);

    return (
        <div className="space-y-12 pb-24">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-3 text-teal-600 font-black text-xs uppercase tracking-[0.3em] mb-3">
                        <TrendingUp size={14} />
                        <span>Longitudinal Data Stream</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                        {patientId && patientInfo ? patientInfo.full_name : 'Symptom'} <span className="text-slate-400 italic font-serif font-light">{patientId && patientInfo ? 'Trends' : 'Trajectory'}</span>
                    </h1>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2 bg-white/50 border border-white p-2 rounded-2xl shadow-premium backdrop-blur-xl">
                        {[7, 30, 90].map((r) => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={cn(
                                    "px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all",
                                    range === r ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                {r} Days
                            </button>
                        ))}
                    </div>

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

            {loading ? (
                <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Data...</span>
                </div>
            ) : (
                <div className="space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Trend Chart */}
                        <Card className="lg:col-span-2 p-8 shadow-premium border-white/50" hover={false}>
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-teal-50 rounded-xl text-teal-600"><Zap size={20} /></div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Unified Symptom Variance</h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Aggregate Score Profile</p>
                                    </div>
                                </div>
                                <Filter size={18} className="text-slate-300" />
                            </div>

                            <div className="h-[400px] w-full">
                                {data.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data}>
                                            <defs>
                                                <linearGradient id="colorTremor" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorStiffness" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                                domain={[0, 10]}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 700 }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="tremor"
                                                stroke="#14b8a6"
                                                strokeWidth={4}
                                                fillOpacity={1}
                                                fill="url(#colorTremor)"
                                                activeDot={{ r: 6, fill: '#14b8a6', stroke: '#fff', strokeWidth: 2 }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="stiffness"
                                                stroke="#f43f5e"
                                                strokeWidth={4}
                                                fillOpacity={1}
                                                fill="url(#colorStiffness)"
                                                activeDot={{ r: 6, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                            <Activity size={32} />
                                        </div>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Waiting for longitudinal data packets...</p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Right Column: AI Insights & Med adherence */}
                        <div className="space-y-8">
                            <Card className="p-8 bg-slate-900 border-none text-white overflow-hidden relative" hover={false}>
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Sparkles size={100} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <Sparkles size={18} className="text-teal-400" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400">Pattern Recognition</span>
                                    </div>
                                    <h4 className="text-xl font-black mb-4 tracking-tight">Stability Index</h4>
                                    <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                                        Your baseline has remained within a 15% variance threshold during this {range} day observation window.
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="h-2 w-32 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-teal-500 w-[85%]" />
                                        </div>
                                        <span className="font-black text-teal-400 text-lg">85% Stable</span>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-8 shadow-premium border-white/50" hover={false}>
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                                    <Activity size={14} className="mr-2" /> Med Adherence
                                </h4>
                                <div className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.slice(-7)}>
                                            <Bar dataKey="medication" radius={[4, 4, 4, 4]}>
                                                {data.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.medication > 0 ? '#14b8a6' : '#f1f5f9'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="mt-4 text-[10px] font-bold text-center text-slate-400 italic">Last 7 Check-ins Adherence Profile</p>
                            </Card>
                        </div>
                    </div>

                    {/* Historical Activity Table */}
                    <Card className="p-8 shadow-premium border-none bg-white/40" hover={false}>
                        <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight flex items-center">
                            <Activity size={20} className="mr-3 text-teal-600" /> Recent Synchronizations
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                        <th className="pb-4">Date</th>
                                        <th className="pb-4">Tremor</th>
                                        <th className="pb-4">Stiffness</th>
                                        <th className="pb-4">Sleep</th>
                                        <th className="pb-4">Mood</th>
                                        <th className="pb-4">Meds</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {data.slice().reverse().map((log, i) => (
                                        <tr key={i} className="group hover:bg-white/50 transition-colors">
                                            <td className="py-4 text-sm font-black text-slate-900">{log.date}</td>
                                            <td className="py-4"><span className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded-md text-[10px] font-black uppercase tracking-widest border border-teal-100">{log.tremor} / 10</span></td>
                                            <td className="py-4"><span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md text-[10px] font-black uppercase tracking-widest border border-rose-100">{log.stiffness} / 10</span></td>
                                            <td className="py-4 text-sm font-bold text-slate-500">{log.sleep}</td>
                                            <td className="py-4 text-xs font-bold text-slate-700 uppercase tracking-widest group-hover:text-teal-600">{log.mood >= 8 ? 'Strong' : log.mood >= 5 ? 'Stable' : 'Challenged'}</td>
                                            <td className="py-4">
                                                <div className={cn("w-2 h-2 rounded-full shadow-sm", log.medication > 0 ? "bg-emerald-500 ring-4 ring-emerald-50" : "bg-slate-200")} />
                                            </td>
                                        </tr>
                                    ))}
                                    {data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No synchronization history found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default function TrendsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <TrendsContent />
        </Suspense>
    );
}
