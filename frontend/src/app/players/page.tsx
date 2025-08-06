

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

export default async function Page({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  let clubId: string | undefined = undefined;
  if (searchParams && searchParams.club) {
    if (Array.isArray(searchParams.club)) {
      clubId = searchParams.club[0];
    } else {
      clubId = searchParams.club;
    }
  }
  const [players, clubs] = await Promise.all([
    getPlayers(clubId),
    getClubs(),
  ]);
  return <PlayersPageWrapper initialPlayers={players} initialClubs={clubs} />;
}
