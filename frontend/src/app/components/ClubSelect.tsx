'use client';

import { useRouter } from 'next/navigation';

type Club = {
  id: number;
  name: string;
};

type ClubSelectProps = {
  clubs: Club[];
  currentClubId?: string;
};

export default function ClubSelect({ clubs, currentClubId }: ClubSelectProps) {
  const router = useRouter();

  const handleClubChange = (value: string) => {
    if (value) {
      router.push(`/players?club=${value}`);
    } else {
      router.push('/players');
    }
  };

  return (
    <select 
      className="p-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-white/40"
      onChange={(e) => handleClubChange(e.target.value)}
      value={currentClubId || ''}
    >
      <option value="">Wszystkie kluby</option>
      {clubs.map((club) => (
        <option key={club.id} value={club.id}>
          {club.name}
        </option>
      ))}
    </select>
  );
} 