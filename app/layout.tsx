import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ketuby - Svatební smlouvy",
  description: "Krásné a elegantní židovské svatební smlouvy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body>
        <header className="bg-white shadow-sm">
          <nav className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <Link href="/" className="text-2xl font-bold text-gold hover:text-gold/80 transition-colors">
                  Ketuby
                </Link>
                <p className="text-sm text-sage mt-1">Svatební smlouvy s láskou vytvořené</p>
              </div>
              <div className="flex gap-6">
                <Link href="/" className="text-navy hover:text-gold transition-colors font-semibold">
                  Domů
                </Link>
                <Link href="/kontakt" className="text-navy hover:text-gold transition-colors font-semibold">
                  Kontakt
                </Link>
              </div>
            </div>
          </nav>
        </header>
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-white mt-16 py-8 border-t border-sage/20">
          <div className="container mx-auto px-6 text-center text-sage">
            <p>&copy; 2024 Ketuby. Všechna práva vyhrazena.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
