'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type TwitterWindow = typeof window & {
  twttr?: {
    widgets?: {
      load: (el?: HTMLElement) => void;
    };
    ready?: (callback: () => void) => void;
  };
};

let twitterScriptPromise: Promise<void> | null = null;

function ensureTwitterWidgetsScript() {
  if (typeof window === 'undefined') return Promise.resolve();
  const win = window as TwitterWindow;

  if (win.twttr?.widgets?.load) return Promise.resolve();
  if (twitterScriptPromise) return twitterScriptPromise;

  twitterScriptPromise = new Promise<void>(resolve => {
    const existing = document.getElementById('twitter-wjs') as HTMLScriptElement | null;
    const script =
      existing ||
      (() => {
        const s = document.createElement('script');
        s.id = 'twitter-wjs';
        s.src = 'https://platform.twitter.com/widgets.js';
        s.async = true;
        document.body.appendChild(s);
        return s;
      })();

    const finish = () => resolve();

    // If it loads quickly we resolve when twttr is ready; otherwise resolve anyway so UI doesn't hang.
    const timeout = window.setTimeout(finish, 3000);

    script.addEventListener(
      'load',
      () => {
        window.clearTimeout(timeout);
        win.twttr?.ready?.(finish);
        // If ready() is missing, resolve immediately.
        if (!win.twttr?.ready) finish();
      },
      { once: true }
    );

    // If script was already loaded earlier, the load event may never fire.
    // Poll briefly for window.twttr.
    const start = Date.now();
    const poll = window.setInterval(() => {
      if (win.twttr?.widgets?.load) {
        window.clearInterval(poll);
        window.clearTimeout(timeout);
        finish();
      } else if (Date.now() - start > 3000) {
        window.clearInterval(poll);
      }
    }, 50);
  });

  return twitterScriptPromise;
}

function normalizeTweetUrl(rawUrl: string) {
  return rawUrl
    .trim()
    .replace(/^https?:\/\/(www\.)?x\.com\//, 'https://twitter.com/')
    .replace(/^https?:\/\/(www\.)?twitter\.com\//, 'https://twitter.com/')
    .replace(/^x\.com\//, 'https://twitter.com/')
    .replace(/^www\.x\.com\//, 'https://twitter.com/')
    .replace(/^twitter\.com\//, 'https://twitter.com/')
    .replace(/^www\.twitter\.com\//, 'https://twitter.com/');
}

const oembedCache = new Map<string, string>();

export function TweetEmbed({
  url,
  className,
  lazy = true,
  maxHeightClassName,
}: {
  url: string;
  className?: string;
  maxHeightClassName?: string;
  lazy?: boolean;
}) {
  const tweetUrl = useMemo(() => normalizeTweetUrl(url), [url]);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(!lazy);
  const [html, setHtml] = useState<string>(() => oembedCache.get(tweetUrl) || '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(() => (html ? 'ready' : 'idle'));

  useEffect(() => {
    if (!lazy) return;
    const el = hostRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShouldLoad(true);
            obs.disconnect();
            break;
          }
        }
      },
      { rootMargin: '250px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [lazy]);

  useEffect(() => {
    let cancelled = false;
    const el = hostRef.current;
    if (!shouldLoad || !tweetUrl || !el) return;

    const load = async () => {
      try {
        setStatus(prev => (prev === 'ready' ? prev : 'loading'));

        // 1) Fetch oEmbed HTML (fast + cached) so the user never sees an empty box.
        if (!oembedCache.has(tweetUrl)) {
          const res = await fetch(`/api/twitter-oembed?url=${encodeURIComponent(tweetUrl)}`);
          const data = (await res.json()) as { html?: string };
          const nextHtml = (data?.html || '').trim();
          oembedCache.set(tweetUrl, nextHtml);
        }

        if (cancelled) return;
        const cached = oembedCache.get(tweetUrl) || '';
        setHtml(cached);
        setStatus(cached ? 'ready' : 'error');

        // 2) Enhance with widgets.js (optional; may take seconds, but the fallback content is already visible).
        await ensureTwitterWidgetsScript();
        if (cancelled) return;
        const win = window as TwitterWindow;
        win.twttr?.widgets?.load(el);
      } catch {
        if (cancelled) return;
        setStatus('error');
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [shouldLoad, tweetUrl]);

  return (
    <div
      ref={hostRef}
      className={[
        'tweet-embed relative overflow-hidden rounded-xl border border-slate-200 bg-white p-2',
        maxHeightClassName || '',
        className || '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {status !== 'ready' && (
        <div className="tweet-loading">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold text-slate-500">
              {status === 'error' ? 'Nie udało się wczytać tweeta' : 'Ładowanie tweeta...'}
            </div>
            <a
              href={tweetUrl}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700"
              target="_blank"
              rel="noreferrer"
            >
              Otwórz w nowej karcie
            </a>
          </div>
          <div className="tweet-skeleton long"></div>
          <div className="tweet-skeleton medium"></div>
          <div className="tweet-skeleton short"></div>
        </div>
      )}

      {html ? (
        <div
          // This is Twitter's own HTML.
          // It shows readable fallback immediately; widgets.js will replace it with an iframe later.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        // Minimal no-HTML fallback (still better than a blank box).
        <blockquote className="twitter-tweet">
          <a href={tweetUrl}></a>
        </blockquote>
      )}
    </div>
  );
}

