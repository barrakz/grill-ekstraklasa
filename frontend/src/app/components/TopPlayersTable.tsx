'use client';

import { Player } from '@/app/types/player';
import PlayerTableRow from '@/app/components/players/PlayerTableRow';

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
              <PlayerTableRow key={player.id} player={player} index={index} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
