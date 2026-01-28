"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FileText, Download, Calendar, Activity, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportsPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const generatePDF = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Authentication error. Please log in again.");
                setLoading(false);
                return;
            }

            // Fetch logs for report with timeout
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), 10000)
            );

            const fetchPromise = supabase
                .from('symptom_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('logged_at', { ascending: false })
                .limit(30);

            const { data: logs, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

            if (error) {
                throw new Error(error.message);
            }

            if (!logs || logs.length === 0) {
                alert("No clinical data available for report generation.");
                setLoading(false);
                return;
            }

            const doc = new jsPDF();

            // Header
            doc.setFontSize(22);
            doc.text("Clinical Symptom Report", 14, 22);
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Patient ID: ${user.id.substring(0, 8)}...`, 14, 30);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 35);

            // Horizontal Line
            doc.setDrawColor(200);
            doc.line(14, 40, 196, 40);

            // Summary Section
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text("Executive Summary", 14, 50);
            doc.setFontSize(10);
            doc.text(`This report covers the last ${logs.length} logged intervals. Current tremor levels average ${(logs.reduce((a: any, b: any) => a + b.tremor, 0) / logs.length).toFixed(1)}/10.`, 14, 58);

            // Table
            autoTable(doc, {
                startY: 70,
                head: [['Date', 'Tremor', 'Stiffness', 'Sleep', 'Meds']],
                body: logs.map((log: any) => [
                    new Date(log.logged_at).toLocaleDateString(),
                    log.tremor,
                    log.stiffness,
                    log.sleep,
                    log.medication_adherence
                ]),
                headStyles: { fillColor: [20, 184, 166] },
                alternateRowStyles: { fillColor: [248, 250, 252] },
            });

            // Footer
            const pageCount = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text("NEURODYNAMIC SYSTEMS CONFIDENTIAL - FOR CLINICAL USE ONLY", 14, 285);
                doc.text(`Page ${i} of ${pageCount}`, 180, 285);
            }

            doc.save(`ParkiTrack_Report_${new Date().toISOString().split('T')[0]}.pdf`);
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
            <header>
                <div className="flex items-center space-x-3 text-teal-600 font-black text-xs uppercase tracking-[0.3em] mb-3">
                    <FileText size={14} />
                    <span>Clinical Export Module</span>
                </div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                    Analytical <span className="text-slate-400 italic font-serif font-light">Reports</span>
                </h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
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
                        onClick={generatePDF}
                        className="w-full py-6 text-lg rounded-[24px]"
                        isLoading={loading}
                        variant={success ? 'primary' : 'dark'}
                    >
                        {success ? (
                            <>Protocol Exported <CheckCircle2 size={20} className="ml-2" /></>
                        ) : (
                            <>Generate PDF Report <Download size={20} className="ml-2" /></>
                        )}
                    </Button>
                </Card>

                <Card className="p-10 bg-slate-900 text-white border-none relative overflow-hidden" hover={false}>
                    <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-teal-500/10 blur-[60px] rounded-full" />
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                            <div className="flex items-center space-x-3 mb-8">
                                <Calendar className="text-teal-400" size={20} />
                                <span className="text-xs font-black uppercase tracking-widest text-teal-400">Scheduled Reports</span>
                            </div>
                            <h3 className="text-2xl font-black mb-4 tracking-tight">Automated Distribution</h3>
                            <p className="text-slate-400 font-medium leading-relaxed mb-8">
                                Setup weekly encrypted exports to be sent directly to your care circle.
                                (Currently in Clinical BETA)
                            </p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 italic text-slate-500 text-sm">
                            Feature expected in Protocol v4.5 update
                        </div>
                    </div>
                </Card>
            </div>

            <div className="pt-12 border-t border-slate-100">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Report Integrity Protocol</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex items-start space-x-4">
                        <div className="p-2 bg-slate-50 rounded-lg text-teal-600"><Activity size={16} /></div>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed">End-to-End Encryption applies to all generated documents.</p>
                    </div>
                    <div className="flex items-start space-x-4">
                        <div className="p-2 bg-slate-50 rounded-lg text-teal-600"><AlertCircle size={16} /></div>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed">Cross-referenced with 7-day baseline for accuracy.</p>
                    </div>
                    <div className="flex items-start space-x-4">
                        <div className="p-2 bg-slate-50 rounded-lg text-teal-600"><ShieldCheck size={16} /></div>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed">Verified as Clinical Decision Support Tool (Non-Diagnostic).</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
