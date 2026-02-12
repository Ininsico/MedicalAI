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
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-500">Loading Dashboard...</span>
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
    ];

    const caregiverNavItems = [
        { id: 'overview', label: 'Overview', icon: Home, href: '/dashboard' },
        { id: 'patients', label: 'My Patients', icon: Users, href: '/dashboard/caregivers' },
        { id: 'notifications', label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
    ];

    const navItems = user?.role === 'patient' ? patientNavItems : caregiverNavItems;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex">
            {/* Sidebar */}
            <aside className={cn(
                "bg-white border-r border-gray-300 flex flex-col transition-all duration-300 fixed h-full z-50 shadow-sm",
                sidebarCollapsed ? "w-16" : "w-64"
            )}>
                {/* Logo */}
                <div className="h-14 border-b border-gray-300 flex items-center px-4 justify-between">
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
                            <span className="font-semibold text-gray-900">MedicalAI</span>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-600"
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
                                            ? user?.role === 'patient'
                                                ? "bg-teal-50 text-teal-700 border border-teal-300"
                                                : "bg-emerald-50 text-emerald-700 border border-emerald-300"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
                <div className="border-t border-gray-300 p-3">
                    <div className={cn(
                        "flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors",
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
                                <p className="text-sm font-medium text-gray-900 truncate">{firstName}</p>
                                <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "w-full mt-2 flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all",
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
                <header className="h-14 bg-white border-b border-gray-300 flex items-center justify-between px-6 shadow-sm">
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900">
                            {getTimeGreeting()}, {firstName}
                        </h1>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className={cn(
                            "flex items-center space-x-2 px-3 py-1.5 rounded-md border",
                            user?.role === 'patient'
                                ? "bg-teal-50 border-teal-300"
                                : "bg-emerald-50 border-emerald-300"
                        )}>
                            <Circle size={8} className={cn(
                                "fill-current",
                                user?.role === 'patient' ? "text-teal-500" : "text-emerald-500"
                            )} />
                            <span className={cn(
                                "text-xs font-medium",
                                user?.role === 'patient' ? "text-teal-700" : "text-emerald-700"
                            )}>
                                {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto p-6 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
}
