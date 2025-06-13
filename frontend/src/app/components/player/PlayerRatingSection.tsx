'use client';

import { Player } from '@/app/types/player';
import RatingForm from '@/app/components/RatingForm';

type PlayerRatingSectionProps = {
  player: Player;
  onRatingSubmit: (rating: number) => Promise<void>;
};

export default function PlayerRatingSection({ player, onRatingSubmit }: PlayerRatingSectionProps) {
  return (
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
        onRatingSubmit={onRatingSubmit}
      />
    </div>
  );
}
