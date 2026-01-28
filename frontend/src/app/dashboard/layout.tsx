"use client";

import Sidebar from "@/components/layout/Sidebar";
import { motion } from "framer-motion";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-mesh-premium">
            <Sidebar />
            <main className="flex-1 ml-80 min-h-screen relative overflow-hidden">
                {/* Subtle background noise/mesh */}
                <div className="absolute inset-0 bg-white/40 pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 p-12 max-w-7xl mx-auto"
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
