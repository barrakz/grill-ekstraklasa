# 🧠 SEO i metadata

## Metadata globalne
`frontend/src/app/layout.tsx` definiuje metadata dla calej strony, w tym:
- title i description
- openGraph
- twitter cards
- canonical

## Profil pilkarza
`frontend/src/app/players/[slug]/page.tsx`:
- `generateMetadata()` pobiera dane pilkarza z API
- canonical: `https://grillekstraklasa.pl/players/<slug>/`
- fallback metadata, gdy API jest niedostepne

## Trailing slash
`next.config.ts` ma `trailingSlash: true`, dlatego linki i canonicale powinny konczyc sie `/`.
