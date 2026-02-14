
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../lib/supabaseClient';
import { generateToken, sendEmail } from '../utils/emailUtils';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
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
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               full_name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, caregiver, patient]
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Missing required fields or user already exists
 *       500:
 *         description: Internal server error
 */
export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, full_name, role, phone } = req.body;

        if (!email || !password || !full_name || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .insert([
                {
                    email,
                    password_hash: hashedPassword,
                    full_name,
                    role,
                    phone,
                    is_active: true,
                    email_verified: false
                }
            ])
            .select()
            .single();

        if (error) throw error;

        if (role === 'patient') {
            const { error: patientError } = await supabaseAdmin
                .from('patients')
                .insert([
                    {
                        id: user.id,
                        full_name,
                        date_of_birth: '1900-01-01',
                        contact_number: phone || 'Not Provided',
                        gender: 'Not Specified',
                        status: 'active',
                        created_by: user.id
                    }
                ]);

            if (patientError) {
                // Silently handle patient profile creation error as it's secondary to user creation
            }
        }

        const welcomeEmail = `
      <h1>Welcome to Healthcare Management System</h1>
      <p>Hello ${full_name},</p>
      <p>Your account has been created successfully as a <strong>${role}</strong>.</p>
      <p>You can now login using your credentials.</p>
      <p><strong>Email:</strong> ${email}</p>
      <p>Thank you,<br>Healthcare Admin Team</p>
    `;

        await sendEmail(email, 'Welcome to Healthcare System', welcomeEmail);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account is deactivated
 *       500:
 *         description: Internal server error
 */
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.is_active) {
            return res.status(403).json({ error: 'Account is deactivated' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user.id, user.role, user.email);

        await supabaseAdmin
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                phone: user.phone
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieves the authenticated user's profile information including role and contact details.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string }
 *                 email: { type: string }
 *                 full_name: { type: string }
 *                 role: { type: string }
 *                 phone: { type: string }
 *                 created_at: { type: string, format: date-time }
 *                 last_login: { type: string, format: date-time }
 *       401:
 *         description: Unauthorized - Valid JWT token required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const getProfile = async (req: Request, res: Response) => {
    try {
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, email, full_name, role, phone, created_at, last_login')
            .eq('id', req.user.userId)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

/**
 * Creates a default administrator if one does not already exist.
 * This is an internal utility and is not exposed as an API endpoint.
 */
export const createDefaultAdmin = async () => {
    try {
        const { data: existingAdmin } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', 'ininsico@gmail.com')
            .single();

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('2136109HNsj', 10);

            await supabaseAdmin
                .from('users')
                .insert([
                    {
                        email: 'ininsico@gmail.com',
                        password_hash: hashedPassword,
                        role: 'admin',
                        full_name: 'System Administrator',
                        is_active: true,
                        email_verified: true
                    }
                ]);
        }
    } catch (error) {
        // Log setup error during startup
    }
};
