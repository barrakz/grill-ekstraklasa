# Incydent 2026-01-25 - miner w /tmp/.nextjs

## Objawy
- Bardzo wolne API i strona WWW.
- Wysoki load oraz steal time na CPU.

## Przyczyna
- Uruchomiony miner z katalogu `/tmp/.nextjs/system` pobierany przez skrypt droppera.
- Proces wystartowal w kontekscie `grill-frontend.service`.

## Wykonane dzialania (2026-01-25)
- Zatrzymanie `grill-frontend.service`, usuniecie `/tmp/.nextjs` i ubicie procesu minera.
- Zmiana bindowania uslug na localhost:
  - `grill_ekstraklasa.service` -> `127.0.0.1:8000`
  - `grill-frontend.service` -> `127.0.0.1:3000`
- Hardenowanie systemd dla obu uslug:
  - `NoNewPrivileges=true`
  - `PrivateTmp=true`
  - `ProtectSystem=full`
  - `ProtectKernelTunables=true`
  - `ProtectKernelModules=true`
  - `ProtectControlGroups=true`
  - `RestrictSUIDSGID=true`
- `/tmp` z `noexec` (tymczasowo remount; trwale przez override `tmp.mount`).
- Pobranie backupu bazy na lokalna maszyne:
  - `backups/ekstraklasa_2026-01-25.dump` (nie commitowac do repo).

## Weryfikacja
- `next start` nasluchuje tylko na `127.0.0.1:3000`.
- `gunicorn` nasluchuje tylko na `127.0.0.1:8000`.
- `https://www.grillekstraklasa.pl` odpowiada poprawnie (HTTP 200).
