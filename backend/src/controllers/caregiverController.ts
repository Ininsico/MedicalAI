
import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabaseClient';
import moment from 'moment';
import crypto from 'crypto';
import { sendEmail, caregiverInvitationTemplate } from '../utils/emailUtils';


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
            created_at,
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
            last_medication_date: null,
            average_mood: 'N/A'
        };
    }

    const medicationDays = logs.filter(log => log.medication_taken).length;
    const totalDays = logs.length;
    const adherenceRate = (medicationDays / totalDays) * 100;

    // Calculate current streak
    let streak = 0;
    const sortedLogsDesc = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const log of sortedLogsDesc) {
        if (log.medication_taken) {
            streak++;
        } else {
            break;
        }
    }

    // Average mood (convert to score)
    const moodScores: Record<string, number> = {
        'excellent': 5,
        'good': 4,
        'neutral': 3,
        'poor': 2,
        'bad': 1
    };
    const averageMoodScore = logs.reduce((sum, log) => {
        return sum + (moodScores[log.mood?.toLowerCase()] || 3);
    }, 0) / logs.length;

    const getMoodFromScore = (score: number) => {
        if (score >= 4.5) return 'Excellent';
        if (score >= 3.5) return 'Good';
        if (score >= 2.5) return 'Neutral';
        if (score >= 1.5) return 'Poor';
        return 'Bad';
    };

    return {
        total_days: totalDays,
        medication_days: medicationDays,
        adherence_rate: parseFloat(adherenceRate.toFixed(2)),
        streak: streak,
        last_medication_date: sortedLogsDesc[0]?.date || null,
        average_mood: getMoodFromScore(averageMoodScore)
    };
};


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


// ================== CAREGIVER INVITATION METHODS ==================

/**
 * @swagger
 * /api/caregiver/invite:
 *   post:
 *     summary: Send caregiver invitation (Patient only)
 *     tags: [Caregiver]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inviteeEmail
 *             properties:
 *               inviteeEmail:
 *                 type: string
 *               personalMessage:
 *                 type: string
 *     responses:
 *       201:
 *         description: Invitation sent successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
export const sendInvitation = async (req: Request, res: Response) => {
    try {
        const patientId = req.user.userId;
        const { inviteeEmail, personalMessage } = req.body;

        if (!inviteeEmail || !inviteeEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return res.status(400).json({ error: 'Valid email is required' });
        }

        // Check if invitation already exists and is pending
        const { data: existingInvitation } = await supabaseAdmin
            .from('caregiver_invitations')
            .select('*')
            .eq('patient_id', patientId)
            .eq('invitee_email', inviteeEmail.toLowerCase())
            .eq('status', 'pending')
            .single();

        if (existingInvitation) {
            return res.status(400).json({ error: 'A pending invitation already exists for this email' });
        }

        // Check if the email is already a caregiver for this patient
        const { data: existingAssignment } = await supabaseAdmin
            .from('caregiver_assignments')
            .select('id, caregiver:users!caregiver_assignments_caregiver_id_fkey(email)')
            .eq('patient_id', patientId)
            .eq('status', 'active');

        if (existingAssignment?.some((a: any) => a.caregiver?.email === inviteeEmail.toLowerCase())) {
            return res.status(400).json({ error: 'This person is already your caregiver' });
        }

        // Generate secure token
        const invitationToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = moment().add(7, 'days').toISOString();

        // Create invitation
        const { data: invitation, error } = await supabaseAdmin
            .from('caregiver_invitations')
            .insert([
                {
                    patient_id: patientId,
                    invitee_email: inviteeEmail.toLowerCase(),
                    invitation_token: invitationToken,
                    personal_message: personalMessage || null,
                    expires_at: expiresAt,
                    status: 'pending'
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // Get patient name for email
        const { data: patient } = await supabaseAdmin
            .from('users')
            .select('full_name')
            .eq('id', patientId)
            .single();

        // Send invitation email
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const inviteLink = `${frontendUrl}/signup/caregiver?token=${invitationToken}`;

        const emailHtml = caregiverInvitationTemplate(
            patient?.full_name || 'A patient',
            inviteLink,
            personalMessage || null
        );

        await sendEmail(
            inviteeEmail,
            `You've been invited to be a caregiver on MedicalAI`,
            emailHtml
        );

        res.status(201).json({
            message: 'Invitation sent successfully',
            invitation: {
                id: invitation.id,
                invitee_email: invitation.invitee_email,
                expires_at: invitation.expires_at,
                status: invitation.status
            }
        });
    } catch (error) {
        console.error('Send invitation error:', error);
        res.status(500).json({ error: 'Failed to send invitation' });
    }
};

/**
 * @swagger
 * /api/caregiver/invitations:
 *   get:
 *     summary: Get patient's caregiver invitations (Patient only)
 *     tags: [Caregiver]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invitations retrieved successfully
 *       500:
 *         description: Internal server error
 */
export const getPatientInvitations = async (req: Request, res: Response) => {
    try {
        const patientId = req.user.userId;

        const { data: invitations, error } = await supabaseAdmin
            .from('caregiver_invitations')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Auto-expire old invitations
        const now = new Date();
        const toExpire = invitations.filter(inv =>
            inv.status === 'pending' && new Date(inv.expires_at) < now
        );

        if (toExpire.length > 0) {
            await supabaseAdmin
                .from('caregiver_invitations')
                .update({ status: 'expired' })
                .in('id', toExpire.map(inv => inv.id));
        }

        res.json({ invitations });
    } catch (error) {
        console.error('Get invitations error:', error);
        res.status(500).json({ error: 'Failed to retrieve invitations' });
    }
};

/**
 * @swagger
 * /api/caregiver/invitations/{invitationId}:
 *   delete:
 *     summary: Cancel/delete invitation (Patient only)
 *     tags: [Caregiver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation cancelled successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Invitation not found
 *       500:
 *         description: Internal server error
 */
export const cancelInvitation = async (req: Request, res: Response) => {
    try {
        const patientId = req.user.userId;
        const { invitationId } = req.params;

        // Verify ownership
        const { data: invitation } = await supabaseAdmin
            .from('caregiver_invitations')
            .select('*')
            .eq('id', invitationId)
            .eq('patient_id', patientId)
            .single();

        if (!invitation) {
            return res.status(404).json({ error: 'Invitation not found' });
        }

        if (invitation.status !== 'pending') {
            return res.status(400).json({ error: 'Can only cancel pending invitations' });
        }

        // Update status to cancelled
        const { error } = await supabaseAdmin
            .from('caregiver_invitations')
            .update({ status: 'cancelled' })
            .eq('id', invitationId);

        if (error) {
            // Check for unique violation (already have a cancelled invite for this email)
            if (error.code === '23505') {
                // If we can't mark it cancelled due to constraint, just delete this pending record
                // distinct from the historical 'cancelled' one.
                await supabaseAdmin
                    .from('caregiver_invitations')
                    .delete()
                    .eq('id', invitationId);

                return res.json({ message: 'Invitation cancelled successfully' });
            }
            throw error;
        }

        res.json({ message: 'Invitation cancelled successfully' });
    } catch (error) {
        console.error('Cancel invitation error:', error);
        res.status(500).json({ error: 'Failed to cancel invitation' });
    }
};

/**
 * @swagger
 * /api/caregiver/verify-invitation/{token}:
 *   get:
 *     summary: Verify invitation token (Public)
 *     tags: [Caregiver]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token verified successfully
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Internal server error
 */
export const verifyInvitationToken = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;

        const { data: invitation, error } = await supabaseAdmin
            .from('caregiver_invitations')
            .select(`
                *,
                patient:users!caregiver_invitations_patient_id_fkey(full_name, email)
            `)
            .eq('invitation_token', token)
            .single();

        if (error || !invitation) {
            return res.status(400).json({ error: 'Invalid invitation token' });
        }

        if (invitation.status !== 'pending') {
            return res.status(400).json({ error: `Invitation has been ${invitation.status}` });
        }

        if (new Date(invitation.expires_at) < new Date()) {
            // Auto-expire
            await supabaseAdmin
                .from('caregiver_invitations')
                .update({ status: 'expired' })
                .eq('id', invitation.id);

            return res.status(400).json({ error: 'Invitation has expired' });
        }

        res.json({
            valid: true,
            invitation: {
                id: invitation.id,
                patient_name: invitation.patient?.full_name,
                invitee_email: invitation.invitee_email,
                personal_message: invitation.personal_message,
                expires_at: invitation.expires_at
            }
        });
    } catch (error) {
        console.error('Verify invitation error:', error);
        res.status(500).json({ error: 'Failed to verify invitation' });
    }
};

/**
 * @swagger
 * /api/caregiver/accept-invitation:
 *   post:
 *     summary: Accept invitation and create caregiver account (Public)
 *     tags: [Caregiver]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - email
 *               - password
 *               - full_name
 *             properties:
 *               token:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Caregiver account created successfully
 *       400:
 *         description: Invalid request or token
 *       500:
 *         description: Internal server error
 */
export const acceptInvitation = async (req: Request, res: Response) => {
    try {
        const { token, email, password, full_name, phone } = req.body;

        if (!token || !email || !password || !full_name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verify invitation
        const { data: invitation, error: invError } = await supabaseAdmin
            .from('caregiver_invitations')
            .select('*')
            .eq('invitation_token', token)
            .single();

        if (invError || !invitation) {
            return res.status(400).json({ error: 'Invalid invitation token' });
        }

        if (invitation.status !== 'pending') {
            return res.status(400).json({ error: `Invitation has been ${invitation.status}` });
        }

        if (new Date(invitation.expires_at) < new Date()) {
            return res.status(400).json({ error: 'Invitation has expired' });
        }

        if (email.toLowerCase() !== invitation.invitee_email.toLowerCase()) {
            return res.status(400).json({ error: 'Email does not match invitation' });
        }

        // Check if user already exists
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id, role')
            .eq('email', email.toLowerCase())
            .single();

        let caregiverId: string;

        if (existingUser) {
            // User exists
            if (existingUser.role !== 'caregiver') {
                return res.status(400).json({ error: 'User exists with a different role' });
            }
            caregiverId = existingUser.id;
        } else {
            // Create new caregiver account
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(password, 10);

            const { data: newUser, error: userError } = await supabaseAdmin
                .from('users')
                .insert([
                    {
                        email: email.toLowerCase(),
                        password_hash: hashedPassword,
                        full_name,
                        role: 'caregiver',
                        phone,
                        is_active: true,
                        email_verified: true
                    }
                ])
                .select()
                .single();

            if (userError) throw userError;
            caregiverId = newUser.id;
        }

        // Create caregiver assignment
        const { error: assignError } = await supabaseAdmin
            .from('caregiver_assignments')
            .insert([
                {
                    caregiver_id: caregiverId,
                    patient_id: invitation.patient_id,
                    assigned_date: new Date().toISOString(),
                    assignment_notes: invitation.personal_message || 'Patient-initiated assignment',
                    status: 'active',
                    invitation_id: invitation.id
                }
            ]);

        if (assignError) throw assignError;

        // Mark invitation as accepted
        await supabaseAdmin
            .from('caregiver_invitations')
            .update({
                status: 'accepted',
                accepted_at: new Date().toISOString()
            })
            .eq('id', invitation.id);

        res.status(201).json({
            message: 'Caregiver account created and linked successfully',
            caregiver_id: caregiverId
        });
    } catch (error) {
        console.error('Accept invitation error:', error);
        res.status(500).json({ error: 'Failed to accept invitation' });
    }
};
