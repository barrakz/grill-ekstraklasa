import { NextRequest, NextResponse } from 'next/server';

// Bezpośrednio używamy zmiennej środowiskowej zamiast importu z config.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  const playerId = request.nextUrl.searchParams.get('playerId');
  
  if (!playerId) {
    return NextResponse.redirect(new URL('/players', request.url));
  }

  try {
    // Pobierz dane zawodnika po ID, aby uzyskać jego slug
    // Używamy pełnego URL z domeną
    const apiUrl = `${API_BASE_URL}/api/players/${playerId}/`;
    console.log(`Próba pobrania danych z: ${apiUrl}`);
    
    const res = await fetch(apiUrl, { next: { revalidate: 60 } });
    
    if (!res.ok) {
      console.error(`Błąd pobierania danych zawodnika: ${res.status}`);
      return NextResponse.redirect(new URL('/players', request.url));
    }
    
    const player = await res.json();
    console.log(`Pobrano dane zawodnika:`, player);
    
    // Przekieruj na stronę zawodnika ze slugiem
    if (player.slug) {
      const newUrl = new URL(`/players/${player.slug}`, request.url);
      console.log(`Przekierowuję na: ${newUrl.toString()}`);
      return NextResponse.redirect(newUrl, 301);
    } else {
      // Dla zachowania kompatybilności, jeśli slug jeszcze nie istnieje
      console.log(`Brak sluga, przekierowuję na ID: /players/${playerId}`);
      return NextResponse.redirect(new URL(`/players/${playerId}`, request.url));
    }
  } catch (error) {
    console.error('Błąd podczas przekierowania:', error);
    return NextResponse.redirect(new URL('/players', request.url));
  }
}
