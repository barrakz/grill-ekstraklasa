'use client';

import { useCallback, useEffect, useState } from 'react';
import type { LiveLowestRatingsResponse } from '@/app/types/live';

const POLL_INTERVAL = 30000;
const FETCH_TIMEOUT_MS = 4000;

export function useLiveLowestRatings() {
  const [data, setData] = useState<LiveLowestRatingsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    try {
      setError(null);
      const res = await fetch('/api/najnizsze-live/', {
        cache: 'no-store',
        signal,
      });

      if (!res.ok) {
        throw new Error('Failed to fetch live ratings');
      }

      const payload = (await res.json()) as LiveLowestRatingsResponse;
      setData(payload);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError('Nie udało się pobrać live ocen');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runFetch = useCallback(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    return fetchData(controller.signal).finally(() => {
      clearTimeout(timeout);
    });
  }, [fetchData]);

  useEffect(() => {
    runFetch();

    const interval = setInterval(() => {
      runFetch();
    }, POLL_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [runFetch]);

  return { data, error, isLoading };
}
