'use client';

import { useState, useEffect, useCallback } from 'react';
import CommentForm from '@/app/components/CommentForm';
import { PaginatedComments } from '@/app/types/comment';
import { useAuth } from '@/app/hooks/useAuth';
import CommentSorting from '@/app/components/comments/CommentSorting';
import CommentItem from '@/app/components/comments/CommentItem';
import CommentsPagination from '@/app/components/comments/CommentsPagination';
import { API_BASE_URL } from '@/app/config';

type CommentsListProps = {
  playerId: string | number;
};

export default function CommentsSection({ playerId }: CommentsListProps) {
  const [comments, setComments] = useState<PaginatedComments | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [commentsPerPage, setCommentsPerPage] = useState<number>(5);
  const [sortBy, setSortBy] = useState<string>('-created_at'); // domyślne sortowanie od najnowszych
  const [, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchComments = useCallback(async () => {
    if (!playerId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/players/${playerId}/comments/?page=${currentPage}&page_size=${commentsPerPage}&sort_by=${sortBy}`); if (!res.ok) throw new Error('Failed to fetch comments');
      const data = await res.json();
      setComments(data);
    } catch {
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
    } catch {
      setError('Błąd podczas przetwarzania polubienia');
    }
  };

  return (
    <div className="mt-6 md:mt-8">
      {/* Comment Form Section */}      <div className="mt-6 md:mt-8">
        <CommentForm playerId={playerId} onCommentAdded={fetchComments} />
      </div>

      {/* Comments Section */}
      <div className="mt-6 md:mt-8">
        <h2 className="text-xl md:text-2xl font-bold mb-3">Komentarze</h2>

        {/* Sortowanie komentarzy */}
        <CommentSorting
          sortBy={sortBy}
          setSortBy={setSortBy}
          setCurrentPage={setCurrentPage}
        />

        {comments?.results && comments.results.length > 0 ? (
          <div className="bg-white/80 border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
            {comments.results.map((comment, index) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isFirst={index === 0}
                onLike={handleLikeComment}
                isLoggedIn={!!user}
              />
            ))}

            {/* Paginacja komentarzy */}
            {comments && (
              <CommentsPagination
                count={comments.count}
                currentPage={currentPage}
                commentsPerPage={commentsPerPage}
                setCurrentPage={setCurrentPage}
                setCommentsPerPage={setCommentsPerPage}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 bg-white/70 border border-slate-200 rounded-xl">
            <p>Brak komentarzy. Bądź pierwszy i dodaj swoją opinię!</p>
          </div>
        )}
      </div>
    </div>
  );
}
