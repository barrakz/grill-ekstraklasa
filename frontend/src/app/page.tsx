import Link from "next/link";
import ClubCard from "./components/ClubCard";

type Club = {
  id: number;
  name: string;
  logo_url: string | null;
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

export default async function HomePage() {
  const clubs = await getClubs();

  return (
    <main className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">Grill Ekstraklasa</h1>
          <p className="text-xl mb-8 opacity-90">
            Witaj w aplikacji ocen piłkarzy Ekstraklasy!
          </p>
          <Link 
            href="/players" 
            className="accent-button inline-block text-lg"
          >
            Zobacz wszystkich piłkarzy
          </Link>
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
