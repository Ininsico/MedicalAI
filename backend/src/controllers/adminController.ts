
import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabaseClient';
import { sendEmail } from '../utils/emailUtils';
import bcrypt from 'bcryptjs';


/**
 * @swagger
 * /api/admin/caregivers:
 *   post:
 *     summary: Create a new caregiver (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - full_name
 *             properties:
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
 *         description: Caregiver created successfully
 *       400:
 *         description: Missing required fields or user already exists
 *       500:
 *         description: Internal server error
 */
export const createCaregiver = async (req: Request, res: Response) => {
    try {
        const { email, password, full_name, phone } = req.body;

        if (!email || !password || !full_name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .insert([
                {
                    email,
                    password_hash: hashedPassword,
                    full_name,
                    role: 'caregiver',
                    phone: phone || '',
                    is_active: true,
                    email_verified: true
                }
            ])
            .select()
            .single();

        if (error) throw error;

        await supabaseAdmin
            .from('audit_logs')
            .insert([
                {
                    action: 'CREATE_CAREGIVER',
                    user_id: req.user.userId,
                    target_id: user.id,
                    details: `Created caregiver: ${full_name} (${email})`,
                    ip_address: req.ip
                }
            ]);

        const welcomeEmail = `
            <h1>Welcome to ParkiTrack</h1>
            <p>Hello ${full_name},</p>
            <p>An administrative account has been created for you as a <strong>Caregiver</strong>.</p>
            <p>You can now login to the dashboard using the following credentials:</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p>For security, please change your password after your first login.</p>
            <p>Thank you,<br>System Administrator</p>
        `;

        try {
            await sendEmail(email, 'Your Caregiver Account Credentials', welcomeEmail);
        } catch (emailError) {
            // Email failure is non-blocking
        }

        res.status(201).json({
            message: 'Caregiver created successfully',
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create caregiver' });
    }
};

/**
 * @swagger
 * /api/admin/patients:
 *   post:
 *     summary: Create a new patient profile (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       201:
 *         description: Patient created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
export const createPatient = async (req: Request, res: Response) => {
    try {
        const {
            full_name,
            date_of_birth,
            gender,
            contact_number,
            emergency_contact,
            address,
            medical_history,
            current_medications,
            allergies,
            doctor_name,
            doctor_contact,
            insurance_info,
            notes
        } = req.body;

        if (!full_name || !date_of_birth || !gender || !contact_number) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data: patient, error } = await supabaseAdmin
            .from('patients')
            .insert([
                {
                    full_name,
                    date_of_birth,
                    gender,
                    contact_number,
                    emergency_contact,
                    address,
                    medical_history,
                    current_medications,
                    allergies,
                    doctor_name,
                    doctor_contact,
                    insurance_info,
                    notes,
                    created_by: req.user.userId,
                    status: 'active'
                }
            ])
            .select()
            .single();

        if (error) throw error;

        await supabaseAdmin
            .from('audit_logs')
            .insert([
                {
                    action: 'CREATE_PATIENT',
                    user_id: req.user.userId,
                    target_id: patient.id,
                    details: `Created patient: ${full_name}`,
                    ip_address: req.ip
                }
            ]);

        res.status(201).json({
            message: 'Patient created successfully',
            patient
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create patient' });
    }
};


/**
 * @swagger
 * /api/admin/patients:
 *   get:
 *     summary: Get all patients with pagination and search (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of patients retrieved successfully
 *       500:
 *         description: Internal server error
 */
export const getAllPatients = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = (req.query.search as string) || '';
        const offset = (page - 1) * limit;

        let userQuery = supabaseAdmin
            .from('users')
            .select('*', { count: 'exact' })
            .eq('role', 'patient');

        if (search) {
            userQuery = userQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        userQuery = userQuery.range(offset, offset + limit - 1)
            .order('created_at', { ascending: false });

        const { data: users, error: userError, count } = await userQuery;

        if (userError) throw userError;

        if (!users || users.length === 0) {
            return res.json({
                patients: [],
                pagination: { page, limit, total: 0, pages: 0 }
            });
        }

        const userIds = users.map(u => u.id);
        const [clinicalRes, assignmentsRes] = await Promise.all([
            supabaseAdmin.from('patients').select('*').in('id', userIds),
            supabaseAdmin.from('caregiver_assignments')
                .select('patient_id, caregiver:users!caregiver_assignments_caregiver_id_fkey(full_name)')
                .in('patient_id', userIds)
                .eq('status', 'active')
        ]);

        const clinicalData = clinicalRes.data;
        const assignmentsData = assignmentsRes.data;

        const mergedPatients = users.map(user => {
            const clinical = clinicalData?.find(c => c.id === user.id);
            const assignments = assignmentsData?.filter(a => a.patient_id === user.id) || [];
            const primaryCaregiver = (assignments[0]?.caregiver as any)?.full_name;

            return {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                last_login: user.last_login,
                created_at: user.created_at,
                status: clinical?.status || 'Active (Account Only)',
                contact_number: clinical?.contact_number || user.phone,
                doctor_name: clinical?.doctor_name || primaryCaregiver || 'Unassigned',
                caregiver_count: assignments.length,
                is_active: user.is_active
            };
        });

        res.json({
            patients: mergedPatients,
            pagination: {
                page,
                limit,
                total: count,
                pages: count ? Math.ceil(count / limit) : 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
};

/**
 * @swagger
 * /api/admin/patients/{id}:
 *   get:
 *     summary: Get single patient details (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient details retrieved successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const getPatientById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (userError || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { data: clinical, error: clinicalError } = await supabaseAdmin
            .from('patients')
            .select('*')
            .eq('id', id)
            .single();

        const { data: logs, error: logsError } = await supabaseAdmin
            .from('daily_logs')
            .select('*')
            .eq('patient_id', id)
            .order('date', { ascending: false });

        const { data: assignments, error: assignError } = await supabaseAdmin
            .from('caregiver_assignments')
            .select(`
                *,
                caregiver:users!caregiver_assignments_caregiver_id_fkey (
                    id,
                    full_name,
                    email,
                    phone
                )
            `)
            .eq('patient_id', id)
            .eq('status', 'active');

        res.json({
            ...user,
            clinical: clinical || null,
            logs: logs || [],
            assignments: assignments || []
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch patient details' });
    }
};


/**
 * @swagger
 * /api/admin/patients/{id}:
 *   put:
 *     summary: Update patient profile (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       200:
 *         description: Patient updated successfully
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Internal server error
 */
export const updatePatient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const { data: existingPatient } = await supabaseAdmin
            .from('patients')
            .select('id')
            .eq('id', id)
            .single();

        if (!existingPatient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const { data: patient, error } = await supabaseAdmin
            .from('patients')
            .update({
                ...updateData,
                updated_at: new Date().toISOString(),
                updated_by: req.user.userId
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        await supabaseAdmin
            .from('audit_logs')
            .insert([
                {
                    action: 'UPDATE_PATIENT',
                    user_id: req.user.userId,
                    target_id: id,
                    details: `Updated patient: ${patient.full_name}`,
                    ip_address: req.ip
                }
            ]);

        res.json({
            message: 'Patient updated successfully',
            patient
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update patient' });
    }
};

/**
 * @swagger
 * /api/admin/patients/{id}:
 *   delete:
 *     summary: Delete patient (Admin only - soft delete)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient deleted successfully
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Internal server error
 */
export const deletePatient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { data: patient, error } = await supabaseAdmin
            .from('patients')
            .update({
                status: 'inactive',
                deleted_at: new Date().toISOString(),
                deleted_by: req.user.userId
            })
            .eq('id', id)
            .select()
            .single();

        if (error || !patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        await supabaseAdmin
            .from('audit_logs')
            .insert([
                {
                    action: 'DELETE_PATIENT',
                    user_id: req.user.userId,
                    target_id: id,
                    details: `Deleted patient: ${patient.full_name}`,
                    ip_address: req.ip
                }
            ]);

        res.json({
            message: 'Patient deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete patient' });
    }
};

/**
 * @swagger
 * /api/admin/assignments:
 *   post:
 *     summary: Assign caregiver to patient (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - caregiver_id
 *             properties:
 *               patient_id:
 *                 type: string
 *               caregiver_id:
 *                 type: string
 *               assignment_notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Caregiver assigned successfully
 *       400:
 *         description: Caregiver already assigned
 *       404:
 *         description: Patient or Caregiver not found
 *       500:
 *         description: Internal server error
 */
export const assignCaregiver = async (req: Request, res: Response) => {
    try {
        const { patient_id, caregiver_id, assignment_notes } = req.body;

        if (!patient_id || !caregiver_id) {
            return res.status(400).json({ error: 'Patient ID and Caregiver ID required' });
        }

        const { data: patient } = await supabaseAdmin
            .from('patients')
            .select('id, full_name, status')
            .eq('id', patient_id)
            .eq('status', 'active')
            .single();

        if (!patient) {
            return res.status(404).json({ error: 'Active patient not found' });
        }

        const { data: caregiver } = await supabaseAdmin
            .from('users')
            .select('id, full_name, role, email')
            .eq('id', caregiver_id)
            .eq('role', 'caregiver')
            .eq('is_active', true)
            .single();

        if (!caregiver) {
            return res.status(404).json({ error: 'Active caregiver not found' });
        }

        const { data: existingAssignment } = await supabaseAdmin
            .from('caregiver_assignments')
            .select('id')
            .eq('patient_id', patient_id)
            .eq('caregiver_id', caregiver_id)
            .eq('status', 'active')
            .single();

        if (existingAssignment) {
            return res.status(400).json({ error: 'Caregiver already assigned to this patient' });
        }

        const { data: assignment, error } = await supabaseAdmin
            .from('caregiver_assignments')
            .insert([
                {
                    patient_id,
                    caregiver_id,
                    assigned_by: req.user.userId,
                    assignment_notes,
                    status: 'active',
                    assigned_date: new Date().toISOString()
                }
            ])
            .select(`
        *,
        patient:patients (full_name, contact_number),
        caregiver:users!caregiver_assignments_caregiver_id_fkey (full_name, email)
      `)
            .single();

        if (error) throw error;

        const assignmentEmail = `
      <h1>New Patient Assignment</h1>
      <p>Hello ${caregiver.full_name},</p>
      <p>You have been assigned to a new patient:</p>
      <ul>
        <li><strong>Patient:</strong> ${patient.full_name}</li>
        <li><strong>Assignment Date:</strong> ${new Date().toLocaleDateString()}</li>
        <li><strong>Notes:</strong> ${assignment_notes || 'No additional notes'}</li>
      </ul>
      <p>Please log in to the system to view patient details and monitor their daily logs.</p>
      <p>Thank you,<br>Healthcare Admin Team</p>
    `;

        await sendEmail(caregiver.email, 'New Patient Assignment', assignmentEmail);

        await supabaseAdmin
            .from('audit_logs')
            .insert([
                {
                    action: 'ASSIGN_CAREGIVER',
                    user_id: req.user.userId,
                    target_id: assignment.id,
                    details: `Assigned caregiver ${caregiver.full_name} to patient ${patient.full_name}`,
                    ip_address: req.ip
                }
            ]);

        res.status(201).json({
            message: 'Caregiver assigned successfully',
            assignment
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to assign caregiver' });
    }
};


/**
 * @swagger
 * /api/admin/assignments:
 *   get:
 *     summary: Get all caregiver assignments (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patient_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: caregiver_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           default: active
 *     responses:
 *       200:
 *         description: List of assignments retrieved successfully
 *       500:
 *         description: Internal server error
 */
export const getAllAssignments = async (req: Request, res: Response) => {
    try {
        const { patient_id, caregiver_id, status = 'active' } = req.query;

        let query = supabaseAdmin
            .from('caregiver_assignments')
            .select(`
        *,
        patient:patients (id, full_name, contact_number, status),
        caregiver:users!caregiver_assignments_caregiver_id_fkey (id, full_name, email, phone),
        assigned_by_user:users!caregiver_assignments_assigned_by_fkey (full_name, email)
      `);

        if (patient_id) {
            query = query.eq('patient_id', patient_id);
        }

        if (caregiver_id) {
            query = query.eq('caregiver_id', caregiver_id);
        }

        if (status) {
            query = query.eq('status', status);
        }

        query = query.order('assigned_date', { ascending: false });

        const { data: assignments, error } = await query;

        if (error) throw error;

        res.json(assignments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
};

/**
 * @swagger
 * /api/admin/assignments/{id}:
 *   delete:
 *     summary: Remove caregiver assignment (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment removed successfully
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
export const removeAssignment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { data: assignment } = await supabaseAdmin
            .from('caregiver_assignments')
            .select(`
        *,
        patient:patients (full_name),
        caregiver:users!caregiver_assignments_caregiver_id_fkey (full_name, email)
      `)
            .eq('id', id)
            .single();

        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        const { error } = await supabaseAdmin
            .from('caregiver_assignments')
            .update({
                status: 'inactive',
                ended_date: new Date().toISOString(),
                ended_by: req.user.userId
            })
            .eq('id', id);

        if (error) throw error;

        const removalEmail = `
      <h1>Patient Assignment Ended</h1>
      <p>Hello ${assignment.caregiver.full_name},</p>
      <p>Your assignment to patient ${assignment.patient.full_name} has been ended.</p>
      <p><strong>End Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p>You will no longer have access to this patient's records.</p>
      <p>Thank you for your service,<br>Healthcare Admin Team</p>
    `;

        await sendEmail(assignment.caregiver.email, 'Patient Assignment Ended', removalEmail);

        await supabaseAdmin
            .from('audit_logs')
            .insert([
                {
                    action: 'REMOVE_ASSIGNMENT',
                    user_id: req.user.userId,
                    target_id: id,
                    details: `Removed caregiver ${assignment.caregiver.full_name} from patient ${assignment.patient.full_name}`,
                    ip_address: req.ip
                }
            ]);

        res.json({
            message: 'Assignment removed successfully'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove assignment' });
    }
};

/**
 * @swagger
 * /api/admin/caregivers:
 *   get:
 *     summary: Get all caregivers (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of caregivers retrieved successfully
 *       500:
 *         description: Internal server error
 */
export const getAllCaregivers = async (req: Request, res: Response) => {
    try {
        const { data: caregivers, error } = await supabaseAdmin
            .from('users')
            .select('id, full_name, email, phone, last_login, created_at, is_active')
            .eq('role', 'caregiver')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(caregivers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch caregivers' });
    }
};
