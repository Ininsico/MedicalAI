
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../lib/supabaseClient';
import { generateToken, sendEmail } from '../utils/emailUtils';

/**
 * Register a new user (Admin only for caregivers)
 */
export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, full_name, role, phone } = req.body;

        // Validate input
        if (!email || !password || !full_name || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if user exists
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
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

        if (error) {
            throw error;
        }

        // If user is a patient, create entry in patients table
        if (role === 'patient') {
            const { error: patientError } = await supabaseAdmin
                .from('patients')
                .insert([
                    {
                        id: user.id,
                        full_name,
                        date_of_birth: '1900-01-01', // Default value
                        contact_number: phone || 'Not Provided',
                        gender: 'Not Specified',
                        status: 'active',
                        created_by: user.id
                    }
                ]);

            if (patientError) {
                console.error('Failed to create patient profile:', patientError);
                // We don't throw here to allow user creation to succeed, 
                // but logs might fail later if this didn't work.
            }
        }

        // Send welcome email
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
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Get user from database
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if user is active
        if (!user.is_active) {
            return res.status(403).json({ error: 'Account is deactivated' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user.id, user.role, user.email);

        // Update last login
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
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

/**
 * Get current user profile
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
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

/**
 * Create default admin user if not exists
 */
export const createDefaultAdmin = async () => {
    try {
        // Check if admin exists
        const { data: existingAdmin } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', 'ininsico@gmail.com')
            .single();

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('2136109HNsj', 10);

            const { data: admin, error } = await supabaseAdmin
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
                ])
                .select()
                .single();

            if (error) {
                console.error('Failed to create default admin:', error);
            } else {
                console.log('Default admin created:', admin.email);
            }
        }
    } catch (error) {
        console.error('Admin setup error:', error);
    }
};
