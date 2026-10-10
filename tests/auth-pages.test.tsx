import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const identity = vi.hoisted(() => ({ current: vi.fn(), require: vi.fn() }));
vi.mock('@/lib/auth/current-user', () => ({
  getCurrentUser: identity.current,
  requireCurrentUser: identity.require,
}));
vi.mock('@/lib/auth/actions', () => ({
  login: async () => {},
  signOut: async () => {},
}));
vi.mock('next/navigation', () => ({
  redirect: (path: string) => {
    throw new Error(`REDIRECT:${path}`);
  },
}));
import LoginPage from '@/app/login/page';
import PrivatePage from '@/app/(protected)/private/page';
import ProtectedLayout from '@/app/(protected)/layout';

beforeEach(() => {
  vi.resetAllMocks();
  identity.current.mockResolvedValue(null);
  identity.require.mockResolvedValue({
    id: 'verified-id',
    email: 'verified@example.test',
  });
});

describe('authentication pages and protected layout', () => {
  it('renders accessible credential fields and a safe return path for an anonymous visitor', async () => {
    const html = renderToStaticMarkup(
      await LoginPage({
        searchParams: Promise.resolve({
          next: '/private?tab=one',
          error: 'invalid',
        }),
      }),
    );
    expect(html).toContain('name="email"');
    expect(html).toContain('type="password"');
    expect(html).toContain('autoComplete="current-password"');
    expect(html).toContain('name="next" value="/private?tab=one"');
    expect(html).toContain('role="alert"');
  });

  it('handles repeated query parameters and never reflects unknown error details', async () => {
    const html = renderToStaticMarkup(
      await LoginPage({
        searchParams: Promise.resolve({
          next: ['/private', '//evil.example'],
          error: '<script>secret</script>',
        }),
      }),
    );
    expect(html).toContain('name="next" value="/private"');
    expect(html).not.toContain('secret');
  });

  it('redirects an authenticated visitor away from login', async () => {
    identity.current.mockResolvedValue({ id: 'verified-id' });
    await expect(
      LoginPage({ searchParams: Promise.resolve({ next: '//evil.example' }) }),
    ).rejects.toThrow('REDIRECT:/private');
  });

  it('requires a verified identity before rendering the protected page', async () => {
    const html = renderToStaticMarkup(await PrivatePage());
    expect(identity.require).toHaveBeenCalledOnce();
    expect(html).toContain('verified@example.test');
    expect(html).toContain('退出登录');
  });

  it('enforces the server guard even when Proxy is bypassed', async () => {
    identity.require.mockRejectedValue(new Error('REDIRECT:/login'));
    await expect(PrivatePage()).rejects.toThrow('REDIRECT:/login');
    await expect(
      ProtectedLayout({ children: <div>private content</div> }),
    ).rejects.toThrow('REDIRECT:/login');
  });
});
