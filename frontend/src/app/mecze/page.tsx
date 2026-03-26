import type { Metadata } from 'next';
import Link from 'next/link';
import { getFixtures } from '@/app/services/matches-service';
import { MatchFixture } from '@/app/types/match';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mecze Ekstraklasy – centrum meczowe | Grill Ekstraklasa',
  description:
    'Przewidywane składy, oficjalne jedenastki i szybkie noty. Ekstraklasa mecz po meczu.',
  alternates: {
    canonical: 'https://grillekstraklasa.pl/mecze/',
  },
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
    dateStyle: 'medium',
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
    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-sm font-bold text-white shadow-sm md:h-12 md:w-12 md:text-lg`}>
      {initials}
    </div>
  );
}

function MatchListSection({
  title,
  description,
  fixtures,
}: {
  title: string;
  description: string;
  fixtures: MatchFixture[];
}) {
  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-2 text-slate-600">{description}</p>
        </div>
      </div>

      {fixtures.length === 0 ? (
        <div className="card">
          <p className="text-slate-500">Brak meczów w tej sekcji.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {fixtures.map((fixture) => (
            <Link
              key={fixture.id}
              href={`/mecze/${fixture.slug}`}
              className="card group block overflow-hidden border border-slate-200/80 bg-white/90 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)]"
            >
              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <div
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${statusTone[fixture.status] ?? 'border-slate-200 bg-slate-50 text-slate-500'}`}
                  >
                    {statusLabel[fixture.status] ?? fixture.status}
                  </div>
                  <span>{formatDateTime(fixture.kickoff_at)}</span>
                </div>

                <div className="grid items-center gap-3 md:gap-4 grid-cols-[1fr_auto_1fr]">
                  <div className="flex items-center gap-3 min-w-0">
                    <ClubBadge name={fixture.home_club_name} tone="home" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 md:text-sm md:tracking-[0.2em]">Gospodarze</p>
                      <h3 className="text-base font-semibold text-slate-900 md:text-xl truncate">{fixture.home_club_name}</h3>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900 md:text-4xl">
                      {fixture.result_home ?? '-'}
                      <span className="mx-2 text-slate-300">:</span>
                      {fixture.result_away ?? '-'}
                    </div>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-slate-400 md:text-xs">wynik</p>
                  </div>

                  <div className="flex items-center justify-end gap-3 min-w-0">
                    <div className="text-right min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 md:text-sm md:tracking-[0.2em]">Goście</p>
                      <h3 className="text-base font-semibold text-slate-900 md:text-xl truncate">{fixture.away_club_name}</h3>
                    </div>
                    <ClubBadge name={fixture.away_club_name} tone="away" />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <span>Sezon {fixture.season_name}</span>
                  {fixture.round_number ? <span>Kolejka {fixture.round_number}</span> : null}
                  {fixture.ratings_total ? <span>{fixture.ratings_total} ocen</span> : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default async function MatchesPage() {
  const [upcomingFixturesRaw, recentFixturesRaw] = await Promise.all([
    getFixtures('upcoming', 12),
    getFixtures('recent', 8),
  ]);
  const upcomingFixtures = Array.isArray(upcomingFixturesRaw) ? upcomingFixturesRaw : [];
  const recentFixtures = Array.isArray(recentFixturesRaw) ? recentFixturesRaw : [];

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="rounded-[2rem] border border-slate-200 bg-white/75 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur md:p-10">
          <div className="reveal">
            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-500">
              Tu jest twoje centrum meczowe.
            </span>
            <h1 className="mt-4 max-w-[11ch] text-4xl font-semibold text-slate-900 md:text-6xl">
              Ekstraklasa mecz po meczu — składy i noty w jednym miejscu.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-600">
              Przewidywane składy, oficjalne jedenastki i szybkie noty 1–10.
            </p>
          </div>
        </section>

        <MatchListSection
          title="Najbliższe mecze"
          description="Nadchodzące spotkania. Zapowiedź, skład i przygotowanie do grillowania."
          fixtures={upcomingFixtures}
        />

        <MatchListSection
          title="Ostatnie mecze"
          description="Ostatnio rozegrane mecze — sprawdź, co już odjechało w tej kolejce."
          fixtures={recentFixtures}
        />
      </div>
    </main>
  );
}
