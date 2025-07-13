
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth');
  const { pathname } = request.nextUrl;

  const isProtectedRoute = pathname.startsWith('/account') || pathname.startsWith('/book');
  const isPublicAuthRoute = ['/login', '/signup', '/forgot-password'].includes(pathname);

  // If the user is logged in
  if (authCookie) {
    // and tries to access login/signup, redirect them to the account page
    if (isPublicAuthRoute) {
      return NextResponse.redirect(new URL('/account', request.url));
    }
    // Otherwise, they can proceed
    return NextResponse.next();
  }

  // If the user is logged out
  if (!authCookie) {
    // and tries to access a protected route, redirect them to login
    if (isProtectedRoute) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectedFrom', pathname); // Remember where they were going
      return NextResponse.redirect(loginUrl);
    }
    // Otherwise, they can proceed
    return NextResponse.next();
  }

  return NextResponse.next();
}

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
