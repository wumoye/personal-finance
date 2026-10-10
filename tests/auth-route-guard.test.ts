import { describe, expect, it } from 'vitest';
import { safeNextPath } from '@/lib/auth/route-guard';

describe('safeNextPath', () => {
  it('defaults to the protected route', () => expect(safeNextPath(null)).toBe('/private'));
  it('keeps local paths', () => expect(safeNextPath('/private')).toBe('/private'));
  it('blocks protocol-relative redirects', () => expect(safeNextPath('//evil.example')).toBe('/private'));
  it('blocks absolute external redirects', () => expect(safeNextPath('https://evil.example')).toBe('/private'));
  it('blocks backslash redirects', () => expect(safeNextPath('/\\evil.example')).toBe('/private'));
});
