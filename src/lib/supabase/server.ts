import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseConfig } from './config';
import { authCookieName, authCookieOptions } from './cookie-options';

export async function createServerSupabaseClient({ writable = false } = {}) {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabaseConfig();
  return createServerClient(url, publishableKey, {
    cookieOptions: { ...authCookieOptions(), name: authCookieName(url) },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Rendering is read-only; Proxy writes refreshed cookies before rendering.
        // Actions opt in to writes and must surface failures instead of pretending success.
        if (!writable) return;
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      },
    },
  });
}

export async function clearSupabaseSessionCookies() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return;
  const name = authCookieName(url);
  const cookieStore = await cookies();
  // Includes token chunks, user cookie, and PKCE verifier/index/flow cookies.
  for (const cookie of cookieStore.getAll()) {
    if (
      cookie.name === name ||
      cookie.name.startsWith(`${name}.`) ||
      cookie.name.startsWith(`${name}-`)
    ) {
      cookieStore.set(cookie.name, '', { ...authCookieOptions(), maxAge: 0 });
    }
  }
}
