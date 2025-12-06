'use client';

/**
 * Hlavní stránka eshopu - zobrazuje ketuboty z databáze
 *
 * Načítá ketuboty z API endpointu /api/ketubas a zobrazuje je
 * v responzivní mřížce. Pokud jsou v databázi ketuboty, zobrazí je,
 * jinak zobrazí fallback na statická data.
 */

import { useState, useEffect } from 'react';
import { products } from '@/data/products';
import Link from 'next/link';

interface Ketuba {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
}

export default function Home() {
  const [ketubas, setKetubas] = useState<Ketuba[]>([]);
  const [loading, setLoading] = useState(true);

  // Načti ketuboty z databáze
  useEffect(() => {
    fetch('/api/ketubas')
      .then(res => res.json())
      .then(data => {
        setKetubas(data.ketubas || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Chyba při načítání ketubot:', error);
        setLoading(false);
      });
  }, []);

  // Použij data z databáze, pokud existují, jinak fallback na statická data
  const displayProducts = ketubas.length > 0 ? ketubas : products;

  return (
    <div className="container mx-auto px-6 py-12">
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold text-navy mb-4">
          Ketuby
        </h1>
        <p className="text-xl text-sage max-w-2xl mx-auto">
          Každá svatební smlouva je jedinečným uměleckým dílem,
          které oslavuje vaše spojení a tradici
        </p>
      </section>

      {loading ? (
        <div className="text-center text-sage text-xl py-12">
          Načítám ketuboty...
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {displayProducts.map((product) => (
            <Link
              href={`/produkt/${product.id}`}
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
                      {product.price.toLocaleString('cs-CZ')} Kč
                    </span>
                    <span className="text-sage group-hover:text-navy transition-colors">
                      Zjistit více →
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
          Zatím nejsou žádné ketuboty k dispozici.
        </div>
      )}

      <section className="mt-16 text-center max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-navy mb-4">
          Proč si vybrat naše ketuby?
        </h2>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div>
            <div className="text-3xl mb-2 text-gold">✍️</div>
            <h3 className="font-bold text-navy mb-2">Ruční práce</h3>
            <p className="text-sage text-sm">Každá ketuba je pečlivě vytvořena zkušenými umělci</p>
          </div>
          <div>
            <div className="text-3xl mb-2 text-gold">⭐</div>
            <h3 className="font-bold text-navy mb-2">Prémiové materiály</h3>
            <p className="text-sage text-sm">Používáme pouze archivní papír a kvalitní barvy</p>
          </div>
          <div>
            <div className="text-3xl mb-2 text-gold">💝</div>
            <h3 className="font-bold text-navy mb-2">Personalizace</h3>
            <p className="text-sage text-sm">Přizpůsobíme každou ketubu vašim přáním</p>
          </div>
        </div>
      </section>
    </div>
  );
}
