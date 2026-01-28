"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Activity } from 'lucide-react';

export default function ModulesPlaceholder({ title }: { title: string }) {
    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{title}</h1>
            <Card className="p-20 flex flex-col items-center justify-center text-center space-y-6 border-dashed border-2 border-slate-200 bg-transparent" hover={false}>
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    <Activity size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Module Under Calibration</h2>
                    <p className="text-slate-500 font-medium">This clinical monitoring module is currently being optimized for precision.</p>
                </div>
            </Card>
        </div>
    );
}
