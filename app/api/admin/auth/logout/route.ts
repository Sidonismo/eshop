/**
 * API endpoint pro odhlášení z administrace
 *
 * POST: Smaže JWT session cookie
 */

import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST() {
  // Smaž auth cookie
  await clearAuthCookie();

  return NextResponse.json(
    { message: 'Odhlášení úspěšné' },
    { status: 200 }
  );
}
