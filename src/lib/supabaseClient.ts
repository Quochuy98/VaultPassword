import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and set your Supabase project credentials.',
  );
}

/**
 * Creates a Supabase client with the requested session persistence.
 * Public / kiosk mode uses in-memory sessions only (persistSession: false).
 */
export function createSupabaseAuthClient(persistSession: boolean): SupabaseClient {
  return createClient(url, anonKey, {
    auth: {
      persistSession,
      autoRefreshToken: persistSession,
    },
  });
}
