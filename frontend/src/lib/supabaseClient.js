import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase credentials missing! The app is currently running in local-only mode. ' +
    'Please copy .env.example to .env and add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

// Create the client (will return a dummy client or fail gracefully if keys are empty strings, 
// but we handle it safely above to avoid immediate app crashes on import).
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
