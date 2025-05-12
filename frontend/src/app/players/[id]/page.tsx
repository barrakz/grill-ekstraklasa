import PlayerDetails from '@/app/components/PlayerDetails';

export default function PlayerPage({ params }: { params: { id: string } }) {
  return <PlayerDetails playerId={params.id} />;
}

export async function generateStaticParams() {
  return [];
}
