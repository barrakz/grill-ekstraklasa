'use client';

import { useCallback, useEffect, useState } from 'react';
import type { LiveLowestRatingsResponse } from '@/app/types/live';

const POLL_INTERVAL = 30000;

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

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);

    const interval = setInterval(() => {
      const pollController = new AbortController();
      fetchData(pollController.signal);
    }, POLL_INTERVAL);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [fetchData]);

  return { data, error, isLoading };
}
