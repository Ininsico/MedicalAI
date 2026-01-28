"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
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
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CaregiversPage() {
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPatients() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: links } = await supabase
                .from('caregiver_patient_links')
                .select(`
          patient_id,
          permissions,
          patient:profiles!patient_id(full_name, id)
        `)
                .eq('caregiver_id', user.id);

            if (links) {
                // Fetch latest log for each patient
                const patientsWithStatus = await Promise.all(links.map(async (link: any) => {
                    const { data: log } = await supabase
                        .from('symptom_logs')
                        .select('*')
                        .eq('user_id', link.patient.id)
                        .order('logged_at', { ascending: false })
                        .limit(1);

                    return {
                        ...link.patient,
                        permissions: link.permissions,
                        lastLog: log?.[0] || null
                    };
                }));
                setPatients(patientsWithStatus);
            }
            setLoading(false);
        }
        fetchPatients();
    }, []);

    return (
        <div className="space-y-12 pb-24">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-3 text-teal-600 font-black text-xs uppercase tracking-[0.3em] mb-3">
                        <Users size={14} />
                        <span>Care Network Management</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                        Patient <span className="text-slate-400 italic font-serif font-light">Continuum</span>
                    </h1>
                </div>
                <Button variant="dark" className="rounded-2xl shadow-glow">
                    <UserPlus size={20} className="mr-2" /> Provision New Link
                </Button>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-[40vh] space-y-4">
                    <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Peer Data</span>
                </div>
            ) : patients.length === 0 ? (
                <Card className="p-20 text-center border-dashed border-2 bg-transparent" hover={false}>
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                        <Users size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">No Active Patient Links</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-8">
                        Connect with a patient using their unique Medical ID to begin monitoring their clinical stream.
                    </p>
                    <Button variant="outline">Learn about Caregiver Roles</Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {patients.map((patient) => (
                        <PatientMonitorCard key={patient.id} patient={patient} />
                    ))}
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
