import Link from 'next/link';
import { notFound } from 'next/navigation';
import ketubasData from '@/data/ketubas.json';
import { locales } from '@/lib/i18n';

const pageSize = 12;

function localizedField(item: any, field: string, locale: string) {
  return item[`${field}_${locale}`] ?? item[field] ?? item[`${field}_cs`] ?? '';
}

export async function generateStaticParams() {
  // Pre-generate pages for all locales based on data length
  const items = (ketubasData as any[]) || [];
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const params: Array<{ locale: string; page: string }> = [];

  for (const locale of locales) {
    for (let p = 1; p <= pageCount; p++) {
      params.push({ locale, page: String(p) });
    }
  }

  return params;
}

export default async function Page({ params }: { params: { locale: string; page: string } }) {
  const { locale, page } = params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const items = (ketubasData as any[]) || [];
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const pageNum = Math.max(1, Math.min(Number(page) || 1, pageCount));

  if (pageNum < 1 || pageNum > pageCount) notFound();

  const start = (pageNum - 1) * pageSize;
  const display = items.slice(start, start + pageSize).map((it: any) => ({
    id: it.id,
    name: localizedField(it, 'name', locale),
    description: localizedField(it, 'description', locale),
    price: it.price || 0,
    image: it.image || (it.images && it.images[0]) || undefined,
    category: localizedField(it, 'category', locale),
  }));

  return (
    <div className="container mx-auto px-6 py-12">
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold text-navy mb-4">{locale === 'cs' ? 'Produkty' : locale === 'he' ? 'מוצרים' : 'Products'}</h1>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {display.map((product) => (
          <Link
            href={`/${locale}/produkt/${product.id}`}
            key={product.id}
            className="group"
          >
            <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
              {product.image ? (
                <div className="aspect-[4/3] bg-gradient-to-br from-sage/10 to-gold/10 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
                <h2 className="text-2xl font-bold text-navy mb-2 group-hover:text-gold transition-colors">{product.name}</h2>
                {product.description && <p className="text-sage mb-4 line-clamp-2">{product.description}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gold">{product.price.toLocaleString(locale === 'cs' ? 'cs-CZ' : 'en-US')} {locale === 'cs' ? 'Kč' : 'CZK'}</span>
                  <span className="text-sage group-hover:text-navy transition-colors">{locale === 'cs' ? 'Zobrazit' : locale === 'he' ? 'הצג' : 'View'} →</span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </section>

      {/* Pagination */}
      {items.length > pageSize && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href={`/${locale}/page/${Math.max(1, pageNum - 1)}`} className={`px-4 py-2 bg-white border rounded hover:bg-sage/5 ${pageNum === 1 ? 'opacity-50 pointer-events-none' : ''}`}>
            ← {locale === 'cs' ? 'Předchozí' : locale === 'he' ? 'הקודם' : 'Prev'}
          </Link>

          <div className="flex items-center gap-2">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
              <Link key={p} href={`/${locale}/page/${p}`} className={`px-3 py-1 rounded ${p === pageNum ? 'bg-gold text-white' : 'bg-white border'}`}>
                {p}
              </Link>
            ))}
          </div>

          <Link href={`/${locale}/page/${Math.min(pageCount, pageNum + 1)}`} className={`px-4 py-2 bg-white border rounded hover:bg-sage/5 ${pageNum === pageCount ? 'opacity-50 pointer-events-none' : ''}`}>
            {locale === 'cs' ? 'Další' : locale === 'he' ? 'הבא' : 'Next'} →
          </Link>
        </div>
      )}
    </div>
  );
}
