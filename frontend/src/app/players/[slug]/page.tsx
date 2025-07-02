import PlayerDetails from '@/app/components/PlayerDetails';
import type { Metadata } from 'next';

type Params = {
  slug: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `Profil zawodnika – Oceny i komentarze | Grill Ekstraklasa`,
    description: `Zobacz profil zawodnika z ocenami i komentarzami kibiców. Sprawdź statystyki i rankingi na Grill Ekstraklasa.`,
    alternates: {
      canonical: `https://grillekstraklasa.pl/players/${slug}/`,
    },
    other: {
      'format-detection': 'telephone=no',
    },
  };
}

export default async function PlayerPage({ 
  params 
}: { 
  params: Promise<Params>;
}) {
  const { slug } = await params;

  return <PlayerDetails playerId={slug} />;
}

export async function generateStaticParams(): Promise<Params[]> {
  return [];
}
