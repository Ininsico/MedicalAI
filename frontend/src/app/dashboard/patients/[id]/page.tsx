"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
    Activity,
    ArrowLeft,
    FileText,
    AlertCircle,
    CheckCircle2,
    Clock,
    Pill,
    Download,
    Sparkles,
    Pencil
} from 'lucide-react';
import { cn } from '@/lib/utils';
import EditLogModal from '@/components/EditLogModal';
import ReportModal from '@/components/ReportModal';

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
    const [timeFilter, setTimeFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');

    // Edit Modal State
    const [editingLog, setEditingLog] = useState<any>(null);
    const [editFormData, setEditFormData] = useState<any>({});
    const [saving, setSaving] = useState(false);

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

    const filteredLogs = logs.filter(log => {
        if (timeFilter === 'all') return true;
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(now.getTime() - logDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (timeFilter === 'daily') return diffDays <= 1;
        if (timeFilter === 'weekly') return diffDays <= 7;
        if (timeFilter === 'monthly') return diffDays <= 30;
        return true;
    });

    const handleGenerateReport = () => {
        setGeneratingReport(true);
        setTimeout(() => {
            setReportData({
                summary: `Patient demonstrates ${adherence?.adherence_rate || 0}% medication adherence.`,
                risks: logs.some(l => (l.tremor_severity || 0) > 7) ? ["High tremor severity observed."] : ["No immediate risks."],
                recommendations: ["Continue regimen.", "Monitor sleep."],
                generatedAt: new Date().toLocaleDateString()
            });
            setGeneratingReport(false);
            setShowReport(true);
        }, 1500);
    };

    const handleDownloadPDF = () => { window.print(); };

    const handleEditLog = (log: any) => {
        setEditingLog(log);
        setEditFormData({
            mood: log.mood || 'neutral',
            tremor_severity: log.tremor_severity || 0,
            stiffness_severity: log.stiffness_severity || 0,
            sleep_hours: log.sleep_hours || 0,
            medication_taken: log.medication_taken || false,
            symptoms: log.symptoms || [],
            notes: log.notes || ''
        });
    };

    const handleSaveEdit = async () => {
        if (!editingLog) return;
        setSaving(true);
        try {
            await api.patient.updateLog(patientId, editingLog.id, {
                ...editFormData,
                date: editingLog.date
            });
            const logsRes = await api.caregiver.getPatientLogs(patientId);
            setLogs(logsRes.logs || []);
            setAdherence(logsRes.adherence_stats);
            setEditingLog(null);
        } catch (error) {
            console.error(error);
            alert("Update failed");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="text-slate-500 font-medium animate-pulse">Loading patient data...</div>
        </div>
    );

    if (!patient) return <div className="p-10 text-center">Patient not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
            <ReportModal
                isOpen={showReport}
                onClose={() => setShowReport(false)}
                reportData={reportData}
                onDownload={handleDownloadPDF}
            />

            <EditLogModal
                isOpen={!!editingLog}
                onClose={() => setEditingLog(null)}
                onSave={handleSaveEdit}
                editFormData={editFormData}
                setEditFormData={setEditFormData}
                saving={saving}
            />

            <button onClick={() => router.back()} className="flex items-center text-slate-500 hover:text-teal-700 mb-6 text-sm font-medium">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>

            <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center text-2xl font-bold border">
                        {patient.full_name?.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{patient.full_name}</h1>
                        <p className="text-sm text-slate-500">ID: {patient.id.slice(0, 8)}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                        <Download size={16} /> PDF
                    </button>
                    <button
                        onClick={handleGenerateReport}
                        disabled={generatingReport}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 disabled:opacity-50 transition-colors"
                    >
                        <Sparkles size={16} /> {generatingReport ? 'Analyzing...' : 'AI Report'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border p-6 text-left">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Activity size={18} /> Snapshot</h2>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-xl border">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Medication Adherence</p>
                                <p className="text-2xl font-bold">{adherence?.adherence_rate || 0}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-lg font-bold flex items-center gap-2"><FileText size={18} /> Medical Logs</h2>
                            <div className="flex gap-2">
                                {['all', 'daily', 'weekly'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setTimeFilter(f as any)}
                                        className={cn("px-3 py-1 text-xs font-bold rounded-lg transition-colors", timeFilter === f ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-500")}
                                    >
                                        {f.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Meds</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Vitals</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Notes</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Edit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredLogs.map((log, i) => (
                                        <tr key={i} className="hover:bg-slate-50">
                                            <td className="p-4">
                                                <div className="font-bold">{new Date(log.date).toLocaleDateString()}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold", log.medication_taken ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
                                                    {log.medication_taken ? 'Taken' : 'Missed'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="text-xs font-bold">T:{log.tremor_severity || 0} S:{log.stiffness_severity || 0}</div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-xs text-slate-600 truncate max-w-[200px]">{log.notes || '-'}</p>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleEditLog(log)} className="p-2 text-slate-400 hover:text-teal-600">
                                                    <Pencil size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
