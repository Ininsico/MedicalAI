"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import {
    Users,
    Activity,
    Shield,
    BriefcaseMedical,
    UserCog,
    ChevronLeft,
    Search,
    UserPlus,
    Stethoscope
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function AdminPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'patient' | 'caregiver'>('all');

    useEffect(() => {
        async function fetchUsers() {
            // Mock fetching all profiles - in real app would need admin role
            const { data: profiles } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (profiles) {
                setUsers(profiles);
            }
            setLoading(false);
        }
        fetchUsers();
    }, []);

    const filteredUsers = activeTab === 'all'
        ? users
        : users.filter(u => u.role === activeTab);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-teal-500 selection:text-white">
            {/* Admin Header */}
            <header className="bg-slate-950/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-slate-900 shadow-lg shadow-teal-500/20">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-white">Neuro<span className="text-teal-500 italic font-serif">Admin</span></h1>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Override Protocol</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="hidden md:flex items-center px-4 py-2 bg-white/5 rounded-lg border border-white/5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3 animate-pulse" />
                            <span className="text-xs font-bold text-slate-400">System Nominal</span>
                        </div>
                        <Button variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white">
                            <Link href="/">Exit Console</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-8 space-y-12">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <AdminStatCard label="Total Patients" value={users.filter(u => u.role === 'patient').length.toString()} icon={<Users size={20} />} trend="+12%" />
                    <AdminStatCard label="Caregivers" value={users.filter(u => u.role === 'caregiver').length.toString()} icon={<BriefcaseMedical size={20} />} trend="+5%" />
                    <AdminStatCard label="Active Clinicians" value="8" icon={<Stethoscope size={20} />} trend="Stable" />
                    <AdminStatCard label="Network Load" value="42%" icon={<Activity size={20} />} trend="-2%" />
                </div>

                {/* User Management */}
                <Card className="bg-slate-950 border-white/5 p-8" hover={false}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight mb-2">Network Directory</h2>
                            <p className="text-slate-500 font-medium">Manage provisioning and clinical assignments.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex bg-white/5 p-1 rounded-xl">
                                {['all', 'patient', 'caregiver'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                                            activeTab === tab ? "bg-teal-500 text-slate-900 shadow-lg shadow-teal-500/20" : "text-slate-400 hover:text-white"
                                        )}
                                    >
                                        {tab}s
                                    </button>
                                ))}
                            </div>
                            <Button variant="dark" className="bg-teal-600 text-white hover:bg-teal-500 border-none">
                                <UserPlus size={18} className="mr-2" /> Add User
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 text-xs font-black text-slate-500 uppercase tracking-widest">
                                    <th className="pb-4 pl-4">Identity</th>
                                    <th className="pb-4">Role</th>
                                    <th className="pb-4">Status</th>
                                    <th className="pb-4">Assigned Doctor</th>
                                    <th className="pb-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">
                                            Scanning Database...
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-500">
                                            No entities found in this sector.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="py-4 pl-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                                                        {user.full_name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">{user.full_name || 'Unknown User'}</div>
                                                        <div className="text-xs text-slate-500 font-mono">{user.id.substring(0, 8)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <span className={cn(
                                                    "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                                                    user.role === 'patient' ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                                                        user.role === 'caregiver' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                                            "bg-teal-500/10 text-teal-400 border-teal-500/20"
                                                )}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    <span className="text-xs font-medium text-slate-400">Active</span>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                {user.role === 'patient' ? (
                                                    <div className="flex items-center space-x-2 group/edit cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                                                        <span className="text-sm font-medium text-slate-300">Dr. Sarah Chen</span>
                                                        <UserCog size={14} className="text-slate-600 group-hover/edit:text-teal-500" />
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-600 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="py-4">
                                                <button className="text-xs font-bold text-slate-500 hover:text-white transition-colors">
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
            </main>
        </div>
    );
}

function AdminStatCard({ label, value, icon, trend }: { label: string, value: string, icon: React.ReactNode, trend: string }) {
    return (
        <Card className="bg-slate-950 border-white/5 p-6" hover={false}>
            <div className="flex justify-between items-start mb-4">
                <div className="text-slate-500 bg-white/5 p-2 rounded-lg">{icon}</div>
                <div className={cn(
                    "text-[10px] font-black px-2 py-1 rounded-full",
                    trend.includes('+') ? "bg-emerald-500/10 text-emerald-400" :
                        trend.includes('-') ? "bg-rose-500/10 text-rose-400" : "bg-slate-500/10 text-slate-400"
                )}>
                    {trend}
                </div>
            </div>
            <div className="space-y-1">
                <div className="text-2xl font-black text-white">{value}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</div>
            </div>
        </Card>
    );
}
