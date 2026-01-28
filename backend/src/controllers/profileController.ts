import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getProfile = async (req: any, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error) throw error;
        return res.json(data);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const updateProfile = async (req: any, res: Response) => {
    try {
        const { full_name, role } = req.body;
        const { data, error } = await supabase
            .from('profiles')
            .update({ full_name, role, updated_at: new Date().toISOString() })
            .eq('id', req.user.id)
            .select();

        if (error) throw error;
        return res.json(data[0]);
    } catch (error: any) {
        return res.status(400).json({ error: error.message });
    }
};
