import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Browser/client-side Supabase instance (anon key).
// Guarded so the app still builds & runs in "demo mode" without env vars.
let _client: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null; // demo mode -> components fall back to sample data
  if (_client) return _client;
  _client = createClient(url, key);
  return _client;
}

export const isSupabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
