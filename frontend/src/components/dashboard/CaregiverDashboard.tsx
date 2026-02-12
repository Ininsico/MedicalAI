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
    AlertCircle,
    Clock,
    ExternalLink,
    Circle,
    Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-500">Loading dashboard...</span>
        </div>
    );

    const stats = data?.stats || { total_patients: 0, todays_logs: 0, medications_taken: 0, pending_notifications: 0 };
    const assignments = data?.assignments || [];
    const notifications = data?.notifications || [];

    const filteredAssignments = assignments.filter((a: any) =>
        a.patient?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    label="Assigned Patients"
                    value={stats.total_patients}
                    icon={<Users size={18} />}
                    trend="+2 this month"
                    color="emerald"
                />
                <StatCard
                    label="Health Records Today"
                    value={stats.todays_logs}
                    icon={<Activity size={18} />}
                    trend="85% completion"
                    color="teal"
                />
                <StatCard
                    label="Active Alerts"
                    value={stats.pending_notifications}
                    icon={<Bell size={18} />}
                    trend={stats.pending_notifications > 0 ? "Needs attention" : "All clear"}
                    color="rose"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Patient List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
                        <div className="p-4 border-b border-gray-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">Patient Management</h2>
                                <p className="text-sm text-gray-500">Monitor your assigned patients</p>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search patients..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all w-full md:w-64"
                                />
                            </div>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {filteredAssignments.length === 0 ? (
                                <div className="py-16 text-center">
                                    <Users size={48} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500 text-sm">No patients found</p>
                                </div>
                            ) : (
                                filteredAssignments.map((assign: any) => (
                                    <PatientCard key={assign.id} patient={assign.patient} notes={assign.assignment_notes} />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Notifications Panel */}
                <div className="space-y-4">
                    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                        <div className="p-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-300">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2 px-2.5 py-1 bg-red-50 border border-red-300 rounded-md">
                                    <Circle size={6} className="text-red-500 fill-red-500 animate-pulse" />
                                    <span className="text-xs font-medium text-red-600">High Priority</span>
                                </div>
                                <span className="text-xs text-gray-500">Live Feed</span>
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 mb-1">Active Alerts</h3>
                            <p className="text-xs text-gray-600">
                                {notifications.length} clinical event{notifications.length !== 1 ? 's' : ''} requiring attention
                            </p>
                        </div>

                        <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-12 text-center text-gray-400 text-sm">
                                    All systems nominal
                                </div>
                            ) : (
                                notifications.map((n: any) => (
                                    <div key={n.id} className="p-4 hover:bg-gray-50 transition-colors group cursor-pointer">
                                        <div className="flex items-start space-x-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                                                n.type === 'alert' ? "bg-red-50 text-red-600 border-red-300" : "bg-teal-50 text-teal-600 border-teal-300"
                                            )}>
                                                {n.type === 'alert' ? <AlertCircle size={16} /> : <Activity size={16} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 mb-1">{n.title}</div>
                                                <p className="text-xs text-gray-500 line-clamp-2 mb-2">{n.message}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleTimeString()}</span>
                                                    <button className="text-xs font-medium text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Acknowledge
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="p-3 bg-gray-50 text-center border-t border-gray-300">
                                <button className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center mx-auto">
                                    View All <ChevronRight size={14} className="ml-1" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, trend, color }: { label: string, value: any, icon: React.ReactNode, trend: string, color: 'teal' | 'emerald' | 'rose' }) {
    const colors = {
        teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-300' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-300' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' }
    };

    const colorClass = colors[color];

    return (
        <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <div className={cn("p-2 rounded-lg", colorClass.bg, colorClass.text)}>
                    {icon}
                </div>
                <span className="text-xs text-gray-500">{trend}</span>
            </div>
            <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
            </div>
        </div>
    );
}

function PatientCard({ patient, notes }: { patient: any, notes: string }) {
    const lastLog = patient.recent_logs?.[0];
    const isStable = lastLog?.mood !== 'bad' && lastLog?.medication_taken !== false;

    return (
        <div className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-semibold text-lg shadow-sm">
                            {patient.full_name?.charAt(0)}
                        </div>
                        <div className={cn(
                            "absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white",
                            isStable ? "bg-emerald-500" : "bg-orange-500"
                        )} />
                    </div>
                    <div>
                        <h4 className="text-base font-semibold text-gray-900">{patient.full_name}</h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                            <span className="text-xs text-gray-500">ID: {patient.id.slice(0, 8)}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span className="text-xs text-emerald-600 font-medium">{patient.status}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Last Check-in</div>
                    <div className="flex items-center text-gray-700 text-sm">
                        <Clock size={12} className="mr-1.5 text-teal-500" />
                        {lastLog ? new Date(lastLog.created_at).toLocaleDateString() : 'No data'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3 border-y border-gray-300">
                <MiniMetric label="Mood" value={lastLog?.mood || 'Pending'} color={lastLog?.mood === 'bad' ? 'rose' : 'teal'} />
                <MiniMetric label="Medication" value={lastLog?.medication_taken === true ? 'Taken' : lastLog?.medication_taken === false ? 'Missed' : 'N/A'} color={lastLog?.medication_taken === false ? 'rose' : 'emerald'} />
                <MiniMetric label="Status" value={lastLog ? 'Active' : 'Offline'} color={lastLog ? 'teal' : 'rose'} />
                <MiniMetric label="Since" value={patient.created_at ? new Date(patient.created_at).getFullYear() || 'N/A' : 'N/A'} color="cyan" />
            </div>

            <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="text-xs text-gray-500 italic">
                    "{notes || 'Primary care assignment active.'}"
                </div>
                <div className="flex items-center space-x-2">
                    <Link href={`/dashboard/patients/${patient.id}`}>
                        <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors inline-flex items-center space-x-1.5 border border-gray-300">
                            <Eye size={14} />
                            <span>View Details</span>
                        </button>
                    </Link>
                    <button className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-teal-600 rounded-lg transition-all border border-gray-300">
                        <ExternalLink size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function MiniMetric({ label, value, color }: { label: string, value: any, color: 'teal' | 'rose' | 'cyan' | 'emerald' }) {
    const colors = {
        teal: 'text-teal-600',
        rose: 'text-rose-600',
        cyan: 'text-cyan-600',
        emerald: 'text-emerald-600'
    };

    // Handle NaN and ensure value is always a valid string or number
    const displayValue = (typeof value === 'number' && isNaN(value)) ? 'N/A' : (value ?? 'N/A');

    return (
        <div className="space-y-1">
            <div className="text-xs text-gray-500">{label}</div>
            <div className={cn("text-sm font-semibold", colors[color])}>{displayValue}</div>
        </div>
    );
}
