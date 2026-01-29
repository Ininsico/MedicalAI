
import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabaseClient';
import { sendEmail } from '../utils/emailUtils';
import bcrypt from 'bcryptjs';

/**
 * Create a new caregiver (Admin only)
 */
export const createCaregiver = async (req: Request, res: Response) => {
    try {
        const { email, password, full_name, phone } = req.body;

        // Validate required fields
        if (!email || !password || !full_name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if user already exists
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create caregiver user
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
                    email_verified: true // Admin created accounts are verified by default
                }
            ])
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Log the creation
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

        // Send welcome email with credentials
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
            console.error('Failed to send welcome email:', emailError);
            // We don't fail the whole request just because email failed
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
        console.error('Create caregiver error:', error);
        res.status(500).json({ error: 'Failed to create caregiver' });
    }
};

/**
 * Create a new patient (Admin only)
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

        // Validate required fields
        if (!full_name || !date_of_birth || !gender || !contact_number) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create patient record
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

        if (error) {
            throw error;
        }

        // Log the creation
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
        console.error('Create patient error:', error);
        res.status(500).json({ error: 'Failed to create patient' });
    }
};

/**
 * Get all patients (Admin only)
 */
export const getAllPatients = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = (req.query.search as string) || '';
        const offset = (page - 1) * limit;

        // Fetch users who are patients (Source of Truth for accounts)
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

        // Fetch corresponding clinical data from patients table
        const userIds = users.map(u => u.id);
        const { data: clinicalData, error: clinicalError } = await supabaseAdmin
            .from('patients')
            .select('*')
            .in('id', userIds);

        if (clinicalError) throw clinicalError;

        // Merge clinical data into user objects
        const mergedPatients = users.map(user => {
            const clinical = clinicalData?.find(c => c.id === user.id);
            return {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                last_login: user.last_login,
                created_at: user.created_at,
                status: clinical?.status || 'Active (Account Only)',
                contact_number: clinical?.contact_number || user.phone,
                doctor_name: clinical?.doctor_name || 'Unassigned',
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
        console.error('Get patients error:', error);
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
};

/**
 * Get single patient details (Admin only)
 */
export const getPatientById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Fetch User record first
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (userError || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch Clinical Data
        const { data: clinical, error: clinicalError } = await supabaseAdmin
            .from('patients')
            .select('*')
            .eq('id', id)
            .single();

        // Fetch Logs
        const { data: logs, error: logsError } = await supabaseAdmin
            .from('daily_logs')
            .select('*')
            .eq('patient_id', id)
            .order('date', { ascending: false });

        // Fetch Assignments
        const { data: assignments, error: assignError } = await supabaseAdmin
            .from('caregiver_assignments')
            .select(`
                *,
                caregiver:users (
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
        console.error('Get patient error:', error);
        res.status(500).json({ error: 'Failed to fetch patient details' });
    }
};

/**
 * Update patient (Admin only)
 */
export const updatePatient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if patient exists
        const { data: existingPatient } = await supabaseAdmin
            .from('patients')
            .select('id')
            .eq('id', id)
            .single();

        if (!existingPatient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Update patient
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

        if (error) {
            throw error;
        }

        // Log the update
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
        console.error('Update patient error:', error);
        res.status(500).json({ error: 'Failed to update patient' });
    }
};

/**
 * Delete patient (Admin only - soft delete)
 */
export const deletePatient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Soft delete patient
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

        // Log the deletion
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
        console.error('Delete patient error:', error);
        res.status(500).json({ error: 'Failed to delete patient' });
    }
};

/**
 * Assign caregiver to patient (Admin only)
 */
export const assignCaregiver = async (req: Request, res: Response) => {
    try {
        const { patient_id, caregiver_id, assignment_notes } = req.body;

        // Validate input
        if (!patient_id || !caregiver_id) {
            return res.status(400).json({ error: 'Patient ID and Caregiver ID required' });
        }

        // Check if patient exists and is active
        const { data: patient } = await supabaseAdmin
            .from('patients')
            .select('id, full_name, status')
            .eq('id', patient_id)
            .eq('status', 'active')
            .single();

        if (!patient) {
            return res.status(404).json({ error: 'Active patient not found' });
        }

        // Check if caregiver exists and has correct role
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

        // Check if assignment already exists
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

        // Create assignment
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
        caregiver:users (full_name, email)
      `)
            .single();

        if (error) {
            throw error;
        }

        // Send notification email to caregiver
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

        // Log the assignment
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
        console.error('Assign caregiver error:', error);
        res.status(500).json({ error: 'Failed to assign caregiver' });
    }
};

/**
 * Get all caregiver assignments (Admin only)
 */
export const getAllAssignments = async (req: Request, res: Response) => {
    try {
        const { patient_id, caregiver_id, status = 'active' } = req.query;

        let query = supabaseAdmin
            .from('caregiver_assignments')
            .select(`
        *,
        patient:patients (id, full_name, contact_number, status),
        caregiver:users (id, full_name, email, phone),
        assigned_by_user:users!caregiver_assignments_assigned_by_fkey (full_name, email)
      `);

        // Apply filters
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

        if (error) {
            throw error;
        }

        res.json(assignments);
    } catch (error) {
        console.error('Get assignments error:', error);
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
};

/**
 * Remove caregiver assignment (Admin only)
 */
export const removeAssignment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Get assignment details before removal
        const { data: assignment } = await supabaseAdmin
            .from('caregiver_assignments')
            .select(`
        *,
        patient:patients (full_name),
        caregiver:users (full_name, email)
      `)
            .eq('id', id)
            .single();

        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        // Remove assignment (soft delete)
        const { error } = await supabaseAdmin
            .from('caregiver_assignments')
            .update({
                status: 'inactive',
                ended_date: new Date().toISOString(),
                ended_by: req.user.userId
            })
            .eq('id', id);

        if (error) {
            throw error;
        }

        // Send notification email to caregiver
        const removalEmail = `
      <h1>Patient Assignment Ended</h1>
      <p>Hello ${assignment.caregiver.full_name},</p>
      <p>Your assignment to patient ${assignment.patient.full_name} has been ended.</p>
      <p><strong>End Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p>You will no longer have access to this patient's records.</p>
      <p>Thank you for your service,<br>Healthcare Admin Team</p>
    `;

        await sendEmail(assignment.caregiver.email, 'Patient Assignment Ended', removalEmail);

        // Log the removal
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
        console.error('Remove assignment error:', error);
        res.status(500).json({ error: 'Failed to remove assignment' });
    }
};

/**
 * Get all caregivers (Admin only)
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
        console.error('Get caregivers error:', error);
        res.status(500).json({ error: 'Failed to fetch caregivers' });
    }
};
