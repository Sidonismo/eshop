/**
 * Edge Runtime kompatibilní autentizační utilita
 * 
 * Používá jose místo jsonwebtoken pro Edge Runtime support
 */

import { SignJWT, jwtVerify } from 'jose';

// JWT secret - v produkci MUSÍ být v .env jako silný náhodný string
const getSecret = () => {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  return new TextEncoder().encode(secret);
};

// Doba platnosti tokenu (24 hodin)
const TOKEN_EXPIRY = '24h';

/**
 * Payload JWT tokenu
 */
export interface TokenPayload {
  username: string;
  iat?: number;
  exp?: number;
}

/**
 * Ověří platnost JWT tokenu (Edge Runtime kompatibilní)
 *
 * @param token - JWT token string
 * @returns TokenPayload pokud je token platný, null jinak
 */
export async function verifyTokenEdge(token: string): Promise<TokenPayload | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as TokenPayload;
  } catch (error) {
    // Token je neplatný nebo expirovaný
    return null;
  }
}
