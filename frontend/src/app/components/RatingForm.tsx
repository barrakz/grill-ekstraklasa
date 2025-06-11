'use client';

import { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

type RatingFormProps = {
  playerId: number;
  currentRating?: number;
  onRatingSubmit: (rating: number) => Promise<void>;
};

export default function RatingForm({ playerId, currentRating, onRatingSubmit }: RatingFormProps) {
  const [rating, setRating] = useState<number>(currentRating || 0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      await onRatingSubmit(rating);
    } catch (error) {
      console.error('Failed to submit rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4">Oceń zawodnika</h3>
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <button
              key={value}
              className={`p-0.5 bg-transparent transition-all ${
                (hoveredRating || rating) >= value
                  ? 'rating-star active'
                  : 'rating-star'
              }`}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(value)}
              disabled={isSubmitting}
            >
              <StarIcon className="w-5 h-5" />
            </button>
          ))}
        </div>
        <div className="text-2xl font-bold">
          {hoveredRating || rating || '?'}<span className="text-sm opacity-60">/10</span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className={`${isSubmitting ? 'animate-pulse' : ''}`}
        >
          {isSubmitting ? 'Wysyłanie...' : 'Oceń'}
        </button>
      </div>
    </div>
  );
} 