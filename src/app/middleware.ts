import { type NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/account', '/book', '/promotions', '/referrals'];
const authRoutes = ['/login', '/signup', '/password-reset'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // This is a placeholder for a real session token check from cookies
  const hasSession = request.cookies.has('firebase_session'); 

  // If user is authenticated and tries to access auth pages, redirect to account
  if (hasSession && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/account', request.url));
  }

  // If user is not authenticated and tries to access protected routes, redirect to login
  if (!hasSession && protectedRoutes.some(route => pathname.startsWith(route))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect_to', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
