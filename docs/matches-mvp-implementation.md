# Moduł meczowy — aktualny stan (skrót operacyjny)

## Cel

Szybka instrukcja dla kolejnego agenta lub operatora: jak działa obecny moduł meczowy, jakie ma statusy i jak nim zarządzać.

## Statusy i widoczność publiczna

| Status w bazie | Widoczne publicznie | Znaczenie | Etykieta w UI |
|---|---|---|---|
| `draft` | nie | mecz roboczy po imporcie lub ręcznym utworzeniu | brak |
| `lineup_pending` | nie | mecz czeka na skład | brak |
| `lineup_predicted` | tak | przewidywany skład, można oceniać | „Przewidywany skład” |
| `published` | tak | oficjalne jedenastki, można oceniać | „Wyjściowe jedenastki” |
| `live` | tak | mecz w trakcie | „Mecz trwa” |
| `finished` | tak | mecz zakończony | „Zakończony” |
| `archived` | nie | mecz ukryty operacyjnie | brak |

Uwagi:
- Publiczne endpointy i strony pokazują tylko: `lineup_predicted`, `published`, `live`, `finished`.
- Zawodnik jest widoczny publicznie tylko gdy `FixturePlayer.is_visible_public = true`.

## Cykl życia meczu (praktyka)

1. Import terminarza w panelu z JSON (wzór w `docs/features/match-fixtures-import-example.json`).
2. Opcjonalnie przypnij pełne kadry („Przypnij pełne kadry”). To tworzy robocze wpisy `FixturePlayer`, ale jeszcze nic nie publikuje.
3. Jeśli chcesz dać „przewidywane składy”, ustaw status `lineup_predicted` i wybierz zawodników w edycji składu. Wybrane wpisy są publiczne i od razu ocenialne.
4. Import oficjalnych składów z JSON (wzór w `docs/features/match-lineup-import-example.json`). `confirm_lineup_import` automatycznie ustawia status na `published` (także z `lineup_predicted`).
5. Cron `update_fixture_statuses` przełącza statusy: `live` w momencie rozpoczęcia meczu, `finished` po `start + 2h05`, `archived` po `finished + 5 dni`.

## Panel — instrukcja operacyjna (minimum)

1. Panel `Mecze` -> Import JSON -> Analizuj -> Zatwierdź.
2. Jeśli chcesz pokazać przewidywane składy: edytuj mecz -> wybierz zawodników -> ustaw `lineup_predicted` -> Zapisz skład.
3. Gdy masz oficjalne jedenastki: Import składu -> Analizuj -> Zapisz skład (status przejdzie na `published`).
4. Jeśli import się myli: edytuj skład ręcznie w panelu (możesz zapisać częściowy skład).

## Dla developera (krótko)

- Cron: `backend/matches/management/commands/update_fixture_statuses.py`.
- Produkcyjny cron (EC2): `*/5 * * * * cd /home/ec2-user/grill-ekstraklasa/backend && /home/ec2-user/grill-ekstraklasa/backend/venv/bin/python manage.py update_fixture_statuses >> /home/ec2-user/grill-ekstraklasa/logs/fixture-status.log 2>&1`
- Publiczne statusy ustawione w `PUBLIC_FIXTURE_STATUSES` obejmują `lineup_predicted`.
- Import składu (`lineup-import/confirm`) auto-publikuje `draft`, `lineup_pending`, `lineup_predicted`.
- Panel używa endpointu do ręcznej edycji składu: `PATCH /api/matches/admin/fixtures/{id}/lineup/`.
- Etykieta `published` w UI to „Wyjściowe jedenastki” (front + panel).
