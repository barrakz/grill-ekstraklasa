'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

type ClubCardProps = {
  id: number;
  name: string;
  logo_url: string | null;
};

export default function ClubCard({ id, name, logo_url }: ClubCardProps) {
  const router = useRouter();

  return (
    <div 
      className="card hover:transform hover:scale-105 transition-all cursor-pointer"
      onClick={() => router.push(`/players?club=${id}`)}
    >
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
          {logo_url ? (
            <Image
              src={logo_url}
              alt={name}
              width={96}
              height={96}
              className="rounded-full"
            />
          ) : (
            <span className="text-4xl">⚽</span>
          )}
        </div>
        <h3 className="text-xl font-semibold">{name}</h3>
      </div>
    </div>
  );
} 