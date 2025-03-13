import Link from "next/link";

export default async function PlayersPage() {
  const res = await fetch("http://127.0.0.1:8000/api/players/", {
    next: { revalidate: 10 },
  });

  const players = await res.json();

  return (
    <main className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Lista Piłkarzy</h1>

      <ul className="space-y-2">
        {players.map((player: any) => (
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
