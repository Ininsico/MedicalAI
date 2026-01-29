
import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabaseClient';
import moment from 'moment';


/**
 * @swagger
 * /api/caregiver/dashboard:
 *   get:
 *     summary: Get caregiver dashboard with assigned patients (Caregiver only)
 *     tags: [Caregiver]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *       500:
 *         description: Internal server error
 */
export const getDashboard = async (req: Request, res: Response) => {
    try {
        const caregiverId = req.user.userId;

        const { data: assignments, error } = await supabaseAdmin
            .from('caregiver_assignments')
            .select(`
        id,
        assignment_notes,
        assigned_date,
        patient:patients (
            id,
            full_name,
            date_of_birth,
            gender,
            contact_number,
            status,
            recent_logs:daily_logs (
                id,
                date,
                mood,
                medication_taken,
                created_at
            )
        )
      `)
            .eq('caregiver_id', caregiverId)
            .eq('status', 'active')
            .eq('patient.status', 'active')
            .order('assigned_date', { ascending: false });

        if (error) throw error;

        const { data: notifications } = await supabaseAdmin
            .from('notifications')
            .select('*')
            .eq('user_id', caregiverId)
            .eq('read', false)
            .order('created_at', { ascending: false })
            .limit(10);

        const today = moment().format('YYYY-MM-DD');
        const { data: todaysLogs } = await supabaseAdmin
            .from('daily_logs')
            .select('id, patient_id, medication_taken')
            .eq('date', today)
            .in('patient_id', assignments?.map((a: any) => a.patient.id) || []);

        const stats = {
            total_patients: assignments?.length || 0,
            todays_logs: todaysLogs?.length || 0,
            medications_taken: todaysLogs?.filter((log: any) => log.medication_taken).length || 0,
            pending_notifications: notifications?.length || 0
        };

        res.json({
            assignments,
            notifications,
            stats,
            last_updated: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
};

/**
 * @swagger
 * /api/caregiver/patients/{patientId}/logs:
 *   get:
 *     summary: Get patient logs (Caregiver only)
 *     tags: [Caregiver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Logs retrieved successfully
 *       500:
 *         description: Internal server error
 */
export const getPatientLogs = async (req: Request, res: Response) => {
    try {
        const { patientId } = req.params;
        const start_date = req.query.start_date as string;
        const end_date = req.query.end_date as string;
        const limit = parseInt(req.query.limit as string) || 50;
        const page = parseInt(req.query.page as string) || 1;
        const offset = (page - 1) * limit;

        let query = supabaseAdmin
            .from('daily_logs')
            .select('*', { count: 'exact' })
            .eq('patient_id', patientId);

        if (start_date) {
            query = query.gte('date', start_date);
        }

        if (end_date) {
            query = query.lte('date', end_date);
        }

        const { data: logs, error, count } = await query
            .order('date', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        const { data: patient } = await supabaseAdmin
            .from('patients')
            .select('full_name, current_medications')
            .eq('id', patientId)
            .single();

        const adherenceStats = calculateAdherenceStats(logs || []);

        res.json({
            patient,
            logs,
            adherence_stats: adherenceStats,
            pagination: {
                page,
                limit,
                total: count,
                pages: count ? Math.ceil(count / limit) : 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch patient logs' });
    }
};

/**
 * @swagger
 * /api/caregiver/patients/{patientId}/logs/{logId}:
 *   get:
 *     summary: Get single log details (Caregiver only)
 *     tags: [Caregiver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: logId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Log details retrieved successfully
 *       404:
 *         description: Log not found
 *       500:
 *         description: Internal server error
 */
export const getLogDetails = async (req: Request, res: Response) => {
    try {
        const { patientId, logId } = req.params;

        const { data: log, error } = await supabaseAdmin
            .from('daily_logs')
            .select('*')
            .eq('id', logId)
            .eq('patient_id', patientId)
            .single();

        if (error || !log) {
            return res.status(404).json({ error: 'Log not found' });
        }

        res.json(log);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch log' });
    }
};

/**
 * @swagger
 * /api/caregiver/patients/{patientId}:
 *   get:
 *     summary: Get patient clinical details (Caregiver only)
 *     tags: [Caregiver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient details retrieved successfully
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Internal server error
 */
export const getPatientDetails = async (req: Request, res: Response) => {
    try {
        const { patientId } = req.params;

        const { data: patient, error } = await supabaseAdmin
            .from('patients')
            .select(`
          id,
          full_name,
          date_of_birth,
          gender,
          contact_number,
          emergency_contact,
          allergies,
          current_medications,
          doctor_name,
          doctor_contact
        `)
            .eq('id', patientId)
            .eq('status', 'active')
            .single();

        if (error || !patient) {
            return res.status(404).json({ error: 'Patient not found or access denied' });
        }

        res.json(patient);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch patient details' });
    }
};


// Helpers

const calculateAdherenceStats = (logs: any[]) => {
    if (!logs || logs.length === 0) {
        return {
            total_days: 0,
            medication_days: 0,
            adherence_rate: 0,
            streak: 0,
            last_medication_date: null
        };
    }

    const medicationDays = logs.filter(log => log.medication_taken).length;
    const totalDays = logs.length;
    const adherenceRate = (medicationDays / totalDays) * 100;

    // Calculate current streak
    let streak = 0;
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Note: Streak calculation might need more robust "consecutive days" logic but using simplified version from original code
    // The original code was sort DESCENDING (b-a)
    const sortedLogsDesc = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const log of sortedLogsDesc) {
        if (log.medication_taken) {
            streak++;
        } else {
            break;
        }
    }

    return {
        total_days: totalDays,
        medication_days: medicationDays,
        adherence_rate: parseFloat(adherenceRate.toFixed(2)),
        streak: streak,
        last_medication_date: sortedLogsDesc[0]?.date || null
    };
};

// Report Generation Logic included in separate file or here? 
// Original had it in same file. Let's separate Report logic to keep this clean? 
// Actually I'll keep it here or in a reportController. 
// User asked to distribute properly. I'll put report logic in `reportController.ts`? 
// Or just keep `generateReport` here for now since it is caregiver specific.


/**
 * @swagger
 * /api/caregiver/patients/{patientId}/report:
 *   get:
 *     summary: Generate comprehensive patient report (Caregiver only)
 *     tags: [Caregiver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Report generated successfully
 *       500:
 *         description: Internal server error
 */
export const generatePatientReport = async (req: Request, res: Response) => {
    try {
        const { patientId } = req.params;
        const start_date = req.query.start_date as string;
        const end_date = req.query.end_date as string;

        const defaultStartDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
        const defaultEndDate = moment().format('YYYY-MM-DD');

        const startDate = start_date || defaultStartDate;
        const endDate = end_date || defaultEndDate;

        const { data: patient } = await supabaseAdmin
            .from('patients')
            .select('*')
            .eq('id', patientId)
            .single();

        const { data: logs } = await supabaseAdmin
            .from('daily_logs')
            .select('*')
            .eq('patient_id', patientId)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: true });

        const stats = calculateReportStatistics(logs || []);
        const insights = generateInsights(logs || [], stats);

        const report = {
            patient: {
                id: patient.id,
                full_name: patient.full_name,
                date_of_birth: patient.date_of_birth,
                gender: patient.gender,
                current_medications: patient.current_medications
            },
            report_period: {
                start_date: startDate,
                end_date: endDate,
                duration_days: moment(endDate).diff(moment(startDate), 'days') + 1
            },
            summary: {
                total_logs: logs?.length || 0,
                medication_adherence: stats.adherence_rate,
                average_mood: stats.average_mood,
                common_symptoms: stats.common_symptoms.slice(0, 5),
                sleep_average: stats.average_sleep_hours
            },
            statistics: stats,
            insights: insights,
            logs: logs || [],
            generated_at: new Date().toISOString(),
            generated_by: req.user.userId
        };

        res.json(report);
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate report' });
    }
};

const calculateReportStatistics = (logs: any[]) => {
    if (!logs || logs.length === 0) {
        return {
            adherence_rate: 0,
            mood_distribution: {},
            average_mood: 'N/A',
            symptom_frequency: {},
            common_symptoms: [],
            average_sleep_hours: 0,
            activity_level_distribution: {}
        };
    }

    // Medication adherence
    const medicationDays = logs.filter(log => log.medication_taken).length;
    const adherenceRate = (medicationDays / logs.length) * 100;

    // Mood distribution
    const moodDistribution: Record<string, number> = {};
    logs.forEach(log => {
        moodDistribution[log.mood] = (moodDistribution[log.mood] || 0) + 1;
    });

    // Average mood (convert to score)
    const moodScores: Record<string, number> = {
        'excellent': 5,
        'good': 4,
        'neutral': 3,
        'poor': 2,
        'bad': 1
    };
    const averageMoodScore = logs.reduce((sum, log) => {
        return sum + (moodScores[log.mood.toLowerCase()] || 3);
    }, 0) / logs.length;

    // Symptom frequency
    const symptomFrequency: Record<string, number> = {};
    logs.forEach(log => {
        if (log.symptoms) {
            log.symptoms.forEach((symptom: string) => {
                symptomFrequency[symptom] = (symptomFrequency[symptom] || 0) + 1;
            });
        }
    });

    const commonSymptoms = Object.entries(symptomFrequency)
        .sort((a, b) => b[1] - a[1])
        .map(([symptom, count]) => ({ symptom, count }));

    // Sleep statistics
    const sleepLogs = logs.filter(log => log.sleep_hours);
    const averageSleepHours = sleepLogs.length > 0
        ? sleepLogs.reduce((sum, log) => sum + log.sleep_hours, 0) / sleepLogs.length
        : 0;

    // Activity level distribution
    const activityDistribution: Record<string, number> = {};
    logs.forEach(log => {
        if (log.activity_level) {
            activityDistribution[log.activity_level] = (activityDistribution[log.activity_level] || 0) + 1;
        }
    });

    return {
        adherence_rate: parseFloat(adherenceRate.toFixed(2)),
        mood_distribution: moodDistribution,
        average_mood: getMoodFromScore(averageMoodScore),
        symptom_frequency: symptomFrequency,
        common_symptoms: commonSymptoms,
        average_sleep_hours: parseFloat(averageSleepHours.toFixed(1)),
        activity_level_distribution: activityDistribution,
        total_logs: logs.length,
        medication_days: medicationDays,
        non_medication_days: logs.length - medicationDays
    };
};

const getMoodFromScore = (score: number) => {
    if (score >= 4.5) return 'Excellent';
    if (score >= 3.5) return 'Good';
    if (score >= 2.5) return 'Neutral';
    if (score >= 1.5) return 'Poor';
    return 'Bad';
};

const generateInsights = (logs: any[], stats: any) => {
    const insights: string[] = [];

    if (logs.length === 0) {
        return ['No logs available for analysis'];
    }

    // Medication adherence insight
    if (stats.adherence_rate < 80) {
        insights.push(`Medication adherence is ${stats.adherence_rate}%, which is below the recommended 80% threshold.`);
    } else {
        insights.push(`Excellent medication adherence at ${stats.adherence_rate}%.`);
    }

    // Mood insight
    if (stats.average_mood.toLowerCase() === 'poor' || stats.average_mood.toLowerCase() === 'bad') {
        insights.push(`Average mood is ${stats.average_mood.toLowerCase()}. Consider checking in with the patient more frequently.`);
    }

    // Sleep insight
    if (stats.average_sleep_hours > 0) {
        if (stats.average_sleep_hours < 6) {
            insights.push(`Average sleep duration is ${stats.average_sleep_hours} hours, which may be insufficient.`);
        } else if (stats.average_sleep_hours > 9) {
            insights.push(`Average sleep duration is ${stats.average_sleep_hours} hours, which is above average.`);
        }
    }

    // Symptom insight
    if (stats.common_symptoms.length > 0) {
        const topSymptoms = stats.common_symptoms.slice(0, 3);
        insights.push(`Most common symptoms: ${topSymptoms.map((s: any) => s.symptom).join(', ')}`);
    }

    // Streak insight
    let currentStreak = 0;
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const log of sortedLogs) {
        if (log.medication_taken) {
            currentStreak++;
        } else {
            break;
        }
    }

    if (currentStreak >= 7) {
        insights.push(`Current medication streak: ${currentStreak} days!`);
    }

    return insights;
};
