import Link from "next/link";

type Player = {
  id: number;
  name: string;
  position: string;
  club_name: string | null;
  rating_avg: number;
};

async function getPlayer(id: string): Promise<Player> {
  const res = await fetch(`http://127.0.0.1:8000/api/players/${id}/`, {
    next: { revalidate: 10 },
  });

  if (!res.ok) {
    throw new Error("Nie udało się pobrać danych piłkarza");
  }

  return res.json();
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await getPlayer(id);

  return (
    <main className="max-w-2xl mx-auto py-10">
      <h1 className="text-4xl font-bold mb-4">{player.name}</h1>
      <p className="text-lg mb-2">Pozycja: {player.position}</p>
      <p className="text-lg mb-2">Klub: {player.club_name || 'Bez klubu'}</p>
      <p className="text-lg font-semibold text-yellow-600">
        Średnia ocen: {player.rating_avg}
      </p>

      <div className="mt-8 flex space-x-4">
        <Link href="/players" className="text-blue-600 hover:underline">
          ⬅️ Wróć do listy piłkarzy
        </Link>

        <Link href="/" className="text-gray-600 hover:underline">
          🏠 Strona główna
        </Link>
      </div>
    </main>
  );
}

export async function generateStaticParams(): Promise<
  { id: string }[]
> {
  return [];
}
