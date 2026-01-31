"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import {
    ShieldCheck,
    Lock,
    FileText,
    Bell,
    Terminal,
    AlertTriangle,
    CheckCircle2,
    LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CompliancePage() {
    return (
        <div className="space-y-12 pb-24">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-3 text-indigo-600 font-black text-xs uppercase tracking-[0.3em] mb-3">
                        <ShieldCheck size={14} />
                        <span>Security & Compliance Manifest</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                        Trust <span className="text-slate-400 italic font-serif font-light">Architecture</span>
                    </h1>
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            window.location.href = '/login';
                        }}
                        className="p-4 bg-white/50 border border-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl shadow-premium backdrop-blur-xl transition-all group"
                        title="End Session"
                    >
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                    </button>
                </div>
            </header>
            <p className="mt-4 text-slate-500 font-medium max-w-2xl leading-relaxed">
                ParkiTrack's clinical stream is protected by end-to-end cryptographic integrity and strict regulatory compliance controls.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="p-8 border-none bg-indigo-50" hover={false}>
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 mb-6 shadow-sm">
                        <Lock size={24} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Data Encryption</h3>
                    <p className="text-sm text-slate-600 font-medium">AES-256 encryption at rest and TLS 1.3 in transit for all clinical data packets.</p>
                </Card>

                <Card className="p-8 border-none bg-emerald-50" hover={false}>
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 mb-6 shadow-sm">
                        <ShieldCheck size={24} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">HIPAA Ready</h3>
                    <p className="text-sm text-slate-600 font-medium">Structured to meet the rigorous physical and technical safeguards of health data privacy.</p>
                </Card>

                <Card className="p-8 border-none bg-slate-900 text-white" hover={false}>
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-teal-400 mb-6 shadow-sm">
                        <Terminal size={24} />
                    </div>
                    <h3 className="text-xl font-black mb-2">Audit Logs</h3>
                    <p className="text-sm text-slate-400 font-medium text-indigo-100/60">Every access point and modification is recorded in our immutable system ledger.</p>
                </Card>
            </div>



            <section className="bg-rose-50 rounded-[32px] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-start space-x-6">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-rose-500 shadow-xl shadow-rose-500/10">
                        <AlertTriangle size={32} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Emergency Protocols</h3>
                        <p className="text-slate-600 font-medium max-w-xl">
                            If you suspect unauthorized access to your clinical stream, immediately terminate all active sessions.
                        </p>
                    </div>
                </div>
                <button className="px-8 py-4 bg-rose-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-500/20 hover:scale-[1.02] transition-transform">
                    Reset Security Keys
                </button>
            </section>
        </div>
    );
}
