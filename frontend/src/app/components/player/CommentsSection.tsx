'use client';

import { useState, useEffect, useCallback } from 'react';
import { HandThumbUpIcon } from '@heroicons/react/24/solid';
import { HandThumbUpIcon as HandThumbUpOutline } from '@heroicons/react/24/outline';
import CommentForm from '@/app/components/CommentForm';
import Pagination from '@/app/components/Pagination';
import { PaginatedComments, Comment } from '@/app/types/comment';
import { useAuth } from '@/app/hooks/useAuth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type CommentsListProps = {
  playerId: string | number;
};

export default function CommentsSection({ playerId }: CommentsListProps) {
  const [comments, setComments] = useState<PaginatedComments | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [commentsPerPage, setCommentsPerPage] = useState<number>(5);
  const [sortBy, setSortBy] = useState<string>('-created_at'); // domyślne sortowanie od najnowszych
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

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
    fetchComments();
  }, [fetchComments]);

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

  return (
    <div className="mt-6 md:mt-8">
      {/* Comment Form Section */}
      <div className="mt-6 md:mt-8">
        <CommentForm playerId={Number(playerId)} onCommentAdded={fetchComments} />
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
  );
}
