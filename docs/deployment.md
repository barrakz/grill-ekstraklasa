# 🚀 Deployment i CI/CD

Ten dokument opisuje proces wdrożenia aplikacji Grill Ekstraklasa na serwer produkcyjny AWS EC2 oraz automatyczny proces CI/CD z GitHub Actions.

## 🏗️ Architektura Produkcyjna

### Infrastruktura

```
Internet
   │
   ▼
┌─────────────────────────────────────┐
│         AWS EC2 Instance            │
│      (Amazon Linux 2023)            │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Nginx (Reverse Proxy)      │  │
│  │   Port 80/443                │  │
│  └────────┬──────────────┬──────┘  │
│           │              │          │
│           ▼              ▼          │
│  ┌────────────┐  ┌─────────────┐  │
│  │  Gunicorn  │  │   Next.js   │  │
│  │  (Django)  │  │   (Node)    │  │
│  │  :8000     │  │   :3000     │  │
│  └─────┬──────┘  └─────────────┘  │
│        │                            │
│        ▼                            │
│  ┌──────────────┐                  │
│  │ PostgreSQL   │                  │
│  │   :5432      │                  │
│  └──────────────┘                  │
└─────────────────────────────────────┘
         │
         ▼
   ┌──────────┐
   │  AWS S3  │
   │  Bucket  │
   └──────────┘
```

### Komponenty

- **Nginx**: Reverse proxy, obsługa SSL, routing
- **Gunicorn**: WSGI server dla Django
- **Django**: Backend API (port 8000)
- **Next.js**: Frontend SSR (port 3000)
- **PostgreSQL**: Baza danych (lokalna na EC2)
- **AWS S3**: Storage dla zdjęć zawodników i klubów
- **systemd**: Zarządzanie procesami (auto-restart)

---

## 🔄 CI/CD - GitHub Actions

### Automatyczny Deploy

Każdy push do brancha `main` automatycznie wdraża zmiany na serwer produkcyjny.

### Workflow Deploy

Plik: `.github/workflows/deploy.yml`

```yaml
name: Deploy to EC2

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout repo
      uses: actions/checkout@v3

    - name: Deploy to EC2 via SSH
      uses: appleboy/ssh-action@v0.1.10
      with:
        host: EC2_PUBLIC_IP
        username: ec2-user
        key: ${{ secrets.EC2_SSH_KEY }}
        script: |
          set -euo pipefail
          cd /home/ec2-user/grill-ekstraklasa
          git pull origin main

          # --- BACKEND ---
          cd backend
          source venv/bin/activate
          pip install -r requirements.txt
          python manage.py migrate
          python manage.py collectstatic --noinput
          sudo systemctl restart grill_ekstraklasa

          # --- FRONTEND ---
          cd ../frontend
          export NVM_DIR="/home/ec2-user/.nvm"
          if [ ! -s "$NVM_DIR/nvm.sh" ]; then
            echo "nvm.sh not found in $NVM_DIR" >&2
            exit 1
          fi
          . "$NVM_DIR/nvm.sh"
          nvm use 18
          npm install
          npm run build
          sudo systemctl restart grill-frontend
```

> [!NOTE]
> Workflow nie usuwa katalogu `.next` przed buildem, aby w razie błedu zachowac dzialajaca wersje frontendu.

### Proces Wdrożenia

1. **Trigger**: Push do brancha `main`
2. **GitHub Actions**: Uruchamia workflow
3. **SSH do EC2**: Łączy się z serwerem przez SSH
4. **Git Pull**: Pobiera najnowszy kod
5. **Backend**:
   - Aktywuje virtualenv
   - Instaluje zależności Python
   - Wykonuje migracje bazy danych
   - Zbiera pliki statyczne
   - Restartuje serwis Gunicorn
6. **Frontend**:
   - Instaluje zależności npm
   - Buduje nową wersję produkcyjną
   - Restartuje serwis Next.js

### Czas Wdrożenia

Typowy deploy trwa **2-3 minuty** i obejmuje:
- Git pull: ~5s
- Backend dependencies: ~30s
- Migrations: ~5s
- Collectstatic: ~10s
- Frontend build: ~60-90s
- Restart services: ~10s

---

## 🖥️ Konfiguracja Serwera EC2

### Specyfikacja Instancji

- **Typ**: t2.micro / t2.small
- **OS**: Amazon Linux 2023
- **IP**: `EC2_PUBLIC_IP` (sprawdz w AWS Console)
- **Domena**: grillekstraklasa.pl
- **Region**: us-east-1

### Zainstalowane Usługi

```bash
# Python 3.11
python3 --version

# Node.js 18+
node --version

# PostgreSQL 15
psql --version

# Nginx
nginx -v

# Git
git --version
```

---

## 📦 Konfiguracja Backend (Django + Gunicorn)

### Lokalizacja

```
/home/ec2-user/grill-ekstraklasa/backend/
```

### Virtual Environment

```bash
# Aktywacja venv
source /home/ec2-user/grill-ekstraklasa/backend/venv/bin/activate

# Instalacja zależności
pip install -r requirements.txt
```

### Zmienne Środowiskowe

Plik: `/home/ec2-user/grill-ekstraklasa/backend/.env`

```env
SECRET_KEY=<production-secret-key>
DEBUG=False

DB_NAME=grill_db
DB_USER=postgres
DB_PASSWORD=<secure-password>
DB_HOST=localhost
DB_PORT=5432

AWS_ACCESS_KEY_ID=<aws-key>
AWS_SECRET_ACCESS_KEY=<aws-secret>
```

### Gunicorn Configuration

Plik: `/home/ec2-user/grill-ekstraklasa/backend/gunicorn_config.py`

```python
bind = "127.0.0.1:8000"
workers = 3
worker_class = "sync"
timeout = 120
accesslog = "/var/log/gunicorn/access.log"
errorlog = "/var/log/gunicorn/error.log"
loglevel = "info"
```

### Systemd Service - Backend

Plik: `/etc/systemd/system/grill_ekstraklasa.service`

```ini
[Unit]
Description=Grill Ekstraklasa Django Backend
After=network.target

[Service]
Type=notify
User=ec2-user
Group=ec2-user
WorkingDirectory=/home/ec2-user/grill-ekstraklasa/backend
Environment="PATH=/home/ec2-user/grill-ekstraklasa/backend/venv/bin"
ExecStart=/home/ec2-user/grill-ekstraklasa/backend/venv/bin/gunicorn \
    --config gunicorn_config.py \
    grill_ekstraklasa.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true
Restart=always

[Install]
WantedBy=multi-user.target
```

### Komendy Zarządzania

```bash
# Start
sudo systemctl start grill_ekstraklasa

# Stop
sudo systemctl stop grill_ekstraklasa

# Restart
sudo systemctl restart grill_ekstraklasa

# Status
sudo systemctl status grill_ekstraklasa

# Logi
sudo journalctl -u grill_ekstraklasa -f

# Enable auto-start
sudo systemctl enable grill_ekstraklasa
```

---

## 🎨 Konfiguracja Frontend (Next.js)

### Lokalizacja

```
/home/ec2-user/grill-ekstraklasa/frontend/
```

### Zmienne Środowiskowe

Plik: `/home/ec2-user/grill-ekstraklasa/frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=https://grillekstraklasa.pl/api
NEXT_PUBLIC_SITE_URL=https://grillekstraklasa.pl
```

### Build Produkcyjny

```bash
cd /home/ec2-user/grill-ekstraklasa/frontend
npm install
npm run build
```

### Systemd Service - Frontend

Plik: `/etc/systemd/system/grill-frontend.service`

```ini
[Unit]
Description=Grill Ekstraklasa Next.js Frontend
After=network.target

[Service]
Type=simple
User=ec2-user
Group=ec2-user
WorkingDirectory=/home/ec2-user/grill-ekstraklasa/frontend
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Komendy Zarządzania

```bash
# Start
sudo systemctl start grill-frontend

# Stop
sudo systemctl stop grill-frontend

# Restart
sudo systemctl restart grill-frontend

# Status
sudo systemctl status grill-frontend

# Logi
sudo journalctl -u grill-frontend -f

# Enable auto-start
sudo systemctl enable grill-frontend
```

---

## 🌐 Konfiguracja Nginx

### Lokalizacja

```
/etc/nginx/conf.d/grill-ekstraklasa.conf
```

### Konfiguracja

```nginx
# Upstream dla Django (Gunicorn)
upstream django_backend {
    server 127.0.0.1:8000;
}

# Upstream dla Next.js
upstream nextjs_frontend {
    server 127.0.0.1:3000;
}

# Redirect HTTP -> HTTPS
server {
    listen 80;
    server_name grillekstraklasa.pl www.grillekstraklasa.pl;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name grillekstraklasa.pl www.grillekstraklasa.pl;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/grillekstraklasa.pl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/grillekstraklasa.pl/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logs
    access_log /var/log/nginx/grill_access.log;
    error_log /var/log/nginx/grill_error.log;

    # Backend API
    location /api/ {
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django Static Files
    location /static/ {
        alias /home/ec2-user/grill-ekstraklasa/backend/staticfiles/;
    }

    # Frontend (Next.js)
    location / {
        proxy_pass http://nextjs_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Next.js Static Files
    location /_next/static/ {
        proxy_pass http://nextjs_frontend;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

### Komendy Nginx

```bash
# Test konfiguracji
sudo nginx -t

# Restart
sudo systemctl restart nginx

# Reload (bez downtime)
sudo systemctl reload nginx

# Status
sudo systemctl status nginx

# Logi
sudo tail -f /var/log/nginx/grill_error.log
sudo tail -f /var/log/nginx/grill_access.log
```

---

## 🗄️ PostgreSQL na Produkcji

### Konfiguracja

```bash
# Zaloguj się do PostgreSQL
sudo -u postgres psql

# Utwórz bazę danych
CREATE DATABASE grill_db;

# Utwórz użytkownika
CREATE USER grill_user WITH PASSWORD 'secure_password';

# Nadaj uprawnienia
GRANT ALL PRIVILEGES ON DATABASE grill_db TO grill_user;
```

### Backup Bazy Danych

```bash
# Backup
pg_dump -U postgres grill_db > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres grill_db < backup_20250121.sql

# Automatyczny backup (cron)
# Dodaj do crontab: crontab -e
0 2 * * * pg_dump -U postgres grill_db > /home/ec2-user/backups/grill_db_$(date +\%Y\%m\%d).sql
```

---

## 🔐 SSL/TLS - Let's Encrypt

### Instalacja Certbot

```bash
sudo yum install certbot python3-certbot-nginx -y
```

### Uzyskanie Certyfikatu

```bash
sudo certbot --nginx -d grillekstraklasa.pl -d www.grillekstraklasa.pl
```

### Auto-renewal

Certbot automatycznie konfiguruje odnowienie certyfikatu:

```bash
# Test odnowienia
sudo certbot renew --dry-run

# Sprawdź timer
sudo systemctl status certbot-renew.timer
```

---

## 📊 Monitoring i Logi

### Logi Systemowe

```bash
# Backend (Gunicorn)
sudo journalctl -u grill_ekstraklasa -f

# Frontend (Next.js)
sudo journalctl -u grill-frontend -f

# Nginx
sudo tail -f /var/log/nginx/grill_error.log

# PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Sprawdzanie Statusu

```bash
# Wszystkie serwisy
sudo systemctl status grill_ekstraklasa
sudo systemctl status grill-frontend
sudo systemctl status nginx
sudo systemctl status postgresql
```

### Monitorowanie Zasobów

```bash
# CPU i RAM
htop

# Dysk
df -h

# Procesy
ps aux | grep gunicorn
ps aux | grep node
```

---

## 🔧 Troubleshooting Produkcyjne

### Backend nie odpowiada

```bash
# Sprawdź status
sudo systemctl status grill_ekstraklasa

# Sprawdź logi
sudo journalctl -u grill_ekstraklasa -n 100

# Restart
sudo systemctl restart grill_ekstraklasa
```

### Frontend nie działa

```bash
# Sprawdź status
sudo systemctl status grill-frontend

# Sprawdź logi
sudo journalctl -u grill-frontend -n 100

# Przebuduj i restart
cd /home/ec2-user/grill-ekstraklasa/frontend
npm run build
sudo systemctl restart grill-frontend
```

### Nginx 502 Bad Gateway

```bash
# Sprawdź czy backend działa
curl http://127.0.0.1:8000/api/

# Sprawdź czy frontend działa
curl http://127.0.0.1:3000/

# Sprawdź logi Nginx
sudo tail -f /var/log/nginx/grill_error.log
```

### Baza danych niedostępna

```bash
# Sprawdź status PostgreSQL
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Sprawdź połączenie
psql -U postgres -d grill_db -c "SELECT 1;"
```

---

## 🚦 GitHub Secrets

Wymagane secrets w repozytorium GitHub (Settings → Secrets and variables → Actions):

| Secret | Opis |
|--------|------|
| `EC2_SSH_KEY` | Prywatny klucz SSH do EC2 (plik .pem) |

### Dodanie SSH Key

1. Upewnij sie, ze masz lokalnie klucz do instancji (key pair: `edbnew`):
   - Plik: `~/.ssh/edbnew.pem`
   - Uprawnienia: `chmod 400 ~/.ssh/edbnew.pem`

2. Dodaj prywatny klucz do GitHub Secrets:
   - Skopiuj zawartosc `~/.ssh/edbnew.pem`
   - Wklej jako `EC2_SSH_KEY` w GitHub

3. Jesli potrzebujesz nowego klucza:
   - Wygeneruj go w AWS (EC2 → Key Pairs), pobierz `.pem`
   - Podmien lokalny plik i zaktualizuj `EC2_SSH_KEY`

---

## 📈 Skalowanie i Optymalizacja

### Zwiększenie Wydajności

1. **Więcej Gunicorn Workers**:
   ```python
   # gunicorn_config.py
   workers = (2 * cpu_count) + 1  # Zalecana formuła
   ```

2. **Redis Cache** (opcjonalnie):
   ```bash
   sudo yum install redis -y
   sudo systemctl start redis
   ```

3. **CDN dla Statycznych Plików**:
   - CloudFront dla AWS S3
   - Nginx caching

### Monitoring Produkcyjny

Rozważ dodanie:
- **Sentry** - error tracking
- **New Relic** / **DataDog** - performance monitoring
- **CloudWatch** - AWS monitoring

---

## 📚 Dalsze Kroki

- [Architektura Projektu](./architecture.md)
- [Przewodnik Dewelopera](./development.md)
- [Dokumentacja Backend](./backend.md)
- [Referencja API](./api-reference.md)

---

**Deployment gotowy! 🎉**
