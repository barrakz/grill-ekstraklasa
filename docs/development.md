# 💻 Przewodnik Dewelopera

Ten dokument zawiera wszystkie informacje potrzebne do uruchomienia projektu Grill Ekstraklasa w środowisku lokalnym.

## 📋 Wymagania Systemowe

### Wymagane
- **Docker** 20.10+ i **Docker Compose** 2.0+
- **Node.js** 18+ i **npm** 9+
- **Git**

### Opcjonalne (dla developmentu bez Dockera)
- **Python** 3.11+
- **PostgreSQL** 15+
- **pip** i **virtualenv**

---

## 🚀 Uruchomienie Projektu Lokalnie

### Metoda 1: Docker Compose (Zalecana)

Docker Compose automatycznie uruchamia backend Django wraz z bazą danych PostgreSQL.

#### 1. Sklonuj repozytorium

```bash
git clone https://github.com/yourusername/grill-ekstraklasa.git
cd grill-ekstraklasa
```

#### 2. Konfiguracja zmiennych środowiskowych - Backend

Utwórz plik `.env` w folderze `backend/`:

```bash
cd backend
cp .env.example .env  # jeśli istnieje, lub utwórz ręcznie
```

Przykładowa zawartość `backend/.env`:

```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True

# Database
DB_NAME=grill_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432

# AWS S3 (opcjonalne dla developmentu lokalnego)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
```

> **Uwaga**: W trybie deweloperskim możesz pominąć konfigurację AWS S3. Pliki będą zapisywane lokalnie.

#### 3. Uruchom backend z Docker Compose

```bash
# Z głównego katalogu projektu
docker-compose up --build
```

To polecenie:
- Zbuduje obraz Docker dla backendu
- Uruchomi kontener PostgreSQL
- Uruchomi kontener Django
- Automatycznie wykona migracje bazy danych

Backend będzie dostępny pod adresem: **http://localhost:8000**

#### 4. Konfiguracja zmiennych środowiskowych - Frontend

Utwórz plik `.env.local` w folderze `frontend/`:

```bash
cd frontend
cp .env.local.example .env.local  # jeśli istnieje, lub utwórz ręcznie
```

Przykładowa zawartość `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### 5. Uruchom frontend (w nowym terminalu)

```bash
cd frontend
npm install
npm run dev
```

Frontend będzie dostępny pod adresem: **http://localhost:3000**

---

### Metoda 2: Bez Dockera (Manualnie)

#### Backend

```bash
cd backend

# Utwórz wirtualne środowisko
python -m venv venv
source venv/bin/activate  # Na Windows: venv\Scripts\activate

# Zainstaluj zależności
pip install -r requirements.txt

# Skonfiguruj .env (zmień DB_HOST na localhost)
# DB_HOST=localhost

# Uruchom PostgreSQL lokalnie (musisz mieć zainstalowany)
# Utwórz bazę danych: createdb grill_db

# Wykonaj migracje
python manage.py migrate

# Utwórz superusera (opcjonalnie)
python manage.py createsuperuser

# Uruchom serwer deweloperski
python manage.py runserver
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🗄️ Zarządzanie Bazą Danych

### Dostęp do PostgreSQL w Dockerze

```bash
# Wejdź do kontenera PostgreSQL
docker exec -it grill-postgres psql -U postgres -d grill_db

# Lub użyj psql z hosta (jeśli masz zainstalowany)
psql -h localhost -p 5433 -U postgres -d grill_db
```

### Migracje Django

```bash
# Utwórz nowe migracje po zmianach w modelach
docker exec -it grill-backend python manage.py makemigrations

# Zastosuj migracje
docker exec -it grill-backend python manage.py migrate

# Zobacz status migracji
docker exec -it grill-backend python manage.py showmigrations
```

### Załaduj dane testowe (fixtures)

```bash
# Jeśli istnieją pliki fixtures
docker exec -it grill-backend python manage.py loaddata data/fixtures.json
```

---

## 🧪 Uruchamianie Testów

### Backend - Django Tests

```bash
# Wszystkie testy
docker exec -it grill-backend python manage.py test

# Testy z większą szczegółowością
docker exec -it grill-backend python manage.py test -v 2

# Testy konkretnej aplikacji
docker exec -it grill-backend python manage.py test players
docker exec -it grill-backend python manage.py test comments

# Bez Dockera (w venv)
python manage.py test -v 2
```

### Frontend - Jest/React Testing Library

```bash
cd frontend

# Uruchom testy (jeśli są skonfigurowane)
npm test

# Testy w trybie watch
npm test -- --watch
```

---

## 🛠️ Narzędzia Deweloperskie

### Backend - Code Quality

#### Black (formatowanie kodu)

```bash
# Formatuj wszystkie pliki
docker exec -it grill-backend black .

# Sprawdź bez zmian
docker exec -it grill-backend black --check .
```

#### isort (sortowanie importów)

```bash
# Sortuj importy
docker exec -it grill-backend isort .

# Sprawdź bez zmian
docker exec -it grill-backend isort --check-only .
```

### Frontend - ESLint

```bash
cd frontend

# Sprawdź kod
npm run lint

# Napraw automatycznie
npm run lint -- --fix
```

---

## 📊 Django Admin Panel

Django Admin jest dostępny pod adresem: **http://localhost:8000/admin/**

### Utwórz superusera

```bash
docker exec -it grill-backend python manage.py createsuperuser
```

Podaj:
- Username
- Email (opcjonalnie)
- Password

---

## 📖 Dokumentacja API

### Swagger UI

Interaktywna dokumentacja API dostępna pod adresem:

**http://localhost:8000/api/swagger/**

### ReDoc

Alternatywna dokumentacja API:

**http://localhost:8000/api/redoc/**

---

## 🔍 Przydatne Komendy Docker

```bash
# Zobacz logi backendu
docker logs grill-backend -f

# Zobacz logi PostgreSQL
docker logs grill-postgres -f

# Zatrzymaj wszystkie kontenery
docker-compose down

# Zatrzymaj i usuń volumes (UWAGA: usuwa dane z bazy!)
docker-compose down -v

# Przebuduj kontenery po zmianach
docker-compose up --build

# Wejdź do kontenera backendu (bash)
docker exec -it grill-backend bash

# Sprawdź status kontenerów
docker-compose ps
```

---

## 🐛 Rozwiązywanie Problemów

### Backend nie startuje

1. Sprawdź logi: `docker logs grill-backend`
2. Upewnij się, że PostgreSQL działa: `docker-compose ps`
3. Sprawdź zmienne środowiskowe w `backend/.env`
4. Sprawdź czy port 8000 nie jest zajęty: `lsof -i :8000`

### Frontend nie łączy się z API

1. Sprawdź `NEXT_PUBLIC_API_URL` w `frontend/.env.local`
2. Upewnij się, że backend działa: `curl http://localhost:8000/api/`
3. Sprawdź logi przeglądarki (Console)

### Błędy migracji bazy danych

```bash
# Cofnij migracje
docker exec -it grill-backend python manage.py migrate app_name zero

# Usuń bazę i utwórz od nowa (UWAGA: traci dane!)
docker-compose down -v
docker-compose up --build
```

### Port już zajęty

```bash
# Znajdź proces na porcie 8000
lsof -i :8000

# Zabij proces
kill -9 <PID>

# Lub zmień port w docker-compose.yml
```

---

## 📁 Struktura Projektu

```
grill-ekstraklasa/
├── backend/                 # Django REST API
│   ├── grill_ekstraklasa/  # Główna konfiguracja Django
│   ├── players/            # Aplikacja zawodników
│   ├── clubs/              # Aplikacja klubów
│   ├── comments/           # Aplikacja komentarzy
│   ├── ratings/            # Aplikacja ocen
│   ├── core/               # Aplikacja podstawowa (auth)
│   ├── chat/               # Aplikacja czatu (w rozwoju)
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/           # App Router (Next.js 15)
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── ...
│   ├── public/
│   ├── package.json
│   └── next.config.ts
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── deploy.yml     # CI/CD GitHub Actions
└── docs/                  # Dokumentacja
```

---

## 🔐 Zmienne Środowiskowe

### Backend (`backend/.env`)

| Zmienna | Opis | Przykład |
|---------|------|----------|
| `SECRET_KEY` | Klucz Django (generuj losowo) | `django-insecure-xyz...` |
| `DEBUG` | Tryb debugowania | `True` / `False` |
| `DB_NAME` | Nazwa bazy danych | `grill_db` |
| `DB_USER` | Użytkownik PostgreSQL | `postgres` |
| `DB_PASSWORD` | Hasło do bazy | `postgres` |
| `DB_HOST` | Host bazy danych | `db` (Docker) / `localhost` |
| `DB_PORT` | Port PostgreSQL | `5432` |
| `AWS_ACCESS_KEY_ID` | AWS Access Key (opcjonalne) | - |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key (opcjonalne) | - |

### Frontend (`frontend/.env.local`)

| Zmienna | Opis | Przykład |
|---------|------|----------|
| `NEXT_PUBLIC_API_URL` | URL backendu API | `http://localhost:8000/api` |
| `NEXT_PUBLIC_SITE_URL` | URL frontendu | `http://localhost:3000` |

---

## 📚 Dalsze Kroki

- [Architektura Projektu](./architecture.md) - Zrozum strukturę systemu
- [Dokumentacja Backend](./backend.md) - Szczegóły implementacji Django
- [Referencja API](./api-reference.md) - Wszystkie endpointy API
- [Deployment](./deployment.md) - Jak wdrożyć na produkcję

---

**Powodzenia w developmencie! 🚀**
