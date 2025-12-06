/**
 * API endpoint pro odhlášení z administrace
 */

import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json(
    { message: 'Odhlášení úspěšné' },
    { status: 200 }
  );

  // Smaž cookie
  response.cookies.delete('admin_session');

  return response;
}
