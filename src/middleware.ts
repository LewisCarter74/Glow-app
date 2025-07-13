
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth');
  const { pathname } = request.nextUrl;

  // Routes that require authentication
  const protectedRoutes = ['/account', '/book'];
  
  // Auth pages (login, signup)
  const publicAuthRoutes = ['/login', 'signup', '/forgot-password'];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicAuthRoute = publicAuthRoutes.some(route => pathname.startsWith(route));

  // If user is not authenticated and tries to access a protected route
  if (!authCookie && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and tries to access a login/signup page
  if (authCookie && isPublicAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
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
