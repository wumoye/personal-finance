'use client';

import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseConfig } from './config';
import { authCookieName, authCookieOptions } from './cookie-options';

export function createBrowserSupabaseClient() {
  const { url, publishableKey } = getSupabaseConfig();
  return createBrowserClient(url, publishableKey, {
    cookieOptions: { ...authCookieOptions(), name: authCookieName(url) },
  });
}
