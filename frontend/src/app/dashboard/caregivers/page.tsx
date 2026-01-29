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
    LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CaregiversPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<'patient' | 'caregiver' | 'admin'>('patient');

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

                            const mappedLog = lastLog ? {
                                ...lastLog,
                                logged_at: lastLog.date,
                                tremor: lastLog.tremor_severity || 0
                            } : null;

                            return {
                                ...patient,
                                permissions: 'Full Access',
                                lastLog: mappedLog
                            };
                        });
                        setData(patientsWithStatus);
                    }
                } else {
                    // Patient View
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

    return (
        <div className="space-y-12 pb-24">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-3 text-teal-600 font-black text-xs uppercase tracking-[0.3em] mb-3">
                        <Users size={14} />
                        <span>{role === 'patient' ? 'Your Clinical Network' : 'Care Network Management'}</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                        {role === 'patient' ? 'Care' : 'Patient'} <span className="text-slate-400 italic font-serif font-light">{role === 'patient' ? 'Partners' : 'Continuum'}</span>
                    </h1>
                </div>
                <div className="flex items-center space-x-4">
                    {role === 'caregiver' && (
                        <Button variant="dark" className="rounded-2xl shadow-glow">
                            <UserPlus size={20} className="mr-2" /> Provision New Link
                        </Button>
                    )}
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
                <div className="flex flex-col items-center justify-center h-[40vh] space-y-4">
                    <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Matrix</span>
                </div>
            ) : data.length === 0 ? (
                <Card className="p-20 text-center border-dashed border-2 bg-transparent" hover={false}>
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                        <Users size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">No Active {role === 'patient' ? 'Caregivers' : 'Patient Links'}</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-8">
                        {role === 'patient'
                            ? 'Your clinical network is currently isolated. Ask your doctor to link your profile for remote monitoring.'
                            : 'Connect with a patient using their unique Medical ID to begin monitoring their clinical stream.'}
                    </p>
                    {role === 'caregiver' && <Button variant="outline">Learn about Caregiver Roles</Button>}
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {role === 'caregiver' ? (
                        data.map((patient) => (
                            <PatientMonitorCard key={patient.id} patient={patient} />
                        ))
                    ) : (
                        data.map((assignment) => (
                            <CaregiverCard key={assignment.id} assignment={assignment} />
                        ))
                    )}
                </div>
            )}

            {/* Role Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-slate-50 border-none p-10" hover={false}>
                    <div className="flex items-center space-x-4 mb-6">
                        <ShieldCheck className="text-teal-600" />
                        <h4 className="font-black text-slate-900 uppercase tracking-tight">Access Permissions</h4>
                    </div>
                    <p className="text-slate-500 font-medium leading-relaxed italic font-serif">
                        "Caregivers can monitor trends and receive notifications for unusual patterns.
                        Modification of log data requires 'Full Access' authorization from the patient."
                    </p>
                </Card>
                <Card className="bg-slate-900 text-white border-none p-10" hover={false}>
                    <div className="flex items-center space-x-4 mb-6 text-teal-400">
                        <Stethoscope size={24} />
                        <h4 className="font-black uppercase tracking-tight text-sm">Clinical Synergy</h4>
                    </div>
                    <p className="text-slate-400 font-medium leading-relaxed">
                        Jointly review longitudinal reports with patients to prepare for neurology appointments.
                        Consistent monitoring leads to 40% better clinical outcomes.
                    </p>
                </Card>
            </div>
        </div>
    );
}

function PatientMonitorCard({ patient }: { patient: any }) {
    const lastLogDate = patient.lastLog ? new Date(patient.lastLog.logged_at).toLocaleDateString() : 'No data';
    const isHealthy = patient.lastLog && patient.lastLog.tremor < 6;

    return (
        <Card className="p-0 overflow-hidden border-white/50 shadow-premium" hover={false}>
            <div className="flex flex-col lg:flex-row lg:h-48">
                {/* Status Sidebar */}
                <div className={cn(
                    "w-full lg:w-2 bg-slate-100",
                    isHealthy ? "bg-emerald-500" : "bg-rose-500"
                )} />

                <div className="flex-1 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center space-x-6">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                            <Users size={28} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{patient.full_name}</h3>
                            <div className="flex items-center space-x-4 mt-1">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center">
                                    <Activity size={12} className="mr-1" /> Monitoring Active
                                </span>
                                <span className="text-[10px] font-black uppercase text-teal-600 tracking-widest border border-teal-100 px-2 py-0.5 rounded-full">
                                    {patient.permissions}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div className="text-center md:text-left">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Latest Sync</p>
                            <p className="font-bold text-slate-900">{lastLogDate}</p>
                        </div>
                        <div className="text-center md:text-left">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                            <div className="flex items-center justify-center md:justify-start space-x-2">
                                <div className={cn("w-2 h-2 rounded-full", isHealthy ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
                                <span className={cn("font-bold", isHealthy ? "text-emerald-600" : "text-rose-600")}>
                                    {isHealthy ? 'Stable' : 'Attention Required'}
                                </span>
                            </div>
                        </div>
                        <div className="hidden md:block col-span-1 border-l border-slate-50 pl-8">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tremor Index</p>
                            <p className="text-2xl font-black text-slate-900">{patient.lastLog?.tremor || '0'}<span className="text-slate-300 text-xs ml-1">/10</span></p>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <Link href={`/dashboard/trends?u=${patient.id}`}>
                            <Button variant="outline" size="sm">Trends</Button>
                        </Link>
                        <Link href={`/dashboard/reports?u=${patient.id}`}>
                            <Button variant="dark" size="sm">
                                Report <ExternalLink size={14} className="ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </Card>
    );
}

function CaregiverCard({ assignment }: { assignment: any }) {
    const caregiver = assignment.caregiver;
    if (!caregiver) return null;

    return (
        <Card className="p-0 overflow-hidden border-slate-100 shadow-premium" hover={false}>
            <div className="flex flex-col md:flex-row md:h-40">
                <div className="w-full md:w-2 bg-teal-500" />
                <div className="flex-1 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center space-x-6">
                        <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
                            <Stethoscope size={28} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{caregiver.full_name}</h3>
                            <div className="flex items-center space-x-4 mt-1">
                                <span className="text-[10px] font-black uppercase text-teal-600 tracking-widest border border-teal-100 px-2 py-0.5 rounded-full">
                                    {assignment.role || 'Primary Care'}
                                </span>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center">
                                    <ShieldCheck size={12} className="mr-1" /> Active Authorization
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Email</p>
                            <p className="font-bold text-slate-900">{caregiver.email}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Linked Since</p>
                            <p className="font-bold text-slate-900">{new Date(assignment.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <Button variant="outline" size="sm" onClick={() => (window as any).location.href = `mailto:${caregiver.email}`}>Message</Button>
                        <Button variant="dark" size="sm">View Permissions</Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
