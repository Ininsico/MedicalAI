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

    // 0. Check for No Check-ins for > 2 days
    // logs are ordered by date desc (0 is newest)
    if (logs.length > 0) {
        const lastLogDate = new Date(logs[0].date);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - lastLogDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // If diffDays > 1 (meaning missed at least 1 full day effectively, user said X days, let's pick 3)
        // Actually logging "No check-ins for X consecutive days". Let's set X=3.
        if (diffDays > 3) {
            insights.push(`Data Gap Alert: No check-ins detected for ${diffDays} consecutive days.`);
        }
    }

    if (logs.length < 2) {
        if (insights.length === 0) return ["Commencing baseline synchronization. Please continue daily logging."];
        return insights;
    }

    const current = logs[0];
    const pastLogs = logs.slice(1, 8); // Last 7 days baseline (excluding today for comparison)

    if (pastLogs.length === 0) return insights.length > 0 ? insights : ["Monitoring active. Longitudinal data stream initializing."];

    // Calculate Baselines (7-day average)
    const getAvg = (key: keyof Pick<SymptomLog, 'tremor_severity' | 'stiffness_severity' | 'sleep_hours'>, dataset: SymptomLog[]) =>
        dataset.reduce((acc, log) => acc + (Number(log[key]) || 0), 0) / dataset.length;

    const baselines = {
        tremor: getAvg('tremor_severity', pastLogs),
        stiffness: getAvg('stiffness_severity', pastLogs),
    };

    // 1. Tremor/Stiffness Increases > 20% compared to last 7-day average
    if (current.tremor_severity > baselines.tremor * 1.2 && current.tremor_severity > baselines.tremor + 0.5) {
        insights.push(`Tremor intensity has increased by >20% compared to your 7-day average.`);
    }

    if (current.stiffness_severity > baselines.stiffness * 1.2 && current.stiffness_severity > baselines.stiffness + 0.5) {
        insights.push(`Muscle stiffness is >20% higher than your recent baseline.`);
    }

    // 2. Sleep Quality Drop (Sudden drop over 3 consecutive days)
    // We analyze the trend of the last 3 logs
    if (logs.length >= 4) {
        const last3Days = logs.slice(0, 3);
        const prevBaseline = logs.slice(3, 10); // Baseline before the drop

        if (prevBaseline.length > 0) {
            const avgRecentSleep = getAvg('sleep_hours', last3Days);
            const avgPrevSleep = getAvg('sleep_hours', prevBaseline);

            // If recent 3-day average is 20% lower than previous baseline
            if (avgRecentSleep < avgPrevSleep * 0.8) {
                insights.push("Significant drop in sleep duration detected over the last 3 days.");
            }
        }
    }

    // 3. 2+ Missed Medication Doses in a week
    // Check last 7 logs specifically
    const last7Logs = logs.slice(0, 7);
    const missedDoses = last7Logs.filter(l => l.medication_taken === false).length;
    if (missedDoses >= 2) {
        insights.push(`${missedDoses} missed medication doses detected in the last 7 days.`);
    }

    // Default if no spikes
    if (insights.length === 0) {
        insights.push("Bio-metrics are currently stable within your standard deviation. Maintain current protocol.");
    }

    return insights;
}
