import type { CookieOptions } from '@supabase/ssr';

export function authCookieName(url: string): string {
  return `sb-${new URL(url).hostname.split('.')[0]}-auth-token`;
}

export function authCookieOptions(): CookieOptions {
  return {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  };
}
