import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { getSupabaseConfig } from './config';
import { authCookieName, authCookieOptions } from './cookie-options';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  response.headers.set('Cache-Control', 'private, no-store');
  let configuration: ReturnType<typeof getSupabaseConfig>;
  try {
    configuration = getSupabaseConfig();
  } catch {
    // Missing configuration cannot grant access, but the login page still renders.
    return { response, user: null };
  }
  const { url, publishableKey } = configuration;
  const changes = new Map<string, { value: string; options: CookieOptions }>();
  const cacheHeaders = new Headers();
  const supabase = createServerClient(url, publishableKey, {
    cookieOptions: { ...authCookieOptions(), name: authCookieName(url) },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          changes.set(name, { value, options });
        });
        Object.entries(headers).forEach(([key, value]) =>
          cacheHeaders.set(key, value),
        );
        response = NextResponse.next({ request });
        changes.forEach(({ value, options }, name) =>
          response.cookies.set(name, value, options),
        );
        cacheHeaders.forEach((value, key) => response.headers.set(key, value));
        response.headers.set('Cache-Control', 'private, no-store');
      },
    },
  });

  let user: User | null = null;
  try {
    // Validate with Auth, including session revocation; never authorize from getSession().
    const result = await supabase.auth.getUser();
    if (!result.error) user = result.data.user;
  } catch {
    // Auth outages must fail closed and cannot grant access from cookie claims.
  }
  return { response, user };
}
