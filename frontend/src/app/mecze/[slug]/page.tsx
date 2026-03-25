import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MatchRatingBoard from '@/app/components/MatchRatingBoard';
import { getFixture } from '@/app/services/matches-service';

export const dynamic = 'force-dynamic';

type Params = {
  slug: string;
};

const statusLabel: Record<string, string> = {
  draft: 'Draft',
  lineup_pending: 'Czeka na skład',
  lineup_predicted: 'Przewidywany skład',
  published: 'Wyjściowe jedenastki',
  live: 'Na żywo',
  finished: 'Zakończony',
  archived: 'Archiwum',
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(value));

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const fixture = await getFixture(slug);

  if (!fixture) {
    return {
      title: 'Mecz nie znaleziony | Grill Ekstraklasa',
    };
  }

  const title = `${fixture.home_club_name} - ${fixture.away_club_name} | Mecz i oceny kibiców`;
  const description = `Strona meczu ${fixture.home_club_name} vs ${fixture.away_club_name}. Zobacz skład, średnie ocen i wystaw własne noty po spotkaniu.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://grillekstraklasa.pl/mecze/${slug}/`,
    },
    openGraph: {
      title,
      description,
      url: `https://grillekstraklasa.pl/mecze/${slug}/`,
      siteName: 'Grill Ekstraklasa',
      type: 'website',
      locale: 'pl_PL',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const fixture = await getFixture(slug);

  if (!fixture) {
    notFound();
  }

  const publicPlayersCount = (fixture.lineup.home?.length ?? 0) + (fixture.lineup.away?.length ?? 0);

  return (
    <main className="min-h-screen px-4 py-8 md:py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="reveal">
          <Link href="/mecze" className="inline-flex items-center gap-2 text-sm font-medium text-accent-color hover:underline">
            ← Wróć do listy meczów
          </Link>
        </div>

        <section className="reveal reveal-delay-1 overflow-hidden rounded-[2rem] border border-slate-200 bg-white/80 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="bg-[radial-gradient(circle_at_top_left,_rgba(31,91,255,0.16),_transparent_48%),linear-gradient(135deg,#f8fbff,#eef4ff)] p-6 md:p-10">
              <div className="inline-flex rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-500">
                {statusLabel[fixture.status] ?? fixture.status}
              </div>
              <h1 className="mt-4 text-4xl font-semibold text-slate-900 md:text-6xl">
                {fixture.home_club_name}
                <span className="mx-3 text-slate-300">vs</span>
                {fixture.away_club_name}
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-slate-600">
                Jedna strona meczu, szybkie noty i gotowe. Oceniasz tylko zawodników ze składu.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Termin</div>
                  <div className="mt-2 text-base font-semibold text-slate-900">{formatDateTime(fixture.kickoff_at)}</div>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Sezon</div>
                  <div className="mt-2 text-base font-semibold text-slate-900">{fixture.season_name}</div>
                </div>
                <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-emerald-700">Gospodarze</div>
                  <div className="mt-2 text-3xl font-semibold text-emerald-800">{fixture.home_rating_avg.toFixed(2)}</div>
                </div>
                <div className="rounded-[1.5rem] border border-sky-200 bg-sky-50 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-sky-700">Goście</div>
                  <div className="mt-2 text-3xl font-semibold text-sky-800">{fixture.away_rating_avg.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-950 p-6 text-white lg:border-l lg:border-t-0 md:p-10">
              <div className="text-sm uppercase tracking-[0.3em] text-slate-400">Tablica meczu</div>
              <div className="mt-5 flex items-end gap-4">
                <div className="text-6xl font-semibold leading-none">
                  {fixture.result_home ?? '-'}
                  <span className="mx-2 text-slate-600">:</span>
                  {fixture.result_away ?? '-'}
                </div>
              </div>
              <div className="mt-6 grid gap-4">
                <div className="rounded-[1.5rem] border border-slate-800 bg-slate-900/80 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Skład</div>
                  <p className="mt-2 text-sm text-slate-400">
                    {publicPlayersCount > 0
                      ? 'Skład jest na stronie — możesz rozdawać noty.'
                      : 'Skład jeszcze nie wylądował na stronie.'}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-800 bg-slate-900/80 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Łącznie głosów</div>
                  <div className="mt-2 text-2xl font-semibold">{fixture.ratings_count}</div>
                  <p className="mt-2 text-sm text-slate-400">
                    Tu liczy się ten mecz, nie cała kariera.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <MatchRatingBoard fixture={fixture} />
      </div>
    </main>
  );
}
