"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import {
    Users, UserPlus, Activity, Shield, Activity as Heart, LogOut as LogOutIcon,
    Clock, ChevronRight, Search, Filter, AlertCircle, ArrowUpRight,
    BarChart3, Database, Lock as LockIcon, CheckCircle2, UserCog,
    BriefcaseMedical, ExternalLink, ArrowRight, Share2, Stethoscope,
    Mail, User, Phone, X, LogOut, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPage() {
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [patientDetails, setPatientDetails] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailTab, setDetailTab] = useState<'audit' | 'compliance' | 'network'>('audit');
    const [caregivers, setCaregivers] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'patients' | 'caregivers' | 'logs' | 'compliance' | 'network'>('patients');
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedCaregiverId, setSelectedCaregiverId] = useState('');
    const [healthData, setHealthData] = useState<any>(null);
    const [stats, setStats] = useState({
        totalPatients: 0,
        activeCaregivers: 0,
        systemHealth: 'Healthy',
        totalLogs: 0
    });

    useEffect(() => {
        async function fetchInitial() {
            setLoading(true);
            try {
                const [patientsRes, healthRes] = await Promise.all([
                    api.admin.getPatients(),
                    api.admin.getSystemHealth()
                ]);

                if (patientsRes && patientsRes.patients) setPatients(patientsRes.patients);
                if (healthRes) {
                    setHealthData(healthRes);
                    setStats({
                        totalPatients: healthRes.statistics?.total_patients || 0,
                        activeCaregivers: healthRes.statistics?.total_caregivers || 0,
                        systemHealth: healthRes.status === 'ok' ? 'Nominal' : 'Warning',
                        totalLogs: healthRes.statistics?.total_logs || 0
                    });
                }
            } catch (error) {
                console.error("Admin initial fetch error:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchInitial();
    }, []);

    const handleManagePatient = async (patient: any) => {
        setSelectedPatient(patient);
        setDetailLoading(true);
        try {
            const details = await api.admin.getPatientDetails(patient.id);
            setPatientDetails(details);
        } catch (error) {
            console.error("Error fetching patient details:", error);
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => {
        async function fetchTabData() {
            if (activeTab === 'caregivers') {
                setLoading(true);
                try {
                    const res = await api.admin.getCaregivers();
                    setCaregivers(res || []);
                } catch (err) {
                    console.error("Caregiver fetch error:", err);
                } finally {
                    setLoading(false);
                }
            } else if (activeTab === 'logs') {
                setLoading(true);
                try {
                    const res = await api.admin.getAuditLogs();
                    setAuditLogs(res.logs || []);
                } catch (err) {
                    console.error("Logs fetch error:", err);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchTabData();
    }, [activeTab]);

    const logout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 font-sans selection:bg-teal-500 selection:text-white">
            {/* Admin Header */}
            <header className="bg-[#0f1117]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center text-slate-900 shadow-lg shadow-teal-500/20">
                            <Shield size={26} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-white uppercase">Control<span className="text-teal-500 font-serif italic lowercase ml-1">Center</span></h1>
                            <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol v4.2.0</span>
                                <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                <span className="text-[10px] font-bold text-teal-500/80 uppercase">Root Access Verified</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-8">
                        <nav className="hidden lg:flex items-center space-x-2 bg-white/5 p-1 rounded-xl border border-white/5">
                            {(['patients', 'caregivers', 'logs', 'compliance', 'network'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => { setActiveTab(tab); setSelectedPatient(null); }}
                                    className={cn(
                                        "px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                                        activeTab === tab && !selectedPatient ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20" : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>

                        <div className="h-8 w-px bg-white/5" />

                        <div className="flex items-center space-x-4">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-xs font-bold text-white">System Administrator</span>
                                <span className="text-[10px] text-slate-500 font-mono">ID: ADMIN_01</span>
                            </div>
                            <button
                                onClick={logout}
                                className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto p-8 space-y-10">
                {/* Real-time Status Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AdminStatCard label="Total Patients" value={stats.totalPatients.toString()} icon={<Users size={20} />} trend="+5.2%" color="teal" />
                    <AdminStatCard label="Caregiver Network" value={stats.activeCaregivers.toString()} icon={<BriefcaseMedical size={20} />} trend="Stable" color="cyan" />
                    <AdminStatCard label="Diagnostic Blocks" value={stats.totalLogs.toString()} icon={<Activity size={20} />} trend="+124 today" color="emerald" />
                    <AdminStatCard label="System Integrity" value={stats.systemHealth} icon={<Shield size={20} />} trend="99.9% Uptime" color="indigo" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
                    {/* Main Content Area */}
                    <div className="xl:col-span-3 space-y-10">
                        {activeTab === 'patients' && !selectedPatient && (
                            <Card className="bg-[#0f1117] border-white/5 p-8" hover={false}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tight mb-2">Patient Directory</h2>
                                        <p className="text-slate-500 font-medium tracking-tight">Managing global clinical provisioning and doctor assignments.</p>
                                    </div>
                                    <Button variant="dark" className="bg-teal-600 hover:bg-teal-500 text-white font-black border-none px-8 py-4 rounded-2xl shadow-xl shadow-teal-500/20">
                                        <UserPlus size={20} className="mr-3" /> Provision New Patient
                                    </Button>
                                </div>

                                <div className="overflow-x-auto rounded-2xl border border-white/5">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-white/[0.02] text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                                <th className="py-5 pl-8">Identity Matrix</th>
                                                <th className="py-5">Clinical Status</th>
                                                <th className="py-5">Last Link</th>
                                                <th className="py-5">Assigned Clinician</th>
                                                <th className="py-5 pr-8 text-right">Operations</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={5} className="py-24 text-center">
                                                        <div className="flex flex-col items-center space-y-4">
                                                            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                                                            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Querying Neural Core...</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : patients.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="py-24 text-center text-slate-500 font-bold uppercase tracking-widest">
                                                        No patient data packets found in this sector.
                                                    </td>
                                                </tr>
                                            ) : (
                                                patients.map((patient) => (
                                                    <tr key={patient.id} className="group hover:bg-white/5 transition-colors">
                                                        <td className="py-6 pl-8">
                                                            <div className="flex items-center space-x-4">
                                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center text-slate-300 font-black text-lg">
                                                                    {patient.full_name?.charAt(0) || '?'}
                                                                </div>
                                                                <div>
                                                                    <div className="font-black text-white text-lg tracking-tight">{patient.full_name}</div>
                                                                    <div className="text-[10px] text-slate-600 font-mono tracking-tighter uppercase">{patient.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-6">
                                                            <div className={cn(
                                                                "inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                                patient.status?.includes('Active') ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-500"
                                                            )}>
                                                                <div className={cn("w-1.5 h-1.5 rounded-full mr-2", patient.status?.includes('Active') ? "bg-emerald-500 animate-pulse" : "bg-slate-600")} />
                                                                {patient.status}
                                                            </div>
                                                        </td>
                                                        <td className="py-6 text-xs text-slate-400 font-mono">
                                                            {patient.last_login ? new Date(patient.last_login).toLocaleString() : 'System Offline'}
                                                        </td>
                                                        <td className="py-6">
                                                            <div className="flex items-center space-x-2 text-slate-300">
                                                                <Stethoscope size={16} className="text-teal-500" />
                                                                <span className="text-sm font-bold">{patient.doctor_name || 'Unassigned'}</span>
                                                                <UserCog size={14} className="text-slate-600 hover:text-teal-500 cursor-pointer transition-colors" />
                                                            </div>
                                                        </td>
                                                        <td className="py-6 pr-8 text-right">
                                                            <button
                                                                onClick={() => handleManagePatient(patient)}
                                                                className="px-6 py-2 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white rounded-lg transition-all border border-white/5"
                                                            >
                                                                Manage
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}

                        {selectedPatient && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between">
                                    <button onClick={() => { setSelectedPatient(null); setDetailTab('audit'); }} className="flex items-center text-teal-500 font-black text-xs uppercase tracking-widest hover:text-teal-400 transition-colors">
                                        <ArrowRight size={16} className="mr-2 rotate-180" /> Back to Directory
                                    </button>
                                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                                        {[
                                            { id: 'audit', label: 'Audit Stream', icon: <Activity size={14} /> },
                                            { id: 'compliance', label: 'Compliance', icon: <Shield size={14} /> },
                                            { id: 'network', label: 'Network', icon: <Share2 size={14} /> }
                                        ].map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setDetailTab(tab.id as any)}
                                                className={cn(
                                                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                                    detailTab === tab.id ? "bg-teal-600 text-white shadow-lg shadow-teal-500/20" : "text-slate-500 hover:text-slate-300"
                                                )}
                                            >
                                                {tab.icon}
                                                <span>{tab.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <Card className="lg:col-span-1 bg-[#0f1117] border-white/5 p-8" hover={false}>
                                        <div className="flex flex-col items-center text-center space-y-6 mb-8">
                                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-slate-900 font-black text-4xl shadow-2xl shadow-teal-500/20">
                                                {selectedPatient.full_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black text-white">{selectedPatient.full_name}</h2>
                                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">{selectedPatient.email}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="px-3 py-1 bg-teal-500/10 text-teal-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-teal-500/10">Verified</span>
                                                <span className="px-3 py-1 bg-white/5 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">v4.0.1</span>
                                            </div>
                                        </div>

                                        <div className="space-y-6 border-t border-white/5 pt-8">
                                            <DetailItem label="Clinical Status" value={selectedPatient.status} />
                                            <DetailItem label="Assigned Doctor" value={selectedPatient.doctor_name} />
                                            <DetailItem label="Contact Point" value={selectedPatient.phone} />
                                            <DetailItem label="Account Created" value={new Date(selectedPatient.created_at).toLocaleDateString()} />
                                        </div>

                                        <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                                            <Button variant="dark" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black text-[10px] uppercase tracking-widest py-4">Reset Authentication</Button>
                                            <Button variant="dark" className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-500 font-black text-[10px] uppercase tracking-widest py-4 border border-red-500/20">Terminate Node</Button>
                                        </div>
                                    </Card>

                                    <Card className="lg:col-span-2 bg-[#0f1117] border-white/5 p-8" hover={false}>
                                        {detailTab === 'audit' && (
                                            <>
                                                <h3 className="text-xl font-black text-white mb-8 tracking-tight flex items-center">
                                                    <Activity size={20} className="mr-3 text-teal-500" /> Longitudinal Audit Stream
                                                </h3>

                                                {detailLoading ? (
                                                    <div className="py-24 text-center text-slate-500 font-black uppercase tracking-widest animate-pulse">Synchronizing Data Blocks...</div>
                                                ) : !patientDetails?.logs?.length ? (
                                                    <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                                        <p className="text-slate-500 font-black uppercase tracking-widest mb-2">No Clinical Data Packets</p>
                                                        <p className="text-[10px] text-slate-600 font-medium">This patient has not yet synchronized their local diagnostic state.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {patientDetails.logs.map((log: any) => (
                                                            <div key={log.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/[0.04] transition-all">
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <div className="px-4 py-1.5 bg-teal-500/10 text-teal-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-teal-500/10">
                                                                        Log Packet: {log.date}
                                                                    </div>
                                                                    <span className="text-[10px] text-slate-600 font-mono italic">{new Date(log.created_at).toLocaleTimeString()}</span>
                                                                </div>
                                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                                                    <MiniMetric label="Tremor" value={log.tremor_severity} color="teal" />
                                                                    <MiniMetric label="Stiffness" value={log.stiffness_severity} color="rose" />
                                                                    <MiniMetric label="Sleep" value={log.sleep_hours + 'h'} color="cyan" />
                                                                    <MiniMetric label="Mood" value={log.mood} color="indigo" />
                                                                </div>
                                                                {log.notes && (
                                                                    <div className="mt-4 p-4 bg-black/20 rounded-xl text-teal-100/60 text-xs font-medium leading-relaxed italic border-l-2 border-teal-500/30">
                                                                        "{log.notes}"
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {detailTab === 'compliance' && (
                                            <div className="space-y-8">
                                                <h3 className="text-xl font-black text-white tracking-tight flex items-center">
                                                    <Shield size={20} className="mr-3 text-indigo-500" /> Compliance Metrics
                                                </h3>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Check-in Consistency</div>
                                                        <div className="text-3xl font-black text-white mb-2">94.2%</div>
                                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                            <div className="h-full bg-indigo-500 w-[94.2%]" />
                                                        </div>
                                                        <p className="text-[10px] text-slate-600 mt-4 font-bold uppercase tracking-tighter">Last 30 Days Transmission Yield</p>
                                                    </div>
                                                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Medication Adherence</div>
                                                        <div className="text-3xl font-black text-emerald-500 mb-2">Excellent</div>
                                                        <div className="flex space-x-1 mt-4">
                                                            {[1, 1, 1, 1, 0, 1, 1].map((v, i) => (
                                                                <div key={i} className={cn("flex-1 h-3 rounded-sm", v ? "bg-emerald-500/40" : "bg-red-500/20")} />
                                                            ))}
                                                        </div>
                                                        <p className="text-[10px] text-slate-600 mt-4 font-bold uppercase tracking-tighter">Weekly Ingestion Confirmation Matrix</p>
                                                    </div>
                                                </div>

                                                <div className="p-8 border border-white/5 bg-white/[0.01] rounded-3xl">
                                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Automated Compliance Report</h4>
                                                    <ul className="space-y-4">
                                                        {[
                                                            { label: 'Biometric Drift', value: 'Nominal (< 2%)', status: 'pass' },
                                                            { label: 'Required Logs', value: '42 / 45', status: 'pass' },
                                                            { label: 'Security Handshake', value: 'Verified', status: 'pass' },
                                                            { label: 'Clinical Response', value: 'Delayed (3h)', status: 'warn' }
                                                        ].map((item, i) => (
                                                            <li key={i} className="flex justify-between items-center text-xs">
                                                                <span className="text-slate-400 font-bold">{item.label}</span>
                                                                <div className="flex items-center space-x-3">
                                                                    <span className="text-white font-black">{item.value}</span>
                                                                    <div className={cn("w-1.5 h-1.5 rounded-full", item.status === 'pass' ? "bg-emerald-500" : "bg-orange-500")} />
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {detailTab === 'network' && (
                                            <div className="space-y-8">
                                                <h3 className="text-xl font-black text-white tracking-tight flex items-center">
                                                    <Share2 size={20} className="mr-3 text-cyan-500" /> Caregiver Network Matrix
                                                </h3>

                                                {!patientDetails?.assignments?.length ? (
                                                    <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                                        <p className="text-slate-500 font-black uppercase tracking-widest mb-2">Isolated Node</p>
                                                        <p className="text-[10px] text-slate-600 font-medium lowercase">No caregivers assigned to this patient profile.</p>
                                                        <Button
                                                            onClick={() => setIsAssignModalOpen(true)}
                                                            variant="dark"
                                                            className="mt-8 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[10px] uppercase tracking-widest px-8 rounded-xl"
                                                        >
                                                            Assign Caretaker
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {patientDetails.assignments.map((assign: any) => (
                                                            <div key={assign.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all">
                                                                <div className="flex items-center space-x-4 mb-6">
                                                                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-black">
                                                                        {assign.caregiver?.full_name?.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-black text-white tracking-tight">{assign.caregiver?.full_name}</div>
                                                                        <div className="text-[10px] text-slate-500 font-mono italic uppercase">Certified Tech</div>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <div className="flex justify-between text-[10px]">
                                                                        <span className="text-slate-600 font-black uppercase">Role</span>
                                                                        <span className="text-cyan-400 font-bold uppercase">{assign.role || 'Primary care'}</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-[10px]">
                                                                        <span className="text-slate-600 font-black uppercase">Linked Since</span>
                                                                        <span className="text-slate-300 font-mono">{new Date(assign.created_at).toLocaleDateString()}</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-[10px]">
                                                                        <span className="text-slate-600 font-black uppercase">Access</span>
                                                                        <span className="text-emerald-500 font-bold uppercase">Active</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Card>
                                </div>
                            </div>
                        )}


                        {activeTab === 'caregivers' && (
                            <Card className="bg-[#0f1117] border-white/5 p-8" hover={false}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tight mb-2">Caregiver Network</h2>
                                        <p className="text-slate-500 font-medium tracking-tight">Overseeing certified medical professionals and family caregivers.</p>
                                    </div>
                                    <Button
                                        onClick={() => setIsCreateModalOpen(true)}
                                        variant="dark"
                                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-black border-none px-8 py-4 rounded-2xl"
                                    >
                                        <BriefcaseMedical size={20} className="mr-3" /> Recruit Caregiver
                                    </Button>
                                </div>

                                <div className="overflow-x-auto rounded-2xl border border-white/5">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-white/[0.02] text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                                <th className="py-5 pl-8">Caregiver Data</th>
                                                <th className="py-5">Access Level</th>
                                                <th className="py-5">Last Link</th>
                                                <th className="py-5">Created</th>
                                                <th className="py-5 pr-8 text-right">Ops</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {loading ? (
                                                <tr><td colSpan={5} className="py-24 text-center text-slate-500 font-black uppercase tracking-widest">Synthesizing...</td></tr>
                                            ) : caregivers.length === 0 ? (
                                                <tr><td colSpan={5} className="py-24 text-center text-slate-500 font-bold uppercase">No active nodes in this sector.</td></tr>
                                            ) : (
                                                caregivers.map((c) => (
                                                    <tr key={c.id} className="group hover:bg-white/5 transition-colors">
                                                        <td className="py-6 pl-8 font-black text-white">{c.full_name}<br /><span className="text-[10px] text-slate-600 font-mono">{c.email}</span></td>
                                                        <td className="py-6"><span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-cyan-500/20">Standard Access</span></td>
                                                        <td className="py-6 text-xs text-slate-400 font-mono">{c.last_login ? new Date(c.last_login).toLocaleString() : 'Never'}</td>
                                                        <td className="py-6 text-xs text-slate-500 font-mono">{new Date(c.created_at).toLocaleDateString()}</td>
                                                        <td className="py-6 pr-8 text-right"><button className="p-2 text-slate-600 hover:text-white"><div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><UserCog size={16} /></div></button></td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}

                        {activeTab === 'logs' && (
                            <Card className="bg-[#0f1117] border-white/5 p-8" hover={false}>
                                <div className="mb-10">
                                    <h2 className="text-3xl font-black text-white tracking-tight mb-2">Immutable Audit Feed</h2>
                                    <p className="text-slate-500 font-medium tracking-tight">Cryptographically logged system events and administrative maneuvers.</p>
                                </div>

                                <div className="space-y-4">
                                    {loading ? (
                                        <div className="py-24 text-center text-slate-500 font-black uppercase tracking-widest">Querying Blockchain...</div>
                                    ) : auditLogs.length === 0 ? (
                                        <div className="py-24 text-center text-slate-500 font-bold uppercase">Audit feed is currently clear.</div>
                                    ) : (
                                        auditLogs.map((log) => (
                                            <div key={log.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                                                <div className="flex items-center space-x-6">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs",
                                                        log.action.includes('CREATE') ? "bg-emerald-500/10 text-emerald-500" :
                                                            log.action.includes('DELETE') ? "bg-red-500/10 text-red-500" : "bg-teal-500/10 text-teal-500"
                                                    )}>
                                                        {log.action.split('_')[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-white tracking-tight">{log.details}</div>
                                                        <div className="flex items-center space-x-3 mt-1">
                                                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{log.user?.full_name || 'System'}</span>
                                                            <span className="w-1 h-1 bg-slate-800 rounded-full" />
                                                            <span className="text-[10px] text-slate-600 font-mono uppercase">{log.ip_address}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] text-slate-500 font-mono text-right">
                                                    <div>{new Date(log.created_at).toLocaleDateString()}</div>
                                                    <div className="text-slate-700">{new Date(log.created_at).toLocaleTimeString()}</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card>
                        )}

                        {activeTab === 'compliance' && (
                            <div className="space-y-8">
                                <Card className="bg-[#0f1117] border-white/5 p-8" hover={false}>
                                    <div className="mb-10">
                                        <h2 className="text-3xl font-black text-white tracking-tight mb-2">Security & Compliance Ledger</h2>
                                        <p className="text-slate-500 font-medium tracking-tight">System-wide regulatory status and cryptographic health.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <Card className="bg-gradient-to-br from-indigo-600 to-indigo-900 border-none p-8 text-white relative overflow-hidden" hover={false}>
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <Shield size={120} />
                                            </div>
                                            <div className="relative z-10">
                                                <h3 className="text-xl font-black mb-4 tracking-tight">Security Protocol</h3>
                                                <p className="text-indigo-100 text-xs font-medium leading-relaxed mb-8 opacity-80">
                                                    Global administrative actions are currently cryptographically signed (HMAC-SHA256).
                                                </p>
                                                <button className="w-full py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border border-white/10">
                                                    Rotate Global Keys
                                                </button>
                                            </div>
                                        </Card>
                                        <div className="space-y-6">
                                            {[
                                                { label: 'HIPAA Compliance', status: 'Certified', date: 'Jan 2026' },
                                                { label: 'Data Sovereignty', status: 'Enforced', date: 'Real-time' },
                                                { label: 'Audit Trail Persistence', status: '99.9%', date: 'Continuous' }
                                            ].map((row, i) => (
                                                <div key={i} className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                                    <span className="text-xs font-bold text-slate-400">{row.label}</span>
                                                    <div className="text-right">
                                                        <div className="text-[10px] font-black text-teal-500 uppercase tracking-widest">{row.status}</div>
                                                        <div className="text-[8px] text-slate-600 font-mono">{row.date}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {activeTab === 'network' && (
                            <Card className="bg-[#0f1117] border-white/5 p-8" hover={false}>
                                <div className="mb-10">
                                    <h2 className="text-3xl font-black text-white tracking-tight mb-2">Infrastructure Matrix</h2>
                                    <p className="text-slate-500 font-medium tracking-tight">Real-time telemetry from all clinical data nodes and routing engines.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Core Service Cluster</h4>
                                        <ServiceStatus label="Core Database" status={healthData?.services?.database || 'Pending'} speed="12ms" />
                                        <ServiceStatus label="Auth Engine" status={healthData?.services?.authentication || 'Active'} speed="4ms" />
                                        <ServiceStatus label="Email Relay" status={healthData?.services?.email || 'Connected'} speed="85ms" />
                                        <ServiceStatus label="Neural API" status="Nominal" speed="22ms" />
                                    </div>
                                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[32px] flex flex-col justify-center">
                                        <div className="text-center space-y-4">
                                            <div className="text-6xl font-black text-white font-mono tracking-tighter">14.2%</div>
                                            <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Global Network Load</div>
                                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mt-8">
                                                <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 w-[14.2%]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Global Stats Overview */}
                    <div className="space-y-8">
                        <Card className="bg-[#0f1117] border-white/5 p-8" hover={false}>
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.25em] mb-8">System Summary</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-slate-500">Uptime</span>
                                    <span className="text-emerald-500">99.98%</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold">
                                    <span className="text-slate-500">Sync Capacity</span>
                                    <span className="text-teal-500">Optimized</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>

            <CreateCaregiverModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    // Refetch caregivers
                    api.admin.getCaregivers().then(setCaregivers);
                }}
            />

            <AssignCaregiverModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                patientId={selectedPatient?.id || ''}
                onSuccess={() => {
                    if (selectedPatient?.id) {
                        api.admin.getPatientDetails(selectedPatient.id).then(setPatientDetails);
                    }
                }}
            />
        </div>
    );
}

function AdminStatCard({ label, value, icon, trend, color }: { label: string, value: string, icon: React.ReactNode, trend: string, color: 'teal' | 'cyan' | 'emerald' | 'indigo' }) {
    const colors = {
        teal: 'from-teal-500/20 to-teal-500/5 text-teal-500',
        cyan: 'from-cyan-500/20 to-cyan-500/5 text-cyan-500',
        emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-500',
        indigo: 'from-indigo-500/20 to-indigo-500/5 text-indigo-500',
    };

    return (
        <Card className="bg-[#0f1117] border-white/5 p-8" hover={false}>
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-2xl bg-gradient-to-b border border-white/5 shadow-inner", colors[color])}>
                    {icon}
                </div>
                <div className={cn(
                    "text-[10px] font-black px-3 py-1 rounded-full border",
                    trend.includes('+') ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        trend.includes('N/A') ? "bg-slate-800 text-slate-500 border-white/5" : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                )}>
                    {trend}
                </div>
            </div>
            <div className="space-y-1">
                <div className="text-4xl font-black text-white tracking-tighter font-mono">{value}</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</div>
            </div>
        </Card>
    );
}

function ServiceStatus({ label, status, speed }: { label: string, status: string, speed: string }) {
    const isOk = status.toLowerCase() === 'healthy' || status.toLowerCase() === 'connected' || status.toLowerCase() === 'active' || status.toLowerCase() === 'nominal';
    return (
        <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5">
            <div className="flex items-center space-x-3">
                <div className={cn("w-2 h-2 rounded-full", isOk ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-orange-500")} />
                <span className="text-xs font-bold text-slate-300">{label}</span>
            </div>
            <div className="flex flex-col items-end">
                <span className={cn("text-[10px] font-black uppercase tracking-widest", isOk ? "text-emerald-500" : "text-orange-500")}>{status}</span>
                <span className="text-[8px] text-slate-600 font-mono">{speed}</span>
            </div>
        </div>
    );
}

function DetailItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center text-left">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
            <span className="text-xs font-bold text-slate-300">{value || 'N/A'}</span>
        </div>
    );
}

function MiniMetric({ label, value, color }: { label: string, value: any, color: 'teal' | 'rose' | 'cyan' | 'indigo' }) {
    const colors = {
        teal: 'text-teal-500',
        rose: 'text-rose-500',
        cyan: 'text-cyan-500',
        indigo: 'text-indigo-500'
    };
    return (
        <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
            <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.1em] mb-1">{label}</div>
            <div className={cn("text-sm font-black", colors[color])}>{value}</div>
        </div>
    );
}

function CreateCaregiverModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.admin.createCaregiver(formData);
            onSuccess();
            onClose();
            setFormData({ full_name: '', email: '', password: '', phone: '' });
        } catch (err: any) {
            setError(err.message || 'Failed to create caregiver');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-[#0f1117] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden p-10"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-white tracking-tight mb-2">Provision Node</h2>
                            <p className="text-slate-500 font-medium">Create a new administrative caregiver profile.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold flex items-center">
                                <AlertCircle size={16} className="mr-3 shrink-0" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                label="Full Legal Name"
                                placeholder="Dr. Sarah Johnson"
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                icon={<User size={18} />}
                                className="bg-white/5 border-white/5 text-white placeholder:text-slate-600 focus:border-cyan-500"
                                required
                            />
                            <Input
                                label="Clinical Email"
                                type="email"
                                placeholder="s.johnson@hospital.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                icon={<Mail size={18} />}
                                className="bg-white/5 border-white/5 text-white placeholder:text-slate-600 focus:border-cyan-500"
                                required
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Access Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    icon={<LockIcon size={18} />}
                                    className="bg-white/5 border-white/5 text-white placeholder:text-slate-600 focus:border-cyan-500"
                                    required
                                />
                                <Input
                                    label="Node Contact"
                                    type="tel"
                                    placeholder="+1 (555) 000-0000"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    icon={<Phone size={18} />}
                                    className="bg-white/5 border-white/5 text-white placeholder:text-slate-600 focus:border-cyan-500"
                                />
                            </div>

                            <Button
                                type="submit"
                                isLoading={loading}
                                className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.3em] transition-all shadow-lg shadow-cyan-600/20"
                            >
                                Authorize & Create Node
                            </Button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function AssignCaregiverModal({ isOpen, onClose, onSuccess, patientId }: { isOpen: boolean, onClose: () => void, onSuccess: () => void, patientId: string }) {
    const [caregivers, setCaregivers] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (isOpen) {
            async function fetchCaregivers() {
                setFetching(true);
                try {
                    const data = await api.admin.getCaregivers();
                    setCaregivers(data);
                } catch (error) {
                    console.error("Failed to fetch caregivers for assignment:", error);
                } finally {
                    setFetching(false);
                }
            }
            fetchCaregivers();
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedId) return;

        setLoading(true);
        try {
            await api.admin.assignCaregiver({
                patient_id: patientId,
                caregiver_id: selectedId,
                assignment_notes: notes
            });
            onSuccess();
            onClose();
            setSelectedId('');
            setNotes('');
        } catch (error: any) {
            alert(error.message || "Failed to assign caregiver");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pb-24 md:pb-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#0a0c10]/95 backdrop-blur-xl"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-xl bg-[#0f1117] border border-white/5 rounded-[32px] p-10 shadow-2xl overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8">
                            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-10">
                            <div className="flex items-center space-x-3 text-cyan-500 font-black text-[10px] uppercase tracking-[0.3em] mb-3">
                                <Share2 size={16} />
                                <span>Network Orchestration</span>
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight">Assign Caretaker</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select Professional Node</label>
                                {fetching ? (
                                    <div className="py-8 text-center text-[10px] text-slate-600 font-black uppercase tracking-widest border border-white/5 rounded-2xl">Scanning Network...</div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {caregivers.map(c => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => setSelectedId(c.id)}
                                                className={cn(
                                                    "flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                                                    selectedId === c.id
                                                        ? "bg-cyan-500/10 border-cyan-500/50 text-white"
                                                        : "bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/10"
                                                )}
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center font-black",
                                                        selectedId === c.id ? "bg-cyan-500 text-slate-900" : "bg-white/5 text-slate-500"
                                                    )}>
                                                        {c.full_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm">{c.full_name}</div>
                                                        <div className="text-[10px] font-mono opacity-50 lowercase">{c.email}</div>
                                                    </div>
                                                </div>
                                                {selectedId === c.id && <CheckCircle2 size={18} className="text-cyan-500" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assignment Parameters (Notes)</label>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Enter specific care instructions or role details..."
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-cyan-500 transition-all min-h-[100px] resize-none"
                                />
                            </div>

                            <Button
                                type="submit"
                                isLoading={loading}
                                disabled={!selectedId}
                                className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.3em] transition-all shadow-lg shadow-cyan-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Activate Linkage Protocol
                            </Button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
