# Incydenty

## 2026-02-04 - powrot minera w /var/tmp

### Objawy
- Strona przestala odpowiadac lub dzialala bardzo wolno.
- Wysokie zuzycie CPU/RAM w procesach frontendu.

### Przyczyna
- Miner uruchomiony z `/var/tmp/.x/m` oraz dropper pobierajacy skrypt z `http://abcdefghijklmnopqrst.net/s`.
- Procesy wystartowaly w kontekscie `grill-frontend.service`.

### Dzialania naprawcze
- Usuniecie procesow i artefaktow (`/var/tmp/.x`, `/tmp/s`).
- Aktualizacja `kill-cryptominer.sh` (rozszerzone wzorce + sprzatanie).
- Dodatkowe hardening systemd dla backendu i frontendu.
- Restart uslug: backend, frontend, nginx.

Szczegoly: `docs/aws/incident-2026-02-04-miner.md`

## 2026-01-25 - miner uruchamiany z /tmp

### Objawy
- Spowolnienie API i strony WWW.
- Wysoki load oraz steal time na CPU.

### Przyczyna
- Miner w `/tmp/.nextjs/system` uruchamiany w kontekscie `grill-frontend.service`.

### Dzialania naprawcze
- Usuniecie minera i katalogu `/tmp/.nextjs`.
- Zmiana bindowania uslug na `127.0.0.1`.
- Hardenowanie systemd oraz `/tmp` z `noexec`.
- Ponowne usuniecie `xmrig` i `scanner_linux` (z `frontend/`) po nawrocie.
- Dodanie systemd timer `kill-cryptominer.timer` (co 5 min).
- Dodatkowy hardening `grill-frontend.service`: `ProtectHome=read-only`.
- Rotacja sekretow aplikacji: `SECRET_KEY`, haslo DB.
- Rotacja klucza SSH (nowa para kluczy).

Szczegoly: `docs/aws/incident-2026-01-25-miner.md`

## 2026-01-06 - powolny serwer i bledy strony

### Objawy
- Komendy na serwerze wykonywaly sie bardzo wolno (kilkanascie-kilkadziesiat sekund).
- Strona `grillekstraklasa.pl` zwracala bledy, frontend mial 500.
- Load average znacznie powyzej mozliwosci instancji, RAM i swap zapelnione.

### Przyczyna
- Na serwerze uruchomione byly liczne obce procesy `node` z katalogu:
  `/home/ec2-user/.local/share/.r0qsv8h1` (obfuskowany skrypt `.fvq2lzl64e.js`).
- Procesy byly utrwalone przez:
  - `~/.bashrc` (autostart),
  - `~/.config/systemd/user/*.service`,
  - `~/.config/autostart/*.desktop`.
- Dodatkowo certyfikat TLS dla `grillekstraklasa.pl` wygasl (frontend zwracal 500 z `CERT_HAS_EXPIRED`).

### Dzialania naprawcze
- Zatrzymano i usunieto obce procesy oraz katalog `~/.local/share/.r0qsv8h1`.
- Usunieto mechanizmy autostartu (bashrc, user systemd, autostart).
- Zrestartowano uslugi:
  ```bash
  sudo systemctl restart grill_ekstraklasa.service
  sudo systemctl restart grill-frontend.service
  ```
- Odnowiono certyfikat i przeladowano Nginx:
  ```bash
  sudo certbot renew --force-renewal
  sudo systemctl reload nginx
  ```
- Skonfigurowano automatyczne odnawianie certyfikatu (cron + skrypt).

### Wynik
- Load i zuzycie pamieci wrocily do normy, brak nadmiernego swapu.
- `https://grillekstraklasa.pl` odpowiada poprawnie (HTTP 200).
