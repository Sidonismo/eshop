/**
 * API endpoint pro správu ketubot (CRUD operace)
 *
 * GET: Získá seznam všech ketubot
 * POST: Vytvoří novou ketubu
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllKetubas, createKetuba, Ketuba } from '@/lib/db';

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
export async function POST(request: NextRequest) {
  try {
    const body: Ketuba = await request.json();

    // Validace
    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: 'Název a cena jsou povinné' },
        { status: 400 }
      );
    }

    const newKetuba = createKetuba({
      name: body.name,
      description: body.description,
      price: body.price,
      image: body.image,
      category: body.category,
    });

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
