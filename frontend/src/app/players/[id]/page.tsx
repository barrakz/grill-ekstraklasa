import Link from "next/link";

type Player = {
  id: number;
  name: string;
  position: string;
  club: string;
  rating_avg: number;
};

// 👇 POBIERANIE LISTY PIŁKARZY
async function getPlayers(): Promise<Player[]> {
  const res = await fetch("http://127.0.0.1:8000/api/players/", {
    next: { revalidate: 10 },
  });

  if (!res.ok) {
    throw new Error("Nie udało się pobrać listy piłkarzy");
  }

  return res.json();
}

export default async function PlayersPage() {
  const players = await getPlayers();

  return (
    <main className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Lista Piłkarzy</h1>

      <ul className="space-y-2">
        {players.map((player) => (
          <li key={player.id} className="border-b pb-2">
            <Link
              href={`/players/${player.id}`}
              className="text-blue-600 hover:underline text-lg"
            >
              {player.name} ({player.club})
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Link href="/" className="text-gray-600 hover:underline">
          ⬅️ Wróć na stronę główną
        </Link>
      </div>
    </main>
  );
}
