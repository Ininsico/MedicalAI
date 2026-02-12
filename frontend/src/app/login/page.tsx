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
            <div className="hidden lg:flex w-1/2 relative bg-slate-900 flex-col justify-center p-12 z-0">
                {/* Simple subtle background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.05),transparent_70%)]" />

                <div className="relative z-10 max-w-lg mx-auto text-center">
                    <Activity className="text-teal-500 w-12 h-12 mx-auto mb-10 opacity-50" />
                    <h2 className="text-3xl md:text-4xl font-serif text-white italic leading-relaxed mb-8">
                        "Wherever the art of Medicine is loved, there is also a love of Humanity."
                    </h2>
                    <div className="h-px w-12 bg-teal-500/50 mx-auto mb-8" />
                    <p className="text-teal-500 font-bold text-xs tracking-[0.3em] uppercase">
                        Hippocrates
                    </p>
                </div>

                <div className="absolute bottom-12 left-12 text-slate-500 text-xs font-medium tracking-tight">
                    Medical Intelligence Systems v4.0
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




                    </form>

                    <p className="text-center text-xs text-slate-500 mt-4">
                        Don't have an account?{' '}
                        <Link href="/signup" className="font-semibold text-teal-600 hover:text-teal-500 transition-colors">
                            Sign up
                        </Link>
                    </p>
                </div>


            </div>
        </div>
    );
}
