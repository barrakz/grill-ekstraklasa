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
    <div className="card p-6">
      <h3 className="text-xl font-semibold mb-4">Oceń zawodnika</h3>
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <button
              key={value}
              className={`p-0.5 transition-all ${
                (hoveredRating || rating) >= value
                  ? 'text-yellow-400 transform scale-110'
                  : 'text-gray-400'
              }`}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(value)}
              disabled={isSubmitting}
            >
              <StarIcon className="w-6 h-6" />
            </button>
          ))}
        </div>
        <div className="text-2xl font-bold">
          {hoveredRating || rating || '?'}/10
        </div>
        <button
          className={`px-6 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 transition-colors
            ${rating === 0 ? 'opacity-50 cursor-not-allowed' : ''}
            ${isSubmitting ? 'animate-pulse' : ''}`}
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
        >
          {isSubmitting ? 'Wysyłanie...' : 'Oceń'}
        </button>
      </div>
    </div>
  );
} 