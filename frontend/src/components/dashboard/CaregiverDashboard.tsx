"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import {
    Users,
    Activity,
    Bell,
    Search,
    Filter,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    AlertCircle,
    Clock,
    Share2,
    BriefcaseMedical,
    ExternalLink,
    FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function CaregiverDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const res = await api.caregiver.getDashboard();
                setData(res);
            } catch (error) {
                console.error("Failed to fetch caregiver dashboard:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchDashboard();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Synchronizing Clinical Grid</span>
        </div>
    );

    const stats = data?.stats || { total_patients: 0, todays_logs: 0, medications_taken: 0, pending_notifications: 0 };
    const assignments = data?.assignments || [];
    const notifications = data?.notifications || [];

    const filteredAssignments = assignments.filter((a: any) =>
        a.patient?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-12 pb-24">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    label="Assigned Patients"
                    value={stats.total_patients}
                    icon={<Users size={20} />}
                    trend="+2 this month"
                    color="cyan"
                />
                <StatCard
                    label="Telemetry Received"
                    value={stats.todays_logs}
                    icon={<Activity size={20} />}
                    trend="85% completion"
                    color="teal"
                />
                <StatCard
                    label="Clinical Alerts"
                    value={stats.pending_notifications}
                    icon={<Bell size={20} />}
                    trend="Immediate action"
                    color="rose"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Patient Management Matrix */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Patient <span className="text-slate-400 italic font-serif font-light">Matrix</span></h2>
                            <p className="text-slate-500 font-medium text-sm">Real-time physiological synchronization from assigned nodes.</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search nodes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 pr-6 py-3 bg-white/50 border border-white rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 w-64 shadow-premium backdrop-blur-xl"
                                />
                            </div>
                            <button className="p-3 bg-white/50 border border-white rounded-2xl shadow-premium backdrop-blur-xl text-slate-400 hover:text-teal-600 transition-colors">
                                <Filter size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {filteredAssignments.length === 0 ? (
                            <div className="py-24 text-center bg-white/30 border-2 border-dashed border-slate-200 rounded-[32px]">
                                <Users size={48} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No Clinical Links Found</p>
                            </div>
                        ) : (
                            filteredAssignments.map((assign: any) => (
                                <PatientCard key={assign.id} patient={assign.patient} notes={assign.assignment_notes} />
                            ))
                        )}
                    </div>
                </div>

                {/* Clinical Intelligence / Alerts */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active <span className="text-slate-400 italic font-serif font-light">Alerts</span></h2>
                    <Card className="p-0 overflow-hidden border-none shadow-glow bg-slate-900 text-white" hover={false}>
                        <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 border-b border-white/5">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/20">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-red-400">High Priority</span>
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time Feed</span>
                            </div>
                            <p className="text-slate-400 text-xs font-medium leading-relaxed">System has flagged {notifications.length} clinical events requiring immediate verification.</p>
                        </div>
                        <div className="divide-y divide-white/5">
                            {notifications.length === 0 ? (
                                <div className="p-12 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">All Systems Nominal</div>
                            ) : (
                                notifications.map((n: any) => (
                                    <div key={n.id} className="p-6 hover:bg-white/[0.02] transition-colors group cursor-pointer">
                                        <div className="flex items-start space-x-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                n.type === 'alert' ? "bg-red-500/10 text-red-500" : "bg-teal-500/10 text-teal-500"
                                            )}>
                                                {n.type === 'alert' ? <AlertCircle size={20} /> : <Activity size={20} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold text-white mb-1">{n.title}</div>
                                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{n.message}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-mono text-slate-600">{new Date(n.created_at).toLocaleTimeString()}</span>
                                                    <button className="text-[10px] font-black uppercase tracking-widest text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity">Acknowledge</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-6 bg-white/[0.02] text-center">
                            <button className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors flex items-center justify-center mx-auto">
                                View Archive <ChevronRight size={14} className="ml-2" />
                            </button>
                        </div>
                    </Card>

                    {/* Quick Access Tools */}

                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, trend, color }: { label: string, value: any, icon: React.ReactNode, trend: string, color: 'teal' | 'cyan' | 'emerald' | 'rose' }) {
    const colors = {
        teal: 'text-teal-600 bg-teal-50',
        cyan: 'text-cyan-600 bg-cyan-50',
        emerald: 'text-emerald-600 bg-emerald-50',
        rose: 'text-rose-600 bg-rose-50'
    };

    return (
        <Card className="group">
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-2xl transition-all group-hover:scale-110", colors[color])}>
                    {icon}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{trend}</span>
            </div>
            <div className="space-y-1">
                <div className="text-4xl font-black text-slate-900 tracking-tighter">{value}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</div>
            </div>
        </Card>
    );
}

function PatientCard({ patient, notes }: { patient: any, notes: string }) {
    const lastLog = patient.recent_logs?.[0];
    const isStable = lastLog?.mood !== 'bad' && lastLog?.medication_taken !== false;

    return (
        <Card className="p-0 overflow-hidden group hover:shadow-glow-teal transition-all flex flex-col md:flex-row border-slate-50/50" hover={false}>
            <div className="p-8 flex-1">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-6">
                        <div className="w-16 h-16 rounded-[24px] bg-slate-900 text-white flex items-center justify-center font-black text-2xl relative shadow-xl">
                            {patient.full_name?.charAt(0)}
                            <div className={cn(
                                "absolute -top-1 -right-1 w-4 h-4 rounded-full border-4 border-white",
                                isStable ? "bg-emerald-500" : "bg-orange-500"
                            )} />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{patient.full_name}</h4>
                            <div className="flex items-center space-x-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {patient.id.slice(0, 8)}</span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">{patient.status}</span>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:flex flex-col items-end">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Synchronization</div>
                        <div className="flex items-center text-slate-900 font-bold text-sm">
                            <Clock size={14} className="mr-2 text-teal-500" />
                            {lastLog ? new Date(lastLog.created_at).toLocaleDateString() : 'No data received'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-slate-50">
                    <MiniMetric label="Clinical Mood" value={lastLog?.mood || 'Pending'} color={lastLog?.mood === 'bad' ? 'rose' : 'teal'} />
                    <MiniMetric label="Med Compliance" value={lastLog?.medication_taken === true ? 'Verified' : lastLog?.medication_taken === false ? 'Critical' : 'N/A'} color={lastLog?.medication_taken === false ? 'rose' : 'emerald'} />
                    <MiniMetric label="Telemetry Status" value={lastLog ? 'Receiving' : 'Offline'} color={lastLog ? 'teal' : 'rose'} />
                    <MiniMetric label="Assigned Since" value={new Date(patient.created_at).getFullYear()} color="cyan" />
                </div>

                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center space-x-2 text-slate-400">
                        <Share2 size={14} />
                        <span className="text-xs font-medium italic">"{notes || 'Primary health link active.'}"</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link href={`/dashboard/patients/${patient.id}`}>
                            <Button variant="dark" className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-6 rounded-xl">
                                Full Analysis <ChevronRight size={14} className="ml-2" />
                            </Button>
                        </Link>
                        <button className="p-3 bg-slate-50 hover:bg-teal-50 text-slate-400 hover:text-teal-600 rounded-xl transition-all">
                            <ExternalLink size={18} />
                        </button>
                    </div>
                </div>
            </div>
            {/* Side Action Bar */}
            <div className="bg-slate-50 border-l border-slate-100 p-4 flex md:flex-col justify-around items-center space-y-4">
                <Link href={`/dashboard/patients/${patient.id}`}>
                    <ActionIcon icon={<Activity size={18} />} label="Live" />
                </Link>
                <Link href={`/dashboard/patients/${patient.id}`}>
                    <ActionIcon icon={<TrendingUp size={18} />} label="Trends" />
                </Link>
                <Link href={`/dashboard/patients/${patient.id}`}>
                    <ActionIcon icon={<BriefcaseMedical size={18} />} label="Meds" />
                </Link>
            </div>
        </Card>
    );
}

function MiniMetric({ label, value, color }: { label: string, value: any, color: 'teal' | 'rose' | 'cyan' | 'emerald' }) {
    const colors = {
        teal: 'text-teal-600',
        rose: 'text-rose-600',
        cyan: 'text-cyan-600',
        emerald: 'text-emerald-600'
    };
    return (
        <div className="space-y-1">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
            <div className={cn("text-sm font-black uppercase tracking-tight", colors[color])}>{value}</div>
        </div>
    );
}

function ActionIcon({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <button className="flex flex-col items-center space-y-1 group">
            <div className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl group-hover:text-teal-500 group-hover:border-teal-100 transition-all shadow-sm">
                {icon}
            </div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest group-hover:text-teal-600 transition-colors">{label}</span>
        </button>
    );
}
