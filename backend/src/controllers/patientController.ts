
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
 * Create daily log (Patient or Admin only - Caregiver cannot create)
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

        // Check if user is patient themselves or admin
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', req.user.userId)
            .single();

        const canCreate = user?.role === 'admin' || req.user.userId === patientId;

        if (!canCreate) {
            return res.status(403).json({ error: 'Not authorized to create logs' });
        }

        // HEAL: Check if patient profile exists, create if missing (for legacy users)
        const { data: patientProfile, error: profileError } = await supabaseAdmin
            .from('patients')
            .select('id')
            .eq('id', patientId)
            .single();

        if (profileError && profileError.code === 'PGRST116') { // PGRST116 is "no rows found"
            console.log(`[HEAL] Patient profile missing for ID ${patientId}. Attempting auto-creation...`);

            // Auto-create minimal profile
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
                console.error('[HEAL] Failed to auto-create patient profile:', healError);
                return res.status(500).json({ error: 'Patient profile missing and could not be auto-created' });
            }
            console.log(`[HEAL] Successfully created patient profile for ${patientId}`);
        }

        // Validate required fields
        if (!date || !mood) {
            return res.status(400).json({ error: 'Date and mood are required' });
        }

        // Check if log already exists for this date
        const { data: existingLog } = await supabaseAdmin
            .from('daily_logs')
            .select('id')
            .eq('patient_id', patientId)
            .eq('date', date)
            .single();

        if (existingLog) {
            return res.status(400).json({ error: 'Log already exists for this date' });
        }

        // Create daily log
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

        if (error) {
            throw error;
        }

        // Check for unusual patterns and create notifications
        await checkForUnusualPatterns(patientId, log);

        // Log the creation
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
        console.error('Detailed Create log error:', error);
        res.status(500).json({
            error: 'Failed to create daily log',
            details: process.env.NODE_ENV === 'development' ? (error as any).message : undefined
        });
    }
};

/**
 * Get daily logs for a patient
 */
export const getDailyLogs = async (req: Request, res: Response) => {
    try {
        const patientId = req.params.patientId as string;

        // Check authorization
        // Caregivers can view logs of their assigned patients
        // Admins can view all
        // Patients can view their own

        const { data: user } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', req.user.userId)
            .single();

        let authorized = false;

        if (user?.role === 'admin' || req.user.userId === patientId) {
            authorized = true;
        } else if (user?.role === 'caregiver') {
            // Check assignment
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
        console.error('Get logs error:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
};
/**
 * Get assigned caregivers for a patient
 */
export const getCaregivers = async (req: Request, res: Response) => {
    try {
        const patientId = req.params.patientId as string;

        // Check authorization (Patient themselves, admin, or a caregiver assigned to them)
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
                role,
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
        console.error('Get caregivers error:', error);
        res.status(500).json({ error: 'Failed to fetch caregiver network' });
    }
};
