# Backup i bezpieczenstwo

## Backup bazy danych
```bash
# Backup PostgreSQL
sudo -u postgres pg_dump ekstraklasa > backup_$(date +%Y%m%d).sql

# Backup z kompresja
sudo -u postgres pg_dump ekstraklasa | gzip > backup_$(date +%Y%m%d).sql.gz
```

## Firewall i Security Groups
> [!NOTE]
> Konfiguracja Security Groups powinna byc zarzadzana przez AWS Console. Upewnij sie, ze:
> - Port 80 (HTTP) jest otwarty dla przekierowania na HTTPS
> - Port 443 (HTTPS) jest otwarty dla ruchu aplikacji
> - Port 22 (SSH) jest otwarty tylko dla zaufanych IP
> - Porty 3000 i 8000 sa dostepne TYLKO lokalnie (nie publicznie)
