'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { LatestMediaItem, LatestMediaResponse } from '@/app/types/media';
import { useTwitterEmbeds } from '@/app/hooks/useTwitterEmbeds';

function normalizeTweetUrl(rawUrl: string) {
  return rawUrl
    .trim()
    .replace(/^https?:\/\/(www\.)?x\.com\//, 'https://twitter.com/')
    .replace(/^https?:\/\/(www\.)?twitter\.com\//, 'https://twitter.com/')
    .replace(/^x\.com\//, 'https://twitter.com/')
    .replace(/^www\.x\.com\//, 'https://twitter.com/')
    .replace(/^twitter\.com\//, 'https://twitter.com/')
    .replace(/^www\.twitter\.com\//, 'https://twitter.com/');
}

function MediaCard({ item, tweetsReady }: { item: LatestMediaItem; tweetsReady: boolean }) {
  const tweetUrl = item.type === 'tweet' ? normalizeTweetUrl(item.url) : null;

  return (
    <div className="card min-w-[240px] md:min-w-0 flex flex-col gap-3 border border-slate-200/70 bg-white/90">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {item.player_slug ? (
              <Link href={`/players/${item.player_slug}`} className="hover:underline">
                {item.player_name}
              </Link>
            ) : (
              item.player_name
            )}
          </p>
          {typeof item.rating === 'number' && (
            <p className="text-xs text-rose-500">Ocena: {item.rating.toFixed(1)}</p>
          )}
        </div>
        <span className="text-lg">{item.type === 'gif' ? '🎬' : '🐦'}</span>
      </div>

      {item.type === 'gif' && (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <img src={item.url} alt="GIF" className="h-36 w-full object-cover" loading="lazy" />
        </div>
      )}

      {tweetUrl && (
        <div className="tweet-embed relative rounded-xl border border-slate-200 bg-white p-2">
          {!tweetsReady && (
            <div className="tweet-loading">
              <div className="tweet-skeleton long"></div>
              <div className="tweet-skeleton medium"></div>
              <div className="tweet-skeleton short"></div>
            </div>
          )}
          <blockquote className="twitter-tweet">
            <a href={tweetUrl}></a>
          </blockquote>
          <a
            href={tweetUrl}
            className="mt-2 inline-flex text-xs font-semibold text-sky-600 hover:text-sky-700"
            target="_blank"
            rel="noreferrer"
          >
            Zobacz tweeta
          </a>
        </div>
      )}
    </div>
  );
}

export default function LatestMediaSection() {
  const [data, setData] = useState<LatestMediaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const res = await fetch('/api/latest-media/', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch latest media');
        const payload = (await res.json()) as LatestMediaResponse;
        if (isMounted) setData(payload);
      } catch {
        if (isMounted) setError('Nie udało się pobrać najnowszych mediów');
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
  const hasTweets = useMemo(
    () => items.some(item => item.type === 'tweet' && item.url),
    [items]
  );

  const tweetsReady = useTwitterEmbeds(hasTweets);

  return (
    <section className="card">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold mb-1 text-slate-900">Najnowsze gify i viralowe tweety</h2>
        <p className="text-sm text-slate-500">Memy, gify i ekraniki z boiska w jednym miejscu</p>
      </div>

      {isLoading && (
        <div className="text-center text-sm text-slate-400 animate-pulse">Ładowanie gifów i tweetów...</div>
      )}

      {error && !isLoading && (
        <div className="text-center text-sm text-rose-500">{error}</div>
      )}

      {!isLoading && !error && items.length === 0 && (
        <div className="text-center text-sm text-slate-500">Brak świeżych mediów</div>
      )}

      {items.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {items.map(item => (
            <MediaCard key={item.id} item={item} tweetsReady={tweetsReady} />
          ))}
        </div>
      )}
    </section>
  );
}
