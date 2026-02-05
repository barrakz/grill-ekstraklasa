# Incydent 2026-02-04 - powrot minera w /var/tmp

## Objawy
- Strona `grillekstraklasa.pl` przestala odpowiadac lub dzialala bardzo wolno.
- Wysokie zuzycie CPU/RAM w procesach frontendu.

## Wykryte procesy
- Miner uruchomiony z `/var/tmp/.x/m` (polaczenia m.in. do `gulf.moneroocean.stream`).
- Dropper uruchomiony przez `/bin/sh`, pobierajacy skrypt z `http://abcdefghijklmnopqrst.net/s`.
- Procesy wystartowaly w kontekscie `grill-frontend.service`.

## Dzialania naprawcze
- Zatrzymano `grill-frontend.service`, ubito procesy i usunieto artefakty:
  - `/var/tmp/.x` oraz `/tmp/s`.
- Zaktualizowano `kill-cryptominer.sh`:
  - rozszerzone wzorce (moneroocean, dropper i sciezki),
  - sprzatanie znanych plikow po infekcji.
- Dodatkowe hardening systemd:
  - **backend**: `ProtectHome=read-only`, `ReadWritePaths` tylko do backendu, `PrivateDevices`, `LockPersonality`, `RestrictRealtime`, `SystemCallArchitectures=native`, `UMask=027`.
  - **frontend**: `SystemCallArchitectures=native` (pozostale hardening juz byly).
- Restart uslug: `grill_ekstraklasa.service`, `grill-frontend.service`, `nginx`.

## Weryfikacja
- `https://www.grillekstraklasa.pl` zwraca `200`.
- Brak aktywnych procesow z podejrzanymi wzorcami.

## Dalsze kroki (rekomendacje)
- Monitorowac logi `journalctl -u grill-frontend.service` i `nginx` pod katem prob ponownego zainfekowania.
- Rozwazyc aktualizacje zaleznosci frontendu (Next.js i powiazane pakiety) w celu zamkniecia ewentualnych luk.
