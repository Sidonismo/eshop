import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-6 py-24 text-center">
      <h1 className="text-6xl font-bold text-navy mb-4">404</h1>
      <p className="text-xl text-sage mb-8">
        Stránka nebyla nalezena
      </p>
      <Link
        href="/"
        className="inline-block bg-gold text-white px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors font-semibold"
      >
        Zpět na hlavní stránku
      </Link>
    </div>
  );
}
