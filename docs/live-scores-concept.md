# Live wyniki meczów — koncept (do wdrożenia później)

## Cel

Dodać live wynik do strony meczu ("Tablica meczu"), aby był widoczny w trakcie meczu i pozostał po jego zakończeniu.

## Stan obecny

- UI pokazuje wynik jako "-:-" jeśli brak danych.
- Brak integracji z zewnętrznym źródłem wyników.

## Założenia

- Wynik ma się aktualizować na żywo w trakcie meczu.
- Po meczu wynik zostaje zapisany w DB i jest widoczny bez dalszych zapytań.

## Decyzje do podjęcia

- Wybór dostawcy API wyników live.
- Budżet i limity zapytań.
- Częstotliwość odświeżania (np. 60–120 s).

## Propozycje źródeł danych (skrót)

- API-Football (API-Sports)
- Free plan ma twarde limity requestów dziennie.
- Pełne coverage endpointów, proste startowe wdrożenie.

- TheSportsDB
- Live scores są w planie Premium.
- Free plan ma ograniczenia i może nie wystarczyć do live.

- football-data.org
- Live wyniki są płatne, a darmowy plan ma ograniczone rozgrywki.

## Alternatywa bez API: SofaScore widget (preferowane)

### Koncepcja

Na stronie meczu (`/mecze/[slug]`) zamiast placeholdera wyniku osadzić darmowy iframe SofaScore.
Widget odświeża się automatycznie w czasie rzeczywistym — bez własnego API i bez kosztów.

URL widgetu:

```
https://widgets.sofascore.com/embed/event/{SOFASCORE_MATCH_ID}?widgetTheme=light&widgetLocale=pl
```

### Wymagane zmiany w bazie danych

- Dodać pole `sofascore_match_id` (integer, nullable) do tabeli/modelu meczu (`Match` / `Fixture`).

### Komponent (frontend)

Utworzyć `components/SofaScoreWidget.tsx`:

```tsx
interface Props {
  matchId: number | null;
}

export default function SofaScoreWidget({ matchId }: Props) {
  if (!matchId) return null;

  return (
    <iframe
      src={`https://widgets.sofascore.com/embed/event/${matchId}?widgetTheme=light&widgetLocale=pl`}
      width="100%"
      height="180"
      frameBorder="0"
      scrolling="no"
      style={{ borderRadius: 8, display: 'block' }}
    />
  );
}
```

Na stronie meczu zamienić placeholder wyniku na:

```tsx
<SofaScoreWidget matchId={match.sofascore_match_id} />
```

### Jak znaleźć `SOFASCORE_MATCH_ID`

1. Wejść na sofascore.com i znaleźć mecz Ekstraklasy.
2. Otworzyć stronę meczu — URL wygląda tak:

```
sofascore.com/football/match/rakow-czestochowa-widzew-lodz/AbCdEfGh#id:12345678
```

3. Liczba po `#id:` to `sofascore_match_id` — wpisać ręcznie w panelu admina przy danym meczu.

### Opcjonalna automatyzacja (skrypt Node.js)

Skrypt `scripts/sync-sofascore-ids.ts` dopasowuje mecze z bazy do SofaScore po dacie i nazwach drużyn,
a następnie uzupełnia `sofascore_match_id` automatycznie.

```ts
// Nieoficjalne API SofaScore — może przestać działać bez ostrzeżenia
const DATE = '2026-04-04'; // format YYYY-MM-DD
const res = await fetch(`https://www.sofascore.com/api/v1/sport/football/scheduled-events/${DATE}`);
const { events } = await res.json();

for (const event of events) {
  if (event.tournament.id !== 202) continue; // 202 = Ekstraklasa
  // dopasuj event.homeTeam.name i event.awayTeam.name do meczu w bazie
  // zapisz event.id jako sofascore_match_id
}
```

Uruchomienie:

```bash
npx ts-node scripts/sync-sofascore-ids.ts
```

### Uwaga

Automatyzacja opiera się na nieoficjalnym API SofaScore (brak dokumentacji, może być blokowane).
Ręczne wpisywanie ID przez admina jest stabilniejsze.

## Proponowana integracja (wariant minimalny)

1. Dodać pole w DB na zewnętrzne ID meczu (np. `external_fixture_id`).
2. Ustalić mapowanie meczów (po dacie, drużynach, sezonie) i zapisać ID.
3. Cron/worker odpyta live endpoint w czasie meczu i zapisze wynik do DB.
4. Po zakończeniu meczu wynik pozostaje w DB i nie wymaga dalszego odświeżania.

## Zmiany w backend (koncept)

- Model `Fixture`:
- Nowe pole `external_fixture_id` (nullable, indexed).
- Pola wyniku już istnieją (`result_home`, `result_away`).

- Nowy management command:
- `update_live_scores` odpyta live endpoint, zapisze wynik.
- Uruchamianie co 60–120 s w oknie czasowym meczu.

## Zmiany w frontend (koncept)

- Brak zmian, jeśli wynik jest zapisany do `fixture.result_home/result_away`.
- Tablica meczu pokaże wynik automatycznie po aktualizacji w DB.

## Ryzyka i uwagi

- Limity API mogą wymusić batching i ograniczenie liczby meczów.
- Potrzebne mapowanie fixture <-> zewnętrzne ID dla uniknięcia pomyłek.
- Warto cache’ować odpowiedzi w backendzie w trakcie meczu.

## Następny krok (dla kolejnego agenta)

- Wybrać dostawcę API i potwierdzić limity.
- Dodać pole `external_fixture_id` w modelu `Fixture`.
- Zaimplementować `update_live_scores` i harmonogram wywołań.
 
## Status (do odhaczenia)

- [ ] Dodać pole `sofascore_match_id` do modelu meczu.
- [ ] Stworzyć komponent `SofaScoreWidget`.
- [ ] Zastąpić placeholder wyniku na stronie meczu.
- [ ] Dodać pole w panelu admina do wpisywania ID.
- [ ] (Opcjonalnie) Skrypt do automatycznego uzupełniania ID.
