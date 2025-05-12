import Link from "next/link";
import Image from "next/image";
import ClubSelect from "../components/ClubSelect";

type Player = {
  id: number;
  name: string;
  position: string;
  club_name: string | null;
  rating_avg: number;
  photo_url: string | null;
};

type Club = {
  id: number;
  name: string;
};

async function getPlayers(clubId?: string): Promise<Player[]> {
  const url = clubId 
    ? `http://localhost:8000/api/players/?club=${clubId}`
    : 'http://localhost:8000/api/players/';
    
  const res = await fetch(url, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch players');
  }
  
  return res.json();
}

async function getClubs(): Promise<Club[]> {
  const res = await fetch('http://localhost:8000/api/clubs/', {
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
  searchParams: { club?: string };
}) {
  const [players, clubs] = await Promise.all([
    getPlayers(searchParams.club),
    getClubs()
  ]);

  const selectedClub = clubs.find(club => club.id.toString() === searchParams.club);

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
            <ClubSelect clubs={clubs} currentClubId={searchParams.club} />
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <Link href={`/players/${player.id}`} key={player.id}>
              <div className="card hover:transform hover:scale-105 transition-all cursor-pointer">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                    {player.photo_url ? (
                      <Image
                        src={player.photo_url}
                        alt={player.name}
                        width={96}
                        height={96}
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-4xl">👤</span>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold mb-2">{player.name}</h2>
                  <p className="opacity-80 mb-2">{player.club_name || 'Bez klubu'}</p>
                  <div className="flex justify-center items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    <span className="text-xl font-bold">{player.rating_avg || '0.0'}</span>
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
