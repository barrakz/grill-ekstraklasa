'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Player } from '@/app/types/player';
import { useAuth } from '@/app/hooks/useAuth';
import PlayerProfile from '@/app/components/player/PlayerProfile';
import PlayerRatingSection from '@/app/components/player/PlayerRatingSection';
import CommentsSection from '@/app/components/player/CommentsSection';
import { API_BASE_URL } from '@/app/config';

export default function PlayerDetails({ playerId }: { playerId: string }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPlayer = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/players/${playerId}/`);
      if (!res.ok) throw new Error('Failed to fetch player');
      const data = await res.json();
      setPlayer(data);
    } catch (error) {
      setError('Nie udało się pobrać danych zawodnika');
    }
  }, [playerId]);

  useEffect(() => {
    fetchPlayer();
  }, [fetchPlayer]);

  const handleRatingSubmit = async (rating: number) => {
    if (!user) {
      setError('Musisz być zalogowany, aby oceniać zawodników');
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
        const error = await res.json();
        throw new Error(error.error || 'Failed to submit rating');
      }

      // Odśwież dane zawodnika po dodaniu oceny
      await fetchPlayer();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Wystąpił błąd podczas oceniania');
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-red-500">{error}</p>
          <Link href="/players" className="text-teal-500 hover:underline mt-4 inline-block">
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
          <Link href="/players" className="inline-flex items-center gap-2 text-accent-color hover:underline py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Powrót do listy</span>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-8">
          {/* Left Column - Player Info */}
          <PlayerProfile player={player} />

          {/* Right Column - Rating */}
          <PlayerRatingSection player={player} onRatingSubmit={handleRatingSubmit} />
        </div>

        {/* Comments Section */}
        <CommentsSection playerId={playerId} />
      </div>
    </main>
  );
}