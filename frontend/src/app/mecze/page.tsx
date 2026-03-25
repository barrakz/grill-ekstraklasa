import type { Metadata } from 'next';
import Link from 'next/link';
import { getFixtures } from '@/app/services/matches-service';
import { MatchFixture } from '@/app/types/match';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mecze Ekstraklasy – centrum meczowe | Grill Ekstraklasa',
  description:
    'Zapowiedzi, przewidywane składy, oficjalne jedenastki i szybkie noty. Ekstraklasa w pełnej okazałości — od startu po finiszu.',
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

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

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
              className="card block overflow-hidden bg-white/88"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {statusLabel[fixture.status] ?? fixture.status}
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold text-slate-900">
                    {fixture.home_club_name} <span className="text-slate-400">vs</span> {fixture.away_club_name}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                    <span>{formatDateTime(fixture.kickoff_at)}</span>
                    <span>Sezon {fixture.season_name}</span>
                    {fixture.round_number ? <span>Kolejka {fixture.round_number}</span> : null}
                  </div>
                </div>

                <div className="text-sm text-slate-500">
                  {fixture.status === 'lineup_predicted'
                    ? 'Przewidywany skład — możliwe zmiany.'
                    : fixture.status === 'published' || fixture.status === 'live' || fixture.status === 'finished'
                      ? 'Skład jest już na stronie.'
                      : 'Skład jeszcze nieopublikowany.'}
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
