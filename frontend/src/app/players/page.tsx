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
  rating_avg: number;
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
    <main className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            {selectedClub 
              ? `Piłkarze ${selectedClub.name}`
              : 'Wszyscy Piłkarze Ekstraklasy'
            }
          </h1>
          <p className="text-xl mb-8 opacity-90">
            {selectedClub 
              ? `Przeglądaj i oceniaj zawodników ${selectedClub.name}`
              : 'Oceniaj i śledź statystyki swoich ulubionych zawodników'
            }
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="card mb-8">
          <div className="flex gap-4 items-center">
            <input
              type="search"
              placeholder="Szukaj piłkarza..."
              className="flex-1 p-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
            />
            <ClubSelect clubs={clubs} currentClubId={resolvedSearchParams.club} />
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => (
            <Link href={`/players/${player.id}`} key={player.id}>
              <div className="player-card card hover:border-accent-color transition-all cursor-pointer p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold mb-1">{player.name}</h2>
                    <p className="text-sm text-text-muted mb-1">{player.club_name || 'Bez klubu'}</p>
                    <p className="text-xs opacity-70">{player.position}</p>
                  </div>
                  <div className="flex items-center bg-accent-color/10 rounded-lg px-3 py-2">
                    <span className="text-amber-400 text-sm mr-1">★</span>
                    <span className="font-bold">{player.rating_avg || '0.0'}</span>
                    <span className="text-xs text-text-muted ml-1">/{player.total_ratings || 0}</span>
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
