/**
 * Databázový modul pro správu ketubot
 *
 * Tento modul poskytuje funkce pro práci s JSON databází.
 * Používá jednoduché JSON soubory pro ukládání dat.
 *
 * Databázové "tabulky":
 * - ketubas.json: seznam ketubot
 * - users.json: admin uživatelé
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const KETUBAS_FILE = path.join(DATA_DIR, 'ketubas.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Typy pro databázové entity
export interface Ketuba {
  id?: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id?: number;
  username: string;
  password: string;
  created_at?: string;
}

/**
 * Inicializace databáze
 * Vytvoří složku a soubory pokud neexistují
 */
export function initDatabase(): void {
  // Vytvoř složku data pokud neexistuje
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Vytvoř ketubas.json pokud neexistuje
  if (!fs.existsSync(KETUBAS_FILE)) {
    fs.writeFileSync(KETUBAS_FILE, JSON.stringify([], null, 2));
  }

  // Vytvoř users.json pokud neexistuje
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
}

/**
 * Načtení všech ketubot
 */
export function getAllKetubas(): Ketuba[] {
  initDatabase();
  const data = fs.readFileSync(KETUBAS_FILE, 'utf-8');
  return JSON.parse(data);
}

/**
 * Získání ketuboty podle ID
 */
export function getKetubaById(id: number): Ketuba | null {
  const ketubas = getAllKetubas();
  return ketubas.find(k => k.id === id) || null;
}

/**
 * Vytvoření nové ketuboty
 */
export function createKetuba(ketuba: Omit<Ketuba, 'id' | 'created_at' | 'updated_at'>): Ketuba {
  const ketubas = getAllKetubas();

  // Najdi největší ID a přidej 1
  const maxId = ketubas.length > 0 ? Math.max(...ketubas.map(k => k.id!)) : 0;
  const newKetuba: Ketuba = {
    ...ketuba,
    id: maxId + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  ketubas.push(newKetuba);
  fs.writeFileSync(KETUBAS_FILE, JSON.stringify(ketubas, null, 2));

  return newKetuba;
}

/**
 * Aktualizace ketuboty
 */
export function updateKetuba(id: number, updates: Partial<Ketuba>): boolean {
  const ketubas = getAllKetubas();
  const index = ketubas.findIndex(k => k.id === id);

  if (index === -1) return false;

  ketubas[index] = {
    ...ketubas[index],
    ...updates,
    id: ketubas[index].id, // Zachovej ID
    created_at: ketubas[index].created_at, // Zachovej created_at
    updated_at: new Date().toISOString(),
  };

  fs.writeFileSync(KETUBAS_FILE, JSON.stringify(ketubas, null, 2));
  return true;
}

/**
 * Smazání ketuboty
 */
export function deleteKetuba(id: number): boolean {
  const ketubas = getAllKetubas();
  const filteredKetubas = ketubas.filter(k => k.id !== id);

  if (filteredKetubas.length === ketubas.length) return false;

  fs.writeFileSync(KETUBAS_FILE, JSON.stringify(filteredKetubas, null, 2));
  return true;
}

/**
 * Načtení všech uživatelů
 */
export function getAllUsers(): User[] {
  initDatabase();
  const data = fs.readFileSync(USERS_FILE, 'utf-8');
  return JSON.parse(data);
}

/**
 * Získání uživatele podle username
 */
export function getUserByUsername(username: string): User | null {
  const users = getAllUsers();
  return users.find(u => u.username === username) || null;
}

/**
 * Vytvoření nového uživatele
 */
export function createUser(username: string, hashedPassword: string): User {
  const users = getAllUsers();

  const maxId = users.length > 0 ? Math.max(...users.map(u => u.id!)) : 0;
  const newUser: User = {
    id: maxId + 1,
    username,
    password: hashedPassword,
    created_at: new Date().toISOString(),
  };

  users.push(newUser);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

  return newUser;
}

/**
 * Počet uživatelů
 */
export function getUserCount(): number {
  const users = getAllUsers();
  return users.length;
}
