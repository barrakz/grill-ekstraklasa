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
  const embedRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(!lazy);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(() =>
    oembedCache.get(tweetUrl) ? 'ready' : 'idle'
  );

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
    const wrapperEl = hostRef.current;
    const embedEl = embedRef.current;
    if (!shouldLoad || !tweetUrl || !wrapperEl || !embedEl) return;

    // Important: Twitter's widgets.js mutates DOM. If React also controls the same subtree,
    // Safari can throw "NotFoundError: The object can not be found here." during reconciliation.
    // To avoid this, we keep the actual embed markup inside embedEl, and React never renders
    // children inside embedEl (we only set innerHTML imperatively).
    const renderBlockquote = () => {
      try {
        embedEl.innerHTML = '';
        const blockquote = document.createElement('blockquote');
        blockquote.className = 'twitter-tweet';
        const a = document.createElement('a');
        a.href = tweetUrl;
        blockquote.appendChild(a);
        embedEl.appendChild(blockquote);
      } catch {
        // Ignore; we'll still show the "open in new tab" link in the UI.
      }
    };

    const load = async () => {
      setStatus(prev => (prev === 'ready' ? prev : 'loading'));

      // Production note:
      // On grillekstraklasa.pl, nginx proxies /api/* to Django, so this route must NOT live under /api.
      // We fetch /twitter-oembed/ (with trailing slash to avoid 308 redirects because trailingSlash=true).
      let oembedOk = false;
      try {
        if (!oembedCache.has(tweetUrl)) {
          const res = await fetch(`/twitter-oembed/?url=${encodeURIComponent(tweetUrl)}`);
          if (res.ok) {
            const data = (await res.json()) as { html?: string };
            const nextHtml = (data?.html || '').trim();
            oembedCache.set(tweetUrl, nextHtml);
            oembedOk = true;
          } else {
            oembedCache.set(tweetUrl, '');
          }
        } else {
          oembedOk = true;
        }
      } catch {
        // Ignore; we'll still try widgets.js.
      }

      if (cancelled) return;
      const cached = oembedCache.get(tweetUrl) || '';
      if (cached) {
        try {
          embedEl.innerHTML = cached;
        } catch {
          renderBlockquote();
        }
        // We have readable HTML immediately; hide skeleton.
        setStatus('ready');
      } else {
        // Keep loading state while we attempt to enhance via widgets.js.
        renderBlockquote();
        setStatus('loading');
      }

      try {
        await ensureTwitterWidgetsScript();
        if (cancelled) return;
        const win = window as TwitterWindow;
        win.twttr?.widgets?.load(embedEl);

        // Wait briefly for the iframe to appear. If it doesn't, show a graceful error (link only).
        const started = Date.now();
        const interval = window.setInterval(() => {
          if (cancelled) {
            window.clearInterval(interval);
            return;
          }
          const hasIframe = !!embedEl.querySelector('iframe');
          if (hasIframe) {
            window.clearInterval(interval);
            setStatus('ready');
            return;
          }
          if (Date.now() - started > 4500) {
            window.clearInterval(interval);
            // If oEmbed gave us HTML, keep it visible; otherwise show error UI (still with link).
            setStatus(oembedOk ? 'ready' : 'error');
          }
        }, 100);
      } catch {
        if (cancelled) return;
        setStatus(oembedOk ? 'ready' : 'error');
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
      {status !== 'ready' && status !== 'error' && (
        <div className="tweet-loading">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold text-slate-500">
              Ładowanie tweeta...
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

      {status === 'error' && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="text-sm font-semibold text-slate-700">Tweet niedostępny</div>
          <div className="mt-1 text-xs text-slate-500">
            Jeśli masz adblocka lub X blokuje embedy, otwórz link w nowej karcie.
          </div>
          <a
            href={tweetUrl}
            className="mt-2 inline-flex text-xs font-semibold text-sky-600 hover:text-sky-700"
            target="_blank"
            rel="noreferrer"
          >
            Otwórz tweeta
          </a>
        </div>
      )}

      <div ref={embedRef} className={status === 'error' ? 'hidden' : ''} />
    </div>
  );
}
