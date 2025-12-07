/**
 * TypeScript typy pro Ketubu entitu
 */

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

/**
 * Typ pro vytvoření nové ketuboty (bez automatických polí)
 */
export type CreateKetubaInput = Omit<Ketuba, 'id' | 'created_at' | 'updated_at'>;

/**
 * Typ pro aktualizaci ketuboty (všechna pole volitelná kromě ID)
 */
export type UpdateKetubaInput = Partial<Omit<Ketuba, 'id' | 'created_at' | 'updated_at'>>;
