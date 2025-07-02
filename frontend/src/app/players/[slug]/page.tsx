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
  
  // Try to fetch player data for better SEO
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${API_BASE_URL}/api/players/${slug}/`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (res.ok) {
      const player = await res.json();
      return {
        title: `${player.name} – Profil, oceny i statystyki | Grill Ekstraklasa`,
        description: `Zobacz profil ${player.name}${player.club_name ? ` (${player.club_name})` : ''}. Sprawdź oceny kibiców, komentarze i statystyki piłkarza Ekstraklasy.`,
        alternates: {
          canonical: `https://grillekstraklasa.pl/players/${slug}/`,
        },
        openGraph: {
          title: `${player.name} – Profil piłkarza Ekstraklasy`,
          description: `Zobacz profil ${player.name} z ocenami i komentarzami kibiców`,
        },
        other: {
          'format-detection': 'telephone=no',
        },
      };
    }
  } catch (error) {
    // If API fails, use fallback
    console.log('Failed to fetch player data for metadata:', error);
  }

  // Fallback metadata if API call fails
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
