"use client";

import React, { useEffect, useState } from 'react';
import {
    Activity,
    LogOut,
    Menu,
    Home,
    TrendingUp,
    Calendar as CalendarIcon,
    Settings,
    FileText,
    Users,
    Bell,
    BriefcaseMedical,
    Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            window.location.href = '/login';
            return;
        }
        const userData = JSON.parse(userStr);
        setUser(userData);
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1c1c1c] flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-400">Loading Dashboard...</span>
            </div>
        );
    }

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

    // Navigation items based on role
    const patientNavItems = [
        { id: 'overview', label: 'Overview', icon: Home, href: '/dashboard' },
        { id: 'check-in', label: 'Daily Check-in', icon: CalendarIcon, href: '/dashboard/check-in' },
        { id: 'trends', label: 'Health Trends', icon: TrendingUp, href: '/dashboard/trends' },
        { id: 'reports', label: 'Reports', icon: FileText, href: '/dashboard/reports' },
        { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
    ];

    const caregiverNavItems = [
        { id: 'overview', label: 'Overview', icon: Home, href: '/dashboard' },
        { id: 'patients', label: 'My Patients', icon: Users, href: '/dashboard/caregivers' },
        { id: 'notifications', label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
        { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
    ];

    const navItems = user?.role === 'patient' ? patientNavItems : caregiverNavItems;

    return (
        <div className="min-h-screen bg-[#1c1c1c] text-gray-200 flex">
            {/* Sidebar */}
            <aside className={cn(
                "bg-[#181818] border-r border-gray-800 flex flex-col transition-all duration-300 fixed h-full z-50",
                sidebarCollapsed ? "w-16" : "w-64"
            )}>
                {/* Logo */}
                <div className="h-14 border-b border-gray-800 flex items-center px-4 justify-between">
                    {!sidebarCollapsed && (
                        <div className="flex items-center space-x-2">
                            <div className={cn(
                                "w-7 h-7 rounded-md flex items-center justify-center",
                                user?.role === 'patient'
                                    ? "bg-gradient-to-br from-teal-500 to-cyan-600"
                                    : "bg-gradient-to-br from-emerald-500 to-teal-600"
                            )}>
                                {user?.role === 'patient' ? <Activity size={16} className="text-white" /> : <BriefcaseMedical size={16} className="text-white" />}
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
                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                        return (
                            <Link key={item.id} href={item.href}>
                                <div
                                    className={cn(
                                        "w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer",
                                        isActive
                                            ? "bg-gray-800 text-white"
                                            : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                                    )}
                                >
                                    <Icon size={18} />
                                    {!sidebarCollapsed && <span>{item.label}</span>}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="border-t border-gray-800 p-3">
                    <div className={cn(
                        "flex items-center space-x-3 p-2 rounded-md hover:bg-gray-800 transition-colors",
                        sidebarCollapsed && "justify-center"
                    )}>
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold",
                            user?.role === 'patient'
                                ? "bg-gradient-to-br from-teal-500 to-cyan-600"
                                : "bg-gradient-to-br from-emerald-500 to-teal-600"
                        )}>
                            {firstName.charAt(0)}
                        </div>
                        {!sidebarCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{firstName}</p>
                                <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
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
            <div className={cn(
                "flex-1 flex flex-col overflow-hidden transition-all duration-300",
                sidebarCollapsed ? "ml-16" : "ml-64"
            )}>
                {/* Top Bar */}
                <header className="h-14 bg-[#181818] border-b border-gray-800 flex items-center justify-between px-6">
                    <div>
                        <h1 className="text-lg font-semibold text-white">
                            {getTimeGreeting()}, {firstName}
                        </h1>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                            <Circle size={8} className="text-emerald-500 fill-emerald-500" />
                            <span className="text-xs font-medium text-emerald-400">
                                {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
