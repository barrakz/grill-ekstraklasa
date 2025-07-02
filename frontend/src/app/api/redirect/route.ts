import { NextRequest, NextResponse } from 'next/server';

// Bezpośrednio używamy zmiennej środowiskowej zamiast importu z config.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  const playerId = request.nextUrl.searchParams.get('playerId');
  
  if (!playerId) {
    console.log('Brak playerId w parametrach URL');
    return NextResponse.redirect(new URL('/players', request.url));
  }

  try {
    // Log the current environment
    console.log(`Środowisko: ${process.env.NODE_ENV}, API_BASE_URL: ${API_BASE_URL}`);
    
    // Pobierz dane zawodnika po ID, aby uzyskać jego slug
    const apiUrl = `${API_BASE_URL}/api/players/${playerId}/`;
    console.log(`Próba pobrania danych z: ${apiUrl}`);
    
    // Add timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
    
    try {
      const res = await fetch(apiUrl, { 
        next: { revalidate: 60 },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        console.error(`Błąd pobierania danych zawodnika: ${res.status}, ${res.statusText}`);
        // If player doesn't exist (404), return 404 instead of redirect
        if (res.status === 404) {
          return new NextResponse('Player not found', { status: 404 });
        }
        // For other errors, fallback to players list
        return NextResponse.redirect(new URL('/players', request.url));
      }
      
      const player = await res.json();
      console.log(`Pobrano dane zawodnika: ID=${player.id}, Name=${player.name}, Slug=${player.slug || 'brak'}`);
      
      // Przekieruj na stronę zawodnika ze slugiem
      if (player.slug) {
        const newUrl = new URL(`/players/${player.slug}`, request.url);
        console.log(`Przekierowuję na: ${newUrl.toString()}`);
        return NextResponse.redirect(newUrl, 301);
      } else {
        // Dla zachowania kompatybilności, jeśli slug jeszcze nie istnieje
        console.log(`Brak sluga, przekierowuję na listę graczy`);
        return NextResponse.redirect(new URL('/players', request.url));
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError; // Re-throw to be caught by outer try/catch
    }
  } catch (error) {
    console.error('Błąd podczas przekierowania:', error);
    // As a fallback, redirect to players list to avoid redirect loops
    return NextResponse.redirect(new URL('/players', request.url));
  }
}
