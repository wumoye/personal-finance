import { vi } from 'vitest';
import type { User } from '@supabase/supabase-js';

export const projectUrl = 'https://auth-test.supabase.co';
export const cookieName = 'sb-auth-test-auth-token';
export const verifiedUser: User = {
  id: 'verified-user-id',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'user@example.test',
  app_metadata: { provider: 'email' },
  user_metadata: {},
  created_at: '2026-01-01T00:00:00Z',
};

export function session(expiresIn = 3600) {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
  // Synthetic JWT for the local Auth API fixture; it is never a real credential.
  const token =
    [
      { alg: 'HS256', typ: 'JWT' },
      { sub: verifiedUser.id, exp: expiresAt, aud: 'authenticated' },
    ]
      .map((part) => Buffer.from(JSON.stringify(part)).toString('base64url'))
      .join('.') + '.fixture-signature';
  return {
    access_token: token,
    refresh_token: 'fixture-refresh-token',
    token_type: 'bearer',
    expires_in: expiresIn,
    expires_at: expiresAt,
    user: verifiedUser,
  };
}

export function encodedCookie(value: unknown) {
  return `base64-${Buffer.from(JSON.stringify(value)).toString('base64url')}`;
}

export function cookieJar(initial: { name: string; value: string }[] = []) {
  const values = new Map(initial.map(({ name, value }) => [name, value]));
  const writes: {
    name: string;
    value: string;
    options: {
      maxAge?: number;
      path?: string;
      sameSite?: string;
      secure?: boolean;
    };
  }[] = [];
  return {
    getAll: () => [...values].map(([name, value]) => ({ name, value })),
    set: vi.fn((name: string, value: string, options = {}) => {
      writes.push({ name, value, options });
      values.set(name, value);
    }),
    writes,
  };
}

export function installAuthFixture({
  invalidRefresh = false,
  invalidUser = false,
  logoutFailure = false,
} = {}) {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', projectUrl);
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'fixture-publishable-key');
  const fresh = session();
  const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url,
    );
    if (url.origin !== projectUrl) throw new Error('Unexpected fixture host');
    const json = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), {
        status,
        headers: {
          'Content-Type': 'application/json',
          'X-Supabase-Api-Version': '2024-01-01',
        },
      });
    if (url.pathname === '/auth/v1/token') {
      if (
        url.searchParams.get('grant_type') === 'refresh_token' &&
        invalidRefresh
      ) {
        return json(
          {
            code: 400,
            error_code: 'refresh_token_not_found',
            msg: 'Invalid refresh token',
          },
          400,
        );
      }
      return json(fresh);
    }
    if (url.pathname === '/auth/v1/user') {
      if (invalidUser)
        return json(
          { code: 401, error_code: 'bad_jwt', msg: 'Invalid JWT' },
          401,
        );
      const authorization = new Headers(init?.headers).get('authorization');
      if (!authorization?.startsWith('Bearer '))
        return json({ msg: 'Unauthorized' }, 401);
      return json(verifiedUser);
    }
    if (url.pathname === '/auth/v1/logout') {
      return logoutFailure ? json({ msg: 'Unavailable' }, 500) : json({});
    }
    throw new Error('Unexpected fixture endpoint');
  });
  vi.stubGlobal('fetch', fetch);
  return { fetch, fresh };
}
