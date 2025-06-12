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

export default async function ClubsPage() {
  const clubs = await getClubs();

  return (
    <main className="min-h-screen py-3 md:py-6 px-2 md:px-4">
      <div className="max-w-full md:max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-4">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Kluby Ekstraklasy</h1>
          <p className="text-sm md:text-base opacity-90 mb-4">
            Poznaj wszystkie kluby najwyższej klasy rozgrywkowej
          </p>
        </div>

        {/* Clubs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {clubs.map((club) => (
            <Link href={`/players?club=${club.id}`} key={club.id}>
              <div className="card hover:border-accent-color transition-all cursor-pointer p-3">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                    {club.logo_url ? (
                      <Image
                        src={club.logo_url}
                        alt={club.name}
                        width={80}
                        height={80}
                        className="rounded-full object-contain"
                      />
                    ) : (
                      <span className="text-3xl">⚽</span>
                    )}
                  </div>
                  <h2 className="text-base font-semibold mb-1 line-clamp-1">{club.name}</h2>
                  <p className="text-xs opacity-80 mb-1">{club.city}</p>
                  {club.founded_year && (
                    <p className="opacity-60 text-xs">
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