# Informacje o serwerze

## Dane polaczenia (SSH)
- **Host (Public IP)**: `EC2_PUBLIC_IP` (sprawdz w AWS Console; aktualny 2026-01-23: `54.84.233.139`)
- **Public DNS**: `EC2_PUBLIC_DNS` (aktualny 2026-01-23: `ec2-54-84-233-139.compute-1.amazonaws.com`)
- **Uzytkownik**: `ec2-user`
- **Klucz SSH**: `~/.ssh/grill-ekstraklasa-2026-01-25` (key pair: `grill-ekstraklasa-2026-01-25`)
- **Komenda polaczenia**:
  ```bash
  ssh -i ~/.ssh/grill-ekstraklasa-2026-01-25 ec2-user@EC2_PUBLIC_IP
  ```

## Specyfikacja systemu
- **System operacyjny**: Amazon Linux 2023
- **Kernel**: 6.1.129-138.220.amzn2023.x86_64
- **Architektura**: x86_64
- **Hostname**: ip-172-31-86-186.ec2.internal

## Zasoby systemowe
- **Dysk**: 8.0GB (malo miejsca, warto kontrolowac)
- **RAM**: ~950MB calkowite
- **Swap**: 1.0GB

> [!WARNING]
> Serwer ma ograniczone zasoby pamieci RAM (~950MB). Monitoruj zuzycie pamieci, szczegolnie przy wiekszym ruchu.

### Przydatne komendy
```bash
uname -a
free -h
swapon --show
df -h
```
