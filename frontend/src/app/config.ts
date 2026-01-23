'use client';

// Konfiguracja aplikacji
// Dla klienta preferujemy ścieżki względne (/api/...) w prod, a w dev rewrites kierują je na backend.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Inne stałe używane w wielu miejscach
export const MAX_COMMENT_LENGTH = 2000;
