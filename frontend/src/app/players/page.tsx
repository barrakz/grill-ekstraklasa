import Link from "next/link";
import Image from "next/image";
import ClubSelect from "../components/ClubSelect";
import ClubLatestComments from "../components/ClubLatestComments";

type Player = {
  id: number;
  name: string;
  position: string;
  club_name: string | null;
  nationality: string;
  date_of_birth: string | null;
  height: number | null;
  weight: number | null;
  photo_url: string | null;
  average_rating: number;
  total_ratings: number;
  recent_ratings: number;
  user_rating: {
    id: number;
    value: number;
    created_at: string;
  } | null;
  recent_comments: Array<{
    id: number;
    content: string;
    user: {
      id: number;
      username: string;
    };
    likes_count: number;
    is_liked_by_user: boolean;
    created_at: string;
    updated_at: string;
  }>;
};

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

async function getPlayers(clubId?: string): Promise<Player[]> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  
  const url = clubId 
    ? `${API_BASE_URL}/api/players/?club=${clubId}`
    : `${API_BASE_URL}/api/players/`;
    
  const res = await fetch(url, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch players');
  }
  
  return res.json();
}

async function getClubs(): Promise<Club[]> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  
  const res = await fetch(`${API_BASE_URL}/api/clubs/`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch clubs');
  }
  
  return res.json();
}

type PageProps = {
  params: { id?: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function PlayersPage({ searchParams }: PageProps) {
  const [players, clubs] = await Promise.all([
    getPlayers(typeof searchParams.club === 'string' ? searchParams.club : undefined),
    getClubs()
  ]);

  const clubId = typeof searchParams.club === 'string' ? searchParams.club : undefined;

  const currentClub = clubs.find(c => c.id.toString() === clubId);

  // Group players by position
  const playersByPosition = players.reduce((acc, player) => {
    if (!acc[player.position]) {
      acc[player.position] = [];
    }
    acc[player.position].push(player);
    return acc;
  }, {} as Record<string, Player[]>);

  // Sort positions in desired order
  const sortedPositions = ['GK', 'DF', 'MF', 'FW'].filter(
    pos => playersByPosition[pos]?.length > 0
  );

  return (
    <main className="min-h-screen py-3 md:py-6 px-2 md:px-4">
      <div className="max-w-full md:max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-lg md:text-2xl font-bold mb-1">
            {currentClub 
              ? `Piłkarze ${currentClub.name}`
              : 'Wszyscy Piłkarze Ekstraklasy'
            }
          </h1>
          <p className="text-xs md:text-sm opacity-90 mb-0">
            {currentClub 
              ? `Przeglądaj i oceniaj zawodników ${currentClub.name}`
              : 'Oceniaj i śledź statystyki swoich ulubionych zawodników'
            }
          </p>
          {!currentClub && (
            <p className="text-xs text-amber-400 mt-1">
              Sortowanie według średniej oceny (od najwyższej)
            </p>
          )}
        </div>

        {/* Filter Section */}
        <div className="flex justify-center mb-4">
          <ClubSelect clubs={clubs} currentClubId={clubId} />
        </div>

        {/* Players List */}
        <div className="space-y-8">
          {sortedPositions.map(position => (
            <div key={position}>
              <h2 className="text-xl font-semibold mb-3 px-2">
                {getPositionDisplayName(position)}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playersByPosition[position].map(player => (
                  <Link href={`/players/${player.id}`} key={player.id}>
                    <div className={`player-card card hover:border-accent-color transition-all cursor-pointer p-1.5 h-full ${player.average_rating >= 4.5 ? 'border-amber-400' : ''}`}>
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-bg border border-border-color flex items-center justify-center overflow-hidden flex-shrink-0">
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
                          <h2 className="text-xs font-semibold leading-tight line-clamp-2 h-8">{player.name}</h2>
                          <div className="flex items-center justify-center gap-0.5 mt-0.5">
                            <span className={`${player.average_rating >= 4.5 ? 'text-amber-400' : 'text-amber-400/70'} text-xs`}>★</span>
                            <span className={`font-bold text-xs ${player.average_rating >= 4.5 ? 'text-amber-400' : ''}`}>{player.average_rating.toFixed(2)}</span>
                            <span className="text-xs text-text-muted">/{player.total_ratings}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
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
