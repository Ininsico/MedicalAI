
import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabaseClient';

/**
 * Check for unusual patterns in daily logs
 */
const checkForUnusualPatterns = async (patientId: string, log: any) => {
    try {
        const unusualPatterns: string[] = [];

        // Check for missed medication
        if (!log.medication_taken) {
            unusualPatterns.push('Medication not taken');
        }

        // Check for poor mood
        const poorMoods = ['sad', 'angry', 'anxious', 'depressed'];
        if (poorMoods.includes(log.mood.toLowerCase())) {
            unusualPatterns.push(`Unusual mood: ${log.mood}`);
        }

        // Check sleep patterns
        if (log.sleep_hours && (log.sleep_hours < 4 || log.sleep_hours > 12)) {
            unusualPatterns.push(`Unusual sleep duration: ${log.sleep_hours} hours`);
        }

        // Check for concerning symptoms
        const concerningSymptoms = ['fever', 'chest pain', 'dizziness', 'severe headache'];
        if (log.symptoms && log.symptoms.some((symptom: string) =>
            concerningSymptoms.includes(symptom.toLowerCase())
        )) {
            unusualPatterns.push('Concerning symptoms reported');
        }

        // If unusual patterns found, create notifications
        if (unusualPatterns.length > 0) {
            // Get assigned caregivers
            const { data: assignments } = await supabaseAdmin
                .from('caregiver_assignments')
                .select('caregiver_id')
                .eq('patient_id', patientId)
                .eq('status', 'active');

            // Get patient info
            const { data: patient } = await supabaseAdmin
                .from('patients')
                .select('full_name')
                .eq('id', patientId)
                .single();

            if (assignments && patient) {
                const notifications = assignments.map((assignment: any) => ({
                    user_id: assignment.caregiver_id,
                    type: 'UNUSUAL_PATTERN',
                    title: `Unusual pattern detected for ${patient.full_name}`,
                    message: `Patterns: ${unusualPatterns.join(', ')} on ${log.date}`,
                    data: {
                        patient_id: patientId,
                        log_id: log.id,
                        patterns: unusualPatterns
                    },
                    priority: 'high'
                }));

                await supabaseAdmin
                    .from('notifications')
                    .insert(notifications);
            }
        }
    } catch (error) {
        console.error('Pattern check error:', error);
    }
};


/**
 * @swagger
 * /api/patients/{patientId}/logs:
 *   post:
 *     summary: Create a daily log entry (Patient or Admin only)
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - mood
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               mood:
 *                 type: string
 *               symptoms:
 *                 type: array
 *                 items:
 *                   type: string
 *               medication_taken:
 *                 type: boolean
 *               medication_notes:
 *                 type: string
 *               food_intake:
 *                 type: string
 *               sleep_hours:
 *                 type: number
 *               activity_level:
 *                 type: string
 *               tremor_severity:
 *                 type: integer
 *               stiffness_severity:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Daily log created successfully
 *       400:
 *         description: Missing required fields or duplicate log for date
 *       403:
 *         description: Not authorized
 *       500:
 *         description: Internal server error
 */
export const createDailyLog = async (req: Request, res: Response) => {
    try {
        const patientId = req.params.patientId as string;
        const {
            date,
            mood,
            symptoms,
            medication_taken,
            medication_notes,
            food_intake,
            sleep_hours,
            activity_level,
            notes
        } = req.body;

        const { data: user } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', req.user.userId)
            .single();

        const canCreate = user?.role === 'admin' || req.user.userId === patientId;

        if (!canCreate) {
            return res.status(403).json({ error: 'Not authorized to create logs' });
        }

        const { data: patientProfile, error: profileError } = await supabaseAdmin
            .from('patients')
            .select('id')
            .eq('id', patientId)
            .single();

        if (profileError && profileError.code === 'PGRST116') {
            const { data: userRecord } = await supabaseAdmin
                .from('users')
                .select('full_name, phone')
                .eq('id', patientId)
                .single();

            const { error: healError } = await supabaseAdmin
                .from('patients')
                .insert([
                    {
                        id: patientId,
                        full_name: userRecord?.full_name || 'Legacy Patient',
                        date_of_birth: '1900-01-01',
                        contact_number: userRecord?.phone || 'Not Provided',
                        gender: 'Not Specified',
                        status: 'active',
                        created_by: req.user.userId
                    }
                ]);

            if (healError) {
                return res.status(500).json({ error: 'Patient profile missing and could not be auto-created' });
            }
        }

        if (!date || !mood) {
            return res.status(400).json({ error: 'Date and mood are required' });
        }

        const { data: existingLog } = await supabaseAdmin
            .from('daily_logs')
            .select('id')
            .eq('patient_id', patientId)
            .eq('date', date)
            .single();

        if (existingLog) {
            return res.status(400).json({ error: 'Log already exists for this date' });
        }

        const { data: log, error } = await supabaseAdmin
            .from('daily_logs')
            .insert([
                {
                    patient_id: patientId,
                    date,
                    mood,
                    symptoms: symptoms || [],
                    medication_taken: medication_taken || false,
                    medication_notes,
                    food_intake,
                    sleep_hours,
                    activity_level,
                    tremor_severity: req.body.tremor_severity,
                    stiffness_severity: req.body.stiffness_severity,
                    notes,
                    created_by: req.user.userId
                }
            ])
            .select()
            .single();

        if (error) throw error;

        await checkForUnusualPatterns(patientId, log);

        await supabaseAdmin
            .from('audit_logs')
            .insert([
                {
                    action: 'CREATE_DAILY_LOG',
                    user_id: req.user.userId,
                    target_id: log.id,
                    details: `Created daily log for patient ${patientId} on ${date}`,
                    ip_address: req.ip
                }
            ]);

        res.status(201).json({
            message: 'Daily log created successfully',
            log
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to create daily log'
        });
    }
};

/**
 * @swagger
 * /api/patients/{patientId}/logs:
 *   get:
 *     summary: Get all daily logs for a patient
 *     tags: [Patient]
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
 *         description: Logs retrieved successfully
 *       403:
 *         description: Not authorized
 *       500:
 *         description: Internal server error
 */
export const getDailyLogs = async (req: Request, res: Response) => {
    try {
        const patientId = req.params.patientId as string;

        const { data: user } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', req.user.userId)
            .single();

        let authorized = false;

        if (user?.role === 'admin' || req.user.userId === patientId) {
            authorized = true;
        } else if (user?.role === 'caregiver') {
            const { data: assignment } = await supabaseAdmin
                .from('caregiver_assignments')
                .select('id')
                .eq('caregiver_id', req.user.userId)
                .eq('patient_id', patientId)
                .eq('status', 'active')
                .single();

            if (assignment) authorized = true;
        }

        if (!authorized) {
            return res.status(403).json({ error: 'Not authorized to view these logs' });
        }

        const { data: logs, error } = await supabaseAdmin
            .from('daily_logs')
            .select('*')
            .eq('patient_id', patientId)
            .order('date', { ascending: false });

        if (error) throw error;

        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
};

/**
 * @swagger
 * /api/patients/{patientId}/caregivers:
 *   get:
 *     summary: Get assigned caregivers for a patient
 *     tags: [Patient]
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
 *         description: Caregivers retrieved successfully
 *       403:
 *         description: Not authorized
 *       500:
 *         description: Internal server error
 */
export const getCaregivers = async (req: Request, res: Response) => {
    try {
        const patientId = req.params.patientId as string;

        const { data: user } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', req.user.userId)
            .single();

        let authorized = false;
        if (user?.role === 'admin' || req.user.userId === patientId) {
            authorized = true;
        }

        if (!authorized) {
            return res.status(403).json({ error: 'Not authorized to view caregiver network' });
        }

        const { data: caregivers, error } = await supabaseAdmin
            .from('caregiver_assignments')
            .select(`
                id,
                assignment_notes,
                created_at,
                caregiver:users!caregiver_assignments_caregiver_id_fkey (
                    id,
                    full_name,
                    email,
                    phone
                )
            `)
            .eq('patient_id', patientId)
            .eq('status', 'active');

        if (error) throw error;

        res.json(caregivers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch caregiver network' });
    }
};
