'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HandThumbUpIcon } from '@heroicons/react/24/solid';
import { HandThumbUpIcon as HandThumbUpOutline } from '@heroicons/react/24/outline';
import RatingForm from '@/app/components/RatingForm';
import CommentForm from '@/app/components/CommentForm';
import Pagination from '@/app/components/Pagination';
import { Player } from '@/app/types/player';
import { PaginatedComments, Comment } from '@/app/types/comment';
import { useAuth } from '@/app/hooks/useAuth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function PlayerDetails({ playerId }: { playerId: string }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<PaginatedComments | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [commentsPerPage, setCommentsPerPage] = useState<number>(5);
  const [sortBy, setSortBy] = useState<string>('-created_at'); // domyślne sortowanie od najnowszych
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

  const fetchComments = useCallback(async () => {
    if (!playerId) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/players/${playerId}/comments/?page=${currentPage}&page_size=${commentsPerPage}&sort_by=${sortBy}`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      const data = await res.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Nie udało się pobrać komentarzy');
    }
  }, [playerId, currentPage, commentsPerPage, sortBy]);

  useEffect(() => {
    fetchPlayer();
  }, [fetchPlayer]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

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
      
      // Odśwież listę komentarzy, aby pobrać zaktualizowane polubienia
      await fetchComments();
    } catch (error) {
      console.error('Błąd podczas przetwarzania polubienia:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchComments();
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
          <div className="card">
            <div className="text-center mb-6">
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 rounded-full bg-primary-bg border-2 border-accent-color/30 flex items-center justify-center overflow-hidden">
                {player.photo_url ? (
                  <Image
                    src={player.photo_url}
                    alt={player.name}
                    width={128}
                    height={128}
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-4xl md:text-6xl">👤</span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{player.name}</h1>
              <p className="text-lg md:text-xl opacity-80">{player.club_name || 'Bez klubu'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-2 md:p-3 bg-primary-bg rounded-lg">
                <p className="text-sm opacity-70">Pozycja</p>
                <p className="font-semibold">{player.position}</p>
              </div>
              <div className="p-2 md:p-3 bg-primary-bg rounded-lg">
                <p className="text-sm opacity-70">Narodowość</p>
                <p className="font-semibold">{player.nationality}</p>
              </div>
              {player.height && (
                <div className="p-2 md:p-3 bg-primary-bg rounded-lg">
                  <p className="text-sm opacity-70">Wzrost</p>
                  <p className="font-semibold">{player.height} cm</p>
                </div>
              )}
              {player.weight && (
                <div className="p-2 md:p-3 bg-primary-bg rounded-lg">
                  <p className="text-sm opacity-70">Waga</p>
                  <p className="font-semibold">{player.weight} kg</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Rating */}
          <div className="flex flex-col gap-4">
            <div className="card mb-2">
              <div className="text-center">
                <div className="rating-value mb-2">{player.average_rating.toFixed(2)}</div>
                <div className="text-lg md:text-xl text-text-light/80">Średnia ocena</div>
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
        <div className="mt-6 md:mt-8">
          <CommentForm playerId={player.id} onCommentAdded={fetchComments} />
        </div>

        {/* Comments Section */}
        <div className="mt-6 md:mt-8">
          <h2 className="text-xl md:text-2xl font-bold mb-3">Komentarze</h2>
          
          {/* Mniejsze przyciski sortowania na środku */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-text-muted text-xs">Sortuj:</span>
              <div className="flex border border-border-color/30 rounded-md overflow-hidden scale-90 transform">
                <button 
                  onClick={() => {
                    setSortBy('-created_at');
                    setCurrentPage(1);
                  }}
                  className={`px-1.5 py-0.5 text-xs ${sortBy === '-created_at' ? 'bg-accent-color/20 text-accent-color' : 'bg-primary-bg hover:bg-primary-bg-light'}`}
                  aria-label="Sortuj od najnowszych"
                >
                  Najnowsze
                </button>
                <button 
                  onClick={() => {
                    setSortBy('-likes_count');
                    setCurrentPage(1);
                  }}
                  className={`px-1.5 py-0.5 text-xs ${sortBy === '-likes_count' ? 'bg-accent-color/20 text-accent-color' : 'bg-primary-bg hover:bg-primary-bg-light'}`}
                  aria-label="Sortuj według popularności"
                >
                  Popularne
                </button>
              </div>
            </div>
          </div>
          
          {comments?.results && comments.results.length > 0 ? (
            <div className="bg-primary-bg/30 rounded-lg px-4 py-2">
              {comments.results.map((comment) => (
                <div key={comment.id} className="py-3 mb-1 relative">
                  {/* Subtelny separator między komentarzami */}
                  {comment !== comments.results[0] && (
                    <div className="absolute top-0 left-1/4 right-1/4 h-px bg-border-color/5"></div>
                  )}
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-teal-400 text-base tracking-wide">{comment.user.username}</div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleLikeComment(comment.id)}
                          className="like-button bg-transparent hover:bg-transparent border-none p-0 cursor-pointer flex items-center"
                          disabled={!user}
                          aria-label="Polub komentarz"
                          title={user ? 'Polub ten komentarz' : 'Zaloguj się aby polubić komentarz'}
                        >
                          {comment.is_liked_by_user ? (
                            <HandThumbUpIcon className="w-4 h-4 text-blue-500" />
                          ) : (
                            <HandThumbUpOutline className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <span className={`text-xs ${comment.is_liked_by_user ? 'text-blue-500' : 'text-gray-400'}`}>
                          {comment.likes_count}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-text-muted">
                      {(() => {
                        const date = new Date(comment.created_at);
                        const day = date.toLocaleDateString();
                        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return `${day}, ${time}`;
                      })()}
                    </div>
                  </div>
                  <p className="mb-2 leading-relaxed text-sm whitespace-pre-line">{comment.content}</p>
                </div>
              ))}
              
              {/* Pagination and Items Per Page selector */}
              <div className="mt-6">
                {comments && Math.ceil(comments.count / commentsPerPage) > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(comments.count / commentsPerPage)}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                )}
                
                {/* Selektor liczby komentarzy na stronę */}
                <div className="mt-4 flex justify-center items-center opacity-70 hover:opacity-100 transition-opacity text-xs">
                  <div className="flex items-center space-x-2">
                    <label htmlFor="commentsPerPage" className="text-text-muted">Pokaż:</label>
                    <select 
                      id="commentsPerPage"
                      value={commentsPerPage}
                      onChange={(e) => {
                        setCommentsPerPage(Number(e.target.value));
                        setCurrentPage(1); // Reset to page 1 when changing items per page
                      }}
                      className="text-xs px-2 py-1 bg-primary-bg border border-border-color/50 rounded"
                      aria-label="Liczba komentarzy na stronę"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                    </select>
                    <span className="text-text-muted">na stronę</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-text-muted bg-primary-bg/30 rounded-lg">
              <p>Brak komentarzy. Bądź pierwszy i dodaj swoją opinię!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}