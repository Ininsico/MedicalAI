"use client";

interface SymptomLog {
    id: string;
    patient_id: string;
    date: string;
    mood: string;
    symptoms: string[];
    medication_taken: boolean;
    medication_notes?: string;
    sleep_hours: number;
    tremor_severity: number;
    stiffness_severity: number;
    notes: string;
    created_at: string;
}

export function detectUnusualChanges(logs: SymptomLog[]): string[] {
    const insights: string[] = [];
    if (logs.length < 2) return ["Commencing baseline synchronization. Please continue daily logging."];

    const current = logs[0];
    const pastLogs = logs.slice(1, 8); // Last 7 days baseline

    if (pastLogs.length === 0) return ["Monitoring active. Longitudinal data stream initializing."];

    // Calculate Baselines
    const getAvg = (key: keyof Pick<SymptomLog, 'tremor_severity' | 'stiffness_severity' | 'sleep_hours'>) =>
        pastLogs.reduce((acc, log) => acc + (Number(log[key]) || 0), 0) / pastLogs.length;

    const baselines = {
        tremor: getAvg('tremor_severity'),
        stiffness: getAvg('stiffness_severity'),
        sleep: getAvg('sleep_hours'),
    };

    // 1. Tremor/Stiffness Spike (>20% increase)
    if (current.tremor_severity > baselines.tremor * 1.2 && current.tremor_severity > baselines.tremor + 1) {
        insights.push("Tremor activity has increased by over 20% compared to your 7-day baseline. You may want to discuss this trend with your clinician.");
    }

    if (current.stiffness_severity > baselines.stiffness * 1.2 && current.stiffness_severity > baselines.stiffness + 1) {
        insights.push("Muscle rigidity is showing a significant upward variance. Gentle stretching or a clinical consult is recommended.");
    }

    // 2. Sleep Quality Drop
    const sleepTrend = logs.slice(0, 3).every(l => (l.sleep_hours || 0) < 4);
    if (sleepTrend) {
        insights.push("Consistent low sleep quality detected over the last 72 hours. Neural rest is critical for motor regulation.");
    }

    // 3. Medication Adherence Pattern
    const missedDoses = logs.slice(0, 7).filter(l => l.medication_taken === false).length;
    if (missedDoses >= 2) {
        insights.push(`Analytical note: ${missedDoses} missed medication doses detected this week. Consistent adherence is foundational to symptom stability.`);
    }

    // Default if no spikes
    if (insights.length === 0) {
        insights.push("Bio-metrics are currently stable within your standard deviation. Maintain current protocol.");
    }

    return insights;
}
