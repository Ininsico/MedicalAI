"use client";

import React, { useState } from 'react';
import Sidebar from "@/components/layout/Sidebar";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-mesh-premium">
            <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

            {/* Mobile Menu Trigger */}
            <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="fixed top-6 left-6 z-30 lg:hidden p-3 bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-slate-100 text-slate-600 hover:text-teal-600 transition-colors"
            >
                <Menu size={24} />
            </button>

            <main className="flex-1 lg:ml-80 min-h-screen relative overflow-hidden">
                {/* Subtle background noise/mesh */}
                <div className="absolute inset-0 bg-white/40 pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 p-6 lg:p-12 max-w-7xl mx-auto pt-24 lg:pt-12"
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
