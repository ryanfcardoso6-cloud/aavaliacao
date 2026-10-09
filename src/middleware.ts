import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'feedback-loja-super-seguro-jwt-secret-key-com-min-32-chars-2026'
);

const SESSION_COOKIE_NAME = 'feedback_admin_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  let isValidSession = false;
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET, { algorithms: ['HS256'] });
      isValidSession = true;
    } catch {
      isValidSession = false;
    }
  }

  // Se tentar acessar /admin/login estando autenticado, redireciona para o painel /admin
  if (pathname === '/admin/login') {
    if (isValidSession) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    const response = NextResponse.next();
    applySecurityHeaders(response);
    return response;
  }

  // Rotas protegidas do painel administrativo
  if (pathname.startsWith('/admin')) {
    if (!isValidSession) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();
  applySecurityHeaders(response);
  return response;
}

function applySecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
