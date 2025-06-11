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
    <div className="card p-6 my-6">
      <h3 className="text-xl font-semibold mb-4">Dodaj komentarz</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!user ? (
        <div className="text-center py-4">
          <p className="mb-2 text-gray-500">Zaloguj się, aby dodać komentarz</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <textarea
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Napisz komentarz..."
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className={`px-6 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 transition-colors
                ${isSubmitting ? 'opacity-50 animate-pulse cursor-not-allowed' : ''}`}
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
