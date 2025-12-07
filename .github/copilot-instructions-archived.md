/* Archived copy of `.github/copilot-instructions.md` before pruning. */

The full original instructions were archived here on 2025-12-07. If you need any removed detail, check this file or the git history.

---- Original content below ----

````instructions
# Copilot Instructions - Eshop s ketubami

Poznámka: První části popisují výchozí stav projektu (na začátku práce). Poslední část uvádí finální stav po posledních úpravách (nakonec).

## Přehled projektu

Vícejazyčný eshop pro prodej ketubot s administračním rozhraním. Next.js 15 (App Router) + React + Tailwind CSS + next-intl.

## Technologie

- **Frontend**: React (Next.js 15), Tailwind CSS
- **i18n**: next-intl (vícejazyčnost cs/en/he)
- **Backend**: Next.js API Routes  
- **Databáze**: JSON soubory (`data/ketubas.json`, `data/users.json`)
- **Email**: Resend API
- **Autentizace**: JWT tokens (JSON Web Tokens) s bcrypt hashováním hesel
- **Session**: Secure HTTP-only cookies (24h expirace)
- **Validace**: Zod schemas pro runtime validaci
- **Ochrana**: Next.js middleware chrání admin routes + i18n routing

## Struktura projektu

```
app/
├── [locale]/                   # 🆕 Vícejazyčná struktura (cs/en/he)
│   ├── layout.tsx              # Root layout s locale provider + navigace
│   ├── page.tsx                # Hlavní stránka (lokalizovaná)
│   ├── kontakt/page.tsx        # Kontaktní formulář (lokalizovaný)
│   ├── produkt/[id]/page.tsx   # Detail produktu (lokalizovaný)
│   └── [slug]/page.tsx         # 🔜 Dynamické CMS stránky
├── admin/
│   ├── login/page.tsx          # Přihlašovací stránka (bez locale)
│   └── dashboard/
│       ├── page.tsx            # 🔜 Admin dashboard (multi-lang tabs)
│       └── pages/              # 🔜 CMS správa stránek
│           └── page.tsx
├── api/
│   ├── admin/
│   │   ├── auth/               # init, login, logout endpoints (JWT)
│   │   ├── ketubas/            # 🔜 CRUD pro vícejazyčné ketuboty
│   │   └── pages/              # 🔜 CRUD pro CMS stránky
│   ├── contact/route.ts        # Kontaktní formulář (Zod validace)
│   └── ketubas/route.ts        # 🔜 Veřejný seznam ketubot (s locale)
├── globals.css

components/                      # 🆕 Sdílené komponenty
├── LanguageSwitcher.tsx        # Přepínač jazyků (dropdown)
└── admin/                      # 🔜 Admin komponenty
    ├── MultiLangInput.tsx      # Tab interface pro multi-lang
    └── PageEditor.tsx          # CMS editor

data/
├── ketubas.json                # 🔜 Databáze ketubot (multi-lang)
├── pages.json                  # 🔜 CMS stránky (multi-lang)
└── users.json                  # Databáze uživatelů

lib/
├── db.ts                       # Databázový modul (JSON operace)
├── auth.ts                     # JWT autentizační funkce (Node.js runtime)
├── auth-edge.ts                # JWT autentizační funkce (Edge runtime)
├── i18n.ts                     # 🆕 next-intl konfigurace
└── validation.ts               # 🆕 Zod validační schémata (multi-lang)

messages/                        # 🆕 Translation files
├── cs.json                     # České překlady
├── en.json                     # Anglické překlady
└── he.json                     # Hebrejské překlady (RTL)

types/
├── ketuba.ts                   # 🆕 TypeScript typy (LocalizedKetuba)
├── page.ts                     # 🆕 CMS page types
└── user.ts                     # TypeScript typy pro Uživatele

middleware.ts                   # 🆕 Kombinovaný middleware (i18n + auth)
next.config.ts                  # 🆕 Obsahuje next-intl plugin
```

## Vícejazyčnost (i18n)

### Podporované jazyky
- **cs** (Čeština) - výchozí jazyk
- **en** (English) - mezinárodní
- **he** (עברית - Hebrejština) - RTL podpora

### Routing
- Prefix-based: `/cs/`, `/en/`, `/he/`
- Automatická detekce a redirect na výchozí locale
- Zachování cesty při přepnutí jazyka (např. `/cs/produkt/1` → `/en/produkt/1`)

### Translation Files
Struktura `messages/{locale}.json`:
```json
{
  "common": { "loading", "error", "save", "cancel", ... },
  "nav": { "home", "products", "about", "contact", "admin" },
  "home": { "title", "subtitle", "viewDetails", ... },
  "product": { "details", "priceLabel", "categoryLabel", ... },
  "contact": { "title", "nameLabel", "emailLabel", ... },
  "admin": {
    "login": { ... },
    "dashboard": { "title", "tabs": {"czech", "english", "hebrew"}, ... },
    "pages": { ... }
  }
}
```

### Použití v komponentách

**Client components**:
```typescript
import { useTranslations } from 'next-intl';
const t = useTranslations();
<h1>{t('home.title')}</h1>
```

**Server components**:
```typescript
import { getTranslations } from 'next-intl/server';
const t = await getTranslations();
<h1>{t('home.title')}</h1>
```

**RTL podpora**:
```tsx
<html lang={locale} dir={locale === 'he' ? 'rtl' : 'ltr'}>
```

## JWT Dual Runtime systém

**Proč dva auth moduly?**

Next.js middleware běží v **Edge Runtime**, který nepodporuje Node.js `crypto` modul. Proto:

- `lib/auth.ts` - API routes (Node.js) - knihovna `jsonwebtoken`
- `lib/auth-edge.ts` - Middleware (Edge) - knihovna `jose` (Web Crypto API)

Oba používají stejný `JWT_SECRET` z `.env.local`.

````
