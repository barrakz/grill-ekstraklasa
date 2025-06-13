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
        <div className="flex justify-center space-x-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <button
              key={value}
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '0',
                margin: '0',
                cursor: 'pointer',
                outline: 'none'
              }}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(value)}
              disabled={isSubmitting}
              aria-label={`Ocena ${value} z 10`}
              className="focus:outline-none focus:ring-0"
            >
              <StarIcon 
                className={`w-4 h-4 md:w-5 md:h-5 ${
                  (hoveredRating || rating) >= value
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
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className={`px-6 py-2 rounded-md border border-transparent ${
            rating > 0 && !isSubmitting 
              ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900' 
              : 'bg-gray-700 text-gray-300'
          } transition-colors ${isSubmitting ? 'animate-pulse' : ''}`}
          aria-label={isSubmitting ? 'Wysyłanie oceny' : 'Wyślij ocenę'}
        >
          {isSubmitting ? 'Wysyłanie...' : 'Oceń'}
        </button>
      </div>
    </div>
  );
}