# 🎨 Frontend - Next.js 15

Dokumentacja frontendu aplikacji Grill Ekstraklasa zbudowanego w Next.js 15 z React 19 i TypeScript.

## 📁 Struktura Projektu

```
frontend/
├── src/
│   └── app/                    # App Router (Next.js 15)
│       ├── components/         # Komponenty React
│       │   ├── ClientLayout.tsx
│       │   ├── ClubCard.tsx
│       │   ├── PlayerDetails.tsx
│       │   ├── RatingForm.tsx
│       │   ├── CommentForm.tsx
│       │   ├── LoginForm.tsx
│       │   ├── RegisterForm.tsx
│       │   ├── Pagination.tsx
│       │   ├── TopPlayersTable.tsx
│       │   ├── LatestComments.tsx
│       │   └── ...
│       ├── services/           # API clients
│       │   └── api.ts
│       ├── types/              # TypeScript types
│       │   ├── player.ts
│       │   └── comment.ts
│       ├── hooks/              # Custom hooks
│       │   ├── useAuth.ts
│       │   └── useLocalStorage.ts
│       ├── lib/                # Utilities
│       ├── players/            # Strona zawodników
│       │   ├── page.tsx
│       │   └── [id]/
│       │       └── page.tsx
│       ├── clubs/              # Strona klubów
│       │   └── [id]/
│       │       └── page.tsx
│       ├── about/              # Strona o aplikacji
│       ├── contact/            # Kontakt
│       ├── page.tsx            # Strona główna
│       ├── layout.tsx          # Root layout
│       ├── globals.css         # Style globalne
│       └── config.ts           # Konfiguracja
├── public/                     # Pliki statyczne
│   ├── grill_logo.png
│   └── favicon.png
├── package.json
├── next.config.ts
├── tsconfig.json
└── tailwind.config.ts
```

---

## 🚀 Technologie

| Technologia | Wersja | Zastosowanie |
|-------------|--------|--------------|
| Next.js | 15 | React framework, SSR |
| React | 19 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4 | Styling |
| ESLint | 9 | Linting |

---

## 🎯 App Router (Next.js 15)

Next.js 15 używa **App Router** zamiast Pages Router.

### Routing

```
/                    → app/page.tsx (strona główna)
/players             → app/players/page.tsx (lista zawodników)
/players/[id]        → app/players/[id]/page.tsx (szczegóły zawodnika)
/clubs/[id]          → app/clubs/[id]/page.tsx (szczegóły klubu)
/about               → app/about/page.tsx
/contact             → app/contact/page.tsx
```

### Server Components vs Client Components

**Server Components** (domyślnie):
- `app/page.tsx` - strona główna
- `app/players/page.tsx` - lista zawodników
- `app/players/[id]/page.tsx` - szczegóły zawodnika

**Client Components** (`'use client'`):
- `components/ClientLayout.tsx` - nawigacja, auth state
- `components/RatingForm.tsx` - interaktywny formularz
- `components/CommentForm.tsx` - interaktywny formularz
- `components/LoginForm.tsx` - formularz logowania

---

## 🧩 Kluczowe Komponenty

### 1. ClientLayout

**Plik**: `app/components/ClientLayout.tsx`

Główny layout z nawigacją i zarządzaniem stanem autentykacji.

```typescript
'use client';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  
  // Sprawdź token przy montowaniu
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('username');
    if (token && user) {
      setIsLoggedIn(true);
      setUsername(user);
    }
  }, []);
  
  // Nawigacja + children
}
```

**Funkcje**:
- Nawigacja (header)
- Zarządzanie stanem logowania
- Przycisk login/logout
- Wyświetlanie username

---

### 2. PlayerDetails

**Plik**: `app/components/PlayerDetails.tsx`

Wyświetla szczegóły zawodnika z możliwością oceny i komentowania.

```typescript
export default function PlayerDetails({ player }: { player: Player }) {
  return (
    <div>
      {/* Zdjęcie zawodnika */}
      <Image src={player.photo_url} alt={player.name} />
      
      {/* Informacje */}
      <h1>{player.name}</h1>
      <p>Klub: {player.club_name}</p>
      <p>Pozycja: {player.position}</p>
      <p>Średnia ocen: {player.average_rating}</p>
      
      {/* Formularz oceny */}
      <RatingForm playerId={player.id} />
      
      {/* Komentarze */}
      <CommentForm playerId={player.id} />
    </div>
  );
}
```

---

### 3. RatingForm

**Plik**: `app/components/RatingForm.tsx`

Formularz do wystawiania ocen (1-10).

```typescript
'use client';

export default function RatingForm({ playerId }: { playerId: number }) {
  const [rating, setRating] = useState<number | null>(null);
  
  const handleSubmit = async () => {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_URL}/api/players/${playerId}/rate/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value: rating }),
    });
    
    // Handle response
  };
  
  return (
    <div>
      {/* Przyciski 1-10 */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
        <button onClick={() => setRating(num)}>{num}</button>
      ))}
      <button onClick={handleSubmit}>Oceń</button>
    </div>
  );
}
```

---

### 4. CommentForm

**Plik**: `app/components/CommentForm.tsx`

Formularz do dodawania komentarzy.

```typescript
'use client';

export default function CommentForm({ playerId }: { playerId: number }) {
  const [content, setContent] = useState('');
  
  const handleSubmit = async () => {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_URL}/api/players/${playerId}/comment/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    
    // Handle response
  };
  
  return (
    <div>
      <textarea 
        value={content} 
        onChange={(e) => setContent(e.target.value)}
        placeholder="Dodaj komentarz..."
      />
      <button onClick={handleSubmit}>Wyślij</button>
    </div>
  );
}
```

---

## 🔐 Autentykacja

### useAuth Hook

**Plik**: `app/hooks/useAuth.ts`

```typescript
export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('username');
    if (token && user) {
      setIsLoggedIn(true);
      setUsername(user);
    }
  }, []);
  
  const login = (token: string, user: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('username', user);
    setIsLoggedIn(true);
    setUsername(user);
  };
  
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername(null);
  };
  
  return { isLoggedIn, username, login, logout };
}
```

### Login Flow

```
1. Użytkownik wypełnia formularz (LoginForm.tsx)
2. POST /api/auth/login/ z username i password
3. Otrzymuje token i user data
4. Zapisuje do localStorage
5. Aktualizuje stan w ClientLayout
6. Przekierowanie na stronę główną
```

---

## 🎨 Styling - Tailwind CSS 4

### Globalne Style

**Plik**: `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-dark: #0f0f0f;
  --bg-card: #1a1a1a;
  --text-light: #f5f5f5;
  --accent-orange: #ff6b35;
  --accent-amber: #fbbf24;
}

body {
  background-color: var(--bg-dark);
  color: var(--text-light);
}

.card {
  @apply bg-bg-card rounded-lg p-6 shadow-lg;
}

.accent-button {
  @apply bg-gradient-to-r from-orange-500 to-amber-500 
         text-white font-semibold px-6 py-3 rounded-lg 
         hover:scale-105 transition-transform;
}
```

### Utility Classes

```tsx
// Karty
<div className="card">...</div>

// Przyciski
<button className="accent-button">Oceń</button>

// Grid
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">...</div>

// Responsywność
<h1 className="text-2xl md:text-4xl lg:text-5xl">...</h1>
```

---

## 📡 Integracja z API

### API Service

**Plik**: `app/services/api.ts`

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchPlayers() {
  const res = await fetch(`${API_BASE_URL}/api/players/`);
  if (!res.ok) throw new Error('Failed to fetch players');
  return res.json();
}

export async function fetchPlayerById(id: number) {
  const res = await fetch(`${API_BASE_URL}/api/players/${id}/`);
  if (!res.ok) throw new Error('Failed to fetch player');
  return res.json();
}

export async function ratePlayer(playerId: number, value: number, token: string) {
  const res = await fetch(`${API_BASE_URL}/api/players/${playerId}/rate/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ value }),
  });
  return res.json();
}
```

---

## 📊 TypeScript Types

### Player Type

**Plik**: `app/types/player.ts`

```typescript
export interface Player {
  id: number;
  name: string;
  slug: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  club_name: string;
  club_id: number;
  nationality: string;
  date_of_birth: string | null;
  height: number | null;
  weight: number | null;
  photo_url: string | null;
  average_rating: number;
  total_ratings: number;
  user_rating: Rating | null;
  recent_comments: Comment[];
}

export interface Rating {
  id: number;
  value: number;
  created_at: string;
}
```

### Comment Type

**Plik**: `app/types/comment.ts`

```typescript
export interface Comment {
  id: number;
  player_id: number;
  player_name: string;
  user: {
    id: number;
    username: string;
  };
  content: string;
  likes_count: number;
  user_has_liked: boolean;
  created_at: string;
  updated_at: string;
}
```

---

## 🔄 Server-Side Rendering (SSR)

### Strona Główna

**Plik**: `app/page.tsx`

```typescript
export default async function HomePage() {
  // Fetch data server-side
  const [clubs, topPlayers, latestComments] = await Promise.all([
    getClubs(),
    getTopRatedPlayers(5),
    getLatestComments(5)
  ]);
  
  return (
    <main>
      <TopPlayersTable players={topPlayers} />
      <LatestComments comments={latestComments} />
      {/* ... */}
    </main>
  );
}
```

**Zalety SSR**:
- Szybsze pierwsze ładowanie
- Lepsze SEO
- Dane zawsze aktualne

---

## 📱 Responsywność

### Breakpoints Tailwind

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Przykład

```tsx
<div className="
  grid 
  grid-cols-1        /* Mobile: 1 kolumna */
  md:grid-cols-2     /* Tablet: 2 kolumny */
  lg:grid-cols-3     /* Desktop: 3 kolumny */
  gap-6
">
  {/* Karty klubów */}
</div>
```

---

## 🎯 SEO Optimization

### Metadata

**Plik**: `app/layout.tsx`

```typescript
export const metadata: Metadata = {
  title: 'Grill Ekstraklasa – Oceniaj i komentuj wszystkich piłkarzy Ekstraklasy',
  description: 'Portal kibiców Ekstraklasy...',
  keywords: 'Ekstraklasa, piłkarze, oceny, rankingi...',
  openGraph: {
    title: 'Grill Ekstraklasa',
    description: 'Portal kibiców Ekstraklasy',
    url: 'https://grillekstraklasa.pl',
    type: 'website',
  },
};
```

### Dynamic Metadata (Player Pages)

```typescript
export async function generateMetadata({ params }: { params: { id: string } }) {
  const player = await fetchPlayerById(params.id);
  
  return {
    title: `${player.name} - Grill Ekstraklasa`,
    description: `Oceń i komentuj ${player.name} z ${player.club_name}`,
  };
}
```

---

## 🛠️ Development

### Uruchomienie

```bash
cd frontend
npm install
npm run dev
```

Frontend dostępny pod: **http://localhost:3000**

### Build Produkcyjny

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

## 🌐 Environment Variables

**Plik**: `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Produkcja**:
```env
NEXT_PUBLIC_API_URL=https://grillekstraklasa.pl/api
NEXT_PUBLIC_SITE_URL=https://grillekstraklasa.pl
```

---

## 📦 Kluczowe Zależności

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0",
    "tailwindcss": "^4.0.0",
    "postcss": "^8.0.0"
  }
}
```

---

## 🔗 Powiązane Dokumenty

- [Architektura Projektu](./architecture.md)
- [Backend](./backend.md)
- [Referencja API](./api-reference.md)
- [Przewodnik Dewelopera](./development.md)

---

**Frontend gotowy! 🎨**
