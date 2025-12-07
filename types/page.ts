/**
 * TypeScript typy pro CMS stránky
 */

export type Locale = 'cs' | 'en' | 'he';

/**
 * Vícejazyčná CMS stránka (databázová struktura)
 */
export interface CMSPage {
  id?: number;
  slug: string; // URL slug (bez locale prefixu)

  // Lokalizovaná pole
  title_cs: string;
  title_en: string;
  title_he?: string;

  content_cs: string; // Markdown nebo HTML
  content_en: string;
  content_he?: string;

  meta_description_cs?: string;
  meta_description_en?: string;
  meta_description_he?: string;

  // Společná pole
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Typ pro vytvoření nové stránky
 */
export type CreateCMSPageInput = Omit<CMSPage, 'id' | 'created_at' | 'updated_at'>;

/**
 * Typ pro aktualizaci stránky
 */
export type UpdateCMSPageInput = Partial<Omit<CMSPage, 'id' | 'created_at' | 'updated_at'>>;

/**
 * Lokalizovaná verze stránky (frontend)
 */
export interface LocalizedPage {
  id?: number;
  slug: string;
  title: string;
  content: string;
  metaDescription?: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Helper funkce pro získání lokalizovaných dat stránky
 */
export function getLocalizedPage(page: CMSPage, locale: Locale): LocalizedPage {
  return {
    id: page.id,
    slug: page.slug,
    title: page[`title_${locale}`] || page.title_cs,
    content: page[`content_${locale}`] || page.content_cs,
    metaDescription: page[`meta_description_${locale}`],
    published: page.published,
    createdAt: page.created_at,
    updatedAt: page.updated_at,
  };
}
