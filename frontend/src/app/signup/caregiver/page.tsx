"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Mail, Lock, User, Activity, ChevronLeft, CheckCircle2, ArrowRight, ShieldCheck, Eye, EyeOff, Loader2, HeartHandshake } from 'lucide-react';

export default function CaregiverSignupPage() {
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
                // We need to add this endpoint to the api lib or use a direct call
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/caregiver/verify-invitation/${token}`);
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/caregiver/accept-invitation`, {
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
            <div className="h-screen w-full flex items-center justify-center bg-white">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mx-auto" />
                    <p className="text-slate-500 font-medium">Verifying invitation...</p>
                </div>
            </div>
        );
    }

    if (error && !invitationData) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-white">
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
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex overflow-hidden bg-white">
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative bg-white p-6 lg:p-12 overflow-hidden overflow-y-auto">
                <div className="w-full max-w-sm space-y-8 my-8">
                    <div className="space-y-4">
                        <Link
                            href="/"
                            className="inline-flex items-center text-slate-400 hover:text-slate-900 transition-colors text-xs font-medium"
                        >
                            <ChevronLeft size={14} className="mr-1" />
                            Back to Home
                        </Link>

                        <div className="bg-indigo-50 text-indigo-700 px-4 py-3 rounded-xl flex items-center gap-3 border border-indigo-100">
                            <HeartHandshake className="h-5 w-5 shrink-0" />
                            <p className="text-sm font-medium leading-tight">
                                Invitation for <span className="font-bold underlineDecoration-indigo-300 decoration-2 underline-offset-2 capitalize">{invitationData?.patient_name}</span> has been confirmed.
                            </p>
                        </div>

                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Join as Caregiver</h1>
                            <p className="text-sm text-slate-500">
                                Create your caregiver account to start supporting your patient.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <Input
                            label="Full Name"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Your full name"
                            icon={<User size={16} />}
                            className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 h-11"
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
                            className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 h-11"
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
                                className="bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 h-11"
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
                </div>
            </div>

            <div className="hidden lg:flex w-1/2 relative bg-slate-900 flex-col justify-center p-16">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.1),transparent_70%)]" />

                <div className="relative z-10 max-w-lg">
                    <div className="w-12 h-1 bg-indigo-500 mb-8 rounded-full" />
                    <h2 className="text-4xl lg:text-5xl font-serif text-white italic leading-tight mb-10">
                        "To care for those who once cared for us is one of the highest honors."
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed mb-12">
                        Welcome to the Symptom Intelligence platform. We provide tools that help you monitor and support your patient's journey with data-driven insights.
                    </p>

                    <div className="flex items-center gap-4 text-slate-300">
                        <div className="bg-slate-800 p-3 rounded-full">
                            <ShieldCheck className="text-indigo-400 h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-bold text-sm tracking-wide uppercase">Secure & Private</p>
                            <p className="text-slate-500 text-xs mt-0.5 font-medium">Fully encrypted patient-caregiver protocol.</p>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-12 left-16 text-slate-600 text-[10px] font-mono tracking-widest uppercase">
                    Caregiver Integration Module v3.0 // Ready
                </div>
            </div>
        </div>
    );
}
