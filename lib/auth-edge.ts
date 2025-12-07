/**
 * Edge Runtime kompatibilní autentizační utilita
 * 
 * Používá jose místo jsonwebtoken pro Edge Runtime support.
 * 
 * Proč? Next.js middleware běží v Edge Runtime, který nepodporuje
 * Node.js 'crypto' modul. Standardní 'jsonwebtoken' library ho vyžaduje,
 * takže musíme použít 'jose' (Web Crypto API kompatibilní).
 * 
 * Používá se POUZE v middleware.ts
 * Pro API routes používej lib/auth.ts
 */

import { SignJWT, jwtVerify } from 'jose';

/**
 * Získá JWT secret jako Uint8Array pro jose knihovnu
 * 
 * Jose vyžaduje secret jako Uint8Array (TextEncoder),
 * na rozdíl od jsonwebtoken který akceptuje string
 */
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
  iat?: number;  // Issued at timestamp
  exp?: number;  // Expiration timestamp
}

/**
 * Ověří platnost JWT tokenu (Edge Runtime kompatibilní)
 * 
 * ASYNC funkce - jose používá Web Crypto API, které je asynchronní
 * (na rozdíl od jsonwebtoken který je synchronní)
 *
 * @param token - JWT token string
 * @returns TokenPayload pokud je token platný, null jinak
 */
export async function verifyTokenEdge(token: string): Promise<TokenPayload | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    
    // Jose vrací obecný JWTPayload typ
    // Musíme ověřit že obsahuje naše vlastní pole (username)
    // a pak explicitně přetypovat přes 'unknown' (TypeScript vyžaduje)
    if (payload && typeof payload.username === 'string') {
      return payload as unknown as TokenPayload;
    }
    return null;
  } catch (error) {
    // Token je neplatný, expirovaný, nebo má špatnou signaturu
    return null;
  }
}
}
