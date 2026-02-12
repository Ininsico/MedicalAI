"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, Activity, ChevronLeft, Github, Fingerprint, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.auth.login({ email, password });

            // Store auth data
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            if (response.user.role === 'admin') {
                window.location.href = '/admin';
            } else {
                window.location.href = '/dashboard';
            }
        } catch (err: any) {
            console.error("Login Error:", err);
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex overflow-hidden bg-white">
            {/* Left Section - Visuals */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden flex-col justify-between p-8 z-0">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.15),transparent_40%)]" />
                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.15),transparent_40%)]" />

                {/* Animated Mesh Grid */}
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />

                {/* Header Logo */}
                <div className="relative z-10">
                    <div className="flex items-center space-x-3 text-white mb-2">
                        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/20">
                            <Activity className="text-white" size={16} />
                        </div>
                        <span className="text-lg font-bold tracking-tight">MedicalAI</span>
                    </div>
                </div>

                {/* Central Visual - AI Analysis Dashboard */}
                <div className="relative z-10 flex-1 flex items-center justify-center w-full">
                    {/* Main Glass Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full max-w-sm bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden group"
                    >
                        {/* Scanning Line Animation */}
                        <motion.div
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 w-full h-[1px] bg-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.5)] z-20"
                        />

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                                <span className="text-xs font-mono text-teal-400 uppercase tracking-wider">Live Analysis</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">ID: #892-XJ</span>
                        </div>

                        {/* Analysis Grid */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-slate-300">
                                    <span>Tumor Detection Probability</span>
                                    <span className="text-teal-400 font-bold">98.2%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "98.2%" }}
                                        transition={{ duration: 1.5, delay: 0.5 }}
                                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-slate-300">
                                    <span>Neurological Pattern Match</span>
                                    <span className="text-indigo-400 font-bold">84.5%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "84.5%" }}
                                        transition={{ duration: 1.5, delay: 0.7 }}
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-700/50">
                                    <div className="text-[10px] text-slate-400 uppercase">Heart Rate</div>
                                    <div className="text-lg font-mono text-white">72 <span className="text-[10px] text-slate-500">BPM</span></div>
                                </div>
                                <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-700/50">
                                    <div className="text-[10px] text-slate-400 uppercase">O2 Saturation</div>
                                    <div className="text-lg font-mono text-white">99 <span className="text-[10px] text-slate-500">%</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-4 -right-4 bg-teal-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg"
                        >
                            AI ACTIVE
                        </motion.div>
                    </motion.div>

                    {/* Floating Notification Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 1 }}
                        className="absolute bottom-20 -left-4 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-xl w-48"
                    >
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                                <Activity size={14} className="text-indigo-400" />
                            </div>
                            <div>
                                <div className="text-xs text-white font-medium">New Pattern Found</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">Analysis complete for Patient #992</div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                        Advanced Clinical <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                            Decision Support
                        </span>
                    </h2>
                    <p className="text-slate-400 text-base leading-relaxed mb-6">
                        Empowering healthcare professionals with next-generation AI diagnostics.
                    </p>

                    <div className="flex items-center space-x-2 text-sm font-medium text-teal-400">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] text-white">
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                        </div>
                        <span className="pl-2 text-xs">Trusted by 10,000+ clinicians</span>
                    </div>
                </div>
            </div>

            {/* Right Section - Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative bg-white p-6 lg:p-12 overflow-hidden">
                <div className="w-full max-w-sm space-y-6">
                    <div className="space-y-1">
                        <Link
                            href="/"
                            className="inline-flex items-center text-slate-400 hover:text-slate-900 transition-colors text-xs font-medium mb-6"
                        >
                            <ChevronLeft size={14} className="mr-1" />
                            Back to Home
                        </Link>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
                        <p className="text-sm text-slate-500">
                            Please enter your details to sign in.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-3">
                            <Input
                                label="Email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                icon={<Mail size={16} />}
                                className="bg-slate-50 border-slate-200 focus:border-teal-500 focus:ring-teal-500/20 h-10 text-sm"
                            />

                            <Input
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                icon={<Lock size={16} />}
                                endIcon={
                                    <div onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </div>
                                }
                                className="bg-slate-50 border-slate-200 focus:border-teal-500 focus:ring-teal-500/20 h-10 text-sm"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600">
                                    Remember me
                                </label>
                            </div>

                            <Link
                                href="#"
                                className="text-xs font-medium text-teal-600 hover:text-teal-500"
                            >
                                Forgot password?
                            </Link>
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

                        <Button
                            type="submit"
                            className="w-full h-10 text-sm bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/30 transition-all hover:scale-[1.02]"
                            isLoading={loading}
                        >
                            Sign In
                        </Button>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase">
                                <span className="bg-white px-2 text-slate-400">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all text-xs font-medium text-slate-700"
                            >
                                <Github size={16} />
                                GitHub
                            </button>
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all text-xs font-medium text-slate-700"
                            >
                                <Fingerprint size={16} />
                                Biometric
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-xs text-slate-500 mt-4">
                        Don't have an account?{' '}
                        <Link href="/signup" className="font-semibold text-teal-600 hover:text-teal-500 transition-colors">
                            Sign up
                        </Link>
                    </p>
                </div>

                {/* Mobile Background Decoration (Hidden on Desktop) */}
                <div className="lg:hidden absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
            </div>
        </div>
    );
}
