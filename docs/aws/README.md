# Konfiguracja Serwera AWS - Grill Ekstraklasa

Ta dokumentacja opisuje konfiguracje serwera produkcyjnego dla aplikacji Grill Ekstraklasa.

## Szybkie informacje
- **Host**: `EC2_PUBLIC_DNS` (sprawdz w AWS Console)
- **Uzytkownik**: `ec2-user`
- **Klucz SSH**: `~/.ssh/grill-ekstraklasa-2026-01-25` (key pair: `grill-ekstraklasa-2026-01-25`)
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
