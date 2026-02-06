'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLiveLowestRatings } from '@/app/hooks/useLiveLowestRatings';

function AnimatedRating({ value }: { value: number }) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setPulse(true);
    const timeout = setTimeout(() => setPulse(false), 350);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold tabular-nums transition-transform duration-300 ${
        pulse ? 'scale-110 text-red-600' : 'scale-100 text-rose-600'
      }`}
    >
      {value.toFixed(1)}
    </span>
  );
}

function LiveList() {
  const { data, error, isLoading } = useLiveLowestRatings();
  const items = data?.items ?? [];

  if (isLoading && items.length === 0) {
    return (
      <div className="text-xs text-slate-500 animate-pulse">Ładowanie live dram...</div>
    );
  }

  if (error) {
    return <div className="text-xs text-rose-500">{error}</div>;
  }

  if (items.length === 0) {
    return <div className="text-xs text-slate-500">Brak danych live</div>;
  }

  return (
    <ol className="mt-3 space-y-2 text-sm">
      {items.map((item, index) => (
        <li key={item.player_slug} className="flex items-center justify-between gap-2">
          <Link
            href={`/players/${item.player_slug}`}
            className="truncate text-slate-700 hover:text-slate-900"
          >
            {index + 1}. {item.player_name}
          </Link>
          <span className="flex items-center gap-2 text-xs text-slate-500">
            <AnimatedRating value={item.average_rating} />
            <span>({item.total_ratings})</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function LiveLowestRatingsWidget() {
  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-900">Aktualnie najniższe oceny</span>
        <span className="text-base">🔥</span>
      </div>
      <LiveList />
    </>
  );

  return (
    <>
      <div className="md:hidden mb-8">
        <div className="rounded-2xl border border-rose-200 bg-white/90 px-4 py-3 shadow-lg backdrop-blur">
          {content}
        </div>
      </div>
      <aside className="hidden md:block fixed right-6 top-28 z-20 w-64">
        <div className="rounded-2xl border border-rose-200 bg-white/95 p-4 shadow-xl">
          {content}
        </div>
      </aside>
    </>
  );
}
