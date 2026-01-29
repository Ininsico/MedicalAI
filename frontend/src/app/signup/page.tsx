"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { Mail, Lock, User, Activity, ChevronLeft, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const role = 'patient';
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

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
        <div className="min-h-screen bg-mesh-premium flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1/3 h-full bg-teal-500/5 skew-x-12 -translate-x-1/2" />

            <div className="p-12 relative z-10 lg:pl-32">
                <Link href="/" className="inline-flex items-center text-slate-400 hover:text-teal-600 font-bold text-sm tracking-widest uppercase transition-colors group">
                    <ChevronLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Portal
                </Link>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 relative z-10 pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-2xl"
                >
                    <Card className="p-12 border-white border-2" hover={false}>
                        <div className="flex flex-col items-center text-center mb-12">
                            <div className="w-16 h-16 bg-teal-600 rounded-[24px] mb-8 flex items-center justify-center shadow-2xl shadow-teal-600/30">
                                <Activity size={32} className="text-white" />
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Provision Account</h1>
                            <p className="text-slate-500 font-medium">Join our precision health monitoring network.</p>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Legal Full Name"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Jane R. Doe"
                                    icon={<User size={20} />}
                                />
                                <Input
                                    label="Verified Email Address"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@health.com"
                                    icon={<Mail size={20} />}
                                />
                            </div>

                            <Input
                                label="Secure Access Key (Password)"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Upper/Lower/Symbol Case"
                                icon={<Lock size={20} />}
                            />


                            {error && (
                                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 text-sm font-bold">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full py-6 text-xl rounded-[24px]" isLoading={loading} variant="primary">
                                Initialize Provisioning
                            </Button>
                        </form>

                        <p className="mt-12 text-center text-slate-400 font-bold text-sm tracking-tight text-slate-500">
                            BY INITIALIZING, YOU AGREE TO OUR <span className="text-teal-600 cursor-pointer">NEURO-ETHICS PROTOCOL</span>. <br />
                            ALREADY REGISTERED? <Link href="/login" className="text-teal-600 hover:text-teal-700 underline underline-offset-4 decoration-2">AUTHENTICATE</Link>
                        </p>
                    </Card>
                </motion.div>
            </div>

            <div className="absolute bottom-8 right-8 flex items-center space-x-4 opacity-50 grayscale hover:grayscale-0 transition-grayscale">
                <span className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase">Security Verified</span>
                <div className="flex space-x-2">
                    {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-teal-500" />)}
                </div>
            </div>
        </div>
    );
}

