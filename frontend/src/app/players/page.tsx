

import type { Metadata } from 'next';

import PlayersPageWrapper from './PlayersPageWrapper';

export const metadata: Metadata = {
  title: "Wszyscy piłkarze Ekstraklasy – Rankingi i oceny | Grill Ekstraklasa",
  description: "Przeglądaj kompletną listę wszystkich piłkarzy Ekstraklasy z rankingami, ocenami kibiców i komentarzami. Filtruj według klubów i pozycji.",
  alternates: {
    canonical: "https://grillekstraklasa.pl/players/",
  },
};

async function getPlayers(clubId?: string) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const url = clubId
    ? `${API_BASE_URL}/api/players/?club=${clubId}`
    : `${API_BASE_URL}/api/players/`;
  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

async function getClubs() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const res = await fetch(`${API_BASE_URL}/api/clubs/`, { cache: 'no-store' });
  return res.json();
}

// Next.js 15 (React 19) może typować searchParams jako Promise dla wsparcia asynchronicznego dostępu.
interface PlayersSearchParams {
  [key: string]: string | string[] | undefined;
  club?: string | string[];
}

export default async function Page({ searchParams }: { searchParams?: Promise<PlayersSearchParams> }) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let clubId: string | undefined;
  const rawClub = resolvedSearchParams?.club;
  if (Array.isArray(rawClub)) clubId = rawClub[0];
  else if (typeof rawClub === 'string') clubId = rawClub;

  const [players, clubs] = await Promise.all([
    getPlayers(clubId),
    getClubs(),
  ]);
  return <PlayersPageWrapper initialPlayers={players} initialClubs={clubs} />;
}
