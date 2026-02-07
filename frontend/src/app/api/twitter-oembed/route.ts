import { NextResponse } from 'next/server';

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

function isLikelyTweetUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    if (parsed.hostname !== 'twitter.com') return false;
    // Typical: /{user}/status/{id}
    return /\/status\/\d+/.test(parsed.pathname);
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url') || '';
  const tweetUrl = normalizeTweetUrl(rawUrl);

  if (!tweetUrl || !isLikelyTweetUrl(tweetUrl)) {
    return NextResponse.json({ error: 'Invalid tweet url' }, { status: 400 });
  }

  // Twitter's unauthenticated oEmbed endpoint. We omit the script because we load widgets.js ourselves.
  const oembedUrl = new URL('https://publish.twitter.com/oembed');
  oembedUrl.searchParams.set('url', tweetUrl);
  oembedUrl.searchParams.set('omit_script', '1');
  oembedUrl.searchParams.set('dnt', '1');
  oembedUrl.searchParams.set('maxwidth', '550');

  const res = await fetch(oembedUrl.toString(), {
    // Cache per tweet URL on the server, so the client gets something fast.
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'oEmbed fetch failed' }, { status: 502 });
  }

  const data = (await res.json()) as { html?: string };
  const html = (data && typeof data.html === 'string' ? data.html : '').trim();

  // Even if html is empty, return 200 so the client can fall back to a link.
  return NextResponse.json(
    { html },
    {
      headers: {
        // Let the browser cache as well.
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    }
  );
}

