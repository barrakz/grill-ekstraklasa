# Certyfikat SSL/TLS

## Let's Encrypt
- **Domena**: grillekstraklasa.pl, www.grillekstraklasa.pl
- **Certyfikat**: `/etc/letsencrypt/live/grillekstraklasa.pl/fullchain.pem`
- **Klucz prywatny**: `/etc/letsencrypt/live/grillekstraklasa.pl/privkey.pem`

Certyfikaty Let's Encrypt sa wazne 90 dni. Certbot odnawia je automatycznie, gdy pozostaje mniej niz 30 dni.

## Sprawdzenie certyfikatu
```bash
sudo certbot certificates
```

## Manualne odnowienie
```bash
sudo certbot renew
sudo systemctl reload nginx
```

## Test odnowienia (dry-run)
```bash
sudo certbot renew --dry-run
```

## Automatyczne odnowienie (cron)
Na serwerze skonfigurowany jest cron i skrypt odnowienia:
- **Skrypt**: `/usr/local/bin/renew-certbot.sh`
- **Cron**: `/etc/cron.d/certbot-renew`
- **Log**: `/var/log/letsencrypt/renew-cron.log`
- **Lock**: `/var/run/certbot-renew.lock`

Harmonogram (2x dziennie):
```
0 4,16 * * * root /usr/local/bin/renew-certbot.sh
```

Skrypt uzywa `flock`, wiec nie uruchomi drugiej instancji, jesli poprzednia nadal dziala.
