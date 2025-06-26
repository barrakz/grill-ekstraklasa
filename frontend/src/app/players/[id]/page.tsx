import PlayerDetails from '@/app/components/PlayerDetails';

type Params = {
  slug: string;
};

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
