"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import {
    Users,
    Mail,
    Send,
    X,
    Clock,
    CheckCircle,
    XCircle,
    ArrowLeft,
    Trash2,
    UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ManageCaregiversPage() {
    const [invitations, setInvitations] = useState<any[]>([]);
    const [caregivers, setCaregivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [invitationsRes, caregiversRes] = await Promise.all([
                api.caregiver.getInvitations(),
                // TODO: Add endpoint to get patient's caregivers
                Promise.resolve({ caregivers: [] })
            ]);
            setInvitations(invitationsRes.invitations || []);
            setCaregivers(caregiversRes.caregivers || []);
        } catch (err: any) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendInvitation = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setSending(true);

        try {
            await api.caregiver.sendInvitation({
                inviteeEmail: inviteEmail,
                personalMessage: inviteMessage || undefined
            });

            setSuccess(`Invitation sent to ${inviteEmail}!`);
            setInviteEmail('');
            setInviteMessage('');
            setShowInviteForm(false);
            fetchData();

            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.message || 'Failed to send invitation');
        } finally {
            setSending(false);
        }
    };

    const handleCancelInvitation = async (invitationId: string) => {
        if (!confirm('Are you sure you want to cancel this invitation?')) return;

        try {
            await api.caregiver.cancelInvitation(invitationId);
            setSuccess('Invitation cancelled successfully');
            fetchData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to cancel invitation');
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-yellow-50 text-yellow-700 border-yellow-300',
            accepted: 'bg-green-50 text-green-700 border-green-300',
            expired: 'bg-gray-50 text-gray-700 border-gray-300',
            cancelled: 'bg-red-50 text-red-700 border-red-300'
        };

        const icons = {
            pending: Clock,
            accepted: CheckCircle,
            expired: XCircle,
            cancelled: XCircle
        };

        const Icon = icons[status as keyof typeof icons] || Clock;

        return (
            <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border', styles[status as keyof typeof styles] || styles.pending)}>
                <Icon size={14} />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20 p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ArrowLeft size={20} className="text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Caregivers</h1>
                            <p className="text-sm text-gray-500 mt-1">Invite family or friends to monitor your health</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowInviteForm(!showInviteForm)}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <UserPlus size={16} />
                        <span className="hidden sm:inline">Invite Caregiver</span>
                    </button>
                </div>

                {/* Success/Error Messages */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                    >
                        <XCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-red-900">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                            <X size={16} />
                        </button>
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
                    >
                        <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-green-900">{success}</p>
                        </div>
                        <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-600">
                            <X size={16} />
                        </button>
                    </motion.div>
                )}

                {/* Invitation Form */}
                {showInviteForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                    >
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Mail size={20} className="text-teal-600" />
                            Send Caregiver Invitation
                        </h2>
                        <form onSubmit={handleSendInvitation} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="caregiver@example.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Personal Message (Optional)
                                </label>
                                <textarea
                                    value={inviteMessage}
                                    onChange={(e) => setInviteMessage(e.target.value)}
                                    placeholder="Add a personal note..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    {sending ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            Send Invitation
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowInviteForm(false)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Invitations List */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Users size={20} className="text-teal-600" />
                            Sent Invitations ({invitations.length})
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {invitations.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <Mail size={48} className="mx-auto mb-3 text-gray-300" />
                                <p className="text-sm">No invitations sent yet</p>
                                <p className="text-xs text-gray-400 mt-1">Click "Invite Caregiver" to get started</p>
                            </div>
                        ) : (
                            invitations.map((invitation) => (
                                <div key={invitation.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {invitation.invitee_email}
                                                </p>
                                                {getStatusBadge(invitation.status)}
                                            </div>
                                            {invitation.personal_message && (
                                                <p className="text-xs text-gray-600 italic mb-2">"{invitation.personal_message}"</p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span>Sent: {new Date(invitation.created_at).toLocaleDateString()}</span>
                                                <span>Expires: {new Date(invitation.expires_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        {invitation.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancelInvitation(invitation.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Cancel invitation"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
