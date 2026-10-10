import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const state = vi.hoisted(() => ({ jar: undefined as unknown }));
vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({ cookies: async () => state.jar }));
vi.mock('next/navigation', () => ({
  redirect: (path: string) => {
    throw new Error(`REDIRECT:${path}`);
  },
}));

import {
  createServerSupabaseClient,
  clearSupabaseSessionCookies,
} from '@/lib/supabase/server';
import { getCurrentUser, requireCurrentUser } from '@/lib/auth/current-user';
import { updateSession } from '@/lib/supabase/proxy';
import {
  cookieJar,
  cookieName,
  encodedCookie,
  installAuthFixture,
  projectUrl,
  session,
  verifiedUser,
} from './helpers/auth-fixture';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('real Supabase SSR SDK against a local Auth API fixture', () => {
  it('writes login cookies, obtains a verified identity, logs out, and removes the session', async () => {
    const fixture = installAuthFixture();
    const jar = cookieJar();
    state.jar = jar;
    const client = await createServerSupabaseClient({ writable: true });
    const signedIn = await client.auth.signInWithPassword({
      email: verifiedUser.email!,
      password: 'fixture-password',
    });
    expect(signedIn.error).toBeNull();
    expect(
      jar.writes.some(
        ({ name, value }) =>
          name.startsWith(cookieName) && value.startsWith('base64-'),
      ),
    ).toBe(true);
    expect(await getCurrentUser()).toMatchObject({ id: verifiedUser.id });
    expect((await client.auth.signOut({ scope: 'local' })).error).toBeNull();
    await clearSupabaseSessionCookies();
    expect(
      jar.writes.some(
        ({ name, value, options }) =>
          name.startsWith(cookieName) && value === '' && options.maxAge === 0,
      ),
    ).toBe(true);
    expect(await getCurrentUser()).toBeNull();
    expect(
      fixture.fetch.mock.calls.some(([url]) =>
        String(url).includes('/logout?scope=local'),
      ),
    ).toBe(true);
  });

  it('clears local Session cookies after an actual SDK logout API failure', async () => {
    installAuthFixture({ logoutFailure: true });
    const jar = cookieJar([
      { name: cookieName, value: encodedCookie(session()) },
    ]);
    state.jar = jar;
    const client = await createServerSupabaseClient({ writable: true });
    expect(
      (await client.auth.signOut({ scope: 'local' })).error,
    ).not.toBeNull();
    await clearSupabaseSessionCookies();
    expect(await getCurrentUser()).toBeNull();
    expect(
      jar.writes.some(
        ({ name, value, options }) =>
          name === cookieName && value === '' && options.maxAge === 0,
      ),
    ).toBe(true);
  });

  it('never trusts the identity embedded in a client-controlled session cookie', async () => {
    installAuthFixture();
    state.jar = cookieJar([
      {
        name: cookieName,
        value: encodedCookie({
          ...session(),
          user: { ...verifiedUser, id: 'forged-user-id' },
        }),
      },
    ]);
    expect(await getCurrentUser()).toMatchObject({ id: verifiedUser.id });
  });

  it('rejects a plausible cookie when Auth rejects its token', async () => {
    installAuthFixture({ invalidUser: true });
    state.jar = cookieJar([
      { name: cookieName, value: encodedCookie(session()) },
    ]);
    expect(await getCurrentUser()).toBeNull();
    await expect(requireCurrentUser()).rejects.toThrow('REDIRECT:/login');
  });

  it('redirects the server-side guard for an anonymous request without calling Auth', async () => {
    const fixture = installAuthFixture();
    state.jar = cookieJar();
    await expect(requireCurrentUser()).rejects.toThrow('REDIRECT:/login');
    expect(fixture.fetch).not.toHaveBeenCalled();
  });

  it('refreshes expired tokens in both the forwarded request and browser response', async () => {
    const fixture = installAuthFixture();
    const stale = encodedCookie(session(-3600));
    const request = new NextRequest('https://app.example/private', {
      headers: { cookie: `${cookieName}=${stale}` },
    });
    const { response, user } = await updateSession(request);
    expect(user?.id).toBe(verifiedUser.id);
    expect(
      fixture.fetch.mock.calls.some(([url]) =>
        String(url).includes('grant_type=refresh_token'),
      ),
    ).toBe(true);
    const changed = response.cookies.get(cookieName);
    expect(changed?.value).not.toBe(stale);
    expect(changed?.value).toBe(request.cookies.get(cookieName)?.value);
    expect(response.headers.get('x-middleware-request-cookie')).toContain(
      changed!.value,
    );
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('pragma')).toBe('no-cache');
  });

  it('clears expired chunked cookies when refresh is rejected', async () => {
    installAuthFixture({ invalidRefresh: true });
    const stale = encodedCookie(session(-3600));
    const half = Math.floor(stale.length / 2);
    const request = new NextRequest('https://app.example/private', {
      headers: {
        cookie: `${cookieName}.0=${stale.slice(0, half)}; ${cookieName}.1=${stale.slice(half)}`,
      },
    });
    const result = await updateSession(request);
    expect(result.user).toBeNull();
    expect(result.response.cookies.get(`${cookieName}.0`)?.maxAge).toBe(0);
    expect(result.response.cookies.get(`${cookieName}.1`)?.maxAge).toBe(0);
    expect(result.response.headers.get('cache-control')).toBe(
      'private, no-store',
    );
  });

  it('clears only the current project cookie namespace, including chunks and verifiers', async () => {
    installAuthFixture();
    const names = [
      cookieName,
      `${cookieName}.0`,
      `${cookieName}.1`,
      `${cookieName}-user`,
      `${cookieName}-code-verifier`,
      `${cookieName}-flow-123-code-verifier`,
      `${cookieName}-flows-code-verifier`,
    ];
    const jar = cookieJar([
      ...names.map((name) => ({ name, value: 'fixture' })),
      { name: 'theme', value: 'dark' },
      { name: 'sb-other-auth-token', value: 'other-session' },
    ]);
    state.jar = jar;
    await clearSupabaseSessionCookies();
    expect(jar.writes.map(({ name }) => name)).toEqual(names);
    expect(
      jar.writes.every(
        ({ value, options }) =>
          value === '' && options.maxAge === 0 && options.path === '/',
      ),
    ).toBe(true);
  });

  it('does not write cookies from a read-only Server Component client', async () => {
    installAuthFixture();
    const jar = cookieJar([
      { name: cookieName, value: encodedCookie(session(-3600)) },
    ]);
    state.jar = jar;
    const client = await createServerSupabaseClient();
    expect((await client.auth.getUser()).data.user?.id).toBe(verifiedUser.id);
    expect(jar.set).not.toHaveBeenCalled();
  });

  it('fails closed when configuration is missing, without breaking public login rendering', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '');
    state.jar = cookieJar();
    expect(await getCurrentUser()).toBeNull();
    const result = await updateSession(new NextRequest(`${projectUrl}/login`));
    expect(result.user).toBeNull();
    expect(result.response.headers.get('cache-control')).toBe(
      'private, no-store',
    );
  });

  it('does not leak a session from one request into a different cookie jar', async () => {
    installAuthFixture();
    state.jar = cookieJar([
      { name: cookieName, value: encodedCookie(session()) },
    ]);
    expect((await getCurrentUser())?.id).toBe(verifiedUser.id);
    state.jar = cookieJar();
    expect(await getCurrentUser()).toBeNull();
  });
});
