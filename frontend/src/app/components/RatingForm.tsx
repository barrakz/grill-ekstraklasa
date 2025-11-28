'use client';

import { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import Button from '@/app/components/common/Button';

type RatingFormProps = {
  playerId: string | number;
  currentRating?: number;
  onRatingSubmit: (rating: number) => Promise<void>;
  error?: string | null;
};

export default function RatingForm({ currentRating, onRatingSubmit, error }: RatingFormProps) {
  const [rating, setRating] = useState<number>(currentRating || 0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await onRatingSubmit(rating);
    } catch {
      // Błąd zostanie obsłużony przez komponent nadrzędny
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4">Oceń zawodnika</h3>

      {error && (
        <div className="border border-red-600 bg-red-900/20 text-red-400 px-4 py-3 rounded mb-4 text-center">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        <div className="flex justify-center space-x-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <button
              key={value}
              type="button"
              className="star-rating-button bg-transparent p-0 m-0 border-0 min-h-0 focus:outline-none w-auto"
              style={{
                backgroundColor: 'transparent',
                outline: 'none'
              }}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(value)}
              disabled={isSubmitting}
              aria-label={`Ocena ${value} z 10`}
            >
              <StarIcon
                className={`w-6 h-6 md:w-8 md:h-8 ${(hoveredRating || rating) >= value
                  ? 'text-yellow-400'
                  : 'text-gray-400'
                  }`}
              />
            </button>
          ))}
        </div>
        <div className="text-xl md:text-2xl font-bold">
          <span className={hoveredRating || rating ? 'text-yellow-400' : 'text-gray-500'}>
            {hoveredRating || rating || '?'}
          </span>
          <span className="text-xs md:text-sm opacity-60">/10</span>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          isLoading={isSubmitting}
          className={`px-6 py-2 ${rating > 0 && !isSubmitting
            ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-700'
            }`}
        >
          Oceń
        </Button>
      </div>
    </div>
  );
}