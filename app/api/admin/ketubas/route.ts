/**
 * API endpoint pro správu ketubot (CRUD operace)
 *
 * GET: Získá seznam všech ketubot (vrací LocalizedKetuba)
 * POST: Vytvoří novou ketubu (očekává LocalizedKetuba formát)
 */

import { NextResponse } from 'next/server';
import { getAllKetubas, createKetuba } from '@/lib/db';
import { localizedKetubaSchema, validateData } from '@/lib/validation';

// GET - Získat všechny ketuboty
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

// POST - Vytvořit novou ketubu
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validace vstupních dat pomocí localizedKetubaSchema
    const validation = validateData(localizedKetubaSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Nesprávná data', errors: validation.errors },
        { status: 400 }
      );
    }

    const newKetuba = createKetuba(validation.data);

    return NextResponse.json(
      { message: 'Ketuba vytvořena', id: newKetuba.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Chyba při vytváření ketuboty:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se vytvořit ketubu' },
      { status: 500 }
    );
  }
}
