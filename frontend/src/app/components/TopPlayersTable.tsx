'use client';

import Image from 'next/image';
import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/solid';
import { Player } from '@/app/types/player';

type TopPlayersTableProps = {
  players: Player[];
  title: string;
  description?: string;
  emptyMessage?: string;
};

export default function TopPlayersTable({
  players,
  title,
  description = "Zawodnicy z najwyższą średnią ocen",
  emptyMessage = "Brak zawodników z wystarczającą liczbą ocen"
}: TopPlayersTableProps) {
  if (!players || players.length === 0) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-sm opacity-70">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-sm opacity-70 mb-4">{description}</p>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-color">
              <th className="px-2 py-2 text-left">#</th>
              <th className="px-2 py-2 text-left">Zawodnik</th>
              <th className="px-2 py-2 text-center">Ocena</th>
              <th className="px-2 py-2 text-center">Głosy</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr 
                key={player.id} 
                className="border-b border-border-color hover:bg-primary-bg-light transition-colors"
              >
                <td className="px-2 py-3 text-center font-bold">
                  {index + 1}
                </td>
                <td className="px-2 py-3">
                  <Link 
                    href={`/players/${player.id}`} 
                    className="flex items-center group"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary-bg mr-3 flex-shrink-0">
                      {player.photo_url ? (
                        <Image 
                          src={player.photo_url} 
                          alt={player.name} 
                          width={32} 
                          height={32}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">
                          {player.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium group-hover:text-accent-color transition-colors">
                        {player.name}
                      </div>
                      <div className="text-xs opacity-70">
                        {player.position} • {player.club_name || 'Brak klubu'}
                      </div>
                    </div>
                  </Link>
                </td>                <td className="px-2 py-3 text-center">
                  <div className="flex items-center justify-center">
                    <StarIcon className="w-4 h-4 text-amber-500 mr-1" />
                    <span className="font-medium">{player.average_rating.toFixed(2)}</span>
                  </div>
                </td>
                <td className="px-2 py-3 text-center text-sm opacity-80">
                  {player.total_ratings}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
