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

const statusTone: Record<string, string> = {
  live: 'bg-rose-600 text-white border-rose-500',
  finished: 'bg-slate-900 text-white border-slate-900',
  published: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  lineup_predicted: 'bg-amber-100 text-amber-800 border-amber-200',
  lineup_pending: 'bg-slate-100 text-slate-600 border-slate-200',
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  archived: 'bg-slate-100 text-slate-500 border-slate-200',
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(value));

const getClubInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'FC';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};

function ClubBadge({ name, tone }: { name: string; tone: 'home' | 'away' }) {
  const initials = getClubInitials(name);
  const gradient =
    tone === 'home'
      ? 'from-emerald-500 via-emerald-600 to-emerald-700'
      : 'from-sky-500 via-sky-600 to-sky-700';

  return (
    <div
      className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl font-bold text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)]`}
    >
      {initials}
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: 'home' | 'away' }) {
  const styles =
    tone === 'home'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : tone === 'away'
        ? 'border-sky-200 bg-sky-50 text-sky-800'
        : 'border-slate-200 bg-white/90 text-slate-900';

  return (
    <div className={`rounded-2xl border px-4 py-3 ${styles}`}>
      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
    </div>
  );
}

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

  return (
    <main className="min-h-screen px-4 py-8 md:py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="reveal">
          <Link href="/mecze" className="inline-flex items-center gap-2 text-sm font-medium text-accent-color hover:underline">
            ← Wróć do listy meczów
          </Link>
        </div>

        <section className="reveal reveal-delay-1 overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="p-6 md:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] ${statusTone[fixture.status] ?? 'border-slate-700 bg-slate-900 text-slate-300'}`}
              >
                {statusLabel[fixture.status] ?? fixture.status}
              </div>
              <span className="text-xs uppercase tracking-[0.25em] text-slate-400">
                {fixture.season_name}
                {fixture.round_number ? ` • Kolejka ${fixture.round_number}` : ''}
              </span>
            </div>

            <div className="mt-6 grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
              <div className="flex items-center gap-4">
                <ClubBadge name={fixture.home_club_name} tone="home" />
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Gospodarze</p>
                  <h1 className="text-3xl font-semibold md:text-4xl">{fixture.home_club_name}</h1>
                </div>
              </div>

              <div className="text-center">
                <div className="text-6xl font-bold leading-none md:text-8xl">
                  {fixture.result_home ?? '-'}
                  <span className="mx-3 text-slate-500">:</span>
                  {fixture.result_away ?? '-'}
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-400">wynik meczu</p>
              </div>

              <div className="flex items-center justify-start gap-4 md:justify-end">
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.25em] text-sky-200">Goście</p>
                  <h1 className="text-3xl font-semibold md:text-4xl">{fixture.away_club_name}</h1>
                </div>
                <ClubBadge name={fixture.away_club_name} tone="away" />
              </div>
            </div>

            <p className="mt-6 max-w-2xl text-sm text-slate-300">
              Jedna strona meczu, szybkie noty i gotowe. Oceniasz tylko zawodników ze składu.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard label="Termin" value={formatDateTime(fixture.kickoff_at)} />
              <StatCard label="Sezon" value={fixture.season_name} />
              <StatCard label="Głosy" value={`${fixture.ratings_count}`} />
              <StatCard label="Dom" value={fixture.home_rating_avg.toFixed(2)} tone="home" />
              <StatCard label="Wyjazd" value={fixture.away_rating_avg.toFixed(2)} tone="away" />
            </div>
          </div>
        </section>

        <MatchRatingBoard fixture={fixture} />
      </div>
    </main>
  );
}
