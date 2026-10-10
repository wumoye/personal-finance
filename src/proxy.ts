import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';
import { isProtectedPath, safeNextPath } from '@/lib/auth/route-guard';

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  let target: URL | undefined;
  if (!user && isProtectedPath(request.nextUrl.pathname)) {
    target = new URL('/login', request.url);
    target.searchParams.set(
      'next',
      safeNextPath(`${request.nextUrl.pathname}${request.nextUrl.search}`),
    );
  } else if (user && request.nextUrl.pathname === '/login') {
    target = new URL(
      safeNextPath(request.nextUrl.searchParams.get('next')),
      request.url,
    );
  }
  if (!target) return response;

  const redirectResponse = NextResponse.redirect(target);
  response.cookies
    .getAll()
    .forEach((cookie) => redirectResponse.cookies.set(cookie));
  for (const key of ['cache-control', 'expires', 'pragma']) {
    const value = response.headers.get(key);
    if (value) redirectResponse.headers.set(key, value);
  }
  return redirectResponse;
}

export const config = { matcher: ['/private/:path*', '/login'] };
