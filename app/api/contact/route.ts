/**
 * API endpoint pro kontaktní formulář
 *
 * Tento endpoint zpracovává odeslání kontaktního formuláře a odesílá
 * email přes Resend API službu.
 *
 * Jak to funguje:
 * 1. Přijme POST request s daty formuláře (name, email, phone, message)
 * 2. Zvaliduje povinná pole (name, email, message)
 * 3. Použije Resend API pro odeslání emailu
 * 4. Vrátí success nebo error response
 *
 * Resend konfigurace:
 * - API klíč: Načítá se z .env.local (RESEND_API_KEY)
 * - From address: onboarding@resend.dev (výchozí Resend adresa)
 *   - Po nastavení vlastní domény změňte na kontakt@vase-domena.cz
 * - To address: elias8idon@gmail.com (cílová adresa pro přijetí zpráv)
 * - ReplyTo: Email odesílatele (umožňuje přímou odpověď)
 *
 * HTTP Response kódy:
 * - 200: Email úspěšně odeslán
 * - 400: Chybí povinná pole
 * - 500: Chyba při odesílání (Resend API error nebo síťová chyba)
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

/**
 * Inicializace Resend klienta
 * API klíč je načten z environment variable RESEND_API_KEY
 * Tento klíč získáte na https://resend.com/api-keys
 */
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * POST handler pro odeslání kontaktního formuláře
 */
export async function POST(request: NextRequest) {
  try {
    // Parsování JSON dat z request body
    const { name, email, phone, message } = await request.json();

    /**
     * Validace povinných polí
     * - name: Jméno odesílatele
     * - email: Email odesílatele (použit jako reply-to)
     * - message: Zpráva
     * - phone: Nepovinné
     */
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Vyplňte prosím všechna povinná pole' },
        { status: 400 }
      );
    }

    /**
     * Odeslání emailu přes Resend API
     *
     * Konfigurace:
     * - from: Musí být ověřená adresa v Resend
     *   - onboarding@resend.dev je výchozí testovací adresa (funguje zdarma)
     *   - Pro produkci: nastavte vlastní doménu a použijte kontakt@vase-domena.cz
     * - to: Array cílových adres (můžete přidat více emailů)
     * - replyTo: Email odesílatele - při odpovědi se email odešle přímo jemu
     * - subject: Předmět emailu (obsahuje jméno odesílatele)
     * - html: HTML obsah emailu (podporuje formátování)
     */
    const { data, error } = await resend.emails.send({
      from: 'Ketuby Kontakt <onboarding@resend.dev>', // ZMĚNIT po nastavení domény!
      to: ['elias8idon@gmail.com'], // Cílový email
      replyTo: email, // Umožní odpovědět přímo odesílateli
      subject: `Nová zpráva z kontaktního formuláře - ${name}`,
      html: `
        <h2>Nová zpráva z kontaktního formuláře</h2>
        <p><strong>Jméno:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Telefon:</strong> ${phone}</p>` : ''}
        <p><strong>Zpráva:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    /**
     * Kontrola chyby z Resend API
     * Možné chyby:
     * - 401: Neplatný API klíč
     * - 422: Chybný formát emailu
     * - 429: Překročen rate limit
     * - 500: Interní chyba Resend
     */
    if (error) {
      console.error('Chyba při odesílání emailu:', error);
      return NextResponse.json(
        { error: 'Nepodařilo se odeslat email. Zkuste to prosím později.' },
        { status: 500 }
      );
    }

    // Úspěch - email byl odeslán
    return NextResponse.json(
      { message: 'Email byl úspěšně odeslán', data },
      { status: 200 }
    );
  } catch (error) {
    /**
     * Zachycení obecných chyb (síťové problémy, parse errors, atd.)
     */
    console.error('Chyba při odesílání emailu:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se odeslat email. Zkuste to prosím později.' },
      { status: 500 }
    );
  }
}
