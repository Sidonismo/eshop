/**
 * API endpoint pro vytvoření prvního admin uživatele
 *
 * Tento endpoint by měl být použit pouze jednou pro inicializaci.
 * V produkci by měl být zabezpečený nebo odstraněný po inicializaci.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserCount, createUser } from '@/lib/db';
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

    // Zkontroluj, jestli už existuje admin
    const userCount = getUserCount();

    if (userCount > 0) {
      return NextResponse.json(
        { error: 'Admin uživatel již existuje' },
        { status: 400 }
      );
    }

    // Hashuj heslo
    const hashedPassword = await bcrypt.hash(password, 10);

    // Vytvoř uživatele
    createUser(username, hashedPassword);

    return NextResponse.json(
      { message: 'Admin uživatel vytvořen' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Chyba při vytváření admin uživatele:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se vytvořit uživatele' },
      { status: 500 }
    );
  }
}
