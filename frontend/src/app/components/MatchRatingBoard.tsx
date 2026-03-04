'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Button from '@/app/components/common/Button';
import { useAuth } from '@/app/hooks/useAuth';
import { submitFixtureRating } from '@/app/services/matches-service';
import { MatchFixtureDetail, MatchLineupPlayer } from '@/app/types/match';

type MatchRatingBoardProps = {
  fixture: MatchFixtureDetail;
};

type LineupState = MatchFixtureDetail['lineup'];

const scoreClass = (value: number) => {
  if (value >= 7.5) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (value >= 5.5) return 'bg-sky-100 text-sky-700 border-sky-200';
  if (value >= 4) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-rose-100 text-rose-700 border-rose-200';
};

const selectionLabel: Record<string, string> = {
  starting_xi: 'Pierwszy skład',
  bench: 'Ławka',
  predicted: 'Przewidywany',
  played: 'Grał',
  unused: 'Nie wszedł',
  hidden: 'Ukryty',
};

export default function MatchRatingBoard({ fixture }: MatchRatingBoardProps) {
  const { user } = useAuth();
  const [lineup, setLineup] = useState<LineupState>(fixture.lineup);
  const [ratingsCount, setRatingsCount] = useState(fixture.ratings_count);
  const [homeAverage, setHomeAverage] = useState(fixture.home_rating_avg);
  const [awayAverage, setAwayAverage] = useState(fixture.away_rating_avg);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const lineupVisible = useMemo(
    () => (lineup.home?.length ?? 0) + (lineup.away?.length ?? 0) > 0,
    [lineup]
  );

  const applyPlayerUpdate = (side: 'home' | 'away', updatedPlayer: MatchLineupPlayer) => {
    setLineup((current) => ({
      ...current,
      [side]: (current[side] ?? []).map((player) =>
        player.id === updatedPlayer.id ? updatedPlayer : player
      ),
    }));
  };

  const handleRate = async (side: 'home' | 'away', player: MatchLineupPlayer, value: number) => {
    setActiveKey(`${side}-${player.id}-${value}`);
    setError(null);
    setSuccess(null);

    try {
      const response = await submitFixtureRating(fixture.slug, player.id, value, user?.token);
      if (response.player_summary) {
        applyPlayerUpdate(side, response.player_summary);
      }
      setRatingsCount(response.fixture_ratings_count);
      setHomeAverage(response.home_rating_avg);
      setAwayAverage(response.away_rating_avg);
      setSuccess(`Zapisano ocenę ${value}/10 dla ${player.player_name ?? player.raw_name}.`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Nie udało się zapisać oceny.');
    } finally {
      setActiveKey(null);
    }
  };

  if (!lineupVisible) {
    return (
      <div className="card">
        <h2 className="text-2xl font-semibold text-slate-900">Skład jeszcze nieopublikowany</h2>
        <p className="mt-3 text-slate-600">
          Ten mecz jest już założony w systemie, ale publiczny skład nie został jeszcze potwierdzony.
          Wróć bliżej pierwszego gwizdka albo po imporcie oficjalnych jedenastek.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="card bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Oceń meczowe występy</h2>
            <p className="mt-2 text-slate-600">
              Głos zapisuje się na konto albo lokalną sesję. Możesz poprawić ocenę dla tego samego zawodnika w tym meczu.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Głosy</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">{ratingsCount}</div>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-emerald-700">Dom</div>
              <div className="mt-1 text-2xl font-semibold text-emerald-800">{homeAverage.toFixed(2)}</div>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-sky-700">Wyjazd</div>
              <div className="mt-1 text-2xl font-semibold text-sky-800">{awayAverage.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : null}
        {success ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {(['home', 'away'] as const).map((side) => {
          const teamName = side === 'home' ? fixture.home_club_name : fixture.away_club_name;
          const players = lineup[side] ?? [];

          return (
            <div key={side} className="card bg-white/88">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900">{teamName}</h3>
                  <p className="text-sm text-slate-500">
                    {side === 'home' ? 'Gospodarze' : 'Goście'} · {players.length} publicznych wpisów
                  </p>
                </div>
                <div className={`rounded-full border px-4 py-2 text-sm font-semibold ${side === 'home' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-sky-200 bg-sky-50 text-sky-700'}`}>
                  Średnia {side === 'home' ? homeAverage.toFixed(2) : awayAverage.toFixed(2)}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {players.map((player) => (
                  <div key={player.id} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-lg font-semibold text-slate-900">
                            {player.player_name ?? player.raw_name}
                          </span>
                          {player.player_id ? (
                            <Link
                              href={`/players/${player.player_id}`}
                              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900"
                            >
                              Profil
                            </Link>
                          ) : null}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                          {player.shirt_number ? <span>#{player.shirt_number}</span> : null}
                          <span>{selectionLabel[player.selection_status] ?? player.selection_status}</span>
                          {player.position ? <span>{player.position}</span> : null}
                          {player.captain ? <span>Kapitan</span> : null}
                        </div>
                      </div>

                      <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold ${scoreClass(player.rating_avg ?? 0)}`}>
                        <span>{(player.rating_avg ?? 0).toFixed(2)}</span>
                        <span className="text-xs opacity-75">· {player.ratings_count ?? 0} głosów</span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-5 gap-2 md:grid-cols-10">
                      {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => {
                        const active = activeKey === `${side}-${player.id}-${value}`;
                        return (
                          <Button
                            key={value}
                            type="button"
                            variant={value >= 7 ? 'success' : value >= 5 ? 'secondary' : 'danger'}
                            size="tiny"
                            className="!w-full !rounded-xl !px-0 text-center"
                            isLoading={active}
                            onClick={() => handleRate(side, player, value)}
                          >
                            {value}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
