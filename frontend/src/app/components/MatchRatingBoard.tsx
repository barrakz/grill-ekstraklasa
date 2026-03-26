'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Button from '@/app/components/common/Button';
import { useAuth } from '@/app/hooks/useAuth';
import { submitFixtureRating } from '@/app/services/matches-service';
import { MatchFixtureDetail, MatchLineupPlayer } from '@/app/types/match';
import {
  BoltIcon,
  CircleStackIcon,
  HandRaisedIcon,
  RectangleStackIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/24/solid';

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

const positionLabel: Record<string, string> = {
  GK: 'Bramkarze',
  DF: 'Obrońcy',
  MF: 'Pomocnicy',
  FW: 'Napastnicy',
};

const positionOrder = ['GK', 'DF', 'MF', 'FW'] as const;
type PositionGroupKey = (typeof positionOrder)[number] | 'OTHER';
const positionIcon = {
  GK: HandRaisedIcon,
  DF: ShieldCheckIcon,
  MF: CircleStackIcon,
  FW: BoltIcon,
  OTHER: UserIcon,
  BENCH: RectangleStackIcon,
} as const;

const positionIconColor: Record<string, string> = {
  GK: 'text-emerald-600',
  DF: 'text-sky-600',
  MF: 'text-amber-600',
  FW: 'text-rose-600',
  OTHER: 'text-slate-400',
  BENCH: 'text-slate-500',
};

const groupByPosition = (players: MatchLineupPlayer[]) => {
  const buckets: Record<string, MatchLineupPlayer[]> = {
    GK: [],
    DF: [],
    MF: [],
    FW: [],
    OTHER: [],
  };

  players.forEach((player) => {
    const position = player.position ?? 'OTHER';
    if (positionOrder.includes(position as (typeof positionOrder)[number])) {
      buckets[position].push(player);
    } else {
      buckets.OTHER.push(player);
    }
  });

  const ordered: Array<{ key: PositionGroupKey; label: string; players: MatchLineupPlayer[] }> = positionOrder.map((pos) => ({
    key: pos,
    label: positionLabel[pos] ?? pos,
    players: buckets[pos],
  }));

  if (buckets.OTHER.length) {
    ordered.push({
      key: 'OTHER',
      label: 'Pozostali',
      players: buckets.OTHER,
    });
  }

  return ordered;
};

const renderPlayerIcon = (player: MatchLineupPlayer) => {
  const iconKey = player.selection_status === 'bench'
    ? 'BENCH'
    : player.position && positionIcon[player.position as keyof typeof positionIcon]
      ? (player.position as keyof typeof positionIcon)
      : 'OTHER';
  const Icon = positionIcon[iconKey];
  return (
    <Icon
      className={`h-4 w-4 ${positionIconColor[iconKey] ?? 'text-slate-400'}`}
      aria-hidden="true"
    />
  );
};

export default function MatchRatingBoard({ fixture }: MatchRatingBoardProps) {
  const { user } = useAuth();
  const [lineup, setLineup] = useState<LineupState>(fixture.lineup);
  const [ratingsCount, setRatingsCount] = useState(fixture.ratings_count);
  const [homeAverage, setHomeAverage] = useState(fixture.home_rating_avg);
  const [awayAverage, setAwayAverage] = useState(fixture.away_rating_avg);
  const [mobileSide, setMobileSide] = useState<'home' | 'away'>('home');
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [mobileSelections, setMobileSelections] = useState<Record<string, number>>({});
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
      const playerLabel = player.player_name ?? player.raw_name;
      setSuccess(`Zapisane: ${playerLabel} ${value}/10.`);
      setMobileSelections((current) => ({
        ...current,
        [`${side}-${player.id}`]: value,
      }));
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Nie udało się zapisać oceny.');
    } finally {
      setActiveKey(null);
    }
  };

  if (!lineupVisible) {
    return (
      <div className="card">
        <h2 className="text-2xl font-semibold text-slate-900">Skład jeszcze niepubliczny</h2>
        <p className="mt-3 text-slate-600">
          Mecz jest już w systemie, ale oficjalne jedenastki jeszcze nie wylądowały na stronie.
          Wróć bliżej gwizdka albo po imporcie składu.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4 md:space-y-6">
      <div className="card bg-white/90">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Rozdaj noty w trakcie i po meczu</h2>
            <p className="mt-2 text-slate-600">
              Konto nie jest wymagane — zapamiętamy głos w tej przeglądarce. Zmienisz zdanie? Możesz poprawić ocenę tego samego zawodnika w tym meczu.
            </p>
            {fixture.status === 'lineup_predicted' ? (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                Skład jest przewidywany — możliwe zmiany przed pierwszym gwizdkiem. Oceny nadal wchodzą.
              </div>
            ) : null}
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Głosy kibiców</div>
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

      <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white/80 p-2 md:hidden">
        <button
          type="button"
          onClick={() => setMobileSide('home')}
          className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${mobileSide === 'home' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600'}`}
        >
          {fixture.home_club_name}
        </button>
        <button
          type="button"
          onClick={() => setMobileSide('away')}
          className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${mobileSide === 'away' ? 'bg-sky-100 text-sky-800' : 'text-slate-600'}`}
        >
          {fixture.away_club_name}
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {(['home', 'away'] as const).map((side) => {
          const teamName = side === 'home' ? fixture.home_club_name : fixture.away_club_name;
          const players = lineup[side] ?? [];
          const starters = players.filter((player) => player.selection_status === 'starting_xi');
          const bench = players.filter((player) => player.selection_status === 'bench');
          const rest = players.filter(
            (player) => player.selection_status !== 'starting_xi' && player.selection_status !== 'bench'
          );

          return (
            <div
              key={side}
              className={`card bg-white/88 ${side === mobileSide ? 'block' : 'hidden'} md:block`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900">{teamName}</h3>
                  <p className="text-sm text-slate-500">
                    {side === 'home' ? 'Gospodarze' : 'Goście'} · {players.length} nazwisk do ocen
                  </p>
                </div>
                <div className={`rounded-full border px-3 py-2 text-xs font-semibold md:px-4 md:text-sm ${side === 'home' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-sky-200 bg-sky-50 text-sky-700'}`}>
                  Średnia {side === 'home' ? homeAverage.toFixed(2) : awayAverage.toFixed(2)}
                </div>
              </div>

              <div className="mt-4 space-y-2 md:space-y-3">
                {groupByPosition(starters).map((group, index) => (
                  group.players.length ? (
                    <div
                      key={`starters-${group.key}`}
                      className={`space-y-2 ${index > 0 ? 'border-t border-slate-200/80 pt-3' : ''}`}
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        {group.label}
                      </div>
                      {group.players.map((player) => (
                        <div key={player.id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 md:p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {renderPlayerIcon(player)}
                          {player.player_id ? (
                            <Link
                              href={`/players/${player.player_id}`}
                              className="text-sm font-semibold text-slate-900 hover:text-slate-700 md:text-lg"
                            >
                              {player.player_name ?? player.raw_name}
                            </Link>
                          ) : (
                            <span className="text-sm font-semibold text-slate-900 md:text-lg">
                              {player.player_name ?? player.raw_name}
                            </span>
                          )}
                        </div>
                        <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold md:px-3 md:py-2 md:text-sm ${scoreClass(player.rating_avg ?? 0)}`}>
                          <span>{(player.rating_avg ?? 0).toFixed(2)}</span>
                          <span className="text-[11px] opacity-75">· {player.ratings_count ?? 0} głosów</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-3 md:hidden">
                      <label className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Twoja ocena</label>
                      <select
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-300 focus:outline-none"
                        value={mobileSelections[`${side}-${player.id}`] ?? ''}
                        disabled={Boolean(activeKey?.startsWith(`${side}-${player.id}-`))}
                        onChange={(event) => {
                          const selectedValue = Number(event.target.value);
                          if (!selectedValue) return;
                          handleRate(side, player, selectedValue);
                        }}
                      >
                        <option value="">Wybierz 1–10</option>
                        {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-4 hidden grid-cols-5 gap-2 md:grid md:grid-cols-10">
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
                  ) : null
                ))}

                {bench.length ? (
                  <div className="pt-3">
                    <div className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Ławka rezerwowych</div>
                  </div>
                ) : null}

                {groupByPosition(bench).map((group, index) => (
                  group.players.length ? (
                    <div
                      key={`bench-${group.key}`}
                      className={`space-y-2 ${index > 0 ? 'border-t border-slate-200/80 pt-3' : ''}`}
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        {group.label}
                      </div>
                      {group.players.map((player) => (
                        <div key={player.id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 md:p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {renderPlayerIcon(player)}
                          {player.player_id ? (
                            <Link
                              href={`/players/${player.player_id}`}
                              className="text-sm font-semibold text-slate-900 hover:text-slate-700 md:text-lg"
                            >
                              {player.player_name ?? player.raw_name}
                            </Link>
                          ) : (
                            <span className="text-sm font-semibold text-slate-900 md:text-lg">
                              {player.player_name ?? player.raw_name}
                            </span>
                          )}
                        </div>
                        <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold md:px-3 md:py-2 md:text-sm ${scoreClass(player.rating_avg ?? 0)}`}>
                          <span>{(player.rating_avg ?? 0).toFixed(2)}</span>
                          <span className="text-[11px] opacity-75">· {player.ratings_count ?? 0} głosów</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-3 md:hidden">
                      <label className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Twoja ocena</label>
                      <select
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-300 focus:outline-none"
                        value={mobileSelections[`${side}-${player.id}`] ?? ''}
                        disabled={Boolean(activeKey?.startsWith(`${side}-${player.id}-`))}
                        onChange={(event) => {
                          const selectedValue = Number(event.target.value);
                          if (!selectedValue) return;
                          handleRate(side, player, selectedValue);
                        }}
                      >
                        <option value="">Wybierz 1–10</option>
                        {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-4 hidden grid-cols-5 gap-2 md:grid md:grid-cols-10">
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
                  ) : null
                ))}

                {rest.map((player) => (
                  <div key={player.id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 md:p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {renderPlayerIcon(player)}
                          {player.player_id ? (
                            <Link
                              href={`/players/${player.player_id}`}
                              className="text-sm font-semibold text-slate-900 hover:text-slate-700 md:text-lg"
                            >
                              {player.player_name ?? player.raw_name}
                            </Link>
                          ) : (
                            <span className="text-sm font-semibold text-slate-900 md:text-lg">
                              {player.player_name ?? player.raw_name}
                            </span>
                          )}
                        </div>
                        <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold md:px-3 md:py-2 md:text-sm ${scoreClass(player.rating_avg ?? 0)}`}>
                          <span>{(player.rating_avg ?? 0).toFixed(2)}</span>
                          <span className="text-[11px] opacity-75">· {player.ratings_count ?? 0} głosów</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-3 md:hidden">
                      <label className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Twoja ocena</label>
                      <select
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-300 focus:outline-none"
                        value={mobileSelections[`${side}-${player.id}`] ?? ''}
                        disabled={Boolean(activeKey?.startsWith(`${side}-${player.id}-`))}
                        onChange={(event) => {
                          const selectedValue = Number(event.target.value);
                          if (!selectedValue) return;
                          handleRate(side, player, selectedValue);
                        }}
                      >
                        <option value="">Wybierz 1–10</option>
                        {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-4 hidden grid-cols-5 gap-2 md:grid md:grid-cols-10">
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
