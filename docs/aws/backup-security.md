# Backup i bezpieczenstwo

## Backup bazy danych (automatyczny)
Na serwerze jest skonfigurowany tygodniowy backup przez systemd:
- **Timer**: `pg_dump_grill.timer` (co niedziele 03:15 UTC)
- **Lokalizacja**: `/var/lib/pgsql/backups`
- **Format**: `pg_dump -Fc` (custom/compressed)
- **Retencja lokalna**: domyslnie ostatnie 4 dumpy
- **Bezpieczenstwo miejsca**: backup nie wykona sie, gdy wolne miejsce spadnie ponizej `MIN_FREE_MB`

Konfiguracja (opcjonalna) znajduje sie w:
`/etc/sysconfig/pg_dump_grill`

Przyklad zawartosci:
```bash
S3_BUCKET=""
S3_PREFIX="grillekstraklasa"
RETENTION_COUNT=4
MIN_FREE_MB=512
```

Ręczne uruchomienie backupu:
```bash
sudo systemctl start pg_dump_grill.service
sudo ls -lh /var/lib/pgsql/backups | tail -n 5
```

## Backup poza instancja (S3) — zalecane
To zapewnia odzyskanie bazy nawet gdy instancja padnie lub jest zainfekowana.

Wymagania:
1) Bucket S3 (np. `grillekstraklasa-backups`)
2) Uprawnienia do S3 dla instancji (IAM Role **lub** `aws configure`)

Minimalne uprawnienia IAM (przykladowo dla prefixu `grillekstraklasa/`):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::YOUR_BUCKET/grillekstraklasa/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::YOUR_BUCKET",
      "Condition": {"StringLike": {"s3:prefix": ["grillekstraklasa/*"]}}
    }
  ]
}
```

Nastepnie ustaw w `/etc/sysconfig/pg_dump_grill`:
```bash
S3_BUCKET="YOUR_BUCKET"
S3_PREFIX="grillekstraklasa"
```

Po zapisaniu:
```bash
sudo systemctl restart pg_dump_grill.timer
sudo systemctl start pg_dump_grill.service
```

W S3 pojawi sie plik `latest.dump` oraz dumpy z timestampem.

## Jak pobrac backup na lokalna maszyne (bez dostepu do S3)
Najprostsza opcja (streaming po SSH, bez zapisu na serwerze):
```bash
ssh -i ~/.ssh/edbnew.pem ec2-user@EC2_PUBLIC_IP "sudo -u postgres pg_dump -Fc -d ekstraklasa" > ekstraklasa_$(date +%F).dump
```

Alternatywnie — pobranie najnowszego pliku z serwera:
```bash
LATEST=$(ssh -i ~/.ssh/edbnew.pem ec2-user@EC2_PUBLIC_IP "sudo ls -t /var/lib/pgsql/backups | head -n 1")
ssh -i ~/.ssh/edbnew.pem ec2-user@EC2_PUBLIC_IP "sudo cat /var/lib/pgsql/backups/$LATEST" > "$LATEST"
```

## Odzyskiwanie bazy (restore)
Zakladamy dump w formacie `-Fc`.

1) Zatrzymaj uslugi aplikacji:
```bash
sudo systemctl stop grill_ekstraklasa.service
sudo systemctl stop grill-frontend.service
```

2) Przywroc baze (najbezpieczniej do pustej bazy):
```bash
sudo -u postgres dropdb ekstraklasa
sudo -u postgres createdb -O grilluser ekstraklasa
sudo -u postgres pg_restore -d ekstraklasa /sciezka/do/backup.dump
```

3) Uruchom uslugi:
```bash
sudo systemctl start grill_ekstraklasa.service
sudo systemctl start grill-frontend.service
```

## Firewall i Security Groups
> [!NOTE]
> Konfiguracja Security Groups powinna byc zarzadzana przez AWS Console. Upewnij sie, ze:
> - Port 80 (HTTP) jest otwarty dla przekierowania na HTTPS
> - Port 443 (HTTPS) jest otwarty dla ruchu aplikacji
> - Port 22 (SSH) jest otwarty tylko dla zaufanych IP
> - Porty 3000 i 8000 sa dostepne TYLKO lokalnie (nie publicznie)
