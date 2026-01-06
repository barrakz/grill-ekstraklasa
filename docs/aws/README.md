# Konfiguracja Serwera AWS - Grill Ekstraklasa

Ta dokumentacja opisuje konfiguracje serwera produkcyjnego dla aplikacji Grill Ekstraklasa.

## Szybkie informacje
- **Host**: `ec2-100-26-185-102.compute-1.amazonaws.com`
- **Uzytkownik**: `ec2-user`
- **Repozytorium na serwerze**: `/home/ec2-user/grill-ekstraklasa`
- **Domena**: `grillekstraklasa.pl` (oraz `www.grillekstraklasa.pl`)
- **System**: Amazon Linux 2023

## Spis tresci
- [Informacje o serwerze](./connection.md)
- [Architektura aplikacji](./architecture.md)
- [Uslugi systemd](./systemd.md)
- [Nginx](./nginx.md)
- [SSL/TLS i certbot](./ssl.md)
- [Procesy i zasoby](./processes-resources.md)
- [Zmienne srodowiskowe](./environment.md)
- [Deployment (manualny)](./deployment.md)
- [Troubleshooting](./troubleshooting.md)
- [Backup i bezpieczenstwo](./backup-security.md)
- [Przydatne komendy](./commands.md)
- [Logi](./logs.md)
- [Incydenty](./incidents.md)

## Dodatkowe materialy
- CI/CD i GitHub Actions: `docs/deployment.md`

## Kontakt i wsparcie
Dla problemow z serwerem lub aplikacja, sprawdz:
1. Logi (`docs/aws/logs.md`)
2. Status uslug (`systemctl status`)
3. Zasoby systemowe (`htop`, `free`, `df`)

**Ostatnia aktualizacja**: 2026-01-06
