'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Player } from '@/app/types/player';

type PlayerProfileProps = {
  player: Player;
};

export default function PlayerProfile({ player }: PlayerProfileProps) {
  return (
    <div className="card">
      <div className="text-center mb-6">
        <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden">
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
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2">{player.name}</h1>
        {player.club_id ? (
          <Link href={`/players?club=${player.club_id}`} className="text-lg md:text-xl text-slate-600 hover:text-accent-color transition-colors">
            {player.club_name}
          </Link>
        ) : (
          <p className="text-lg md:text-xl text-slate-500">Bez klubu</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-2 md:p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-500">Pozycja</p>
          <p className="font-semibold text-slate-900">{player.position}</p>
        </div>
        <div className="p-2 md:p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-500">Narodowość</p>
          <p className="font-semibold text-slate-900">{player.nationality}</p>
        </div>
        {player.height && (
          <div className="p-2 md:p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-500">Wzrost</p>
            <p className="font-semibold text-slate-900">{player.height} cm</p>
          </div>
        )}
        {player.weight && (
          <div className="p-2 md:p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-500">Waga</p>
            <p className="font-semibold text-slate-900">{player.weight} kg</p>
          </div>
        )}
      </div>
    </div>
  );
}
