import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSupabaseClient } from '@/lib/supabase/client';
import { getSupabaseConfig } from '@/lib/supabase/config';

afterEach(() => vi.unstubAllEnvs());

describe('Supabase configuration', () => {
  it('fails clearly when public configuration is missing', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '');
    expect(() => getSupabaseConfig()).toThrow('are required');
  });

  it('rejects insecure remote URLs', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'test-publishable-key');
    expect(() => getSupabaseConfig()).toThrow('HTTPS');
  });

  it('rejects a Supabase secret key in public configuration', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      'sb_secret_test-placeholder',
    );
    expect(() => getSupabaseConfig()).toThrow('cannot use a secret key');
  });

  it('creates a client without making requests or persisting a session', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'test-publishable-key');
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    try {
      expect(createSupabaseClient().from('bootstrap_probe')).toBeDefined();
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
