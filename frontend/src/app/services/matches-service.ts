import { API_BASE_URL } from '@/app/config';
import { MatchFixture, MatchFixtureDetail, MatchRatingResponse } from '@/app/types/match';

function normalizeBaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, '');
  if (trimmed.endsWith('/api')) {
    return trimmed.slice(0, -4);
  }
  return trimmed;
}

function getApiBaseUrl() {
  if (typeof API_BASE_URL === 'string' && API_BASE_URL) {
    return normalizeBaseUrl(API_BASE_URL);
  }

  if (typeof window !== 'undefined') {
    return '';
  }

  return 'http://localhost:8000';
}

function normalizeFixturesPayload(payload: unknown): MatchFixture[] {
  if (Array.isArray(payload)) {
    return payload as MatchFixture[];
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'results' in payload &&
    Array.isArray((payload as { results?: unknown }).results)
  ) {
    return (payload as { results: MatchFixture[] }).results;
  }

  return [];
}

export async function getFixtures(scope: 'upcoming' | 'recent' | 'all' = 'upcoming', limit = 12): Promise<MatchFixture[]> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/matches/fixtures/?scope=${scope}&limit=${limit}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return [];
    }

    const payload = await res.json();
    return normalizeFixturesPayload(payload);
  } catch {
    return [];
  }
}

export async function getFixture(slug: string): Promise<MatchFixtureDetail | null> {
  const res = await fetch(`${getApiBaseUrl()}/api/matches/fixtures/${slug}/`, {
    cache: 'no-store',
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error('Nie udało się pobrać meczu.');
  }

  return res.json();
}

export async function submitFixtureRating(
  slug: string,
  fixturePlayerId: number,
  value: number,
  token?: string
): Promise<MatchRatingResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/matches/fixtures/${slug}/ratings/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify({
      fixture_player_id: fixturePlayerId,
      value,
    }),
  });

  if (!res.ok) {
    let message = 'Nie udało się zapisać oceny. Spróbuj za chwilę.';
    try {
      const errorPayload = await res.json();
      if (errorPayload?.detail) {
        message = errorPayload.detail;
      }
    } catch {
      // Ignore invalid JSON.
    }
    throw new Error(message);
  }

  return res.json();
}

export async function deleteFixtureRating(
  slug: string,
  fixturePlayerId: number,
  token?: string
): Promise<MatchRatingResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/matches/fixtures/${slug}/ratings/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify({
      fixture_player_id: fixturePlayerId,
    }),
  });

  if (!res.ok) {
    let message = 'Nie udało się usunąć oceny. Spróbuj za chwilę.';
    try {
      const errorPayload = await res.json();
      if (errorPayload?.detail) {
        message = errorPayload.detail;
      }
    } catch {
      // Ignore invalid JSON.
    }
    throw new Error(message);
  }

  return res.json();
}
