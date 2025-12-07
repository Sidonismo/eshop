## Oprava 404 na všech URL (12/2025)

### Kontext
Projekt používá next-intl s prefixovými locale routami (`/cs`, `/en`, `/he`) a kombinovaný middleware (i18n + JWT).

### Kdy se zobrazí 404
- Locale je neplatné nebo chybí (dříve `notFound()` v `lib/i18n.ts`).
- Cesta obchází middleware matcher (např. interní nebo špatně napsané URL).
- Chyby při načítání překladů (`messages/*.json`) – nevalidní JSON, duplicitní klíče.

### Změny pro stabilitu
- `lib/i18n.ts`: Přidán bezpečný fallback na výchozí locale `cs` místo striktního `notFound()`.
  - Díky tomu se v dev režimu minimalizují 404 kvůli locale.
- `app/[locale]/page.tsx`: Odstraněn import `data/products.ts` (typový konflikt `id: string`) a přidán malý `fallbackProducts` s kompatibilními typy.
- Po větších změnách vymazat `.next` cache a restartovat dev server.

### Rychlé postupy (pro admina)
- Vyčištění cache a restart:
  ```zsh
  rm -rf .next
  npm run dev
  ```
- Ověření routování:
  - `http://localhost:3000/` → redirect na `/cs`
  - `http://localhost:3000/cs`, `…/en`, `…/he`

### Poznámky k middleware
- Middleware chrání `/admin/dashboard` a `/api/admin/*` pomocí JWT (cookie `admin_session`).
- i18n middleware je aplikován na veřejné cesty a vždy vynucuje prefix locale.
- Matcher: `'/((?!_next|.*\..*).*)'` – ignoruje Next.js internals a statické soubory.

### Best practices
- Překlady v `messages/*`: udržovat validní JSON bez duplicit.
- Při refaktorech typů udržovat kompatibilitu mezi daty z API a fallback daty.
- V produkci ponechat striktnější chování (404) a zvážit guardy v middleware.

# Dokumentace administračního rozhraní

## Přehled

Administrační rozhraní umožňuje správu ketubot v eshopu. Zahrnuje autentizaci, seznam ketubot a CRUD operace (vytvoření, čtení, aktualizace, smazání).

Změny v adminu se automaticky projeví na veřejných stránkách eshopu.

## Technologie

- **Databáze**: JSON soubory (data/ketubas.json, data/users.json)
- **Autentizace**: JWT tokens (JSON Web Tokens) s bcrypt hashováním hesel
- **Session**: Secure HTTP-only cookies s automatickou expiraci (24h)
- **Middleware**: Next.js middleware chrání všechny admin routes
- **Validace**: Zod schemas pro runtime validaci API vstupů
- **Framework**: Next.js 15 (App Router)
- **UI**: React s Tailwind CSS

## Nové funkce (aktualizace)

- ✅ Propojení s veřejnými stránkami - změny v adminu se zobrazí na hlavní stránce
- ✅ Náhled obrázků ve formuláři - live preview při zadávání URL
- ✅ Miniatury obrázků v seznamu ketubot
- ✅ JSON databáze místo SQLite - jednodušší, spolehlivejší
- 🔒 **JWT autentizace** - bezpečné tokeny místo plain text
- 🔒 **Middleware ochrana** - automatická ochrana admin routes
- ✅ **Zod validace** - runtime validace všech vstupů
- 🔒 **Secure cookies** - httpOnly, sameSite, secure flags
- ✅ **Centralizované typy** - TypeScript typy v samostatných souborech
- 🌍 **Vícejazyčnost** - databáze podporuje cs/en/he (7.12.2025)
- ⏳ **Multi-language admin UI** - ČEKÁ NA IMPLEMENTACI

## Struktura souborů

```
app/
├── admin/
│   ├── login/
│   │   └── page.tsx          # Přihlašovací stránka
│   └── dashboard/
│       └── page.tsx           # Admin dashboard s CRUD operacemi
├── api/
│   └── admin/
│       ├── auth/
│       │   ├── init/
│       │   │   └── route.ts   # Vytvoření prvního admin uživatele
│       │   ├── login/
│       │   │   └── route.ts   # Přihlášení (JWT)
│       │   └── logout/
│       │       └── route.ts   # Odhlášení
│       └── ketubas/
│           ├── route.ts       # GET (seznam), POST (nová ketuba)
│           └── [id]/
│               └── route.ts   # GET, PUT, DELETE pro konkrétní ketubu
lib/
├── db.ts                      # Databázový modul (JSON operace)
├── auth.ts                    # JWT autentizační funkce (Node.js runtime)
├── auth-edge.ts               # JWT autentizační funkce (Edge runtime - middleware)
└── validation.ts              # Zod validační schémata
types/
├── ketuba.ts                  # TypeScript typy pro Ketubu
└── user.ts                    # TypeScript typy pro Uživatele
data/
├── ketubas.json               # JSON databáze ketubot
└── users.json                 # JSON databáze uživatelů
middleware.ts                  # Next.js middleware (ochrana admin routes)
```

## JWT Autentizace - Dual Runtime systém

### Proč dva auth moduly?

Next.js middleware běží v **Edge Runtime**, který nepodporuje Node.js `crypto` modul. Standardní JWT knihovna `jsonwebtoken` ho však vyžaduje. Proto používáme:

- **lib/auth.ts** - Pro API routes (Node.js runtime) - knihovna `jsonwebtoken`
- **lib/auth-edge.ts** - Pro middleware (Edge runtime) - knihovna `jose` (Web Crypto API)

Oba moduly používají **stejný JWT_SECRET** z environment variables.

### Technické detaily

**Node.js runtime (`lib/auth.ts`)**:
```typescript
import jwt from 'jsonwebtoken';

export function generateToken(username: string): string {
  const secret = process.env.JWT_SECRET || 'fallback';
  return jwt.sign({ username }, secret, { expiresIn: '24h' });
}

export function verifyToken(token: string): TokenPayload | null {
  const secret = process.env.JWT_SECRET || 'fallback';
  return jwt.verify(token, secret) as TokenPayload;
}
```

**Edge runtime (`lib/auth-edge.ts`)**:
```typescript
import { jwtVerify } from 'jose';

export async function verifyTokenEdge(token: string): Promise<TokenPayload | null> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback');
  const { payload } = await jwtVerify(token, secret);
  return payload as TokenPayload;
}
```

**Klíčové rozdíly**:
- Edge verze je **async** (Web Crypto API)
- Edge verze vyžaduje secret jako `Uint8Array` (TextEncoder)
- Oba sdílejí stejný `TokenPayload` typ

### Dependencies

```json
{
  "jsonwebtoken": "^9.x.x",      // Node.js JWT
  "jose": "^5.x.x",               // Edge Runtime JWT
  "bcryptjs": "^2.x.x",           // Password hashing
  "zod": "^3.x.x"                 // Validace
}

```

## Nastavení a spuštění

### 1. Instalace závislostí

```bash
npm install
```

### 2. Konfigurace environment variables

Vytvořte soubor `.env.local` (zkopírujte z `.env.example`):

```env
# JWT Secret - vygenerujte silný náhodný klíč
JWT_SECRET=your-super-secret-key-change-this-in-production

# Resend API klíč pro emailový formulář
RESEND_API_KEY=re_your_api_key
```

**Generování JWT_SECRET**:
```bash
openssl rand -base64 32
```

### 3. Vytvoření prvního admin uživatele

**Důležité**: Toto je nutné udělat PŘED prvním přihlášením!

Můžete použít:

#### Varianta A: cURL (z terminálu)

```bash
curl -X POST http://localhost:3000/api/admin/auth/init \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"vase-silne-heslo"}'
```

#### Varianta B: Postman/Insomnia

```
POST http://localhost:3000/api/admin/auth/init
Content-Type: application/json

{
  "username": "admin",
  "password": "vase-silne-heslo"
}
```

#### Varianta C: JavaScript (browser console)

```javascript
fetch('http://localhost:3000/api/admin/auth/init', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'vase-silne-heslo'
  })
}).then(r => r.json()).then(console.log);
```

**Poznámka**: Endpoint `/api/admin/auth/init` funguje pouze pokud v databázi ještě NENÍ žádný uživatel. Po vytvoření prvního uživatele již nepůjde vytvořit další tímto způsobem (bezpečnostní opatření).

### 4. Přihlášení do administrace

1. Navštivte: **http://localhost:3000/admin/login**
2. Zadejte username a heslo vytvořené v kroku 3
3. Po úspěšném přihlášení:
   - Obdržíte JWT token v secure cookie
   - Budete přesměrováni na dashboard
   - Session platí 24 hodin

**Bezpečnost**:
- JWT token je podepsaný a šifrovaný
- Cookie je HTTP-only (JavaScriptu nepřístupná)
- Secure flag v produkci (pouze HTTPS)
- SameSite=lax ochrana před CSRF

## Ochrana admin routes

Všechny admin cesty jsou chráněny Next.js middleware (`middleware.ts`):

**Chráněné cesty**:
- `/admin/dashboard` - Admin panel
- `/api/admin/ketubas` - CRUD operace
- `/api/admin/ketubas/[id]` - Detail operace

**Necháněné cesty**:
- `/admin/login` - Přihlašovací stránka
- `/api/admin/auth/login` - Login endpoint
- `/api/admin/auth/init` - Inicializace uživatele

**Chování middleware**:
1. Kontroluje přítomnost JWT tokenu v cookie
2. Validuje signaturu a expiraci tokenu
3. Pokud není platný - přesměruje na `/admin/login`
4. Pokud je platný - povolí přístup

## Použití admin dashboardu

### Přehled funkcí

Admin dashboard zobrazuje:
- Seznam všech ketubot
- Tlačítko pro přidání nové ketuboty
- Pro každou ketubu: tlačítka "Upravit" a "Smazat"
- Tlačítko "Odhlásit se" v hlavičce

### Přidání nové ketuboty

1. Klikněte na tlačítko **"＋ Přidat novou ketubu"**
2. Vyplňte formulář:
   - **Název*** (povinné) - Název ketuboty (1-200 znaků)
   - **Popis** (nepovinné) - Detailní popis (max 2000 znaků)
   - **Cena*** (povinné) - Cena v Kč (kladné číslo, max 1,000,000)
   - **URL obrázku** (nepovinné) - Platná URL adresa obrázku
   - **Kategorie** (nepovinné) - např. "Tradiční", "Moderní", "Custom" (max 100 znaků)
3. Klikněte **"Přidat ketubu"**
4. Data jsou validována Zod schématem
5. Ketuba se objeví v seznamu

**Validace**:
- Název a cena jsou povinné
- URL musí být platný formát
- Všechny textové vstupy jsou automaticky trimované
- Cena musí být kladné číslo

### Úprava ketuboty

1. Najděte ketubu v seznamu
2. Klikněte na tlačítko **"Upravit"**
3. Formulář se vyplní aktuálními hodnotami
4. Změňte požadované údaje
5. Klikněte **"Uložit změny"**

### Smazání ketuboty

1. Najděte ketubu v seznamu
2. Klikněte na tlačítko **"Smazat"**
3. Potvrďte smazání v dialogu
4. Ketuba bude odstraněna z databáze

### Odhlášení

Klikněte na tlačítko **"Odhlásit se"** v pravém horním rohu.

## API Endpointy

### Autentizace

#### POST /api/admin/auth/init
Vytvoření prvního admin uživatele (funguje pouze pokud databáze neobsahuje žádného uživatele).

**Request:**
```json
{
  "username": "admin",
  "password": "silne-heslo"
}
```

**Response (201):**
```json
{
  "message": "Admin uživatel vytvořen"
}
```

#### POST /api/admin/auth/login
Přihlášení do administrace.

**Validace**: `loginSchema` (Zod)
- username: min 3 znaky, max 50, alfanumerické + _-
- password: min 6 znaků, max 100

**Request:**
```json
{
  "username": "admin",
  "password": "heslo"
}
```

**Response (200):**
```json
{
  "message": "Přihlášení úspěšné",
  "username": "admin"
}
```

Nastaví secure HTTP-only cookie `admin_session` s JWT tokenem:
- `httpOnly: true` - ochrana před XSS
- `secure: true` (v produkci) - pouze HTTPS
- `sameSite: 'lax'` - ochrana před CSRF
- `maxAge: 86400` (24 hodin)

**Chybové response (400)**:
```json
{
  "error": "Nesprávná data",
  "errors": ["Username musí mít alespoň 3 znaky"]
}
```

#### POST /api/admin/auth/logout
Odhlášení z administrace.

**Response (200):**
```json
{
  "message": "Odhlášení úspěšné"
}
```

Smaže secure cookie `admin_session` s JWT tokenem.

### Správa ketubot

#### GET /api/admin/ketubas
Získá seznam všech ketubot.

**Response (200):**
```json
{
  "ketubas": [
    {
      "id": 1,
      "name": "Tradiční ketuba",
      "description": "Krásná ručně psaná ketuba",
      "price": 2500,
      "image": "https://example.com/image.jpg",
      "category": "Tradiční",
      "created_at": "2024-12-06 15:30:00",
      "updated_at": "2024-12-06 15:30:00"
    }
  ]
}
```

#### POST /api/admin/ketubas
Vytvoří novou ketubu.

**Validace**: `ketubaSchema` (Zod)
- name: povinné, 1-200 znaků, trim
- description: volitelné, max 2000 znaků, trim
- price: povinné, kladné číslo, max 1,000,000
- image: volitelné, platná URL
- category: volitelné, max 100 znaků, trim

**Request:**
```json
{
  "name": "Moderní ketuba",
  "description": "Moderní design s geometrickými vzory",
  "price": 3000,
  "image": "https://example.com/modern.jpg",
  "category": "Moderní"
}
```

**Response (201):**
```json
{
  "message": "Ketuba vytvořena",
  "id": 2
}
```

**Chybové response (400)**:
```json
{
  "error": "Nesprávná data",
  "errors": [
    "Název je povinný",
    "Cena musí být kladné číslo"
  ]
}
```

#### GET /api/admin/ketubas/[id]
Získá detail konkrétní ketuboty.

**Response (200):**
```json
{
  "ketuba": {
    "id": 1,
    "name": "Tradiční ketuba",
    "description": "Krásná ručně psaná ketuba",
    "price": 2500,
    "image": "https://example.com/image.jpg",
    "category": "Tradiční",
    "created_at": "2024-12-06 15:30:00",
    "updated_at": "2024-12-06 15:30:00"
  }
}
```

#### PUT /api/admin/ketubas/[id]
Aktualizuje ketubu.

**Validace**: `ketubaSchema` (Zod) - stejná pravidla jako POST

**Request:**
```json
{
  "name": "Tradiční ketuba - aktualizováno",
  "description": "Nový popis",
  "price": 2800,
  "image": "https://example.com/new-image.jpg",
  "category": "Tradiční"
}
```

**Response (200):**
```json
{
  "message": "Ketuba aktualizována"
}
```

**Chybové response (400)**:
```json
{
  "error": "Nesprávná data",
  "errors": ["Obrázek musí být platná URL"]
}
```

#### DELETE /api/admin/ketubas/[id]
Smaže ketubu.

**Response (200):**
```json
{
  "message": "Ketuba smazána"
}
```

## Databázové schéma (JSON)

Databáze používá JSON soubory uložené v adresáři `data/`.

### data/ketubas.json

Obsahuje pole objektů s ketubami:

```json
[
  {
    "id": 1,
    "name": "Tradiční ketuba",
    "description": "Krásná ručně psaná ketuba",
    "price": 2500,
    "image": "https://example.com/image.jpg",
    "category": "Tradiční",
    "created_at": "2025-12-06T15:30:00.000Z",
    "updated_at": "2025-12-06T15:30:00.000Z"
  }
]
```

| Pole | Typ | Popis |
|------|-----|-------|
| id | number | Unikátní ID (auto increment) |
| name | string | Název ketuboty (povinné) |
| description | string | Popis ketuboty (nepovinné) |
| price | number | Cena v Kč (povinné) |
| image | string | URL obrázku (nepovinné) |
| category | string | Kategorie (nepovinné) |
| created_at | string | ISO datum vytvoření |
| updated_at | string | ISO datum poslední aktualizace |

### data/users.json

Obsahuje pole objektů s uživateli:

```json
[
  {
    "id": 1,
    "username": "admin",
    "password": "$2a$10$...",
    "created_at": "2025-12-06T15:00:00.000Z"
  }
]
```

| Pole | Typ | Popis |
|------|-----|-------|
| id | number | Unikátní ID (auto increment) |
| username | string | Uživatelské jméno (unique) |
| password | string | Bcrypt hash hesla |
| created_at | string | ISO datum vytvoření |

## Bezpečnost

### Současná implementace (development)

- Hesla jsou hashována pomocí bcrypt (10 rounds)
- Session je uložena v HTTP-only cookie
- Cookie platí 24 hodin
- Init endpoint funguje pouze jednou (při prázdné databázi)

### Doporučení pro produkci

⚠️ **Implementováno**:

✅ **JWT tokeny** - Implementováno (dual runtime systém)  
✅ **Secure flag** pro cookies - Implementováno (automaticky v produkci)  
✅ **Middleware** pro ochranu admin routes - Implementováno  
✅ **Environment variables** pro secrets - Implementováno (JWT_SECRET)  
✅ **Zod validace** - Implementováno pro všechny API endpointy  
✅ **Centralizované typy** - Implementováno (types/)

⚠️ **Doporučujeme přidat**:

1. **CSRF protection** - Token validace pro formuláře
2. **Rate limiting** - Ochrana proti brute force útokům
3. **Odstranit nebo zabezpečit** init endpoint v produkci
4. **Pravidelná rotace** session tokenů (refresh tokens)
5. **2FA autentizace** (volitelně)
6. **Audit log** pro admin akce

### Bezpečnostní funkce (implementováno)

**JWT Autentizace**:
- 🔒 Tokeny s automatickou expirací (24h)
- 🔒 Podepsané pomocí JWT_SECRET
- 🔒 Dual runtime systém (Node.js + Edge)

**Secure Cookies**:
- 🔒 `httpOnly: true` - Ochrana před XSS
- 🔒 `secure: true` - HTTPS only v produkci
- 🔒 `sameSite: 'lax'` - Ochrana před CSRF

**Middleware ochrana**:
- 🔒 Automatická validace JWT při každém požadavku
- 🔒 Chrání `/admin/dashboard` a `/api/admin/ketubas/*`
- 🔒 Běží v Edge Runtime (rychlé, globální)

**Zod validace**:
- ✅ Runtime validace všech API vstupů
- ✅ Type-safe schemas
- ✅ Automatická sanitizace (trim, toLowerCase)
- ✅ Limity na délky stringů
- ✅ URL a email formát validace

## Propojení s veřejnými stránkami

### Jak to funguje

1. **Přidáte ketubu v adminu** → Uloženo do `data/ketubas.json`
2. **Navštívíte hlavní stránku** → Načte ketuboty z `/api/ketubas`
3. **Zobrazí se na eshopu** → S obrázky, cenami a popisy

### Veřejný API endpoint

```
GET /api/ketubas
```

Tento endpoint je přístupný bez autentizace a vrací všechny ketuboty:

```json
{
  "ketubas": [
    {
      "id": 1,
      "name": "Tradiční ketuba",
      "price": 2500,
      "image": "https://...",
      ...
    }
  ]
}
```

### Obrázky

- Zadávejte URL obrázků (např. z Imgur, Cloudinary)
- Náhled se zobrazí okamžitě ve formuláři
- Obrázky se zobrazí na hlavní stránce i v adminu
- Pokud URL nefunguje, zobrazí se placeholder

## Řešení problémů

### Nelze se přihlásit

1. Zkontrolujte, že jste vytvořili admin uživatele přes `/api/admin/auth/init`
2. Zkontrolujte konzoli prohlížeče pro chybové hlášky
3. Zkontrolujte, že soubor `data/users.json` existuje

### Databáze neexistuje

JSON soubory se vytvoří automaticky při prvním použití. Můžete je vytvořit ručně:

```bash
mkdir -p data
echo '[]' > data/ketubas.json
echo '[]' > data/users.json
```

### Změny se nezobrazují na hlavní stránce

1. Obnovte stránku (F5)
2. Zkontrolujte browser console pro chyby
3. Ověřte, že `/api/ketubas` vrací data

### Obrázek se nezobrazuje

1. Zkontrolujte URL obrázku v prohlížeči
2. Ujistěte se, že URL začíná `http://` nebo `https://`
3. Některé servery blokují hotlinking - zkuste jiný zdroj

## Další rozšíření

Možnosti pro budoucí vylepšení:

- Upload obrázků (místo URL)
- Kategorie jako separate tabulka
- Vícenásobní admin uživatelé s rolemi
- Historie změn (audit log)
- Bulk operace (smazání více ketubot najednou)
- Export dat do CSV/JSON
- Filtrace a vyhledávání v seznamu
- Pagination pro velké množství ketubot
- Drag & drop pro změnu pořadí
- Rich text editor pro popis

## Podpora

Pokud narazíte na problém, zkontrolujte:

1. Server výstup v terminálu
2. Browser konzoli (F12)
3. Network tab v DevTools
4. Databázový soubor `data/eshop.db` existuje

Pro další dotazy nebo problémy kontaktujte vývojáře.
