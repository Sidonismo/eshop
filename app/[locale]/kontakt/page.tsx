'use client';

/**
 * Vícejazyčná kontaktní stránka
 *
 * Tento komponent implementuje kontaktní formulář s odesíláním emailů přes Resend API.
 * Podporuje překlady pro cs/en/he pomocí next-intl.
 *
 * Workflow odesílání emailů:
 * 1. Uživatel vyplní formulář (jméno, email, telefon*, zpráva)
 * 2. Při odeslání se data pošlou na API endpoint /api/contact
 * 3. API endpoint používá Resend službu pro odeslání emailu
 * 4. Email je odeslán na elias8idon@gmail.com
 * 5. Uživatel dostane zpětnou vazbu (úspěch/chyba)
 *
 * Resend konfigurace:
 * - API klíč: RESEND_API_KEY v .env.local
 * - Zdarma až 3000 emailů měsíčně
 * - API endpoint: app/api/contact/route.ts
 */

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function KontaktPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;

  // Stav formuláře - ukládá hodnoty všech polí
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  // Stav odesílání: idle | loading | success | error
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Chybová zpráva pro uživatele
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Obsluha odeslání formuláře
   *
   * Proces:
   * 1. Zabrání výchozímu chování (refresh)
   * 2. Nastaví loading stav
   * 3. Odešle POST request na /api/contact
   * 4. API endpoint validuje a odesílá email přes Resend
   * 5. Zobrazí výsledek (success/error)
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
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
        // Chyba z API (validace, Resend error)
        setStatus('error');
        setErrorMessage(data.error || t('contact.errorMessage'));
      }
    } catch (error) {
      // Síťová chyba
      setStatus('error');
      setErrorMessage(t('contact.errorMessage'));
      console.error('Chyba při odesílání:', error);
    }
  };

  /**
   * Obsluha změn v polích formuláře
   * Používá computed property name [e.target.name]
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <section className="text-center mb-12">
          <h1 className="text-5xl font-bold text-navy mb-4">
            {t('contact.title')}
          </h1>
          <p className="text-xl text-sage">
            {t('contact.subtitle')}
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Kontaktní informace */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-navy mb-6">
              {locale === 'cs' && 'Kontaktní informace'}
              {locale === 'en' && 'Contact Information'}
              {locale === 'he' && 'פרטי קשר'}
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-2xl text-gold mr-3">📧</span>
                  <h3 className="font-bold text-navy">
                    {locale === 'cs' && 'Email'}
                    {locale === 'en' && 'Email'}
                    {locale === 'he' && 'אימייל'}
                  </h3>
                </div>
                <p className="text-sage ml-11">elias8idon@gmail.com</p>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <span className="text-2xl text-gold mr-3">📍</span>
                  <h3 className="font-bold text-navy">
                    {locale === 'cs' && 'Adresa'}
                    {locale === 'en' && 'Address'}
                    {locale === 'he' && 'כתובת'}
                  </h3>
                </div>
                <p className="text-sage ml-11">
                  {locale === 'cs' && 'Praha, Česká republika'}
                  {locale === 'en' && 'Prague, Czech Republic'}
                  {locale === 'he' && 'פראג, צ׳כיה'}
                </p>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <span className="text-2xl text-gold mr-3">⏰</span>
                  <h3 className="font-bold text-navy">
                    {locale === 'cs' && 'Pracovní doba'}
                    {locale === 'en' && 'Working Hours'}
                    {locale === 'he' && 'שעות פעילות'}
                  </h3>
                </div>
                <p className="text-sage ml-11">
                  {locale === 'cs' && 'Po-Pá: 9:00 - 17:00'}
                  {locale === 'en' && 'Mon-Fri: 9:00 - 17:00'}
                  {locale === 'he' && 'ב׳-ו׳: 9:00 - 17:00'}
                </p>
              </div>
            </div>
          </div>

          {/* Kontaktní formulář */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-navy mb-6">
              {locale === 'cs' && 'Napište nám'}
              {locale === 'en' && 'Send us a message'}
              {locale === 'he' && 'שלח לנו הודעה'}
            </h2>

            {/* Success zpráva */}
            {status === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-bold text-green-800 mb-1">
                  {t('contact.successTitle')}
                </h3>
                <p className="text-green-700 text-sm">
                  {t('contact.successMessage')}
                </p>
              </div>
            )}

            {/* Error zpráva */}
            {status === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-bold text-red-800 mb-1">
                  {t('contact.errorTitle')}
                </h3>
                <p className="text-red-700 text-sm">
                  {errorMessage}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Jméno */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-navy mb-1">
                  {t('contact.nameLabel')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-sage/30 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                  placeholder={t('contact.namePlaceholder')}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-navy mb-1">
                  {t('contact.emailLabel')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-sage/30 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                  placeholder={t('contact.emailPlaceholder')}
                />
              </div>

              {/* Telefon (volitelné) */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-navy mb-1">
                  {t('contact.phoneLabel')}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-sage/30 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                  placeholder={t('contact.phonePlaceholder')}
                />
              </div>

              {/* Zpráva */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-navy mb-1">
                  {t('contact.messageLabel')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-sage/30 rounded-md focus:outline-none focus:ring-2 focus:ring-gold resize-none"
                  placeholder={t('contact.messagePlaceholder')}
                />
              </div>

              {/* Tlačítko pro odeslání */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-gold text-white font-bold py-3 px-6 rounded-md hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? t('contact.sending') : t('contact.submit')}
              </button>
            </form>
          </div>
        </div>

        {/* Zpět na hlavní stránku */}
        <div className="text-center mt-12">
          <Link
            href={`/${locale}`}
            className="inline-block text-sage hover:text-navy transition-colors"
          >
            ← {t('common.back')}
          </Link>
        </div>
      </div>
    </div>
  );
}
