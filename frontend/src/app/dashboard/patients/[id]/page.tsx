"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
    Activity,
    ArrowLeft,
    FileText,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Clock,
    Calendar,
    Pill,
    Download,
    Cpu,
    Sparkles,
    ChevronDown,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function PatientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const patientId = params.id as string;

    const [patient, setPatient] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [adherence, setAdherence] = useState<any>(null);

    // AI Report State
    const [generatingReport, setGeneratingReport] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    useEffect(() => {
        async function fetchDetails() {
            try {
                const [detailsRes, logsRes] = await Promise.all([
                    api.caregiver.getPatientDetails(patientId),
                    api.caregiver.getPatientLogs(patientId)
                ]);

                setPatient(detailsRes);
                setLogs(logsRes.logs || []);
                setAdherence(logsRes.adherence_stats);
            } catch (error) {
                console.error("Failed to fetch patient details:", error);
            } finally {
                setLoading(false);
            }
        }
        if (patientId) fetchDetails();
    }, [patientId]);

    const handleGenerateReport = () => {
        setGeneratingReport(true);
        // Simulate AI Analysis
        setTimeout(() => {
            setReportData({
                summary: `Patient demonstrates ${adherence?.adherence_rate || 0}% medication adherence. Recent logs indicate ${logs.filter(l => l.mood === 'bad').length > 0 ? 'fluctuating' : 'stable'} mood patterns.`,
                risks: logs.some(l => (l.tremor_severity || 0) > 7) ? ["High tremor severity observed in recent logs.", "Potential risk of fall."] : ["No immediate high-risk markers identified."],
                recommendations: [
                    "Continue current medication regimen.",
                    "Monitor sleep patterns for consistency.",
                    "Schedule follow-up check-in next week."
                ],
                generatedAt: new Date().toLocaleDateString()
            });
            setGeneratingReport(false);
            setShowReport(true);
        }, 2000);
    };

    const handleDownloadPDF = () => {
        window.print();
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
                <p className="text-slate-500 font-medium tracking-wide">Accessing Medical Records...</p>
            </div>
        </div>
    );

    if (!patient) return null;

    // Data Cleaning
    const age = patient.date_of_birth ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : null;
    const isValidAge = age && age > 0 && age < 120;

    // Derived Alerts
    const missedMeds = logs.filter(l => l.medication_taken === false).length;
    const badMoods = logs.filter(l => l.mood === 'bad').length;
    const hasAlerts = missedMeds > 0 || badMoods > 0;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900 print:bg-white print:p-0">
            {/* Report Overlay */}
            <AnimatePresence>
                {showReport && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 print:relative print:inset-auto print:bg-transparent print:block"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto print:shadow-none print:w-full print:max-w-none print:h-auto"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-start print:hidden">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                        <Sparkles className="text-teal-600" size={24} />
                                        AI Clinical Analysis
                                    </h2>
                                    <p className="text-slate-500 mt-1">Generated based on recent longitudinal data</p>
                                </div>
                                <button onClick={() => setShowReport(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Printable Report Header */}
                            <div className="hidden print:block p-8 border-b border-slate-900 mb-8">
                                <h1 className="text-3xl font-bold mb-2">MedicalAI Clinical Report</h1>
                                <p>Generated on {new Date().toLocaleDateString()}</p>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="p-6 bg-teal-50 rounded-xl border border-teal-100">
                                    <h3 className="font-bold text-teal-800 mb-2 flex items-center gap-2">
                                        <Cpu size={18} /> Executive Summary
                                    </h3>
                                    <p className="text-teal-900 leading-relaxed">{reportData.summary}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <AlertCircle size={18} className="text-rose-500" /> Risk Factors
                                        </h3>
                                        <ul className="space-y-3">
                                            {reportData.risks.map((r: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5" />
                                                    {r}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <CheckCircle2 size={18} className="text-emerald-500" /> Recommendations
                                        </h3>
                                        <ul className="space-y-3">
                                            {reportData.recommendations.map((r: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" />
                                                    {r}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 print:hidden">
                                <button onClick={() => setShowReport(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-200 rounded-lg transition-colors">Close</button>
                                <button onClick={handleDownloadPDF} className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg">
                                    <Download size={18} /> Download PDF
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation */}
            <button
                onClick={() => router.back()}
                className="flex items-center text-slate-500 hover:text-teal-700 transition-colors mb-6 font-medium text-sm print:hidden"
            >
                <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
            </button>

            {/* Header / Identity */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:border-none print:shadow-none print:p-0">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center text-3xl font-bold border border-teal-100 shadow-inner print:hidden">
                        {patient.full_name?.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{patient.full_name}</h1>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 font-medium">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">ID: {patient.id.slice(0, 8)}</span>
                            {isValidAge && <span>{age} yrs</span>}
                            {patient.gender && <span>{patient.gender}</span>}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 print:hidden">
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Download size={18} />
                        <span>Download PDF</span>
                    </button>
                    <button
                        onClick={handleGenerateReport}
                        disabled={generatingReport}
                        className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-md shadow-teal-200 hover:shadow-lg disabled:opacity-75 disabled:cursor-wait"
                    >
                        {generatingReport ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Sparkles size={18} />
                        )}
                        <span>{generatingReport ? 'Analyzing...' : 'AI Report'}</span>
                    </button>
                </div>
            </div>

            {/* Alerts Banner */}
            {hasAlerts && (
                <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
                    <AlertCircle className="text-rose-600 mt-0.5" size={20} />
                    <div>
                        <h3 className="text-rose-700 font-bold mb-1">Attention Required</h3>
                        <p className="text-rose-600 text-sm">
                            Recent monitoring indicates inconsistencies in medication or mood. Review logs below.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="space-y-8 print:hidden">
                    {/* Adherence Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Activity size={20} className="text-teal-600" />
                            Clinical Snapshot
                        </h2>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Medication Adherence</p>
                                    <p className="text-2xl font-bold text-slate-900">{adherence?.adherence_rate || 0}%</p>
                                </div>
                                <div className={cn(
                                    "p-3 rounded-full",
                                    (adherence?.adherence_rate || 0) > 80 ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                                )}>
                                    <Pill size={24} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Overall Status</p>
                                    <p className="text-lg font-bold text-slate-900">
                                        {(adherence?.adherence_rate || 0) > 80 ? 'Stable' : 'Needs Review'}
                                    </p>
                                </div>
                                {(adherence?.adherence_rate || 0) > 80 ? (
                                    <CheckCircle2 size={32} className="text-emerald-500" />
                                ) : (
                                    <AlertCircle size={32} className="text-amber-500" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Clinical Notes */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-800">Clinical Notes</h2>
                            <button className="text-sm font-semibold text-teal-700 hover:text-teal-800">Edit</button>
                        </div>
                        <div className="prose prose-sm text-slate-600 bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">
                            {patient.clinical_notes ? (
                                <p>{patient.clinical_notes}</p>
                            ) : (
                                <p className="italic text-slate-400">No clinical notes recorded.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Historical Data */}
                <div className="lg:col-span-2 print:col-span-3">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Calendar size={20} className="text-teal-600" />
                                Medical Logs
                            </h2>
                            <div className="flex gap-2 print:hidden">
                                <select className="text-sm border-slate-200 border rounded-lg px-3 py-1.5 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500">
                                    <option>Viewing: All Time</option>
                                    <option>Last 30 Days</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                        <th className="py-4 px-6 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Medication</th>
                                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Symptoms</th>
                                        <th className="py-4 px-6 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Vitals (T/S)</th>
                                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Mood</th>
                                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-16 text-center text-slate-400">No logs recorded yet.</td>
                                        </tr>
                                    ) : (
                                        logs.map((log, i) => (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors group">
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-slate-900">{new Date(log.date).toLocaleDateString()}</div>
                                                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                                        <Clock size={10} />
                                                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    {log.medication_taken ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                                                            <CheckCircle2 size={12} /> Taken
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100">
                                                            <AlertCircle size={12} /> Missed
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {log.symptoms && log.symptoms.length > 0 ? (
                                                            log.symptoms.map((s: string, idx: number) => (
                                                                <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wide rounded border border-slate-200">
                                                                    {s}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-slate-300 text-xs italic">-</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="flex flex-col items-center">
                                                            <span className={cn(
                                                                "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border",
                                                                (log.tremor_severity || 0) > 5 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-teal-50 text-teal-700 border-teal-200"
                                                            )}>{log.tremor_severity || 0}</span>
                                                            <span className="text-[10px] text-slate-400 mt-1 font-medium">Tremor</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs bg-slate-50 text-slate-700 border border-slate-200">{log.stiffness_severity || 0}</span>
                                                            <span className="text-[10px] text-slate-400 mt-1 font-medium">Stiff</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="font-bold text-xs uppercase text-slate-700">{log.mood}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2" title={log.notes}>
                                                        {log.notes || <span className="text-slate-300 italic">No notes</span>}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
