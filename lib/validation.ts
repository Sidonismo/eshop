/**
 * Zod validační schémata pro API endpointy
 *
 * Tato schémata zajišťují runtime validaci vstupních dat
 * a automatickou type-safety.
 */

import { z } from 'zod';

/**
 * Schéma pro vytvoření/aktualizaci ketuboty
 *
 * Validace:
 * - name: povinné, min 1 znak, max 200 znaků, automaticky trim
 * - description: volitelné nebo prázdný string, max 2000 znaků
 * - price: povinné, kladné číslo (musí být number, ne string)
 * - image: volitelné, prázdný string NEBO platná URL
 * - category: volitelné nebo prázdný string, max 100 znaků
 * 
 * Poznámka: Frontend posílá price jako number (parseFloat),
 * image může být '' pokud není zadaná
 */
export const ketubaSchema = z.object({
  name: z.string()
    .min(1, 'Název je povinný')
    .max(200, 'Název může mít maximálně 200 znaků')
    .trim(),
  
  description: z.string()
    .max(2000, 'Popis může mít maximálně 2000 znaků')
    .trim()
    .optional()
    .or(z.literal('')), // Povolit prázdný string pro volitelná pole
  
  price: z.number()
    .positive('Cena musí být kladné číslo')
    .max(1000000, 'Cena je příliš vysoká'),
  
  // Image validace: prázdný string NEBO platná URL
  // refine() kontroluje URL pouze pokud není prázdné
  image: z.string()
    .trim()
    .optional()
    .refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
      message: 'Obrázek musí být platná URL nebo prázdný',
    }),
  
  category: z.string()
    .max(100, 'Kategorie může mít maximálně 100 znaků')
    .trim()
    .optional()
    .or(z.literal('')), // Povolit prázdný string pro volitelná pole
});

/**
 * Schéma pro přihlášení
 *
 * Validace:
 * - username: povinné, min 3 znaky, max 50 znaků, alfanumerické
 * - password: povinné, min 6 znaků
 */
export const loginSchema = z.object({
  username: z.string()
    .min(3, 'Username musí mít alespoň 3 znaky')
    .max(50, 'Username může mít maximálně 50 znaků')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username může obsahovat pouze písmena, čísla, _ a -')
    .trim(),
  
  password: z.string()
    .min(6, 'Heslo musí mít alespoň 6 znaků')
    .max(100, 'Heslo je příliš dlouhé'),
});

/**
 * Schéma pro kontaktní formulář
 *
 * Validace:
 * - name: povinné, min 2 znaky, max 100 znaků
 * - email: povinné, platný email formát
 * - phone: volitelné, české telefon formát
 * - message: povinné, min 10 znaků, max 5000 znaků
 */
export const contactSchema = z.object({
  name: z.string()
    .min(2, 'Jméno musí mít alespoň 2 znaky')
    .max(100, 'Jméno může mít maximálně 100 znaků')
    .trim(),
  
  email: z.string()
    .email('Neplatný formát emailu')
    .max(200, 'Email je příliš dlouhý')
    .trim()
    .toLowerCase(),
  
  phone: z.string()
    .regex(/^(\+420)?[0-9]{9}$/, 'Neplatný formát telefonu (formát: +420123456789 nebo 123456789)')
    .trim()
    .optional()
    .or(z.literal('')), // Povolit prázdný string
  
  message: z.string()
    .min(10, 'Zpráva musí mít alespoň 10 znaků')
    .max(5000, 'Zpráva může mít maximálně 5000 znaků')
    .trim(),
});

/**
 * Helper funkce pro validaci dat se Zod schématem
 *
 * @param schema - Zod schéma
 * @param data - Data k validaci
 * @returns Validovaná data nebo pole chyb pokud validace selhala
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  // Extrahuj chybové zprávy ze ZodError
  const errors = result.error.issues.map((issue) => issue.message);
  return { success: false, errors };
}
