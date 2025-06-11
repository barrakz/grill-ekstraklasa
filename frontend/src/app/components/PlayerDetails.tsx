'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import RatingForm from '@/app/components/RatingForm';
import CommentForm from '@/app/components/CommentForm';
import { Player } from '@/app/types/player';
import { useAuth } from '@/app/hooks/useAuth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  
  const handleLikeComment = async (commentId: number) => {
    if (!user) {
      setError('Musisz być zalogowany, aby polubić komentarz');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/comments/${commentId}/like/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${user.token}`,
        }
      });

      if (!res.ok) throw new Error('Failed to like comment');
      
      // Odśwież dane zawodnika, aby pobrać zaktualizowane polubienia
      await fetchPlayer();
    } catch (error) {
      console.error('Błąd podczas przetwarzania polubienia:', error);
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
          <Link href="/players" className="text-accent-color hover:underline flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Wróć do listy zawodników</span>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Player Info */}
          <div className="card">
            <div className="text-center mb-6">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-primary-bg border-2 border-accent-color/30 flex items-center justify-center overflow-hidden">
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
            <div className="card mb-6">
              <div className="text-center">
                <div className="rating-value mb-2">{player.rating_avg.toFixed(1)}</div>
                <div className="text-xl text-text-light/80">Średnia ocena</div>
                <div className="mt-2 text-sm text-text-muted">
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

        {/* Comment Form Section */}
        <div className="mt-8">
          <CommentForm playerId={player.id} onCommentAdded={fetchPlayer} />
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Komentarze</h2>
          {player.recent_comments.length > 0 ? (
            <div className="space-y-4">
              {player.recent_comments.map((comment) => (
                <div key={comment.id} className="card">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-semibold text-accent-color">{comment.user.username}</div>
                    <div className="text-sm text-text-muted">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="mb-3 leading-relaxed">{comment.content}</p>
                  <div className="mt-2 flex items-center text-sm text-text-muted border-t border-border-color pt-3">
                    <button 
                      onClick={() => handleLikeComment(comment.id)}
                      className={`flex items-center mr-2 ${comment.is_liked_by_user ? 'text-accent-color' : ''}`}
                      disabled={!user}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                      </svg>
                      {comment.likes_count}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-text-muted border border-dashed border-border-color rounded-lg">
              <p>Brak komentarzy. Bądź pierwszy i dodaj swoją opinię!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}