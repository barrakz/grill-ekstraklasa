# 🏗️ Architektura Projektu Grill Ekstraklasa

Ten dokument opisuje architekturę techniczną aplikacji Grill Ekstraklasa - platformy do oceniania i komentowania piłkarzy Ekstraklasy.

## 📊 Przegląd Architektury

Grill Ekstraklasa to aplikacja typu **full-stack** oparta na architekturze **client-server** z wyraźnym podziałem na frontend i backend.

### Diagram Wysokopoziomowy

```
┌──────────────────────────────────────────────────────────────┐
│                         UŻYTKOWNIK                           │
│                    (Przeglądarka Web)                        │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND - Next.js 15                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  • Server-Side Rendering (SSR)                         │  │
│  │  • React 19 Components                                 │  │
│  │  • TypeScript                                          │  │
│  │  • Tailwind CSS 4                                      │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ HTTP/REST API
                         │ (JSON)
                         ▼
┌──────────────────────────────────────────────────────────────┐
│              BACKEND - Django REST Framework                 │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Django Apps:                                          │  │
│  │  • core       - Autentykacja, podstawowe endpointy    │  │
│  │  • players    - Zarządzanie zawodnikami               │  │
│  │  • clubs      - Zarządzanie klubami                   │  │
│  │  • ratings    - System ocen (1-10)                    │  │
│  │  • comments   - Komentarze i polubienia               │  │
│  │  • chat       - (w rozwoju)                           │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                   BAZA DANYCH - PostgreSQL 15                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Tabele:                                               │  │
│  │  • auth_user, auth_token                              │  │
│  │  • clubs_club                                         │  │
│  │  • players_player                                     │  │
│  │  • ratings_rating                                     │  │
│  │  • comments_comment                                   │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                  STORAGE - AWS S3 Bucket                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  • Zdjęcia zawodników (players/photos/)               │  │
│  │  • Loga klubów (clubs/logos/)                         │  │
│  │  • Pliki statyczne (static/)                          │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Przepływ Danych

### 1. Przeglądanie Zawodników

```
Użytkownik → Next.js (SSR) → Django API (/api/players/) 
                                    ↓
                            PostgreSQL (SELECT)
                                    ↓
                            JSON Response
                                    ↓
                            Next.js (Render)
                                    ↓
                            Użytkownik (Widok)
```

### 2. Dodawanie Oceny

```
Użytkownik (zalogowany) → Next.js → POST /api/players/{id}/rate/
                                            ↓
                                    Django (sprawdź token)
                                            ↓
                                    Walidacja (throttling)
                                            ↓
                                    Zapis do DB (Rating)
                                            ↓
                                    Sygnał: aktualizacja średniej
                                            ↓
                                    Update Player.average_rating
                                            ↓
                                    JSON Response
                                            ↓
                                    Next.js (Aktualizacja UI)
```

### 3. Dodawanie Komentarza

```
Użytkownik (zalogowany) → Next.js → POST /api/players/{id}/comment/
                                            ↓
                                    Django (sprawdź token)
                                            ↓
                                    Walidacja (throttling)
                                            ↓
                                    Zapis do DB (Comment)
                                            ↓
                                    JSON Response
                                            ↓
                                    Next.js (Aktualizacja UI)
```

---

## 🗄️ Struktura Bazy Danych

### Diagram ERD (Entity Relationship Diagram)

```
┌─────────────────┐
│   auth_user     │
├─────────────────┤
│ id (PK)         │
│ username        │
│ email           │
│ password        │
└────────┬────────┘
         │
         │ 1:1
         │
┌────────▼────────┐
│  authtoken_token│
├─────────────────┤
│ key (PK)        │
│ user_id (FK)    │
│ created         │
└─────────────────┘

┌─────────────────┐
│   clubs_club    │
├─────────────────┤
│ id (PK)         │
│ name            │
│ city            │
│ founded_year    │
│ logo (ImageField)│
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────────┐
│  players_player     │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ slug (unique)       │
│ position            │
│ club_id (FK)        │
│ nationality         │
│ date_of_birth       │
│ height              │
│ weight              │
│ photo (ImageField)  │
│ average_rating      │◄─────┐
│ total_ratings       │      │
└────────┬────────────┘      │
         │                   │
         │ 1:N               │ Aktualizacja
         │                   │ przez sygnał
┌────────▼────────────┐      │
│  ratings_rating     │      │
├─────────────────────┤      │
│ id (PK)             │      │
│ player_id (FK)      │──────┘
│ user_id (FK)        │
│ value (1-10)        │
│ created_at          │
└─────────────────────┘

┌─────────────────────┐
│  comments_comment   │
├─────────────────────┤
│ id (PK)             │
│ player_id (FK)      │
│ user_id (FK)        │
│ content (TextField) │
│ created_at          │
│ updated_at          │
└────────┬────────────┘
         │
         │ M:N
         │
┌────────▼──────────────────┐
│ comments_comment_likes    │
├───────────────────────────┤
│ id (PK)                   │
│ comment_id (FK)           │
│ user_id (FK)              │
└───────────────────────────┘
```

### Kluczowe Relacje

1. **Club → Player** (1:N)
   - Jeden klub ma wielu zawodników
   - `Player.club` → `Club.id`

2. **Player → Rating** (1:N)
   - Jeden zawodnik ma wiele ocen
   - `Rating.player` → `Player.id`

3. **User → Rating** (1:N)
   - Jeden użytkownik może wystawić wiele ocen
   - `Rating.user` → `User.id`

4. **Player → Comment** (1:N)
   - Jeden zawodnik ma wiele komentarzy
   - `Comment.player` → `Player.id`

5. **Comment → User (likes)** (M:N)
   - Komentarz może być polubiony przez wielu użytkowników
   - Użytkownik może polubić wiele komentarzy
   - `Comment.likes` ↔ `User`

---

## 🔐 System Autentykacji

### Token-Based Authentication (DRF Token Auth)

```
1. Rejestracja:
   POST /api/auth/register/
   Body: { username, password, email }
   Response: { token, user: { id, username } }

2. Logowanie:
   POST /api/auth/login/
   Body: { username, password }
   Response: { token, user: { id, username } }

3. Użycie tokenu:
   GET /api/players/
   Headers: { Authorization: "Token abc123..." }
```

### Poziomy Uprawnień

- **Publiczne** (bez autentykacji):
  - Przeglądanie zawodników
  - Przeglądanie klubów
  - Przeglądanie komentarzy
  - Przeglądanie ocen

- **Zalogowani użytkownicy**:
  - Dodawanie ocen
  - Dodawanie komentarzy
  - Polubienia komentarzy

- **Admin** (Django Admin):
  - Zarządzanie wszystkimi danymi
  - Dodawanie/edycja zawodników i klubów

---

## 📦 Technologie i Biblioteki

### Backend

| Technologia | Wersja | Zastosowanie |
|-------------|--------|--------------|
| Python | 3.11 | Język programowania |
| Django | 4.2 | Web framework |
| Django REST Framework | 3.x | REST API |
| PostgreSQL | 15 | Baza danych |
| Gunicorn | 20.x | WSGI server (produkcja) |
| boto3 | 1.x | AWS S3 integration |
| django-storages | 1.x | File storage backend |
| django-cors-headers | 4.x | CORS handling |
| drf-yasg | 1.x | API documentation |
| django-filter | 23.x | Filtering |

### Frontend

| Technologia | Wersja | Zastosowanie |
|-------------|--------|--------------|
| Node.js | 18+ | Runtime |
| Next.js | 15 | React framework |
| React | 19 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4 | Styling |
| ESLint | 9 | Code linting |

### DevOps

| Technologia | Zastosowanie |
|-------------|--------------|
| Docker | Konteneryzacja (dev) |
| Docker Compose | Orkiestracja (dev) |
| Nginx | Reverse proxy (prod) |
| systemd | Process management (prod) |
| GitHub Actions | CI/CD |
| AWS EC2 | Hosting |
| AWS S3 | Media storage |

---

## 🔄 Sygnały Django (Signals)

### 1. Automatyczna Aktualizacja Średniej Ocen

**Plik**: `backend/ratings/models.py`

```python
@receiver(post_save, sender=Rating)
def update_player_rating_on_save(sender, instance, **kwargs):
    update_player_rating(instance.player)

@receiver(post_delete, sender=Rating)
def update_player_rating_on_delete(sender, instance, **kwargs):
    update_player_rating(instance.player)
```

**Działanie**:
- Po dodaniu/edycji/usunięciu oceny
- Automatycznie przelicza średnią ocen zawodnika
- Aktualizuje pola `average_rating` i `total_ratings` w modelu `Player`

### 2. Usuwanie Plików z S3

**Plik**: `backend/players/models.py`, `backend/clubs/models.py`

```python
@receiver(pre_delete, sender=Player)
def delete_player_photo(sender, instance, **kwargs):
    if instance.photo:
        instance.photo.delete(save=False)
```

**Działanie**:
- Przed usunięciem zawodnika/klubu
- Usuwa powiązane zdjęcie z AWS S3
- Zapobiega "orphaned files" w bucket

---

## 🚀 Optymalizacje Wydajności

### 1. Indeksy Bazy Danych

```python
# players/models.py
class Player(models.Model):
    name = models.CharField(max_length=100, db_index=True)
    position = models.CharField(max_length=2, db_index=True)
    club = models.ForeignKey(Club, db_index=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['club', 'position']),
        ]
```

### 2. Select Related / Prefetch Related

```python
# players/views.py
def get_queryset(self):
    return super().get_queryset().select_related('club')
```

Redukuje liczbę zapytań SQL z N+1 do 1.

### 3. Denormalizacja Danych

Pola `average_rating` i `total_ratings` w modelu `Player` są denormalizowane dla wydajności:
- Zamiast obliczać średnią przy każdym zapytaniu
- Przechowujemy wartość w bazie
- Aktualizujemy przez sygnały

### 4. Paginacja

```python
# core/pagination.py
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
```

Ogranicza ilość danych zwracanych w jednym request.

---

## 🔒 Bezpieczeństwo

### 1. CORS Configuration

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "https://grillekstraklasa.pl",
    "http://localhost:3000",
]
```

### 2. CSRF Protection

Django automatycznie chroni przed CSRF dla POST/PUT/DELETE.

### 3. SQL Injection Protection

Django ORM automatycznie escapuje parametry SQL.

### 4. Rate Limiting (Throttling)

```python
# ratings/utils.py
def check_rating_throttle(user):
    # Maksymalnie 10 ocen na godzinę
    one_hour_ago = timezone.now() - timedelta(hours=1)
    recent_ratings = Rating.objects.filter(
        user=user, 
        created_at__gte=one_hour_ago
    ).count()
    
    if recent_ratings >= 10:
        return False, "Przekroczono limit ocen"
    return True, None
```

### 5. Environment Variables

Wrażliwe dane (SECRET_KEY, AWS credentials) przechowywane w `.env`.

---

## 📈 Skalowalność

### Aktualna Architektura
- **Monolityczna** - wszystko na jednym serwerze EC2
- Odpowiednia dla małego/średniego ruchu

### Potencjalne Ulepszenia

1. **Separacja Bazy Danych**
   - AWS RDS dla PostgreSQL
   - Automatyczne backupy i scaling

2. **CDN dla Statycznych Plików**
   - CloudFront przed S3
   - Szybsze ładowanie zdjęć

3. **Load Balancer**
   - Wiele instancji EC2
   - AWS ELB

4. **Cache Layer**
   - Redis dla sesji i cache
   - Memcached dla query cache

5. **Asynchronous Tasks**
   - Celery + Redis
   - Background jobs (email, notifications)

---

## 📚 Dalsze Dokumenty

- [Backend - Szczegóły Django](./backend.md)
- [Frontend - Szczegóły Next.js](./front/README.md)
- [Referencja API](./api-reference.md)
- [Przewodnik Dewelopera](./development.md)
- [Deployment i CI/CD](./deployment.md)

---

**Architektura zaprojektowana z myślą o prostocie, wydajności i łatwości utrzymania! 🏗️**
