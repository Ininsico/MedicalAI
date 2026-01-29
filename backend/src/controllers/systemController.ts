
import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabaseClient';
import moment from 'moment';
import nodemailer from 'nodemailer';

// Helper to check email service status
const checkEmailService = () => {
    // In a real app we might ping the SMTP server
    return process.env.EMAIL_USER ? 'connected' : 'disconnected';
};


/**
 * @swagger
 * /api/admin/health:
 *   get:
 *     summary: Get system health status and statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health data retrieved successfully
 *       500:
 *         description: Internal server error
 */
export const getSystemHealth = async (req: Request, res: Response) => {
    try {
        const { data: dbCheck, error: dbError } = await supabaseAdmin
            .from('users')
            .select('count')
            .limit(1);

        const dbStatus = !dbError ? 'healthy' : 'unhealthy';

        const [
            { count: usersCount },
            { count: patientsCount },
            { count: caregiversCount },
            { count: logsCount },
            { count: activeAssignments }
        ] = await Promise.all([
            supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('patients').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'caregiver'),
            supabaseAdmin.from('daily_logs').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('caregiver_assignments').select('*', { count: 'exact', head: true }).eq('status', 'active')
        ]);

        const today = moment().format('YYYY-MM-DD');
        const { count: todaysLogs } = await supabaseAdmin
            .from('daily_logs')
            .select('*', { count: 'exact', head: true })
            .eq('date', today);

        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: dbStatus,
            uptime: process.uptime(),
            statistics: {
                total_users: usersCount,
                total_patients: patientsCount,
                total_caregivers: caregiversCount,
                total_logs: logsCount,
                active_assignments: activeAssignments,
                todays_logs: todaysLogs
            },
            services: {
                database: dbStatus,
                email: checkEmailService(),
                authentication: 'active'
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: 'Health check failed'
        });
    }
};

/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: Get system audit logs (Admin only)
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
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       500:
 *         description: Internal server error
 */
export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const action = req.query.action as string;
        const user_id = req.query.user_id as string;
        const start_date = req.query.start_date as string;
        const end_date = req.query.end_date as string;
        const offset = (page - 1) * limit;

        let query = supabaseAdmin
            .from('audit_logs')
            .select(`
        *,
        user:users (email, full_name)
      `, { count: 'exact' });

        if (action) {
            query = query.eq('action', action);
        }

        if (user_id) {
            query = query.eq('user_id', user_id);
        }

        if (start_date) {
            query = query.gte('created_at', start_date);
        }

        if (end_date) {
            query = query.lte('created_at', end_date);
        }

        const { data: logs, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        res.json({
            logs,
            pagination: {
                page,
                limit,
                total: count,
                pages: count ? Math.ceil(count / limit) : 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
};

/**
 * @swagger
 * /api/admin/setup-db:
 *   post:
 *     summary: Initiate database setup instructions (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Setup instructions retrieved
 *       500:
 *         description: Internal server error
 */
export const setupDatabase = async (req: Request, res: Response) => {
    try {
        res.json({
            message: 'Database setup instructions',
            note: 'Please run the SQL migrations manually in Supabase SQL Editor',
            steps: [
                '1. Create tables using the provided SQL schema',
                '2. Set up Row Level Security (RLS) policies',
                '3. Create indexes for performance',
                '4. Set up triggers if needed'
            ]
        });
    } catch (error) {
        res.status(500).json({ error: 'Database setup failed' });
    }
};
