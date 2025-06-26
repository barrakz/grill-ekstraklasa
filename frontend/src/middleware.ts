import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Sprawdź czy URL pasuje do starego wzorca /players/{id} gdzie id to liczba
  const playerIdMatch = request.nextUrl.pathname.match(/^\/players\/(\d+)$/);
  
  if (playerIdMatch) {
    const playerId = playerIdMatch[1];
    // Przekieruj do API endpointu, który obsłuży przekierowanie na podstawie id -> slug
    return NextResponse.redirect(new URL(`/api/redirect?playerId=${playerId}`, request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/players/:id*'],
};
