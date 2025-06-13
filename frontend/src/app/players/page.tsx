import Link from "next/link";
import Image from "next/image";
import ClubSelect from "../components/ClubSelect";

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

async function getPlayers(clubId?: string): Promise<Player[]> {
  // Używamy zmiennej środowiskowej dla adresu API
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
  // Używamy zmiennej środowiskowej dla adresu API
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  
  const res = await fetch(`${API_BASE_URL}/api/clubs/`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch clubs');
  }
  
  return res.json();
}

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ club?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const [players, clubs] = await Promise.all([
    getPlayers(resolvedSearchParams.club),
    getClubs()
  ]);

  const selectedClub = clubs.find(club => club.id.toString() === resolvedSearchParams.club);

  return (
    <main className="min-h-screen py-3 md:py-6 px-2 md:px-4">
      <div className="max-w-full md:max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-2 md:mb-4">
          <h1 className="text-lg md:text-2xl font-bold mb-1">
            {selectedClub 
              ? `Piłkarze ${selectedClub.name}`
              : 'Wszyscy Piłkarze Ekstraklasy'
            }
          </h1>
          <p className="text-xs md:text-sm opacity-90 mb-0">
            {selectedClub 
              ? `Przeglądaj i oceniaj zawodników ${selectedClub.name}`
              : 'Oceniaj i śledź statystyki swoich ulubionych zawodników'
            }
          </p>
        </div>

        {/* Filter Section */}
        <div className="flex justify-center mb-2">
          <ClubSelect clubs={clubs} currentClubId={resolvedSearchParams.club} />
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5">
          {players.map((player) => (
            <Link href={`/players/${player.id}`} key={player.id}>
              <div className="player-card card hover:border-accent-color transition-all cursor-pointer p-1.5 h-full">
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
                      <span className="text-amber-400 text-xs">★</span>
                      <span className="font-bold text-xs">{player.average_rating.toFixed(2)}</span>
                      <span className="text-xs text-text-muted">/{player.total_ratings}</span>
                    </div>
                    <p className="text-[10px] text-text-muted truncate mt-0.5">{player.position}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
