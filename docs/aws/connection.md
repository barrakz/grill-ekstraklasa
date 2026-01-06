# Informacje o serwerze

## Dane polaczenia (SSH)
- **Host**: `ec2-100-26-185-102.compute-1.amazonaws.com`
- **Uzytkownik**: `ec2-user`
- **Klucz SSH**: `~/.ssh/aws-ec2-ebeats`
- **Komenda polaczenia**:
  ```bash
  ssh -i ~/.ssh/aws-ec2-ebeats ec2-user@ec2-100-26-185-102.compute-1.amazonaws.com
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
