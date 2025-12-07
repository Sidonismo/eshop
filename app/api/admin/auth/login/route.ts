/**
 * API endpoint pro přihlášení do administrace
 *
 * POST: Ověří uživatele a vytvoří JWT session
 */

import { NextResponse } from 'next/server';
import { getUserByUsername } from '@/lib/db';
import { setAuthCookie } from '@/lib/auth';
import { loginSchema, validateData } from '@/lib/validation';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validace vstupních dat
    const validation = validateData(loginSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Nesprávná data', errors: validation.errors },
        { status: 400 }
      );
    }

    const { username, password } = validation.data;

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

    // Nastav JWT session cookie
    await setAuthCookie(user.username);

    return NextResponse.json(
      { message: 'Přihlášení úspěšné', username: user.username },
      { status: 200 }
    );
  } catch (error) {
    console.error('Chyba při přihlašování:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se přihlásit' },
      { status: 500 }
    );
  }
}
