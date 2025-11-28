import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Rewalidacja ścieżek po dodaniu oceny
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
  try {
    // Rewaliduj stronę główną
    revalidatePath('/');

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      message: 'Rewalidacja zakończona pomyślnie'
    });
  } catch {
    return NextResponse.json({
      revalidated: false,
      now: Date.now(),
      message: 'Rewalidacja nie powiodła się'
    }, { status: 500 });
  }
}
