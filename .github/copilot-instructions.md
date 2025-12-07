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

## Rychlé poznámky pro současný vývoj

Poznámky níže shrnují, co je teď kritické pro pokračování práce (hotfixy a aktuální priority).

- **Nový doplňkový log:** `DEVELOPMENT_LOG_ADDITIONS/2025-12-07-hotfix.md` — obsahuje podrobný záznam posledních oprav (layouty, admin UI, validace) a TODO checklist. Přečtěte si ho při dalším kroku.
- **Root layout (`app/layout.tsx`)**: Musí obsahovat `<html>` a `<body>` a import `./globals.css` — admin stránky (`/admin`) používají root layout, takže bez něho se nenačtou globální styly.
- **Localized layout (`app/[locale]/layout.tsx`)**: Nesmí duplikovat `<html>`/`<body>` když root layout tyto tagy poskytuje; místo toho pouze obalí `children` a používá `NextIntlClientProvider`.
- **Admin API / payload**: API adminu nyní používá lokalizovaná pole (`name_cs`, `name_en`, `name_he`, `description_cs`, ...). Při volání `PUT /api/admin/ketubas/[id]` pošlete payload ve tvaru `localizedKetubaSchema` nebo mapujte lokální UI hodnoty na tato pole.
- **Načítání dat do admin UI**: `GET /api/admin/ketubas` vrací lokalizované záznamy — mapujte `name_cs/name_en/name_he` → `name` pro zobrazení v jednoduchém admin formuláři (dočasné řešení), nebo implementujte multi-lang tabs.
- **Middleware & auth**: Middleware chrání `/admin/dashboard` a `/api/admin/*`. Ujistěte se, že cookie `admin_session` je předána (`credentials: 'include'`) při testování z klienta.
- **Dev server a env**: Po změně `.env.local` restartujte dev server (`npm run dev`). Pro debugování spouštějte dev server a sledujte konzoli pro runtime chyby.
- **Tailwind a class warnings**: Některé utilitky byly normalizovány (`bg-gradient-to-br` → `bg-linear-to-br`, `aspect-[4/3]` → `aspect-4/3`, `flex-shrink-0` → `shrink-0`) — při refaktoru dodržujte aktuální naming ve `tailwind.config.ts`.
- **Krátkodobé TODO** (viz nový log): multi-language admin form, zobrazit API validace v UI, E2E test admin flow.


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
# Copilot Instructions (Pruned)

Krátký, aktuální a praktický návod pro pokračování práce — pouze to, co je nyní nezbytné.

## 1) Rychlý přehled
- Framework: Next.js 15 (App Router) + React + Tailwind CSS
- i18n: next-intl (prefix-based routes `/cs`, `/en`, `/he`)
- DB: JSON files in `data/` (`ketubas.json`, `users.json`)

## 2) Kritické poznámky pro současný vývoj
- Root layout: `app/layout.tsx` musí obsahovat `<html>` a `<body>` a import `./globals.css`. Admin pages (`/admin`) závisí na tom.
- Localized layout: `app/[locale]/layout.tsx` nesmí duplikovat `<html>`/`<body>` — používejte jen provider + wrapper pro `children`.
- Admin API payload: Admin endpoints očekávají lokalizovaná pole (`name_cs`, `name_en`, `name_he`, `description_cs`, ...). MAPujte/posílejte `localizedKetubaSchema` při `PUT /api/admin/ketubas/[id]`.
- Admin UI: `GET /api/admin/ketubas` vrací lokalizovaná data — dočasně mapujte `name_cs/name_en/name_he` → `name` pro single-lang admin UI, nebo implementujte multi-lang tabs.
- Auth: Middleware chrání `/admin/*` + `/api/admin/*`. Používejte `credentials: 'include'` při fetch volání z klienta.
- Dev: Po změně `.env.local` restartujte dev server: `npm run dev`.

## 3) Klíčové příkazy
```zsh
npm run dev      # spustí dev server
npm run build    # build + typová kontrola
rm -rf .next      # vyčistit Next.js cache
```

## 4) Důležité API endpointy
- `POST /api/admin/auth/login`  — přihlášení (cookie `admin_session`)
- `GET /api/admin/ketubas`      — seznam ketubot (localized)
- `PUT /api/admin/ketubas/[id]` — aktualizace (localized payload)

## 5) Rychlé checklisty (pro PR/QA)
- Ověřit, že `app/layout.tsx` importuje `./globals.css`.
- Ujistit se, že admin UI posílá `name_cs` + `name_en` (nebo mapování existuje).
- Po editaci env proměnných restartovat dev server.

---

Potřebné (pokud byste chtěli víc): kompletní původní instrukce jsou archivovány v `.github/copilot-instructions-archived.md`.

```json
[
  {
    "id": 1,
    "username": "admin",
    "password": "$2b$10$...",   // bcrypt hash
    "created_at": "ISO string"
  }
]
```

## Klíčové API endpointy

### Autentizace
- `POST /api/admin/auth/init` - Vytvoření prvního admin uživatele (funguje pouze při prázdné databázi)
- `POST /api/admin/auth/login` - Přihlášení (vrací JWT token v secure cookie `admin_session`)
- `POST /api/admin/auth/logout` - Odhlášení (smaže JWT cookie)

### Admin CRUD (chráněno middleware + Zod validace)
- `GET /api/admin/ketubas` - Seznam všech ketubot
- `POST /api/admin/ketubas` - Vytvoření nové ketuboty (ketubaSchema)
- `GET /api/admin/ketubas/[id]` - Detail ketuboty
- `PUT /api/admin/ketubas/[id]` - Aktualizace ketuboty (ketubaSchema)
- `DELETE /api/admin/ketubas/[id]` - Smazání ketuboty

### Veřejné
- `GET /api/ketubas` - Veřejný seznam ketubot (bez autentizace)
- `POST /api/contact` - Odeslání kontaktního formuláře (Resend API, contactSchema)

## Důležité poznámky

### Admin přihlášení
- **URL**: `http://localhost:3000/admin/login`
- **Credentials**: username: `admin`, password: `admin`
- Session cookie platí 24 hodin

### Next.js 15 specifika
- **Route handlers**: params jsou `Promise<{ id?: string | string[] }>`
- Vždy použít `await params` před přístupem k ID
- Použít standardní `Request` typ (ne `NextRequest`) pro App Router kompatibilitu

### JSON databáze
- Vhodná pro <1000 záznamů
- Synchronní operace, jednoduché
- Pro větší data doporučuji PostgreSQL/MySQL

### Bezpečnost

#### JWT Autentizace - Dual Runtime systém

**lib/auth.ts (Node.js runtime - API routes)**:
- `generateToken(username)` - Vygeneruje JWT token s 24h expirací pomocí `jsonwebtoken`
- `verifyToken(token)` - Ověří platnost a signaturu tokenu pomocí `jsonwebtoken`
- `setAuthCookie(username)` - Nastaví secure cookie s JWT tokenem
- `clearAuthCookie()` - Smaže session cookie

**lib/auth-edge.ts (Edge runtime - middleware)**:
- `verifyTokenEdge(token)` - Ověří platnost tokenu pomocí `jose` (Web Crypto API)
- **Důvod**: Middleware běží v Edge Runtime, který nepodporuje Node.js crypto
- **Async**: Edge verze je asynchronní kvůli Web Crypto API

**Environment**:
- `JWT_SECRET` - musí být nastaven v `.env.local`
- Sdílený mezi oběma runtime verzemi

**Dependencies**:
- `jsonwebtoken` - Node.js JWT (API routes)
- `jose` - Edge Runtime JWT (middleware)
- `bcryptjs` - Password hashing

#### Middleware ochrana (middleware.ts)
- Chrání `/admin/dashboard` a `/api/admin/ketubas/*`
- Automatická validace JWT tokenu pomocí `verifyTokenEdge()`
- **Async middleware** - kvůli Edge Runtime JWT verifikaci
- Přesměrování na login při neplatném tokenu
- Nezasahuje do `/admin/login` a auth endpointů
- Běží v Edge Runtime (rychlé, globální)

#### Zod validace (lib/validation.ts)
- `ketubaSchema` - validace ketuboty (name, price povinné, URL check, limits)
- `loginSchema` - validace přihlášení (username 3-50 znaků, password 6+)
- `contactSchema` - validace kontaktu (email formát, telefon regex, limity)
- `validateData(schema, data)` - helper funkce pro validaci

#### Cookie konfigurace
```typescript
{
  httpOnly: true,           // Ochrana před XSS
  secure: NODE_ENV === 'production',  // HTTPS only v produkci
  sameSite: 'lax',         // Ochrana před CSRF
  maxAge: 86400,           // 24 hodin
}
```

#### Bezpečnostní opatření
- ✅ JWT tokeny s automatickou expirací (dual runtime systém)
- ✅ Secure HTTP-only cookies
- ✅ Middleware ochrana admin routes (Edge Runtime)
- ✅ Zod runtime validace všech vstupů
- ✅ Bcrypt hashing hesel (10 rounds)
- ✅ URL a email formát validace
- ✅ Input sanitizace (trim, toLowerCase)
- ✅ `credentials: 'include'` pro správný přenos cookies
- ⚠️ Pro produkci: rate limiting, CSRF tokens

#### Známé Edge Runtime limitace
- ❌ Edge Runtime nepodporuje Node.js `crypto` modul
- ✅ Řešení: Použití `jose` (Web Crypto API) místo `jsonwebtoken`
- ✅ Middleware musí být async kvůli `jose` API
- ✅ Oba runtime systémy sdílejí stejný JWT_SECRET

### TypeScript typy
- `types/ketuba.ts` - Ketuba, CreateKetubaInput, UpdateKetubaInput
- `types/user.ts` - User, CreateUserInput, SafeUser
- Všechny typy jsou exportovány a používány v celém projektu

## UX features

### Admin dashboard
- ✅ Live preview obrázků při zadávání URL
- ✅ Miniatury obrázků v seznamu ketubot (24x24px)
- ✅ Inline editing formulář
- ✅ Potvrzovací dialog před smazáním
- ✅ Placeholder ikona ✡ pro ketuboty bez obrázku

### Hlavní stránka
- ✅ Dynamické načítání ketubot z databáze
- ✅ Loading state při načítání
- ✅ Fallback na statická data pokud databáze prázdná
- ✅ Responzivní zobrazení obrázků

## Běžné úkoly

### Vytvoření nového uživatele
```bash
# Vygenerovat bcrypt hash
node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync('heslo',10));"

# Přidat do data/users.json s novým ID a timestamp
```

### Restart po změně .env.local
```bash
# Kill server proces a restart (Next.js cachuje env vars)
npm run dev
```

### Build & Type check
```bash
npm run build  # Zkompiluje a ověří typy
```

## Známé problémy a řešení

### SQL.js nefungoval v Next.js API routes
- ❌ WebAssembly problémy v serverovém prostředí
- ✅ Řešení: Přechod na JSON databázi

### Resend API klíč neplatný
- ❌ API key is invalid (401)
- ✅ Řešení: Vytvořit nový klíč na Resend dashboardu, aktualizovat `.env.local`, restart serveru

### Next.js route handler type error
- ❌ Invalid type for function's second argument
- ✅ Řešení: Použít `Request` místo `NextRequest`, params jako `Promise<{ id?: string | string[] }>`

### Vícenásobné lockfiles warning
- ❌ Next.js detekoval více package-lock.json
- ✅ Řešení: Smazat root-level lockfiles, ponechat jen projektový

## Data flow

```
1. User přidá ketubu v adminu
   ↓
2. POST /api/admin/ketubas
   ↓
3. Uloženo do data/ketubas.json
   ↓
4. GET /api/ketubas (veřejný endpoint)
   ↓
5. Zobrazeno na hlavní stránce
```

## Kontaktní formulář

- Resend API (zdarma až 3000 emailů/měsíc)
- Výchozí from: `onboarding@resend.dev`
- Pro produkci: nastavit vlastní doménu
- ReplyTo adresa z formuláře

## Budoucí vylepšení

- [x] **Ecommerce s lokalizací a vícejazyčnými stránkami** - IMPLEMENTOVÁNO (7.12.2025)
  - ✅ next-intl integrace (cs/en/he)
  - ✅ Vícejazyčné routing (app/[locale]/*)
  - ✅ Language Switcher komponenta
  - ✅ RTL podpora pro hebrejštinu
  - ✅ Lokalizované stránky (home, kontakt, produkt)
  - ⏳ Admin multi-language tabs - ČEKÁ NA IMPLEMENTACI
  - ⏳ CMS struktura - ČEKÁ NA IMPLEMENTACI
- [ ] Upload obrázků (Cloudinary/AWS S3)
- [x] Middleware ochrana admin routes - IMPLEMENTOVÁNO
- [ ] Vyhledávání a filtrace
- [ ] Pagination
- [ ] Export dat (CSV/JSON)
- [ ] Bulk operace
- [ ] Audit log admin akcí
- [ ] 2FA autentizace

## Známé problémy a řešení

### next-intl routing setup (vyřešeno 7.12.2025)

**Problém**: 404 errors na všechny locale routes (/cs, /en, /he) i když build byl úspěšný.

**Příčina**: Nesprávná struktura root layout souborů - duplikace `<html><body>` tagů.

**Řešení**:
```
app/
  layout.tsx          // POUZE: export default function RootLayout({children}) { return children; }
  not-found.tsx       // 'use client' s <html><body><Error statusCode={404} /></body></html>
  [locale]/
    layout.tsx        // Obsahuje <html><body> + NextIntlClientProvider + navigaci
    page.tsx
```

**Klíčové poznatky**:
- Root `app/layout.tsx` NESMÍ mít `<html><body>` když používáte `[locale]/layout.tsx`
- `lib/i18n.ts` export `getRequestConfig` MUSÍ vracet `{locale, messages}` (ne jen messages)
- `app/not-found.tsx` musí být client component pro routes mimo middleware
- Duplicate keys v JSON translation files způsobují build errors

**Referenční zdroj**: [next-intl official examples](https://github.com/amannn/next-intl/tree/main/examples/example-app-router)

## Dokumentační pravidla

⚠️ **DŮLEŽITÉ**: Po každé velké změně v projektu je nutné aktualizovat:
- `ADMIN_DOKUMENTACE.md` - dokumentace admin rozhraní a API
- `DEVELOPMENT_LOG.md` - deníček změn a řešení problémů
- `.github/copilot-instructions.md` - tento soubor (shrnutí pro Copilot)

Velká změna = nový feature, změna architektury, nový endpoint, změna databázového schématu, řešení významného problému.

## Pravidla pro psaní kódu

### Komentáře v kódu

**VŽDY používej ČESKÉ komentáře** - projekt je kompletně v češtině:

```typescript
// ✅ SPRÁVNĚ - české komentáře
// Načti všechny ketuboty z databáze
const ketubas = getAllKetubas();

// Validace povinných polí
if (!name || !price) {
  throw new Error('Název a cena jsou povinné');
}

// ❌ ŠPATNĚ - anglické komentáře v českém projektu
// Load all ketubas from database
const ketubas = getAllKetubas();
```

**Výjimky**:
- JSDoc/TSDoc dokumentační komentáře mohou být v angličtině (pro lepší tooling support)
- Importy, exporty a názvy proměnných zůstávají v angličtině (standard)
- Error messages pro uživatele MUSÍ být v češtině

**Doporučení**:
- Komentáře popisují "proč", ne "co" (kód sám říká "co")
- Komplexní logika vyžaduje vysvětlující komentář
- API endpointy mají hlavičkový komentář popisující účel

## Status projektu

✅ **PLNĚ FUNKČNÍ** - Projekt je připravený k použití a rozšiřování.

## Status projektu

### ✅ Implementované funkce (7.12.2025)

**Autentizace a bezpečnost:**
- JWT dual-runtime systém (Node.js + Edge)
- Bcrypt password hashing
- Secure HTTP-only cookies
- Zod runtime validace

**Vícejazyčnost (i18n):**
- next-intl integrace (cs/en/he)
- Prefix-based routing (/cs/, /en/, /he/)
- Language Switcher s dropdown menu
- RTL podpora pro hebrejštinu
- ~100 translation keys v 3 jazycích
- Lokalizované stránky: home, kontakt, produkt detail

**Frontend:**
- Next.js 15 App Router
- Tailwind CSS styling
- Responzivní navigace s locale supportem
- Loading states a error handling

**Backend:**
- JSON databáze (users, ketubas)
- Admin API endpoints (CRUD)
- Contact form s Resend API
- Middleware kombinující i18n + JWT auth

### ⏳ Čeká na implementaci

**Admin CMS multi-language:**
- Multi-language tabs v admin dashboardu
- Inline editing pro LocalizedKetuba (name_cs/en/he, description_cs/en/he)
- CMS page management (pages.json + CRUD API)

**API rozšíření:**
- `/api/ketubas` s locale query parametrem
- `/api/admin/pages` CRUD endpoints
- Migrace dat na multilingual strukturu

**Testing:**
- ⚠️ Dev server funkční, ale čeká na browser test
- Build úspěšný (18 routes vygenerováno)
- Middleware logy ukazují správné 307/200 responses

### 🔴 Aktuální status (7.12.2025 - konec session)

**PŘIPRAVENO K TESTOVÁNÍ** - Server kompiluje, middleware funguje, čeká se na manuální test v prohlížeči.

**Poslední známý stav:**
- Build: ✅ Úspěšný (všech 18 routes vygenerováno)
- Middleware: ✅ Funkční (307 redirect / → /cs, 200 response na /cs)
- Kompilace: ✅ 750 modulů kompilováno
- Browser test: ⏳ Pending (terminál přerušován Ctrl+C)

**Příští kroky:**
1. Spustit dev server a otestovat http://localhost:3000 v prohlížeči
2. Ověřit Language Switcher funkčnost (cs/en/he přepínání)
3. Zkontrolovat RTL layout pro hebrejštinu (dir="rtl")
4. Otestovat navigaci mezi lokalizovanými stránkami
5. Po ověření funkčnosti implementovat admin multi-language tabs

# Copilot Instructions – Eshop

Stručné pokyny pro práci v projektu (Next.js 15 + next-intl).

## Klíčové informace
- Routy jsou prefixované locale: `/cs`, `/en`, `/he`.
- Middleware kombinuje i18n routing a JWT ochranu admin částí.
- Překlady jsou v `messages/{locale}.json` – musí být validní JSON.

## Časté úlohy
- Dev server:
  ```zsh
  npm run dev
  ```
- Build a typová kontrola:
  ```zsh
  npm run build
  ```
- Vyčistit Next.js cache:
  ```zsh
  rm -rf .next
  ```

## i18n (next-intl)
- Konfigurace v `lib/i18n.ts` – používá bezpečný fallback na `cs`, když je locale neplatné.
- V `app/[locale]/layout.tsx` používej `await params` a validaci locale.

## Middleware
- Ochrana admin cest (`/admin/dashboard`, `/api/admin/*`) pomocí cookie `admin_session`.
- Veřejné cesty prochází i18n middlewarem a vynucují prefix locale.

## Backend
- Veřejný API: `GET /api/ketubas?locale=cs|en|he` – vrací lokalizovaná data.
- Admin API: CRUD pro ketuboty (chráněno JWT v cookie).

## Tipy
- Pokud se v devu objeví 404 na všech URL, vymaž `.next` a zkontroluj `lib/i18n.ts` (fallback).
- Při práci s fallback daty sjednoť typy (např. `id` může být `number | string`).

## Finální stav (nakonec)
- i18n fallback: `lib/i18n.ts` při neplatném/nezjištěném locale používá výchozí `cs` místo 404.
- Safeguard v `middleware.ts`: cesty bez locale prefixu se přesměrují na `/${defaultLocale}` se zachováním zbytku cesty.
- `app/[locale]/page.tsx`: odstraněn import `data/products.ts` (typový konflikt), přidán malý `fallbackProducts`, sjednocené typy `id: number | string`.


