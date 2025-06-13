'use client';

import { useState } from 'react';
import TopPlayersTable from './TopPlayersTable';
import RefreshButton from './RefreshButton';
import { Player } from '../types/player';

type TopPlayersContainerProps = {
  initialPlayers: Player[];
};

export default function TopPlayersContainer({ initialPlayers }: TopPlayersContainerProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const refreshPlayers = async () => {
    setIsRefreshing(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_BASE_URL}/api/players/top_rated/?limit=5&min_ratings=1`, {
        cache: 'no-store'
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch top rated players');
      }
      
      const newPlayers = await res.json();
      setPlayers(newPlayers);
    } catch (error) {
      console.error('Failed to refresh players:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 z-10">
        <RefreshButton onRefresh={refreshPlayers} isRefreshing={isRefreshing} />
      </div>
      <TopPlayersTable 
        players={players} 
        title="Top 5 najlepszych piłkarzy" 
        description="Piłkarze z najwyższą średnią ocen od kibiców"
      />
    </div>
  );
}
