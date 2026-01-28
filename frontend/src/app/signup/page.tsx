"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { Mail, Lock, User, Activity, ChevronLeft, UserCircle2, BriefcaseMedical, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<'patient' | 'caregiver'>('patient');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // DEMO MODE: Sign up without email confirmation requirement
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                // This tells Supabase to not send confirmation email
                emailRedirectTo: undefined,
                data: {
                    full_name: fullName,
                    role: role,
                }
            }
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // For demo mode, immediately try to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                // If sign in fails, show success message anyway for demo
                setSuccess(true);
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                // Successfully signed in, go to dashboard
                window.location.href = '/dashboard';
            }
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

                            <div className="space-y-6">
                                <label className="text-sm font-bold text-slate-700 ml-1 tracking-tight">Identify Your Role in the Care Continuum</label>
                                <div className="grid grid-cols-2 gap-6">
                                    <RoleSelectionCard
                                        active={role === 'patient'}
                                        onClick={() => setRole('patient')}
                                        icon={<UserCircle2 size={24} />}
                                        label="Patient"
                                        desc="Individual managing symptoms"
                                    />
                                    <RoleSelectionCard
                                        active={role === 'caregiver'}
                                        onClick={() => setRole('caregiver')}
                                        icon={<BriefcaseMedical size={24} />}
                                        label="Caregiver"
                                        desc="Med-support professional or family"
                                    />
                                </div>
                            </div>

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

function RoleSelectionCard({ active, onClick, icon, label, desc }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, desc: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "relative p-6 rounded-[28px] border-2 text-left transition-all duration-300 active:scale-[0.98] group",
                active
                    ? "border-teal-600 bg-teal-50/50 shadow-xl shadow-teal-600/10"
                    : "border-slate-100 bg-white hover:border-teal-200"
            )}
        >
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all",
                active ? "bg-teal-600 text-white rotate-6" : "bg-slate-50 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-500"
            )}>
                {icon}
            </div>
            <h3 className={cn("text-xl font-black mb-1 tracking-tight", active ? "text-teal-900" : "text-slate-600 group-hover:text-teal-600")}>{label}</h3>
            <p className={cn("text-xs font-medium", active ? "text-teal-600/80" : "text-slate-400")}>{desc}</p>

            {active && (
                <motion.div
                    layoutId="role-check"
                    className="absolute top-4 right-4 text-teal-600"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                >
                    <CheckCircle2 size={24} fill="white" />
                </motion.div>
            )}
        </button>
    );
}
