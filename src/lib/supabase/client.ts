import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './config';

// Infrastructure factory only. Cookie/session integration belongs to DEV-002.
export function createSupabaseClient() {
  const { url, publishableKey } = getSupabaseConfig();
  return createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
