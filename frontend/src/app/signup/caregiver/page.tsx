"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Mail, Lock, User, Activity, ChevronLeft, CheckCircle2, ArrowRight, ShieldCheck, Eye, EyeOff, Loader2, HeartHandshake } from 'lucide-react';

function CaregiverSignupForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');

    const [verifying, setVerifying] = useState(true);
    const [invitationData, setInvitationData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('No invitation token provided');
            setVerifying(false);
            return;
        }

        const verifyToken = async () => {
            try {
                // Determine API URL based on environment
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://medical-ai-uh9j-backend.vercel.app';

                const response = await fetch(`${apiUrl}/api/caregiver/verify-invitation/${token}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Invalid invitation');
                }

                setInvitationData(data.invitation);
                setEmail(data.invitation.invitee_email);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setVerifying(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://medical-ai-uh9j-backend.vercel.app';
            const response = await fetch(`${apiUrl}/api/caregiver/accept-invitation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    email,
                    password,
                    full_name: fullName,
                    phone
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            // Successfully accepted, now login
            const loginRes = await api.auth.login({ email, password });
            localStorage.setItem('token', loginRes.token);
            localStorage.setItem('user', JSON.stringify(loginRes.user));

            setSuccess(true);
            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Verifying invitation...</p>
            </div>
        );
    }

    if (error && !invitationData) {
        return (
            <Card className="max-w-md w-full p-8 text-center space-y-6 border-slate-100 shadow-xl shadow-slate-100/50">
                <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <Activity className="text-red-500 h-8 w-8" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Invalid Invitation</h2>
                    <p className="text-slate-500 mt-2">{error}</p>
                </div>
                <Button
                    onClick={() => router.push('/')}
                    className="w-full bg-slate-900 hover:bg-slate-800"
                >
                    Back to Home
                </Button>
            </Card>
        );
    }

    return (
        <form onSubmit={handleSignup} className="space-y-4">
            <div className="bg-indigo-50 text-indigo-700 px-4 py-3 rounded-xl flex items-center gap-3 border border-indigo-100 mb-6">
                <HeartHandshake className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium leading-tight">
                    Invitation for <span className="font-bold underline decoration-indigo-300 decoration-2 underline-offset-2 capitalize">{invitationData?.patient_name}</span> has been confirmed.
                </p>
            </div>

            <Input
                label="Full Name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                icon={<User size={16} />}
                className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 h-11 text-slate-900"
            />

            <Input
                label="Email Address"
                type="email"
                disabled
                value={email}
                placeholder="Email"
                icon={<Mail size={16} />}
                className="bg-slate-100 border-slate-200 text-slate-500 h-11 cursor-not-allowed"
            />

            <Input
                label="Phone Number"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                icon={<User size={16} />}
                className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 h-11 text-slate-900"
            />

            <div className="space-y-1">
                <Input
                    label="Create Password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    icon={<Lock size={16} />}
                    endIcon={
                        <div onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </div>
                    }
                    className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 h-11 text-slate-900"
                />
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm"
                >
                    <Activity className="h-4 w-4 shrink-0" />
                    {error}
                </motion.div>
            )}

            {success && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-xl bg-green-50 border border-green-100 flex items-center gap-3 text-green-600 text-sm font-medium"
                >
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Registration complete! Redirecting to dashboard...
                </motion.div>
            )}

            <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
                isLoading={loading}
            >
                Complete Registration <ArrowRight size={18} className="ml-2" />
            </Button>
        </form>
    );
}

export default function CaregiverSignupPage() {
    return (
        <div className="min-h-screen w-full flex bg-white font-sans selection:bg-indigo-100 italic-none">
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative bg-white p-6 lg:p-12 overflow-y-auto">
                <div className="w-full max-w-sm space-y-8 my-8">
                    <div className="space-y-4">
                        <Link
                            href="/"
                            className="inline-flex items-center text-slate-400 hover:text-indigo-600 transition-all text-xs font-bold uppercase tracking-wider group"
                        >
                            <ChevronLeft size={14} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </Link>

                        <div className="space-y-1">
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 font-sans">Join as <span className="text-indigo-600">Caregiver</span></h1>
                            <p className="text-sm font-medium text-slate-500">
                                Secure patient protocols and symptom intelligence.
                            </p>
                        </div>
                    </div>

                    <Suspense fallback={
                        <div className="flex flex-col items-center justify-center p-12">
                            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
                            <p className="text-slate-500 font-medium">Initializing secure form...</p>
                        </div>
                    }>
                        <CaregiverSignupForm />
                    </Suspense>
                </div>
            </div>

            <div className="hidden lg:flex w-1/2 relative bg-slate-900 flex-col justify-center p-16 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_70%)]" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[120px] rounded-full -mr-32 -mt-32" />

                <div className="relative z-10 max-w-lg">
                    <div className="w-12 h-1.5 bg-indigo-500 mb-10 rounded-full" />
                    <h2 className="text-4xl lg:text-5xl font-serif text-white italic leading-tight mb-10 selection:bg-indigo-500">
                        "To care for those who once cared for us is one of the highest honors."
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed mb-12 font-medium">
                        Welcome to the Symptom Intelligence platform. We provide tools that help you monitor and support your patient's journey with data-driven insights.
                    </p>

                    <div className="flex items-center gap-5 text-slate-300 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <div className="bg-indigo-500/20 p-3 rounded-xl border border-indigo-500/20">
                            <ShieldCheck className="text-indigo-400 h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-bold text-sm tracking-wide uppercase text-white">Secure & Private</p>
                            <p className="text-slate-500 text-xs mt-0.5 font-medium">Fully encrypted end-to-end patient-caregiver protocol.</p>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-12 left-16 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-slate-600 text-[10px] font-mono tracking-widest uppercase font-bold">
                        Integration Module v3.0 // ACTIVE
                    </span>
                </div>
            </div>
        </div>
    );
}
