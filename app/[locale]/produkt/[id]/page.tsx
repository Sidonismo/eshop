/**
 * Vícejazyčná produktová stránka - Detail ketuboty
 * 
 * Zobrazuje detail produktu s lokalizovanými daty a překlady.
 * Podporuje fallback na statická data pokud databáze neobsahuje produkt.
 */

import { products } from '@/data/products';
import ketubas from '@/data/ketubas.json';
import Link from 'next/link';
import { notFound } from 'next/navigation';
// translations are handled in layout; avoid server helper here to prevent runtime issues
import ProductGallery from '@/components/ProductGallery';

interface ProductPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id, locale } = await params;

  // Načti produkt - podporujeme dvě datová zdroje (dev: data/products.ts, data/ketubas.json)
  const product =
    products.find((p) => String(p.id) === String(id)) ||
    (Array.isArray(ketubas) ? (ketubas as any[]).find((k) => String(k.id) === String(id)) : undefined);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Zpět na přehled */}
      <Link
        href={`/${locale}`}
        className="text-sage hover:text-gold transition-colors inline-flex items-center mb-8"
      >
        ← {locale === 'cs' ? 'Zpět na produkty' : locale === 'he' ? 'חזרה למוצרים' : 'Back to products'}
      </Link>

      <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Obrázek produktu (galerie) */}
        <div>
          {/* Support product.images (array) with fallback to single product.image */}
          {(() => {
            // @ts-expect-error runtime shape
            const images = (product as any).images ?? (product.image ? [product.image] : []);
            return <ProductGallery images={images} alt={product.name} />;
          })()}
        </div>

        {/* Detaily produktu */}
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-navy mb-4">
            {product.name}
          </h1>

          {product.description && (
            <p className="text-xl text-sage mb-6">
              {product.description}
            </p>
          )}

          {/* Cena a vlastnosti */}
          <div className="bg-white rounded-lg p-6 shadow-md mb-6">
            <div className="text-3xl font-bold text-gold mb-4">
              {product.price.toLocaleString(locale === 'cs' ? 'cs-CZ' : 'en-US')} {locale === 'cs' ? 'Kč' : 'CZK'}
            </div>

            <h3 className="font-bold text-navy mb-3">
              {locale === 'cs' && 'Zahrnuje:'}
              {locale === 'en' && 'Includes:'}
              {locale === 'he' && 'כולל:'}
            </h3>
            <ul className="space-y-2">
              {product.features?.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-gold mr-2">✓</span>
                  <span className="text-sage">{feature}</span>
                </li>
              )) || (
                <>
                  <li className="flex items-start">
                    <span className="text-gold mr-2">✓</span>
                    <span className="text-sage">
                      {locale === 'cs' && 'Ruční práce'}
                      {locale === 'en' && 'Handcrafted'}
                      {locale === 'he' && 'עבודת יד'}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gold mr-2">✓</span>
                    <span className="text-sage">
                      {locale === 'cs' && 'Archivní papír'}
                      {locale === 'en' && 'Archival paper'}
                      {locale === 'he' && 'נייר ארכיוני'}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gold mr-2">✓</span>
                    <span className="text-sage">
                      {locale === 'cs' && 'Personalizace zdarma'}
                      {locale === 'en' && 'Free personalization'}
                      {locale === 'he' && 'התאמה אישית חינם'}
                    </span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Call to action */}
          <div className="bg-gold/10 rounded-lg p-6 border-2 border-gold/20">
            <h3 className="font-bold text-navy mb-2">
              {locale === 'cs' && 'Kontaktujte nás'}
              {locale === 'en' && 'Contact us'}
              {locale === 'he' && 'צור קשר'}
            </h3>
            <p className="text-sage text-sm mb-4">
              {locale === 'cs' && 'Rádi s vámi probereme všechny detaily a vytvoříme ketubu přesně podle vašich představ.'}
              {locale === 'en' && 'We\'d love to discuss all the details and create a ketuba exactly to your specifications.'}
              {locale === 'he' && 'נשמח לדבר איתכם על כל הפרטים וליצור כתובה בדיוק לפי הצרכים שלכם.'}
            </p>
            <Link
              href={`/${locale}/kontakt`}
              className="inline-block bg-gold text-white px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors font-semibold"
            >
              {locale === 'cs' && 'Napište nám'}
              {locale === 'en' && 'Contact us'}
              {locale === 'he' && 'צור קשר'}
            </Link>
          </div>
        </div>
      </div>

      {/* O produktu */}
      <section className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-navy mb-6 text-center">
          {locale === 'cs' && 'O našich ketubách'}
          {locale === 'en' && 'About Our Ketubas'}
          {locale === 'he' && 'אודות הכתובות שלנו'}
        </h2>
        <div className="bg-white rounded-lg shadow-md p-8 text-sage space-y-4">
          <p>
            {locale === 'cs' && 'Ketuba je svatební smlouva, která má v židovské tradici hluboký význam. Nejde pouze o právní dokument, ale o umělecké dílo, které bude zdobit váš domov a připomínat vám krásný den vaší svatby.'}
            {locale === 'en' && 'A ketuba is a marriage contract that holds deep significance in Jewish tradition. It\'s not just a legal document, but a work of art that will adorn your home and remind you of your beautiful wedding day.'}
            {locale === 'he' && 'כתובה היא חוזה נישואין בעל משמעות עמוקה במסורת היהודית. זה לא רק מסמך משפטי, אלא יצירת אמנות שתקשט את ביתכם ותזכיר לכם את יום החתונה היפה שלכם.'}
          </p>
          <p>
            {locale === 'cs' && 'Každá naše ketuba je vytvořena s láskou a úctou k tradici. Pracujeme se zkušenými kalligrafy a umělci, kteří do každého kusu vkládají své umění a pozornost k detailům.'}
            {locale === 'en' && 'Each of our ketubas is created with love and respect for tradition. We work with experienced calligraphers and artists who put their artistry and attention to detail into every piece.'}
            {locale === 'he' && 'כל כתובה שלנו נוצרת באהבה ובכבוד למסורת. אנו עובדים עם קליגרפים ואמנים מנוסים שמכניסים את האמנות והתשומת לב לפרטים בכל יצירה.'}
          </p>
          <p>
            {locale === 'cs' && 'Můžete si vybrat z našich navržených stylů nebo s námi spolupracovat na vytvoření zcela unikátní ketuby, která bude odrážet váš vztah a osobní příběh.'}
            {locale === 'en' && 'You can choose from our designed styles or work with us to create a completely unique ketuba that will reflect your relationship and personal story.'}
            {locale === 'he' && 'אתם יכולים לבחור מבין הסגנונות המעוצבים שלנו או לעבוד איתנו כדי ליצור כתובה ייחודית לחלוטין שתשקף את מערכת היחסים והסיפור האישי שלכם.'}
          </p>
        </div>
      </section>
    </div>
  );
}
