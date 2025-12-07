/**
 * TypeScript typy pro Ketubu entitu
 */

export type Locale = 'cs' | 'en' | 'he';

/**
 * Původní jednoduchá ketuba (pro zpětnou kompatibilitu)
 */
export interface Ketuba {
  id?: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Vícejazyčná ketuba (nová databázová struktura)
 */
export interface LocalizedKetuba {
  id?: number;

  // Lokalizovaná pole
  name_cs: string;
  name_en: string;
  name_he?: string;

  description_cs?: string;
  description_en?: string;
  description_he?: string;

  category_cs?: string;
  category_en?: string;
  category_he?: string;

  // Společná pole (neměnná napříč jazyky)
  price: number;
  image?: string;  // Volitelné - může být undefined nebo prázdný string

  created_at?: string;
  updated_at?: string;
}

/**
 * Typ pro vytvoření nové ketuboty (bez automatických polí)
 */
export type CreateKetubaInput = Omit<Ketuba, 'id' | 'created_at' | 'updated_at'>;

/**
 * Typ pro vytvoření lokalizované ketuboty
 */
export type CreateLocalizedKetubaInput = Omit<
  LocalizedKetuba,
  'id' | 'created_at' | 'updated_at'
>;

/**
 * Typ pro aktualizaci ketuboty (všechna pole volitelná kromě ID)
 */
export type UpdateKetubaInput = Partial<Omit<Ketuba, 'id' | 'created_at' | 'updated_at'>>;

/**
 * Typ pro aktualizaci lokalizované ketuboty
 */
export type UpdateLocalizedKetubaInput = Partial<
  Omit<LocalizedKetuba, 'id' | 'created_at' | 'updated_at'>
>;

/**
 * Helper funkce pro získání ketuboty v konkrétním jazyce
 * Převede LocalizedKetuba na jednoduchou Ketuba podle locale
 */
export function getLocalizedKetuba(ketuba: LocalizedKetuba, locale: Locale): Ketuba {
  return {
    id: ketuba.id,
    name: ketuba[`name_${locale}`] || ketuba.name_cs,
    description: ketuba[`description_${locale}`] || ketuba.description_cs,
    category: ketuba[`category_${locale}`] || ketuba.category_cs,
    price: ketuba.price,
    image: ketuba.image,
    created_at: ketuba.created_at,
    updated_at: ketuba.updated_at,
  };
}
