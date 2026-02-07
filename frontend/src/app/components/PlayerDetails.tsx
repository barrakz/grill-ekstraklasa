'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Player } from '@/app/types/player';
import { useAuth } from '@/app/hooks/useAuth';
import PlayerProfile from '@/app/components/player/PlayerProfile';
import PlayerRatingSection from '@/app/components/player/PlayerRatingSection';
import CommentsSection from '@/app/components/player/CommentsSection';
import PlayerShareSection from '@/app/components/player/PlayerShareSection';
import { TweetEmbed } from '@/app/components/TweetEmbed';
import { API_BASE_URL } from '@/app/config';

export default function PlayerDetails({ playerId }: { playerId: string }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPlayer = useCallback(async () => {
    try {
      // playerId może być zarówno ID jak i slugiem - backend obsłuży oba przypadki
      const res = await fetch(`${API_BASE_URL}/api/players/${playerId}/`);
      if (!res.ok) throw new Error('Failed to fetch player');
      const data = await res.json();
      setPlayer(data);
    } catch {
      setError('Nie udało się pobrać danych zawodnika');
    }
  }, [playerId]);

  useEffect(() => {
    fetchPlayer();
  }, [fetchPlayer]);

  const handleGoBack = () => {
    window.history.back();
  };

  const handleRatingSubmit = async (rating: number) => {
    if (!user) {
      setRatingError('Musisz być zalogowany, aby oceniać zawodników');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/players/${playerId}/rate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${user.token}`,
        },
        body: JSON.stringify({ value: rating }),
      });

      if (!res.ok) {
        // Pobierz dane błędu
        let errorMessage = 'Nie udało się dodać oceny. Spróbuj ponownie później.';

        try {
          const errorData = await res.json();

          // Sprawdź, czy to błąd ograniczenia częstotliwości
          if (res.headers.get('X-Error-Type') === 'throttled') {
            errorMessage = errorData.detail || 'Możesz oceniać tylko raz na minutę';
            setRatingError(errorMessage); // Używamy setRatingError zamiast setError
            // Odśwież dane zawodnika (bez czyszczenia błędu oceniania)
            await fetchPlayer();
            // Nie przekierowuj na inną stronę
            return;
          }

          // Dla innych typów błędów
          if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch {
          // W przypadku problemów z parsowaniem JSON, zachowaj domyślny komunikat
        }

        throw new Error(errorMessage);
      }

      // Odśwież dane zawodnika po dodaniu oceny
      setRatingError(null); // Wyczyść ewentualne poprzednie błędy oceniania
      await fetchPlayer();
    } catch (error) {
      if (error instanceof Error) {
        setRatingError(error.message); // Używamy setRatingError zamiast setError
      } else {
        setRatingError('Wystąpił błąd podczas oceniania');
      }
    }
  };

  if (error) {
    // Zamiast pełnej strony błędu, pokazujemy komunikat na tej samej stronie
    if (player) {
      return (
        <main className="min-h-screen py-6 md:py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button
                onClick={handleGoBack}
                className="inline-flex items-center gap-2 text-accent-color hover:underline py-2 bg-transparent border-none cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Powrót</span>
              </button>
            </div>

            {/* Alert z błędem */}
            <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-lg text-center">
              {error}
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-8">
              {/* Left Column - Player Info */}
              <PlayerProfile player={player} />

              {/* Right Column - Rating */}
              <PlayerRatingSection
                player={player}
                onRatingSubmit={handleRatingSubmit}
                ratingError={ratingError}
              />
            </div>

            {/* Comments Section */}
            <CommentsSection playerId={playerId} />
          </div>
        </main>
      );
    }

    // Jeśli nie mamy danych zawodnika, pokazujemy pełną stronę błędu
    return (
      <div className="min-h-screen py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-rose-500">{error}</p>
          <Link href="/players" className="text-accent-color hover:underline mt-4 inline-block">
            Wróć do listy zawodników
          </Link>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse">Ładowanie...</div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-6 md:py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 text-accent-color hover:underline py-2 bg-transparent border-none cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Powrót</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-8">
          {/* Left Column - Player Info */}
          <PlayerProfile player={player} />

          {/* Right Column - Rating */}
          <PlayerRatingSection
            player={player}
            onRatingSubmit={handleRatingSubmit}
            ratingError={ratingError}
          />
        </div>

        {/* Summary Section */}
        {player.summary && (
          <div className="mt-8 card">
            <h3 className="text-xl font-bold mb-4">O zawodniku</h3>
            <p className="text-base opacity-90 leading-relaxed whitespace-pre-wrap">{player.summary}</p>
          </div>
        )}

        {/* GIFs Section */}
        {player.gif_urls && player.gif_urls.length > 0 && (
          <div className="mt-8 card">
            <h3 className="text-xl font-bold mb-4">Gify</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {player.gif_urls.map((url, index) => (
                <div key={index} className="gif-container rounded-lg overflow-hidden">
                  <img 
                    src={url} 
                    alt={`${player.name} GIF ${index + 1}`}
                    className="w-full h-auto object-cover"
                    style={{ maxWidth: '50%', margin: '0 auto' }}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tweets Section */}
        {player.tweet_urls && player.tweet_urls.length > 0 && (
          <div className="mt-8 card">
            <h3 className="text-xl font-bold mb-4">Tweety</h3>
            <div className="space-y-4">
              {player.tweet_urls.map((url, index) => {
                const trimmed = (url || '').trim();
                if (!trimmed) return null;

                return (
                  <TweetEmbed key={index} url={trimmed} maxHeightClassName="max-h-[420px]" />
                );
              })}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <CommentsSection playerId={playerId} />

        <PlayerShareSection player={player} />
      </div>
    </main>
  );
}
