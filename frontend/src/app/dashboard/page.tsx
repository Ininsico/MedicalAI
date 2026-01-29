"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Activity, Calendar, Clock, LogOut } from 'lucide-react';
import { detectUnusualChanges } from '@/lib/analysis';
import PatientDashboard from '@/components/dashboard/PatientDashboard';
import CaregiverDashboard from '@/components/dashboard/CaregiverDashboard';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [lastCheckIn, setLastCheckIn] = useState<any>(null);
    const [insights, setInsights] = useState<string[]>([]);
    const [averages, setAverages] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getDashboardData() {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) {
                    window.location.href = '/login';
                    return;
                }
                const userData = JSON.parse(userStr);
                setUser(userData);

                // Fetch data based on role
                if (userData.role === 'patient') {
                    const fetchedLogs = await api.patient.getLogs(userData.id);
                    if (fetchedLogs && fetchedLogs.length > 0) {
                        setLogs(fetchedLogs);
                        setLastCheckIn(fetchedLogs[0]);
                        const detected = detectUnusualChanges(fetchedLogs);
                        if (detected) setInsights(detected);

                        const avgTremor = fetchedLogs.reduce((acc: number, log: any) => acc + (log.tremor_severity || 0), 0) / fetchedLogs.length;
                        const avgStiffness = fetchedLogs.reduce((acc: number, log: any) => acc + (log.stiffness_severity || 0), 0) / fetchedLogs.length;
                        const avgSleep = fetchedLogs.reduce((acc: number, log: any) => acc + (log.sleep_hours || 0), 0) / fetchedLogs.length;
                        setAverages({ tremor: avgTremor.toFixed(1), stiffness: avgStiffness.toFixed(1), sleep: avgSleep.toFixed(1) });
                    }
                }
                // Caregiver data is handled inside CaregiverDashboard component for cleaner state management

            } catch (error) {
                console.error('Dashboard data error:', error);
            } finally {
                setLoading(false);
            }
        }

        getDashboardData();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Dashboard...</span>
        </div>
    );

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const firstName = user?.full_name?.split(' ')[0] || 'User';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <div className="space-y-12 pb-24">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>

                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">
                        {getTimeGreeting()}, <span className="text-teal-600 italic font-serif font-light">{firstName}</span>
                    </h1>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-4 bg-white/50 border border-white p-2 rounded-2xl shadow-premium backdrop-blur-xl">
                        <div className="flex items-center px-4 py-2 bg-teal-50 rounded-xl text-teal-700 font-bold text-sm">
                            <Calendar size={16} className="mr-2" />
                            {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>

                    </div>

                    <button
                        onClick={handleLogout}
                        className="p-4 bg-white/50 border border-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl shadow-premium backdrop-blur-xl transition-all group"
                        title="End Session"
                    >
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                    </button>
                </div>
            </header>

            {user?.role === 'patient' ? (
                <PatientDashboard
                    lastCheckIn={lastCheckIn}
                    insights={insights}
                    averages={averages}
                    logs={logs}
                />
            ) : (
                <CaregiverDashboard />
            )}
        </div>
    );
}
