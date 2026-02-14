"use client";

import React from 'react';
import { X, Sparkles, Cpu, AlertCircle, CheckCircle2, Download } from 'lucide-react';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportData: any;
    onDownload: () => void;
}

export default function ReportModal({ isOpen, onClose, reportData, onDownload }: ReportModalProps) {
    if (!isOpen || !reportData) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-200">
                <div className="p-8 border-b border-slate-100 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Sparkles className="text-teal-600" size={24} />
                            AI Clinical Analysis
                        </h2>
                        <p className="text-slate-500 mt-1 text-sm">Patient Longitudinal Report</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    <div className="p-6 bg-teal-50 rounded-xl border border-teal-100">
                        <h3 className="font-bold text-teal-800 mb-2 flex items-center gap-2">
                            <Cpu size={18} /> Executive Summary
                        </h3>
                        <p className="text-teal-900 leading-relaxed text-sm">{reportData.summary}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                        <div>
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <AlertCircle size={18} className="text-rose-500" /> Risk Factors
                            </h3>
                            <ul className="space-y-3">
                                {reportData.risks?.map((r: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
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
                                {reportData.recommendations?.map((r: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                        {r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-200 rounded-lg transition-colors">Close</button>
                    <button onClick={onDownload} className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/10">
                        <Download size={18} /> Download
                    </button>
                </div>
            </div>
        </div>
    );
}
