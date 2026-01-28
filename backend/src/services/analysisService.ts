import { SymptomLog } from '../models/types';

export const detectUnusualChanges = (logs: SymptomLog[]) => {
    if (logs.length < 2) return null;

    const current = logs[0];
    const previousLogs = logs.slice(1, 8); // Last 7 days

    if (previousLogs.length === 0) return null;

    const averages = {
        tremor: previousLogs.reduce((acc, log) => acc + log.tremor, 0) / previousLogs.length,
        stiffness: previousLogs.reduce((acc, log) => acc + log.stiffness, 0) / previousLogs.length,
        sleep: previousLogs.reduce((acc, log) => acc + log.sleep, 0) / previousLogs.length,
    };

    const insights: string[] = [];

    if (current.tremor > averages.tremor * 1.2 && current.tremor > 2) {
        insights.push("Significant tremor increase detected.");
    }

    if (current.stiffness > averages.stiffness * 1.2 && current.stiffness > 2) {
        insights.push("Stiffness levels are higher than your average.");
    }

    if (current.sleep < averages.sleep * 0.7) {
        insights.push("Major drop in sleep quality noticed.");
    }

    return insights;
};
