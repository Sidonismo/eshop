import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Link from 'next/link';
import '../globals.css';

/**
 * Metadata pro stránku
 */
export const metadata = {
  title: 'Ketuboty - Tradiční židovské sňatkové smlouvy',
  description: 'Ručně vyráběné ketuboty pro váš velký den',
};

/**
 * Root layout pro lokalizované stránky
 * 
 * Funkce:
 * - Obaluje každou stránku next-intl providerem s příslušnými překlady
 * - Nastavuje RTL směr pro hebrejštinu
 * - Zobrazuje navigaci s Language Switcherem
 * - Poskytuje konzistentní strukturu napříč všemi stránkami
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validace locale - pokud není podporovaný, zobraz 404
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Načti překlady pro daný locale
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {/* Navigační hlavička */}
      <header className="bg-white shadow-sm border-b border-sage/10">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo a název */}
            <Link
              href={`/${locale}`}
              className="flex items-center gap-3 group"
            >
              <span className="text-3xl text-gold group-hover:scale-110 transition-transform">✡</span>
              <div>
                <h1 className="text-2xl font-bold text-navy group-hover:text-gold transition-colors">
                  Ketuboty
                </h1>
                <p className="text-xs text-sage">
                  {locale === 'cs' && 'Tradiční umění'}
                  {locale === 'en' && 'Traditional art'}
                  {locale === 'he' && 'אמנות מסורתית'}
                </p>
              </div>
            </Link>

            {/* Navigační odkazy a Language Switcher */}
            <div className="flex items-center gap-6">
              <Link
                href={`/${locale}`}
                className="text-navy hover:text-gold transition-colors font-medium"
              >
                {locale === 'cs' && 'Produkty'}
                {locale === 'en' && 'Products'}
                {locale === 'he' && 'מוצרים'}
              </Link>
              <Link
                href={`/${locale}/kontakt`}
                className="text-navy hover:text-gold transition-colors font-medium"
              >
                {locale === 'cs' && 'Kontakt'}
                {locale === 'en' && 'Contact'}
                {locale === 'he' && 'צור קשר'}
              </Link>

              {/* Language Switcher */}
              <LanguageSwitcher />
            </div>
          </div>
        </nav>
      </header>

      {/* Hlavní obsah stránky */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-navy text-white mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="font-bold mb-2 text-gold">
                {locale === 'cs' && 'O nás'}
                {locale === 'en' && 'About us'}
                {locale === 'he' && 'אודותינו'}
              </h3>
              <p className="text-sm text-sage/80">
                {locale === 'cs' && 'Ručně vyráběné ketuboty s láskou a úctou k tradici.'}
                {locale === 'en' && 'Handcrafted ketubas with love and respect for tradition.'}
                {locale === 'he' && 'כתובות בעבודת יד באהבה ובכבוד למסורת.'}
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2 text-gold">
                {locale === 'cs' && 'Kontakt'}
                {locale === 'en' && 'Contact'}
                {locale === 'he' && 'צור קשר'}
              </h3>
              <p className="text-sm text-sage/80">
                Email: elias8idon@gmail.com
              </p>
              <p className="text-sm text-sage/80">
                {locale === 'cs' && 'Praha, Česká republika'}
                {locale === 'en' && 'Prague, Czech Republic'}
                {locale === 'he' && 'פראג, צ׳כיה'}
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2 text-gold">
                {locale === 'cs' && 'Sledujte nás'}
                {locale === 'en' && 'Follow us'}
                {locale === 'he' && 'עקבו אחרינו'}
              </h3>
              <div className="flex gap-4 justify-center md:justify-start">
                <span className="text-2xl hover:text-gold transition-colors cursor-pointer">📸</span>
                <span className="text-2xl hover:text-gold transition-colors cursor-pointer">📘</span>
              </div>
            </div>
          </div>
          <div className="text-center mt-8 pt-8 border-t border-sage/20">
            <p className="text-sm text-sage/60">
              © 2025 Ketuboty. 
              {locale === 'cs' && ' Všechna práva vyhrazena.'}
              {locale === 'en' && ' All rights reserved.'}
              {locale === 'he' && ' כל הזכויות שמורות.'}
            </p>
          </div>
        </div>
      </footer>
    </NextIntlClientProvider>
  );
}

/**
 * Generuj statické params pro všechny podporované jazyky
 * Next.js předgeneruje stránky pro cs, en, he při buildu
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
