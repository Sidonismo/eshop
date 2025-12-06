/**
 * API endpoint pro přihlášení do administrace
 *
 * POST: Ověří uživatele a vytvoří session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username a heslo jsou povinné' },
        { status: 400 }
      );
    }

    // Najdi uživatele
    const user = getUserByUsername(username);

    if (!user) {
      return NextResponse.json(
        { error: 'Nesprávné přihlašovací údaje' },
        { status: 401 }
      );
    }

    // Ověř heslo
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Nesprávné přihlašovací údaje' },
        { status: 401 }
      );
    }

    // Vytvoř response s cookie
    const response = NextResponse.json(
      { message: 'Přihlášení úspěšné', username: user.username },
      { status: 200 }
    );

    // Nastav HTTP-only cookie pro autentizaci
    response.cookies.set('admin_session', username, {
      httpOnly: true,
      maxAge: 60 * 60 * 24, // 24 hodin
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Chyba při přihlašování:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se přihlásit' },
      { status: 500 }
    );
  }
}
