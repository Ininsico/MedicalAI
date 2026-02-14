
import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabaseClient';


/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: read
 *         schema:
 *           type: string
 *           enum: [true, false]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     pages: { type: integer }
 *       500:
 *         description: Internal server error
 */
export const getNotifications = async (req: Request, res: Response) => {
    try {
        const read = req.query.read as string;
        const limit = parseInt(req.query.limit as string) || 20;
        const page = parseInt(req.query.page as string) || 1;
        const offset = (page - 1) * limit;

        let query = supabaseAdmin
            .from('notifications')
            .select('*', { count: 'exact' })
            .eq('user_id', req.user.userId);

        if (read !== undefined) {
            query = query.eq('read', read === 'true');
        }

        const { data: notifications, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        res.json({
            notifications,
            pagination: {
                page,
                limit,
                total: count,
                pages: count ? Math.ceil(count / limit) : 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark a single notification as read
 *     tags: [Notifications]
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
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
export const markRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { data: notification, error } = await supabaseAdmin
            .from('notifications')
            .update({
                read: true,
                read_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', req.user.userId)
            .select()
            .single();

        if (error || !notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({
            message: 'Notification marked as read',
            notification
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: Mark all user notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       500:
 *         description: Internal server error
 */
export const markAllRead = async (req: Request, res: Response) => {
    try {
        const { error } = await supabaseAdmin
            .from('notifications')
            .update({
                read: true,
                read_at: new Date().toISOString()
            })
            .eq('user_id', req.user.userId)
            .eq('read', false);

        if (error) throw error;

        res.json({
            message: 'All notifications marked as read'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
};
