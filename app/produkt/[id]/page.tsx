import { products } from '@/data/products';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = products.find(p => p.id === id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <Link
        href="/"
        className="text-sage hover:text-gold transition-colors inline-flex items-center mb-8"
      >
        ← Zpět na přehled
      </Link>

      <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="aspect-[3/4] bg-gradient-to-br from-sage/10 to-gold/10 flex items-center justify-center p-12">
            <div className="text-center">
              <div className="text-9xl mb-8 text-gold/40">✡</div>
              <p className="text-sage/60 text-lg">{product.category}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-navy mb-4">
            {product.name}
          </h1>

          <p className="text-xl text-sage mb-6">
            {product.description}
          </p>

          <div className="bg-white rounded-lg p-6 shadow-md mb-6">
            <div className="text-3xl font-bold text-gold mb-4">
              {product.price.toLocaleString('cs-CZ')} Kč
            </div>

            <h3 className="font-bold text-navy mb-3">Zahrnuje:</h3>
            <ul className="space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-gold mr-2">✓</span>
                  <span className="text-sage">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gold/10 rounded-lg p-6 border-2 border-gold/20">
            <h3 className="font-bold text-navy mb-2">Kontaktujte nás pro objednávku</h3>
            <p className="text-sage text-sm mb-4">
              Rádi s vámi probereme všechny detaily a vytvoříme ketubu přesně podle vašich představ.
            </p>
            <a
              href="mailto:info@ketuby.cz"
              className="inline-block bg-gold text-white px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors font-semibold"
            >
              Napište nám
            </a>
          </div>
        </div>
      </div>

      <section className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-navy mb-6 text-center">
          O našich ketubách
        </h2>
        <div className="bg-white rounded-lg shadow-md p-8 text-sage space-y-4">
          <p>
            Ketuba je svatební smlouva, která má v židovské tradici hluboký význam.
            Nejde pouze o právní dokument, ale o umělecké dílo, které bude zdobit váš domov
            a připomínat vám krásný den vaší svatby.
          </p>
          <p>
            Každá naše ketuba je vytvořena s láskou a úctou k tradici. Pracujeme s
            zkušenými kalligrafy a umělci, kteří do každého kusu vkládají své umění
            a pozornost k detailům.
          </p>
          <p>
            Můžete si vybrat z našich navržených stylů nebo s námi spolupracovat na
            vytvoření zcela unikátní ketuby, která bude odrážet váš vztah a osobní příběh.
          </p>
        </div>
      </section>
    </div>
  );
}

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}
