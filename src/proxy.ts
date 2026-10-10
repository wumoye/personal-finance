import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';
import { safeNextPath } from '@/lib/auth/route-guard';

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  if (!user && request.nextUrl.pathname.startsWith('/private')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    url.searchParams.set('next', safeNextPath(request.nextUrl.pathname));
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }
  return response;
}

export const config = { matcher: ['/private/:path*', '/login', '/auth/:path*'] };
