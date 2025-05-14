import PlayerDetails from '@/app/components/PlayerDetails';

type Params = {
  id: string;
};

export default async function PlayerPage({ 
  params 
}: { 
  params: Promise<Params>;
}) {
  const { id } = await params;

  return <PlayerDetails playerId={id} />;
}

export async function generateStaticParams(): Promise<Params[]> {
  return [];
}
