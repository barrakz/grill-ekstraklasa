import Link from "next/link";
import ClubCard from "./components/ClubCard";
import TopPlayersTable from "./components/TopPlayersTable";
import LatestComments from "./components/LatestComments";
import { Player } from "./types/player";

type Club = {
  id: number;
  name: string;
  logo_url: string | null;
};

type Comment = {
  id: number;
  content: string;
  player_name: string;
  player_id: number;
  user: {
    id: number;
    username: string;
  };
  likes_count: number;
  created_at: string;
};

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

async function getTopRatedPlayers(limit = 5): Promise<Player[]> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const res = await fetch(`${API_BASE_URL}/api/players/top_rated/?limit=${limit}&min_ratings=1`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    console.error('Failed to fetch top rated players');
    return [];
  }
  
  return res.json();
}

async function getLatestComments(limit = 5): Promise<Comment[]> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const res = await fetch(`${API_BASE_URL}/api/comments/latest/?limit=${limit}`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    console.error('Failed to fetch latest comments');
    return [];
  }
  
  return res.json();
}

export default async function HomePage() {
  const [clubs, topPlayers, latestComments] = await Promise.all([
    getClubs(),
    getTopRatedPlayers(5),
    getLatestComments(5)
  ]);

  return (
    <main className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent drop-shadow-lg">
            Grill Ekstraklasa
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-amber-500 to-red-500 mx-auto mb-6"></div>
          <p className="text-xl mb-8 text-text-light/90">
            Witaj w aplikacji ocen piłkarzy Ekstraklasy!
          </p>
          <Link 
            href="/players" 
            className="accent-button inline-block text-lg"
          >
            Zobacz wszystkich piłkarzy
          </Link>
        </div>

        {/* Top Players Section */}
        <div className="mt-16">
          <TopPlayersTable 
            players={topPlayers} 
            title="Top 5 najlepszych piłkarzy" 
            description="Piłkarze z najwyższą średnią ocen od kibiców"
          />
        </div>

        {/* Latest Comments Section */}
        <div className="mt-16">
          <LatestComments 
            comments={latestComments}
            title="Ostatnie komentarze"
            description="Co kibice mówią o piłkarzach Ekstraklasy"
          />
        </div>

        {/* Clubs Grid */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Wybierz klub</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <ClubCard 
                key={club.id}
                id={club.id}
                name={club.name}
                logo_url={club.logo_url}
              />
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="card text-center">
            <div className="text-4xl mb-4">👆</div>
            <h3 className="text-xl font-semibold mb-2">Łatwe ocenianie</h3>
            <p className="opacity-80">Szybkie i proste ocenianie piłkarzy jednym kliknięciem</p>
          </div>
          
          <div className="card text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Statystyki</h3>
            <p className="opacity-80">Szczegółowe statystyki i rankingi zawodników</p>
          </div>
          
          <div className="card text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold mb-2">Rankingi</h3>
            <p className="opacity-80">Odkryj najlepszych piłkarzy według ocen kibiców</p>
          </div>
        </div>
      </div>
    </main>
  );
}
