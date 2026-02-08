'use client';

import Image from 'next/image';
import Link from 'next/link';
import { UserIcon } from '@heroicons/react/24/solid';
import { Player } from '@/app/types/player';

type PlayerProfileProps = {
  player: Player;
};

export default function PlayerProfile({ player }: PlayerProfileProps) {
  const hasCard = Boolean(player.card_url);
  const hasPhoto = Boolean(player.photo_url);

  return (
    <div className="card">
      <div className="text-center mb-6">
        {hasCard && (
          <div className="w-full max-w-[420px] md:max-w-[240px] mx-auto mb-4">
            <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-[0_16px_40px_-26px_rgba(15,23,42,0.5)]">
              <Image
                src={player.card_url as string}
                alt={player.name}
                fill
                sizes="(min-width: 768px) 240px, (min-width: 480px) 420px, 92vw"
                className="object-contain"
                priority
              />
            </div>
          </div>
        )}

        {!hasCard && hasPhoto && (
          <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden">
            <Image
              src={player.photo_url as string}
              alt={player.name}
              width={96}
              height={96}
              className="rounded-full object-cover"
            />
          </div>
        )}

        {!hasCard && !hasPhoto && (
          <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden">
            <UserIcon className="h-10 w-10 text-slate-400" aria-hidden="true" />
            <span className="sr-only">Brak zdjęcia</span>
          </div>
        )}

        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2">{player.name}</h1>
        {player.club_id ? (
          <Link
            href={`/players?club=${player.club_id}`}
            className="text-lg md:text-xl text-slate-600 hover:text-accent-color transition-colors"
          >
            {player.club_name}
          </Link>
        ) : (
          <p className="text-lg md:text-xl text-slate-500">Bez klubu</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 md:gap-3 text-center">
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 min-w-0">
          <p className="text-[11px] md:text-xs text-slate-500 leading-tight">Pozycja</p>
          <p className="text-[13px] md:text-sm font-semibold text-slate-900 leading-snug truncate" title={player.position}>
            {player.position}
          </p>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 min-w-0">
          <p className="text-[11px] md:text-xs text-slate-500 leading-tight">Narodowość</p>
          <p
            className="text-[13px] md:text-sm font-semibold text-slate-900 leading-snug truncate"
            title={player.nationality}
          >
            {player.nationality}
          </p>
        </div>
        {player.height && (
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 min-w-0">
            <p className="text-[11px] md:text-xs text-slate-500 leading-tight">Wzrost</p>
            <p className="text-sm md:text-base font-semibold text-slate-900 leading-snug">{player.height} cm</p>
          </div>
        )}
        {player.weight && (
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 min-w-0">
            <p className="text-[11px] md:text-xs text-slate-500 leading-tight">Waga</p>
            <p className="text-sm md:text-base font-semibold text-slate-900 leading-snug">{player.weight} kg</p>
          </div>
        )}
      </div>
    </div>
  );
}
