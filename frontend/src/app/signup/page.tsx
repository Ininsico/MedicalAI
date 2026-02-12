"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { Mail, Lock, User, Activity, ChevronLeft, CheckCircle2, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const role = 'patient';
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.auth.register({
                email,
                password,
                full_name: fullName,
                role
            });

            // Automatically login after signup
            const response = await api.auth.login({ email, password });

            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            setSuccess(true);
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);

        } catch (err: any) {
            console.error("Signup Error:", err);
            setError(err.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex overflow-hidden bg-white">
            {/* Left Section - Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative bg-white p-6 lg:p-12 overflow-hidden">
                {/* Mobile Background Decoration (Hidden on Desktop) */}
                <div className="lg:hidden absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-indigo-500" />

                <div className="w-full max-w-sm space-y-6">
                    <div className="space-y-1">
                        <Link
                            href="/"
                            className="inline-flex items-center text-slate-400 hover:text-slate-900 transition-colors text-xs font-medium mb-6"
                        >
                            <ChevronLeft size={14} className="mr-1" />
                            Back to Home
                        </Link>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create an account</h1>
                        <p className="text-sm text-slate-500">
                            Join the medical AI network to access advanced diagnostics.
                        </p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <Input
                            label="Full Name"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            icon={<User size={16} />}
                            className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 h-10 text-sm"
                        />

                        <Input
                            label="Email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@company.com"
                            icon={<Mail size={16} />}
                            className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 h-10 text-sm"
                        />

                        <div className="space-y-1">
                            <Input
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                                icon={<Lock size={16} />}
                                endIcon={
                                    <div onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </div>
                                }
                                className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 h-10 text-sm"
                            />
                            <p className="text-[10px] text-slate-400">
                                Must be at least 8 characters.
                            </p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2 text-red-600 text-xs"
                            >
                                <Activity className="h-3.5 w-3.5" />
                                {error}
                            </motion.div>
                        )}

                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-lg bg-green-50 border border-green-100 flex items-center gap-2 text-green-600 text-xs"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Account created successfully! Redirecting...
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-10 text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02]"
                            isLoading={loading}
                        >
                            Get Started <ArrowRight size={16} className="ml-2" />
                        </Button>

                        <p className="text-center text-[10px] text-slate-400 mt-2 leading-relaxed">
                            By clicking "Get Started", you agree to our Terms of Service.
                        </p>
                    </form>

                    <p className="text-center text-xs text-slate-500 mt-4">
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Section - Visuals */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden flex-col justify-between p-8 z-0">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_20%,rgba(99,102,241,0.15),transparent_40%)]" />
                <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(20,184,166,0.15),transparent_40%)]" />

                {/* Animated DNA/Grid Structure */}
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '30px 30px'
                    }}
                />

                {/* Top Badge */}
                <div className="relative z-10 w-full flex justify-end">
                    <div className="flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        <span className="text-xs font-mono text-indigo-300 tracking-wider">SECURE PROVISIONING</span>
                    </div>
                </div>

                {/* Central Visual - Secure Vault/Shield */}
                <div className="relative z-10 flex-1 flex items-center justify-center">
                    <div className="relative w-80 h-80">
                        {/* Spinning Rings */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border border-dashed border-indigo-500/30"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-4 rounded-full border border-dashed border-teal-500/20"
                        />

                        {/* Hexagon Shield */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg width="200" height="200" viewBox="0 0 200 200" className="opacity-80">
                                <defs>
                                    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.2" />
                                    </linearGradient>
                                </defs>
                                <path d="M100 20 L170 60 V140 L100 180 L30 140 V60 Z" fill="url(#shieldGrad)" stroke="rgba(99,102,241,0.5)" strokeWidth="1" />
                                <path d="M100 45 L145 70 V125 L100 150 L55 125 V70 Z" fill="none" stroke="rgba(20,184,166,0.5)" strokeWidth="1" strokeDasharray="4 4" />
                            </svg>
                            <ShieldCheck className="absolute text-indigo-100 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" size={64} />
                        </div>

                        {/* Floating Security Cards */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                            className="absolute -right-12 top-20 bg-slate-800/80 backdrop-blur border border-indigo-500/30 p-3 rounded-xl shadow-xl w-36"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span className="text-[10px] text-slate-300 font-bold">ENCRYPTION</span>
                            </div>
                            <div className="text-xs font-mono text-emerald-400">AES-256-GCM</div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -left-8 bottom-10 bg-slate-800/80 backdrop-blur border border-teal-500/30 p-3 rounded-xl shadow-xl w-40"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                                <span className="text-[10px] text-slate-300 font-bold">COMPLIANCE</span>
                            </div>
                            <div className="text-xs font-mono text-teal-400">HIPAA / GDPR READY</div>
                        </motion.div>
                    </div>
                </div>

                <div className="relative z-10 max-w-lg ml-auto text-right">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                        Secure & Private <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-400 to-teal-400">
                            Health Ecosystem
                        </span>
                    </h2>
                    <p className="text-slate-400 text-base leading-relaxed mb-6">
                        Your biological data is protected by multi-layer quantum-resistant encryption protocols.
                    </p>

                    <div className="flex justify-end items-center gap-4 text-xs font-medium text-slate-500">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={12} className="text-teal-500" />
                            Identity Verified
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={12} className="text-indigo-500" />
                            Access Logged
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
