import { describe, expect, it } from 'vitest';
import { isProtectedPath, safeNextPath } from '@/lib/auth/route-guard';

describe('safeNextPath', () => {
  it.each([
    null,
    undefined,
    ['//evil.example'],
    42,
    '',
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    '/\n/evil.example',
    '/private/../../login',
    '/private/../../%2f%2fevil.example',
    '/login',
    '/private-other',
    '/%70rivate',
  ])('blocks unsafe, non-string, or unprotected destinations: %j', (value) => {
    expect(safeNextPath(value)).toBe('/private');
  });
  it('preserves a protected destination with query and fragment', () => {
    expect(safeNextPath('/private/nested?tab=a%20b#detail')).toBe(
      '/private/nested?tab=a%20b#detail',
    );
  });
});

describe('protected path boundary', () => {
  it.each(['/private', '/private/', '/private/nested'])('protects %s', (path) =>
    expect(isProtectedPath(path)).toBe(true),
  );
  it.each(['/', '/login', '/private-other'])(
    'does not confuse %s with a protected route',
    (path) => expect(isProtectedPath(path)).toBe(false),
  );
});
