"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
    Users, UserPlus, Activity, Shield, LogOut,
    Search, AlertCircle, TrendingUp, BarChart3,
    CheckCircle2, BriefcaseMedical, ArrowLeft,
    Stethoscope, Mail, User, Phone, X, Eye,
    Home, Settings, Database, FileText, Menu,
    ChevronRight, Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPage() {
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [patientDetails, setPatientDetails] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailTab, setDetailTab] = useState<'audit' | 'care_team'>('audit');
    const [caregivers, setCaregivers] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'patients' | 'caregivers' | 'logs'>('patients');
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

                if (patientsRes && patientsRes.patients) {
                    setPatients(patientsRes.patients);
                }
                if (healthRes) {
                    setHealthData(healthRes);
                    setStats({
                        totalPatients: healthRes.statistics?.total_patients || 0,
                        activeCaregivers: healthRes.statistics?.total_caregivers || 0,
                        systemHealth: healthRes.status === 'ok' ? 'Healthy' : 'Warning',
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

    const navItems = [
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'caregivers', label: 'Caregivers', icon: BriefcaseMedical },
        { id: 'logs', label: 'Audit Logs', icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-[#1c1c1c] text-gray-200 flex">
            {/* Sidebar */}
            <aside className={cn(
                "bg-[#181818] border-r border-gray-800 flex flex-col transition-all duration-300",
                sidebarCollapsed ? "w-16" : "w-64"
            )}>
                {/* Logo */}
                <div className="h-14 border-b border-gray-800 flex items-center px-4 justify-between">
                    {!sidebarCollapsed && (
                        <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-md flex items-center justify-center">
                                <Shield size={16} className="text-white" />
                            </div>
                            <span className="font-semibold text-white">MedicalAI</span>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
                    >
                        <Menu size={18} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id as any); setSelectedPatient(null); }}
                                className={cn(
                                    "w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-gray-800 text-white"
                                        : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                                )}
                            >
                                <Icon size={18} />
                                {!sidebarCollapsed && <span>{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="border-t border-gray-800 p-3">
                    <div className={cn(
                        "flex items-center space-x-3 p-2 rounded-md hover:bg-gray-800 transition-colors",
                        sidebarCollapsed && "justify-center"
                    )}>
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            A
                        </div>
                        {!sidebarCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">Administrator</p>
                                <p className="text-xs text-gray-500 truncate">admin@medicalai.com</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={logout}
                        className={cn(
                            "w-full mt-2 flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800/50 transition-all",
                            sidebarCollapsed && "justify-center"
                        )}
                    >
                        <LogOut size={18} />
                        {!sidebarCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="h-14 bg-[#181818] border-b border-gray-800 flex items-center justify-between px-6">
                    <div>
                        <h1 className="text-lg font-semibold text-white">
                            {selectedPatient ? selectedPatient.full_name :
                                activeTab === 'patients' ? 'Patient Management' :
                                    activeTab === 'caregivers' ? 'Caregiver Management' : 'Audit Logs'}
                        </h1>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                            <Circle size={8} className="text-emerald-500 fill-emerald-500" />
                            <span className="text-xs font-medium text-emerald-400">System Healthy</span>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto p-6">
                    {/* Stats Cards */}
                    {!selectedPatient && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <StatCard
                                label="Total Patients"
                                value={stats.totalPatients.toString()}
                                icon={<Users size={18} />}
                                trend="+12%"
                            />
                            <StatCard
                                label="Active Caregivers"
                                value={stats.activeCaregivers.toString()}
                                icon={<BriefcaseMedical size={18} />}
                                trend="Stable"
                            />
                            <StatCard
                                label="Health Records"
                                value={stats.totalLogs.toString()}
                                icon={<Activity size={18} />}
                                trend="+24 today"
                            />
                        </div>
                    )}

                    {/* Patients Tab */}
                    {activeTab === 'patients' && !selectedPatient && (
                        <div className="bg-[#181818] border border-gray-800 rounded-lg">
                            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <h2 className="text-base font-semibold text-white">All Patients</h2>
                                    <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded-md">
                                        {patients.filter(p => (p.role === 'patient' || !p.role)).length}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md transition-colors flex items-center space-x-2"
                                >
                                    <UserPlus size={16} />
                                    <span>Add Patient</span>
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-800">
                                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                                            <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={5} className="py-12 text-center">
                                                    <div className="flex flex-col items-center space-y-3">
                                                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                                        <span className="text-sm text-gray-500">Loading patients...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : patients.filter(p => (p.role === 'patient' || !p.role) && !p.full_name?.toLowerCase().includes('caretaker')).length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-12 text-center">
                                                    <p className="text-gray-500">No patients found</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            patients.filter(p => (p.role === 'patient' || !p.role) && !p.full_name?.toLowerCase().includes('caretaker')).map((patient) => (
                                                <tr key={patient.id} className="hover:bg-gray-800/30 transition-colors">
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-sm font-semibold">
                                                                {patient.full_name?.charAt(0) || '?'}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-white">{patient.full_name}</div>
                                                                <div className="text-xs text-gray-500">{patient.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className={cn(
                                                            "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
                                                            patient.status?.includes('Active')
                                                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                                : "bg-gray-800 text-gray-400 border border-gray-700"
                                                        )}>
                                                            <Circle size={6} className={cn("mr-1.5", patient.status?.includes('Active') ? "fill-emerald-400" : "fill-gray-400")} />
                                                            {patient.status || 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-400">
                                                        {patient.last_login ? new Date(patient.last_login).toLocaleDateString() : 'Never'}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="text-sm text-gray-300">{patient.doctor_name || 'Unassigned'}</div>
                                                        {patient.caregiver_count > 0 && (
                                                            <div className="text-xs text-gray-500 mt-0.5">
                                                                +{patient.caregiver_count} caregiver{patient.caregiver_count > 1 ? 's' : ''}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <button
                                                            onClick={() => handleManagePatient(patient)}
                                                            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium rounded-md transition-colors inline-flex items-center space-x-1.5"
                                                        >
                                                            <Eye size={14} />
                                                            <span>View</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Patient Details */}
                    {selectedPatient && (
                        <div className="space-y-4">
                            <button
                                onClick={() => { setSelectedPatient(null); setDetailTab('audit'); }}
                                className="flex items-center text-gray-400 hover:text-white text-sm transition-colors"
                            >
                                <ArrowLeft size={16} className="mr-2" /> Back to Patients
                            </button>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {/* Profile Card */}
                                <div className="bg-[#181818] border border-gray-800 rounded-lg p-6">
                                    <div className="flex flex-col items-center text-center space-y-4 mb-6">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-2xl">
                                            {selectedPatient.full_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-white">{selectedPatient.full_name}</h2>
                                            <p className="text-sm text-gray-500 mt-1">{selectedPatient.email}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-medium">
                                                Verified
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 border-t border-gray-800 pt-6">
                                        <DetailRow label="Status" value={selectedPatient.status} />
                                        <DetailRow label="Doctor" value={selectedPatient.doctor_name || 'Unassigned'} />
                                        <DetailRow label="Joined" value={new Date(selectedPatient.created_at).toLocaleDateString()} />
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-gray-800 space-y-2">
                                        <button className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-md transition-colors">
                                            Reset Password
                                        </button>
                                        <button className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-medium rounded-md transition-colors">
                                            Deactivate Account
                                        </button>
                                    </div>
                                </div>

                                {/* Details Panel */}
                                <div className="lg:col-span-2 bg-[#181818] border border-gray-800 rounded-lg p-6">
                                    <div className="flex items-center space-x-2 mb-6 border-b border-gray-800 pb-4">
                                        {[
                                            { id: 'audit', label: 'Health Records', icon: <Activity size={16} /> },
                                            { id: 'care_team', label: 'Care Team', icon: <BriefcaseMedical size={16} /> }
                                        ].map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setDetailTab(tab.id as any)}
                                                className={cn(
                                                    "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                                                    detailTab === tab.id
                                                        ? "bg-gray-800 text-white"
                                                        : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                                                )}
                                            >
                                                {tab.icon}
                                                <span>{tab.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {detailTab === 'audit' && (
                                        <>
                                            {detailLoading ? (
                                                <div className="py-12 text-center text-gray-500">Loading records...</div>
                                            ) : !patientDetails?.logs?.length ? (
                                                <div className="py-12 text-center border-2 border-dashed border-gray-800 rounded-lg">
                                                    <p className="text-gray-400 mb-1">No health records found</p>
                                                    <p className="text-sm text-gray-600">This patient hasn't logged any health data yet.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {patientDetails.logs.map((log: any) => (
                                                        <div key={log.id} className="p-4 bg-gray-800/30 border border-gray-800 rounded-lg hover:bg-gray-800/50 transition-all">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-xs font-medium">
                                                                    {log.date}
                                                                </span>
                                                                <span className="text-xs text-gray-500">{new Date(log.created_at).toLocaleTimeString()}</span>
                                                            </div>
                                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                                                <MetricBox label="Tremor" value={log.tremor_severity} />
                                                                <MetricBox label="Stiffness" value={log.stiffness_severity} />
                                                                <MetricBox label="Sleep" value={log.sleep_hours + 'h'} />
                                                                <MetricBox label="Mood" value={log.mood} />
                                                            </div>
                                                            {log.notes && (
                                                                <div className="mt-3 p-3 bg-gray-900/50 rounded-md text-gray-400 text-sm italic border-l-2 border-blue-500">
                                                                    "{log.notes}"
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {detailTab === 'care_team' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-semibold text-white">Assigned Caregivers</h3>
                                                <button
                                                    onClick={() => setIsAssignModalOpen(true)}
                                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md transition-colors flex items-center space-x-2"
                                                >
                                                    <UserPlus size={14} />
                                                    <span>Assign</span>
                                                </button>
                                            </div>

                                            {!patientDetails?.assignments?.length ? (
                                                <div className="py-12 text-center border-2 border-dashed border-gray-800 rounded-lg">
                                                    <p className="text-gray-400 mb-1">No caregivers assigned</p>
                                                    <p className="text-sm text-gray-600 mb-4">Assign a caregiver to this patient's care team.</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {patientDetails.assignments.map((assign: any) => (
                                                        <div key={assign.id} className="p-4 bg-gray-800/30 border border-gray-800 rounded-lg">
                                                            <div className="flex items-center space-x-3 mb-3">
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-semibold">
                                                                    {assign.caregiver?.full_name?.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-medium text-white">{assign.caregiver?.full_name}</div>
                                                                    <div className="text-xs text-gray-500">Caregiver</div>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2 text-xs">
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-500">Role</span>
                                                                    <span className="text-gray-300">{assign.assignment_notes || 'Primary care'}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-500">Assigned</span>
                                                                    <span className="text-gray-300">{new Date(assign.created_at).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Caregivers Tab */}
                    {activeTab === 'caregivers' && (
                        <div className="bg-[#181818] border border-gray-800 rounded-lg">
                            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <h2 className="text-base font-semibold text-white">All Caregivers</h2>
                                    <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded-md">
                                        {caregivers.length}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md transition-colors flex items-center space-x-2"
                                >
                                    <BriefcaseMedical size={16} />
                                    <span>Add Caregiver</span>
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-800">
                                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Caregiver</th>
                                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Access Level</th>
                                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {loading ? (
                                            <tr><td colSpan={4} className="py-12 text-center text-gray-500">Loading...</td></tr>
                                        ) : caregivers.length === 0 ? (
                                            <tr><td colSpan={4} className="py-12 text-center text-gray-500">No caregivers found</td></tr>
                                        ) : (
                                            caregivers.map((c) => (
                                                <tr key={c.id} className="hover:bg-gray-800/30 transition-colors">
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-semibold">
                                                                {c.full_name?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-white">{c.full_name}</div>
                                                                <div className="text-xs text-gray-500">{c.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-medium">
                                                            Standard
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-400">
                                                        {c.last_login ? new Date(c.last_login).toLocaleString() : 'Never'}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-gray-400">
                                                        {new Date(c.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Audit Logs Tab */}
                    {activeTab === 'logs' && (
                        <div className="bg-[#181818] border border-gray-800 rounded-lg p-6">
                            <h2 className="text-base font-semibold text-white mb-4">System Activity</h2>
                            <div className="space-y-2">
                                {loading ? (
                                    <div className="py-12 text-center text-gray-500">Loading logs...</div>
                                ) : auditLogs.length === 0 ? (
                                    <div className="py-12 text-center text-gray-500">No audit logs found</div>
                                ) : (
                                    auditLogs.map((log) => (
                                        <div key={log.id} className="p-4 bg-gray-800/30 border border-gray-800 rounded-lg flex items-center justify-between hover:bg-gray-800/50 transition-all">
                                            <div className="flex items-center space-x-4">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold",
                                                    log.action.includes('CREATE') ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                                        log.action.includes('DELETE') ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                                            "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                )}>
                                                    {log.action.split('_')[0].charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-white">{log.details}</div>
                                                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                                                        <span>{log.user?.full_name || 'System'}</span>
                                                        <span>•</span>
                                                        <span>{log.ip_address}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500 text-right">
                                                <div>{new Date(log.created_at).toLocaleDateString()}</div>
                                                <div className="text-gray-600">{new Date(log.created_at).toLocaleTimeString()}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Modals */}
            <CreateCaregiverModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    api.admin.getCaregivers().then(setCaregivers);
                }}
            />

            <AssignCaregiverModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                patientId={selectedPatient?.id || ''}
                onSuccess={async () => {
                    if (selectedPatient?.id) {
                        try {
                            const [details, patientsRes, healthRes] = await Promise.all([
                                api.admin.getPatientDetails(selectedPatient.id),
                                api.admin.getPatients(),
                                api.admin.getSystemHealth()
                            ]);
                            setPatientDetails(details);
                            if (patientsRes && patientsRes.patients) {
                                setPatients(patientsRes.patients);
                                const updated = patientsRes.patients.find((p: any) => p.id === selectedPatient.id);
                                if (updated) setSelectedPatient(updated);
                            }
                            if (healthRes) {
                                setHealthData(healthRes);
                                setStats({
                                    totalPatients: healthRes.statistics?.total_patients || 0,
                                    activeCaregivers: healthRes.statistics?.total_caregivers || 0,
                                    systemHealth: healthRes.status === 'ok' ? 'Healthy' : 'Warning',
                                    totalLogs: healthRes.statistics?.total_logs || 0
                                });
                            }
                        } catch (err) {
                            console.error("Refresh error after assignment:", err);
                        }
                    }
                }}
            />
        </div>
    );
}

function StatCard({ label, value, icon, trend }: { label: string, value: string, icon: React.ReactNode, trend: string }) {
    return (
        <div className="bg-[#181818] border border-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-lg bg-gray-800 text-gray-400">
                    {icon}
                </div>
                <div className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-md",
                    trend.includes('+') ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-gray-800 text-gray-400 border border-gray-700"
                )}>
                    {trend}
                </div>
            </div>
            <div className="space-y-1">
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-sm font-medium text-white">{value || 'N/A'}</span>
        </div>
    );
}

function MetricBox({ label, value }: { label: string, value: any }) {
    return (
        <div className="p-2 bg-gray-900/50 rounded-md border border-gray-800">
            <div className="text-xs text-gray-500 mb-0.5">{label}</div>
            <div className="text-sm font-semibold text-white">{value}</div>
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
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-[#181818] border border-gray-800 rounded-lg shadow-2xl overflow-hidden p-6"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-white mb-1">Add New Caregiver</h2>
                            <p className="text-sm text-gray-500">Create a new caregiver account</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center">
                                <AlertCircle size={16} className="mr-2 shrink-0" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Full Name"
                                placeholder="Dr. Sarah Johnson"
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                icon={<User size={18} />}
                                className="bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-600"
                                required
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="sarah.johnson@hospital.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                icon={<Mail size={18} />}
                                className="bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-600"
                                required
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-600"
                                    required
                                />
                                <Input
                                    label="Phone Number"
                                    type="tel"
                                    placeholder="+1 (555) 000-0000"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    icon={<Phone size={18} />}
                                    className="bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-600"
                                />
                            </div>

                            <Button
                                type="submit"
                                isLoading={loading}
                                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-md"
                            >
                                Create Caregiver Account
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-xl bg-[#181818] border border-gray-800 rounded-lg p-6 shadow-2xl overflow-hidden"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors">
                            <X size={20} />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-white mb-1">Assign Caregiver</h2>
                            <p className="text-sm text-gray-500">Select a caregiver to assign to this patient</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Select Caregiver</label>
                                {fetching ? (
                                    <div className="py-8 text-center text-sm text-gray-500 border border-gray-800 rounded-lg">Loading caregivers...</div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
                                        {caregivers.map(c => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => setSelectedId(c.id)}
                                                className={cn(
                                                    "flex items-center justify-between p-3 rounded-lg border transition-all text-left",
                                                    selectedId === c.id
                                                        ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                                                        : "bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700"
                                                )}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm",
                                                        selectedId === c.id ? "bg-emerald-600 text-white" : "bg-gray-800 text-gray-400"
                                                    )}>
                                                        {c.full_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium">{c.full_name}</div>
                                                        <div className="text-xs text-gray-500">{c.email}</div>
                                                    </div>
                                                </div>
                                                {selectedId === c.id && <CheckCircle2 size={18} className="text-emerald-400" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Assignment Notes (Optional)</label>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Enter specific care instructions or role details..."
                                    className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-all min-h-[100px] resize-none placeholder:text-gray-600"
                                />
                            </div>

                            <Button
                                type="submit"
                                isLoading={loading}
                                disabled={!selectedId}
                                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Assign Caregiver
                            </Button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
