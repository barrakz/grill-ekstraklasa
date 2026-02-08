import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const apiBase = base.endsWith('/api') ? base : `${base}/api`;

  const url = new URL(request.url);
  const limit = url.searchParams.get('limit');
  const qs = limit ? `?limit=${encodeURIComponent(limit)}` : '';

  const res = await fetch(`${apiBase}/latest-cards/${qs}`, {
    cache: 'no-store',
    headers: {
      accept: 'application/json',
    },
  });

  const status = res.status;
  const contentType = res.headers.get('content-type') || '';
  const raw = await res.text();

  // Always respond with JSON to the client; backend sometimes returns HTML error pages.
  try {
    const data = contentType.includes('application/json') ? JSON.parse(raw) : JSON.parse(raw);
    return NextResponse.json(data, { status: res.ok ? 200 : status });
  } catch {
    return NextResponse.json({ items: [] }, { status: res.ok ? 502 : status });
  }
}
