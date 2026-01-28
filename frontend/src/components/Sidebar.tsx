"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ClipboardCheck,
    TrendingUp,
    FileText,
    Settings,
    LogOut,
    Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const Sidebar = () => {
    const pathname = usePathname();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: ClipboardCheck, label: 'Daily Check-in', href: '/dashboard/check-in' },
        { icon: TrendingUp, label: 'Trends', href: '/dashboard/trends' },
        { icon: FileText, label: 'Reports', href: '/dashboard/reports' },
        { icon: Users, label: 'Caregivers', href: '/dashboard/caregivers' },
        { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
    ];

    return (
        <div className="flex flex-col w-64 bg-white border-r border-teal-100 h-screen fixed left-0 top-0">
            <div className="p-6">
                <Link href="/" className="text-2xl font-bold text-teal-600">ParkiTrack</Link>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                isActive
                                    ? "bg-teal-50 text-teal-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-teal-600"
                            )}
                        >
                            <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-teal-600" : "text-gray-400")} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-teal-50">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
