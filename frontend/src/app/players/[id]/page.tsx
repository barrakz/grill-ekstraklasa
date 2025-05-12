import Image from "next/image";
import Link from "next/link";

type Player = {
  id: number;
  name: string;
  position: string;
  club_name: string | null;
  rating_avg: number;
  photo_url: string | null;
  nationality: string;
  birth_date: string;
  height: number;
  weight: number;
};

async function getPlayer(id: string): Promise<Player> {
  const res = await fetch(`http://localhost:8000/api/players/${id}/`, {
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error("Failed to fetch player");
  }

  return res.json();
}

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const player = await getPlayer(params.id);

  return (
    <main className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link 
          href="/players" 
          className="inline-block mb-8 text-white/80 hover:text-white transition-colors"
        >
          ← Wróć do listy piłkarzy
        </Link>

        {/* Player Header Card */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-48 h-48 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              {player.photo_url ? (
                <Image
                  src={player.photo_url}
                  alt={player.name}
                  width={192}
                  height={192}
                  className="rounded-full"
                />
              ) : (
                <span className="text-6xl">👤</span>
              )}
            </div>
            <div className="text-center md:text-left flex-grow">
              <h1 className="text-4xl font-bold mb-4">{player.name}</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="opacity-80 mb-2">
                    <span className="font-semibold">Klub:</span> {player.club_name || 'Bez klubu'}
                  </p>
                  <p className="opacity-80 mb-2">
                    <span className="font-semibold">Pozycja:</span> {player.position}
                  </p>
                  <p className="opacity-80 mb-2">
                    <span className="font-semibold">Narodowość:</span> {player.nationality}
                  </p>
                </div>
                <div>
                  <p className="opacity-80 mb-2">
                    <span className="font-semibold">Data urodzenia:</span> {new Date(player.birth_date).toLocaleDateString('pl-PL')}
                  </p>
                  <p className="opacity-80 mb-2">
                    <span className="font-semibold">Wzrost:</span> {player.height} cm
                  </p>
                  <p className="opacity-80 mb-2">
                    <span className="font-semibold">Waga:</span> {player.weight} kg
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card text-center">
            <h2 className="text-2xl font-semibold mb-4">Średnia ocena</h2>
            <div className="flex justify-center items-center gap-3">
              <span className="text-5xl">⭐</span>
              <span className="text-4xl font-bold">{player.rating_avg || '0.0'}</span>
            </div>
          </div>

          <div className="card text-center">
            <h2 className="text-2xl font-semibold mb-4">Oceń zawodnika</h2>
            <div className="flex justify-center gap-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  className="text-4xl hover:transform hover:scale-110 transition-transform focus:outline-none"
                  aria-label={`Oceń na ${rating} gwiazdek`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="card mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-center">Statystyki sezonu</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold mb-2">15</p>
              <p className="opacity-80">Mecze</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold mb-2">5</p>
              <p className="opacity-80">Gole</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold mb-2">3</p>
              <p className="opacity-80">Asysty</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold mb-2">1350</p>
              <p className="opacity-80">Minuty</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export async function generateStaticParams(): Promise<
  { id: string }[]
> {
  return [];
}
