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
    <div className="relative w-full sm:w-auto">
      <select 
        aria-label="Wybierz klub"
        className="w-full p-2 pr-8 rounded-lg appearance-none bg-white/10 border border-white/20 text-white focus:outline-none focus:border-white/40"
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
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-white/70">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </div>
  );
} 