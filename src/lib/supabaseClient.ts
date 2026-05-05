import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True when Vite embedded non-empty Supabase URL + anon key at build time.
 * Avoid throwing at module load so the app can show a config screen instead of a blank page.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(url?.trim() && anonKey?.trim());
}

/**
 * Creates a Supabase client with the requested session persistence.
 * Public / kiosk mode uses in-memory sessions only (persistSession: false).
 */
export function createSupabaseAuthClient(persistSession: boolean): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and set your Supabase project credentials.',
    );
  }
  return createClient(url!, anonKey!, {
    auth: {
      persistSession,
      autoRefreshToken: persistSession,
    },
  });
}
