'use client';

import { useEffect, useState } from 'react';

type TwitterWindow = typeof window & {
  twttr?: {
    widgets?: {
      load: () => void;
    };
    ready?: (callback: () => void) => void;
  };
};

export function useTwitterEmbeds(enabled: boolean) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setReady(false);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const markReady = () => {
      if (cancelled) return;
      setReady(true);
    };

    const win = window as TwitterWindow;
    const existing = document.getElementById('twitter-wjs');

    const scheduleFallback = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(markReady, 2500);
    };

    if (!existing) {
      const script = document.createElement('script');
      script.id = 'twitter-wjs';
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.onload = () => {
        win.twttr?.widgets?.load();
        win.twttr?.ready?.(markReady);
        scheduleFallback();
      };
      document.body.appendChild(script);
      scheduleFallback();
    } else {
      win.twttr?.widgets?.load();
      win.twttr?.ready?.(markReady);
      scheduleFallback();
    }

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [enabled]);

  return ready;
}
