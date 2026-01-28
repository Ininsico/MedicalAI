import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getLogs = async (req: any, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('symptom_logs')
            .select('*')
            .eq('user_id', req.user.id)
            .order('logged_at', { ascending: false });

        if (error) throw error;
        return res.json(data);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const createLog = async (req: any, res: Response) => {
    const startTime = Date.now();
    try {
        const { tremor, stiffness, balance, sleep, mood, medication_adherence, side_effects, other_notes } = req.body;

        // Validate required fields
        if (tremor === undefined || stiffness === undefined || balance === undefined ||
            sleep === undefined || mood === undefined) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'All symptom metrics (tremor, stiffness, balance, sleep, mood) are required'
            });
        }

        const { data, error } = await supabase
            .from('symptom_logs')
            .insert({
                user_id: req.user.id,
                tremor,
                stiffness,
                balance,
                sleep,
                mood,
                medication_adherence,
                side_effects,
                other_notes
            })
            .select();

        if (error) throw error;

        const duration = Date.now() - startTime;
        console.log(`✅ Log created in ${duration}ms for user ${req.user.id.substring(0, 8)}`);

        return res.status(201).json(data[0]);
    } catch (error: any) {
        const duration = Date.now() - startTime;
        console.error(`❌ Log creation failed after ${duration}ms:`, error.message);
        return res.status(400).json({
            error: error.message,
            details: 'Failed to create symptom log. Please try again.'
        });
    }
};
