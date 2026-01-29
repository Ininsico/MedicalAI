"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    ClipboardCheck,
    TrendingUp,
    FileText,
    Settings,
    LogOut,
    Users,
    Activity,
    ChevronRight,
    ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        // Clear all session data
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect to login
        window.location.href = '/login';
    };

    const [user, setUser] = React.useState<any>(null);

    React.useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) setUser(JSON.parse(userStr));
    }, []);

    const patientMenu = [
        { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
        { icon: ClipboardCheck, label: 'Clinical Entry', href: '/dashboard/check-in' },
        { icon: TrendingUp, label: 'Analytics', href: '/dashboard/trends' },
        { icon: FileText, label: 'Export Data', href: '/dashboard/reports' },
        { icon: Users, label: 'Network', href: '/dashboard/caregivers' },
        { icon: Settings, label: 'Compliance', href: '/dashboard/settings' },
    ];

    const caregiverMenu = [
        { icon: LayoutDashboard, label: 'Control Center', href: '/dashboard' },
        { icon: Users, label: 'Patient Matrix', href: '/dashboard/caregivers' },
        { icon: TrendingUp, label: 'Clinical Trends', href: '/dashboard/trends' },
        { icon: FileText, label: 'Medical Reports', href: '/dashboard/reports' },
        { icon: Settings, label: 'Configuration', href: '/dashboard/settings' },
    ];

    const menuItems = user?.role === 'caregiver' ? caregiverMenu : patientMenu;

    return (
        <div className="flex flex-col w-80 bg-white border-r border-slate-100 h-screen fixed left-0 top-0 z-50">
            {/* Brand */}
            <div className="p-10 mb-4">
                <Link href="/" className="flex items-center space-x-3 group">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform shadow-lg shadow-slate-900/20">
                        <Activity size={22} className="text-teal-500" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-slate-900">
                        Parki<span className="text-teal-600 italic font-serif">Track</span>
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-6 space-y-2">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 ml-4">Analysis Modules</div>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group relative flex items-center justify-between px-6 py-4 rounded-[20px] transition-all duration-300",
                                isActive
                                    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <div className="flex items-center">
                                <item.icon className={cn("mr-4 h-5 w-5 transition-colors", isActive ? "text-teal-500" : "text-slate-400 group-hover:text-teal-600")} />
                                <span className="font-bold text-[15px] tracking-tight">{item.label}</span>
                            </div>
                            {isActive && <ChevronRight size={16} className="text-teal-500" />}
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute left-[-2px] top-4 bottom-4 w-1 bg-teal-500 rounded-full"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Info */}
            <div className="p-8 space-y-6">
                <div className="bg-teal-50/50 rounded-[24px] p-6 border border-teal-100/50">
                    <div className="flex items-center text-teal-700 font-bold text-xs uppercase tracking-widest mb-3">
                        <ShieldAlert size={14} className="mr-2" />
                        System Active
                    </div>
                    <p className="text-xs text-teal-600/80 font-medium leading-relaxed">
                        Clinical monitors are analyzing your data in real-time.
                    </p>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-6 py-4 text-sm font-bold text-slate-400 rounded-[20px] hover:bg-red-50 hover:text-red-600 transition-all active:scale-[0.98] group"
                >
                    <LogOut className="mr-4 h-5 w-5 opacity-50 group-hover:rotate-12 transition-transform" />
                    End Session
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
