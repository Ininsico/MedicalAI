
import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabaseClient';

/**
 * Get user notifications
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

        if (error) {
            throw error;
        }

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
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

/**
 * Mark notification as read
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
        console.error('Mark read error:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};

/**
 * Mark all notifications as read
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

        if (error) {
            throw error;
        }

        res.json({
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
};
