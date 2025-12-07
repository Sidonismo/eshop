/**
 * Veřejný API endpoint pro získání ketubot
 *
 * Tento endpoint je přístupný bez autentizace a poskytuje
 * seznam všech ketubot pro zobrazení na veřejných stránkách.
 * 
 * Query parametry:
 * - locale (cs|en|he) - jazyk pro lokalizaci dat
 */

import { NextResponse } from 'next/server';
import { getAllKetubas } from '@/lib/db';
import type { LocalizedKetuba } from '@/types/ketuba';

// Pomocná funkce pro transformaci LocalizedKetuba na jednoduchý formát podle locale
function transformKetubaForLocale(ketuba: LocalizedKetuba, locale: string) {
  const suffix = `_${locale}` as '_cs' | '_en' | '_he';
  
  return {
    id: ketuba.id,
    name: ketuba[`name${suffix}`] || ketuba.name_cs,
    description: ketuba[`description${suffix}`] || ketuba.description_cs,
    category: ketuba[`category${suffix}`] || ketuba.category_cs,
    price: ketuba.price,
    image: ketuba.image,
    created_at: ketuba.created_at,
    updated_at: ketuba.updated_at,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'cs';
    
    // Načti všechny ketuboty z databáze
    const ketubas = getAllKetubas() as LocalizedKetuba[];
    
    // Transformuj ketuboty podle zadaného locale
    const transformedKetubas = ketubas.map(ketuba => 
      transformKetubaForLocale(ketuba, locale)
    );
    
    return NextResponse.json({ ketubas: transformedKetubas }, { status: 200 });
  } catch (error) {
    console.error('Chyba při načítání ketubot:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se načíst ketuboty' },
      { status: 500 }
    );
  }
}
