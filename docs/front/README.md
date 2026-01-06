# 🎨 Frontend - Next.js 15

Dokumentacja frontendu aplikacji Grill Ekstraklasa zbudowanego w Next.js 15 (App Router) z React 19, TypeScript i Tailwind CSS 4.

## 📚 Spis tresci
- [Struktura projektu](./structure.md)
- [Routing i nawigacja](./routing.md)
- [Komponenty i UI](./components.md)
- [Styling i design tokens](./styling.md)
- [Dane i integracja z API](./data-api.md)
- [Autentykacja](./auth.md)
- [SEO i metadata](./seo.md)
- [Build i deploy frontendu](./build-deploy.md)

## 🚀 Stack
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript 5.x**
- **Tailwind CSS 4**
- **Fonts**: Manrope (body), Space Grotesk (display)

## 📌 Kluczowe entrypointy
- `frontend/src/app/layout.tsx` - globalny layout, fonty i metadata
- `frontend/src/app/page.tsx` - strona glowna
- `frontend/src/app/globals.css` - tokeny, klasy globalne i animacje
- `frontend/src/app/config.ts` - konfiguracja API
- `frontend/next.config.ts` - trailing slash, rewrites w dev i remote images

## 🧪 Komendy
```bash
cd frontend
npm install
npm run dev
npm run build
npm start
```

## 🌐 Zmienne srodowiskowe
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Produkcja:
```env
NEXT_PUBLIC_API_URL=https://grillekstraklasa.pl/api
NEXT_PUBLIC_SITE_URL=https://grillekstraklasa.pl
```
