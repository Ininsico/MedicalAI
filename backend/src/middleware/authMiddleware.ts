
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../lib/supabaseClient';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: any; // Replace 'any' with a more specific User interface later
            assignment?: any;
        }
    }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';


/**
 * Authentication middleware.
 * Verifies the JWT token from the Authorization header.
 * Attaches the decoded payload to the Request object as `user`.
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

/**
 * Authorization middleware for Admin role.
 * Ensures the authenticated user has the 'admin' role in the database.
 */
export const authorizeAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', req.user.userId)
            .single();

        if (error || !user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ error: 'Authorization error' });
    }
};

/**
 * Authorization middleware for Caregiver role.
 * Ensures the authenticated user has the 'caregiver' or 'admin' role.
 */
export const authorizeCaregiver = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', req.user.userId)
            .single();

        if (error || !user || (user.role !== 'caregiver' && user.role !== 'admin')) {
            return res.status(403).json({ error: 'Caregiver or Admin access required' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ error: 'Authorization error' });
    }
};

/**
 * Authorization middleware for Patient role.
 * Ensures the authenticated user has the 'patient' role.
 */
export const authorizePatient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', req.user.userId)
            .single();

        if (error || !user || (user.role !== 'patient' && user.role !== 'admin')) {
            return res.status(403).json({ error: 'Patient or Admin access required' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ error: 'Authorization error' });
    }
};

/**
 * Check if the authenticated caregiver is assigned to the specified patient.
 * Admins bypass this check.
 */
export const checkCaregiverAccess = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { patientId } = req.params;
        const { patientId: bodyPatientId } = req.body;
        const targetPatientId = patientId || bodyPatientId;

        if (req.user.role === 'admin') {
            return next();
        }

        const { data: assignment, error } = await supabaseAdmin
            .from('caregiver_assignments')
            .select('*')
            .eq('caregiver_id', req.user.userId)
            .eq('patient_id', targetPatientId)
            .single();

        if (error || !assignment) {
            return res.status(403).json({ error: 'Not assigned to this patient' });
        }

        req.assignment = assignment;
        next();
    } catch (error) {
        return res.status(500).json({ error: 'Access check error' });
    }
};
