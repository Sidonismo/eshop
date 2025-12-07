'use client';

/**
 * Komponenta pro přepínání jazyků
 * 
 * Zobrazuje dropdown menu s dostupnými jazyky a umožňuje
 * přepnout na jiný jazyk zachováním aktuální cesty.
 */

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { locales, type Locale } from '@/lib/i18n';

// Mapování locale na lidsky čitelné názvy a vlajky
const LOCALE_NAMES: Record<Locale, string> = {
  cs: '🇨🇿 Čeština',
  en: '🇬🇧 English',
  he: '🇮🇱 עברית',
};

export default function LanguageSwitcher() {
  const params = useParams();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = (params.locale as Locale) || 'cs';

  /**
   * Vytvoří URL pro jiný jazyk zachováním aktuální cesty
   * Např. /cs/produkt/1 → /en/produkt/1
   */
  const getLocalizedPath = (newLocale: Locale): string => {
    if (!pathname) return `/${newLocale}`;
    
    // Odstraň aktuální locale z cesty
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '');
    
    // Přidej nový locale
    return `/${newLocale}${pathWithoutLocale}`;
  };

  return (
    <div className="relative inline-block text-left">
      {/* Tlačítko pro otevření menu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-navy shadow-sm ring-1 ring-inset ring-sage/20 hover:bg-sage/5 focus:outline-none focus:ring-2 focus:ring-gold"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{LOCALE_NAMES[currentLocale]}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Overlay pro zavření při kliknutí mimo */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1" role="menu">
              {locales.map((locale) => (
                <Link
                  key={locale}
                  href={getLocalizedPath(locale)}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2 text-sm ${
                    locale === currentLocale
                      ? 'bg-sage/10 text-navy font-semibold'
                      : 'text-sage hover:bg-sage/5 hover:text-navy'
                  }`}
                  role="menuitem"
                >
                  {LOCALE_NAMES[locale]}
                  {locale === currentLocale && (
                    <span className="ml-2 text-gold">✓</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
