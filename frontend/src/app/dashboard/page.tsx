"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { detectUnusualChanges } from '@/lib/analysis';
import PatientDashboard from '../../components/dashboard/PatientDashboard';
import CaregiverDashboard from '../../components/dashboard/CaregiverDashboard';

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
                        setLastCheckIn(fetchedLogs[0]);
                        const detected = detectUnusualChanges(fetchedLogs);
                        if (detected) setInsights(detected);

                        // Filter for current week (Monday to Today)
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const monday = new Date(today);
                        const dayOfWeek = monday.getDay();
                        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                        monday.setDate(monday.getDate() + diff);

                        const weekLogs = fetchedLogs.filter((log: any) => {
                            const logDate = new Date(log.date);
                            logDate.setHours(0, 0, 0, 0);
                            return logDate >= monday && logDate <= today;
                        });

                        setLogs(weekLogs); // Only pass weekly logs to dashboard

                        const avgTremor = weekLogs.length > 0
                            ? weekLogs.reduce((acc: number, log: any) => acc + (log.tremor_severity || 0), 0) / weekLogs.length
                            : 0;
                        const avgStiffness = weekLogs.length > 0
                            ? weekLogs.reduce((acc: number, log: any) => acc + (log.stiffness_severity || 0), 0) / weekLogs.length
                            : 0;
                        const avgSleep = weekLogs.length > 0
                            ? weekLogs.reduce((acc: number, log: any) => acc + (log.sleep_hours || 0), 0) / weekLogs.length
                            : 0;
                        setAverages({ tremor: avgTremor.toFixed(1), stiffness: avgStiffness.toFixed(1), sleep: avgSleep.toFixed(1) });
                    }
                }

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
            <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-400">Loading...</span>
        </div>
    );

    return (
        <>
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
        </>
    );
}
