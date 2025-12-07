/**
 * Konfigurace internalizace (i18n) pro next-intl
 * 
 * Podporované jazyky:
 * - cs (Čeština) - výchozí
 * - en (English)
 * - he (עברית - Hebrejština)
 */

import { getRequestConfig } from 'next-intl/server';

// Podporované jazyky
export const locales = ['cs', 'en', 'he'] as const;
export type Locale = (typeof locales)[number];

// Výchozí jazyk
export const defaultLocale: Locale = 'cs';

/**
 * Validace locale parametru
 */
export function isValidLocale(locale: unknown): locale is Locale {
  return locales.includes(locale as Locale);
}

/**
 * Konfigurace pro next-intl
 * Načítá příslušný soubor s překlady podle locale
 */
export default getRequestConfig(async ({ locale }) => {
  // Validace locale s bezpečným fallbackem na výchozí jazyk
  const safeLocale = isValidLocale(locale) ? locale : defaultLocale;

  return {
    locale: safeLocale,
    messages: (await import(`@/messages/${safeLocale}.json`)).default,
  };
});
