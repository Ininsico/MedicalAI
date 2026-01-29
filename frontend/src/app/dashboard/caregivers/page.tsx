"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import {
    Users,
    UserPlus,
    Activity,
    ExternalLink,
    ShieldCheck,
    AlertCircle,
    Stethoscope,
    ChevronRight,
    Search,
    Filter,
    Clock,
    TrendingUp,
    FileText,
    Mail,
    Phone,
    LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CaregiversPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<'patient' | 'caregiver' | 'admin'>('patient');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userRole = user.role || 'patient';
        setRole(userRole);

        async function fetchData() {
            try {
                if (userRole === 'caregiver') {
                    const res = await api.caregiver.getDashboard();
                    if (res && res.assignments) {
                        const patientsWithStatus = res.assignments.map((assignment: any) => {
                            const patient = assignment.patient;
                            const lastLog = patient.recent_logs && patient.recent_logs.length > 0
                                ? patient.recent_logs[0]
                                : null;

                            return {
                                ...patient,
                                permissions: 'Diagnostic Access',
                                lastLog: lastLog,
                                assignment_notes: assignment.assignment_notes,
                                linked_at: assignment.created_at
                            };
                        });
                        setData(patientsWithStatus);
                    }
                } else {
                    const res = await api.patient.getCaregivers(user.id);
                    setData(res || []);
                }
            } catch (error) {
                console.error("Failed to fetch network data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const filteredData = data.filter(item => {
        const name = role === 'caregiver' ? item.full_name : item.caregiver?.full_name;
        return name?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <div className="space-y-12 pb-24">
            {/* Contextual Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-3 text-teal-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4">
                        <Users size={14} />
                        <span>{role === 'patient' ? 'Unified Clinical Network' : 'Global Patient Matrix'}</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                        {role === 'patient' ? 'Care' : 'Node'} <span className="text-slate-400 italic font-serif font-light">{role === 'patient' ? 'Partners' : 'Orchestration'}</span>
                    </h1>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder={role === 'patient' ? "Search providers..." : "Search patient IDs..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-6 py-4 bg-white/50 border border-white rounded-2xl text-xs font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-teal-500/10 w-64 shadow-premium backdrop-blur-xl transition-all"
                        />
                    </div>
                    <button onClick={handleLogout} className="p-4 bg-white/50 border border-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl shadow-premium backdrop-blur-xl transition-all group">
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-[50vh] space-y-6">
                    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Synchronizing Matrix Nodes</span>
                </div>
            ) : filteredData.length === 0 ? (
                <Card className="p-24 text-center border-dashed border-2 bg-slate-50/30 flex flex-col items-center" hover={false}>
                    <div className="w-20 h-20 bg-slate-100 rounded-[24px] flex items-center justify-center text-slate-300 mb-8">
                        <Users size={40} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">No Active {role === 'patient' ? 'Caregivers' : 'Clinical Links'}</h3>
                    <p className="text-slate-500 max-w-sm mb-10 font-medium leading-relaxed">
                        {role === 'patient'
                            ? 'Your clinical telemetry is currently isolated. Connect with a care provider to begin remote monitoring protocols.'
                            : 'All clinical nodes are currently offline or unassigned. Contact system administration to provision new patient links.'}
                    </p>
                    {role === 'caregiver' ? (
                        <div className="flex space-x-4">
                            <Button
                                onClick={() => alert("Access Request System: Please provide the Patient Medical ID to the System Administrator for secure linkage provisioning.")}
                                variant="dark"
                                className="px-8 py-4 rounded-xl text-[10px] uppercase font-black tracking-widest"
                            >
                                Inquire Node Access
                            </Button>
                            <Button variant="outline" className="px-8 py-4 rounded-xl text-[10px] uppercase font-black tracking-widest">Protocol Guide</Button>
                        </div>
                    ) : (
                        <Button variant="dark" className="px-8 py-4 rounded-xl text-[10px] uppercase font-black tracking-widest">Broadcast Access Code</Button>
                    )}
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {role === 'caregiver' ? (
                        filteredData.map((patient) => (
                            <PatientMatrixCard key={patient.id} patient={patient} />
                        ))
                    ) : (
                        filteredData.map((assignment) => (
                            <CaregiverMatrixCard key={assignment.id} assignment={assignment} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

function PatientMatrixCard({ patient }: { patient: any }) {
    const isStable = (patient.lastLog?.tremor_severity || 0) < 6;
    const lastSync = patient.lastLog ? new Date(patient.lastLog.created_at).toLocaleDateString() : 'Offline';

    return (
        <Card className="p-0 overflow-hidden border-slate-100 shadow-premium transition-all hover:shadow-glow-teal group" hover={false}>
            <div className="flex flex-col lg:flex-row min-h-[160px]">
                <div className={cn(
                    "w-full lg:w-2 transition-all group-hover:w-3",
                    isStable ? "bg-emerald-500" : "bg-rose-500"
                )} />

                <div className="flex-1 p-8 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center space-x-6">
                        <div className="w-20 h-20 bg-slate-900 text-white rounded-[24px] flex items-center justify-center font-black text-2xl shadow-xl group-hover:scale-105 transition-transform">
                            {patient.full_name?.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-1">{patient.full_name}</h3>
                            <div className="flex items-center space-x-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Node ID: {patient.id.slice(0, 8)}</span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">{patient.permissions}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                        <div className="text-center md:text-left">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Sync</div>
                            <div className="flex items-center font-black text-slate-900 text-sm">
                                <Clock size={14} className="mr-2 text-teal-500" />
                                {lastSync}
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stability</div>
                            <div className="flex items-center justify-center md:justify-start space-x-2">
                                <div className={cn("w-2 h-2 rounded-full", isStable ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
                                <span className={cn("text-sm font-black uppercase tracking-tight", isStable ? "text-emerald-600" : "text-rose-600")}>
                                    {isStable ? 'Nominal' : 'Variance'}
                                </span>
                            </div>
                        </div>
                        <div className="hidden md:block border-l border-slate-50 pl-10">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tremor Index</div>
                            <div className="text-2xl font-black text-slate-900 leading-none">
                                {patient.lastLog?.tremor_severity || '0'}<span className="text-slate-300 text-xs ml-1">/10</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link href={`/dashboard/patients/${patient.id}`}>
                            <Button variant="dark" className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">Node Analysis</Button>
                        </Link>
                        <div className="flex items-center space-x-1">
                            <Link href={`/dashboard/trends?u=${patient.id}`} title="Trends">
                                <button className="p-3 bg-slate-50 hover:bg-teal-50 text-slate-400 hover:text-teal-600 rounded-xl transition-all"><TrendingUp size={18} /></button>
                            </Link>
                            <Link href={`/dashboard/reports?u=${patient.id}`} title="Reports">
                                <button className="p-3 bg-slate-50 hover:bg-cyan-50 text-slate-400 hover:text-cyan-600 rounded-xl transition-all"><FileText size={18} /></button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

function CaregiverMatrixCard({ assignment }: { assignment: any }) {
    const caregiver = assignment.caregiver;
    if (!caregiver) return null;

    return (
        <Card className="p-0 overflow-hidden border-slate-100 shadow-premium transition-all hover:shadow-glow-teal group" hover={false}>
            <div className="flex flex-col md:flex-row min-h-[140px]">
                <div className="w-full md:w-2 bg-teal-500" />
                <div className="flex-1 p-8 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center space-x-6">
                        <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-[20px] flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                            <Stethoscope size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-1">{caregiver.full_name}</h3>
                            <div className="flex items-center space-x-4">
                                <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                                    {assignment.assignment_notes || 'Clinical Lead'}
                                </span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center italic">
                                    <ShieldCheck size={12} className="mr-1 text-emerald-500" /> Authorization Active
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Mail size={16} /></div>
                            <div>
                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Contact Node</div>
                                <div className="text-xs font-bold text-slate-900">{caregiver.email}</div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Clock size={16} /></div>
                            <div>
                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Authorization Sync</div>
                                <div className="text-xs font-bold text-slate-900">{new Date(assignment.created_at).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={() => (window as any).location.href = `mailto:${caregiver.email}`}
                            className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-slate-900/10"
                        >
                            Establish Comms
                        </button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
