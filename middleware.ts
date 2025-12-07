/**
 * Next.js Middleware pro ochranu admin routes
 *
 * Tento middleware chrání všechny /admin/* a /api/admin/* cesty kromě login endpointu.
 * Kontroluje přítomnost a platnost JWT session tokenu.
 *
 * Jak funguje:
 * 1. Při každém requestu na chráněné cesty se spustí tento middleware
 * 2. Získá JWT token z cookie "admin_session"
 * 3. Ověří platnost tokenu (signatura + expirace)
 * 4. Pokud je token platný, povolí přístup
 * 5. Pokud token chybí nebo je neplatný, přesměruje na /admin/login
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyTokenEdge } from '@/lib/auth-edge';

export async function middleware(request: NextRequest) {
  // Získej JWT token z cookie
  const token = request.cookies.get('admin_session')?.value;

  // Pokud token neexistuje, přesměruj na login
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Ověř platnost JWT tokenu (async kvůli Edge Runtime)
  const payload = await verifyTokenEdge(token);

  // Pokud je token neplatný nebo expirovaný, přesměruj na login
  if (!payload) {
    // Smaž neplatný token
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.delete('admin_session');
    return response;
  }

  // Token je platný - povol přístup
  return NextResponse.next();
}

/**
 * Konfigurace middlewaru - na které cesty se aplikuje
 *
 * Matcher chrání:
 * ✅ /admin/dashboard
 * ✅ /api/admin/ketubas
 * ✅ /api/admin/ketubas/1
 * ❌ /admin/login (povolen bez autentizace)
 * ❌ /api/admin/auth/login (povolen bez autentizace)
 * ❌ /api/admin/auth/init (povolen bez autentizace)
 */
export const config = {
  matcher: [
    '/admin/dashboard',           // Samotný dashboard
    '/admin/dashboard/:path*',    // Nested cesty pod dashboard
    '/api/admin/ketubas/:path*',  // API endpointy
  ],
};
