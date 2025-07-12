import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Try to get the auth cookie
  const authCookie = request.cookies.get('auth');

  // Define protected routes
  const protectedRoutes = ['/account', '/book', '/promotions', '/referrals'];
  const publicAuthRoutes = ['/login', '/signup', '/forgot-password'];
  const { pathname } = request.nextUrl;

  // If the user is trying to access a protected route without an auth cookie,
  // redirect them to the login page.
  if (!authCookie && protectedRoutes.includes(pathname)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If the user is authenticated and tries to access a public auth page,
  // redirect them to their account page.
  if (authCookie && publicAuthRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/account', request.url));
  }

  // Otherwise, continue as normal
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};