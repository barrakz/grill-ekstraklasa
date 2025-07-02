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
    title: `Profil zawodnika ${slug} – Grill Ekstraklasa`,
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
