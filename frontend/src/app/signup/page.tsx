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
            <div className="hidden lg:flex w-1/2 relative bg-slate-900 flex-col justify-center p-12 z-0">
                {/* Simple subtle background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_70%)]" />

                <div className="relative z-10 max-w-lg mx-auto text-center">
                    <ShieldCheck className="text-indigo-400 w-12 h-12 mx-auto mb-10 opacity-50" />
                    <h2 className="text-3xl md:text-4xl font-serif text-white italic leading-relaxed mb-8">
                        "The good physician treats the disease; the great physician treats the patient who has the disease."
                    </h2>
                    <div className="h-px w-12 bg-indigo-500/50 mx-auto mb-8" />
                    <p className="text-indigo-400 font-bold text-xs tracking-[0.3em] uppercase">
                        William Osler
                    </p>
                </div>

                <div className="absolute bottom-12 right-12 text-slate-500 text-xs font-medium tracking-tight text-right">
                    Secure Patient Protocol v2.1
                </div>
            </div>
        </div>
    );
}
