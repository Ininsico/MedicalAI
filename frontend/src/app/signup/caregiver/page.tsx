"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    XCircle,
    Loader,
    Eye,
    EyeOff,
    User,
    Mail,
    Lock,
    Phone,
    Heart
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function CaregiverSignupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [verifying, setVerifying] = useState(true);
    const [invitation, setInvitation] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        phone: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (token) {
            verifyToken();
        } else {
            setError('Invalid invitation link');
            setVerifying(false);
        }
    }, [token]);

    const verifyToken = async () => {
        try {
            setVerifying(true);
            const response = await api.caregiver.verifyInvitation(token!);
            setInvitation(response.invitation);
            setFormData(prev => ({ ...prev, email: response.invitation.invitee_email }));
        } catch (err: any) {
            setError(err.message || 'Invalid or expired invitation');
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        try {
            setSubmitting(true);
            await api.caregiver.acceptInvitation({
                token: token!,
                email: formData.email,
                password: formData.password,
                full_name: formData.full_name,
                phone: formData.phone || undefined
            });

            setSuccess(true);
            setTimeout(() => {
                router.push('/login?message=Account created successfully! Please log in.');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to create account');
        } finally {
            setSubmitting(false);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Verifying invitation...</p>
                </div>
            </div>
        );
    }

    if (error && !invitation) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
                >
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle size={32} className="text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link
                        href="/login"
                        className="inline-block px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Go to Login
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
                >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
                    <p className="text-gray-600 mb-2">You're now a caregiver for {invitation.patient_name}</p>
                    <p className="text-sm text-gray-500">Redirecting to login...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-8 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart size={32} />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Caregiver Invitation</h1>
                    <p className="text-teal-100 text-sm">
                        You've been invited by <strong>{invitation?.patient_name}</strong>
                    </p>
                </div>

                {/* Personal Message */}
                {invitation?.personal_message && (
                    <div className="bg-teal-50 border-l-4 border-teal-600 p-4 m-6">
                        <p className="text-sm text-gray-700 italic">"{invitation.personal_message}"</p>
                        <p className="text-xs text-gray-500 mt-2">- {invitation.patient_name}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <XCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-900">{error}</p>
                        </div>
                    )}

                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                        </label>
                        <div className="relative">
                            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                        </label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                required
                                disabled
                                value={formData.email}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">This email is pre-filled from your invitation</p>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number (Optional)
                        </label>
                        <div className="relative">
                            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password *
                        </label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password *
                        </label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                        {submitting ? (
                            <>
                                <Loader size={20} className="animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            <>
                                Create Account
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-gray-500">
                        Already have an account?{' '}
                        <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                            Log in
                        </Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
}

export default function CaregiverSignupPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <CaregiverSignupContent />
        </Suspense>
    );
}
