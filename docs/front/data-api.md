# 📡 Dane i integracja z API

## 🌐 API_BASE_URL
Wspolny adres API pochodzi z `frontend/src/app/config.ts`:
- `API_BASE_URL = NEXT_PUBLIC_API_URL || http://localhost:8000`

W srodowisku produkcyjnym API jest wystawione pod `/api/` i obslugiwane przez Nginx.

## 🔁 Rewrites w dev
`frontend/next.config.ts` przekierowuje `/api/*` do `http://localhost:8000/api/*`, co pozwala uzywac tych samych sciezek w dev i prod.

## 🧵 Wzorce fetch
- `cache: 'no-store'` na listach i widokach dynamicznych (np. `/players/`, `/clubs/`)
- `next: { revalidate: 3600 }` dla metadata w profilu pilkarza

## ✅ Najczesciej uzywane endpointy
- `GET /api/clubs/`
- `GET /api/players/`
- `GET /api/players/:slug/`
- `POST /api/players/:slug/rate/`
- `POST /api/players/:slug/comment/`
- `GET /api/players/top_rated/`
- `GET /api/comments/latest/`

## 🖼️ Obrazy
W `next.config.ts` dopuszczone sa zdalne obrazy z S3:
- `https://ekstraklasa-backend.s3.amazonaws.com/**`
