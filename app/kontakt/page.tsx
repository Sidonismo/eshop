'use client';

/**
 * Kontaktní formulář pro eshop s ketubami
 *
 * Tento komponent implementuje kontaktní formulář s odesíláním emailů přes Resend API.
 *
 * Jak funguje odesílání emailů:
 * 1. Uživatel vyplní formulář (jméno, email, telefon*, zpráva)
 * 2. Při odeslání se data pošlou na API endpoint /api/contact
 * 3. API endpoint používá Resend službu pro odeslání emailu
 * 4. Email je odeslán na elias8idon@gmail.com
 * 5. Uživatel dostane zpětnou vazbu (úspěch/chyba)
 *
 * Resend konfigurace:
 * - API klíč je uložen v .env.local jako RESEND_API_KEY
 * - Zdarma až 3000 emailů měsíčně
 * - API endpoint: app/api/contact/route.ts
 */

import { useState, FormEvent } from 'react';

export default function KontaktPage() {
  /**
   * Stav formuláře - ukládá hodnoty všech polí
   * name: Jméno odesílatele (povinné)
   * email: Email odesílatele (povinné) - slouží jako reply-to adresa
   * phone: Telefon (nepovinné)
   * message: Zpráva (povinné)
   */
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  /**
   * Stav odesílání formuláře
   * idle: Formulář čeká na odeslání
   * loading: Probíhá odesílání (zobrazí se "Odesílám...")
   * success: Email byl úspěšně odeslán (zelená zpráva)
   * error: Nastala chyba (červená zpráva s detailem)
   */
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  /**
   * Chybová zpráva zobrazená uživateli
   */
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Obsluha odeslání formuláře
   *
   * Proces:
   * 1. Zabrání výchozímu chování formuláře (refresh stránky)
   * 2. Nastaví stav na "loading" - zobrazí se "Odesílám..."
   * 3. Pošle POST request na /api/contact s daty formuláře jako JSON
   * 4. API endpoint (/api/contact/route.ts) zpracuje request:
   *    - Validuje data (jméno, email, zpráva jsou povinné)
   *    - Použije Resend API pro odeslání emailu
   *    - Vrátí success nebo error response
   * 5. Při úspěchu:
   *    - Nastaví stav na "success"
   *    - Vymaže formulář
   *    - Zobrazí zelenou zprávu
   * 6. Při chybě:
   *    - Nastaví stav na "error"
   *    - Zobrazí červenou zprávu s detailem chyby
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    // Zabrání výchozímu chování (refresh stránky)
    e.preventDefault();

    // Nastaví loading stav
    setStatus('loading');
    setErrorMessage('');

    try {
      // Odešle data na API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Úspěch - email odeslán
        setStatus('success');
        // Vymaže formulář
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        // Chyba z API (např. validace, Resend API error)
        setStatus('error');
        setErrorMessage(data.error || 'Něco se pokazilo');
      }
    } catch (error) {
      // Síťová chyba nebo jiný problém
      setStatus('error');
      setErrorMessage('Nepodařilo se odeslat zprávu. Zkuste to prosím později.');
      console.error('Chyba:', error);
    }
  };

  /**
   * Obsluha změn v polích formuláře
   *
   * Používá computed property name [e.target.name] pro dynamickou
   * aktualizaci správného pole ve stavu formData.
   *
   * Např. pokud se změní pole "name", aktualizuje se formData.name
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData, // Zachová ostatní pole beze změny
      [e.target.name]: e.target.value, // Aktualizuje pouze změněné pole
    });
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <section className="text-center mb-12">
          <h1 className="text-5xl font-bold text-navy mb-4">
            Kontaktujte nás
          </h1>
          <p className="text-xl text-sage">
            Máte dotaz nebo zájem o naše ketuby? Napište nám!
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Kontaktní informace */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-navy mb-6">
              Kontaktní informace
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-2xl text-gold mr-3">📧</span>
                  <h3 className="font-bold text-navy">Email</h3>
                </div>
                <p className="text-sage ml-11">elias8idon@gmail.com</p>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <span className="text-2xl text-gold mr-3">⏰</span>
                  <h3 className="font-bold text-navy">Otevírací doba</h3>
                </div>
                <p className="text-sage ml-11">Po-Pá: 9:00 - 17:00</p>
              </div>

              <div className="mt-6 pt-6 border-t border-sage/20">
                <p className="text-sage text-sm">
                  Odpovídáme obvykle do 24 hodin. V případě срочných dotazů nás prosím kontaktujte telefonicky.
                </p>
              </div>
            </div>
          </div>

          {/* Kontaktní formulář */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-navy mb-6">
              Napište nám
            </h2>

            {status === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  ✓ Děkujeme! Vaše zpráva byla úspěšně odeslána.
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">
                  ✗ {errorMessage}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-navy font-semibold mb-2">
                  Jméno *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                  placeholder="Vaše jméno"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-navy font-semibold mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                  placeholder="vas@email.cz"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-navy font-semibold mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                  placeholder="+420 123 456 789"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-navy font-semibold mb-2">
                  Zpráva *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold resize-none"
                  placeholder="Váš dotaz nebo zpráva..."
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-gold text-white font-bold py-3 px-6 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Odesílám...' : 'Odeslat zprávu'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
