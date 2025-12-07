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
function isAbsoluteUrl(url?: string) {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function transformKetubaForLocale(ketuba: LocalizedKetuba, locale: string, origin: string) {
  const suffix = `_${locale}` as '_cs' | '_en' | '_he';

  // resolve image: if absolute URL use it, if relative use origin + path, else fallback to placeholder
  let image = ketuba.image || '';
  if (!isAbsoluteUrl(image)) {
    if (image.startsWith('/')) {
      image = `${origin}${image}`;
    } else if (!image) {
      image = `${origin}/images/ketubah-1.svg`;
    } else {
      // non-empty but not absolute nor starting with '/', treat as relative
      image = `${origin}/${image}`;
    }
  }

  return {
    id: ketuba.id,
    name: ketuba[`name${suffix}`] || ketuba.name_cs,
    description: ketuba[`description${suffix}`] || ketuba.description_cs,
    category: ketuba[`category${suffix}`] || ketuba.category_cs,
    price: ketuba.price,
    image,
    created_at: ketuba.created_at,
    updated_at: ketuba.updated_at,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'cs';
    const origin = new URL(request.url).origin;
    
    // Načti všechny ketuboty z databáze
    const ketubas = getAllKetubas() as LocalizedKetuba[];
    
    // Transformuj ketuboty podle zadaného locale
    const transformedKetubas = ketubas.map(ketuba => 
      transformKetubaForLocale(ketuba, locale, origin)
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
