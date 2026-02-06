import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn('❌ Supabase credentials missing in backend .env');
} else {
    console.log('✅ Supabase configuration detected in backend');
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Simple check
supabase.from('profiles').select('count', { count: 'exact', head: true })
    .then(({ error }) => {
        if (error) console.error('❌ Supabase Connection Error:', error.message);
        else console.log('🚀 Supabase Database Connected Successfully');
    });
