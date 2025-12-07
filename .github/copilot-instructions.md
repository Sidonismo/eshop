# Copilot Instructions - Eshop s ketubami

## Přehled projektu

Eshop pro prodej ketubot s administračním rozhraním. Next.js 15 (App Router) + React + Tailwind CSS.

## Technologie

- **Frontend**: React (Next.js 15), Tailwind CSS
- **Backend**: Next.js API Routes  
- **Databáze**: JSON soubory (`data/ketubas.json`, `data/users.json`)
- **Email**: Resend API
- **Autentizace**: Cookie-based sessions s bcrypt hashováním hesel

## Struktura projektu

```
app/
├── admin/
│   ├── login/page.tsx          # Přihlašovací stránka
│   └── dashboard/page.tsx      # Admin dashboard s CRUD operacemi
├── api/
│   ├── admin/
│   │   ├── auth/               # init, login, logout endpoints
│   │   └── ketubas/            # CRUD pro ketuboty (admin)
│   ├── contact/route.ts        # Kontaktní formulář
│   └── ketubas/route.ts        # Veřejný seznam ketubot
├── kontakt/page.tsx            # Veřejný kontaktní formulář
├── produkt/[id]/page.tsx       # Detail produktu
└── page.tsx                    # Hlavní stránka (dynamicky načítá ketuboty)

data/
├── ketubas.json                # Databáze ketubot
└── users.json                  # Databáze uživatelů

lib/
└── db.ts                       # Databázový modul (JSON operace)
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
- `POST /api/admin/auth/login` - Přihlášení (vrací cookie `admin_session`)
- `POST /api/admin/auth/logout` - Odhlášení

### Admin CRUD
- `GET /api/admin/ketubas` - Seznam všech ketubot
- `POST /api/admin/ketubas` - Vytvoření nové ketuboty
- `GET /api/admin/ketubas/[id]` - Detail ketuboty
- `PUT /api/admin/ketubas/[id]` - Aktualizace ketuboty
- `DELETE /api/admin/ketubas/[id]` - Smazání ketuboty

### Veřejné
- `GET /api/ketubas` - Veřejný seznam ketubot (bez autentizace)
- `POST /api/contact` - Odeslání kontaktního formuláře (Resend API)

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

### Bezpečnost (development)
- Bcrypt hashing (10 rounds)
- HTTP-only cookies
- Init endpoint funguje pouze jednou
- ⚠️ Pro produkci: JWT, CSRF protection, rate limiting, middleware ochrana

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

## Status projektu

✅ **PLNĚ FUNKČNÍ** - Projekt je připravený k použití a rozšiřování.