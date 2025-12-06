# Dokumentace administračního rozhraní

## Přehled

Administrační rozhraní umožňuje správu ketubot v eshopu. Zahrnuje autentizaci, seznam ketubot a CRUD operace (vytvoření, čtení, aktualizace, smazání).

Změny v adminu se automaticky projeví na veřejných stránkách eshopu.

## Technologie

- **Databáze**: JSON soubory (data/ketubas.json, data/users.json)
- **Autentizace**: Cookie-based sessions s bcrypt hashováním hesel
- **Framework**: Next.js 15 (App Router)
- **UI**: React s Tailwind CSS

## Nové funkce (aktualizace)

- ✅ Propojení s veřejnými stránkami - změny v adminu se zobrazí na hlavní stránce
- ✅ Náhled obrázků ve formuláři - live preview při zadávání URL
- ✅ Miniatury obrázků v seznamu ketubot
- ✅ JSON databáze místo SQLite - jednodušší, spolehlivější

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
│       │   │   └── route.ts   # Přihlášení
│       │   └── logout/
│       │       └── route.ts   # Odhlášení
│       └── ketubas/
│           ├── route.ts       # GET (seznam), POST (nová ketuba)
│           └── [id]/
│               └── route.ts   # GET, PUT, DELETE pro konkrétní ketubu
lib/
└── db.ts                      # Databázový modul (SQLite funkce)
data/
└── eshop.db                   # SQLite databáze (vytvoří se automaticky)
```

## Nastavení a spuštění

### 1. Instalace závislostí

```bash
npm install sql.js bcryptjs @types/bcryptjs
```

### 2. Vytvoření prvního admin uživatele

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

### 3. Přihlášení do administrace

1. Navštivte: **http://localhost:3000/admin/login**
2. Zadejte username a heslo vytvořené v kroku 2
3. Po úspěšném přihlášení budete přesměrováni na dashboard

## Použití admin dashboardu

### Přehled funkcí

Admin dashboard zobrazuje:
- Seznam všech ketubot
- Tlačítko pro přidání nové ketuboty
- Pro každou ketubu: tlačítka "Upravit" a "Smazat"
- Tlačítko "Odhlásit se" v hlavičce

### Přidání nové ketuboty

1. Klikněte na tlačítko **"+ Přidat novou ketubu"**
2. Vyplňte formulář:
   - **Název*** (povinné) - Název ketuboty
   - **Popis** (nepovinné) - Detailní popis
   - **Cena*** (povinné) - Cena v Kč (např. 2500)
   - **URL obrázku** (nepovinné) - Odkaz na obrázek ketuboty
   - **Kategorie** (nepovinné) - např. "Tradiční", "Moderní", "Custom"
3. Klikněte **"Přidat ketubu"**
4. Ketuba se objeví v seznamu

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

Nastaví cookie `admin_session` s username.

#### POST /api/admin/auth/logout
Odhlášení z administrace.

**Response (200):**
```json
{
  "message": "Odhlášení úspěšné"
}
```

Smaže cookie `admin_session`.

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

⚠️ **Důležité**: Současná implementace je vhodná pro development. Pro produkci doporučujeme:

1. **JWT tokeny** místo jednoduchých cookies
2. **Secure flag** pro cookies (HTTPS only)
3. **CSRF protection**
4. **Rate limiting** na login endpointu
5. **Middleware** pro ochranu admin routes
6. **Odstranit nebo zabezpečit** init endpoint
7. **Environment variables** pro secrets
8. **Pravidelná rotace** session tokenů
9. **2FA autentizace** (volitelně)
10. **Audit log** pro admin akce

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
