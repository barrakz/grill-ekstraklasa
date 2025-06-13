'use client';

import Image from 'next/image';
import { Player } from '@/app/types/player';

type PlayerProfileProps = {
  player: Player;
};

export default function PlayerProfile({ player }: PlayerProfileProps) {
  return (
    <div className="card">
      <div className="text-center mb-6">
        <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 rounded-full bg-primary-bg border-2 border-accent-color/30 flex items-center justify-center overflow-hidden">
          {player.photo_url ? (
            <Image
              src={player.photo_url}
              alt={player.name}
              width={128}
              height={128}
              className="rounded-full"
            />
          ) : (
            <span className="text-4xl md:text-6xl">👤</span>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{player.name}</h1>
        <p className="text-lg md:text-xl opacity-80">{player.club_name || 'Bez klubu'}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-2 md:p-3 bg-primary-bg rounded-lg">
          <p className="text-sm opacity-70">Pozycja</p>
          <p className="font-semibold">{player.position}</p>
        </div>
        <div className="p-2 md:p-3 bg-primary-bg rounded-lg">
          <p className="text-sm opacity-70">Narodowość</p>
          <p className="font-semibold">{player.nationality}</p>
        </div>
        {player.height && (
          <div className="p-2 md:p-3 bg-primary-bg rounded-lg">
            <p className="text-sm opacity-70">Wzrost</p>
            <p className="font-semibold">{player.height} cm</p>
          </div>
        )}
        {player.weight && (
          <div className="p-2 md:p-3 bg-primary-bg rounded-lg">
            <p className="text-sm opacity-70">Waga</p>
            <p className="font-semibold">{player.weight} kg</p>
          </div>
        )}
      </div>
    </div>
  );
}
