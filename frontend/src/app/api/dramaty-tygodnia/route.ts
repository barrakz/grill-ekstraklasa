import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const apiBase = base.endsWith('/api') ? base : `${base}/api`;
  const res = await fetch(`${apiBase}/dramaty-tygodnia/`, { cache: 'no-store' });

  if (!res.ok) {
    return NextResponse.json({ items: [] }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
