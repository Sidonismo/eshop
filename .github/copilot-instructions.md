# Copilot Instructions - Eshop s ketubami

## Přehled projektu

Eshop pro prodej ketubot s administračním rozhraním. Next.js 15 (App Router) + React + Tailwind CSS.

## Technologie

- **Frontend**: React (Next.js 15), Tailwind CSS
- **Backend**: Next.js API Routes  
- **Databáze**: JSON soubory (`data/ketubas.json`, `data/users.json`)
- **Email**: Resend API
- **Autentizace**: JWT tokens (JSON Web Tokens) s bcrypt hashováním hesel
- **Session**: Secure HTTP-only cookies (24h expirace)
- **Validace**: Zod schemas pro runtime validaci
- **Ochrana**: Next.js middleware chrání admin routes

## Struktura projektu

```
app/
├── admin/
│   ├── login/page.tsx          # Přihlašovací stránka
│   └── dashboard/page.tsx      # Admin dashboard s CRUD operacemi
├── api/
│   ├── admin/
│   │   ├── auth/               # init, login, logout endpoints (JWT)
│   │   └── ketubas/            # CRUD pro ketuboty (admin, Zod validace)
│   ├── contact/route.ts        # Kontaktní formulář (Zod validace)
│   └── ketubas/route.ts        # Veřejný seznam ketubot
├── kontakt/page.tsx            # Veřejný kontaktní formulář
├── produkt/[id]/page.tsx       # Detail produktu
└── page.tsx                    # Hlavní stránka (dynamicky načítá ketuboty)

data/
├── ketubas.json                # Databáze ketubot
└── users.json                  # Databáze uživatelů

lib/
├── db.ts                       # Databázový modul (JSON operace)
├── auth.ts                     # JWT autentizační funkce
└── validation.ts               # Zod validační schémata

types/
├── ketuba.ts                   # TypeScript typy pro Ketubu
└── user.ts                     # TypeScript typy pro Uživatele

middleware.ts                   # Next.js middleware (ochrana admin routes)
```

## Databázové schéma

### data/ketubas.json
```json
[
  {
    "id": 1,
    "name": "string",           // povinné
    "description": "string",    // nepovinné
    "price": 2500,              // povinné (Kč)
    "image": "https://...",     // nepovinné (URL)
    "category": "string",       // nepovinné
    "created_at": "ISO string",
    "updated_at": "ISO string"
  }
]
```

### data/users.json
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

#### JWT Autentizace (lib/auth.ts)
- `generateToken(username)` - Vygeneruje JWT token s 24h expiraci
- `verifyToken(token)` - Ověří platnost a signaturu tokenu
- `setAuthCookie(username)` - Nastaví secure cookie s JWT tokenem
- `clearAuthCookie()` - Smaže session cookie
- **ENV**: `JWT_SECRET` - musí být nastaven v `.env.local`

#### Middleware ochrana (middleware.ts)
- Chrání `/admin/dashboard` a `/api/admin/ketubas/*`
- Automatická validace JWT tokenu
- Přesměrování na login při neplatném tokenu
- Nezasahuje do `/admin/login` a auth endpointů

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
- ✅ JWT tokeny s automatickou expiraci
- ✅ Secure HTTP-only cookies
- ✅ Middleware ochrana admin routes
- ✅ Zod runtime validace všech vstupů
- ✅ Bcrypt hashing hesel (10 rounds)
- ✅ URL a email formát validace
- ✅ Input sanitizace (trim, toLowerCase)
- ⚠️ Pro produkci: rate limiting, CSRF tokens

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

- [ ] Upload obrázků (Cloudinary/AWS S3)
- [ ] Middleware ochrana admin routes
- [ ] Vyhledávání a filtrace
- [ ] Pagination
- [ ] Export dat (CSV/JSON)
- [ ] Bulk operace
- [ ] Audit log admin akcí
- [ ] 2FA autentizace

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