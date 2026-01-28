import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// DEMO MODE: Login endpoint that bypasses email verification
export const demoLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Use admin client to sign in without email verification check
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            // If it's an email verification error, manually verify the user and try again
            if (error.message.toLowerCase().includes('email') &&
                (error.message.toLowerCase().includes('confirm') ||
                    error.message.toLowerCase().includes('verif'))) {

                // Get user by email
                const { data: users } = await supabase.auth.admin.listUsers();
                const user = users?.users.find(u => u.email === email);

                if (user) {
                    // Manually confirm the user's email
                    await supabase.auth.admin.updateUserById(user.id, {
                        email_confirm: true
                    });

                    // Try signing in again
                    const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                        email,
                        password,
                    });

                    if (retryError) {
                        return res.status(401).json({ error: retryError.message });
                    }

                    return res.json({ session: retryData.session, user: retryData.user });
                }
            }

            return res.status(401).json({ error: error.message });
        }

        return res.json({ session: data.session, user: data.user });
    } catch (error: any) {
        console.error('Demo login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
