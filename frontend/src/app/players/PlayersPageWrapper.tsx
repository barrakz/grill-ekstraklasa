
"use client";
import Link from "next/link";
import Image from "next/image";
import ClubLatestComments from "../components/ClubLatestComments";
import { Player } from "../types/player";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";

type Club = {
  id: number;
  name: string;
};

function getPositionDisplayName(position: string): string {
  const positionMap: Record<string, string> = {
    'GK': 'Bramkarze',
    'DF': 'Obrońcy',
    'MF': 'Pomocnicy',
    'FW': 'Napastnicy'
  };
  return positionMap[position] || position;
}




type PlayersPageWrapperProps = {
  initialPlayers: Player[];
  initialClubs: Club[];
};

export default function PlayersPageWrapper({ initialPlayers, initialClubs }: PlayersPageWrapperProps) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");


  // clubId z query params
  const clubId = searchParams.get("club") || undefined;
  const currentClub = initialClubs.find((c: Club) => c.id.toString() === clubId);

  // NIE filtrujemy po klubie, bo backend już to robi
  const players = initialPlayers;

  // Filtrowanie po wyszukiwaniu
  const filteredPlayers = useMemo(() => {
    if (!search.trim()) return players;
    const s = search.trim().toLowerCase();
    return players.filter(p => p.name.toLowerCase().includes(s));
  }, [players, search]);

  // Group by position
  const playersByPosition = useMemo(() => {
    return filteredPlayers.reduce((acc: Record<string, Player[]>, player) => {
      if (!acc[player.position]) acc[player.position] = [];
      acc[player.position].push(player);
      return acc;
    }, {});
  }, [filteredPlayers]);

  const sortedPositions = ['GK', 'DF', 'MF', 'FW'].filter(
    pos => playersByPosition[pos]?.length > 0
  );

  return (
    <main className="min-h-screen py-3 md:py-6 px-2 md:px-4">
      <div className="max-w-full md:max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-lg md:text-2xl font-semibold text-slate-900 mb-1">
            {currentClub
              ? `Piłkarze ${currentClub.name}`
              : 'Wszyscy Piłkarze Ekstraklasy'
            }
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mb-0">
            {currentClub
              ? `Przeglądaj i oceniaj zawodników ${currentClub.name}`
              : 'Oceniaj swoich ulubionych zawodników'
            }
          </p>
          {!currentClub && (
            <p className="text-xs text-amber-500 mt-1">
              Sortowanie według średniej oceny (od najwyższej)
            </p>
          )}
        </div>

        {/* Filter Section */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-2 mb-4">
          {!currentClub && (
            <input
              type="text"
              placeholder="Szukaj piłkarza..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-color/20 focus:border-accent-color w-full md:w-64 shadow-sm"
              aria-label="Wyszukaj piłkarza"
            />
          )}
        </div>

        {/* Players List */}
        <div className="space-y-8">
          {sortedPositions.map(position => (
            <div key={position}>
              <h2 className="text-xl font-semibold text-slate-900 mb-3 px-2">
                {getPositionDisplayName(position)}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playersByPosition[position].map(player => (
                  <Link href={`/players/${player.slug || player.id}`} key={player.id}>
                    <div className={`player-card card hover:border-accent-color transition-all cursor-pointer p-1.5 h-full ${player.average_rating >= 4.5 ? 'border-amber-400' : ''}`}>
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {player.photo_url ? (
                            <Image
                              src={player.photo_url}
                              alt={player.name}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <span className="text-sm">👤</span>
                          )}
                        </div>
                        <div className="w-full text-center mt-1">
                          <h2 className="text-xs font-semibold leading-tight line-clamp-2 h-8 text-slate-900">{player.name}</h2>
                          <div className="flex items-center justify-center gap-0.5 mt-0.5">
                            <span className={`${player.average_rating >= 4.5 ? 'text-amber-500' : 'text-amber-400/70'} text-xs`}>★</span>
                            <span className={`font-bold text-xs ${player.average_rating >= 4.5 ? 'text-amber-500' : 'text-slate-700'}`}>{player.average_rating.toFixed(2)}</span>
                            <span className="text-xs text-slate-500">/{player.total_ratings}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          {sortedPositions.length === 0 && (
            <div className="text-center text-slate-500 py-10">Nie znaleziono piłkarzy.</div>
          )}
        </div>

        {/* Comments Section */}
        {currentClub && (
          <div className="mt-12 max-w-4xl mx-auto">
            <ClubLatestComments clubId={currentClub.id} />
          </div>
        )}
      </div>
    </main>
  );
}
