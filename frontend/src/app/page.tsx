import Link from "next/link";

export default function HomePage() {
  return (
    <main className="max-w-3xl mx-auto py-10">
      <h1 className="text-4xl font-bold mb-4">Grill Ekstraklasa</h1>
      <p className="text-lg mb-6">
        Witaj w aplikacji ocen piłkarzy Ekstraklasy!
      </p>

      <Link href="/players" className="text-blue-600 hover:underline text-xl">
        Zobacz listę piłkarzy
      </Link>
    </main>
  );
}
