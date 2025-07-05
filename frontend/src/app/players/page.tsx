

import type { Metadata } from 'next';

import { Suspense } from 'react';
import PlayersPageWrapper from './PlayersPageWrapper';

export const metadata: Metadata = {
  title: "Wszyscy piłkarze Ekstraklasy – Rankingi i oceny | Grill Ekstraklasa",
  description: "Przeglądaj kompletną listę wszystkich piłkarzy Ekstraklasy z rankingami, ocenami kibiców i komentarzami. Filtruj według klubów i pozycji.",
  alternates: {
    canonical: "https://grillekstraklasa.pl/players/",
  },
};

export default function Page() {
  return (
    <Suspense fallback={<div>Ładowanie...</div>}>
      <PlayersPageWrapper />
    </Suspense>
  );
}
