import Link from "next/link";
import ClubCard from "./components/ClubCard";
import TopPlayersTable from "./components/TopPlayersTable";
import LatestComments from "./components/LatestComments";
import WeeklyDramasSection from "./components/WeeklyDramasSection";
import LiveLowestRatingsWidget from "./components/LiveLowestRatingsWidget";
import LatestMediaSection from "./components/LatestMediaSection";
import LatestCardsSection from "./components/LatestCardsSection";
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
    <main className="min-h-screen pt-10 pb-12 px-4 md:pb-10">
      <LiveLowestRatingsWidget />
      <div className="max-w-6xl mx-auto md:pr-72">
        {/* Hero Section */}
        <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center mb-14">
          <div className="reveal">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-500">
              Dla kibiców Ekstraklasy
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl font-semibold text-slate-900">
              Oceniaj piłkarzy Ekstraklasy. Czytaj opinie kibiców.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Wejdź w stronę meczu albo profil zawodnika, daj ocenę 1–10 i sprawdź, jak kibice rozliczają występy Ekstraklasy.
            </p>
            <div className="mt-6">
              <div className="flex flex-wrap gap-3">
                <Link href="/mecze" className="accent-button text-base">
                  Przejdź do meczów
                </Link>
                <Link href="/players" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-700 shadow-sm hover:border-slate-300 hover:text-slate-900">
                  Lista piłkarzy
                </Link>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-5 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                Strony meczowe
              </span>
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
                Lista klubów w menu
              </span>
            </div>
          </div>

          <div className="reveal reveal-delay-1">
            <div className="card p-6 md:p-8 bg-white/85">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Jak to działa</h2>
                <span className="text-xs text-slate-400 uppercase tracking-[0.3em]">3 kroki</span>
              </div>
              <div className="mt-6 space-y-4 text-sm text-slate-600">
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-base font-semibold text-slate-900">1</span>
                  <div>
                    <p className="font-medium text-slate-900">Wybierz piłkarza</p>
                    <p className="text-slate-500">(z listy zawodników)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-base font-semibold text-slate-900">2</span>
                  <div>
                    <p className="font-medium text-slate-900">Oceń w skali 1–10</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-base font-semibold text-slate-900">3</span>
                  <div>
                    <p className="font-medium text-slate-900">Dodaj komentarz i reaguj na opinie innych</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vote Now CTA */}
        <div className="mb-12 reveal">
          <Link
            href="/#dramaty-tygodnia"
            className="hidden md:flex items-center justify-center text-center bg-red-600 hover:bg-red-700 text-white font-bold text-lg md:text-xl px-6 py-5 md:py-6 rounded-2xl shadow-2xl transition-transform duration-200 hover:scale-[1.02]"
          >
            ZAGŁOSUJ TERAZ NA NAJGORSZEGO PIŁKARZA TYGODNIA 🔥
          </Link>
          <Link
            href="/#dramaty-tygodnia"
            className="md:hidden sticky bottom-4 z-20 flex items-center justify-center text-center bg-red-600 hover:bg-red-700 text-white font-bold text-base px-5 py-4 rounded-2xl shadow-2xl transition-transform duration-200 hover:scale-[1.02]"
          >
            ZAGŁOSUJ TERAZ NA NAJGORSZEGO PIŁKARZA TYGODNIA 🔥
          </Link>
        </div>

        {/* Top Players Section */}
        <div className="mt-12 reveal reveal-delay-2">
          <TopPlayersTable 
            players={topPlayers} 
            title="Top 5 najlepszych piłkarzy" 
            description="Piłkarze z najwyższą średnią ocen od kibiców"
          />
        </div>

        {/* Weekly Dramas Section */}
        <div className="mt-12 reveal">
          <WeeklyDramasSection />
        </div>

        {/* Latest Comments Section */}
        <div className="mt-12 reveal reveal-delay-3">
          <LatestComments 
            comments={latestComments}
            title="Ostatnie komentarze"
            description="Co kibice mówią o piłkarzach Ekstraklasy"
          />
        </div>

        {/* Latest Media Section */}
        <div className="mt-12 reveal">
          <LatestMediaSection />
        </div>

        {/* Graphics / Magic Cards Section */}
        <div className="mt-12 reveal">
          <LatestCardsSection />
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
