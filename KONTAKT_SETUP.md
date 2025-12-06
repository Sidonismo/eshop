# Nastavení kontaktního formuláře

## Rychlý návod (Resend - DOPORUČENO)

1. **Zaregistrujte se na Resend (zdarma)**
   - Jděte na: https://resend.com/signup
   - Zaregistrujte se (zdarma až 3000 emailů/měsíc, bez kreditní karty)
   - Ověřte email

2. **Získejte API klíč**
   - Po přihlášení na https://resend.com
   - Klikněte na "API Keys" v menu
   - Klikněte "Create API Key"
   - Dejte mu název např. "Ketuby Kontakt"
   - Zkopírujte vygenerovaný klíč (začíná "re_")

3. **Vytvořte `.env.local` soubor**
   ```bash
   cp .env.example .env.local
   ```

4. **Vyplňte `.env.local`**
   ```
   RESEND_API_KEY=re_váš_skutečný_klíč_zde
   ```

5. **Restartujte development server**
   ```bash
   npm run dev
   ```

6. **Otevřete kontaktní stránku**
   - Navštivte: http://localhost:3000/kontakt
   - Formulář nyní funguje a odesílá emaily na elias8idon@gmail.com

## Proč Resend?

- ✅ Žádné složité nastavení Gmail aplikačního hesla
- ✅ Zdarma až 3000 emailů měsíčně
- ✅ Žádná kreditní karta potřeba
- ✅ Funguje okamžitě
- ✅ Profesionální email doručování

## Testování

Před nasazením do produkce otestujte formulář:
1. Vyplňte všechna pole na http://localhost:3000/kontakt
2. Klikněte na "Odeslat zprávu"
3. Zkontrolujte, že email dorazil na elias8idon@gmail.com
4. Ověřte, že se zobrazila zelená zpráva o úspěchu
5. V Resend dashboardu můžete sledovat odeslané emaily

## Vlastní doména (volitelné)

Po nastavení vlastní domény můžete změnit v `app/api/contact/route.ts`:
```typescript
from: 'Ketuby Kontakt <kontakt@vase-domena.cz>',
```
