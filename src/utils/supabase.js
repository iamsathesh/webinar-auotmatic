import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Credentials missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file or Coolify environment variables.'
  );
}

// Create client only if credentials exist, otherwise create a dummy that won't crash
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
