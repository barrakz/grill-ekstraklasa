'use client';

import { useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import Button from '@/app/components/common/Button';
import { API_BASE_URL, MAX_COMMENT_LENGTH } from '@/app/config';

type CommentFormProps = {
  playerId: number;
  onCommentAdded: () => Promise<void>;
};

export default function CommentForm({ playerId, onCommentAdded }: CommentFormProps) {  const [content, setContent] = useState<string>('');  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
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

    if (content.length > MAX_COMMENT_LENGTH) {
      setError(`Komentarz nie może przekraczać ${MAX_COMMENT_LENGTH} znaków`);
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
      ) : (        <form onSubmit={handleSubmit}>          
          <div className="mb-4">
            <textarea
              rows={2}
              value={content}
              onChange={(e) => {
                const newValue = e.target.value;
                // Opcjonalnie: możemy ograniczyć wpisywanie powyżej limitu
                // Jeśli chcemy pozwolić na pisanie, ale blokować wysyłanie, usunąć ten warunek
                if (newValue.length <= MAX_COMMENT_LENGTH) {
                  setContent(newValue);
                }
              }}
              placeholder="Napisz komentarz..."
              disabled={isSubmitting}
              maxLength={MAX_COMMENT_LENGTH}
              className="focus:ring-1 focus:ring-accent-color"
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${content.length > MAX_COMMENT_LENGTH * 0.9 ? 'text-amber-500' : 'text-gray-400'}`}>
                {content.length}/{MAX_COMMENT_LENGTH}
              </span>            </div>
          </div>          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              size="small"
              variant="accent"
              isLoading={isSubmitting}
            >
              Dodaj komentarz
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
