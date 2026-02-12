"use client";

import React, { useState, Suspense } from 'react';
import { api } from '@/lib/api';
import {
    FileText,
    Download,
    Calendar,
    Activity,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
    LogOut,
    Sparkles,
    Bot,
    Copy,
    Check,
    ArrowRight
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import { useSearchParams } from 'next/navigation';

function ReportsContent() {
    const searchParams = useSearchParams();
    const patientId = searchParams.get('u');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [patientInfo, setPatientInfo] = useState<any>(null);
    const [role, setRole] = useState<'patient' | 'caregiver'>('patient');
    const [assignedPatients, setAssignedPatients] = useState<any[]>([]);

    React.useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setRole(user.role);
            if (user.role === 'caregiver') {
                api.caregiver.getDashboard().then(res => {
                    if (res && res.assignments) {
                        setAssignedPatients(res.assignments.map((a: any) => a.patient));
                    }
                });
            }
        }
    }, []);

    // AI State
    const [aiLoading, setAiLoading] = useState(false);
    const [aiReport, setAiReport] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const generateAiSummary = async () => {
        setAiLoading(true);
        setAiReport(null);
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                alert('Authentication error');
                setAiLoading(false);
                return;
            }
            const user = JSON.parse(userStr);
            let targetPatientId = user.id;

            if (user.role === 'caregiver' && patientId) {
                targetPatientId = patientId;
            }

            const res = await api.ai.generateSummary(targetPatientId);
            setAiReport(res.summary);
        } catch (err: any) {
            alert("Failed to generate AI report: " + err.message);
        } finally {
            setAiLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (aiReport) {
            navigator.clipboard.writeText(aiReport);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const generatePDF = async (targetId?: string, targetName?: string) => {
        setLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                alert("Authentication error. Please log in again.");
                setLoading(false);
                return;
            }
            const user = JSON.parse(userStr);

            let logs = [];
            let reportPatientId = targetId || user.id;
            let reportPatientName = targetName || user.full_name;
            let patientDob = "N/A";

            if (user.role === 'caregiver') {
                const pid = targetId || patientId;
                if (!pid) {
                    alert("No patient selected");
                    setLoading(false);
                    return;
                }
                const res = await api.caregiver.getPatientLogs(pid);
                logs = res.logs || [];
                setPatientInfo(res.patient);
                reportPatientId = pid;
                if (!targetName) reportPatientName = res.patient?.full_name || 'Patient';
                patientDob = res.patient?.date_of_birth || "N/A";
            } else {
                logs = await api.patient.getLogs(user.id);
                patientDob = user.date_of_birth || "N/A";
            }

            if (!logs || logs.length === 0) {
                alert("No clinical data available for report generation.");
                setLoading(false);
                return;
            }

            const doc = new jsPDF();

            // --- HEADER ---
            doc.setFillColor(15, 23, 42); // slate-900
            doc.rect(0, 0, 210, 40, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.text("NEURODYNAMIC SYSTEMS", 14, 20);

            doc.setFontSize(10);
            doc.setTextColor(203, 213, 225); // slate-300
            doc.text("CLINICAL LONGITUDINAL REPORT", 14, 30);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 130, 30);

            // --- PATIENT INFO ---
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.text("Patient Demographics", 14, 50);

            doc.setDrawColor(200);
            doc.line(14, 52, 196, 52);

            doc.setFontSize(10);
            doc.text(`Name: ${reportPatientName}`, 14, 60);
            doc.text(`ID: ${reportPatientId}`, 14, 65);
            doc.text(`DOB: ${patientDob}`, 130, 60);
            doc.text(`Total Records: ${logs.length}`, 130, 65);

            // --- VITALS SUMMARY GRID ---
            const avgTremor = (logs.reduce((a: any, b: any) => a + (b.tremor_severity || b.tremor || 0), 0) / logs.length).toFixed(1);
            const avgStiffness = (logs.reduce((a: any, b: any) => a + (b.stiffness_severity || b.stiffness || 0), 0) / logs.length).toFixed(1);
            const avgSleep = (logs.reduce((a: any, b: any) => a + (Number(b.sleep_hours) || Number(b.sleep) || 0), 0) / logs.length).toFixed(1);

            // Grid Boxes
            const drawStatBox = (x: number, label: string, value: string, color: [number, number, number]) => {
                doc.setFillColor(...color);
                doc.roundedRect(x, 75, 40, 20, 2, 2, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(8);
                doc.text(label, x + 2, 80);
                doc.setFontSize(14);
                doc.text(value, x + 2, 90);
            };

            drawStatBox(14, "AVG TREMOR", `${avgTremor}/10`, [239, 68, 68]);    // Red
            drawStatBox(60, "AVG STIFFNESS", `${avgStiffness}/10`, [249, 115, 22]); // Orange
            drawStatBox(106, "AVG SLEEP", `${avgSleep} HRS`, [59, 130, 246]);   // Blue

            // --- DETAILED CLINICAL LOGS ---
            doc.setTextColor(0);
            doc.setFontSize(12);
            doc.text("Detailed Clinical Logs", 14, 110);

            // Detailed Columns mapping
            const tableBody = logs.map((log: any) => {
                const symptomsText = (log.symptoms && Array.isArray(log.symptoms) && log.symptoms.length > 0)
                    ? log.symptoms.join(', ')
                    : '-';

                const notesText = [
                    log.notes ? `Note: ${log.notes}` : '',
                    log.medication_notes ? `Meds: ${log.medication_notes}` : '',
                    log.food_intake ? `Diet: ${log.food_intake}` : ''
                ].filter(Boolean).join('\n');

                return [
                    new Date(log.date || log.logged_at).toLocaleDateString(),
                    log.mood || '-',
                    log.tremor_severity || '0',
                    log.stiffness_severity || '0',
                    log.sleep_hours || '0',
                    log.activity_level || '-',
                    log.medication_taken ? 'Yes' : 'No',
                    symptomsText,
                    notesText || '-'
                ];
            });

            autoTable(doc, {
                startY: 115,
                head: [['Date', 'Mood', 'Tremor', 'Rigidity', 'Sleep', 'Activity', 'Meds', 'Symptoms', 'Clinical Notes']],
                body: tableBody,
                headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8 },
                bodyStyles: { fontSize: 8 },
                columnStyles: {
                    0: { cellWidth: 20 },
                    1: { cellWidth: 15 },
                    2: { cellWidth: 12 },
                    3: { cellWidth: 12 },
                    4: { cellWidth: 12 },
                    5: { cellWidth: 15 },
                    6: { cellWidth: 10 },
                    7: { cellWidth: 35 },
                },
                alternateRowStyles: { fillColor: [241, 245, 249] },
            });

            // --- AI ANALYSIS SECTION (ONLY FOR PATIENTS) ---
            if (aiReport && user.role !== 'caregiver') {
                doc.addPage();
                doc.setFillColor(124, 58, 237); // Purple
                doc.rect(0, 0, 210, 30, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(16);
                doc.text("Advanced Clinical Analysis", 14, 20);
                doc.setTextColor(0);
                doc.setFontSize(10);
                const cleanText = aiReport
                    .replace(/\*\*/g, '')
                    .replace(/##/g, '')
                    .replace(/-/g, '•');
                const splitText = doc.splitTextToSize(cleanText, 180);
                doc.text(splitText, 14, 45);
            }

            const pageCount = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text("NEURODYNAMIC SYSTEMS - CLINICAL RECORD", 14, 285);
                doc.text(`Pages ${i} of ${pageCount}`, 180, 285);
            }

            doc.save(`SSI_FullRecord_${reportPatientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
            setSuccess(true);
            setLoading(false);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            console.error("PDF generation failed:", err);
            if (err.message === 'Request timeout') {
                alert("Report generation is taking longer than expected. Please check your connection and try again.");
            } else {
                alert("Failed to generate report: " + err.message);
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-widest mb-2">
                            <Sparkles size={14} />
                            <span>Clinical Intelligence</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            Reports & Analysis
                        </h1>
                        <p className="mt-2 text-slate-500 max-w-2xl">
                            Generate comprehensive clinical PDF reports and leverage AI to uncover hidden patterns in your health data.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: PDF Reports */}
                    <div className="lg:col-span-4 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden"
                        >
                            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <FileText size={18} className="text-teal-600" />
                                    Export Records
                                </h3>
                                <div className="px-2 py-1 bg-teal-100 text-teal-700 text-[10px] font-bold uppercase rounded-full tracking-wide">
                                    PDF Format
                                </div>
                            </div>

                            <div className="p-6">
                                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                                    Download a high-fidelity clinical report containing your longitudinal symptom data, medication adherence records, and daily check-in logs.
                                </p>

                                <button
                                    onClick={() => generatePDF()}
                                    disabled={loading}
                                    className={cn(
                                        "w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all duration-300",
                                        success
                                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                                            : "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30",
                                        loading && "opacity-70 cursor-not-allowed"
                                    )}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : success ? (
                                        <>
                                            <CheckCircle2 size={20} />
                                            <span>Report Downloaded</span>
                                        </>
                                    ) : (
                                        <>
                                            <Download size={20} />
                                            <span>Generate Official Report</span>
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-center text-slate-400 mt-4">
                                    Format accepted by most clinics and specialists.
                                </p>
                            </div>
                        </motion.div>

                        {/* Additional Info Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl p-6 text-white shadow-lg shadow-teal-500/20"
                        >
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                                <ShieldCheck size={24} className="text-white" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Secure & Private</h3>
                            <p className="text-teal-50 text-sm leading-relaxed opacity-90">
                                Your reports are generated locally and securely. No sensitive medical data is shared with third parties without your explicit consent.
                            </p>
                        </motion.div>
                    </div>

                    {/* Right Column: AI Analysis */}
                    <div className="lg:col-span-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col min-h-[600px]"
                        >
                            {/* AI Header */}
                            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-white">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Bot size={20} className="text-teal-600" />
                                        <h3 className="font-bold text-slate-900">Dr. AI Analysis</h3>
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        Advanced pattern recognition & symptom correlation
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {aiReport && (
                                        <button
                                            onClick={copyToClipboard}
                                            className="p-2.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
                                            title="Copy Analysis"
                                        >
                                            {copied ? <Check size={20} /> : <Copy size={20} />}
                                        </button>
                                    )}
                                    <button
                                        onClick={generateAiSummary}
                                        disabled={aiLoading}
                                        className={cn(
                                            "px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-teal-600/20 flex items-center gap-2",
                                            aiLoading && "opacity-70 cursor-wait"
                                        )}
                                    >
                                        {aiLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={18} />
                                                New Analysis
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* AI Content Area */}
                            <div className="flex-1 bg-slate-50/50 p-6 relative">
                                <AnimatePresence mode="wait">
                                    {!aiReport && !aiLoading ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
                                        >
                                            <div className="w-24 h-24 bg-white rounded-full shadow-xl shadow-slate-200/60 flex items-center justify-center mb-6">
                                                <Activity size={40} className="text-teal-500" />
                                            </div>
                                            <h4 className="text-xl font-bold text-slate-900 mb-2">
                                                Ready to Analyze
                                            </h4>
                                            <p className="text-slate-500 max-w-md">
                                                Click "New Analysis" to have our AI review your recent logs, identify trends, and provide personalized insights.
                                            </p>
                                        </motion.div>
                                    ) : aiLoading ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 flex flex-col items-center justify-center p-8"
                                        >
                                            <div className="relative w-24 h-24 mb-8">
                                                <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
                                                <div className="absolute inset-0 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Bot size={32} className="text-teal-600 animate-pulse" />
                                                </div>
                                            </div>
                                            <h4 className="text-lg font-bold text-slate-900 animate-pulse">
                                                Processing Clinical Data...
                                            </h4>
                                            <div className="space-y-2 mt-4 w-64">
                                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-teal-500 animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '50%' }} />
                                                </div>
                                                <div className="flex justify-between text-xs text-slate-400 font-medium">
                                                    <span>Analyzing Symptoms</span>
                                                    <span>Correlating Meds</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="prose prose-slate prose-lg max-w-none bg-white rounded-2xl p-8 shadow-sm border border-slate-200/50"
                                        >
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {aiReport}
                                            </ReactMarkdown>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ReportsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
                <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <ReportsContent />
        </Suspense>
    );
}
