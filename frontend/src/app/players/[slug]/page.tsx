import PlayerDetails from '@/app/components/PlayerDetails';
import type { Metadata } from 'next';

type Params = {
  slug: string;
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return {
    title: `Profil zawodnika ${params.slug} – Grill Ekstraklasa`,
    alternates: {
      canonical: `https://grillekstraklasa.pl/players/${params.slug}/`,
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
