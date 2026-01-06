'use client';

import { useRouter } from 'next/navigation';

type Club = {
  id: number;
  name: string;
};

type ClubSelectProps = {
  clubs: Club[];
  currentClubId?: string;
  placeholder?: string;
  ariaLabel?: string;
  containerClassName?: string;
  selectClassName?: string;
};

export default function ClubSelect({
  clubs,
  currentClubId,
  placeholder = "Wszystkie kluby",
  ariaLabel,
  containerClassName = "",
  selectClassName = "",
}: ClubSelectProps) {
  const router = useRouter();

  const handleClubChange = (value: string) => {
    if (value) {
      router.push(`/players?club=${value}`);
    } else {
      router.push('/players');
    }
  };

  return (
    <div className={`relative w-full ${containerClassName}`}>
      <select 
        aria-label={ariaLabel || placeholder}
        className={`w-full py-2 px-3 text-sm rounded-lg appearance-none bg-white border border-slate-200 text-slate-700 focus:outline-none focus:border-accent-color focus:ring-2 focus:ring-accent-color/20 shadow-sm truncate ${selectClassName}`}
        onChange={(e) => handleClubChange(e.target.value)}
        value={currentClubId || ''}
      >
        <option value="">{placeholder}</option>
        {clubs.map((club) => (
          <option key={club.id} value={club.id}>
            {club.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </div>
  );
}
