# Konfiguracja Serwera AWS - Grill Ekstraklasa

## Informacje o Serwerze

### Dane Połączenia
- **Host**: `ec2-100-26-185-102.compute-1.amazonaws.com`
- **Użytkownik**: `ec2-user`
- **Klucz SSH**: `~/.ssh/aws-ec2-ebeats`
- **Komenda połączenia**: 
  ```bash
  ssh -i ~/.ssh/aws-ec2-ebeats ec2-user@ec2-100-26-185-102.compute-1.amazonaws.com
  ```

### Specyfikacja Systemu
- **System Operacyjny**: Amazon Linux 2023
- **Kernel**: 6.1.129-138.220.amzn2023.x86_64
- **Architektura**: x86_64
- **Hostname**: ip-172-31-86-186.ec2.internal

### Zasoby Systemowe
- **Dysk**: 8.0GB (78% wykorzystane - 6.2GB użyte, 1.8GB wolne)
- **RAM**: 949MB całkowita (525MB użyte, 267MB dostępne)
- **Swap**: 1.0GB (152MB użyte)

> [!WARNING]
> Serwer ma ograniczone zasoby pamięci RAM (~950MB). Należy monitorować wykorzystanie pamięci, szczególnie przy większym ruchu.

---

## Architektura Aplikacji

### Stack Technologiczny

#### Backend (Django)
- **Python**: 3.9.20
- **Framework**: Django 4.2.20
- **WSGI Server**: Gunicorn 23.0.0
- **Baza danych**: PostgreSQL (lokalnie)
- **Lokalizacja**: `/home/ec2-user/grill-ekstraklasa/backend`
- **Virtual Environment**: `/home/ec2-user/grill-ekstraklasa/backend/venv`

#### Frontend (Next.js)
- **Node.js**: v18.20.7
- **npm**: 10.8.2
- **Framework**: Next.js 15.4.6
- **Lokalizacja**: `/home/ec2-user/grill-ekstraklasa/frontend`

#### Web Server
- **Nginx**: Reverse proxy i SSL termination
- **SSL/TLS**: Let's Encrypt (certbot)

---

## Usługi Systemd

Aplikacja działa jako zestaw usług systemd, które automatycznie uruchamiają się przy starcie serwera.

### 1. Backend Service: `grill_ekstraklasa.service`

**Lokalizacja**: `/etc/systemd/system/grill_ekstraklasa.service`

```ini
[Unit]
Description=Gunicorn instance to serve grill_ekstraklasa
After=network.target

[Service]
User=ec2-user
Group=ec2-user
WorkingDirectory=/home/ec2-user/grill-ekstraklasa/backend
EnvironmentFile=/home/ec2-user/grill-ekstraklasa/backend/.env
Environment="PATH=/home/ec2-user/grill-ekstraklasa/backend/venv/bin"
ExecStart=/home/ec2-user/grill-ekstraklasa/backend/venv/bin/gunicorn -w 3 --bind 0.0.0.0:8000 grill_ekstraklasa.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

**Konfiguracja**:
- **Workers**: 3 procesy Gunicorn
- **Bind**: 0.0.0.0:8000 (dostępny lokalnie)
- **Auto-restart**: Tak (Restart=always)
- **Environment**: Ładowany z `/home/ec2-user/grill-ekstraklasa/backend/.env`

**Status**: ✅ Active (running) od 2025-08-10 06:40:50 UTC

**Zarządzanie**:
```bash
# Status
sudo systemctl status grill_ekstraklasa.service

# Restart
sudo systemctl restart grill_ekstraklasa.service

# Logi
sudo journalctl -u grill_ekstraklasa.service -f
```

### 2. Frontend Service: `grill-frontend.service`

**Lokalizacja**: `/etc/systemd/system/grill-frontend.service`

```ini
[Unit]
Description=Grill Ekstraklasa Frontend (Next.js)
After=network.target

[Service]
User=ec2-user
WorkingDirectory=/home/ec2-user/grill-ekstraklasa/frontend
ExecStart=/home/ec2-user/.nvm/versions/node/v18.20.7/bin/npm start
Restart=always
Environment=PORT=3000
Environment=NODE_ENV=production
Environment=PATH=/home/ec2-user/.nvm/versions/node/v18.20.7/bin:/usr/bin:/bin

[Install]
WantedBy=multi-user.target
```

**Konfiguracja**:
- **Port**: 3000 (lokalnie)
- **Node Environment**: production
- **Auto-restart**: Tak
- **Node Manager**: NVM (Node Version Manager)

**Status**: ✅ Active (running) od 2025-08-10 06:41:58 UTC

**Zarządzanie**:
```bash
# Status
sudo systemctl status grill-frontend.service

# Restart
sudo systemctl restart grill-frontend.service

# Logi
sudo journalctl -u grill-frontend.service -f
```

### 3. Baza Danych: `postgresql.service`

**Status**: ✅ Active (running)

**Konfiguracja** (z `.env`):
- **Database**: ekstraklasa
- **User**: grilluser
- **Host**: localhost
- **Port**: 5432

---

## Konfiguracja Nginx

### Główny Plik Konfiguracyjny
**Lokalizacja**: `/etc/nginx/nginx.conf`

### Konfiguracja Aplikacji
**Lokalizacja**: `/etc/nginx/conf.d/grill_ekstraklasa.conf`

```nginx
# HTTP – przekierowanie na HTTPS
server {
    listen 80;
    server_name grillekstraklasa.pl www.grillekstraklasa.pl;

    return 301 https://$host$request_uri;
}

# HTTPS – właściwa aplikacja
server {
    listen 443 ssl;
    server_name grillekstraklasa.pl www.grillekstraklasa.pl;

    ssl_certificate /etc/letsencrypt/live/grillekstraklasa.pl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/grillekstraklasa.pl/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # lokalizacja dla sitemap.xml
    location = /sitemap.xml {
        proxy_pass http://127.0.0.1:8000/sitemap.xml;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django API
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000/admin/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Routing
- **/** → Next.js Frontend (port 3000)
- **/api/** → Django Backend (port 8000)
- **/admin/** → Django Admin (port 8000)
- **/sitemap.xml** → Django Backend (port 8000)

**Zarządzanie Nginx**:
```bash
# Test konfiguracji
sudo nginx -t

# Restart
sudo systemctl restart nginx

# Status
sudo systemctl status nginx

# Logi
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## Certyfikat SSL/TLS

### Let's Encrypt
- **Domena**: grillekstraklasa.pl, www.grillekstraklasa.pl
- **Typ klucza**: ECDSA
- **Ważność**: do 2025-12-29 12:26:32 UTC (37 dni pozostało)
- **Certyfikat**: `/etc/letsencrypt/live/grillekstraklasa.pl/fullchain.pem`
- **Klucz prywatny**: `/etc/letsencrypt/live/grillekstraklasa.pl/privkey.pem`

### Odnowienie Certyfikatu
```bash
# Sprawdzenie certyfikatów
sudo certbot certificates

# Manualne odnowienie
sudo certbot renew

# Test odnowienia (dry-run)
sudo certbot renew --dry-run
```

> [!IMPORTANT]
> Certbot powinien automatycznie odnawiać certyfikaty. Sprawdź cron/systemd timer dla automatycznego odnowienia.

---

## Procesy i Zasoby

### Uruchomione Procesy Aplikacji

```bash
# Nginx
root        2201  nginx: master process
nginx    2660049  nginx: worker process

# Gunicorn (Backend) - 1 master + 3 workers
ec2-user  220946  gunicorn master
ec2-user  735554  gunicorn worker
ec2-user 1153362  gunicorn worker
ec2-user 1165932  gunicorn worker

# Next.js (Frontend)
ec2-user  221133  npm start
ec2-user  221144  next-server (v15.4.6)
```

### Monitoring

```bash
# Sprawdzenie procesów
ps aux | grep -E 'python|node|nginx' | grep -v grep

# Wykorzystanie zasobów
htop
free -h
df -h

# Status wszystkich usług
systemctl list-units --type=service --state=running
```

---

## Zmienne Środowiskowe

Backend korzysta z pliku `.env` w `/home/ec2-user/grill-ekstraklasa/backend/.env`

**Przykładowe zmienne** (bez wrażliwych danych):
```env
DEBUG=False
DB_NAME=ekstraklasa
DB_USER=grilluser
DB_HOST=localhost
DB_PORT=5432
```

> [!CAUTION]
> Plik `.env` zawiera wrażliwe dane (hasła, klucze API). Nigdy nie commituj go do repozytorium!

---

## Deployment i Aktualizacje

### Aktualizacja Backendu

```bash
# 1. Połącz się z serwerem
ssh -i ~/.ssh/aws-ec2-ebeats ec2-user@ec2-100-26-185-102.compute-1.amazonaws.com

# 2. Przejdź do katalogu projektu
cd /home/ec2-user/grill-ekstraklasa

# 3. Pobierz zmiany z Git
git pull origin main

# 4. Aktywuj virtual environment
cd backend
source venv/bin/activate

# 5. Zainstaluj/zaktualizuj zależności
pip install -r requirements.txt

# 6. Uruchom migracje
python manage.py migrate

# 7. Zbierz pliki statyczne
python manage.py collectstatic --noinput

# 8. Restart usługi
sudo systemctl restart grill_ekstraklasa.service

# 9. Sprawdź status
sudo systemctl status grill_ekstraklasa.service
```

### Aktualizacja Frontendu

```bash
# 1. Połącz się z serwerem
ssh -i ~/.ssh/aws-ec2-ebeats ec2-user@ec2-100-26-185-102.compute-1.amazonaws.com

# 2. Przejdź do katalogu projektu
cd /home/ec2-user/grill-ekstraklasa

# 3. Pobierz zmiany z Git
git pull origin main

# 4. Przejdź do frontendu
cd frontend

# 5. Zainstaluj zależności
npm install

# 6. Zbuduj aplikację
npm run build

# 7. Restart usługi
sudo systemctl restart grill-frontend.service

# 8. Sprawdź status
sudo systemctl status grill-frontend.service
```

---

## Inne Usługi Systemowe

### Docker
- **Status**: ✅ Running
- **Containerd**: ✅ Running
- **Uwaga**: Obecnie brak uruchomionych kontenerów (aplikacja działa natywnie)

### Pozostałe Usługi
- **SSH**: sshd.service (OpenSSH server daemon)
- **Chronyd**: NTP client/server (synchronizacja czasu)
- **Amazon SSM Agent**: Zarządzanie przez AWS Systems Manager
- **Auditd**: Security Auditing Service

---

## Troubleshooting

### Backend nie odpowiada

```bash
# Sprawdź status
sudo systemctl status grill_ekstraklasa.service

# Sprawdź logi
sudo journalctl -u grill_ekstraklasa.service -n 100 --no-pager

# Restart
sudo systemctl restart grill_ekstraklasa.service
```

### Frontend nie odpowiada

```bash
# Sprawdź status
sudo systemctl status grill-frontend.service

# Sprawdź logi
sudo journalctl -u grill-frontend.service -n 100 --no-pager

# Restart
sudo systemctl restart grill-frontend.service
```

### Nginx błędy

```bash
# Test konfiguracji
sudo nginx -t

# Sprawdź logi błędów
sudo tail -f /var/log/nginx/error.log

# Restart
sudo systemctl restart nginx
```

### Brak miejsca na dysku

```bash
# Sprawdź wykorzystanie
df -h

# Znajdź duże pliki
sudo du -h /home/ec2-user | sort -rh | head -20

# Wyczyść logi (opcjonalnie)
sudo journalctl --vacuum-time=7d
```

### Problemy z pamięcią

```bash
# Sprawdź wykorzystanie
free -h

# Sprawdź procesy zużywające pamięć
ps aux --sort=-%mem | head -10

# Restart usług (jeśli potrzebne)
sudo systemctl restart grill_ekstraklasa.service
sudo systemctl restart grill-frontend.service
```

---

## Backup i Bezpieczeństwo

### Backup Bazy Danych

```bash
# Backup PostgreSQL
sudo -u postgres pg_dump ekstraklasa > backup_$(date +%Y%m%d).sql

# Backup z kompresją
sudo -u postgres pg_dump ekstraklasa | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Firewall i Security Groups

> [!NOTE]
> Konfiguracja Security Groups powinna być zarządzana przez AWS Console. Upewnij się, że:
> - Port 80 (HTTP) jest otwarty dla przekierowania na HTTPS
> - Port 443 (HTTPS) jest otwarty dla ruchu aplikacji
> - Port 22 (SSH) jest otwarty tylko dla zaufanych IP
> - Porty 3000 i 8000 są dostępne TYLKO lokalnie (nie publicznie)

---

## Przydatne Komendy

### Monitoring w czasie rzeczywistym

```bash
# Logi backend
sudo journalctl -u grill_ekstraklasa.service -f

# Logi frontend
sudo journalctl -u grill-frontend.service -f

# Logi nginx
sudo tail -f /var/log/nginx/access.log

# Wszystkie logi systemowe
sudo journalctl -f
```

### Restart wszystkich usług

```bash
# Restart całej aplikacji
sudo systemctl restart grill_ekstraklasa.service
sudo systemctl restart grill-frontend.service
sudo systemctl restart nginx
```

### Sprawdzenie portów

```bash
# Sprawdź nasłuchujące porty
sudo netstat -tlnp | grep -E ':(80|443|3000|8000|5432)'

# lub z ss
sudo ss -tlnp | grep -E ':(80|443|3000|8000|5432)'
```

---

## Kontakt i Wsparcie

Dla problemów z serwerem lub aplikacją, sprawdź:
1. Logi systemowe (`journalctl`)
2. Logi nginx (`/var/log/nginx/`)
3. Status usług (`systemctl status`)
4. Zasoby systemowe (`htop`, `free`, `df`)

**Ostatnia aktualizacja**: 2025-11-21
