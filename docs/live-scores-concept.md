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
