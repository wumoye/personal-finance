import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  clear: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: mocks.create,
  clearSupabaseSessionCookies: mocks.clear,
}));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidate }));
vi.mock('next/navigation', () => ({
  redirect: (path: string) => {
    throw new Error(`REDIRECT:${path}`);
  },
}));
import { login, signOut } from '@/lib/auth/actions';

function form(values: Record<string, string | undefined> = {}) {
  const data = new FormData();
  Object.entries({
    email: 'user@example.test',
    password: 'existing-password',
    next: '/private?tab=one',
    ...values,
  }).forEach(
    ([name, value]) => typeof value === 'string' && data.set(name, value),
  );
  return data;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.create.mockResolvedValue({
    auth: { signInWithPassword: mocks.signIn, signOut: mocks.signOut },
  });
  mocks.signIn.mockResolvedValue({
    data: {
      user: { id: 'verified-id' },
      session: { access_token: 'fixture-token' },
    },
    error: null,
  });
  mocks.signOut.mockResolvedValue({ error: null });
  mocks.clear.mockResolvedValue(undefined);
});

describe('login Server Action', () => {
  it('validates credentials, ignores a forged userId, and invalidates the router cache', async () => {
    await expect(
      login(form({ email: ' user@example.test ', userId: 'attacker' })),
    ).rejects.toThrow('REDIRECT:/private?tab=one');
    expect(mocks.create).toHaveBeenCalledWith({ writable: true });
    expect(mocks.signIn).toHaveBeenCalledWith({
      email: 'user@example.test',
      password: 'existing-password',
    });
    expect(mocks.revalidate).toHaveBeenCalledWith('/', 'layout');
  });

  it.each([
    { email: 'not-an-email' },
    { password: '' },
    { password: 'x'.repeat(4097) },
  ])('rejects invalid input before contacting Auth: %j', async (values) => {
    await expect(login(form(values))).rejects.toThrow(
      'REDIRECT:/login?error=invalid',
    );
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('rejects file inputs rather than coercing them into credentials', async () => {
    const data = form();
    data.set('email', new Blob(['user@example.test']), 'email.txt');
    await expect(login(data)).rejects.toThrow('error=invalid');
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it('keeps a safe return destination on rejected credentials without disclosing Auth details', async () => {
    mocks.signIn.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Sensitive provider details' },
    });
    await expect(login(form())).rejects.toThrow(
      'REDIRECT:/login?error=invalid&next=%2Fprivate%3Ftab%3Done',
    );
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });

  it('does not accept a user object without an authenticated session', async () => {
    mocks.signIn.mockResolvedValue({
      data: { user: { id: 'unverified' }, session: null },
      error: null,
    });
    await expect(login(form())).rejects.toThrow('error=invalid');
  });

  it('falls back to /private for an external next value', async () => {
    await expect(login(form({ next: '//evil.example' }))).rejects.toThrow(
      'REDIRECT:/private',
    );
  });

  it('reports service or cookie-write failures without claiming success', async () => {
    mocks.signIn.mockRejectedValue(new Error('Cookie write failed'));
    await expect(login(form())).rejects.toThrow(
      'REDIRECT:/login?error=unavailable',
    );
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });
});

describe('logout Server Action', () => {
  it('revokes only this session, clears cookies and invalidates previously visited pages', async () => {
    await expect(signOut()).rejects.toThrow('REDIRECT:/login');
    expect(mocks.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(mocks.clear).toHaveBeenCalledOnce();
    expect(mocks.revalidate).toHaveBeenCalledWith('/', 'layout');
  });

  it('clears local cookies even when remote revocation fails, and reports the failure', async () => {
    mocks.signOut.mockResolvedValue({ error: { message: 'Auth unavailable' } });
    await expect(signOut()).rejects.toThrow('REDIRECT:/login?error=signout');
    expect(mocks.clear).toHaveBeenCalledOnce();
  });

  it('clears local cookies even when client creation or the request throws', async () => {
    mocks.create.mockRejectedValue(new Error('Network unavailable'));
    await expect(signOut()).rejects.toThrow('error=signout');
    expect(mocks.clear).toHaveBeenCalledOnce();
  });

  it('does not pretend logout succeeded if local cookie cleanup fails', async () => {
    mocks.clear.mockRejectedValue(new Error('Cannot write cookies'));
    await expect(signOut()).rejects.toThrow('Cannot write cookies');
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });
});
