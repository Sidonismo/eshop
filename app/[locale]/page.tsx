'use client';

/**
 * Hlavní stránka eshopu - vícejazyčná verze
 *
 * Načítá ketuboty z API endpointu a zobrazuje je v responzivní mřížce.
 * Používá next-intl pro překlady.
 */

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Ketuba {
  id: number | string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
}

// Statická fallback data
const fallbackProducts: Ketuba[] = [
  {
    id: 1,
    name: 'Klasická Ketuba',
    description: 'Tradiční svatební smlouva s elegantními hebrejskými písmeny',
    price: 5500,
    image: 'https://placehold.co/600x400/9CA986/FFFFFF?text=Klasická',
    category: 'Tradiční',
  },
  {
    id: 2,
    name: 'Moderní Ketuba',
    description: 'Současný design s minimalistickými prvky',
    price: 6200,
    image: 'https://placehold.co/600x400/9CA986/FFFFFF?text=Moderní',
    category: 'Moderní',
  },
];

export default function Home() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  
  const [ketubas, setKetubas] = useState<Ketuba[]>([]);
  const [loading, setLoading] = useState(true);

  // Načti ketuboty z databáze
  useEffect(() => {
    fetch(`/api/ketubas?locale=${locale}`)
      .then(res => res.json())
      .then(data => {
        setKetubas(data.ketubas || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Chyba při načítání ketubot:', error);
        setLoading(false);
      });
  }, [locale]);

  // Použij data z databáze, pokud existují, jinak fallback na statická data
  const displayProducts = ketubas.length > 0 ? ketubas : fallbackProducts;

  return (
    <div className="container mx-auto px-6 py-12">
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold text-navy mb-4">
          {t('home.title')}
        </h1>
        <p className="text-xl text-sage max-w-2xl mx-auto">
          {t('home.subtitle')}
        </p>
      </section>

      {loading ? (
        <div className="text-center text-sage text-xl py-12">
          {t('home.loadingProducts')}
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {displayProducts.map((product) => (
            <Link
              href={`/${locale}/produkt/${product.id}`}
              key={product.id}
              className="group"
            >
              <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                {/* Zobraz obrázek pokud existuje, jinak placeholder */}
                {product.image ? (
                  <div className="aspect-[4/3] bg-gradient-to-br from-sage/10 to-gold/10 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-gradient-to-br from-sage/10 to-gold/10 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="text-6xl mb-4 text-gold/40">✡</div>
                      <p className="text-sage/60 text-sm">{product.category || 'Ketuba'}</p>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <h2 className="text-2xl font-bold text-navy mb-2 group-hover:text-gold transition-colors">
                    {product.name}
                  </h2>

                  {product.description && (
                    <p className="text-sage mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gold">
                      {product.price.toLocaleString(locale === 'cs' ? 'cs-CZ' : 'en-US')} {locale === 'cs' ? 'Kč' : 'CZK'}
                    </span>
                    <span className="text-sage group-hover:text-navy transition-colors">
                      {t('home.viewDetails')} →
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </section>
      )}

      {displayProducts.length === 0 && !loading && (
        <div className="text-center text-sage text-xl py-12">
          {t('home.noProducts')}
        </div>
      )}

      <section className="mt-16 text-center max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-navy mb-4">
          {locale === 'cs' && 'Proč si vybrat naše ketuby?'}
          {locale === 'en' && 'Why choose our ketubas?'}
          {locale === 'he' && 'למה לבחור בכתובות שלנו?'}
        </h2>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div>
            <div className="text-3xl mb-2 text-gold">✍️</div>
            <h3 className="font-bold text-navy mb-2">
              {locale === 'cs' && 'Ruční práce'}
              {locale === 'en' && 'Handcrafted'}
              {locale === 'he' && 'עבודת יד'}
            </h3>
            <p className="text-sage text-sm">
              {locale === 'cs' && 'Každá ketuba je pečlivě vytvořena zkušenými umělci'}
              {locale === 'en' && 'Each ketuba is carefully crafted by skilled artisans'}
              {locale === 'he' && 'כל כתובה נוצרת בקפידה על ידי אמנים מיומנים'}
            </p>
          </div>
          <div>
            <div className="text-3xl mb-2 text-gold">⭐</div>
            <h3 className="font-bold text-navy mb-2">
              {locale === 'cs' && 'Prémiové materiály'}
              {locale === 'en' && 'Premium Materials'}
              {locale === 'he' && 'חומרים איכותיים'}
            </h3>
            <p className="text-sage text-sm">
              {locale === 'cs' && 'Používáme pouze archivní papír a kvalitní barvy'}
              {locale === 'en' && 'We use only archival paper and quality paints'}
              {locale === 'he' && 'אנו משתמשים רק בנייר ארכיוני וצבעים איכותיים'}
            </p>
          </div>
          <div>
            <div className="text-3xl mb-2 text-gold">💝</div>
            <h3 className="font-bold text-navy mb-2">
              {locale === 'cs' && 'Personalizace'}
              {locale === 'en' && 'Personalization'}
              {locale === 'he' && 'התאמה אישית'}
            </h3>
            <p className="text-sage text-sm">
              {locale === 'cs' && 'Přizpůsobíme každou ketubu vašim přáním'}
              {locale === 'en' && 'We customize each ketuba to your wishes'}
              {locale === 'he' && 'אנו מתאימים כל כתובה למשאלות שלכם'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
