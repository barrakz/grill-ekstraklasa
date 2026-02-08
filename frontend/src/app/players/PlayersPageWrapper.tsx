
"use client";
import Link from "next/link";
import Image from "next/image";
import { StarIcon, UserIcon } from "@heroicons/react/24/solid";
import ClubLatestComments from "../components/ClubLatestComments";
import TopPlayersTable from "../components/TopPlayersTable";
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

  const topClubPlayers = useMemo(() => {
    if (!currentClub) return [];

    const ratedPlayers = [...players]
      .filter(player => player.total_ratings > 0)
      .sort((a, b) => {
        if (b.average_rating !== a.average_rating) return b.average_rating - a.average_rating;
        if (b.total_ratings !== a.total_ratings) return b.total_ratings - a.total_ratings;
        return a.name.localeCompare(b.name, 'pl');
      });

    const selected: Player[] = [];
    const seenIds = new Set<number>();

    for (const player of ratedPlayers) {
      if (selected.length >= 5) break;
      selected.push(player);
      seenIds.add(player.id);
    }

    if (selected.length < 5) {
      const remainingPlayers = [...players]
        .filter(player => !seenIds.has(player.id))
        .sort((a, b) => a.name.localeCompare(b.name, 'pl'));

      for (const player of remainingPlayers) {
        if (selected.length >= 5) break;
        selected.push(player);
      }
    }

    return selected;
  }, [currentClub, players]);

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

        {/* Club page: show TOP + latest comments first */}
        {currentClub && (
          <div className="mt-8 max-w-4xl mx-auto space-y-8">
            <TopPlayersTable
              players={topClubPlayers}
              title={`Top 5 piłkarzy ${currentClub.name}`}
              description="Najlepiej oceniani zawodnicy z tego klubu"
              emptyMessage="Brak zawodników z ocenami w tym klubie"
            />
            <ClubLatestComments clubId={currentClub.id} />
          </div>
        )}

        {/* Players List */}
        <div className={`space-y-8 ${currentClub ? 'mt-10' : ''}`}>
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
                        <div className="relative w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {player.card_url ? (
                            <div className="h-full w-full flex items-center justify-center bg-amber-400">
                              <StarIcon className="h-4 w-4 text-amber-950" aria-hidden="true" />
                              <span className="sr-only">Ma kartę magic</span>
                            </div>
                          ) : player.photo_url ? (
                            <Image
                              src={player.photo_url}
                              alt={player.name}
                              width={32}
                              height={32}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-slate-50">
                              <UserIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
                              <span className="sr-only">Brak zdjęcia</span>
                            </div>
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
      </div>
    </main>
  );
}
