# 🧪 Lokalne Testowanie Buildu Produkcyjnego

## 📖 Wprowadzenie

Ten dokument opisuje jak **lokalnie przetestować build produkcyjny** aplikacji frontendowej przed wysłaniem zmian na serwer. Pozwala to wykryć błędy TypeScript, ESLint i problemy z buildem **zanim** trafią na produkcję.

---

## ❓ Dlaczego to jest ważne?

### Problem

Podczas deploymentu na serwer produkcyjny wykonywane są następujące kroki:

```bash
cd /home/ec2-user/grill-ekstraklasa/frontend
npm install
rm -rf .next
npm run build
sudo systemctl restart grill-frontend
```

Jeśli `npm run build` failuje z powodu błędów TypeScript lub innych problemów, **deployment się nie powiedzie** i aplikacja może przestać działać.

### Rozwiązanie

Testowanie buildu lokalnie pozwala:
- ✅ Wykryć błędy **przed** pushem na serwer
- ✅ Zaoszczędzić czas (nie trzeba czekać na failed deployment)
- ✅ Uniknąć downtime aplikacji
- ✅ Mieć pewność, że kod jest gotowy do produkcji

---

## 🚀 Jak Uruchomić Test Buildu

### Metoda 1: Skrypt test-build.sh (Zalecana)

Najprostszy sposób - uruchom skrypt, który symuluje cały proces deploymentu:

```bash
cd frontend
npm run test-build
```

lub bezpośrednio:

```bash
cd frontend
./test-build.sh
```

### Metoda 2: Krok po kroku (Manualna)

Jeśli chcesz uruchomić poszczególne kroki osobno:

```bash
cd frontend

# 1. Linting
npm run lint

# 2. Type checking
npm run type-check
# lub: npx tsc --noEmit

# 3. Czyszczenie cache
rm -rf .next

# 4. Production build
npm run build
```

### ⚠️ Ważna uwaga dla pracujących z `npm run dev`

Jeśli masz uruchomiony serwer deweloperski (`npm run dev`), wykonanie testu buildu (który usuwa folder `.next`) spowoduje błędy w działającej aplikacji.

**Zalecana procedura:**

1. Zatrzymaj serwer deweloperski (Ctrl+C).
2. Uruchom test buildu: `npm run test-build`.
3. Po zakończeniu testów, uruchom ponownie serwer: `npm run dev`.

---

## 📋 Co Sprawdza Test?

Skrypt `test-build.sh` wykonuje **4 kroki** w dokładnie tej samej kolejności co na serwerze:

### Krok 1: ESLint - Sprawdzanie Jakości Kodu

```bash
npm run lint
```

**Co sprawdza:**
- Błędy składni JavaScript/TypeScript
- Nieużywane zmienne i importy
- Problemy z formatowaniem
- Naruszenia reguł ESLint

**Przykładowe błędy:**
```
Error: 'useState' is defined but never used  @typescript-eslint/no-unused-vars
Error: Missing return type on function  @typescript-eslint/explicit-function-return-type
```

### Krok 2: TypeScript - Sprawdzanie Typów

```bash
npx tsc --noEmit
```

**Co sprawdza:**
- Błędy typów TypeScript
- Niezgodności typów
- Brakujące właściwości
- Nieprawidłowe użycie API

**Przykładowe błędy:**
```
error TS2339: Property 'name' does not exist on type 'Player'.
error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
```

### Krok 3: Czyszczenie Cache

```bash
rm -rf .next
```

**Co robi:**
- Usuwa poprzedni build
- Zapewnia czysty build od zera
- Dokładnie jak na serwerze produkcyjnym

### Krok 4: Production Build

```bash
npm run build
```

**Co robi:**
- Kompiluje aplikację Next.js
- Optymalizuje kod dla produkcji
- Generuje statyczne pliki
- Sprawdza czy wszystko się kompiluje

---

## 🐛 Troubleshooting - Typowe Błędy

### 1. Błędy TypeScript

#### Problem: "Property does not exist on type"

```
error TS2339: Property 'summary' does not exist on type 'Player'.
```

**Rozwiązanie:**
Sprawdź definicję typu w `src/app/types/`:

```typescript
// src/app/types/player.ts
export interface Player {
  id: number;
  name: string;
  summary?: string; // Dodaj brakującą właściwość
  // ...
}
```

#### Problem: "Type 'X' is not assignable to type 'Y'"

```
error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
```

**Rozwiązanie:**
Sprawdź typy i dodaj konwersję jeśli potrzebna:

```typescript
// Źle
const id = "123";
fetchPlayer(id);

// Dobrze
const id = "123";
fetchPlayer(parseInt(id));
```

### 2. Błędy ESLint

#### Problem: "is defined but never used"

```
Error: 'useState' is defined but never used  @typescript-eslint/no-unused-vars
```

**Rozwiązanie:**
Usuń nieużywany import:

```typescript
// Źle
import { useState, useEffect } from 'react';

export default function Component() {
  useEffect(() => {}, []); // useState nie jest używany
}

// Dobrze
import { useEffect } from 'react';

export default function Component() {
  useEffect(() => {}, []);
}
```

#### Problem: "Missing return type"

```
Error: Missing return type on function  @typescript-eslint/explicit-function-return-type
```

**Rozwiązanie:**
Dodaj typ zwracany:

```typescript
// Źle
async function fetchPlayers() {
  return await fetch('/api/players');
}

// Dobrze
async function fetchPlayers(): Promise<Response> {
  return await fetch('/api/players');
}
```

### 3. Błędy Buildu

#### Problem: "Module not found"

```
Error: Module not found: Can't resolve './components/PlayerCard'
```

**Rozwiązanie:**
- Sprawdź czy plik istnieje
- Sprawdź wielkość liter w nazwie (case-sensitive!)
- Sprawdź ścieżkę importu

```typescript
// Źle
import PlayerCard from './components/playercard'; // zła wielkość liter

// Dobrze
import PlayerCard from './components/PlayerCard';
```

#### Problem: "Failed to compile"

**Rozwiązanie:**
1. Sprawdź logi błędów dokładnie
2. Usuń `.next` i spróbuj ponownie: `rm -rf .next && npm run build`
3. Sprawdź czy wszystkie zależności są zainstalowane: `npm install`

---

## 📊 Przykładowy Output

### ✅ Sukces

```
╔════════════════════════════════════════════════════════════╗
║  🔍 Symulacja procesu deploymentu na serwer produkcyjny  ║
╚════════════════════════════════════════════════════════════╝

📋 Krok 1/4: ESLint - sprawdzanie jakości kodu...
✅ Linting passed

📋 Krok 2/4: TypeScript - sprawdzanie typów...
✅ TypeScript check passed

📋 Krok 3/4: Czyszczenie cache buildu...
✅ Build cache cleared

📋 Krok 4/4: Production build (npm run build)...
✓ Compiled successfully
✅ Build successful

╔════════════════════════════════════════════════════════════╗
║  🎉 Wszystkie testy przeszły pomyślnie!                   ║
║  ✨ Kod jest gotowy do deploymentu na serwer.             ║
╚════════════════════════════════════════════════════════════╝
```

### ❌ Błąd

```
📋 Krok 2/4: TypeScript - sprawdzanie typów...

src/app/players/[slug]/page.tsx:45:12 - error TS2339: Property 'summary' does not exist on type 'Player'.

45     {player.summary && <p>{player.summary}</p>}
              ~~~~~~~

❌ TypeScript errors found!
Napraw błędy typów przed deploymentem.
Wskazówka: Uruchom 'npx tsc --noEmit' aby zobaczyć szczegóły.
```

---

## 🔄 Workflow Developmentu

### Zalecany proces pracy:

1. **Podczas developmentu** - używaj `npm run dev`
   ```bash
   npm run dev
   ```

2. **Przed commitem** - szybki check
   ```bash
   npm run lint
   npm run type-check
   ```

3. **Przed pushem na main** - pełny test buildu
   ```bash
   npm run test-build
   ```

4. **Push do GitHub** - automatyczny deployment
   ```bash
   git push origin main
   ```

---

## 🛠️ Dostępne Skrypty

| Komenda | Opis | Kiedy używać |
|---------|------|--------------|
| `npm run dev` | Uruchamia dev server | Podczas developmentu |
| `npm run lint` | Sprawdza kod ESLintem | Przed commitem |
| `npm run type-check` | Sprawdza typy TypeScript | Przed commitem |
| `npm run test-build` | **Pełny test buildu** | **Przed pushem na main** |
| `npm run build` | Build produkcyjny | Rzadko (test-build robi to samo) |
| `npm start` | Uruchamia production server | Po buildzie (lokalnie) |

---

## 💡 Wskazówki

### 1. Uruchamiaj test-build przed każdym pushem na main

```bash
# Dobry nawyk:
npm run test-build && git push origin main
```

### 2. Używaj type-check podczas developmentu

Szybsze niż pełny build:

```bash
npm run type-check
```

### 3. Sprawdzaj logi dokładnie

Jeśli test failuje, przeczytaj **cały** output - często błąd jest na początku, nie na końcu.

### 4. Testuj na czystym cache

Jeśli coś działa dziwnie:

```bash
rm -rf .next
rm -rf node_modules
npm install
npm run test-build
```

---

## 🔗 Powiązane Dokumenty

- [Deployment i CI/CD](./deployment.md) - Proces deploymentu na serwer
- [Przewodnik Dewelopera](./development.md) - Uruchamianie projektu lokalnie
- [Frontend](./frontend.md) - Dokumentacja architektury frontendu

---

## 📝 Podsumowanie

**Przed każdym pushem na branch `main`:**

```bash
cd frontend
npm run test-build
```

Jeśli wszystkie testy przejdą ✅ - możesz śmiało pushować kod na serwer!

Jeśli coś failuje ❌ - napraw błędy i spróbuj ponownie.

**Pamiętaj:** Lepiej wykryć błąd lokalnie niż na produkcji! 🚀
