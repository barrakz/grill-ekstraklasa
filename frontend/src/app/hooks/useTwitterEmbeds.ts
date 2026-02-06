'use client';

import { useEffect } from 'react';

export function useTwitterEmbeds(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const existing = document.getElementById('twitter-wjs');
    if (!existing) {
      const script = document.createElement('script');
      script.id = 'twitter-wjs';
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      document.body.appendChild(script);
      return;
    }

    const twttr = (window as typeof window & { twttr?: { widgets?: { load: () => void } } }).twttr;
    if (twttr?.widgets) {
      twttr.widgets.load();
    }
  }, [enabled]);
}
