'use client';

import Link from 'next/link';
import { StarIcon, UserIcon } from '@heroicons/react/24/solid';
import { Player } from '@/app/types/player';

type PlayerTableRowProps = {
  player: Player;
  index: number;
};

export default function PlayerTableRow({ player, index }: PlayerTableRowProps) {  // Funkcja zwracająca emoji dla miejsc w rankingu
  const getMedalEmoji = (position: number): string => {
    switch (position) {
      case 0: return '🥇'; // Złoty medal dla 1. miejsca
      case 1: return '🥈'; // Srebrny medal dla 2. miejsca
      case 2: return '🥉'; // Brązowy medal dla 3. miejsca
      case 3: return '🫡'; // Salutowanie dla 4. miejsca
      case 4: return '🤡'; // Klaun dla 5. miejsca
      default: return '';
    }
  };

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="px-2 py-3 text-center font-semibold text-slate-700">
        {index + 1} {index < 5 && <span className="ml-1" aria-label={`Miejsce ${index + 1}`}>{getMedalEmoji(index)}</span>}
      </td>
      <td className="px-2 py-3">
        <Link 
          href={`/players/${player.slug || player.id}`} 
          className="flex items-center group"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 mr-3 flex-shrink-0 border border-slate-200">
            {player.card_url ? (
              <div className="h-full w-full flex items-center justify-center bg-amber-400">
                <StarIcon className="h-4 w-4 text-amber-950" aria-hidden="true" />
                <span className="sr-only">Ma kartę magic</span>
              </div>
            ) : player.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={player.photo_url}
                alt={player.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-50">
                <UserIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <span className="sr-only">Brak zdjęcia</span>
              </div>
            )}
          </div>
          <div>
            <div className="font-medium text-slate-900 group-hover:text-accent-color transition-colors">
              {player.name}
            </div>
            <div className="text-xs text-slate-500">
              {player.position} • {player.club_name || 'Brak klubu'}
            </div>
          </div>
        </Link>
      </td>
      <td className="px-2 py-3 text-center">
        <div className="flex items-center justify-center">
          <StarIcon className="w-4 h-4 text-amber-500 mr-1" />
          <span className="font-medium">{player.average_rating.toFixed(2)}</span>
        </div>
      </td>
      <td className="px-2 py-3 text-center text-sm text-slate-500">
        {player.total_ratings}
      </td>
    </tr>
  );
}
