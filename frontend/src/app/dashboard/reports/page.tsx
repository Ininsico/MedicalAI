
"use client";

import React, { useState, Suspense } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FileText, Download, Calendar, Activity, CheckCircle2, AlertCircle, ShieldCheck, LogOut } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
                // If a specific target ID is passed (from list), use it.
                // Otherwise check URL param.
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
                    0: { cellWidth: 20 }, // Date
                    1: { cellWidth: 15 }, // Mood
                    2: { cellWidth: 12 }, // Tremor
                    3: { cellWidth: 12 }, // Rigidity
                    4: { cellWidth: 12 }, // Sleep
                    5: { cellWidth: 15 }, // Activity
                    6: { cellWidth: 10 }, // Meds
                    7: { cellWidth: 35 }, // Symptoms
                    // 8: Notes takes remaining space
                },
                alternateRowStyles: { fillColor: [241, 245, 249] },
            });

            // --- AI ANALYSIS SECTION (ONLY FOR PATIENTS) ---
            if (aiReport && user.role !== 'caregiver') {
                doc.addPage();

                // AI Header
                doc.setFillColor(124, 58, 237); // Purple
                doc.rect(0, 0, 210, 30, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(16);
                doc.text("Advanced Clinical Analysis", 14, 20);

                doc.setTextColor(0);
                doc.setFontSize(10);

                // Clean and split text
                const cleanText = aiReport
                    .replace(/\*\*/g, '')
                    .replace(/##/g, '')
                    .replace(/-/g, '•');

                const splitText = doc.splitTextToSize(cleanText, 180);
                doc.text(splitText, 14, 45);
            }

            // Footer
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
        <div className="space-y-12 pb-24">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-3 text-teal-600 font-black text-xs uppercase tracking-[0.3em] mb-3">
                        <FileText size={14} />
                        <span>Clinical Export Module</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                        {patientId && patientInfo ? patientInfo.full_name : (role === 'caregiver' ? 'Patient Repository' : 'Analytical')} <span className="text-slate-400 italic font-serif font-light">{patientId && patientInfo ? 'Report' : 'Reports'}</span>
                    </h1>
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            window.location.href = '/login';
                        }}
                        className="p-4 bg-white/50 border border-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl shadow-premium backdrop-blur-xl transition-all group"
                        title="End Session"
                    >
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                    </button>
                </div>
            </header>

            {role === 'caregiver' ? (
                <div className="grid grid-cols-1 gap-6">
                    <Card className="p-0 overflow-hidden border-slate-100" hover={false}>
                        <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                            <h3 className="text-xl font-black text-slate-900">Enrolled Patient Reports</h3>
                            <p className="text-slate-500 text-sm mt-1">Select a patient to generate and download their full clinical history PDF.</p>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {assignedPatients.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 font-medium">No patients found.</div>
                            ) : (
                                assignedPatients.map((patient: any) => (
                                    <div key={patient.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center font-black text-slate-500">
                                                {patient.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{patient.full_name}</div>
                                                <div className="text-xs text-slate-400 font-mono uppercase tracking-widest">ID: {patient.id.slice(0, 8)}</div>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => generatePDF(patient.id, patient.full_name)}
                                            variant="outline"
                                            className="border-slate-200 hover:bg-white hover:border-teal-500 text-slate-600 hover:text-teal-600"
                                            isLoading={loading}
                                        >
                                            <Download size={16} className="mr-2" /> Download Record
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            ) : (
                <>
                    {/* AI Report Section */}
                    <Card className="p-0 border border-slate-100 overflow-hidden bg-white shadow-xl relative">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 blur-[100px] rounded-full" />
                        <div className="relative z-10 p-10">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-8">
                                <div>
                                    <div className="flex items-center space-x-3 text-teal-600 font-bold text-xs uppercase tracking-[0.2em] mb-3">
                                        <Activity size={16} />
                                        <span>ParkTrack AI</span>
                                    </div>
                                    <h2 className="text-3xl font-black tracking-tight text-slate-900">Advanced Clinical Insight Engine</h2>
                                    <p className="text-slate-500 mt-2 max-w-2xl">
                                        Leverage our advanced custom AI engine to analyze historical patient data, identifying subtle correlations between tremor, stiffness, sleep, mood, and medication adherence that may be missed by standard reviews.
                                    </p>
                                </div>
                                <Button
                                    onClick={generateAiSummary}
                                    isLoading={aiLoading}
                                    className="bg-teal-600 hover:bg-teal-700 text-white border-0 py-6 px-8 rounded-2xl text-lg shadow-lg shadow-teal-900/10"
                                >
                                    {aiLoading ? 'Analyzing...' : 'Generate AI Analysis'}
                                    {!aiLoading && <Activity className="ml-2" />}
                                </Button>
                            </div>

                            {aiReport && (
                                <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 mt-6 animate-in fade-in zoom-in duration-300">
                                    <div className="prose prose-slate prose-lg max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {aiReport}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 gap-10 mt-10">
                        <Card className="p-10 border-white/50" hover={false}>
                            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-8">
                                <Download size={28} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Full Longitudinal Summary</h3>
                            <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                Generates a high-density clinical summary including tremor trends, medication adherence,
                                and pattern recognition insights. Designed for direct presentation to neurologists.
                            </p>
                            <Button
                                onClick={() => generatePDF()}
                                className="w-full py-6 text-lg rounded-[24px]"
                                isLoading={loading}
                                variant={success ? 'primary' : 'dark'}
                            >
                                {success ? (
                                    <>Report Generated <CheckCircle2 size={20} className="ml-2" /></>
                                ) : (
                                    <>Generate PDF Report <Download size={20} className="ml-2" /></>
                                )}
                            </Button>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}

export default function ReportsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                <span className="ml-3 text-slate-500">Loading...</span>
            </div>
        }>
            <ReportsContent />
        </Suspense>
    );
}
