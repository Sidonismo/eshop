/**
 * Veřejný API endpoint pro získání ketubot
 *
 * Tento endpoint je přístupný bez autentizace a poskytuje
 * seznam všech ketubot pro zobrazení na veřejných stránkách.
 */

import { NextResponse } from 'next/server';
import { getAllKetubas } from '@/lib/db';

export async function GET() {
  try {
    const ketubas = getAllKetubas();
    return NextResponse.json({ ketubas }, { status: 200 });
  } catch (error) {
    console.error('Chyba při načítání ketubot:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se načíst ketuboty' },
      { status: 500 }
    );
  }
}
