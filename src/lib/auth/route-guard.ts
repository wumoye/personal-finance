export function isProtectedPath(pathname: string): boolean {
  return pathname === '/private' || pathname.startsWith('/private/');
}

export function safeNextPath(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\\\x00-\x20\x7f]/.test(value)
  )
    return '/private';

  try {
    const url = new URL(value, 'https://app.invalid');
    if (
      url.origin !== 'https://app.invalid' ||
      !isProtectedPath(url.pathname)
    ) {
      return '/private';
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/private';
  }
}
