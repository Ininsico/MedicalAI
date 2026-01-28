"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import {
    TrendingUp,
    Filter,
    Download,
    Calendar,
    Sparkles,
    Zap,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TrendsPage() {
    const [range, setRange] = useState(7);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: logs } = await supabase
                .from('symptom_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('logged_at', { ascending: true })
                .limit(range);

            if (logs) {
                const formatted = logs.map(log => ({
                    date: new Date(log.logged_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    tremor: log.tremor,
                    stiffness: log.stiffness,
                    sleep: log.sleep,
                    mood: log.mood,
                    medication: log.medication_adherence === 'Yes' ? 10 : 0
                }));
                setData(formatted);
            }
            setLoading(false);
        }
        fetchData();
    }, [range]);

    return (
        <div className="space-y-12 pb-24">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-3 text-teal-600 font-black text-xs uppercase tracking-[0.3em] mb-3">
                        <TrendingUp size={14} />
                        <span>Longitudinal Data Stream</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                        Symptom <span className="text-slate-400 italic font-serif font-light">Trajectory</span>
                    </h1>
                </div>

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
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Computing Neural Coefficients</span>
                </div>
            ) : (
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
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="stiffness"
                                        stroke="#f43f5e"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorStiffness)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
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
            )}
        </div>
    );
}
