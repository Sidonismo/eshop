/**
 * TypeScript typy pro User entitu
 */

export interface User {
  id?: number;
  username: string;
  password: string;
  created_at?: string;
}

/**
 * Typ pro vytvoření nového uživatele (bez automatických polí)
 */
export type CreateUserInput = Omit<User, 'id' | 'created_at'>;

/**
 * Typ pro bezpečné zobrazení uživatele (bez hesla)
 */
export type SafeUser = Omit<User, 'password'>;
