import Image from "next/image";
import Link from "next/link";

type Club = {
  id: number;
  name: string;
  city: string;
  founded_year: number | null;
  logo_url: string | null;
};

async function getClubs(): Promise<Club[]> {
  const res = await fetch('http://localhost:8000/api/clubs/', {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch clubs');
  }
  
  return res.json();
}

export default async function ClubsPage() {
  const clubs = await getClubs();

  return (
    <main className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">Kluby Ekstraklasy</h1>
          <p className="text-xl mb-8 opacity-90">
            Poznaj wszystkie kluby najwyższej klasy rozgrywkowej
          </p>
        </div>

        {/* Search Section */}
        <div className="card mb-8">
          <input
            type="search"
            placeholder="Szukaj klubu..."
            className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
          />
        </div>

        {/* Clubs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <Link href={`/players?club=${club.id}`} key={club.id}>
              <div className="card hover:transform hover:scale-105 transition-all cursor-pointer">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                    {club.logo_url ? (
                      <Image
                        src={club.logo_url}
                        alt={club.name}
                        width={128}
                        height={128}
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-5xl">⚽</span>
                    )}
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">{club.name}</h2>
                  <p className="opacity-80 mb-2">{club.city}</p>
                  {club.founded_year && (
                    <p className="opacity-60 text-sm">
                      Rok założenia: {club.founded_year}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
} 