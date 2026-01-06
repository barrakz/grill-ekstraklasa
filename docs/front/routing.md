# 🧭 Routing i nawigacja

Frontend korzysta z **App Router** w Next.js 15, a wszystkie sciezki maja trailing slash (`trailingSlash: true`).

## 🔗 Główne trasy
- `/` - strona glowna (hero + top players + ostatnie komentarze + kluby)
- `/players/` - lista pilkarzy, z opcjonalnym parametrem `?club=<id>`
- `/players/[slug]/` - profil pilkarza (slug lub ID obslugiwane przez backend)
- `/clubs/` - lista klubow z przekierowaniem do `/players/?club=<id>`
- `/about/` - strona informacyjna
- `/contact/` - kontakt

## 🔁 Trasy aplikacyjne (App Router)
- `/api/redirect/` - pomocnicze przekierowania
- `/api/revalidate/` - endpoint do rewalidacji

## 🧪 Rewrites w dev
W `frontend/next.config.ts` ustawione sa rewrites dla srodowiska deweloperskiego:
- `/api/*` -> `http://localhost:8000/api/*`

Dzieki temu lokalnie mozna korzystac z tych samych sciezek co na produkcji, bez dopisywania pelnego URL w kodzie.
