'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import RatingForm from '@/app/components/RatingForm';
import { Player } from '@/app/types/player';
import { useAuth } from '@/app/hooks/useAuth';

export default function PlayerDetails({ playerId }: { playerId: string }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPlayer = useCallback(async () => {
    try {
      const res = await fetch(`/api/players/${playerId}/`);
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
      const res = await fetch(`/api/players/${playerId}/rate/`, {
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
    <main className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/players" className="text-teal-500 hover:underline">
            ← Wróć do listy zawodników
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Player Info */}
          <div className="card p-6">
            <div className="text-center mb-6">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                {player.photo_url ? (
                  <Image
                    src={player.photo_url}
                    alt={player.name}
                    width={128}
                    height={128}
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-6xl">👤</span>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{player.name}</h1>
              <p className="text-xl opacity-80">{player.club_name || 'Bez klubu'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm opacity-70">Pozycja</p>
                <p className="font-semibold">{player.position}</p>
              </div>
              <div>
                <p className="text-sm opacity-70">Narodowość</p>
                <p className="font-semibold">{player.nationality}</p>
              </div>
              {player.height && (
                <div>
                  <p className="text-sm opacity-70">Wzrost</p>
                  <p className="font-semibold">{player.height} cm</p>
                </div>
              )}
              {player.weight && (
                <div>
                  <p className="text-sm opacity-70">Waga</p>
                  <p className="font-semibold">{player.weight} kg</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Rating */}
          <div>
            <div className="card p-6 mb-6">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{player.rating_avg.toFixed(1)}</div>
                <div className="text-xl opacity-80">Średnia ocena</div>
                <div className="mt-2 text-sm opacity-70">
                  Liczba ocen: {player.total_ratings}
                </div>
              </div>
            </div>

            <RatingForm
              playerId={player.id}
              currentRating={player.user_rating?.value}
              onRatingSubmit={handleRatingSubmit}
            />
          </div>
        </div>

        {/* Comments Section */}
        {player.recent_comments.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Ostatnie komentarze</h2>
            <div className="space-y-4">
              {player.recent_comments.map((comment) => (
                <div key={comment.id} className="card p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold">{comment.user.username}</div>
                    <div className="text-sm opacity-70">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <p>{comment.content}</p>
                  <div className="mt-2 text-sm opacity-70">
                    {comment.likes_count} polubień
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 