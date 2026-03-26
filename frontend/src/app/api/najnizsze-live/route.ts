import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const apiBase = base.endsWith('/api') ? base : `${base}/api`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(`${apiBase}/najnizsze-live/`, { cache: 'no-store', signal: controller.signal });

    if (!res.ok) {
      return NextResponse.json({ items: [] }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ items: [] }, { status: 200 });
  } finally {
    clearTimeout(timeout);
  }
}
