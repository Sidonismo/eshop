/**
 * API endpoint pro správu jednotlivé ketuboty
 *
 * GET: Získá detail ketuboty
 * PUT: Aktualizuje ketubu
 * DELETE: Smaže ketubu
 */

import { NextRequest, NextResponse } from 'next/server';
import { getKetubaById, updateKetuba, deleteKetuba, Ketuba } from '@/lib/db';

// GET - Získat detail ketuboty
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ketuba = getKetubaById(parseInt(params.id));

    if (!ketuba) {
      return NextResponse.json({ error: 'Ketuba nenalezena' }, { status: 404 });
    }

    return NextResponse.json({ ketuba }, { status: 200 });
  } catch (error) {
    console.error('Chyba při načítání ketuboty:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se načíst ketubu' },
      { status: 500 }
    );
  }
}

// PUT - Aktualizovat ketubu
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: Ketuba = await request.json();

    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: 'Název a cena jsou povinné' },
        { status: 400 }
      );
    }

    const success = updateKetuba(parseInt(params.id), {
      name: body.name,
      description: body.description,
      price: body.price,
      image: body.image,
      category: body.category,
    });

    if (!success) {
      return NextResponse.json({ error: 'Ketuba nenalezena' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Ketuba aktualizována' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Chyba při aktualizaci ketuboty:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se aktualizovat ketubu' },
      { status: 500 }
    );
  }
}

// DELETE - Smazat ketubu
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = deleteKetuba(parseInt(params.id));

    if (!success) {
      return NextResponse.json({ error: 'Ketuba nenalezena' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Ketuba smazána' }, { status: 200 });
  } catch (error) {
    console.error('Chyba při mazání ketuboty:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se smazat ketubu' },
      { status: 500 }
    );
  }
}
