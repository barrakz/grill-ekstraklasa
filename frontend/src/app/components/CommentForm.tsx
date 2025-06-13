'use client';

import { useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type CommentFormProps = {
  playerId: number;
  onCommentAdded: () => Promise<void>;
};

export default function CommentForm({ playerId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Musisz być zalogowany, aby dodać komentarz');
      return;
    }
    
    if (!content.trim()) {
      setError('Komentarz nie może być pusty');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/comments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${user.token}`,
        },
        body: JSON.stringify({
          player: playerId,
          content: content.trim(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Nie udało się dodać komentarza');
      }
      
      setContent('');
      await onCommentAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas dodawania komentarza');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="card my-6">
      <h3 className="text-xl font-semibold mb-4">Dodaj komentarz</h3>
      
      {error && (
        <div className="border border-red-600 bg-red-900/20 text-red-400 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!user ? (
        <div className="text-center py-4 border border-dashed border-gray-700 rounded-md">
          <p className="mb-2 text-gray-400">Zaloguj się, aby dodać komentarz</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>          <div className="mb-4">
            <textarea
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Napisz komentarz..."
              disabled={isSubmitting}
              className="focus:ring-1 focus:ring-accent-color"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Wysyłanie...' : 'Dodaj komentarz'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
