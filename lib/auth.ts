/**
 * Autentizační utilita pro JWT token handling
 *
 * Poskytuje funkce pro:
 * - Generování JWT tokenů
 * - Verifikaci JWT tokenů
 * - Bezpečné cookie operace
 */

import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// JWT secret - v produkci MUSÍ být v .env jako silný náhodný string
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Doba platnosti tokenu (24 hodin)
const TOKEN_EXPIRY = '24h';

/**
 * Payload JWT tokenu
 */
export interface TokenPayload {
  username: string;
  iat?: number;  // Issued at
  exp?: number;  // Expiration
}

/**
 * Vygeneruje JWT token pro uživatele
 *
 * @param username - Uživatelské jméno
 * @returns JWT token string
 */
export function generateToken(username: string): string {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  return jwt.sign({ username }, secret, {
    expiresIn: TOKEN_EXPIRY,
  });
}

/**
 * Ověří platnost JWT tokenu
 *
 * @param token - JWT token string
 * @returns TokenPayload pokud je token platný, null jinak
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    // Token je neplatný nebo expirovaný
    return null;
  }
}

/**
 * Nastaví admin session cookie s JWT tokenem
 *
 * Cookie konfigurace:
 * - httpOnly: true - Ochrana před XSS (JavaScript nemůže přistoupit)
 * - secure: true (pouze HTTPS v produkci)
 * - sameSite: 'lax' - Ochrana před CSRF
 * - maxAge: 24 hodin
 *
 * @param username - Uživatelské jméno
 */
export async function setAuthCookie(username: string): Promise<void> {
  const token = generateToken(username);
  const cookieStore = await cookies();

  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hodin v sekundách
    path: '/',
  });
}

/**
 * Smaže admin session cookie
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}

/**
 * Získá aktuálně přihlášeného uživatele z cookie
 *
 * @returns Username pokud je session platná, null jinak
 */
export async function getCurrentUser(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  return payload?.username || null;
}

/**
 * Ověří, zda je uživatel přihlášený
 *
 * @returns true pokud je session platná, false jinak
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}
