'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { LatestCardItem, LatestCardsResponse } from '@/app/types/cards';

function CardImageTile({ item }: { item: LatestCardItem }) {
  const href = `/players/${item.player_slug}`;

  return (
    <Link
      href={href}
      className="card min-w-[240px] md:min-w-0 flex flex-col gap-3 border border-slate-200/70 bg-white/90 hover:border-accent-color/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{item.player_name}</p>
          {item.club_name && <p className="text-xs text-slate-500 truncate">{item.club_name}</p>}
        </div>
        <span className="text-xs font-semibold text-amber-600 whitespace-nowrap">
          ★ {typeof item.rating === 'number' ? item.rating.toFixed(2) : '0.00'}
        </span>
      </div>

      <div className="relative w-full aspect-[2/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        {item.card_url ? (
          <Image
            src={item.card_url}
            alt={`Karta magic ${item.player_name}`}
            fill
            sizes="(min-width: 1024px) 320px, (min-width: 768px) 33vw, 240px"
            className="object-contain"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sm text-slate-400">
            Brak grafiki
          </div>
        )}
      </div>
    </Link>
  );
}

export default function LatestCardsSection() {
  const [data, setData] = useState<LatestCardsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const res = await fetch('/api/latest-cards/?limit=5', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch latest cards');
        const payload = (await res.json()) as LatestCardsResponse;
        if (isMounted) setData(payload);
      } catch {
        if (isMounted) setError('Nie udało się pobrać grafik');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const items = data?.items ?? [];

  return (
    <section className="card">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold mb-1 text-slate-900">Grafiki</h2>
        <p className="text-sm text-slate-500">Nowe avatarki xd</p>
      </div>

      {isLoading && (
        <div className="text-center text-sm text-slate-400 animate-pulse">Ładowanie grafik...</div>
      )}

      {error && !isLoading && <div className="text-center text-sm text-rose-500">{error}</div>}

      {!isLoading && !error && items.length === 0 && (
        <div className="text-center text-sm text-slate-500">Brak nowych grafik</div>
      )}

      {items.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {items.map(item => (
            <CardImageTile key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
