"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import {
    Activity,
    ArrowLeft,
    ArrowRight,
    Mail,
    Phone,
    Calendar,
    Clock,
    ShieldCheck,
    Stethoscope,
    AlertCircle,
    TrendingUp,
    FileText,
    Heart,
    ChevronRight,
    ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function PatientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const patientId = params.id as string;

    const [patient, setPatient] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [adherence, setAdherence] = useState<any>(null);

    useEffect(() => {
        async function fetchDetails() {
            try {
                const [detailsRes, logsRes] = await Promise.all([
                    api.caregiver.getPatientDetails(patientId),
                    api.caregiver.getPatientLogs(patientId)
                ]);

                setPatient(detailsRes);
                setLogs(logsRes.logs || []);
                setAdherence(logsRes.adherence_stats);
            } catch (error) {
                console.error("Failed to fetch patient details:", error);
            } finally {
                setLoading(false);
            }
        }
        if (patientId) fetchDetails();
    }, [patientId]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Accessing Patient Node via Secure Tunnel</p>
        </div>
    );

    if (!patient) return (
        <div className="text-center py-24">
            <AlertCircle size={48} className="mx-auto text-rose-500 mb-6" />
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Access Denied</h2>
            <p className="text-slate-500 mb-8">This patient node is either isolated or not linked to your clinical credentials.</p>
            <Button onClick={() => router.back()}>Return to Matrix</Button>
        </div>
    );

    const lastLog = logs[0];

    return (
        <div className="space-y-12 pb-24">
            {/* Back & Breadcrumb */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center space-x-3 text-slate-500 hover:text-slate-900 transition-colors group"
                >
                    <div className="p-2 bg-white/50 border border-white rounded-xl shadow-premium group-hover:-translate-x-1 transition-transform">
                        <ArrowLeft size={18} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Return to Patient Matrix</span>
                </button>
                <div className="flex items-center space-x-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Clinical Node</span>
                    <ChevronRight size={10} />
                    <span className="text-teal-600">{patient.full_name}</span>
                </div>
            </div>

            {/* Profile Header */}
            <div className="flex flex-col lg:flex-row gap-10">
                <div className="flex-1">
                    <div className="flex items-center space-x-6 mb-8">
                        <div className="w-24 h-24 bg-slate-900 text-white rounded-[32px] flex items-center justify-center text-4xl font-black shadow-2xl relative">
                            {patient.full_name?.charAt(0)}
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-500 rounded-full border-4 border-white shadow-lg" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-3 text-teal-600 font-black text-[10px] uppercase tracking-[0.3em] mb-2">
                                <Activity size={12} />
                                <span>Real-time Telemetry Enabled</span>
                            </div>
                            <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">{patient.full_name}</h1>
                            <div className="flex items-center space-x-4">
                                <p className="text-slate-400 font-mono text-xs">ID: {patient.id}</p>
                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                <p className="text-slate-900 font-bold text-xs">{patient.gender}, age {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="px-6 py-4 bg-white/50 border border-white rounded-2xl shadow-premium backdrop-blur-xl flex items-center space-x-3">
                            <Mail size={16} className="text-teal-500" />
                            <span className="text-sm font-bold text-slate-900">{patient.email || 'No email provided'}</span>
                        </div>
                        <div className="px-6 py-4 bg-white/50 border border-white rounded-2xl shadow-premium backdrop-blur-xl flex items-center space-x-3">
                            <Phone size={16} className="text-teal-500" />
                            <span className="text-sm font-bold text-slate-900">{patient.contact_number || 'No phone provided'}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:w-96">
                    <QuickActionCard
                        label="View Trends"
                        icon={<TrendingUp size={20} />}
                        href={`/dashboard/trends?u=${patientId}`}
                        color="teal"
                    />
                    <QuickActionCard
                        label="Generate PDF"
                        icon={<FileText size={20} />}
                        href={`/dashboard/reports?u=${patientId}`}
                        color="cyan"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Clinical Vital Signs / Summary */}
                <div className="lg:col-span-2 space-y-10">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Clinical <span className="text-slate-400 italic font-serif font-light">Snapshot</span></h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <MetricCard
                            label="Med Adherence"
                            value={`${adherence?.adherence_rate || 0}%`}
                            sub={`${adherence?.streak || 0}-day streak`}
                            color="emerald"
                            icon={<ShieldCheck size={20} />}
                        />
                        <MetricCard
                            label="Average Mood"
                            value={String(adherence?.average_mood || 'N/A').split(' ')[0]}
                            sub="7-day window"
                            color="teal"
                            icon={<Heart size={20} />}
                        />
                        <MetricCard
                            label="Last Activity"
                            value={lastLog ? new Date(lastLog.created_at).toLocaleDateString() : 'N/A'}
                            sub="Sync status"
                            color="cyan"
                            icon={<Clock size={20} />}
                        />
                    </div>

                    {/* Detailed Data Matrix */}
                    <Card className="p-10 border-slate-50/50" hover={false}>
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center">
                                <Activity size={20} className="mr-3 text-teal-600" /> Longitudinal Stream
                            </h3>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Recent Logged Periods</div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-4">
                                        <th className="pb-4">Timestamp</th>
                                        <th className="pb-4 text-center">Tremor</th>
                                        <th className="pb-4 text-center">Stiffness</th>
                                        <th className="pb-4 text-center">Rest</th>
                                        <th className="pb-4">Mood</th>
                                        <th className="pb-4 text-right">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">No telemetry packets detected for this node.</td>
                                        </tr>
                                    ) : (
                                        logs.map((log, i) => (
                                            <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="py-6">
                                                    <div className="text-sm font-black text-slate-900">{new Date(log.date).toLocaleDateString()}</div>
                                                    <div className="text-[10px] font-medium text-slate-400">{new Date(log.created_at).toLocaleTimeString()}</div>
                                                </td>
                                                <td className="py-6 text-center">
                                                    <span className={cn(
                                                        "inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-xs",
                                                        (log.tremor_severity || 0) > 7 ? "bg-rose-50 text-rose-600" : "bg-teal-50 text-teal-600"
                                                    )}>
                                                        {log.tremor_severity || 0}
                                                    </span>
                                                </td>
                                                <td className="py-6 text-center text-sm font-bold text-slate-500">{log.stiffness_severity || 0}</td>
                                                <td className="py-6 text-center text-sm font-bold text-slate-400">{log.sleep_hours || 0}h</td>
                                                <td className="py-6 text-xs font-black uppercase text-slate-700">{log.mood}</td>
                                                <td className="py-6 text-right">
                                                    <button className="p-2 text-slate-300 hover:text-teal-600 transition-colors">
                                                        <ExternalLink size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Patient Context & Meds */}
                <div className="space-y-10">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Node <span className="text-slate-400 italic font-serif font-light">Context</span></h2>



                    <Card className="bg-white/50 border border-white p-8 shadow-premium" hover={false}>
                        <div className="flex items-center space-x-3 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
                            <AlertCircle size={14} />
                            <span>Clinical Observation Notes</span>
                        </div>
                        <p className="text-sm font-medium italic text-slate-500 font-serif leading-relaxed mb-6">
                            "{patient.clinical_notes || 'No active observation notes for this node. Personnel are advised to monitor the longitudinal stream for patterns.'}"
                        </p>
                        <button className="text-[10px] font-black uppercase tracking-widest text-teal-600 hover:text-teal-700 transition-colors">Append Observation</button>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function QuickActionCard({ label, icon, href, color }: { label: string, icon: React.ReactNode, href: string, color: 'teal' | 'cyan' }) {
    const colors = {
        teal: 'bg-teal-600 hover:bg-teal-500 shadow-teal-600/20',
        cyan: 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/20'
    };
    return (
        <Link href={href}>
            <div className={cn(
                "h-full p-4 text-white rounded-[24px] transition-all hover:-translate-y-1 shadow-xl flex flex-col justify-between group",
                colors[color]
            )}>
                <div className="mb-4 group-hover:rotate-6 transition-transform w-fit">{icon}</div>
                <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest leading-none">{label}</span>
                    <ArrowRight size={14} />
                </div>
            </div>
        </Link>
    );
}

function MetricCard({ label, value, sub, color, icon }: { label: string, value: string, sub: string, color: 'teal' | 'emerald' | 'cyan', icon: React.ReactNode }) {
    const colors = {
        teal: 'text-teal-600 bg-teal-50',
        emerald: 'text-emerald-600 bg-emerald-50',
        cyan: 'text-cyan-600 bg-cyan-50'
    };
    return (
        <Card className="flex flex-col justify-between" hover={false}>
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-3 rounded-xl", colors[color])}>{icon}</div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sub}</span>
            </div>
            <div>
                <div className="text-3xl font-black text-slate-900 tracking-tight mb-0.5">{value}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</div>
            </div>
        </Card>
    );
}
