# ⚙️ Backend - Django REST Framework

Dokumentacja backendu aplikacji Grill Ekstraklasa zbudowanego w Django 4.2 z Django REST Framework.

## 📁 Struktura Aplikacji Django

Backend składa się z 6 aplikacji Django:

```
backend/
├── grill_ekstraklasa/    # Główna konfiguracja projektu
│   ├── settings.py       # Ustawienia Django
│   ├── urls.py           # Główny routing
│   └── wsgi.py           # WSGI entry point
├── core/                 # Aplikacja podstawowa
│   ├── views.py          # Autentykacja (login, register)
│   ├── urls.py
│   └── pagination.py     # Wspólna paginacja
├── players/              # Zarządzanie zawodnikami
│   ├── models.py         # Model Player
│   ├── views.py          # PlayerViewSet
│   ├── serializers.py
│   └── urls.py
├── clubs/                # Zarządzanie klubami
│   ├── models.py         # Model Club
│   ├── views.py          # ClubViewSet
│   ├── serializers.py
│   └── urls.py
├── ratings/              # System ocen
│   ├── models.py         # Model Rating
│   ├── views.py          # RatingViewSet
│   ├── serializers.py
│   ├── utils.py          # Throttling, recalculation
│   └── urls.py
├── comments/             # Komentarze
│   ├── models.py         # Model Comment
│   ├── views.py          # CommentViewSet
│   ├── serializers.py
│   └── urls.py
└── chat/                 # (w rozwoju)
```

---

## 🗄️ Modele Danych

### 1. Club (clubs/models.py)

Reprezentuje kluby Ekstraklasy.

```python
class Club(models.Model):
    name = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    founded_year = models.IntegerField(null=True, blank=True)
    logo = models.ImageField(upload_to='clubs/logos/', null=True, blank=True)
```

**Pola**:
- `name` - nazwa klubu (np. "Legia Warszawa")
- `city` - miasto (np. "Warszawa")
- `founded_year` - rok założenia
- `logo` - logo klubu (AWS S3)

**Relacje**:
- `players` (reverse FK) - zawodnicy klubu

---

### 2. Player (players/models.py)

Reprezentuje zawodników.

```python
class Player(models.Model):
    POSITION_CHOICES = [
        ('GK', 'Goalkeeper'),
        ('DF', 'Defender'),
        ('MF', 'Midfielder'),
        ('FW', 'Forward'),
    ]
    
    name = models.CharField(max_length=100, db_index=True)
    slug = models.SlugField(max_length=150, unique=True)
    position = models.CharField(max_length=2, choices=POSITION_CHOICES, db_index=True)
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='players', db_index=True)
    nationality = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)  # cm
    weight = models.IntegerField(null=True, blank=True)  # kg
    photo = models.ImageField(upload_to='players/photos/', null=True, blank=True)
    average_rating = models.FloatField(default=0)
    total_ratings = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Pola**:
- `name` - imię i nazwisko
- `slug` - SEO-friendly URL (auto-generowany)
- `position` - pozycja (GK/DF/MF/FW)
- `club` - FK do klubu
- `average_rating` - średnia ocen (denormalizowane)
- `total_ratings` - liczba ocen (denormalizowane)

**Metody**:
- `_generate_unique_slug()` - generuje unikalny slug
- `rating_avg` (property) - alias dla `average_rating`
- `total_ratings_count` (property) - alias dla `total_ratings`

**Indeksy**:
- `name` (db_index)
- `position` (db_index)
- `club` (db_index)
- Composite: `(club, position)`

---

### 3. Rating (ratings/models.py)

Reprezentuje oceny zawodników (1-10).

```python
class Rating(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='ratings', db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player_ratings')
    value = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    created_at = models.DateTimeField(auto_now_add=True)
```

**Pola**:
- `player` - FK do zawodnika
- `user` - FK do użytkownika
- `value` - ocena (1-10)
- `created_at` - data wystawienia

**Indeksy**:
- `player` (db_index)
- Composite: `(player, -created_at)`
- Composite: `(user, player)`

**Sygnały**:
- `post_save` → aktualizuje średnią ocen zawodnika
- `post_delete` → aktualizuje średnią ocen zawodnika

---

### 4. Comment (comments/models.py)

Reprezentuje komentarze użytkowników.

```python
class Comment(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player_comments')
    content = models.TextField()
    likes = models.ManyToManyField(User, related_name='liked_comments', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Pola**:
- `player` - FK do zawodnika
- `user` - FK do użytkownika (autor)
- `content` - treść komentarza
- `likes` - M2M do użytkowników (polubienia)
- `created_at` / `updated_at` - timestamps

**Metody**:
- `likes_count` (property) - liczba polubień

---

## 🔌 API Endpoints

### Core (Autentykacja)

| Endpoint | Metoda | Opis | Auth |
|----------|--------|------|------|
| `/api/` | GET | Home endpoint | Nie |
| `/api/auth/login/` | POST | Logowanie | Nie |
| `/api/auth/register/` | POST | Rejestracja | Nie |

### Players

| Endpoint | Metoda | Opis | Auth |
|----------|--------|------|------|
| `/api/players/` | GET | Lista zawodników | Nie |
| `/api/players/{id}/` | GET | Szczegóły zawodnika | Nie |
| `/api/players/{id}/rate/` | POST | Oceń zawodnika | Tak |
| `/api/players/{id}/comment/` | POST | Dodaj komentarz | Tak |
| `/api/players/{id}/comments/` | GET | Komentarze zawodnika | Nie |
| `/api/players/top_rated/` | GET | Top zawodnicy | Nie |

### Clubs

| Endpoint | Metoda | Opis | Auth |
|----------|--------|------|------|
| `/api/clubs/` | GET | Lista klubów | Nie |
| `/api/clubs/{id}/` | GET | Szczegóły klubu | Nie |
| `/api/clubs/{id}/players/` | GET | Zawodnicy klubu | Nie |

### Ratings

| Endpoint | Metoda | Opis | Auth |
|----------|--------|------|------|
| `/api/ratings/` | GET | Lista ocen | Tak |
| `/api/ratings/` | POST | Dodaj ocenę | Tak |
| `/api/ratings/recalculate/` | POST | Przelicz średnie (admin) | Admin |

### Comments

| Endpoint | Metoda | Opis | Auth |
|----------|--------|------|------|
| `/api/comments/` | GET | Lista komentarzy | Nie |
| `/api/comments/` | POST | Dodaj komentarz | Tak |
| `/api/comments/{id}/` | GET | Szczegóły komentarza | Nie |
| `/api/comments/{id}/like/` | POST | Polub/odlub komentarz | Tak |
| `/api/comments/latest/` | GET | Najnowsze komentarze | Nie |

---

## 🔐 Autentykacja

### Token-Based Auth

Backend używa **Django REST Framework Token Authentication**.

#### Rejestracja

```python
# POST /api/auth/register/
{
  "username": "jan_kowalski",
  "password": "secure_password",
  "email": "jan@example.com"
}

# Response
{
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "user": {
    "id": 1,
    "username": "jan_kowalski"
  }
}
```

#### Logowanie

```python
# POST /api/auth/login/
{
  "username": "jan_kowalski",
  "password": "secure_password"
}

# Response
{
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "user": {
    "id": 1,
    "username": "jan_kowalski"
  }
}
```

#### Użycie Tokenu

```bash
curl -H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b" \
     http://localhost:8000/api/players/1/rate/ \
     -X POST \
     -d '{"value": 8}'
```

---

## 🚦 Throttling (Rate Limiting)

### Oceny

**Plik**: `ratings/utils.py`

```python
def check_rating_throttle(user):
    one_hour_ago = timezone.now() - timedelta(hours=1)
    recent_ratings = Rating.objects.filter(
        user=user, 
        created_at__gte=one_hour_ago
    ).count()
    
    if recent_ratings >= 10:
        return False, "Przekroczono limit 10 ocen na godzinę"
    return True, None
```

**Limit**: 10 ocen na godzinę

### Komentarze

```python
def check_comment_throttle(user):
    one_hour_ago = timezone.now() - timedelta(hours=1)
    recent_comments = Comment.objects.filter(
        user=user, 
        created_at__gte=one_hour_ago
    ).count()
    
    if recent_comments >= 5:
        return False, "Przekroczono limit 5 komentarzy na godzinę"
    return True, None
```

**Limit**: 5 komentarzy na godzinę

---

## 🔄 Sygnały Django

### Automatyczna Aktualizacja Średniej Ocen

**Plik**: `ratings/models.py`

```python
@receiver(post_save, sender=Rating)
def update_player_rating_on_save(sender, instance, **kwargs):
    update_player_rating(instance.player)

@receiver(post_delete, sender=Rating)
def update_player_rating_on_delete(sender, instance, **kwargs):
    update_player_rating(instance.player)

def update_player_rating(player):
    ratings = player.ratings.all()
    count = ratings.count()
    
    if count > 0:
        avg = sum(r.value for r in ratings) / count
        avg = round(avg, 2)
    else:
        avg = 0
    
    player.average_rating = avg
    player.total_ratings = count
    player.save(update_fields=['average_rating', 'total_ratings'])
```

**Działanie**:
1. Po dodaniu/usunięciu oceny
2. Przelicza średnią ze wszystkich ocen
3. Aktualizuje pola `average_rating` i `total_ratings`

### Usuwanie Plików z S3

```python
@receiver(pre_delete, sender=Player)
def delete_player_photo(sender, instance, **kwargs):
    if instance.photo:
        instance.photo.delete(save=False)

@receiver(pre_delete, sender=Club)
def delete_club_logo(sender, instance, **kwargs):
    if instance.logo:
        instance.logo.delete(save=False)
```

**Działanie**:
- Przed usunięciem zawodnika/klubu
- Usuwa plik z AWS S3
- Zapobiega "orphaned files"

---

## 📄 Paginacja

**Plik**: `core/pagination.py`

```python
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
```

**Użycie**:
```
GET /api/players/?page=2&page_size=10
```

**Response**:
```json
{
  "count": 250,
  "next": "http://localhost:8000/api/players/?page=3",
  "previous": "http://localhost:8000/api/players/?page=1",
  "results": [...]
}
```

---

## 🔍 Filtrowanie

### PlayerFilter

**Plik**: `players/views.py`

```python
class PlayerFilter(filters.FilterSet):
    club = filters.NumberFilter(field_name='club__id')
    position = filters.CharFilter(lookup_expr='iexact')
    name = filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = Player
        fields = ['club', 'position', 'name']
```

**Przykłady**:
```bash
# Zawodnicy klubu o ID 1
GET /api/players/?club=1

# Bramkarze
GET /api/players/?position=GK

# Wyszukiwanie po nazwisku
GET /api/players/?name=Lewandowski
```

---

## 📦 AWS S3 Integration

### Konfiguracja

**Plik**: `settings.py`

```python
AWS_STORAGE_BUCKET_NAME = 'ekstraklasa-backend'
AWS_S3_REGION_NAME = 'us-east-1'
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'

AWS_ACCESS_KEY_ID = config('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY')

# Media files
MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'

# Static files (production)
if not DEBUG:
    STATICFILES_STORAGE = 'storages.backends.s3boto3.S3StaticStorage'
    STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/static/'
```

### Struktura Bucket

```
ekstraklasa-backend/
├── media/
│   ├── players/
│   │   └── photos/
│   │       ├── player1.jpg
│   │       └── player2.jpg
│   └── clubs/
│       └── logos/
│           ├── legia.png
│           └── lech.png
└── static/
    ├── admin/
    └── rest_framework/
```

---

## 🛡️ Permissions

### Poziomy Dostępu

1. **AllowAny** - publiczne
   - Lista zawodników
   - Lista klubów
   - Szczegóły zawodnika/klubu

2. **IsAuthenticatedOrReadOnly**
   - Odczyt: wszyscy
   - Zapis: tylko zalogowani

3. **IsAuthenticated**
   - Tylko zalogowani użytkownicy
   - Dodawanie ocen/komentarzy

4. **IsAdminUser**
   - Tylko administratorzy
   - Django Admin
   - Endpoint `/api/ratings/recalculate/`

---

## 📊 Optymalizacje

### 1. Select Related

```python
def get_queryset(self):
    return super().get_queryset().select_related('club')
```

Redukuje N+1 queries przy pobieraniu zawodników z klubami.

### 2. Indeksy Bazy Danych

```python
class Meta:
    indexes = [
        models.Index(fields=['club', 'position']),
        models.Index(fields=['player', '-created_at']),
    ]
```

### 3. Denormalizacja

Pola `average_rating` i `total_ratings` przechowywane w `Player` zamiast obliczania przy każdym zapytaniu.

---

## 🧪 Testy

**Lokalizacja**: `*/tests.py` w każdej aplikacji

### Uruchomienie

```bash
# Wszystkie testy
python manage.py test

# Konkretna aplikacja
python manage.py test players

# Z większą szczegółowością
python manage.py test -v 2
```

### Przykładowe Testy

```python
# players/tests.py
class PlayerModelTest(TestCase):
    def test_slug_generation(self):
        club = Club.objects.create(name="Test Club")
        player = Player.objects.create(
            name="Jan Kowalski",
            club=club,
            position="FW"
        )
        self.assertEqual(player.slug, "jan-kowalski")
```

---

## 📚 Swagger Documentation

Dokumentacja API dostępna pod:

- **Swagger UI**: http://localhost:8000/api/swagger/
- **ReDoc**: http://localhost:8000/api/redoc/
- **JSON Schema**: http://localhost:8000/api/swagger.json

---

## 🔗 Powiązane Dokumenty

- [Architektura Projektu](./architecture.md)
- [Referencja API](./api-reference.md)
- [Przewodnik Dewelopera](./development.md)
- [Frontend](./frontend.md)

---

**Backend gotowy do działania! ⚙️**
