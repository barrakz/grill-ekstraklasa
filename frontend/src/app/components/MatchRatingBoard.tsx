'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Button from '@/app/components/common/Button';
import { useAuth } from '@/app/hooks/useAuth';
import { deleteFixtureRating, submitFixtureRating } from '@/app/services/matches-service';
import { MatchFixtureDetail, MatchLineupPlayer } from '@/app/types/match';

type MatchRatingBoardProps = {
  fixture: MatchFixtureDetail;
};

type Side = 'home' | 'away';
type ViewMode = 'pitch' | 'list';
type LineupState = MatchFixtureDetail['lineup'];
type PositionedPlayer = MatchLineupPlayer & { x: number; y: number };
type SelectedPlayerState = {
  side: Side;
  player: MatchLineupPlayer;
};

type TeamCardData = {
  side: Side;
  name: string;
  players: MatchLineupPlayer[];
  starters: MatchLineupPlayer[];
  bench: MatchLineupPlayer[];
  rest: MatchLineupPlayer[];
  formation: string;
  positionedStarters: PositionedPlayer[];
  average: number;
};

const DEFAULT_RATING = 5;
const DEFAULT_FORMATION = '4-4-2';
const FORMATION_PRESETS: Record<string, number[]> = {
  '3-1-4-2': [3, 1, 4, 2],
  '3-4-1-2': [3, 4, 1, 2],
  '3-4-2-1': [3, 4, 2, 1],
  '3-4-3': [3, 4, 3],
  '3-5-2': [3, 5, 2],
  '4-1-2-1-2': [4, 1, 2, 1, 2],
  '4-1-4-1': [4, 1, 4, 1],
  '4-2-2-2': [4, 2, 2, 2],
  '4-2-3-1': [4, 2, 3, 1],
  '4-3-1-2': [4, 3, 1, 2],
  '4-3-3': [4, 3, 3],
  '4-4-1-1': [4, 4, 1, 1],
  '4-4-2': [4, 4, 2],
  '4-5-1': [4, 5, 1],
  '5-2-3': [5, 2, 3],
  '5-3-2': [5, 3, 2],
  '5-4-1': [5, 4, 1],
};

const sideTheme: Record<
  Side,
  {
    badge: string;
    surface: string;
    pitchRing: string;
    pitchGlow: string;
    sliderAccent: string;
    selection: string;
    localRating: string;
  }
> = {
  home: {
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    surface: 'border-emerald-200/70 bg-emerald-50/55',
    pitchRing: 'ring-emerald-300/45',
    pitchGlow: 'shadow-[0_0_0_1px_rgba(110,231,183,0.18)]',
    sliderAccent: '#059669',
    selection: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    localRating: 'bg-emerald-500 text-white',
  },
  away: {
    badge: 'border-sky-200 bg-sky-50 text-sky-800',
    surface: 'border-sky-200/70 bg-sky-50/55',
    pitchRing: 'ring-sky-300/45',
    pitchGlow: 'shadow-[0_0_0_1px_rgba(125,211,252,0.18)]',
    sliderAccent: '#0284c7',
    selection: 'border-sky-300 bg-sky-50 text-sky-900',
    localRating: 'bg-sky-500 text-white',
  },
};

const scoreClass = (value: number) => {
  if (value >= 7.5) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (value >= 5.5) return 'bg-sky-100 text-sky-700 border-sky-200';
  if (value >= 4) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-rose-100 text-rose-700 border-rose-200';
};

const buildSelectedKey = (side: Side, playerId: number) => `${side}:${playerId}`;

function getPlayerName(player: MatchLineupPlayer) {
  return player.player_name ?? player.raw_name;
}

function normalizePosition(value?: string | null) {
  return (value ?? '').trim().toUpperCase();
}

function isGoalkeeper(player: MatchLineupPlayer) {
  return ['GK', 'BR', 'BRAMKARZ', 'GOALKEEPER'].includes(normalizePosition(player.position));
}

function inferFormationFromPlayers(players: MatchLineupPlayer[]) {
  const starters = players.filter((player) => player.selection_status === 'starting_xi');
  if (!starters.length) return DEFAULT_FORMATION;

  const counts = {
    DF: 0,
    MF: 0,
    FW: 0,
  };
  let outfieldCount = 0;

  starters.forEach((player) => {
    const position = normalizePosition(player.position);
    if (['GK', 'BR', 'BRAMKARZ', 'GOALKEEPER'].includes(position)) {
      return;
    }

    if (['DF', 'DEF', 'OB', 'OBRONCA', 'DEFENDER'].includes(position)) {
      counts.DF += 1;
    } else if (['MF', 'MID', 'POM', 'POMOCNIK', 'MIDFIELDER'].includes(position)) {
      counts.MF += 1;
    } else if (['FW', 'FWD', 'ST', 'NAP', 'NAPASTNIK', 'FORWARD', 'STRIKER'].includes(position)) {
      counts.FW += 1;
    }

    outfieldCount += 1;
  });

  if (outfieldCount !== 10) return DEFAULT_FORMATION;

  const inferred = [counts.DF, counts.MF, counts.FW].filter((value) => value > 0).join('-');
  return FORMATION_PRESETS[inferred] ? inferred : DEFAULT_FORMATION;
}

function getFormationLabel(rawFormation: string | undefined, players: MatchLineupPlayer[]) {
  if (rawFormation) {
    const parts = rawFormation.match(/\d+/g)?.map((part) => Number(part)).filter(Boolean) ?? [];
    const normalized = parts.join('-');
    if (parts.length >= 2 && parts.reduce((sum, value) => sum + value, 0) === 10 && FORMATION_PRESETS[normalized]) {
      return normalized;
    }
  }

  return inferFormationFromPlayers(players);
}

function generateOutfieldPositions(formationRows: number[]) {
  if (!formationRows.length) return [];

  const rowCount = formationRows.length;

  return formationRows.flatMap((count, rowIndex) => {
    if (!count) return [];

    const y = rowCount === 1 ? 48 : 76 - rowIndex * (50 / (rowCount - 1));

    return Array.from({ length: count }, (_, index) => ({
      x: ((index + 1) * 100) / (count + 1),
      y,
    }));
  });
}

function positionPlayers(players: MatchLineupPlayer[], formationLabel: string) {
  const starters = players.filter((player) => player.selection_status === 'starting_xi');
  if (!starters.length) return [];

  const goalkeeper = starters.find(isGoalkeeper) ?? starters[0];
  const outfieldPlayers = starters.filter((player) => player.id !== goalkeeper.id);
  const formationRows = FORMATION_PRESETS[formationLabel] ?? FORMATION_PRESETS[DEFAULT_FORMATION];
  const outfieldPositions = generateOutfieldPositions(formationRows);

  return [
    { ...goalkeeper, x: 50, y: 89 },
    ...outfieldPlayers.map((player, index) => ({
      ...player,
      x: outfieldPositions[index]?.x ?? 50,
      y: outfieldPositions[index]?.y ?? 48,
    })),
  ];
}

function getDefaultSelectedPlayer(lineup: LineupState): SelectedPlayerState | null {
  const sideOrder: Side[] = ['home', 'away'];

  for (const side of sideOrder) {
    const players = lineup[side] ?? [];
    const starter = players.find((player) => player.selection_status === 'starting_xi');
    if (starter) {
      return { side, player: starter };
    }
    if (players[0]) {
      return { side, player: players[0] };
    }
  }

  return null;
}

function findSelectedPlayer(lineup: LineupState, selectedKey: string | null): SelectedPlayerState | null {
  if (!selectedKey) return null;

  const [side, rawPlayerId] = selectedKey.split(':');
  if ((side !== 'home' && side !== 'away') || !rawPlayerId) return null;

  const playerId = Number(rawPlayerId);
  const player = (lineup[side] ?? []).find((item) => item.id === playerId);
  return player ? { side, player } : null;
}

function PlayerAvatar({
  player,
  sizeClass,
  iconClass,
}: {
  player: MatchLineupPlayer;
  sizeClass: string;
  iconClass: string;
}) {
  if (player.photo_url) {
    return (
      <img
        src={player.photo_url}
        alt={getPlayerName(player)}
        className={`${sizeClass} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${sizeClass} flex items-center justify-center rounded-full bg-slate-50`}>
      <svg
        className={`${iconClass} text-slate-400`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0zm-9 9a9 9 0 1118 0H6z"
        />
      </svg>
      <span className="sr-only">Brak zdjęcia profilowego</span>
    </div>
  );
}

function PitchPlayerButton({
  player,
  side,
  selected,
  localRating,
  onSelect,
}: {
  player: PositionedPlayer;
  side: Side;
  selected: boolean;
  localRating?: number;
  onSelect: () => void;
}) {
  const theme = sideTheme[side];

  return (
    <div
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${player.x}%`, top: `${player.y}%` }}
    >
      <div className="flex flex-col items-center gap-1.5">
        <div className="relative">
          <button
            type="button"
            onClick={onSelect}
            className={`flex h-14 w-14 items-center justify-center rounded-full border border-white/45 bg-white/92 text-sm font-bold text-slate-700 shadow-[0_14px_30px_rgba(15,23,42,0.28)] transition-transform duration-200 hover:scale-105 ${selected ? `ring-4 ${theme.pitchRing}` : ''}`}
            style={{ pointerEvents: 'auto' }}
          >
            <PlayerAvatar player={player} sizeClass="h-full w-full" iconClass="h-6 w-6" />
          </button>

          {player.shirt_number ? (
            <div className="pointer-events-none absolute -left-2 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-950 px-1 text-[10px] font-bold text-white">
              {player.shirt_number}
            </div>
          ) : null}

          {typeof localRating === 'number' ? (
            <div className={`pointer-events-none absolute -right-2 top-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${theme.localRating}`}>
              {localRating}
            </div>
          ) : null}

          <div className={`pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${scoreClass(player.rating_avg ?? 0)}`}>
            {(player.rating_avg ?? 0).toFixed(1)}
          </div>
        </div>

        <div className="max-w-[86px] text-center text-[11px] font-medium text-white drop-shadow-[0_1px_2px_rgba(15,23,42,0.75)]">
          {getPlayerName(player)}
        </div>
      </div>
    </div>
  );
}

function ListPlayerRow({
  player,
  side,
  selected,
  localRating,
  onSelect,
}: {
  player: MatchLineupPlayer;
  side: Side;
  selected: boolean;
  localRating?: number;
  onSelect: () => void;
}) {
  const theme = sideTheme[side];

  return (
    <div
      className={`rounded-2xl border px-4 py-3 transition-colors ${selected ? theme.selection : 'border-slate-200 bg-white/90 text-slate-900 hover:border-slate-300'}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-bold text-slate-700">
            <PlayerAvatar player={player} sizeClass="h-full w-full" iconClass="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={onSelect} className="truncate text-left text-sm font-semibold text-slate-900 hover:text-slate-700 md:text-base">
                {getPlayerName(player)}
              </button>
              {player.captain ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
                  C
                </span>
              ) : null}
              {player.shirt_number ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                  #{player.shirt_number}
                </span>
              ) : null}
              {typeof localRating === 'number' ? (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${theme.localRating}`}>
                  Twoja {localRating}
                </span>
              ) : null}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {player.selection_status === 'bench' ? 'Ławka rezerwowych' : player.selection_status === 'starting_xi' ? 'Wyjściowa XI' : 'Dostępny do oceny'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${scoreClass(player.rating_avg ?? 0)}`}>
            <span>{(player.rating_avg ?? 0).toFixed(2)}</span>
            <span className="opacity-75">· {player.ratings_count ?? 0} głosów</span>
          </div>
          <button
            type="button"
            onClick={onSelect}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${selected ? theme.selection : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'}`}
          >
            {selected ? 'Wybrany' : 'Oceń'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SelectedRatingPanel({
  side,
  player,
  selectedRating,
  isSaving,
  onSliderChange,
  onSave,
  onClear,
}: {
  side: Side;
  player: MatchLineupPlayer;
  selectedRating: number;
  isSaving: boolean;
  onSliderChange: (value: number) => void;
  onSave: () => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${sideTheme[side].badge}`}>
            {side === 'home' ? 'Wybrany zawodnik gospodarzy' : 'Wybrany zawodnik gości'}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-base font-bold text-slate-700">
              <PlayerAvatar player={player} sizeClass="h-full w-full" iconClass="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xl font-semibold text-slate-900">{getPlayerName(player)}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className={`rounded-full border px-2.5 py-1 font-semibold ${scoreClass(player.rating_avg ?? 0)}`}>
                  Śr. {(player.rating_avg ?? 0).toFixed(2)} · {player.ratings_count ?? 0} głosów
                </span>
                {player.player_id ? (
                  <Link href={`/players/${player.player_id}`} className="font-semibold text-accent-color hover:underline">
                    Profil zawodnika
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-semibold text-slate-600">Twoja ocena</div>
          <div className="text-3xl font-bold text-slate-900">{selectedRating}</div>
        </div>
      </div>

      <input
        type="range"
        min="1"
        max="10"
        step="1"
        value={selectedRating}
        onChange={(event) => onSliderChange(Number(event.target.value))}
        className="mt-4 w-full"
        style={{ accentColor: sideTheme[side].sliderAccent }}
      />
      <div className="mt-2 flex justify-between text-xs font-semibold text-slate-400">
        <span>1</span>
        <span>5</span>
        <span>10</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant={selectedRating >= 7 ? 'success' : selectedRating >= 5 ? 'secondary' : 'danger'}
          size="small"
          className="!rounded-full !px-5"
          isLoading={isSaving}
          onClick={onSave}
        >
          Zapisz {selectedRating}/10
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="small"
          className="!rounded-full !px-5"
          disabled={isSaving}
          onClick={onClear}
        >
          Wyczyść
        </Button>
        <span className="text-sm text-slate-500">
          Głos zapisujemy dla tego meczu w tej przeglądarce. Możesz go później nadpisać.
        </span>
      </div>
    </div>
  );
}

export default function MatchRatingBoard({ fixture }: MatchRatingBoardProps) {
  const { user } = useAuth();
  const [lineup, setLineup] = useState<LineupState>(fixture.lineup);
  const [ratingsCount, setRatingsCount] = useState(fixture.ratings_count);
  const [homeAverage, setHomeAverage] = useState(fixture.home_rating_avg);
  const [awayAverage, setAwayAverage] = useState(fixture.away_rating_avg);
  const [mobileSide, setMobileSide] = useState<Side>('home');
  const [view, setView] = useState<ViewMode>('pitch');
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [activePlayerKey, setActivePlayerKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedPlayerKey, setSelectedPlayerKey] = useState<string | null>(() => {
    const defaultPlayer = getDefaultSelectedPlayer(fixture.lineup);
    return defaultPlayer ? buildSelectedKey(defaultPlayer.side, defaultPlayer.player.id) : null;
  });

  const lineupVisible = useMemo(
    () => (lineup.home?.length ?? 0) + (lineup.away?.length ?? 0) > 0,
    [lineup]
  );

  const selectedPlayer = useMemo(() => findSelectedPlayer(lineup, selectedPlayerKey), [lineup, selectedPlayerKey]);

  useEffect(() => {
    if (selectedPlayer) return;
    const defaultPlayer = getDefaultSelectedPlayer(lineup);
    setSelectedPlayerKey(defaultPlayer ? buildSelectedKey(defaultPlayer.side, defaultPlayer.player.id) : null);
  }, [lineup, selectedPlayer]);

  const teams = useMemo<TeamCardData[]>(() => {
    return (['home', 'away'] as const).map((side) => {
      const players = lineup[side] ?? [];
      const starters = players.filter((player) => player.selection_status === 'starting_xi');
      const bench = players.filter((player) => player.selection_status === 'bench');
      const rest = players.filter(
        (player) => player.selection_status !== 'starting_xi' && player.selection_status !== 'bench'
      );
      const formation = getFormationLabel(fixture.formation?.[side], starters);

      return {
        side,
        name: side === 'home' ? fixture.home_club_name : fixture.away_club_name,
        players,
        starters,
        bench,
        rest,
        formation,
        positionedStarters: positionPlayers(players, formation),
        average: side === 'home' ? homeAverage : awayAverage,
      };
    });
  }, [fixture.away_club_name, fixture.formation, fixture.home_club_name, homeAverage, awayAverage, lineup]);

  const selectedRating = selectedPlayer ? ratings[selectedPlayer.player.id] ?? DEFAULT_RATING : DEFAULT_RATING;

  const applyPlayerUpdate = (side: Side, updatedPlayer: MatchLineupPlayer) => {
    setLineup((current) => ({
      ...current,
      [side]: (current[side] ?? []).map((player) => (player.id === updatedPlayer.id ? updatedPlayer : player)),
    }));
  };

  const handleSelectPlayer = (side: Side, player: MatchLineupPlayer) => {
    setSelectedPlayerKey(buildSelectedKey(side, player.id));
    setMobileSide(side);
    setRatings((current) => (current[player.id] ? current : { ...current, [player.id]: DEFAULT_RATING }));
    setError(null);
    setSuccess(null);
  };

  const handleSliderChange = (value: number) => {
    if (!selectedPlayer) return;
    setRatings((current) => ({
      ...current,
      [selectedPlayer.player.id]: value,
    }));
  };

  const handleClearRating = async () => {
    if (!selectedPlayer) return;

    const { side, player } = selectedPlayer;
    const playerName = getPlayerName(player);

    setActivePlayerKey(buildSelectedKey(side, player.id));
    setError(null);
    setSuccess(null);

    try {
      const response = await deleteFixtureRating(fixture.slug, player.id, user?.token);
      if (response.player_summary) {
        applyPlayerUpdate(side, response.player_summary);
      }
      setRatings((current) => {
        const next = { ...current };
        delete next[player.id];
        return next;
      });
      setRatingsCount(response.fixture_ratings_count);
      setHomeAverage(response.home_rating_avg);
      setAwayAverage(response.away_rating_avg);
      setSuccess(
        response.deleted
          ? `Usunięto Twoją ocenę dla: ${playerName}.`
          : `Wyczyszczono lokalny wybór oceny dla: ${playerName}.`
      );
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Nie udało się usunąć oceny.');
    } finally {
      setActivePlayerKey(null);
    }
  };

  const handleSaveRating = async () => {
    if (!selectedPlayer) return;

    const { side, player } = selectedPlayer;
    const playerName = getPlayerName(player);
    const value = ratings[player.id] ?? DEFAULT_RATING;

    setActivePlayerKey(buildSelectedKey(side, player.id));
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
      setSuccess(`Zapisane: ${playerName} ${value}/10.`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Nie udało się zapisać oceny.');
    } finally {
      setActivePlayerKey(null);
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
      <div className="card overflow-hidden border border-slate-200 bg-white/92 p-0">
        <div className="p-5 md:p-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Murawa ocen</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Klikasz zawodnika na boisku albo liście, a suwak oceny pojawia się bezpośrednio pod wybraną drużyną.
                Układ na grafice bierze formację drużyny z API, a gdy jej brakuje, spada do sensownego fallbacku.
              </p>
              {fixture.status === 'lineup_predicted' ? (
                <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Skład jest przewidywany. Formacja i nazwiska mogą się jeszcze zmienić przed pierwszym gwizdkiem.
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

            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-2">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Widok</div>
              <button
                type="button"
                onClick={() => setView('pitch')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${view === 'pitch' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200/70'}`}
              >
                Murawa
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${view === 'list' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200/70'}`}
              >
                Lista
              </button>
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
            ) : null}
            {success ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>
            ) : null}

            {!selectedPlayer ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm text-slate-500">
                Wybierz zawodnika z boiska albo listy. Panel z suwakiem pojawi się od razu pod odpowiednią drużyną.
              </div>
            ) : null}
          </div>
        </div>
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
        {teams.map((team) => {
          const theme = sideTheme[team.side];
          const visibleOnMobile = team.side === mobileSide;
          const teamSelectedPlayer = selectedPlayer?.side === team.side ? selectedPlayer.player : null;

          return (
            <div key={team.side} className={`${visibleOnMobile ? 'block' : 'hidden'} md:block`}>
              <div className="card overflow-hidden border border-slate-200 bg-white/88 p-0">
                <div className="border-b border-slate-200/80 px-5 py-4 md:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${theme.badge}`}>
                        {team.side === 'home' ? 'Gospodarze' : 'Goście'}
                      </div>
                      <h3 className="mt-3 text-2xl font-semibold text-slate-900">{team.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {team.players.length} zawodników do oceny · formacja {team.formation}
                      </p>
                    </div>
                    <div className={`rounded-full border px-4 py-2 text-sm font-semibold ${theme.badge}`}>
                      Średnia {team.average.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="p-5 md:p-6">
                  {view === 'pitch' ? (
                    <div className="space-y-4">
                      <div className={`relative min-h-[420px] overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),transparent_38%),linear-gradient(180deg,#166534_0%,#166534_18%,#14532d_18%,#14532d_36%,#166534_36%,#166534_54%,#14532d_54%,#14532d_72%,#166534_72%,#166534_100%)] p-4 ${theme.pitchGlow}`}>
                        <div className="absolute inset-4 rounded-[1.7rem] border border-white/25" />
                        <div className="absolute left-1/2 top-4 bottom-4 w-px -translate-x-1/2 bg-white/20" />
                        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
                        <div className="absolute left-1/2 top-[7%] h-14 w-28 -translate-x-1/2 rounded-b-[1.5rem] border border-white/20 border-t-0" />
                        <div className="absolute left-1/2 bottom-[7%] h-14 w-28 -translate-x-1/2 rounded-t-[1.5rem] border border-white/20 border-b-0" />
                        <div className="absolute left-1/2 top-[3.5%] h-4 w-12 -translate-x-1/2 rounded-b-lg border border-white/15 border-t-0" />
                        <div className="absolute left-1/2 bottom-[3.5%] h-4 w-12 -translate-x-1/2 rounded-t-lg border border-white/15 border-b-0" />

                        {team.positionedStarters.map((player) => (
                          <PitchPlayerButton
                            key={player.id}
                            player={player}
                            side={team.side}
                            selected={selectedPlayerKey === buildSelectedKey(team.side, player.id)}
                            localRating={ratings[player.id]}
                            onSelect={() => handleSelectPlayer(team.side, player)}
                          />
                        ))}
                      </div>

                      {teamSelectedPlayer ? (
                      <SelectedRatingPanel
                        side={team.side}
                        player={teamSelectedPlayer}
                        selectedRating={selectedRating}
                        isSaving={activePlayerKey === buildSelectedKey(team.side, teamSelectedPlayer.id)}
                        onSliderChange={handleSliderChange}
                        onSave={handleSaveRating}
                        onClear={handleClearRating}
                      />
                    ) : null}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Ławka rezerwowych</div>
                          <div className="text-xs text-slate-400">Kliknij, żeby ocenić rezerwowego</div>
                        </div>
                        {team.bench.length ? (
                          <div className="flex flex-wrap gap-2">
                            {team.bench.map((player) => {
                              const selected = selectedPlayerKey === buildSelectedKey(team.side, player.id);
                              return (
                                <button
                                  key={player.id}
                                  type="button"
                                  onClick={() => handleSelectPlayer(team.side, player)}
                                  className={`rounded-2xl border px-3 py-2 text-left transition-colors ${selected ? theme.selection : `${theme.surface} text-slate-700 hover:border-slate-300`}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/90 text-xs font-bold text-slate-700">
                                      <PlayerAvatar player={player} sizeClass="h-full w-full" iconClass="h-4 w-4" />
                                    </span>
                                    <span className="min-w-0">
                                      <span className="block max-w-[150px] truncate text-sm font-semibold">{getPlayerName(player)}</span>
                                      <span className="mt-0.5 block text-[11px] text-slate-500">
                                        Śr. {(player.rating_avg ?? 0).toFixed(2)} · {player.ratings_count ?? 0} głosów
                                      </span>
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3 text-sm text-slate-500">
                            Brak publicznej ławki rezerwowych dla tej drużyny.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {team.starters.length ? (
                        <div className="space-y-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Wyjściowa XI</div>
                          {team.starters.map((player) => (
                            <ListPlayerRow
                              key={player.id}
                              player={player}
                              side={team.side}
                              selected={selectedPlayerKey === buildSelectedKey(team.side, player.id)}
                              localRating={ratings[player.id]}
                              onSelect={() => handleSelectPlayer(team.side, player)}
                            />
                          ))}
                        </div>
                      ) : null}

                      {team.bench.length ? (
                        <div className="space-y-3 pt-2">
                          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Ławka rezerwowych</div>
                          {team.bench.map((player) => (
                            <ListPlayerRow
                              key={player.id}
                              player={player}
                              side={team.side}
                              selected={selectedPlayerKey === buildSelectedKey(team.side, player.id)}
                              localRating={ratings[player.id]}
                              onSelect={() => handleSelectPlayer(team.side, player)}
                            />
                          ))}
                        </div>
                      ) : null}

                      {team.rest.length ? (
                        <div className="space-y-3 pt-2">
                          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Pozostali</div>
                          {team.rest.map((player) => (
                            <ListPlayerRow
                              key={player.id}
                              player={player}
                              side={team.side}
                              selected={selectedPlayerKey === buildSelectedKey(team.side, player.id)}
                              localRating={ratings[player.id]}
                              onSelect={() => handleSelectPlayer(team.side, player)}
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )}

                  {view === 'list' && teamSelectedPlayer ? (
                    <div className="mt-6 border-t border-slate-200/80 pt-6">
                      <SelectedRatingPanel
                        side={team.side}
                        player={teamSelectedPlayer}
                        selectedRating={selectedRating}
                        isSaving={activePlayerKey === buildSelectedKey(team.side, teamSelectedPlayer.id)}
                        onSliderChange={handleSliderChange}
                        onSave={handleSaveRating}
                        onClear={handleClearRating}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
