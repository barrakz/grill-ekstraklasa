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

import { Comment } from './types/comment';

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
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center mb-14">
          <div className="reveal">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-500">
              Dla kibiców Ekstraklasy
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl font-semibold text-slate-900">
              Oceń piłkarzy Ekstraklasy i zobacz opinie innych kibiców
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Wejdź w profile zawodników, dodawaj komentarze i sprawdzaj rankingi ocen. Wybierz klub, aby szybko znaleźć swoich ulubieńców.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/players" className="accent-button text-base">
                Zobacz wszystkich piłkarzy
              </Link>
              <Link
                href="/clubs"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Wybierz klub
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-5 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                Rankingi piłkarzy
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                Komentarze kibiców
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                Szybki wybór klubu
              </span>
            </div>
          </div>

          <div className="reveal reveal-delay-1">
            <div className="card p-6 md:p-8 bg-white/85">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Szybki start</h2>
                <span className="text-xs text-slate-400 uppercase tracking-[0.3em]">Krok po kroku</span>
              </div>
              <div className="mt-6 space-y-4 text-sm text-slate-600">
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-base font-semibold text-slate-900">1</span>
                  <div>
                    <p className="font-medium text-slate-900">Wybierz klub lub ligę wszystkich</p>
                    <p className="text-slate-500">Zobacz listę zawodników i przejdź do profili.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-base font-semibold text-slate-900">2</span>
                  <div>
                    <p className="font-medium text-slate-900">Oceń piłkarza w skali 1–10</p>
                    <p className="text-slate-500">Średnia ocena aktualizuje się na bieżąco.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-base font-semibold text-slate-900">3</span>
                  <div>
                    <p className="font-medium text-slate-900">Dodaj komentarz i reaguj</p>
                    <p className="text-slate-500">Dyskutuj z innymi kibicami pod opiniami.</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/players" className="accent-button text-sm">
                  Przejdź do listy piłkarzy
                </Link>
                <Link
                  href="/clubs"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Zobacz kluby
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Top Players Section */}
        <div className="mt-12 reveal reveal-delay-2">
          <TopPlayersTable 
            players={topPlayers} 
            title="Top 5 najlepszych piłkarzy" 
            description="Piłkarze z najwyższą średnią ocen od kibiców"
          />
        </div>

        {/* Latest Comments Section */}
        <div className="mt-12 reveal reveal-delay-3">
          <LatestComments 
            comments={latestComments}
            title="Ostatnie komentarze"
            description="Co kibice mówią o piłkarzach Ekstraklasy"
          />
        </div>

        {/* Clubs Grid */}
        <div className="mt-16 reveal">
          <h2 className="text-3xl font-semibold text-center mb-8 text-slate-900">Wybierz klub</h2>
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
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="card text-center reveal">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold mb-2 text-slate-900">Oceny 1–10</h3>
            <p className="text-sm text-slate-600">Oceń zawodnika w prosty sposób i zobacz średnią ocenę</p>
          </div>
          
          <div className="card text-center reveal reveal-delay-1">
            <div className="text-3xl mb-4">💬</div>
            <h3 className="text-lg font-semibold mb-2 text-slate-900">Komentarze kibiców</h3>
            <p className="text-sm text-slate-600">Dodawaj komentarze i polubienia pod opiniami</p>
          </div>
          
          <div className="card text-center reveal reveal-delay-2">
            <div className="text-3xl mb-4">🏆</div>
            <h3 className="text-lg font-semibold mb-2 text-slate-900">Rankingi piłkarzy</h3>
            <p className="text-sm text-slate-600">Sprawdź top zawodników według ocen społeczności</p>
          </div>
        </div>
      </div>
    </main>
  );
}
