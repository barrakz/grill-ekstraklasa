# Logi

Poniżej znajduje się spójny przegląd logów dla wszystkich kluczowych usług.

## Szybki podgląd

```bash
# Backend (Django/Gunicorn) – logi przez systemd
sudo journalctl -u grill_ekstraklasa.service -f

# Frontend (Next.js) – logi przez systemd
sudo journalctl -u grill-frontend.service -f

# Nginx – pliki logów
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Logi systemowe (ogólne)
sudo journalctl -f
```

## Mapa logów

| Komponent | Gdzie logi | Szybka komenda |
| --- | --- | --- |
| Backend (Django/Gunicorn) | `journalctl` (systemd) | `sudo journalctl -u grill_ekstraklasa.service -f` |
| Frontend (Next.js) | `journalctl` (systemd) | `sudo journalctl -u grill-frontend.service -f` |
| Nginx | `/var/log/nginx/` | `sudo tail -f /var/log/nginx/error.log` |
| System | `journalctl` | `sudo journalctl -f` |

## Dodatkowe przyklady

```bash
# Ostatnie 100 wpisow (backend)
sudo journalctl -u grill_ekstraklasa.service -n 100 --no-pager

# Ostatnie 100 wpisow (frontend)
sudo journalctl -u grill-frontend.service -n 100 --no-pager

# Nginx – błędy tylko
sudo tail -n 200 /var/log/nginx/error.log
```
