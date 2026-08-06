import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// If env vars are missing (e.g. local dev before `.env` is filled in), we
// still export a client-shaped object so imports don't crash the app. Every
// call site should check `isSupabaseConfigured` first and show a friendly
// message instead of calling into this.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
