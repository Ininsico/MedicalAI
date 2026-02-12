"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import {
    Users,
    Activity,
    Bell,
    Search,
    ChevronRight,
    Clock,
    ExternalLink,
    Filter,
    Plus,
    CheckCircle2,
    AlertCircle
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
        <div className="flex flex-col items-center justify-center h-[80vh]">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-teal-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Activity size={20} className="text-teal-600" />
                </div>
            </div>
            <p className="mt-4 text-slate-500 font-medium animate-pulse">Syncing Medical Records...</p>
        </div>
    );

    const assignments = data?.assignments || [];
    const notifications = data?.notifications || [];
    const stats = data?.stats || {};

    const filteredAssignments = assignments.filter((a: any) =>
        a.patient?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Dynamic Calculations
    const activePatientsCount = assignments.length;

    // Calculate Global Compliance
    let totalLogsCount = 0;
    let totalMedsTaken = 0;

    assignments.forEach((assign: any) => {
        const logs = assign.patient.recent_logs || [];
        totalLogsCount += logs.length;
        totalMedsTaken += logs.filter((l: any) => l.medication_taken).length;
    });

    const complianceRate = totalLogsCount > 0
        ? Math.round((totalMedsTaken / totalLogsCount) * 100)
        : 0;

    const pendingCheckIns = activePatientsCount - (stats.todays_logs || 0);

    // Derive Alerts if Notifications are empty
    let derivedAlerts = [...notifications];
    if (derivedAlerts.length === 0) {
        assignments.forEach((assign: any) => {
            const lastLog = assign.patient.recent_logs?.[0];
            if (lastLog) {
                if (!lastLog.medication_taken) {
                    derivedAlerts.push({
                        id: `missed-${assign.id}`,
                        type: 'alert',
                        title: 'Missed Medication',
                        message: `${assign.patient.full_name} missed their latest medication.`,
                        created_at: lastLog.created_at
                    });
                }
                if (lastLog.mood === 'bad') {
                    derivedAlerts.push({
                        id: `mood-${assign.id}`,
                        type: 'alert',
                        title: 'Negative Mood Report',
                        message: `${assign.patient.full_name} reported feeling bad.`,
                        created_at: lastLog.created_at
                    });
                }
            }
        });
    }

    const criticalAlertsCount = derivedAlerts.filter((n: any) => n.type === 'alert').length;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Care Dashboard</h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Managing <span className="font-semibold text-teal-700">{activePatientsCount} Active Patients</span>
                    </p>
                </div>

                <div></div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Left Column: Patient Grid */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Users size={20} className="text-teal-600" />
                            Your Patients
                        </h2>
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {filteredAssignments.length === 0 ? (
                            <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users size={32} className="text-slate-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">No Patients Found</h3>
                                <p className="text-slate-500">Try inviting a patient or adjusting your search filters.</p>
                            </div>
                        ) : (
                            filteredAssignments.map((assign: any, i: number) => (
                                <PatientCard key={assign.id} data={assign} index={i} />
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column: Alerts & Quick Stats */}
                <div className="space-y-6">
                    {/* Alerts Panel */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                <Bell size={18} className="text-rose-500" />
                                Monitoring Alerts
                            </h2>
                            {criticalAlertsCount > 0 && (
                                <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {criticalAlertsCount} Action Item{criticalAlertsCount !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                            {derivedAlerts.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm">
                                    <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <CheckCircle2 size={20} className="text-emerald-500" />
                                    </div>
                                    <p>All clear. No active alerts.</p>
                                </div>
                            ) : (
                                derivedAlerts.map((n: any) => (
                                    <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                                        <div className="flex gap-3">
                                            <div className={cn(
                                                "w-2 h-2 mt-2 rounded-full shrink-0",
                                                (n.type === 'alert' || n.title?.includes('Missed') || n.title?.includes('Mood')) ? "bg-rose-500 shadow-rose-200 shadow-lg" : "bg-teal-500 shadow-teal-200 shadow-lg"
                                            )} />
                                            <div>
                                                <h4 className="text-sm font-semibold text-slate-800 group-hover:text-teal-700 transition-colors">{n.title}</h4>
                                                <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{n.message}</p>
                                                <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                                                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-3 bg-slate-50 border-t border-slate-100">
                            <button className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors flex items-center justify-center gap-1">
                                View Full History <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Quick Daily Summary (Mini) */}
                    <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 text-white shadow-xl shadow-teal-900/10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg">Daily Briefing</h3>
                            <Activity size={20} className="text-teal-200" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-teal-500/30 pb-3">
                                <span className="text-teal-100 text-sm">Medication Compliance</span>
                                <span className="font-bold text-xl">{complianceRate > 0 ? complianceRate + '%' : 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-teal-500/30 pb-3">
                                <span className="text-teal-100 text-sm">Check-ins Received</span>
                                <span className="font-bold text-xl">{stats.todays_logs || 0}</span>
                            </div>
                            <div className="pt-2">
                                <p className="text-xs text-teal-200 leading-relaxed italic">
                                    {pendingCheckIns > 0
                                        ? `${pendingCheckIns} patient${pendingCheckIns !== 1 ? 's' : ''} pending check-in today.`
                                        : "All active patients have checked in today."
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PatientCard({ data, index }: { data: any, index: number }) {
    const { patient } = data;
    // Ensure we get the latest log based on created_at or date
    const lastLog = patient.recent_logs?.sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    const isActive = true;

    // Physical Vitals
    const tremor = lastLog?.tremor_severity || 0;
    const stiffness = lastLog?.stiffness_severity || 0;
    const mood = lastLog?.mood || 'N/A';

    // Status Logic
    const isCritical = tremor > 7 || stiffness > 7 || mood === 'bad';
    const isWarning = tremor > 4 || stiffness > 4 || mood === 'poor' || (lastLog && !lastLog.medication_taken);

    let status = 'Stable';
    let statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';

    if (isCritical) {
        status = 'Critical';
        statusColor = 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
    } else if (isWarning) {
        status = 'Needs Review';
        statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
    } else if (!lastLog) {
        status = 'No Data';
        statusColor = 'bg-slate-50 text-slate-500 border-slate-200';
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-xl hover:border-teal-200 hover:-translate-y-1 transition-all duration-300 cursor-default"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center text-xl font-bold shadow-inner group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                            {patient.full_name?.charAt(0)}
                        </div>
                        <div className={cn(
                            "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm",
                            isActive ? "bg-emerald-500" : "bg-slate-400"
                        )} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-teal-700 transition-colors">{patient.full_name}</h3>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">ID: {patient.id.slice(0, 8)}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                        statusColor
                    )}>
                        {status}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 font-medium">
                        Updated: {lastLog ? new Date(lastLog.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-xs text-slate-500 block mb-1 font-medium">Current Mood</span>
                    <div className="font-bold text-slate-700 capitalize flex items-center gap-1.5">
                        <Activity size={14} className={mood === 'good' || mood === 'excellent' ? 'text-emerald-500' : (mood === 'bad' ? 'text-rose-500' : 'text-slate-400')} />
                        {mood}
                    </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-xs text-slate-500 block mb-1 font-medium">Physical Condition</span>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Tremor</span>
                            <span className={cn("font-bold text-sm", tremor > 5 ? "text-rose-600" : "text-slate-700")}>{tremor}/10</span>
                        </div>
                        <div className="w-px h-6 bg-slate-200 mx-1" />
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Stiffness</span>
                            <span className={cn("font-bold text-sm", stiffness > 5 ? "text-rose-600" : "text-slate-700")}>{stiffness}/10</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex -space-x-2">
                    {/* Avatars */}
                </div>

                <Link href={`/dashboard/patients/${patient.id}`} className="w-full">
                    <button className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-teal-600 transition-colors shadow-lg shadow-slate-200 group-hover:shadow-teal-200 flex items-center justify-center gap-2">
                        View Clinical Record <ExternalLink size={14} />
                    </button>
                </Link>
            </div>
        </motion.div>
    );
}
