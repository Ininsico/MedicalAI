import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing from environment variables.')
}

// Create a client for public/anonymous operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create a client for admin/service role operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Optional: Create a client with auth persistence options
export const supabaseWithAuth = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
})
