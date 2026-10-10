import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const updateSession = vi.hoisted(() => vi.fn());
vi.mock('@/lib/supabase/proxy', () => ({ updateSession }));
import { proxy, config } from '@/proxy';
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';

beforeEach(() => updateSession.mockReset());

function response() {
  const result = NextResponse.next();
  result.cookies.set('sb-test-auth-token.0', '', {
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: true,
  });
  result.headers.set('Cache-Control', 'private, no-store');
  result.headers.set('Pragma', 'no-cache');
  result.headers.set('Expires', '0');
  return result;
}

describe('authentication Proxy', () => {
  it('redirects anonymous requests and preserves query, deletion cookies and cache protection', async () => {
    updateSession.mockResolvedValue({ response: response(), user: null });
    const result = await proxy(
      new NextRequest('https://app.example/private/nested?tab=one'),
    );
    const location = new URL(result.headers.get('location')!);
    expect(location.pathname).toBe('/login');
    expect(location.searchParams.get('next')).toBe('/private/nested?tab=one');
    expect(result.cookies.get('sb-test-auth-token.0')).toMatchObject({
      value: '',
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
      secure: true,
    });
    expect(result.headers.get('cache-control')).toBe('private, no-store');
    expect(result.headers.get('pragma')).toBe('no-cache');
    expect(result.headers.get('expires')).toBe('0');
    expect(result.headers.has('x-middleware-next')).toBe(false);
  });

  it('returns the original refreshed response for an authenticated protected request', async () => {
    const original = response();
    updateSession.mockResolvedValue({
      response: original,
      user: { id: 'verified-id' },
    });
    expect(await proxy(new NextRequest('https://app.example/private'))).toBe(
      original,
    );
  });

  it('keeps anonymous login available', async () => {
    const original = response();
    updateSession.mockResolvedValue({ response: original, user: null });
    expect(await proxy(new NextRequest('https://app.example/login'))).toBe(
      original,
    );
  });

  it('redirects a signed-in visitor from login without allowing external destinations', async () => {
    updateSession.mockResolvedValue({
      response: response(),
      user: { id: 'verified-id' },
    });
    const result = await proxy(
      new NextRequest('https://app.example/login?next=//evil.example'),
    );
    expect(result.headers.get('location')).toBe('https://app.example/private');
    expect(result.cookies.get('sb-test-auth-token.0')?.maxAge).toBe(0);
  });

  it.each(['/private', '/private/deep', '/login'])(
    'matches %s in the actual Next.js matcher',
    (url) => {
      expect(
        unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }),
      ).toBe(true);
    },
  );
  it.each(['/', '/private-other', '/_next/static/file.js'])(
    'leaves %s outside the Auth matcher',
    (url) => {
      expect(
        unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }),
      ).toBe(false);
    },
  );
});
