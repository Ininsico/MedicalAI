"use client";

import React from 'react';
import { X } from 'lucide-react';

interface EditLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    editFormData: any;
    setEditFormData: (data: any) => void;
    saving: boolean;
}

const SYMPTOMS_LIST = ['Dizziness', 'Nausea', 'Fatigue', 'Dyskinesia', 'Confusion'];

export default function EditLogModal({
    isOpen,
    onClose,
    onSave,
    editFormData,
    setEditFormData,
    saving
}: EditLogModalProps) {
    if (!isOpen) return null;

    const toggleSymptom = (symptom: string) => {
        const current = editFormData.symptoms || [];
        const updated = current.includes(symptom)
            ? current.filter((s: string) => s !== symptom)
            : [...current, symptom];
        setEditFormData({ ...editFormData, symptoms: updated });
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">Edit Daily Entry</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-left">
                    {/* Primary Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tremor Severity (0-10)</label>
                            <input
                                type="range" min="0" max="10"
                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
                                value={editFormData.tremor_severity || 0}
                                onChange={e => setEditFormData({ ...editFormData, tremor_severity: parseInt(e.target.value) })}
                            />
                            <div className="flex justify-between mt-1 text-[10px] font-bold text-slate-400">
                                <span>MIN (0)</span>
                                <span className="text-teal-600">CURRENT: {editFormData.tremor_severity || 0}</span>
                                <span>MAX (10)</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Stiffness Severity (0-10)</label>
                            <input
                                type="range" min="0" max="10"
                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
                                value={editFormData.stiffness_severity || 0}
                                onChange={e => setEditFormData({ ...editFormData, stiffness_severity: parseInt(e.target.value) })}
                            />
                            <div className="flex justify-between mt-1 text-[10px] font-bold text-slate-400">
                                <span>MIN (0)</span>
                                <span className="text-teal-600">CURRENT: {editFormData.stiffness_severity || 0}</span>
                                <span>MAX (10)</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sleep Hours (0-24)</label>
                            <input
                                type="number" min="0" max="24"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:border-teal-500 outline-none font-bold text-slate-700"
                                value={editFormData.sleep_hours || 0}
                                onChange={e => setEditFormData({ ...editFormData, sleep_hours: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Daily Mood</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:border-teal-500 outline-none font-bold text-slate-700"
                                value={editFormData.mood || 'neutral'}
                                onChange={e => setEditFormData({ ...editFormData, mood: e.target.value })}
                            >
                                <option value="excellent">Excellent</option>
                                <option value="good">Good</option>
                                <option value="neutral">Neutral</option>
                                <option value="poor">Poor</option>
                                <option value="bad">Bad</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Medication Status</label>
                        <div className="flex gap-2">
                            {[true, false].map((status) => (
                                <button
                                    key={String(status)}
                                    type="button"
                                    onClick={() => setEditFormData({ ...editFormData, medication_taken: status })}
                                    className={`flex-1 py-2 px-4 rounded-xl border-2 font-bold text-xs transition-all ${editFormData.medication_taken === status
                                            ? 'border-teal-600 bg-teal-50 text-teal-700'
                                            : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                                        }`}
                                >
                                    {status ? 'Medication Taken' : 'Medication Missed'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Symptoms / Side Effects</label>
                        <div className="flex flex-wrap gap-2">
                            {SYMPTOMS_LIST.map((symptom) => (
                                <button
                                    key={symptom}
                                    type="button"
                                    onClick={() => toggleSymptom(symptom)}
                                    className={`py-2 px-4 rounded-xl border-2 font-bold text-[10px] transition-all ${(editFormData.symptoms || []).includes(symptom)
                                            ? 'border-teal-500 bg-teal-50 text-teal-600'
                                            : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                                        }`}
                                >
                                    {symptom}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Entry Notes</label>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-teal-500 outline-none min-h-[100px] text-slate-700 font-medium"
                            value={editFormData.notes || ''}
                            onChange={e => setEditFormData({ ...editFormData, notes: e.target.value })}
                            placeholder="Add generic observations or details..."
                        />
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-slate-600 font-bold text-xs hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="px-8 py-2.5 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-600/20 disabled:opacity-50 transition-colors"
                    >
                        {saving ? 'SAVING...' : 'UPDATE ENTRY'}
                    </button>
                </div>
            </div>
        </div>
    );
}
