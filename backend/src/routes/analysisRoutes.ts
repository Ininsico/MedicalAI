import express from 'express';
import { detectUnusualChanges } from '../services/analysisService';
import { supabase } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/insights', async (req: any, res) => {
    try {
        const { data: logs, error } = await supabase
            .from('symptom_logs')
            .select('*')
            .eq('user_id', req.user.id)
            .order('logged_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        const insights = detectUnusualChanges(logs || []);
        res.json({ insights: insights || ["No significant changes detected. Keep it up!"] });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
