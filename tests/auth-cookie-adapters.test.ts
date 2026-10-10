import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import type { CookieMethodsServer } from '@supabase/ssr';
import {
  cookieJar,
  cookieName,
  projectUrl,
  verifiedUser,
} from './helpers/auth-fixture';

const state = vi.hoisted(() => ({
  options: undefined as { cookies: CookieMethodsServer } | undefined,
  jar: undefined as unknown,
  getUser: vi.fn(),
}));
vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({ cookies: async () => state.jar }));
vi.mock('@supabase/ssr', () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: { cookies: CookieMethodsServer },
  ) => {
    state.options = options;
    return { auth: { getUser: state.getUser } };
  },
}));
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { updateSession } from '@/lib/supabase/proxy';
import { authCookieOptions } from '@/lib/supabase/cookie-options';

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', projectUrl);
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'fixture-key');
  state.getUser.mockReset();
  state.getUser.mockResolvedValue({
    data: { user: verifiedUser },
    error: null,
  });
});
afterEach(() => vi.unstubAllEnvs());

const change = {
  name: cookieName,
  value: 'refreshed',
  options: { path: '/', sameSite: 'lax' as const },
};

describe('cookie write boundaries', () => {
  it('does not swallow cookie-write errors in writable actions', async () => {
    const jar = cookieJar();
    jar.set.mockImplementation(() => {
      throw new Error('Read-only cookie store');
    });
    state.jar = jar;
    await createServerSupabaseClient({ writable: true });
    expect(() => state.options!.cookies.setAll!([change], {})).toThrow(
      'Read-only cookie store',
    );
  });

  it('does not attempt cookie mutation during read-only rendering', async () => {
    const jar = cookieJar();
    state.jar = jar;
    await createServerSupabaseClient();
    await state.options!.cookies.setAll!([change], {});
    expect(jar.set).not.toHaveBeenCalled();
  });

  it('preserves prior cookie changes and Auth cache headers across multiple refresh batches', async () => {
    state.getUser.mockImplementation(async () => {
      await state.options!.cookies.setAll!(
        [{ ...change, name: `${cookieName}.0` }],
        { 'Cache-Control': 'no-store', Expires: '0', Pragma: 'no-cache' },
      );
      await state.options!.cookies.setAll!(
        [{ ...change, name: `${cookieName}.1` }],
        {},
      );
      return { data: { user: verifiedUser }, error: null };
    });
    const request = new NextRequest('https://app.example/private');
    const { response } = await updateSession(request);
    expect(response.cookies.get(`${cookieName}.0`)?.value).toBe('refreshed');
    expect(response.cookies.get(`${cookieName}.1`)?.value).toBe('refreshed');
    expect(request.cookies.get(`${cookieName}.0`)?.value).toBe('refreshed');
    expect(request.cookies.get(`${cookieName}.1`)?.value).toBe('refreshed');
    expect(response.headers.get('pragma')).toBe('no-cache');
    expect(response.headers.get('expires')).toBe('0');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('rejects user data returned together with an Auth error', async () => {
    state.getUser.mockResolvedValue({
      data: { user: verifiedUser },
      error: { message: 'Invalid token' },
    });
    expect(
      (await updateSession(new NextRequest('https://app.example/private')))
        .user,
    ).toBeNull();
  });

  it('fails closed on a thrown Auth outage', async () => {
    state.getUser.mockRejectedValue(new Error('Auth unavailable'));
    const { response, user } = await updateSession(
      new NextRequest('https://app.example/private'),
    );
    expect(user).toBeNull();
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('uses secure cookies in production and allows HTTP localhost development', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(authCookieOptions()).toMatchObject({
      secure: true,
      path: '/',
      sameSite: 'lax',
    });
    vi.stubEnv('NODE_ENV', 'development');
    expect(authCookieOptions().secure).toBe(false);
  });
});
