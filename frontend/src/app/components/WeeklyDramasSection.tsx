'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { WeeklyDramasResponse, WeeklyDramaItem } from '@/app/types/drama';
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

function DramaCard({ item }: { item: WeeklyDramaItem }) {
  const media = item.media;
  const tweetUrl = media?.type === 'tweet' ? normalizeTweetUrl(media.url) : null;
  const commentDate = item.highlight_comment?.created_at
    ? new Intl.DateTimeFormat('pl-PL', { day: '2-digit', month: 'short' }).format(
        new Date(item.highlight_comment.created_at)
      )
    : null;

  return (
    <Link
      href={`/players/${item.player.slug}`}
      className="card group min-w-[240px] md:min-w-0 flex flex-col gap-4 border border-rose-200/70 bg-white/90"
    >
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 shrink-0 rounded-2xl bg-slate-100 overflow-hidden">
          {item.player.photo_url ? (
            <img
              src={item.player.photo_url}
              alt={item.player.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-lg font-semibold text-slate-400">
              {item.player.name.slice(0, 1)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-900 leading-tight">{item.player.name}</p>
            {item.player.club_logo_url && (
              <img
                src={item.player.club_logo_url}
                alt={item.player.club_name ?? 'Herb klubu'}
                className="h-5 w-5 rounded-full object-contain"
                loading="lazy"
              />
            )}
          </div>
          {item.player.club_name && (
            <p className="text-xs text-slate-500">{item.player.club_name}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-red-600 leading-none">{item.average_rating.toFixed(1)}</p>
          <p className="text-[11px] text-slate-500">{item.total_ratings} głosów</p>
        </div>
      </div>

      {item.highlight_comment && (
        <div className="rounded-xl border border-rose-100 bg-rose-50/70 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-[0.25em] text-rose-400">Najnowszy komentarz</p>
            {commentDate && <span className="text-[11px] text-rose-300">{commentDate}</span>}
          </div>
          <p className="mt-1 text-sm text-slate-700 line-clamp-2">“{item.highlight_comment.content}”</p>
          {item.highlight_comment.user?.username && (
            <p className="mt-2 text-xs text-slate-500">@{item.highlight_comment.user.username}</p>
          )}
        </div>
      )}

      {media?.type === 'gif' && (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <img src={media.url} alt="GIF" className="h-28 w-full object-cover" loading="lazy" />
        </div>
      )}

      {tweetUrl && (
        <div className="tweet-embed rounded-xl border border-slate-200 bg-white p-2 max-h-[280px] overflow-hidden">
          <blockquote className="twitter-tweet">
            <a href={tweetUrl}></a>
          </blockquote>
          <p className="text-xs text-slate-500 mt-2">Osadzony tweet</p>
        </div>
      )}
    </Link>
  );
}

export default function WeeklyDramasSection() {
  const [data, setData] = useState<WeeklyDramasResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dramaty-tygodnia', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch weekly dramas');
        const payload = (await res.json()) as WeeklyDramasResponse;
        if (isMounted) setData(payload);
      } catch {
        if (isMounted) setError('Nie udało się pobrać dram tygodnia');
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
    () => items.some(item => item.media?.type === 'tweet' && item.media.url),
    [items]
  );

  useTwitterEmbeds(hasTweets);

  return (
    <section id="dramaty-tygodnia" className="card border-rose-200/60 bg-white/85">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">Największe dramaty tygodnia 🔥</h2>
        <p className="text-sm text-slate-500">Top 6 najniższych średnich ocen z tego tygodnia</p>
      </div>

      {isLoading && (
        <div className="text-center text-sm text-slate-400 animate-pulse">Ładowanie dramatów...</div>
      )}

      {error && !isLoading && (
        <div className="text-center text-sm text-rose-500">{error}</div>
      )}

      {!isLoading && !error && items.length === 0 && (
        <div className="text-center text-sm text-slate-500">Brak dramatów na ten tydzień</div>
      )}

      {items.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {items.map(item => (
            <DramaCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
