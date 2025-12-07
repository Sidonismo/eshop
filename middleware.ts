/**
 * Next.js Middleware kombinující i18n routing a admin autentizaci
 *
 * Tento middleware zajišťuje:
 * 1. Automatické směrování podle jazyka (/cs/, /en/, /he/)
 * 2. Ochranu admin routes pomocí JWT validace
 *
 * Workflow:
 * 1. Admin routes jsou chráněny JWT autentizací (PŘED i18n)
 * 2. API endpointy nejsou ovlivněny i18n routingem
 * 3. Veřejné stránky používají next-intl middleware pro locale detection
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { verifyTokenEdge } from '@/lib/auth-edge';
import { locales, defaultLocale } from '@/lib/i18n';

// Vytvoř next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // Vždy zobrazovat locale v URL (/cs/, /en/, /he/)
  localeDetection: false, // Zakázat automatickou detekci - vždy použít defaultLocale
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('🔒 Middleware check:', pathname);

  // 1. ADMIN AUTENTIZACE (má prioritu před i18n)
  // Chráníme admin dashboard a admin API endpointy
  if (
    pathname.startsWith('/admin/dashboard') ||
    pathname.startsWith('/api/admin/ketubas') ||
    pathname.startsWith('/api/admin/pages')
  ) {
    const token = request.cookies.get('admin_session')?.value;

    console.log('🍪 Token exists:', !!token);

    if (!token) {
      console.log('❌ No token - redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Ověř platnost JWT tokenu (Edge runtime - async)
    const payload = await verifyTokenEdge(token);

    console.log('✅ Token valid:', !!payload);

    if (!payload) {
      // Token je neplatný nebo expirovaný - smaž a přesměruj
      console.log('❌ Invalid token - redirecting to login');
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin_session');
      return response;
    }

    console.log('✅ Access granted to:', pathname);
    // Token platný - povol přístup
    return NextResponse.next();
  }

  // 2. API ROUTES - Nechť procházejí bez i18n
  if (pathname.startsWith('/api') || pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  // 3. I18N ROUTING - Pro veřejné stránky
  // Safeguard: pokud cesta nemá platné locale prefix, přesměruj na výchozí locale
  const topLevel = pathname.split('/')[1];
  const hasValidLocalePrefix = locales.includes(topLevel as (typeof locales)[number]);
  if (!hasValidLocalePrefix && pathname !== '/') {
    // Cesta bez locale prefixu – redirect na výchozí locale se zachováním zbytku cesty
    const url = new URL(request.url);
    const rest = pathname.startsWith('/') ? pathname : `/${pathname}`;
    const redirectTo = `/${defaultLocale}${rest}`;
    url.pathname = redirectTo;
    return NextResponse.redirect(url);
  }

  // Aplikuj next-intl middleware na všechny ostatní cesty
  console.log('🌍 Applying i18n middleware to:', pathname);
  const response = intlMiddleware(request);
  console.log('🌍 i18n response:', response?.status, response?.headers.get('location'));
  return response;
}

/**
 * Konfigurace middlewaru - na které cesty se aplikuje
 *
 * Matcher pokrývá:
 * ✅ Všechny cesty kromě Next.js internals (_next, statické soubory)
 * ✅ Admin routes (chráněné JWT)
 * ✅ Veřejné stránky (i18n routing)
 * ✅ API endpointy
 */
export const config = {
  matcher: [
    // Vše kromě Next.js internals a statických souborů
    '/((?!_next|.*\\..*).*)',
  ],
};
