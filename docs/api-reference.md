# 🔌 Referencja API

Kompletna dokumentacja wszystkich endpointów API aplikacji Grill Ekstraklasa.

**Base URL**: `https://grillekstraklasa.pl/api` (produkcja) lub `http://localhost:8000/api` (dev)

---

## 📚 Spis Treści

- [Autentykacja](#autentykacja)
- [Players (Zawodnicy)](#players-zawodnicy)
- [Clubs (Kluby)](#clubs-kluby)
- [Ratings (Oceny)](#ratings-oceny)
- [Comments (Komentarze)](#comments-komentarze)
- [Kody Błędów](#kody-błędów)

---

## 🔐 Autentykacja

### Rejestracja

```http
POST /api/auth/register/
```

**Request Body**:
```json
{
  "username": "jan_kowalski",
  "password": "secure_password123",
  "email": "jan@example.com"
}
```

**Response** (201 Created):
```json
{
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "user": {
    "id": 1,
    "username": "jan_kowalski"
  }
}
```

**Błędy**:
- `400` - Walidacja nie powiodła się (username zajęty, słabe hasło)

---

### Logowanie

```http
POST /api/auth/login/
```

**Request Body**:
```json
{
  "username": "jan_kowalski",
  "password": "secure_password123"
}
```

**Response** (200 OK):
```json
{
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "user": {
    "id": 1,
    "username": "jan_kowalski"
  }
}
```

**Błędy**:
- `400` - Nieprawidłowe dane logowania

---

### Użycie Tokenu

Wszystkie chronione endpointy wymagają nagłówka:

```http
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

---

## ⚽ Players (Zawodnicy)

### Lista Zawodników

```http
GET /api/players/
```

**Query Parameters**:
- `club` (int) - Filtruj po ID klubu
- `position` (string) - Filtruj po pozycji (GK, DF, MF, FW)
- `name` (string) - Wyszukaj po nazwisku (case-insensitive)
- `page` (int) - Numer strony (domyślnie 1)
- `page_size` (int) - Rozmiar strony (domyślnie 20, max 100)

**Przykłady**:
```http
GET /api/players/?club=1
GET /api/players/?position=FW
GET /api/players/?name=Lewandowski
GET /api/players/?page=2&page_size=10
```

**Response** (200 OK):
```json
{
  "count": 250,
  "next": "http://localhost:8000/api/players/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Robert Lewandowski",
      "slug": "robert-lewandowski",
      "position": "FW",
      "club_name": "Legia Warszawa",
      "club_id": 1,
      "nationality": "Polska",
      "date_of_birth": "1988-08-21",
      "height": 185,
      "weight": 81,
      "photo_url": "https://ekstraklasa-backend.s3.amazonaws.com/media/players/photos/lewandowski.jpg",
      "average_rating": 8.5,
      "rating_avg": 8.5,
      "total_ratings": 120,
      "user_rating": null,
      "recent_comments": []
    }
  ]
}
```

**Auth**: Nie wymagana

---

### Szczegóły Zawodnika

```http
GET /api/players/{id}/
```

lub

```http
GET /api/players/{slug}/
```

**Przykłady**:
```http
GET /api/players/1/
GET /api/players/robert-lewandowski/
```

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "Robert Lewandowski",
  "slug": "robert-lewandowski",
  "position": "FW",
  "club_name": "Legia Warszawa",
  "club_id": 1,
  "nationality": "Polska",
  "date_of_birth": "1988-08-21",
  "height": 185,
  "weight": 81,
  "photo_url": "https://...",
  "average_rating": 8.5,
  "total_ratings": 120,
  "user_rating": {
    "id": 45,
    "value": 9,
    "created_at": "2025-01-20T10:30:00Z"
  },
  "recent_comments": [
    {
      "id": 10,
      "user": {
        "id": 2,
        "username": "kibic123"
      },
      "content": "Świetny napastnik!",
      "likes_count": 5,
      "user_has_liked": false,
      "created_at": "2025-01-20T12:00:00Z"
    }
  ]
}
```

**Auth**: Nie wymagana (ale `user_rating` dostępne tylko dla zalogowanych)

**Błędy**:
- `404` - Zawodnik nie znaleziony

---

### Oceń Zawodnika

```http
POST /api/players/{id}/rate/
```

**Request Body**:
```json
{
  "value": 8
}
```

**Response** (200 OK):
```json
{
  "id": 45,
  "player": 1,
  "user": 2,
  "value": 8,
  "created_at": "2025-01-20T10:30:00Z"
}
```

**Auth**: **Wymagana**

**Błędy**:
- `400` - Nieprawidłowa wartość (musi być 1-10)
- `401` - Brak autentykacji
- `429` - Przekroczono limit (10 ocen/godzinę)

**Throttling**: Maksymalnie 10 ocen na godzinę

---

### Dodaj Komentarz do Zawodnika

```http
POST /api/players/{id}/comment/
```

**Request Body**:
```json
{
  "content": "Świetny zawodnik, zasługuje na więcej!"
}
```

**Response** (200 OK):
```json
{
  "id": 10,
  "player_id": 1,
  "player_name": "Robert Lewandowski",
  "user": {
    "id": 2,
    "username": "kibic123"
  },
  "content": "Świetny zawodnik, zasługuje na więcej!",
  "likes_count": 0,
  "user_has_liked": false,
  "created_at": "2025-01-20T12:00:00Z",
  "updated_at": "2025-01-20T12:00:00Z"
}
```

**Auth**: **Wymagana**

**Błędy**:
- `400` - Pusta treść komentarza
- `401` - Brak autentykacji
- `429` - Przekroczono limit (5 komentarzy/godzinę)

**Throttling**: Maksymalnie 5 komentarzy na godzinę

---

### Komentarze Zawodnika

```http
GET /api/players/{id}/comments/
```

**Query Parameters**:
- `page` (int) - Numer strony
- `page_size` (int) - Rozmiar strony
- `sort_by` (string) - Sortowanie: `-created_at` (domyślnie), `created_at`, `-likes_count`, `likes_count`

**Przykłady**:
```http
GET /api/players/1/comments/
GET /api/players/1/comments/?sort_by=-likes_count
GET /api/players/1/comments/?page=2
```

**Response** (200 OK):
```json
{
  "count": 45,
  "next": "http://localhost:8000/api/players/1/comments/?page=2",
  "previous": null,
  "results": [
    {
      "id": 10,
      "player_id": 1,
      "player_name": "Robert Lewandowski",
      "user": {
        "id": 2,
        "username": "kibic123"
      },
      "content": "Świetny zawodnik!",
      "likes_count": 5,
      "user_has_liked": false,
      "created_at": "2025-01-20T12:00:00Z",
      "updated_at": "2025-01-20T12:00:00Z"
    }
  ]
}
```

**Auth**: Nie wymagana

---

### Top Zawodnicy

```http
GET /api/players/top_rated/
```

**Query Parameters**:
- `limit` (int) - Liczba zawodników (domyślnie 5)
- `min_ratings` (int) - Minimalna liczba ocen (domyślnie 3)

**Przykład**:
```http
GET /api/players/top_rated/?limit=10&min_ratings=5
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Robert Lewandowski",
    "average_rating": 9.2,
    "total_ratings": 150,
    "club_name": "Legia Warszawa",
    "position": "FW",
    "photo_url": "https://..."
  }
]
```

**Auth**: Nie wymagana

---

## 🏟️ Clubs (Kluby)

### Lista Klubów

```http
GET /api/clubs/
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Legia Warszawa",
    "city": "Warszawa",
    "founded_year": 1916,
    "logo_url": "https://ekstraklasa-backend.s3.amazonaws.com/media/clubs/logos/legia.png"
  }
]
```

**Auth**: Nie wymagana

---

### Szczegóły Klubu

```http
GET /api/clubs/{id}/
```

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "Legia Warszawa",
  "city": "Warszawa",
  "founded_year": 1916,
  "logo_url": "https://...",
  "players": [
    {
      "id": 1,
      "name": "Robert Lewandowski",
      "position": "FW",
      "average_rating": 8.5,
      "photo_url": "https://..."
    }
  ]
}
```

**Auth**: Nie wymagana

**Błędy**:
- `404` - Klub nie znaleziony

---

### Zawodnicy Klubu

```http
GET /api/clubs/{id}/players/
```

**Response** (200 OK):
```json
{
  "club": {
    "id": 1,
    "name": "Legia Warszawa"
  },
  "players": [
    {
      "id": 1,
      "name": "Robert Lewandowski",
      "position": "FW",
      "average_rating": 8.5
    }
  ]
}
```

**Auth**: Nie wymagana

---

## ⭐ Ratings (Oceny)

### Lista Ocen

```http
GET /api/ratings/
```

**Query Parameters**:
- `player` (int) - Filtruj po ID zawodnika
- `user_only` (bool) - Tylko oceny zalogowanego użytkownika

**Przykłady**:
```http
GET /api/ratings/?player=1
GET /api/ratings/?user_only=true
```

**Response** (200 OK):
```json
[
  {
    "id": 45,
    "player": 1,
    "user": 2,
    "value": 8,
    "created_at": "2025-01-20T10:30:00Z"
  }
]
```

**Auth**: **Wymagana**

---

### Dodaj Ocenę

```http
POST /api/ratings/
```

**Request Body**:
```json
{
  "player": 1,
  "value": 8
}
```

**Response** (201 Created):
```json
{
  "id": 45,
  "player": 1,
  "user": 2,
  "value": 8,
  "created_at": "2025-01-20T10:30:00Z"
}
```

**Auth**: **Wymagana**

**Błędy**:
- `400` - Nieprawidłowa wartość (1-10)
- `429` - Przekroczono limit (10 ocen/godzinę)

---

### Przelicz Średnie (Admin)

```http
POST /api/ratings/recalculate/
```

**Request Body** (opcjonalnie):
```json
{
  "player_id": 1
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "message": "Rating recalculation for player 1 completed."
}
```

**Auth**: **Admin**

---

## 💬 Comments (Komentarze)

### Lista Komentarzy

```http
GET /api/comments/
```

**Query Parameters**:
- `player_id` (int) - Filtruj po ID zawodnika
- `page` (int) - Numer strony
- `ordering` (string) - Sortowanie: `-created_at`, `created_at`, `-likes_count`

**Przykłady**:
```http
GET /api/comments/?player_id=1
GET /api/comments/?ordering=-likes_count
```

**Response** (200 OK):
```json
{
  "count": 100,
  "next": "...",
  "previous": null,
  "results": [
    {
      "id": 10,
      "player_id": 1,
      "player_name": "Robert Lewandowski",
      "user": {
        "id": 2,
        "username": "kibic123"
      },
      "content": "Świetny zawodnik!",
      "likes_count": 5,
      "user_has_liked": false,
      "created_at": "2025-01-20T12:00:00Z"
    }
  ]
}
```

**Auth**: Nie wymagana

---

### Dodaj Komentarz

```http
POST /api/comments/
```

**Request Body**:
```json
{
  "player_id": 1,
  "content": "Świetny zawodnik!"
}
```

**Response** (201 Created):
```json
{
  "id": 10,
  "player_id": 1,
  "player_name": "Robert Lewandowski",
  "user": {
    "id": 2,
    "username": "kibic123"
  },
  "content": "Świetny zawodnik!",
  "likes_count": 0,
  "user_has_liked": false,
  "created_at": "2025-01-20T12:00:00Z"
}
```

**Auth**: **Wymagana**

**Błędy**:
- `429` - Przekroczono limit (5 komentarzy/godzinę)

---

### Polub/Odlub Komentarz

```http
POST /api/comments/{id}/like/
```

**Response** (200 OK):
```json
{
  "status": "Comment liked",
  "likes_count": 6
}
```

lub

```json
{
  "status": "Comment unliked",
  "likes_count": 5
}
```

**Auth**: **Wymagana**

**Błędy**:
- `404` - Komentarz nie znaleziony

---

### Najnowsze Komentarze

```http
GET /api/comments/latest/
```

**Query Parameters**:
- `limit` (int) - Liczba komentarzy (domyślnie 5)

**Przykład**:
```http
GET /api/comments/latest/?limit=10
```

**Response** (200 OK):
```json
[
  {
    "id": 10,
    "player_id": 1,
    "player_name": "Robert Lewandowski",
    "user": {
      "id": 2,
      "username": "kibic123"
    },
    "content": "Świetny zawodnik!",
    "likes_count": 5,
    "created_at": "2025-01-20T12:00:00Z"
  }
]
```

**Auth**: Nie wymagana

---

## ❌ Kody Błędów

| Kod | Znaczenie | Przykład |
|-----|-----------|----------|
| `200` | OK | Sukces |
| `201` | Created | Zasób utworzony |
| `400` | Bad Request | Nieprawidłowe dane wejściowe |
| `401` | Unauthorized | Brak tokenu autentykacji |
| `403` | Forbidden | Brak uprawnień |
| `404` | Not Found | Zasób nie znaleziony |
| `429` | Too Many Requests | Przekroczono limit (throttling) |
| `500` | Internal Server Error | Błąd serwera |

---

## 📊 Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `POST /api/players/{id}/rate/` | 10 ocen / godzinę |
| `POST /api/players/{id}/comment/` | 5 komentarzy / godzinę |
| `POST /api/comments/` | 5 komentarzy / godzinę |

**Response przy przekroczeniu**:
```json
{
  "detail": "Przekroczono limit 10 ocen na godzinę"
}
```

**Header**:
```http
X-Error-Type: throttled
```

---

## 🔗 Swagger Documentation

Interaktywna dokumentacja API:

- **Swagger UI**: https://grillekstraklasa.pl/api/swagger/
- **ReDoc**: https://grillekstraklasa.pl/api/redoc/
- **JSON Schema**: https://grillekstraklasa.pl/api/swagger.json

---

## 📚 Powiązane Dokumenty

- [Architektura Projektu](./architecture.md)
- [Backend](./backend.md)
- [Frontend](./front/README.md)
- [Przewodnik Dewelopera](./development.md)

---

**API gotowe do użycia! 🔌**
